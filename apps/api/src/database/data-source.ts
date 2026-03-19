import 'reflect-metadata';
import { DataSource } from 'typeorm';
import type { DataSourceOptions } from 'typeorm';
import 'dotenv/config';
import { SeederOptions } from 'typeorm-extension';
import * as path from 'path';

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [path.join(__dirname, '../modules/**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, '/migrations/*{.ts,.js}')],
  seeds: [path.join(__dirname, '/seeds/**/*.seeder{.ts,.js}')],
  factories: [path.join(__dirname, '/factories/**/*.factory{.ts,.js}')],
  synchronize: process.env.NODE_ENV === 'development',
  logging: false,
};

export const dataSource = new DataSource(options);
export default dataSource;
