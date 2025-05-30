import {
	Column,
	Entity,
	PrimaryGeneratedColumn,
	ManyToOne,
	JoinColumn,
	CreateDateColumn,
	UpdateDateColumn
} from 'typeorm';
import { AbstractEntity } from '../base.entity';
import { PaymentMethod } from './payment-method.entity';

@Entity()
export class PaymentMethodConfig extends AbstractEntity {
	@PrimaryGeneratedColumn()
	paymentMethodConfigId!: number;

	@Column()
	paymentMethodId!: number;

	@Column({ type: 'jsonb' })
	gatewayConfig!: Record<string, any>;

	@Column({ default: true })
	isActive!: boolean;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@ManyToOne(() => PaymentMethod)
	@JoinColumn({ name: 'payment_method_id' })
	paymentMethod!: PaymentMethod;
}
