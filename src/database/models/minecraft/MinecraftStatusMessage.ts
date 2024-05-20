import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export default class MinecraftStatusMessage {
	@PrimaryColumn({
		type: "varchar",
		length: "20",
	})
	guildId!: string;

	@Column({
		nullable: true,
		type: "varchar",
		length: "20",
	})
	channelId?: string;

	@Column({
		nullable: true,
		type: "varchar",
		length: "20",
	})
	lastMessageId?: string;

	@Column({
		nullable: true,
		type: "varchar",
	})
	serverIdentifier?: string;

}