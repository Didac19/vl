import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { TransportModule } from './modules/transport/transport.module';
import { TicketingModule } from './modules/ticketing/ticketing.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CompaniesModule } from './modules/companies/companies.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // ... config, database, throttler, cache modules ...
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        url: cfg.get<string>('DATABASE_URL'),
        entities: [__dirname + '/modules/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        synchronize: cfg.get<string>('NODE_ENV') === 'development', // NEVER in prod
        logging: cfg.get<string>('NODE_ENV') === 'development',
      }),
    }),

    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 5 }, // 5 req/sec
      { name: 'medium', ttl: 60_000, limit: 100 }, // 100 req/min
    ]),

    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (cfg: ConfigService) => ({
        ttl: 60_000, // 1 minute default
      }),
    }),

    AuthModule,
    UsersModule,
    WalletModule,
    TransportModule,
    TicketingModule,
    NotificationsModule,
    CompaniesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
