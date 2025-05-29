import { ApplicationContext } from "@src/engine/types/Engine";
import { CliCommand } from "@src/engine/types/Executors";
import { clear } from "@src/engine/utils/Logger";

export default {
	name: "help",
	description: "Displays help information",
	usage: "help <command>",
	execute: async (app: ApplicationContext, args: string[]) => {
		const columns = process.stdout.columns;
		const commands = app.cli.commands;
		const table = [];
		for (const [, command] of commands) {
			table.push(`${command.usage} - ${command.description}`);
		}
		clear(table.join("\n"));
	}

} satisfies CliCommand;