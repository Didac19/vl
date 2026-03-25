import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { Validator } from './entities/validator.entity';
import { ScannedTicket } from './entities/scanned-ticket.entity';
import { Ticket } from '../ticketing/entities/ticket.entity';
import { CompaniesService } from './companies.service';
import { ValidatorsService } from './validators.service';
import { CompaniesController } from './companies.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Company, Validator, ScannedTicket, Ticket])],
  providers: [CompaniesService, ValidatorsService],
  controllers: [CompaniesController],
  exports: [CompaniesService, ValidatorsService],
})
export class CompaniesModule { }

