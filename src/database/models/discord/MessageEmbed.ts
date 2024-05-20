import { Column, Entity, JoinTable, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import GuildData from "./GuildData";
import MessageEmbedField from "./MessageEmbedField";

@Entity()
export default class GuildMessageEmbed {
	@PrimaryGeneratedColumn()
		id!: number;

	@Column({
		unique: true,
		type: "varchar",
		length: 255,
	})
		name!: string;

	@Column({ 
		nullable: true,
		type: "varchar",
		length: 255,
	})
		title?: string;

	@Column({
		nullable: true,
		type: "text",
	})
		titleURL?: string;

	@Column({ 
		nullable: true,
		type: "varchar",
		length: 255,
	})
		author?: string;

	@Column({
		nullable: true,
		type: "text",
	})
		authorURL?: string;

	@Column({
		nullable: true,
		type: "text",
	})
		description?: string;

	@Column({
		nullable: true,
		type: "text",
	})
		imageURL?: string;

	@Column({
		nullable: true,
		type: "text",
	})
		thumbnailURL?: string;

	@Column({
		nullable: true,
		type: "text",
	})
		footer?: string;

	@Column({
		nullable: true,
		type: "text",
	})
		footerURL?: string;

	@Column({ nullable: true })
		color?: string;

	@OneToMany(() => MessageEmbedField, field => field.embed, {
		eager: true,
		orphanedRowAction: "delete",
	})
	@JoinTable()
		fields!: MessageEmbedField[];

	@ManyToOne(() => GuildData)
		guildData!: GuildData;
}