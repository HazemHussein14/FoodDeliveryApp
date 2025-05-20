import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToOne,
	JoinColumn
} from 'typeorm';
import { AbstractEntity } from '../../abstract/base.entity';
import { User } from '../user/user.entity';

@Entity()
export class Customer extends AbstractEntity {
	@PrimaryGeneratedColumn()
	customerId!: number;

	@Column({ unique: true })
	userId!: number;

	@Column({ type: 'date', nullable: true })
	birthDate!: Date;

	@Column({ type: 'varchar', length: 6, nullable: true })
	gender!: 'male' | 'female';

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@OneToOne(() => User)
	@JoinColumn({ name: 'user_id' })
	user!: User;
}
