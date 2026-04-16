import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';
import { Wallet } from '@/modules/wallet/entities/wallet.entity';
import { UserRole } from '@transix/shared-types';
import * as bcrypt from 'bcryptjs';

export default class AdminSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    _factoryManager: SeederFactoryManager
  ): Promise<void> {
    const repository = dataSource.getRepository(User);

    const email = process.env.ADMIN_EMAIL || 'admin@vialibre.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin123!';

    const existingAdmin = await repository.findOne({ where: { email }, relations: ['wallet'] });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const admin = repository.create({
        fullName: 'TranSix Admin',
        email,
        password: hashedPassword,
        phone: '3000000000',
        role: UserRole.ADMIN,
      });

      const wallet = new Wallet();
      wallet.balance = 0;
      wallet.currency = 'COP';
      admin.wallet = wallet;

      await repository.save(admin);
      console.log('✅ Admin user seeded.');
    } else if (!existingAdmin.wallet) {
      console.log('ℹ️ Adding missing wallet to existing Admin...');
      const wallet = new Wallet();
      wallet.balance = 0;
      wallet.currency = 'COP';
      existingAdmin.wallet = wallet;
      await repository.save(existingAdmin);
    } else {
      console.log('ℹ️ Admin user already exists with wallet.');
    }
  }
}
