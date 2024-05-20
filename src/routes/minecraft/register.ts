import MinecraftPlayer from "@src/database/models/minecraft/MinecraftPlayer";
import { getModule } from "@src/engine/modules";
import { HTTPRouteHandler } from "@src/engine/types/Executors";
import { getDatabase } from "@src/engine/utils/Composable";
import { debug, warn } from "@src/engine/utils/Logger";
import ExtendedClient from "@src/modules/discord/extendedclient";
import { Response } from "express";

export default {
	async get(req, res) {
		const discord = getModule<ExtendedClient>("discord");
		if (!discord) {
			res.status(500).send("Discord module missing");
			return;
		}
		const oauth2Url = `https://discord.com/api/oauth2/authorize?client_id=${discord.application?.id}&redirect_uri=${encodeURIComponent("https://" + req.hostname + "/minecraft/oauthcallback")}&response_type=code&scope=identify`;
		res.redirect(oauth2Url);
	},
	async post(req, res) {
		const sessionCookie = req.cookies?.session;
		if (!sessionCookie) {
			res.redirect("/minecraft/register");
			return;
		}
		const discord = getModule<ExtendedClient>("discord");
		if (!discord) {
			res.status(500).send("Discord module missing");
			return;
		}
		const userRepo = getDatabase().getRepository(MinecraftPlayer);
		const player = await userRepo.findOne({
			where: {
				sessionCookie: sessionCookie
			}
		});
		if (!player) {
			res.redirect("/minecraft/register");
			return;
		}
		const { discordUserId } = player;
		const discordUser = await discord.users.fetch(discordUserId);
		if (!discordUser) {
			res.redirect("/minecraft/register");
			return;
		}
		if (player.username) {
			res.redirect("/minecraftjoined.html");
			warn(`User ${discordUser.username}#${discordUser.discriminator} (${discordUser.id}) tried to register a username but already has one`);
			return;
		}
		const { username } = req.body;
		if (!username) {
			res.redirect("/minecraftjoining.html?error=No username provided");
			return;
		}
		userRepo.save({
			...player,
			username: username
		});
		debug(`User ${discordUser.username}#${discordUser.discriminator} (${discordUser.id}) has registered the username ${username}`);

		res.redirect("/minecraftjoined.html");
	}
} satisfies HTTPRouteHandler;