import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { Route } from '../transport/entities/route.entity';
import { TicketingService } from './ticketing.service';
import { TicketingController } from './ticketing.controller';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, Route]), WalletModule],
  providers: [TicketingService],
  controllers: [TicketingController],
  exports: [TicketingService],
})
export class TicketingModule {}
