import { Parseable, ValidateProperty } from "parzival";


@Parseable()
export default class OAuthConfig {

	@ValidateProperty({
		type: "string",
	})
	client_secret!: string;
}