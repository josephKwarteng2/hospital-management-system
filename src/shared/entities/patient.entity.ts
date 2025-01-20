import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../shared/entities/user.entity';
import { Gender } from '../types/types';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @Column({ length: 15 })
  contact: string;

  @Column('text')
  address: string;
}
