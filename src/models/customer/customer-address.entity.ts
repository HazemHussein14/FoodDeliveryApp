import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Customer } from './customer.entity';
import { Address } from './address.entity';

@Entity()
export class CustomerAddress {
	@PrimaryColumn()
	addressId!: number;

	@PrimaryColumn()
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
