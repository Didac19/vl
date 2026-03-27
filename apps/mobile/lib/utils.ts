import { RouteDto } from '@transix/shared-types';

/**
 * Returns a descriptive name for a route.
 * If the route name is generic or empty, it uses the first and last stops.
 */
export const getRouteDisplayName = (route: Partial<RouteDto> | undefined | null) => {
  if (!route) return 'Ruta';

  const name = route.name?.trim();
  const isGeneric = !name || name.toLowerCase() === 'ruta' || /^ruta\s*\d+$/i.test(name);

  if (!isGeneric) return name;

  const stops = route.stops || [];
  if (stops.length >= 2) {
    const origin = stops[0].name || 'Origen';
    const destination = stops[stops.length - 1].name || 'Destino';
    return `${origin} ➡ ${destination}`;
  }

  if (stops.length === 1) {
    return `Hacia ${stops[0].name || 'Destino'}`;
  }

  return name || 'Ruta sin nombre';
};
