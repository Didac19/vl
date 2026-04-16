import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { TicketingService } from './ticketing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@transix/shared-types';
import { ListQuery } from '../../common/decorators/list-query.decorator';
import { ListQueryDto } from '../../common/dto/list-query.dto';

class PurchaseTicketDto {
  @IsString() routeId: string;
}

class ScanTicketDto {
  @IsString() qrToken: string;
}

class ConfirmBoardingDto {
  @IsString()
  @IsOptional()
  routeId?: string;

  @IsString()
  @IsOptional()
  tripId?: string;

  @IsNumber()
  @IsOptional()
  amount?: number;
}

class GenerateBusQrDto {
  @IsString() busId: string;
  @IsNumber() amount: number;
  @IsString() @IsOptional() routeId?: string;
  @IsOptional() newRoute?: {
    name: string;
    transportTypeId: string;
    baseFare: number;
  };
}

class PayBusQrDto {
  @IsString() token: string;
  @IsNumber() quantity: number;
}

@ApiTags('tickets')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('tickets')
export class TicketingController {
  constructor(private readonly ticketingService: TicketingService) {
    console.log('✅ TicketingController initialized');
  }

  @Get('routes')
  @ApiOperation({ summary: 'Listar rutas disponibles (mock)' })
  getRoutes() {
    return this.ticketingService.getAvailableRoutes();
  }

  @Get('my-tickets')
  @ApiOperation({ summary: 'Mis pasajes activos e historial' })
  getMyTickets(@Request() req: any) {
    return this.ticketingService.getMyTickets(req.user.id);
  }

  @Get('validator-config')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VALIDATOR, UserRole.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Obtener configuración para el validador (rutas y Bre-B)' })
  async getValidatorConfig(@Request() req: any) {
    // We assume the user has a company_id
    const user = req.user;
    // We need to fetch the user with company to get the breBCode
    // For simplicity, let's just use the service but we might need a UsersService.
    // Actually, TicketingService can have a method for this or we can inject CompanyRepo.
    
    // Let's assume we want to return routes and the Bre-B code of the company.
    // I will add a method to TicketingService for this.
    return this.ticketingService.getValidatorConfig(user.id);
  }

  @Post('purchase')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Comprar un pasaje y generar código QR' })
  purchase(@Request() req: any, @Body() dto: PurchaseTicketDto) {
    return this.ticketingService.purchaseTicket(req.user.id, dto.routeId);
  }

  @Post('scan')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VALIDATOR, UserRole.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Validar un pasaje escaneando el código QR' })
  scan(@Body() dto: ScanTicketDto) {
    return this.ticketingService.verifyScan(dto.qrToken);
  }

  @Post('confirm-boarding')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VALIDATOR, UserRole.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Registrar abordo confirmado visualmente' })
  confirmBoarding(@Request() req: any, @Body() dto: ConfirmBoardingDto) {
    return this.ticketingService.confirmBoarding(
      req.user.id,
      dto.routeId,
      undefined,
      dto.amount,
    );
  }

  @Post('generate-bus-qr')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Generar múltiples códigos QR para buses (Solo Admin/Company Admin)' })
  generateBusQr(@Request() req: any, @Body() dto: GenerateBusQrDto) {
    return this.ticketingService.generateBusQr(req.user, dto);
  }

  @Post('pay-bus-qr')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pagar pasaje escaneando código QR de bus' })
  payBusQr(@Request() req: any, @Body() dto: PayBusQrDto) {
    return this.ticketingService.payBusQr(req.user.id, dto);
  }

  @Get('company-bus-qrs')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Listar QRs de bus generados por la empresa del admin' })
  async getCompanyBusQrs(@Request() req: any) {
    const user = await this.ticketingService['userRepo'].findOne({
      where: { id: req.user.id },
      relations: ['company'],
    });
    if (!user?.company) return [];
    return this.ticketingService.getCompanyBusQrs(user.company.id);
  }

  @Get('bus-qr/:id/payments')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Ver pagos/recaudación de un QR de bus específico (Filtros dinámicos)' })
  async getQrPayments(@Param('id') id: string, @Request() req: any, @ListQuery() query: ListQueryDto) {
    const user = await this.ticketingService['userRepo'].findOne({
      where: { id: req.user.id },
      relations: ['company'],
    });
    if (!user?.company) return { data: [], total: 0, page: 1, limit: 10 };
    return this.ticketingService.getQrPayments(id, user.company.id, query);
  }
}
