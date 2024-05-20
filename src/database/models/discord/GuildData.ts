import { Column, Entity, JoinColumn, JoinTable, OneToMany, OneToOne, PrimaryColumn } from "typeorm";
import GuildSuggest from "./GuildSuggest";
import GuildVerify from "./GuildVerify";
import GuildWelcome from "./GuildWelcome";
import GuildMessageEmbed from "./MessageEmbed";

@Entity()
export default class GuildData {
	@PrimaryColumn({
		type: "varchar",
		length: "20",
	})
		guildId!: string;

	@Column({
		type: "varchar",
		length: "20",
		nullable: true,
	})
		museumId?: string;
	@Column({
		type: "varchar",
		length: "20",
		nullable: true,
	})
		confessionsId?: string;

	@OneToOne(() => GuildWelcome, {
		nullable: true,
		eager: true,
		orphanedRowAction: "delete",
	})
	@JoinColumn()
		welcome?: GuildWelcome;

	@OneToOne(() => GuildSuggest, {
		nullable: true,
		eager: true,
		orphanedRowAction: "delete",
	})
	@JoinColumn()
		suggest?: GuildSuggest;

	@OneToOne(() => GuildVerify, {
		nullable: true,
		eager: true,
		orphanedRowAction: "delete"
	})
	@JoinColumn()
		verify?: GuildVerify;

	@OneToMany(() => GuildMessageEmbed, (embed) => embed.guildData)
	@JoinTable()
		embeds!: GuildMessageEmbed[];
}