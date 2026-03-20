import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import * as Shared from '@via-libre/shared-types';
import { TransportType } from './transport-type.entity';
import { Stop } from './stop.entity';
import { PointToPointFare } from './point-to-point-fare.entity';

@Entity('routes')
export class Route {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: ['FLAT', 'POINT_TO_POINT'],
    default: 'FLAT',
  })
  pricingStrategy: Shared.PricingStrategy;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  baseFare: number;

  @ManyToOne(() => TransportType, (transportType) => transportType.routes)
  transportType: TransportType;

  @OneToMany(() => Stop, (stop) => stop.route, { cascade: true })
  stops: Stop[];

  @OneToMany(() => PointToPointFare, (fare) => fare.route, { cascade: true })
  fareTable: PointToPointFare[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
