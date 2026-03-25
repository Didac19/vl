import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { TransportType } from '../../modules/transport/entities/transport-type.entity';
import { Route } from '../../modules/transport/entities/route.entity';
import { Stop } from '../../modules/transport/entities/stop.entity';
import { PointToPointFare } from '../../modules/transport/entities/point-to-point-fare.entity';
import { Company } from '../../modules/companies/entities/company.entity';
import * as Shared from '@via-libre/shared-types';

export default class TransportSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const typeRepo = dataSource.getRepository(TransportType);
    const routeRepo = dataSource.getRepository(Route);
    const stopRepo = dataSource.getRepository(Stop);
    const fareRepo = dataSource.getRepository(PointToPointFare);
    const companyRepo = dataSource.getRepository(Company);

    const transportData = [
      {
        name: 'Cable Aéreo',
        type: 'CABLE_AEREO' as Shared.TransportType,
        companyName: 'Cable Aéreo Manizales',
        fareAmount: 2500,
        requiresRouteSelection: true,
        routes: [
          {
            name: 'Línea Cámbulos',
            pricingStrategy: 'FLAT' as Shared.PricingStrategy,
            baseFare: 2500,
            stops: [
              { name: 'Terminal', lat: 5.0542, lng: -75.4912, order: 1 },
              { name: 'Cámbulos', lat: 5.0589, lng: -75.4956, order: 2 },
              { name: 'Fundadores', lat: 5.0678, lng: -75.5123, order: 3 },
            ],
          },
          {
            name: 'Línea Villamaría (Punto a Punto)',
            pricingStrategy: 'POINT_TO_POINT' as Shared.PricingStrategy,
            baseFare: 2500,
            stops: [
              { name: 'Cámbulos', lat: 5.0589, lng: -75.4956, order: 1 },
              { name: 'Villamaría', lat: 5.0489, lng: -75.5056, order: 2 },
            ],
            fares: [
              { originIdx: 0, destIdx: 1, amount: 2500 },
              { originIdx: 1, destIdx: 0, amount: 2500 },
            ]
          },
        ],
      },
      {
        name: 'Bus Urbano',
        type: 'BUS_URBANO' as Shared.TransportType,
        companyName: 'Sideral S.A.',
        fareAmount: 2500,
        requiresRouteSelection: true,
        routes: [
          {
            name: 'Av. Santander (Sideral)',
            pricingStrategy: 'FLAT' as Shared.PricingStrategy,
            baseFare: 2500,
            stops: [
              { name: 'Milán', lat: 5.0542, lng: -75.4812, order: 1 },
              { name: 'El Cable', lat: 5.0612, lng: -75.4923, order: 2 },
              { name: 'Centro', lat: 5.0689, lng: -75.5178, order: 3 },
            ],
          },
        ],
      },
      {
        name: 'Intermunicipal',
        type: 'INTERMUNICIPAL' as Shared.TransportType,
        companyName: 'Socobuses S.A.',
        fareAmount: 4500,
        requiresRouteSelection: true,
        routes: [
          {
            name: 'Manizales - Chinchiná',
            pricingStrategy: 'POINT_TO_POINT' as Shared.PricingStrategy,
            baseFare: 4500,
            stops: [
              { name: 'Terminal Manizales', lat: 5.0542, lng: -75.4912, order: 1 },
              { name: 'Estación Uribe', lat: 5.0450, lng: -75.5100, order: 2 },
              { name: 'Chinchiná Centro', lat: 4.9812, lng: -75.6034, order: 3 },
            ],
            fares: [
              { originIdx: 0, destIdx: 1, amount: 3000 },
              { originIdx: 0, destIdx: 2, amount: 4500 },
              { originIdx: 1, destIdx: 2, amount: 3500 },
              { originIdx: 2, destIdx: 0, amount: 4500 },
            ]
          }
        ],
      },
      {
        name: 'Buseta / Colectivo',
        type: 'BUSETA' as Shared.TransportType,
        companyName: 'Socobuses S.A.',
        fareAmount: 2700,
        requiresRouteSelection: false,
        routes: [
          {
            name: 'Ruta Barrial Genérica',
            pricingStrategy: 'FLAT' as Shared.PricingStrategy,
            baseFare: 2700,
            stops: []
          }
        ],
      },
    ];

    for (const data of transportData) {
      const company = await companyRepo.findOneBy({ name: data.companyName });

      let transportType = await typeRepo.findOne({
        where: { type: data.type },
        relations: ['routes']
      });

      if (!transportType) {
        console.log(`🌱 Creating Transport Type: ${data.name}`);
        transportType = typeRepo.create({
          name: data.name,
          type: data.type,
          fareAmount: data.fareAmount,
          requiresRouteSelection: data.requiresRouteSelection,
        });
        await typeRepo.save(transportType);
      }

      for (const rData of data.routes) {
        let route = await routeRepo.findOne({
          where: { name: rData.name, transportType: { id: transportType.id } },
          relations: ['stops']
        });

        if (!route) {
          console.log(`  + Creating Route: ${rData.name}`);
          route = routeRepo.create({
            name: rData.name,
            transportType: transportType,
            pricingStrategy: rData.pricingStrategy,
            baseFare: rData.baseFare,
            company: company || undefined
          });
          await routeRepo.save(route);

          const savedStops: Stop[] = [];
          for (const sData of rData.stops) {
            const stop = stopRepo.create({
              ...sData,
              route: route
            });
            savedStops.push(await stopRepo.save(stop));
          }

          if (rData.pricingStrategy === 'POINT_TO_POINT' && (rData as any).fares) {
            for (const fData of (rData as any).fares) {
              const fare = fareRepo.create({
                route: route,
                originStop: savedStops[fData.originIdx],
                destinationStop: savedStops[fData.destIdx],
                fareAmount: fData.amount
              });
              await fareRepo.save(fare);
            }
          }
        } else {
          // Update existing route with company if missing
          if (!route.company && company) {
            route.company = company;
            await routeRepo.save(route);
          }
        }
      }
    }
  }
}
