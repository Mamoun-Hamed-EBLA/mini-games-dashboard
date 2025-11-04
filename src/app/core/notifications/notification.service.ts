import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private snack: MatSnackBar) {}

  success(message: string, action: string = 'OK', duration = 3000) {
    this.snack.open(message, action, { duration, panelClass: ['snack-success'] });
  }

  error(message: string, action: string = 'Dismiss', duration = 4000) {
    this.snack.open(message, action, { duration, panelClass: ['snack-error'] });
  }

  info(message: string, action: string = 'OK', duration = 3000) {
    this.snack.open(message, action, { duration, panelClass: ['snack-info'] });
  }
}
