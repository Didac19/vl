import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TransportService } from './transport.service';

@ApiTags('transport')
@Controller('transport')
export class TransportController {
  constructor(private readonly transportService: TransportService) {}

  @Get('routes')
  @ApiOperation({ summary: 'Obtener todas las rutas disponibles' })
  getRoutes() {
    return this.transportService.findAllRoutes();
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Buscar estaciones cercanas a una ubicación' })
  getNearby(@Query('lat') lat: number, @Query('lng') lng: number) {
    return this.transportService.findNearbyStations(lat, lng);
  }
}
