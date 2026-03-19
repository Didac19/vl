import 'reflect-metadata';
import { dataSource } from './data-source';
import { runSeeders } from 'typeorm-extension';

async function run() {
  try {
    console.log('🌱 Initializing data source...');
    await dataSource.initialize();
    
    console.log('🚀 Running seeders...');
    await runSeeders(dataSource);
    
    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:');
    console.error(error);
    process.exit(1);
  }
}

run();
