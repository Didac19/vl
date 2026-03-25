import 'reflect-metadata';
import { dataSource } from './data-source';
import { runSeeders } from 'typeorm-extension';
import AdminSeeder from './seeds/admin.seeder';
import UserSeeder from './seeds/user.seeder';
import CompanySeeder from './seeds/company.seeder';
import TransportSeeder from './seeds/transport.seeder';
import UserFactory from './factories/user.factory';

async function run() {
  try {
    const args = process.argv.slice(2);
    const runAll = args.length === 0;

    console.log('🌱 Initializing data source...');
    await dataSource.initialize();

    console.log('🚀 Running seeders...');

    if (runAll || args.includes('admin')) {
      console.log('1. Admin Seeder');
      const adminSeeder = new AdminSeeder();
      await adminSeeder.run(dataSource, null as any);
    }

    if (runAll || args.includes('company')) {
      console.log('2. Company Seeder');
      const companySeeder = new CompanySeeder();
      await companySeeder.run(dataSource);
    }

    if (args.includes('user')) {
      console.log('3. User Seeder');
      await runSeeders(dataSource, {
        seeds: [UserSeeder],
        factories: [UserFactory],
      });
    }

    if (runAll || args.includes('transport')) {
      console.log('4. Transport Seeder');
      const transportSeeder = new TransportSeeder();
      await transportSeeder.run(dataSource);
    }

    console.log('✅ Seeding process finished!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:');
    console.error(error);
    process.exit(1);
  }
}

run();
