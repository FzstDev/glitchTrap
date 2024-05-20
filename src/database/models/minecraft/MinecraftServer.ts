import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import MinecraftData from "./MinecraftData";

@Entity()
export default class MinecraftServer {
	@PrimaryGeneratedColumn()
		id!: number;

	@Column({
		unique: true,
		type:"text",
	})
		serverName!: string;
	@Column({
		unique: true,
		type:"text",
	})
		identifier!: string;
	
	@Column({
		type:"text",
		default: "[]",
	})
		allowedRoleIds!: string;

	@ManyToOne(() => MinecraftData , data => data.servers,{
		eager: true,
		cascade: true,
	})
		data!: MinecraftData;

	// Experimental Functions
	assignAllowedRole(roleId: string) {
		const allowedRoleIds = JSON.parse(this.allowedRoleIds);
		allowedRoleIds.push(roleId);
		this.allowedRoleIds = JSON.stringify(allowedRoleIds);
	}
	removeAllowedRole(roleId: string) {
		const allowedRoleIds = JSON.parse(this.allowedRoleIds);
		const index = allowedRoleIds.indexOf(roleId);
		if (index > -1) {
			allowedRoleIds.splice(index, 1);
		}
		this.allowedRoleIds = JSON.stringify(allowedRoleIds);
	}
	
}