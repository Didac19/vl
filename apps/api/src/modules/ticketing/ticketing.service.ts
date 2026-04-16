import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { SignJWT, jwtVerify, importJWK } from 'jose';
import { Ticket, TransportType } from './entities/ticket.entity';
import { BoardingLog } from './entities/boarding-log.entity';
import { BusQr } from './entities/bus-qr.entity';
import { Route } from '../transport/entities/route.entity';
import { User } from '../users/entities/user.entity';
import { WalletService } from '../wallet/wallet.service';
import { TransportService } from '../transport/transport.service';
import * as Shared from '@transix/shared-types';

// Mock route data — replace with TransportModule integration in Phase 3


@Injectable()
export class TicketingService {
  constructor(
    @InjectRepository(Ticket) private readonly ticketRepo: Repository<Ticket>,
    @InjectRepository(BoardingLog) private readonly boardingLogRepo: Repository<BoardingLog>,
    @InjectRepository(BusQr) private readonly busQrRepo: Repository<BusQr>,
    @InjectRepository(Route) private readonly routeRepo: Repository<Route>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly transportService: TransportService,
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

  async getRoutesByCompany(companyId: string) {
    const routes = await this.routeRepo.find({
      where: { company: { id: companyId } },
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

  async getValidatorConfig(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['company'],
    });

    if (!user || !user.company) {
      throw new BadRequestException('El usuario no está asociado a una empresa de transporte');
    }

    const routes = await this.getRoutesByCompany(user.company.id);

    return {
      companyName: user.company.name,
      breBCode: user.company.breBCode || 'BRE_B_STATIC_CODE_PENDING',
      routes,
    };
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

  async confirmBoarding(
    validatorId: string,
    routeId?: string,
    tripId?: string,
    amount?: number,
  ): Promise<BoardingLog> {
    const boardingLog = this.boardingLogRepo.create({
      validator: { id: validatorId },
      routeId,
      tripId,
      amount,
    });

    return this.boardingLogRepo.save(boardingLog);
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

  async generateBusQr(user: any, dto: Shared.GenerateBusQrDto): Promise<{ token: string; payload: Shared.BusQrPayload; busQrId: string }> {
    const fullUser = await this.userRepo.findOne({
      where: { id: user.id },
      relations: ['company'],
    });

    if (!fullUser || !fullUser.company) {
      throw new BadRequestException('Usuario no asociado a una empresa de transporte');
    }

    const companyId = fullUser.company.id;
    let routeId = dto.routeId;
    let routeName = '';

    if (dto.newRoute) {
      const createdRoute = await this.transportService.createRoute({
        name: dto.newRoute.name,
        transportTypeId: dto.newRoute.transportTypeId,
        baseFare: dto.newRoute.baseFare,
        pricingStrategy: 'FLAT',
      }, companyId);
      routeId = createdRoute.id;
      routeName = createdRoute.name;
    } else if (routeId) {
      const route = await this.routeRepo.findOne({
        where: { id: routeId },
        relations: ['company'],
      });
      if (!route) throw new NotFoundException('Ruta no encontrada');
      if (route.company?.id !== companyId) throw new ForbiddenException('La ruta no pertenece a su empresa');
      routeName = route.name;
    } else {
      throw new BadRequestException('Debe proporcionar una ruta existente o datos para una nueva');
    }

    const payload: Shared.BusQrPayload = {
      busId: dto.busId,
      companyId,
      companyName: fullUser.company.name,
      routeId,
      routeName,
      amount: dto.amount,
      signedAt: new Date().toISOString(),
    };

    const secret = new TextEncoder().encode(
      this.configService.get<string>('TICKET_SIGNING_SECRET', 'dev-secret-key-replace-in-prod'),
    );

    const token = await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .sign(secret);

    // Upsert: find existing record by busId + companyId, or create new one
    let busQr = await this.busQrRepo.findOne({
      where: { busId: dto.busId, company: { id: companyId } },
    });

    if (busQr) {
      // Update existing record (regenerate)
      busQr.token = token;
      busQr.routeName = routeName;
      busQr.amount = dto.amount;
      busQr.route = { id: routeId } as any;
    } else {
      busQr = this.busQrRepo.create({
        busId: dto.busId,
        company: { id: companyId } as any,
        route: { id: routeId } as any,
        routeName,
        amount: dto.amount,
        token,
      });
    }

    const saved = await this.busQrRepo.save(busQr);

    return { token, payload, busQrId: saved.id };
  }

  async payBusQr(userId: string, dto: Shared.PayBusQrDto): Promise<{ success: boolean; totalAmount: number; quantity: number }> {
    const secret = new TextEncoder().encode(
      this.configService.get<string>('TICKET_SIGNING_SECRET', 'dev-secret-key-replace-in-prod'),
    );

    let payload: Shared.BusQrPayload;
    try {
      const { payload: verifiedPayload } = await jwtVerify(dto.token, secret);
      payload = verifiedPayload as any;
    } catch (e) {
      throw new ForbiddenException('Código QR de bus no válido o alterado');
    }

    const totalAmount = payload.amount * dto.quantity;
    const totalAmountCents = Math.round(totalAmount * 100); 

    // Process payment

    // Process payment
    await this.walletService.debit(
      userId,
      totalAmountCents,
      `Pago Bus ${payload.busId} - ${payload.routeName} (x${dto.quantity})`,
      undefined,
    );

    // Log boarding
    await this.boardingLogRepo.save(
      this.boardingLogRepo.create({
        routeId: payload.routeId,
        amount: totalAmountCents,
        tripId: payload.busId, // Using busId as tripId for simplicity
        validator: { id: userId } as any, // In this case validator is the user paying? 
        // Actually boarding log usually records the validator device. 
        // but here it's a direct payment.
      })
    );

    return {
      success: true,
      totalAmount: totalAmountCents,
      quantity: dto.quantity,
    };
  }
  async getCompanyBusQrs(companyId: string): Promise<BusQr[]> {
    return this.busQrRepo.find({
      where: { company: { id: companyId } },
      order: { updatedAt: 'DESC' },
    });
  }

  async getQrPayments(busQrId: string, companyId: string): Promise<{ logs: BoardingLog[]; totalCollectedCents: number }> {
    const busQr = await this.busQrRepo.findOne({
      where: { id: busQrId, company: { id: companyId } },
    });
    if (!busQr) throw new NotFoundException('QR no encontrado');

    const logs = await this.boardingLogRepo.find({
      where: { tripId: busQr.busId, routeId: busQr.route?.id },
      order: { boardedAt: 'DESC' },
    });

    const totalCollectedCents = logs.reduce((sum, l) => sum + Number(l.amount || 0), 0);
    return { logs, totalCollectedCents, busQr } as any;
  }
}
