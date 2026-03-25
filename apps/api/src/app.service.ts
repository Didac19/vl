import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  healthCheck() {
    return {
      status: 'ok',
      service: 'transix-api',
      version: '0.1.1',
      timestamp: new Date().toISOString(),
    };
  }
}
