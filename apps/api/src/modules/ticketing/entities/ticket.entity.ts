import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export type TicketStatus = 'ISSUED' | 'USED' | 'EXPIRED' | 'CANCELLED';
export type TransportType =
  | 'CABLE_AEREO'
  | 'BUS_URBANO'
  | 'BUSETA'
  | 'INTERMUNICIPAL'
  | 'TRANSMILENIO'
  | 'SITP'
  | 'COOPERATIVA'
  | 'MICROBUS';

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'transport_type',
    type: 'enum',
    enum: [
      'CABLE_AEREO',
      'BUS_URBANO',
      'BUSETA',
      'INTERMUNICIPAL',
      'TRANSMILENIO',
      'SITP',
      'COOPERATIVA',
      'MICROBUS',
    ],
  })
  transportType: TransportType;

  @Column({ name: 'route_id', nullable: true })
  routeId: string;

  @Column({ name: 'route_name' })
  routeName: string;

  // Fare in COP cents
  @Column({ name: 'fare_amount', type: 'bigint' })
  fareAmount: number;

  @Column({
    type: 'enum',
    enum: ['ISSUED', 'USED', 'EXPIRED', 'CANCELLED'],
    default: 'ISSUED',
  })
  status: TicketStatus;

  // Signed JWS compact token used to generate QR offline
  @Column({ name: 'qr_token', type: 'text' })
  qrToken: string;

  @Column({ name: 'expires_at' })
  expiresAt: Date;

  @Column({ name: 'used_at', nullable: true })
  usedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'issued_at' })
  issuedAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
