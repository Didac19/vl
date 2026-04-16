import { Controller, Get, Post, Patch, Delete, Body, Query, UseGuards, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import * as Shared from '@transix/shared-types';
import { TransportService } from './transport.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { ListQuery } from '../../common/decorators/list-query.decorator';
import { ListQueryDto } from '../../common/dto/list-query.dto';

@ApiTags('transport')
@Controller('transport')
export class TransportController {
  constructor(private readonly transportService: TransportService) { }

  // ... (getRoutes, getTypes, getRouteFares, getNearby) ...
  @Get('routes')
  @ApiOperation({ summary: 'Obtener todas las rutas disponibles (Jerarquía completa)' })
  getRoutes(@Query('companyId') companyId?: string) {
    return this.transportService.findAllRoutes(companyId);
  }

  @Get('types')
  @ApiOperation({ summary: 'Obtener solo tipos de transporte (Filtros dinámicos)' })
  getTypes(@ListQuery() query: ListQueryDto) {
    return this.transportService.getTransportTypes(query);
  }

  @Get('routes/:id/fares')
  @ApiOperation({ summary: 'Obtener tabla de tarifas para una ruta específica' })
  getRouteFares(@Param('id') id: string) {
    return this.transportService.getFaresForRoute(id);
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Buscar estaciones cercanas a una ubicación' })
  getNearby(@Query('lat') lat: number, @Query('lng') lng: number) {
    return this.transportService.findNearbyStations(lat, lng);
  }

  // ─── Admin Endpoints ───────────────────────────────────────────────────────

  @Post('types')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Shared.UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear tipo de transporte (Solo SuperAdmin)' })
  createType(@Body() dto: Shared.CreateTransportTypeDto) {
    return this.transportService.createTransportType(dto);
  }

  @Patch('types/:id')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Shared.UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar tipo de transporte (Solo SuperAdmin)' })
  updateType(@Param('id') id: string, @Body() dto: Shared.UpdateTransportTypeDto) {
    return this.transportService.updateTransportType(id, dto);
  }

  @Delete('types/:id')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Shared.UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar tipo de transporte (Solo SuperAdmin)' })
  deleteType(@Param('id') id: string) {
    return this.transportService.deleteTransportType(id);
  }

  @Post('routes')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Shared.UserRole.ADMIN, Shared.UserRole.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Crear nueva ruta (Admin o Company Admin)' })
  createRoute(@Body() dto: Shared.CreateRouteDto, @GetUser() user: any) {
    const companyId = user.role === Shared.UserRole.COMPANY_ADMIN ? user.companyId : undefined;
    return this.transportService.createRoute(dto, companyId);
  }

  @Patch('routes/:id')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Shared.UserRole.ADMIN, Shared.UserRole.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Actualizar ruta (Admin o Company Admin)' })
  updateRoute(@Param('id') id: string, @Body() dto: Shared.UpdateRouteDto, @GetUser() user: any) {
    const companyId = user.role === Shared.UserRole.COMPANY_ADMIN ? user.companyId : undefined;
    return this.transportService.updateRoute(id, dto, companyId);
  }

  @Delete('routes/:id')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Shared.UserRole.ADMIN, Shared.UserRole.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Eliminar ruta (Admin o Company Admin)' })
  deleteRoute(@Param('id') id: string, @GetUser() user: any) {
    const companyId = user.role === Shared.UserRole.COMPANY_ADMIN ? user.companyId : undefined;
    return this.transportService.deleteRoute(id, companyId);
  }
}
