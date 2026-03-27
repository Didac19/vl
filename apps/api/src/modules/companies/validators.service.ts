import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Validator } from './entities/validator.entity';
import { ScannedTicket } from './entities/scanned-ticket.entity';
import { Ticket } from '../ticketing/entities/ticket.entity';
import { CreateValidatorDto, ScanTicketDto } from '@transix/shared-types';

@Injectable()
export class ValidatorsService {
  constructor(
    @InjectRepository(Validator)
    private readonly validatorRepo: Repository<Validator>,
    @InjectRepository(ScannedTicket)
    private readonly scannedRepo: Repository<ScannedTicket>,
    @InjectRepository(Ticket)
    private readonly ticketRepo: Repository<Ticket>,
  ) { }

  async create(dto: CreateValidatorDto) {
    const validator = this.validatorRepo.create({
      ...dto,
      company: { id: dto.companyId },
    });
    return this.validatorRepo.save(validator);
  }

  async findAllByCompany(companyId: string) {
    return this.validatorRepo.find({
      where: { company: { id: companyId } },
      order: { name: 'ASC' },
    });
  }

  async scanTicket(dto: ScanTicketDto) {
    const ticket = await this.ticketRepo.findOne({ where: { id: dto.ticketId } });
    if (!ticket) throw new NotFoundException('Ticket no encontrado');

    const validator = await this.validatorRepo.findOne({ where: { id: dto.validatorId } });
    if (!validator) throw new NotFoundException('Validador no encontrado');

    // Check if already scanned
    const existing = await this.scannedRepo.findOne({
      where: { ticket: { id: dto.ticketId } },
    });
    if (existing) throw new BadRequestException('Ticket ya fue validado previamente');

    const scan = this.scannedRepo.create({
      ticket,
      validator,
      lat: dto.lat,
      lng: dto.lng,
      scannedAt: new Date(dto.scannedAt),
    });

    // Update ticket status
    ticket.status = 'USED';
    await this.ticketRepo.save(ticket);

    return this.scannedRepo.save(scan);
  }

  async getScansByValidator(validatorId: string) {
    return this.scannedRepo.find({
      where: { validator: { id: validatorId } },
      relations: ['ticket'],
      order: { scannedAt: 'DESC' },
    });
  }
}
