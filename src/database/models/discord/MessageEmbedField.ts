import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import GuildMessageEmbed from "./MessageEmbed";



@Entity()
export default class MessageEmbedField {
	@PrimaryGeneratedColumn()
		id!: number;
	@Column({
		type: "varchar",
		length: 255,
	})
		title!: string;
	
	@Column({
		type: "text",
	})
		value!: string;

	@ManyToOne(() => GuildMessageEmbed, embed => embed.fields)
		embed!: GuildMessageEmbed;
}