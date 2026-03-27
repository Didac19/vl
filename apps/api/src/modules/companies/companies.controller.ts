import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import * as Shared from '@transix/shared-types';
import { CompaniesService } from './companies.service';
import { ValidatorsService } from './validators.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('companies')
@Controller('companies')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly validatorsService: ValidatorsService,
  ) { }

  @Post()
  @Roles(Shared.UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear compañía (Solo Admin)' })
  create(@Body() dto: Shared.CreateCompanyDto) {
    return this.companiesService.create(dto);
  }

  @Get()
  @Roles(Shared.UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar todas las compañías (Solo Admin)' })
  findAll() {
    return this.companiesService.findAll();
  }

  @Get('me')
  @Roles(Shared.UserRole.COMPANY_ADMIN, Shared.UserRole.DRIVER)
  @ApiOperation({ summary: 'Obtener mi compañía' })
  findMyCompany(@GetUser() user: any) {
    if (!user.companyId) throw new Error('Usuario no pertenece a una compañía');
    return this.companiesService.findOne(user.companyId);
  }

  @Get(':id')
  @Roles(Shared.UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener detalle de compañía (Solo Admin)' })
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  // ─── Validators ────────────────────────────────────────────────────────────

  @Post('validators')
  @Roles(Shared.UserRole.ADMIN, Shared.UserRole.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Crear validador' })
  createValidator(@Body() dto: Shared.CreateValidatorDto, @GetUser() user: any) {
    // If Company Admin, enforce their companyId
    if (user.role === Shared.UserRole.COMPANY_ADMIN) {
      dto.companyId = user.companyId;
    }
    return this.validatorsService.create(dto);
  }

  @Get('validators/me')
  @Roles(Shared.UserRole.COMPANY_ADMIN, Shared.UserRole.DRIVER)
  @ApiOperation({ summary: 'Listar mis validadores' })
  findMyValidators(@GetUser() user: any) {
    return this.validatorsService.findAllByCompany(user.companyId);
  }

  @Post('validators/scan')
  @Roles(Shared.UserRole.DRIVER)
  @ApiOperation({ summary: 'Escanear ticket (Solo Driver)' })
  scanTicket(@Body() dto: Shared.ScanTicketDto) {
    return this.validatorsService.scanTicket(dto);
  }

  @Get('validators/:id/scans')
  @Roles(Shared.UserRole.COMPANY_ADMIN, Shared.UserRole.DRIVER)
  @ApiOperation({ summary: 'Ver historial de escaneos' })
  getScans(@Param('id') id: string) {
    return this.validatorsService.getScansByValidator(id);
  }
}
