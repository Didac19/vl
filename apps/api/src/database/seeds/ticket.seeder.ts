import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Ticket } from '../../modules/ticketing/entities/ticket.entity';
import { Route } from '../../modules/transport/entities/route.entity';
import { User } from '../../modules/users/entities/user.entity';
import { SignJWT } from 'jose';

export default class TicketSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const ticketRepo = dataSource.getRepository(Ticket);
    const routeRepo = dataSource.getRepository(Route);
    const userRepo = dataSource.getRepository(User);

    const user = await userRepo.findOneBy({ email: 'admin@vialibre.com' });
    const route = await routeRepo.findOne({ 
      where: {}, 
      relations: ['transportType'] 
    });

    if (!user || !route) {
      console.log('⚠️ Skip TicketSeeder: User or Route not found. Run admin and transport seeders first.');
      return;
    }

    const secret = new TextEncoder().encode(
      process.env.TICKET_SIGNING_SECRET || 'dev-secret-key-replace-in-prod',
    );

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const generateToken = async (exp?: Date) => {
      const expiration = exp || expiresAt;
      return new SignJWT({ userId: user.id, routeId: route.id })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(Math.floor(expiration.getTime() / 1000))
        .sign(secret);
    };

    console.log('🌱 Creating test tickets...');
    
    // 1. Valid Ticket
    const token1 = await generateToken();
    const t1 = ticketRepo.create({
      user,
      routeId: route.id,
      routeName: route.name,
      transportType: route.transportType.type as any,
      fareAmount: Math.round(Number(route.baseFare || route.transportType.fareAmount) * 100),
      status: 'ISSUED',
      qrToken: token1,
      expiresAt,
    });
    await ticketRepo.save(t1);
    console.log('✅ Valid Ticket Created.');
    console.log(`[VALID] QR Token: ${token1}`);

    // 2. Used Ticket
    const token2 = await generateToken();
    const t2 = ticketRepo.create({
      user,
      routeId: route.id,
      routeName: route.name,
      transportType: route.transportType.type as any,
      fareAmount: Math.round(Number(route.baseFare || route.transportType.fareAmount) * 100),
      status: 'USED',
      qrToken: token2,
      expiresAt,
      usedAt: new Date(),
    });
    await ticketRepo.save(t2);
    console.log('✅ Used Ticket Created (should fail scan).');
    console.log(`[USED] QR Token: ${token2}`);

    // 3. Expired Ticket
    const expiredAt = new Date(Date.now() - 3600000); // 1 hour ago
    const token3 = await generateToken(expiredAt);
    
    const t3 = ticketRepo.create({
      user,
      routeId: route.id,
      routeName: route.name,
      transportType: route.transportType.type as any,
      fareAmount: Math.round(Number(route.baseFare || route.transportType.fareAmount) * 100),
      status: 'EXPIRED',
      qrToken: token3,
      expiresAt: expiredAt,
    });
    await ticketRepo.save(t3);
    console.log('✅ Expired Ticket Created.');
    console.log(`[EXPIRED] QR Token: ${token3}`);
    
    console.log('\n--- DATA FOR VALIDATOR TESTING ---');
    console.log(`Route: ${route.name}`);
    console.log(`User: ${user.fullName}`);
    console.log('----------------------------------\n');
  }
}
