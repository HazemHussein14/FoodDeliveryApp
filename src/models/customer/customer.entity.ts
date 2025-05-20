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

	@OneToOne(() => User)
	@JoinColumn({ name: 'user_id' })
	user!: User;

	@Column({ type: 'date', nullable: true })
	birthDate?: Date;

	@Column({
		type: 'enum',
		enum: ['male', 'female'],
		nullable: true
	})
	gender?: 'male' | 'female';

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
