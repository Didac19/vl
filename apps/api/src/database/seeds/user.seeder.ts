import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { User } from '../../modules/users/entities/user.entity';
import { Company } from '../../modules/companies/entities/company.entity';
import { UserRole } from '@transix/shared-types';
import * as bcrypt from 'bcryptjs';
import { Wallet } from '@/modules/wallet/entities/wallet.entity';

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
    let admin = await userRepo.findOne({ where: { email: adminEmail }, relations: ['wallet'] });
    if (!admin) {
      console.log('🌱 Creating admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      admin = userRepo.create({
        fullName: 'Admin TranSix',
        email: adminEmail,
        password: hashedPassword,
        phone: '3000000000',
        role: UserRole.ADMIN,
      });
    }
    if (!admin.wallet) {
      admin.wallet = new Wallet();
      admin.wallet.balance = 0;
      admin.wallet.currency = 'COP';
      await userRepo.save(admin);
    }

    // Get a company for testing
    const cableAereo = await companyRepo.findOneBy({ name: 'Cable Aéreo Manizales' });

    if (cableAereo) {
      // Create a Company Admin
      const coAdminEmail = 'manager@cableaereo.com';
      let coAdmin = await userRepo.findOne({ where: { email: coAdminEmail }, relations: ['wallet'] });
      if (!coAdmin) {
        console.log('🌱 Creating Company Admin for Cable Aéreo...');
        coAdmin = userRepo.create({
          fullName: 'Gerente Cable Aéreo',
          email: coAdminEmail,
          password: await bcrypt.hash('cable123', 10),
          role: UserRole.COMPANY_ADMIN,
          company: cableAereo,
        });
      }
      if (!coAdmin.wallet || !coAdmin.company) {
        if (!coAdmin.wallet) {
          coAdmin.wallet = new Wallet();
          coAdmin.wallet.balance = 0;
          coAdmin.wallet.currency = 'COP';
        }
        coAdmin.company = cableAereo;
        await userRepo.save(coAdmin);
      }

      // Create a Driver
      const driverEmail = 'conductor@cableaereo.com';
      let driver = await userRepo.findOne({ where: { email: driverEmail }, relations: ['wallet'] });
      if (!driver) {
        console.log('🌱 Creating Driver for Cable Aéreo...');
        driver = userRepo.create({
          fullName: 'Operario Cable Aéreo',
          email: driverEmail,
          password: await bcrypt.hash('driver123', 10),
          role: UserRole.VALIDATOR,
          company: cableAereo,
        });
      }
      if (!driver.wallet || !driver.company) {
        if (!driver.wallet) {
          driver.wallet = new Wallet();
          driver.wallet.balance = 0;
          driver.wallet.currency = 'COP';
        }
        driver.company = cableAereo;
        await userRepo.save(driver);
      }
    }

    // Create a normal test user
    const userEmail = 'user@vialibre.com';
    let normalUser = await userRepo.findOne({ where: { email: userEmail }, relations: ['wallet'] });
    if (!normalUser) {
      console.log('🌱 Creating normal test user...');
      const hashedPassword = await bcrypt.hash('user123', 10);
      normalUser = userRepo.create({
        fullName: 'Diego Viajero',
        email: userEmail,
        password: hashedPassword,
        phone: '3110000000',
        role: UserRole.USER,
      });
    }
    if (!normalUser.wallet) {
      normalUser.wallet = new Wallet();
      normalUser.wallet.balance = 0;
      normalUser.wallet.currency = 'COP';
      await userRepo.save(normalUser);
    }

    const userFactory = await factoryManager.get(User);
    // ...

    // We create 10 dummy users with fake data
    await userFactory.saveMany(10);
    console.log('✅ 10 random users seeded.');
  }
}
