import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { AbstractEntity } from '../../abstract/base.entity';

@Entity()
export class Item extends AbstractEntity {
	@PrimaryGeneratedColumn()
	itemId!: number;

	@Column({ default: '' })
	imagePath!: string;

	@Column({ length: 100 })
	name!: string;

	@Column({ type: 'text', default: '' })
	description!: string;

	@Column({ type: 'decimal', precision: 10, scale: 2 })
	price!: number;

	@Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
	energyValCal!: number;

	@Column({ type: 'text', default: '' })
	notes!: string;

	@Column({ default: true })
	isAvailable!: boolean;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
