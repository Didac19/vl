import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet) private readonly walletRepo: Repository<Wallet>,
    @InjectRepository(Transaction)
    private readonly txRepo: Repository<Transaction>,
    private readonly dataSource: DataSource,
  ) {}

  async createForUser(userId: string): Promise<Wallet> {
    const wallet = this.walletRepo.create({
      balance: 0,
      currency: 'COP',
      user: { id: userId } as any,
    });
    return this.walletRepo.save(wallet);
  }

  async findByUserId(userId: string): Promise<Wallet> {
    const wallet = await this.walletRepo.findOne({
      where: { user: { id: userId } },
      relations: ['transactions'],
    });
    if (!wallet) throw new NotFoundException('Billetera no encontrada');
    return wallet;
  }

  async topUp(userId: string, amountCents: number): Promise<Wallet> {
    if (amountCents <= 0)
      throw new BadRequestException('El monto debe ser mayor a 0');

    return this.dataSource.transaction(async (manager: any) => {
      const wallet = await manager.findOne(Wallet, {
        where: { user: { id: userId } },
      });
      if (!wallet) throw new NotFoundException('Billetera no encontrada');

      wallet.balance = Number(wallet.balance) + amountCents;
      await manager.save(wallet);

      const tx = manager.create(Transaction, {
        type: 'CREDIT',
        amount: amountCents,
        description: 'Recarga de saldo',
        wallet,
      });
      await manager.save(tx);

      return wallet;
    });
  }

  async debit(
    userId: string,
    amountCents: number,
    description: string,
    referenceId?: string,
  ): Promise<Wallet> {
    return this.dataSource.transaction(async (manager: any) => {
      const wallet = await manager.findOne(Wallet, {
        where: { user: { id: userId } },
      });
      if (!wallet) throw new NotFoundException('Billetera no encontrada');
      if (Number(wallet.balance) < amountCents)
        throw new BadRequestException('Saldo insuficiente');

      wallet.balance = Number(wallet.balance) - amountCents;
      await manager.save(wallet);

      const tx = manager.create(Transaction, {
        type: 'DEBIT',
        amount: amountCents,
        description,
        referenceId,
        wallet,
      });
      await manager.save(tx);

      return wallet;
    });
  }
}
