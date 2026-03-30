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
import { IsString } from 'class-validator';
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
}
