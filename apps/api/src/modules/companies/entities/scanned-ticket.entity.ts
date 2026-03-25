import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Validator } from './validator.entity';
import type { Ticket } from '../../ticketing/entities/ticket.entity';

@Entity('scanned_tickets')
export class ScannedTicket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne('Ticket', { onDelete: 'CASCADE' })
  ticket: Ticket;

  @ManyToOne(() => Validator, (validator) => validator.scans, { onDelete: 'CASCADE' })
  validator: Validator;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  lat: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  lng: number;

  @CreateDateColumn()
  scannedAt: Date;
}
