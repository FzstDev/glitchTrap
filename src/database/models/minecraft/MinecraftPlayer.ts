import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export default class MinecraftPlayer {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({
		nullable: true,
		unique: true,
		type: "text"
	})
	username?: string;

	@Column({
		unique: true,
		nullable: true,
		type: "text",
	})
	uuid?: string;

	@Column({
		unique: true,
		type: "varchar",
		length: "20",
	})
	discordUserId!: string;

	@Column({
		nullable: true,
		type: "text",
	})
	lastIp?: string;

	@Column({
		default: false,
	})
	enabled!: boolean;

	@Column({
		nullable: true,
		type: "text",
	})
	sessionCookie?: string;

	@Column({
		nullable: true,
		type: "text",
	})
	invitedBy?: string;

	@Column({
		type: "text",
		default: "[]",
	})
	invitedPlayers!: string;

	addInvitedPlayer(playerId: string) {
		const invitedPlayers = JSON.parse(this.invitedPlayers);
		invitedPlayers.push(playerId);
		this.invitedPlayers = JSON.stringify(invitedPlayers);
	}
	removeInvitedPlayer(playerId: string) {
		const invitedPlayers = JSON.parse(this.invitedPlayers);
		const index = invitedPlayers.indexOf(playerId);
		if (index > -1) {
			invitedPlayers.splice(index, 1);
		}
		this.invitedPlayers = JSON.stringify(invitedPlayers);
	}
	getInvitedPlayers():string[]{
		const invitedPlayers = JSON.parse(this.invitedPlayers);
		return invitedPlayers;
	}

}