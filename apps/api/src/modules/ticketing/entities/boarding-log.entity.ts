import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('boarding_logs')
export class BoardingLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'validator_id' })
  validator: User;

  @Column({ name: 'route_id', nullable: true })
  routeId: string;

  @Column({ name: 'trip_id', nullable: true })
  tripId: string;

  @Column({ name: 'amount', type: 'numeric', nullable: true })
  amount: number;

  @CreateDateColumn({ name: 'boarded_at', type: 'timestamptz' })
  boardedAt: Date;
}
