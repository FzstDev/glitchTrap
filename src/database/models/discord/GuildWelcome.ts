import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import GuildMessageEmbed from "./MessageEmbed";

@Entity()
export default class GuildWelcome {
	@PrimaryColumn({
		type: "varchar",
		length: "20",
	})
		guildId!: string;

	@Column({
		nullable: true,
	})
		enabled?: boolean;
	
	@Column({
		nullable: true,
		type: "varchar",
		length: "20",
	})
		channel?: string;

	@OneToOne(() => GuildMessageEmbed,{
		eager: true
	})
	@JoinColumn()
		message?: GuildMessageEmbed;
}