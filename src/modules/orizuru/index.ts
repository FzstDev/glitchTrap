import Module from "@src/engine/modules";
import { debug } from "@src/engine/utils/Logger";
import { EventEmitter } from "events";



export default {
	name: "orizuru",
	hooksInnerPath: "hooks",
	loadFunction: async (config) => {
		return new EventEmitter();
	},
	initFunction: async (ctx, config) => {
		debug("Orizuru module initialized");
	}
} satisfies Module<EventEmitter, "orizuru">;