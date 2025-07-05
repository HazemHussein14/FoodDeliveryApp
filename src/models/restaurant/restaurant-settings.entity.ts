import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('restaurant_settings')
export class RestaurantSettings {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  restaurantId!: number;

  @Column({ type: 'float', nullable: true })
  serviceFeePercentage?: number;

  @Column({ type: 'float', nullable: true })
  deliveryFeePercentage?: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // @OneToOne(() => Restaurant, restaurant => restaurant.settings)
  // restaurant: Restaurant;
} 