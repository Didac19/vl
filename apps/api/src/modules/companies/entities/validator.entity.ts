import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Company } from './company.entity';
import { ScannedTicket } from './scanned-ticket.entity';

@Entity('validators')
export class Validator {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  deviceId: string;

  @Column()
  name: string;

  @ManyToOne(() => Company, (company) => company.validators, { onDelete: 'CASCADE' })
  company: Company;

  @OneToMany(() => ScannedTicket, (scanned) => scanned.validator)
  scans: ScannedTicket[];

  @Column({ type: 'timestamp', nullable: true })
  lastSyncAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
