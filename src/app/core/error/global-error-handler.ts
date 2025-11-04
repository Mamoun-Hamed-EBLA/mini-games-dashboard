import { ErrorHandler, Injectable } from '@angular/core';
import { NotificationService } from '../notifications/notification.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private notify: NotificationService) {}

  handleError(error: any): void {
    // Log to console for devs
    console.error('Global error caught:', error);

    // Show user-friendly message
    const message = (error && (error.message || error.toString())) || 'Unexpected error';
    this.notify.error(message);
  }
}
