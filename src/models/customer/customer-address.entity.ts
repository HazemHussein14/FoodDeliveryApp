import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn, Unique, PrimaryGeneratedColumn } from 'typeorm';
import { Customer } from './customer.entity';
import { Address } from './address.entity';
import { AbstractEntity } from '../base.entity';

@Entity()
@Unique(['addressId', 'customerId'])
export class CustomerAddress extends AbstractEntity {
	@PrimaryGeneratedColumn()
	customerAddressId!: number;

	@Column()
	addressId!: number;

	@Column()
	customerId!: number;

	@Column({ default: false })
	isDefault!: boolean;

	@CreateDateColumn()
	createdAt!: Date;

	@ManyToOne(() => Customer)
	@JoinColumn({ name: 'customer_id' })
	customer!: Customer;

	@ManyToOne(() => Address)
	@JoinColumn({ name: 'address_id' })
	address!: Address;
}
