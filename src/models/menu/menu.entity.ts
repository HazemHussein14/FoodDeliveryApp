import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { AbstractEntity } from '../../abstract/base.entity';
import { MenuItem } from './menu-item.entity';

@Entity()
export class Menu extends AbstractEntity {
	@PrimaryGeneratedColumn()
	menuId!: number;

	@Column({ type: 'varchar', length: 100 })
	menuTitle!: string;

	@Column({ default: true })
	isActive!: boolean;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@OneToMany(() => MenuItem, (menuItem) => menuItem.menu)
	items!: MenuItem[];
}
