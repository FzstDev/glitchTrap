import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import GuildSuggest from "./GuildSuggest";

@Entity()
export default class GuildSuggestion {
	@PrimaryGeneratedColumn()
		id!: number;

	@Column({
		type: "text",
	})
		value!: string;

	@Column({
		type: "varchar",
		length: 20,
	})
		author!: string;

	@Column({
		nullable: true,
		type: "varchar",
		length: 20,
	})
		activeMessageId?: string;

	@Column({
		nullable: true,
	})
		count!: number;

	@ManyToOne(() => GuildSuggest)
		config!: GuildSuggest;

}