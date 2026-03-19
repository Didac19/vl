import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger('Notifications');

  async sendPush(userId: string, title: string, body: string, data?: any) {
    this.logger.log(`Push sent to ${userId}: ${title} - ${body}`);
    // Integración con Expo Notifications en el futuro
    return true;
  }

  async sendEmail(to: string, subject: string, template: string) {
    this.logger.log(`Email sent to ${to}: ${subject}`);
    // Integración con Mailer/SMTP
    return true;
  }
}
