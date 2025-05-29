import { AttachmentBuilder, MessageContextMenuCommandInteraction, EmbedBuilder, Attachment } from "discord.js";

import ExtendedClient, { DSInteraction } from "../../extendedclient";
import { getConfigProperty, getConfigValue } from "@src/engine/utils/Configuration";
import { getDatabase } from "@src/engine/utils/Composable";
import GuildData from "@src/database/models/discord/GuildData";
export default {
	name: "send to museum",
	type: "message",
	description: "Sends a message with attachments to the museum",
	registerTo: "guild",
	async execute(client, interaction) {
		if (
			!interaction.memberPermissions?.has("ManageGuild") &&
			!interaction.memberPermissions?.has("Administrator") &&
			!getConfigProperty<string[]>("modules.discord.admins")?.includes(interaction.user.id)
		) return interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle("You do not have permission to use this command.")
					.setColor(`#${getConfigProperty<string[]>("modules.discord.defaultEmbedColor")}`)
			],
			ephemeral: true
		});
		const guildDataRepo = getDatabase().getRepository(GuildData)
		const guildData = await guildDataRepo.findOne({
			where: {
				guildId: `${interaction.guild?.id}`,
			},
		});
		if (!guildData || !guildData.museumId) return interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle("Museum Channel is not configured in this server.")
					.setDescription("Administrators can enable it with `/config museum`.")
					.setColor(`#${getConfigProperty<string[]>("modules.discord.defaultEmbedColor")}`)
			],
			ephemeral: true
		});
		const targetMessage = await interaction.channel?.messages.fetch(interaction.targetMessage.id);
		const msgAttachments = targetMessage?.attachments;
		if (!msgAttachments) return interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle("No Attachments found!")
					.setDescription("This message has no attachments.")
					.setColor(`#${getConfigProperty<string[]>("modules.discord.defaultEmbedColor")}`)
			],
			ephemeral: true
		});
		let attachments: Attachment[] | undefined = [];
		if (msgAttachments.size) {
			for await (const [, attachment] of msgAttachments) {
				attachments.push(attachment);
			}
		}
		attachments = attachments.length > 0 ? attachments : undefined;
		if (!attachments) return interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle("No Attachments found!")
					.setDescription("This message has no attachments.")
					.setColor(`#${getConfigProperty<string[]>("modules.discord.defaultEmbedColor")}`)
			],
			ephemeral: true
		});
		const channel = client.channels.cache.get(`${guildData.museumId}`) || await client.channels.fetch(`${guildData.museumId}`).catch(() => null);
		if (!channel || !channel.isSendable()) return interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle("Museum Channel is not configured in this server or is not valid.")
					.setDescription("Administrators can enable it with `/config museum`.")
					.setColor(`#${getConfigProperty<string[]>("modules.discord.defaultEmbedColor")}`)
			],
			ephemeral: true
		});
		const content = targetMessage?.content || "";
		const embeds: EmbedBuilder[] = [];
		for (const attachment of attachments) {
			embeds.push(new EmbedBuilder()
				.setAuthor({ name: targetMessage?.author?.tag, iconURL: targetMessage?.author?.displayAvatarURL() })
				.setDescription(`${content}`)
				.setColor(`#${getConfigProperty<string[]>("modules.discord.defaultEmbedColor")}`)
				.setImage(attachment.proxyURL)
			);
		}
		await channel.send({ embeds }).catch(() => null);
		return interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle("Message sent to Museum!")
					.setDescription("The message has been sent to the museum.")
					.setColor(`#${getConfigProperty<string[]>("modules.discord.defaultEmbedColor")}`)
			],
			ephemeral: true
		});

	}
} satisfies DSInteraction;