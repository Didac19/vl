import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { User } from '../../modules/users/entities/user.entity';
import { UserRole } from '@via-libre/shared-types';
import * as bcrypt from 'bcryptjs';

export default class UserSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager
  ): Promise<void> {
    const userRepo = dataSource.getRepository(User);

    // Create a known admin user
    const adminEmail = 'admin@vialibre.com';
    let admin = await userRepo.findOneBy({ email: adminEmail });
    if (!admin) {
      console.log('🌱 Creating admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      admin = userRepo.create({
        fullName: 'Admin Vía Libre',
        email: adminEmail,
        password: hashedPassword,
        phone: '3000000000',
        role: UserRole.ADMIN,
      });
      await userRepo.save(admin);
    } else {
      console.log('🌱 Admin user already exists, ensuring ADMIN role...');
      admin.role = UserRole.ADMIN;
      await userRepo.save(admin);
    }

    const userFactory = await factoryManager.get(User);
    // We create 10 dummy users with fake data
    await userFactory.saveMany(10);
    console.log('✅ 10 random users seeded.');
  }
}
