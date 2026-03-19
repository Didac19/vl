import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Wallet } from './wallet.entity';

export type TransactionType = 'CREDIT' | 'DEBIT';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ['CREDIT', 'DEBIT'] })
  type: TransactionType;

  // Amount in COP cents
  @Column({ type: 'bigint' })
  amount: number;

  @Column()
  description: string;

  @Column({ name: 'reference_id', nullable: true })
  referenceId: string; // e.g. ticket ID or external payment ID

  @ManyToOne(() => Wallet, (wallet: Wallet) => wallet.transactions)
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
