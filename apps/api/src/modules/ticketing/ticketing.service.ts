import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { SignJWT, jwtVerify, importJWK } from 'jose';
import { Ticket, TransportType } from './entities/ticket.entity';
import { Route } from '../transport/entities/route.entity';
import { WalletService } from '../wallet/wallet.service';

// Mock route data — replace with TransportModule integration in Phase 3


@Injectable()
export class TicketingService {
  constructor(
    @InjectRepository(Ticket) private readonly ticketRepo: Repository<Ticket>,
    @InjectRepository(Route) private readonly routeRepo: Repository<Route>,
    private readonly walletService: WalletService,
    private readonly configService: ConfigService,
  ) {}

  async purchaseTicket(userId: string, routeId: string): Promise<Ticket> {
    const route = await this.routeRepo.findOne({
      where: { id: routeId },
      relations: ['transportType'],
    });

    if (!route)
      throw new BadRequestException(`Ruta '${routeId}' no encontrada`);

    // Use route base fare if present, otherwise transport type fare
    const fareAmount = route.baseFare > 0 ? route.baseFare : route.transportType.fareAmount;
    const fareCents = Math.round(Number(fareAmount) * 100);

    // Debit wallet first (throws if insufficient balance)
    await this.walletService.debit(
      userId,
      fareCents,
      `Pasaje ${route.name}`,
      undefined,
    );

    // Generate signed QR token
    const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000); // 3 hours
    const qrToken = await this.signTicketToken(userId, routeId, expiresAt);

    const ticket = this.ticketRepo.create({
      transportType: route.transportType.type as any, // Cast to our local enum
      routeId,
      routeName: route.name,
      fareAmount: fareCents,
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

  async getAvailableRoutes() {
    const routes = await this.routeRepo.find({
      relations: ['transportType'],
      order: { name: 'ASC' },
    });

    return routes.map((r) => ({
      id: r.id,
      name: r.name,
      type: r.transportType.type,
      fareAmount: Number(r.baseFare || r.transportType.fareAmount),
      fareCents: Math.round(Number(r.baseFare || r.transportType.fareAmount) * 100),
    }));
  }

  async verifyScan(qrToken: string): Promise<{ success: boolean; message: string; ticket?: Ticket }> {
    const secret = new TextEncoder().encode(
      this.configService.get<string>('TICKET_SIGNING_SECRET', 'dev-secret-key-replace-in-prod'),
    );
    
    let payload;
    try {
      const { payload: verifiedPayload } = await jwtVerify(qrToken, secret);
      payload = verifiedPayload;
    } catch (e) {
      throw new ForbiddenException('La firma del pasaje no es válida o ha expirado');
    }
    
    const ticket = await this.ticketRepo.findOne({
      where: { qrToken }, // We still look it up to check status and route
    });

    if (!ticket) {
      throw new NotFoundException('Pasaje no encontrado o es falso');
    }

    if (ticket.status === 'USED') {
      throw new ForbiddenException('Este pasaje ya fue utilizado');
    }

    if (ticket.status !== 'ISSUED') {
      throw new BadRequestException(`El pasaje no tiene un estado válido: ${ticket.status}`);
    }

    const now = new Date();
    if (ticket.expiresAt < now) {
      ticket.status = 'EXPIRED';
      await this.ticketRepo.save(ticket);
      throw new ForbiddenException('El pasaje ha expirado');
    }

    // Mark as USED
    ticket.status = 'USED';
    const savedTicket = await this.ticketRepo.save(ticket);

    return { 
      success: true, 
      message: `Válido: ${ticket.routeName}`,
      ticket: savedTicket 
    };
  }

  private async signTicketToken(
    userId: string,
    routeId: string,
    expiresAt: Date,
  ): Promise<string> {
    const secret = new TextEncoder().encode(
      this.configService.get<string>('TICKET_SIGNING_SECRET', 'dev-secret-key-replace-in-prod'),
    );

    return new SignJWT({
      userId,
      routeId,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
      .sign(secret);
  }
}
