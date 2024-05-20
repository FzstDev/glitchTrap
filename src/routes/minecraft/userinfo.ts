import MinecraftPlayer from "@src/database/models/minecraft/MinecraftPlayer";
import { getModule } from "@src/engine/modules";
import { HTTPRouteHandler } from "@src/engine/types/Executors";
import { getDatabase } from "@src/engine/utils/Composable";
import ExtendedClient from "@src/modules/discord/extendedclient";

export default {
	async get(req, res) {
		const sessionCookie = req.cookies?.session;
		if (!sessionCookie) {
			res.status(400).send("No session cookie provided");
			return;
		}
		const userRepo = getDatabase().getRepository(MinecraftPlayer);
		const player = await userRepo.findOne({
			where: {
				sessionCookie: sessionCookie
			}
		});
		if (!player) {
			res.status(400).send("No player found with that session cookie");
			return;
		}
		const { discordUserId } = player;
		const discordUser = await getModule<ExtendedClient>("discord")?.users.fetch(discordUserId);
		if (!discordUser) {
			res.status(404).send("No user found with that ID");
			return;
		}
		res.json({
			discord: {
				id: discordUser.id,
				username: discordUser.username,
				discriminator: discordUser.discriminator,
				avatarURL: discordUser.avatarURL({
					size: 2048,
					extension: "png",
				}),
			},
			minecraft: {
				username: player.username,
				uuid: player.uuid,
				status: player.enabled ? "enabled" : "disabled",
			},
		});
	},
} satisfies HTTPRouteHandler;