import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { User } from '../../modules/users/entities/user.entity';

export default class UserSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager
  ): Promise<void> {
    const userFactory = await factoryManager.get(User);
    // We create 10 dummy users with fake data
    await userFactory.saveMany(10);
    console.log('✅ 10 random users seeded.');
  }
}
