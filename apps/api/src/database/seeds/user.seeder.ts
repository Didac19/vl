import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { User } from '../../modules/users/entities/user.entity';
import { Company } from '../../modules/companies/entities/company.entity';
import { UserRole } from '@via-libre/shared-types';
import * as bcrypt from 'bcryptjs';

export default class UserSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager
  ): Promise<void> {
    const userRepo = dataSource.getRepository(User);
    const companyRepo = dataSource.getRepository(Company);

    // Create a known admin user
    // ... (existing admin logic)
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
    }

    // Get a company for testing
    const cableAereo = await companyRepo.findOneBy({ name: 'Cable Aéreo Manizales' });

    if (cableAereo) {
      // Create a Company Admin
      const coAdminEmail = 'manager@cableaereo.com';
      let coAdmin = await userRepo.findOneBy({ email: coAdminEmail });
      if (!coAdmin) {
        console.log('🌱 Creating Company Admin for Cable Aéreo...');
        coAdmin = userRepo.create({
          fullName: 'Gerente Cable Aéreo',
          email: coAdminEmail,
          password: await bcrypt.hash('cable123', 10),
          role: UserRole.COMPANY_ADMIN,
          company: cableAereo,
        });
        await userRepo.save(coAdmin);
      }

      // Create a Driver
      const driverEmail = 'conductor@cableaereo.com';
      let driver = await userRepo.findOneBy({ email: driverEmail });
      if (!driver) {
        console.log('🌱 Creating Driver for Cable Aéreo...');
        driver = userRepo.create({
          fullName: 'Operario Cable Aéreo',
          email: driverEmail,
          password: await bcrypt.hash('driver123', 10),
          role: UserRole.DRIVER,
          company: cableAereo,
        });
        await userRepo.save(driver);
      }
    }

    const userFactory = await factoryManager.get(User);
    // ...

    // We create 10 dummy users with fake data
    await userFactory.saveMany(10);
    console.log('✅ 10 random users seeded.');
  }
}
