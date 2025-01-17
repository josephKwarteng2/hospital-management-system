import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../shared/entities/user.entity';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column({ length: 100 })
  specialization: string;

  @Column({ length: 50 })
  rank: string;

  @Column('text', { nullable: true })
  profileDetails: string;

  @Column('jsonb', { default: '{"startTime": "08:00", "endTime": "17:00"}' })
  workingHours: { startTime: string; endTime: string };
}
