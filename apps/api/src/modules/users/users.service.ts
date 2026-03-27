import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '@transix/shared-types';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) { }

  async create(data: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
    role?: UserRole;
  }): Promise<User> {
    const existing = await this.usersRepo.findOne({
      where: { email: data.email },
    });
    if (existing) throw new ConflictException('El email ya está registrado');

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = this.usersRepo.create({ ...data, password: hashedPassword });
    return this.usersRepo.save(user);
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepo.findOne({
      where: { id },
      relations: ['company'],
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async findByEmail(email: string, withPassword = false): Promise<User | null> {
    const qb = this.usersRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.company', 'company')
      .where('user.email = :email', { email });
    if (withPassword) qb.addSelect('user.password');
    return qb.getOne();
  }

  async update(
    id: string,
    data: Partial<Pick<User, 'fullName' | 'phone'>>,
  ): Promise<User> {
    await this.findById(id);
    await this.usersRepo.update(id, data);
    return this.findById(id);
  }

  async updateRole(id: string, role: UserRole): Promise<User> {
    await this.findById(id);
    await this.usersRepo.update(id, { role });
    return this.findById(id);
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await this.usersRepo.update(id, { password: hashedPassword });
  }

  async delete(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.usersRepo.remove(user);
  }
}
