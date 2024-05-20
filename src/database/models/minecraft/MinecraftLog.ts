import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import MinecraftData from "./MinecraftData";

@Entity()
export default class MinecraftLog {
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
	})
		serverIdentifier?: string;

	@OneToOne(() => MinecraftData, data => data.log,{
		nullable: false,
	})
		data!: MinecraftData;
}