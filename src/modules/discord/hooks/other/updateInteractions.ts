import { ApplicationCommandDataResolvable, ApplicationCommandType, Guild } from "discord.js";
import ExtendedClient, { DSInteraction } from "../../extendedclient";
import { error, info } from "@src/engine/utils/Logger";

function typeFromType(type: DSInteraction["type"]): ApplicationCommandType {
	if (type == "chat") return ApplicationCommandType.ChatInput
	if (type == "message") return ApplicationCommandType.Message
	if (type == "user") return ApplicationCommandType.User
	return ApplicationCommandType.PrimaryEntryPoint
}

export default async function updateInteractions(client: ExtendedClient, params: { guild?: Guild } | undefined) {
	const guild = params?.guild;
	if (!guild) {
		const arr = [];
		for await (const [, interaction] of client.interactions.entries()) {
			const cleanInt: Partial<ApplicationCommandDataResolvable> =
				interaction.type == "chat" ?
					{
						name: interaction.name,
						type: typeFromType(interaction.type),
						description: interaction.description
					} : {
						name: interaction.name,
						type: typeFromType(interaction.type),

					}
			if (interaction.registerTo == "app") arr.push(cleanInt);
		}
		client.application?.commands.set(arr as ApplicationCommandDataResolvable[]).catch((e) => {
			error("Error while updating App Interactions: ", e);
		});
		info("Updated App Interactions");
		return;
	}
	const arr = [];
	for await (const [, interaction] of client.interactions.entries()) {
		const cleanInt: Partial<ApplicationCommandDataResolvable> =
			interaction.type == "chat" ?
				{
					name: interaction.name,
					type: typeFromType(interaction.type),
					description: interaction.description
				} : {
					name: interaction.name,
					type: typeFromType(interaction.type),

				}
		if (interaction.registerTo == "guild") arr.push(cleanInt);
	}
	await guild.commands.set(arr as ApplicationCommandDataResolvable[]).catch((e) => {
		error("Found Guild but couldn't Update Interactions", e);
	});
	info("Updated Interactions for", guild.name);
}