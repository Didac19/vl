import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransportService } from './transport.service';
import { TransportController } from './transport.controller';
import { Route } from './entities/route.entity';
import { Stop } from './entities/stop.entity';
import { TransportType } from './entities/transport-type.entity';
import { PointToPointFare } from './entities/point-to-point-fare.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TransportType, Route, Stop, PointToPointFare])],
  providers: [TransportService],
  controllers: [TransportController],
  exports: [TransportService],
})
export class TransportModule { }
