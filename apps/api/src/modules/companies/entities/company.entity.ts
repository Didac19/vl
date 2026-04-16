import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import type { User } from '../../users/entities/user.entity';
import type { Route } from '../../transport/entities/route.entity';
import { Validator } from './validator.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  nit: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ name: 'bre_b_code', nullable: true })
  breBCode: string;

  @OneToMany('User', 'company')
  users: User[];

  @OneToMany('Route', 'company')
  routes: Route[];

  @OneToMany(() => Validator, (validator) => validator.company)
  validators: Validator[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

