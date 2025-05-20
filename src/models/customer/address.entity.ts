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
import { User } from '../user/user.entity';

// Address entity
@Entity()
export class Address extends AbstractEntity {
	@PrimaryGeneratedColumn()
	addressId!: number;

	@Column()
	userId!: number;

	@ManyToOne(() => User)
	@JoinColumn({ name: 'user_id' })
	user!: User;

	@Column({ type: 'text' })
	addressLine1!: string;

	@Column({ type: 'text' })
	addressLine2!: string;

	@Column()
	city!: string;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
