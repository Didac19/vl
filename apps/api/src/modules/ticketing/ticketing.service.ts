import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { SignJWT, importPKCS8 } from 'jose';
import { Ticket, TransportType } from './entities/ticket.entity';
import { WalletService } from '../wallet/wallet.service';

// Mock route data — replace with TransportModule integration in Phase 3
const MOCK_ROUTES: Record<
  string,
  { name: string; type: TransportType; fareCents: number }
> = {
  'tm-b01': {
    name: 'TransMilenio B01 - Portal Norte',
    type: 'TRANSMILENIO',
    fareCents: 295000,
  },
  'sitp-302': { name: 'SITP 302 - Usaquén', type: 'SITP', fareCents: 295000 },
  'coop-medellin': {
    name: 'Cooperativa Medellín - Rionegro',
    type: 'COOPERATIVA',
    fareCents: 1200000,
  },
  'mb-local': { name: 'Microbús Local', type: 'MICROBUS', fareCents: 200000 },
};

@Injectable()
export class TicketingService {
  constructor(
    @InjectRepository(Ticket) private readonly ticketRepo: Repository<Ticket>,
    private readonly walletService: WalletService,
    private readonly configService: ConfigService,
  ) {}

  async purchaseTicket(userId: string, routeId: string): Promise<Ticket> {
    const route = MOCK_ROUTES[routeId];
    if (!route)
      throw new BadRequestException(`Ruta '${routeId}' no encontrada`);

    // Debit wallet first (throws if insufficient balance)
    await this.walletService.debit(
      userId,
      route.fareCents,
      `Pasaje ${route.name}`,
      undefined,
    );

    // Generate signed QR token
    const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000); // 3 hours
    const qrToken = await this.signTicketToken(userId, routeId, expiresAt);

    const ticket = this.ticketRepo.create({
      transportType: route.type,
      routeId,
      routeName: route.name,
      fareAmount: route.fareCents,
      status: 'ISSUED',
      qrToken,
      expiresAt,
      user: { id: userId } as any,
    });

    const saved = await this.ticketRepo.save(ticket);
    // Update the reference in wallet transaction
    await this.walletService.debit(userId, 0, '', saved.id); // just for reference — actual debit done above

    return saved;
  }

  async getMyTickets(userId: string): Promise<Ticket[]> {
    // Auto-expire tickets past their expiry
    await this.ticketRepo
      .createQueryBuilder()
      .update(Ticket)
      .set({ status: 'EXPIRED' })
      .where('status = :status AND expires_at < :now', {
        status: 'ISSUED',
        now: new Date(),
      })
      .execute();

    return this.ticketRepo.find({
      where: { user: { id: userId } },
      order: { issuedAt: 'DESC' },
    });
  }

  getAvailableRoutes() {
    return Object.entries(MOCK_ROUTES).map(([id, r]) => ({ id, ...r }));
  }

  private async signTicketToken(
    userId: string,
    routeId: string,
    expiresAt: Date,
  ): Promise<string> {
    const privateKeyPem = this.configService.get<string>(
      'TICKET_SIGNING_SECRET',
      'dev-secret-key-replace-in-prod',
    );

    // In dev, use a simple HMAC. In prod, use ED25519 loaded from file.
    const payload = {
      sub: userId,
      routeId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(expiresAt.getTime() / 1000),
    };

    // Simple base64 token for dev — replace with real ED25519 JWS in production
    return Buffer.from(JSON.stringify(payload)).toString('base64url');
  }
}
