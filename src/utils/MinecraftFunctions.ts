import MinecraftData from "@src/database/models/minecraft/MinecraftData";
import MinecraftPlayer from "@src/database/models/minecraft/MinecraftPlayer";
import MinecraftServer from "@src/database/models/minecraft/MinecraftServer";
import MinecraftStatusMessage from "@src/database/models/minecraft/MinecraftStatusMessage";
import { getDatabase } from "@src/engine/utils/Composable";
import { getConfigProperty, getConfigValue } from "@src/engine/utils/Configuration";
import ExtendedClient from "@src/modules/discord/extendedclient";
import { TextBasedChannel } from "discord.js";
import { Repository } from "typeorm";

const createBaseMinecraftUser = async (discordId: string, invitedBy_Id?: string, repo?: Repository<MinecraftPlayer>): Promise<MinecraftPlayer> => {
	const newUser = new MinecraftPlayer();
	newUser.enabled = false;
	newUser.discordUserId = discordId;

	if (invitedBy_Id && !repo) throw new Error("Repository is required if invitedBy_Id is provided.");
	if (repo && invitedBy_Id) {
		const invitedByUser = await repo.findOne({
			where: {
				discordUserId: invitedBy_Id
			}
		});
		if (!invitedByUser) throw new Error("InvitedBy user not found.");
		newUser.invitedBy = invitedByUser.discordUserId;
	}

	newUser.lastIp = undefined;
	newUser.username = undefined;
	newUser.uuid = undefined;

	return newUser;
};

const createBaseMinecraftServer = async (name: string, identifier: string, data: MinecraftData): Promise<MinecraftServer> => {
	const newServer = new MinecraftServer();

	newServer.serverName = name;
	newServer.identifier = identifier;
	newServer.data = data;

	return newServer;
};

const hasMemberPermission = async (client: ExtendedClient, guildId: string, memberId: string, mcServer: MinecraftServer) => {
	const guild = client.guilds.cache.get(guildId) || await client.guilds.fetch(guildId).catch(() => null);
	if (!guild) return false;
	const member = guild.members.cache.get(memberId) || await guild.members.fetch(memberId).catch(() => null);
	if (!member) return false;
	const parsed = JSON.parse(mcServer.allowedRoleIds) as string[];
	const hasRole = member.roles.cache.some((role) => {
		return parsed.includes(role.id);
	});
	const isAdmin = member.permissions.has("Administrator") || member.permissions.has("ManageGuild") || getConfigProperty<string[]>("modules.discord.admins")?.includes(member.id);
	return hasRole || isAdmin;
};

const getStatusChannel = async (client: ExtendedClient, serverIdentifier: string): Promise<TextBasedChannel | null> => {
	const statusMessageRepo = getDatabase().getRepository(MinecraftStatusMessage);
	const statusMessage = await statusMessageRepo.findOne({
		where: {
			serverIdentifier: serverIdentifier
		}
	});
	if (!statusMessage) {
		return null;
	}
	const guildId = statusMessage.guildId;
	const channelId = statusMessage.channelId;
	if (!guildId || !channelId) {
		return null;
	}
	const guild = client.guilds.cache.get(guildId) || await client.guilds.fetch(guildId).catch(() => null);
	if (!guild) {
		return null;
	}
	const channel = guild.channels.cache.get(channelId) || await guild.channels.fetch(channelId).catch(() => null);
	if (!channel || !channel.isTextBased()) {
		return null;
	}
	return channel;
}
export { createBaseMinecraftUser, createBaseMinecraftServer, hasMemberPermission, getStatusChannel };