import 'reflect-metadata';
import { dataSource } from './data-source';
import { runSeeders } from 'typeorm-extension';
import AdminSeeder from './seeds/admin.seeder';
import UserSeeder from './seeds/user.seeder';
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

    if (args.includes('user')) {
      console.log('2. User Seeder');
      // Note: UserSeeder needs a factory manager if using runSeeders from typeorm-extension.
      // For now, let's keep it commented if not ready or use runSeeders specifically.
      await runSeeders(dataSource, {
        seeds: [UserSeeder],
        factories: [UserFactory],
      });
    }

    if (runAll || args.includes('transport')) {
      console.log('3. Transport Seeder');
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
