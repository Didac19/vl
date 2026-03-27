import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import {
  TransportTypeDto,
  PointToPointFareDto,
  CreateTransportTypeDto,
  UpdateTransportTypeDto,
  CreateRouteDto,
  UpdateRouteDto
} from '@transix/shared-types';
import { TransportType } from './entities/transport-type.entity';
import { Route } from './entities/route.entity';
import { Stop } from './entities/stop.entity';
import { PointToPointFare } from './entities/point-to-point-fare.entity';

@Injectable()
export class TransportService {
  constructor(
    @InjectRepository(TransportType)
    private readonly transportTypeRepo: Repository<TransportType>,
    @InjectRepository(Route)
    private readonly routeRepo: Repository<Route>,
    @InjectRepository(Stop)
    private readonly stopRepo: Repository<Stop>,
    @InjectRepository(PointToPointFare)
    private readonly fareRepo: Repository<PointToPointFare>,
    private readonly dataSource: DataSource,
  ) { }

  async findAllRoutes(companyId?: string): Promise<TransportTypeDto[]> {
    const query: any = {
      relations: ['routes', 'routes.stops', 'routes.company'],
      order: { name: 'ASC' },
    };

    const types = await this.transportTypeRepo.find(query);

    return types.map((type) => ({
      id: type.id,
      name: type.name,
      type: type.type,
      fareAmount: Number(type.fareAmount),
      requiresRouteSelection: type.requiresRouteSelection,
      routes: type.routes
        .filter((route) => !companyId || route.company?.id === companyId)
        .map((route) => ({
          id: route.id,
          name: route.name,
          pricingStrategy: route.pricingStrategy,
          baseFare: Number(route.baseFare),
          stops: route.stops
            .sort((a, b) => a.order - b.order)
            .map((stop) => ({
              id: stop.id,
              name: stop.name,
              lat: Number(stop.lat),
              lng: Number(stop.lng),
              order: stop.order,
            })),
        })),
    }));
  }

  async getTransportTypes(): Promise<TransportType[]> {
    return this.transportTypeRepo.find({ order: { name: 'ASC' } });
  }

  async createTransportType(dto: CreateTransportTypeDto): Promise<TransportType> {
    const type = this.transportTypeRepo.create(dto);
    return this.transportTypeRepo.save(type);
  }

  async updateTransportType(id: string, dto: UpdateTransportTypeDto): Promise<TransportType> {
    const type = await this.transportTypeRepo.findOneBy({ id });
    if (!type) throw new NotFoundException('Transport type not found');
    Object.assign(type, dto);
    return this.transportTypeRepo.save(type);
  }

  async deleteTransportType(id: string): Promise<void> {
    const result = await this.transportTypeRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Transport type not found');
  }

  async createRoute(dto: CreateRouteDto, companyId?: string): Promise<Route> {
    const transportType = await this.transportTypeRepo.findOneBy({ id: dto.transportTypeId });
    if (!transportType) throw new NotFoundException('Transport type not found');

    return this.dataSource.transaction(async (manager) => {
      const route = manager.create(Route, {
        name: dto.name,
        pricingStrategy: dto.pricingStrategy,
        baseFare: dto.baseFare,
        transportType,
        company: companyId ? { id: companyId } : undefined,
      });
      const savedRoute = await manager.save(Route, route);

      const savedStops: Stop[] = [];
      if (dto.stops) {
        for (const s of dto.stops) {
          const stop = manager.create(Stop, { ...s, route: savedRoute });
          savedStops.push(await manager.save(Stop, stop));
        }
      }

      if (dto.pricingStrategy === 'POINT_TO_POINT' && dto.fares) {
        for (const f of dto.fares) {
          const fare = manager.create(PointToPointFare, {
            route: savedRoute,
            originStop: savedStops[f.originStopIndex],
            destinationStop: savedStops[f.destinationStopIndex],
            fareAmount: f.fareAmount,
          });
          await manager.save(PointToPointFare, fare);
        }
      }

      return savedRoute;
    });
  }

  async updateRoute(id: string, dto: UpdateRouteDto, companyId?: string): Promise<Route> {
    const route = await this.routeRepo.findOne({
      where: { id },
      relations: ['stops', 'fareTable', 'company'],
    });
    if (!route) throw new NotFoundException('Route not found');

    if (companyId && route.company?.id !== companyId) {
      throw new BadRequestException('You do not have permission to modify this route');
    }

    return this.dataSource.transaction(async (manager) => {
      if (dto.name) route.name = dto.name;
      if (dto.pricingStrategy) route.pricingStrategy = dto.pricingStrategy;
      if (dto.baseFare !== undefined) route.baseFare = dto.baseFare;

      const savedRoute = await manager.save(Route, route);

      if (dto.stops) {
        // Simple approach: replace all stops if provided
        // In a real production app, we might want to be more surgical (delete missing, update existing)
        await manager.delete(Stop, { route: { id } });
        const savedStops: Stop[] = [];
        for (const s of dto.stops) {
          const stop = manager.create(Stop, {
            name: s.name,
            lat: s.lat,
            lng: s.lng,
            order: s.order,
            route: savedRoute
          });
          savedStops.push(await manager.save(Stop, stop));
        }

        if (dto.pricingStrategy === 'POINT_TO_POINT' || (route.pricingStrategy === 'POINT_TO_POINT' && !dto.pricingStrategy)) {
          await manager.delete(PointToPointFare, { route: { id } });
          if (dto.fares) {
            for (const f of dto.fares) {
              const fare = manager.create(PointToPointFare, {
                route: savedRoute,
                originStop: savedStops[f.originStopIndex],
                destinationStop: savedStops[f.destinationStopIndex],
                fareAmount: f.fareAmount,
              });
              await manager.save(PointToPointFare, fare);
            }
          }
        }
      }

      return savedRoute;
    });
  }

  async deleteRoute(id: string, companyId?: string): Promise<void> {
    const route = await this.routeRepo.findOne({
      where: { id },
      relations: ['company'],
    });
    if (!route) throw new NotFoundException('Route not found');

    if (companyId && route.company?.id !== companyId) {
      throw new BadRequestException('You do not have permission to delete this route');
    }

    await this.routeRepo.delete(id);
  }

  async getFaresForRoute(routeId: string): Promise<PointToPointFareDto[]> {
    const fares = await this.fareRepo.find({
      where: { route: { id: routeId } },
      relations: ['originStop', 'destinationStop', 'route'],
    });

    return fares.map((fare) => ({
      id: fare.id,
      routeId: fare.route.id,
      originStopId: fare.originStop.id,
      destinationStopId: fare.destinationStop.id,
      fareAmount: Number(fare.fareAmount),
    }));
  }

  async findNearbyStations(lat: number, lng: number) {
    const radius = 5; // 5km search radius

    // First, find IDs of routes that have at least one stop nearby
    const nearbyRouteIds = await this.stopRepo
      .createQueryBuilder('stop')
      .select('DISTINCT stop.routeId', 'routeId')
      .where(
        `6371 * acos(
          cos(radians(:lat)) * cos(radians(stop.lat)) *
          cos(radians(stop.lng) - radians(:lng)) +
          sin(radians(:lat)) * sin(radians(stop.lat))
        ) <= :radius`,
        { lat, lng, radius },
      )
      .getRawMany();

    if (nearbyRouteIds.length === 0) return [];

    const ids = nearbyRouteIds.map(r => r.routeId);

    // Then fetch full details for these routes
    const routes = await this.routeRepo.find({
      where: { id: In(ids) },
      relations: ['stops', 'transportType'],
      order: {
        stops: {
          order: 'ASC'
        }
      }
    });

    return routes;
  }
}
