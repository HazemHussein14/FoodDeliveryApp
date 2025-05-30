import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

import { AbstractEntity } from '../base.entity';

@Entity()
export class RestaurantSetting extends AbstractEntity {
	@PrimaryGeneratedColumn()
	restaurantSettingId!: number;

	@Column({ type: 'decimal', precision: 5, scale: 2 })
	serviceFeePercentage!: number;

	@Column({ type: 'decimal', precision: 5, scale: 2 })
	deliveryFeePercentage!: number;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
