import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { CreateCompanyDto } from '@transix/shared-types';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) { }

  async create(dto: CreateCompanyDto) {
    const existing = await this.companyRepo.findOne({ where: { nit: dto.nit } });
    if (existing) throw new ConflictException('Una compañía con este NIT ya existe');

    const company = this.companyRepo.create(dto);
    return this.companyRepo.save(company);
  }

  async findAll() {
    return this.companyRepo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string) {
    const company = await this.companyRepo.findOne({
      where: { id },
      relations: ['users', 'routes', 'validators'],
    });
    if (!company) throw new NotFoundException('Compañía no encontrada');
    return company;
  }

  async update(id: string, dto: Partial<CreateCompanyDto>) {
    const company = await this.findOne(id);
    Object.assign(company, dto);
    return this.companyRepo.save(company);
  }

  async remove(id: string) {
    const company = await this.findOne(id);
    return this.companyRepo.remove(company);
  }
}
