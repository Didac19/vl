import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

class TopUpDto {
  @IsNumber() @Min(100) amountCents: number; // minimum 100 COP cents (1 peso)
}

@ApiTags('wallet')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @ApiOperation({ summary: 'Consultar saldo y transacciones de la billetera' })
  getMyWallet(@Request() req: any) {
    return this.walletService.findByUserId(req.user.id);
  }

  @Post('top-up')
  @ApiOperation({
    summary: 'Recargar saldo a la billetera (simulado para dev)',
  })
  topUp(@Request() req: any, @Body() dto: TopUpDto) {
    return this.walletService.topUp(req.user.id, dto.amountCents);
  }
}
