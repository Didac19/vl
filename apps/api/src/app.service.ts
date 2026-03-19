import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  healthCheck() {
    return {
      status: 'ok',
      service: 'via-libre-api',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
    };
  }
}
