import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn
} from 'typeorm';
import { AbstractEntity } from '../../abstract/base.entity';
import { PaymentMethod } from './payment-method.entity';

@Entity()
export class PaymentMethodConfig extends AbstractEntity {
	@PrimaryGeneratedColumn()
	paymentMethodConfigId!: number;

	@Column()
	paymentMethodId!: number;

	@ManyToOne(() => PaymentMethod)
	@JoinColumn({ name: 'payment_method_Id' })
	paymentMethod!: PaymentMethod;

	@Column({ type: 'jsonb' })
	configKey!: any;

	@Column({ type: 'jsonb' })
	configValue!: any;

	@Column({ default: true })
	isActive!: boolean;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
