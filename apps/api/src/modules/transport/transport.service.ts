import { Injectable } from '@nestjs/common';

@Injectable()
export class TransportService {
  // En fase 3 esto consumirá APIs de Transmilenio/SITP
  async findAllRoutes() {
    return [
      {
        id: 'tm-b01',
        name: 'Portal Norte - Germania',
        type: 'TRANSMILENIO',
        fare: 2950,
        stops: [
          { name: 'Portal Norte', lat: 4.7554, lng: -74.0452 },
          { name: 'Calle 100', lat: 4.6757, lng: -74.0559 },
          { name: 'Germania', lat: 4.6028, lng: -74.0721 },
        ],
      },
      {
        id: 'sitp-302',
        name: 'Usaquén - San Cristóbal',
        type: 'SITP',
        fare: 2950,
        stops: [],
      },
    ];
  }

  async findNearbyStations(lat: number, lng: number) {
    return [
      { name: 'Estación Calle 85', distance: '350m', type: 'TRANSMILENIO' },
      { name: 'Paradero Cll 82', distance: '120m', type: 'SITP' },
    ];
  }
}
