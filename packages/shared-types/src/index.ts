// ─── Auth ──────────────────────────────────────────────────────────────────
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  fullName: string;
  email: string;
  password: string;
  phone: string;
}

export interface AuthTokensDto {
  accessToken: string;
  refreshToken: string;
}

export const UserRole = {
  ADMIN: 'ADMIN',
  COMPANY_ADMIN: 'COMPANY_ADMIN',
  DRIVER: 'DRIVER',
  USER: 'USER',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// ─── Company ───────────────────────────────────────────────────────────────
export interface CompanyDto {
  id: string;
  name: string;
  nit: string;
  address?: string;
  phone?: string;
  createdAt: string;
}

export interface CreateCompanyDto {
  name: string;
  nit: string;
  address?: string;
  phone?: string;
}

// ─── Validator ─────────────────────────────────────────────────────────────
export interface ValidatorDto {
  id: string;
  deviceId: string;
  name: string;
  companyId: string;
  lastSyncAt?: string;
}

export interface CreateValidatorDto {
  deviceId: string;
  name: string;
  companyId: string;
}

export interface ScanTicketDto {
  ticketId: string;
  validatorId: string;
  scannedAt: string;
  lat?: number;
  lng?: number;
}

// ─── User ──────────────────────────────────────────────────────────────────
export interface UserDto {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  companyId?: string;
  createdAt: string;
}

// ─── Wallet ────────────────────────────────────────────────────────────────
export interface WalletDto {
  id: string;
  balance: number; // in COP cents
  currency: 'COP';
}

export interface TransactionDto {
  id: string;
  walletId: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string;
  createdAt: string;
}

export interface TopUpWalletDto {
  amount: number; // COP cents
  paymentMethodId: string;
}

// ─── Transport ─────────────────────────────────────────────────────────────
export type TransportType = 'CABLE_AEREO' | 'BUS_URBANO' | 'BUSETA' | 'INTERMUNICIPAL' | 'TRANSMILENIO' | 'SITP' | 'COOPERATIVA' | 'MICROBUS';
export type PricingStrategy = 'FLAT' | 'POINT_TO_POINT';

export interface RouteSearchDto {
  originLat: number;
  originLng: number;
  destinationLat: number;
  destinationLng: number;
}

export interface TransportTypeDto {
  id: string;
  name: string;
  type: TransportType;
  fareAmount: number; // Default/Base fare
  requiresRouteSelection: boolean;
  routes: RouteDto[];
}

export interface RouteDto {
  id: string;
  name: string;
  pricingStrategy: PricingStrategy;
  baseFare: number;
  stops: StopDto[];
}

export interface StopDto {
  id: string;
  name: string;
  lat: number;
  lng: number;
  order: number;
}

export interface PointToPointFareDto {
  id: string;
  routeId: string;
  originStopId: string;
  destinationStopId: string;
  fareAmount: number;
}

// ─── Admin DTOs ────────────────────────────────────────────────────────────
export interface CreateTransportTypeDto {
  name: string;
  type: TransportType;
  fareAmount: number;
  requiresRouteSelection: boolean;
}

export interface UpdateTransportTypeDto extends Partial<CreateTransportTypeDto> { }

export interface CreateStopDto {
  name: string;
  lat: number;
  lng: number;
  order: number;
}

export interface CreatePointToPointFareDto {
  originStopIndex: number; // reference by index in the stops array for new routes
  destinationStopIndex: number;
  fareAmount: number;
}

export interface CreateRouteDto {
  transportTypeId: string;
  name: string;
  pricingStrategy: PricingStrategy;
  baseFare: number;
  stops?: CreateStopDto[];
  fares?: CreatePointToPointFareDto[];
}

export interface UpdateRouteDto {
  name?: string;
  pricingStrategy?: PricingStrategy;
  baseFare?: number;
  stops?: (CreateStopDto & { id?: string })[];
  fares?: (CreatePointToPointFareDto & { id?: string; originStopId?: string; destinationStopId?: string })[];
}

// ─── Ticketing ─────────────────────────────────────────────────────────────
export type TicketStatus = 'ISSUED' | 'USED' | 'EXPIRED' | 'CANCELLED';

export interface TicketDto {
  id: string;
  userId: string;
  routeId: string;
  transportType: TransportType;
  routeName: string;
  fareAmount: number;
  status: TicketStatus;
  qrToken: string; // signed JWS — used to generate QR offline
  issuedAt: string;
  expiresAt: string;
}

export interface PurchaseTicketDto {
  routeId: string;
  walletId: string;
}

// ─── Common ────────────────────────────────────────────────────────────────
export interface PaginatedResponseDto<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiErrorDto {
  statusCode: number;
  message: string;
  error: string;
}
