import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { Route } from '../../transport/entities/route.entity';

/**
 * Persists generated bus QR records per company.
 * Uniqueness is enforced on (busId, companyId) — one QR per bus per company.
 * The token is re-signed on each "regenerate" action, updating the record.
 */
@Entity('bus_qrs')
@Unique(['busId', 'company'])
export class BusQr {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Admin-entered bus identifier, e.g. "BUS-001" or "ABC-123" */
  @Column({ name: 'bus_id' })
  busId: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => Route, { onDelete: 'SET NULL', nullable: true, eager: true })
  @JoinColumn({ name: 'route_id' })
  route: Route;

  /** Route name snapshot at time of generation */
  @Column({ name: 'route_name' })
  routeName: string;

  /** Fare amount in COP pesos (not cents) */
  @Column({ type: 'numeric', precision: 10, scale: 2 })
  amount: number;

  /** The latest signed JWT token for this bus QR */
  @Column({ type: 'text' })
  token: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
