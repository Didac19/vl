import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import * as Shared from '@transix/shared-types';
import { Route } from './route.entity';

@Entity('transport_types')
export class TransportType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: ['CABLE_AEREO', 'BUS_URBANO', 'BUSETA', 'INTERMUNICIPAL', 'TRANSMILENIO', 'SITP', 'COOPERATIVA', 'MICROBUS'],
  })
  type: Shared.TransportType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  fareAmount: number;

  @Column({ default: true })
  requiresRouteSelection: boolean;

  @OneToMany(() => Route, (route) => route.transportType, { cascade: true })
  routes: Route[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
