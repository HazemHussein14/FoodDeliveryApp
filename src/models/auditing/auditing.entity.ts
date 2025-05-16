import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class Auditing {
	@PrimaryGeneratedColumn()
	auditingId!: number;

	@Column()
	userId!: number;

	@Column({ type: 'jsonb', default: {} })
	auditEvent!: Record<string, any>;

	@Column({ type: 'jsonb', default: {} })
	auditData!: Record<string, any>;

	@Column({ type: 'timestamp' })
	auditDate!: Date;

	@CreateDateColumn()
	createdAt!: Date;

	@ManyToOne(() => User)
	@JoinColumn({ name: 'user_id' })
	user!: User;
}
