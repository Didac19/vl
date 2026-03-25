import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@via-libre/shared-types';
import * as bcrypt from 'bcryptjs';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('users')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener todos los usuarios (Solo Admin)' })
  findAll() {
    // Note: We should implement this in service too if needed
    return [];
  }

  @Get('me')
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  async getMe(@Request() req: any) {
    const user = await this.usersService.findById(req.user.id);
    return {
      ...user,
      companyId: user.company?.id,
    };
  }

  @Patch('me')
  @ApiOperation({ summary: 'Actualizar perfil del usuario autenticado' })
  updateMe(
    @Request() req: any,
    @Body() body: { fullName?: string; phone?: string },
  ) {
    return this.usersService.update(req.user.id, body);
  }

  @Patch('me/password')
  @ApiOperation({ summary: 'Cambiar contraseña del usuario autenticado' })
  async changePassword(
    @Request() req: any,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    const user = await this.usersService.findByEmail(req.user.email, true);
    if (!user) throw new UnauthorizedException();

    const isMatch = await bcrypt.compare(body.currentPassword, user.password);
    if (!isMatch) throw new UnauthorizedException('Contraseña actual incorrecta');

    await this.usersService.updatePassword(req.user.id, body.newPassword);
    return { message: 'Contraseña actualizada correctamente' };
  }

  @Delete('me')
  @ApiOperation({ summary: 'Eliminar cuenta del usuario autenticado' })
  async deleteMe(@Request() req: any) {
    await this.usersService.delete(req.user.id);
    return { message: 'Cuenta eliminada exitosamente' };
  }
}
