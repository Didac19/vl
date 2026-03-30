import {
  Controller,
  Get,
  Post,
  Body,
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

@ApiTags('tickets')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('tickets')
export class TicketingController {
  constructor(private readonly ticketingService: TicketingService) {}

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
      dto.tripId,
      dto.amount,
    );
  }
}
