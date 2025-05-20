import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToOne,
	JoinColumn
} from 'typeorm';
import { User } from '../user/user.entity';
import { AbstractEntity } from '../../abstract/base.entity';

// Restaurant entity
@Entity()
export class Restaurant extends AbstractEntity {
	@PrimaryGeneratedColumn()
	restaurantId!: number;

	@Column({ unique: true })
	userId!: number;

	@OneToOne(() => User)
	@JoinColumn({ name: 'user_id' })
	user!: User;

	@Column()
	name!: string;

	@Column({ default: '' })
	logoUrl!: string;

	@Column({ default: '' })
	bannerUrl!: string;

	@Column({ type: 'jsonb', nullable: true })
	location?: any;

	@Column({
		type: 'enum',
		enum: ['open', 'busy', 'pause', 'closed']
	})
	status!: 'open' | 'busy' | 'pause' | 'closed';

	@Column({ unique: true })
	commercialRegistrationNumber!: string;

	@Column({ unique: true })
	vatNumber!: string;

	@Column({ default: true })
	isActive!: boolean;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
