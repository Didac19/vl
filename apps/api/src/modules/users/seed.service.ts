import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users.service';
import { UserRole } from '@transix/shared-types';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) { }

  async onModuleInit() {
    // We check for environment variable OR a specific CLI argument --seed-admin
    const seedEnabled = this.configService.get<boolean>('ENABLE_SEEDING', false);
    const forceSeed = process.argv.includes('--seed-admin');

    if (seedEnabled || forceSeed) {
      await this.seedAdmin();
    }
  }

  private async seedAdmin() {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL', 'admin@vialibre.com');
    const adminPass = this.configService.get<string>('ADMIN_PASSWORD', 'Admin123!');

    this.logger.log('Checking for admin user...');

    const existingAdmin = await this.usersService.findByEmail(adminEmail);
    if (existingAdmin) {
      this.logger.log('Admin user already exists.');
      return;
    }

    this.logger.log('Creating admin user...');

    await this.usersService.create({
      fullName: 'TranSix Admin',
      email: adminEmail,
      password: adminPass,
      phone: '3000000000',
      role: UserRole.ADMIN,
    });

    this.logger.log(`Admin user created: ${adminEmail}`);
  }
}
