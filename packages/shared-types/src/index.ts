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
  USER: 'USER',
  DRIVER: 'DRIVER',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// ─── User ──────────────────────────────────────────────────────────────────
export interface UserDto {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
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
export type TransportType = 'TRANSMILENIO' | 'SITP' | 'COOPERATIVA' | 'MICROBUS';

export interface RouteSearchDto {
  originLat: number;
  originLng: number;
  destinationLat: number;
  destinationLng: number;
}

export interface RouteOptionDto {
  id: string;
  transportType: TransportType;
  name: string;
  estimatedMinutes: number;
  fareAmount: number; // COP cents
  stops: StopDto[];
}

export interface StopDto {
  id: string;
  name: string;
  lat: number;
  lng: number;
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
