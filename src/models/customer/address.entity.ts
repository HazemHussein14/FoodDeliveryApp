import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { AbstractEntity } from '../base.entity';

// Address entity
@Entity()
export class Address extends AbstractEntity {
	@PrimaryGeneratedColumn()
	addressId!: number;

	@Column({ type: 'text' })
	addressLine1!: string;

	@Column({ type: 'text' })
	addressLine2!: string;

	@Column({ type: 'varchar', length: 255 })
	city!: string;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
