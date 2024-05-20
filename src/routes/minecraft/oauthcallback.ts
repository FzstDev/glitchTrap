import MinecraftPlayer from "@src/database/models/minecraft/MinecraftPlayer";
import { createBaseMinecraftUser } from "@src/utils/MinecraftFunctions";
import axios from "axios";
import { randomUUID } from "crypto";
import { HTTPRouteHandler } from "@src/engine/types/Executors";
import { getModule } from "@src/engine/modules";
import ExtendedClient from "@src/modules/discord/extendedclient";
import { error } from "@src/engine/utils/Logger";
import { getConfigValue } from "@src/engine/utils/Configuration";
import { getDatabase } from "@src/engine/utils/Composable";

export default {
	async get(req, res) {
		const { query } = req;
		if (!query || !query.code) {
			res.status(400).send("No code provided");
			return;
		}
		const { code } = query;

		const discord = getModule<ExtendedClient>("discord");
		if (!discord) {
			res.status(500).send("Discord module missing");
			return;
		}
		const API_BASE_URL = discord.options.rest?.api;
		const VERSION = discord.options.rest?.version;
		const API_URL = `${API_BASE_URL}/v${VERSION}`;

		if (!API_BASE_URL || !VERSION) {
			res.status(500).send("No API URL or version provided");
			return;
		}


		const client_secret = getConfigValue("oauth")?.client_secret;
		if (!client_secret) {
			res.status(500).send("No client secret provided");
			return;
		}

		const CLIENT_ID = discord.application?.id;
		const CLIENT_SECRET = client_secret;
		const BASE_URL = `https://${req.hostname}`;
		const REDIRECT_URI = BASE_URL + "/minecraft/oauthcallback";

		const rdata = `client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=authorization_code&code=${code}&redirect_uri=${REDIRECT_URI}`;

		const headers = {
			"Content-Type": "application/x-www-form-urlencoded",
			"Accept-Encoding": "*",
		};
		const response = await axios.post(`${API_URL}/oauth2/token`, encodeURI(rdata), {
			headers: headers
		}).catch((err: { code: any; message: any; }) => {
			error(`Error getting token, Errored soliciting token, code: ${err.code}, message: ${err.message}`);
			//req.parentApp.logger.error(err);
			return null;
		});

		if (!response || !response.data) {
			res.status(500).send("Error getting token, No response data provided");
			return;
		}
		const { data } = response;
		if (!data.access_token || !data.refresh_token) {
			res.status(500).send("No access token or refresh token provided");
			return;
		}


		const { access_token, refresh_token, expires_in } = data;

		const response2 = await axios.get(`${API_URL}/oauth2/@me`, {
			headers: {
				Authorization: `Bearer ${access_token}`,
				"Accept-Encoding": "*",
			},
		}).catch((_err: any) => {
			error(`Error getting user data, Errored getting user data`);
			//req.parentApp.logger.error(err);
		});
		if (!response2 || !response2.data) {
			res.status(500).send("Error getting user data, No response data provided");
			return;
		}
		const { data: r2data } = response2;
		const userData = r2data.user;
		if (!userData.id) {
			res.status(500).send("No user id provided");
			return
		}
		const mcUserRepo = getDatabase().getRepository(MinecraftPlayer);


		const mcUser = await mcUserRepo.findOne({
			where: {
				discordUserId: userData.id
			}
		}) || await createBaseMinecraftUser(userData.id);

		const uuid = randomUUID();
		mcUser.sessionCookie = uuid;

		await mcUserRepo.save(mcUser);
		res.cookie("session", uuid, { maxAge: 900000, httpOnly: true }).redirect(BASE_URL + "/minecraftjoining.html");
		return;
	},
} satisfies HTTPRouteHandler;