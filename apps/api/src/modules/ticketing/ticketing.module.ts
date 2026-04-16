import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { Route } from '../transport/entities/route.entity';
import { BoardingLog } from './entities/boarding-log.entity';
import { BusQr } from './entities/bus-qr.entity';
import { User } from '../users/entities/user.entity';
import { TicketingService } from './ticketing.service';
import { TicketingController } from './ticketing.controller';
import { WalletModule } from '../wallet/wallet.module';
import { TransportModule } from '../transport/transport.module';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, Route, BoardingLog, BusQr, User]), WalletModule, TransportModule],
  providers: [TicketingService],
  controllers: [TicketingController],
  exports: [TicketingService],
})
export class TicketingModule {}
