import { Parseable, ValidateProperty } from "parzival";

@Parseable()
export default class OrizuruConfig {
	@ValidateProperty({
		type: "string",
	})
	baseLanguage!: string;
}