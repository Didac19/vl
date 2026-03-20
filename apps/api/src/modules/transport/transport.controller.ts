import { Controller, Get, Post, Patch, Delete, Body, Query, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import * as Shared from '@via-libre/shared-types';
import { TransportService } from './transport.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('transport')
@Controller('transport')
export class TransportController {
  constructor(private readonly transportService: TransportService) { }

  @Get('routes')
  @ApiOperation({ summary: 'Obtener todas las rutas disponibles (Jerarquía completa)' })
  getRoutes() {
    return this.transportService.findAllRoutes();
  }

  @Get('types')
  @ApiOperation({ summary: 'Obtener solo tipos de transporte' })
  getTypes() {
    return this.transportService.getTransportTypes();
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
  @ApiOperation({ summary: 'Crear tipo de transporte (Solo Admin)' })
  createType(@Body() dto: Shared.CreateTransportTypeDto) {
    return this.transportService.createTransportType(dto);
  }

  @Patch('types/:id')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Shared.UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar tipo de transporte (Solo Admin)' })
  updateType(@Param('id') id: string, @Body() dto: Shared.UpdateTransportTypeDto) {
    return this.transportService.updateTransportType(id, dto);
  }

  @Delete('types/:id')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Shared.UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar tipo de transporte (Solo Admin)' })
  deleteType(@Param('id') id: string) {
    return this.transportService.deleteTransportType(id);
  }

  @Post('routes')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Shared.UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear nueva ruta (Solo Admin)' })
  createRoute(@Body() dto: Shared.CreateRouteDto) {
    return this.transportService.createRoute(dto);
  }

  @Patch('routes/:id')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Shared.UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar ruta (Solo Admin)' })
  updateRoute(@Param('id') id: string, @Body() dto: Shared.UpdateRouteDto) {
    return this.transportService.updateRoute(id, dto);
  }

  @Delete('routes/:id')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Shared.UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar ruta (Solo Admin)' })
  deleteRoute(@Param('id') id: string) {
    return this.transportService.deleteRoute(id);
  }
}
