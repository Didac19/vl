import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Route } from './route.entity';
import { Stop } from './stop.entity';

@Entity('point_to_point_fares')
export class PointToPointFare {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Route, (route) => route.fareTable, { onDelete: 'CASCADE' })
  route: Route;

  @ManyToOne(() => Stop, { onDelete: 'CASCADE' })
  originStop: Stop;

  @ManyToOne(() => Stop, { onDelete: 'CASCADE' })
  destinationStop: Stop;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  fareAmount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
