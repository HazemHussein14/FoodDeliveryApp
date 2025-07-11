import { AbstractEntity } from '../base.entity';
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('settings')
export class Setting extends AbstractEntity {
	@PrimaryGeneratedColumn()
	settingId!: number;

	@Column({ unique: true })
	key!: string;

	@Column({ type: 'jsonb', nullable: true })
	value!: any;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
