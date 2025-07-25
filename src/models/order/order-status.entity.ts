import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Order } from './order.entity';
import { AbstractEntity } from '../base.entity';

@Entity()
export class OrderStatus extends AbstractEntity {
	@PrimaryGeneratedColumn()
	orderStatusId!: number;

	@Column({ type: 'varchar', length: 100 })
	statusName!: string;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@OneToMany(() => Order, (order) => order.orderStatus)
	orders!: Order[];
}
