import { Component, Inject, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { SharedModule } from '../../shared/shared.module';
import { NotificationService } from '../../core/notifications/notification.service';
import { LikeCardsOrderDto } from './models/likecards-order.model';
import { LikeCardsOrdersService } from './services/likecards-orders.service';

type OrderAction = 'verify' | 'complete' | 'cancel' | 'fail' | 'reject' | 'delete';

export interface LikeCardsOrderActionsDialogData {
  order: LikeCardsOrderDto;
}

@Component({
  selector: 'app-likecards-order-actions-dialog',
  standalone: true,
  imports: [SharedModule, MatDialogModule, ReactiveFormsModule],
  template: `
    <h2 mat-dialog-title>Order Actions</h2>

    <mat-dialog-content>
      <div class="summary">
        <div><strong>Reference:</strong> {{ data.order.referenceId }}</div>
        <div><strong>Order Id:</strong> {{ data.order.id }}</div>
        <div><strong>Player:</strong> {{ (data.order.player)?.username ?? '-' }}</div>
        <div><strong>Product:</strong> {{ data.order.product.title }}</div>
      </div>

      <form class="form" [formGroup]="form">
        <mat-form-field appearance="outline" class="full">
          <mat-label>Action</mat-label>
          <mat-select [formControl]="actionControl">
            <mat-option value="verify">Verify</mat-option>
            <mat-option value="complete">Complete</mat-option>
            <mat-option value="cancel">Cancel</mat-option>
            <mat-option value="fail">Fail</mat-option>
            <mat-option value="reject">Reject</mat-option>
            <mat-option value="delete">Delete</mat-option>
          </mat-select>
        </mat-form-field>

        @switch (actionControl.value) {
          @case ('verify') {
            <mat-form-field appearance="outline" class="full">
              <mat-label>Verified By</mat-label>
              <input matInput [formControl]="verifiedByControl" />
            </mat-form-field>
          }
          @case ('complete') {
            <mat-form-field appearance="outline" class="full">
              <mat-label>Serial Id (optional)</mat-label>
              <input matInput [formControl]="serialIdControl" placeholder="Guid" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full">
              <mat-label>Message (optional)</mat-label>
              <textarea matInput rows="3" [formControl]="messageControl"></textarea>
            </mat-form-field>
          }
          @case ('cancel') {
            <mat-form-field appearance="outline" class="full">
              <mat-label>Reason</mat-label>
              <textarea matInput rows="3" [formControl]="reasonControl"></textarea>
            </mat-form-field>
          }
          @case ('fail') {
            <mat-form-field appearance="outline" class="full">
              <mat-label>Reason</mat-label>
              <textarea matInput rows="3" [formControl]="reasonControl"></textarea>
            </mat-form-field>
          }
          @case ('reject') {
            <mat-form-field appearance="outline" class="full">
              <mat-label>Reason</mat-label>
              <textarea matInput rows="3" [formControl]="reasonControl"></textarea>
            </mat-form-field>
          }
          @case ('delete') {
            <div class="warn">
              This will permanently delete the order.
            </div>
          }
        }
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-flat-button mat-dialog-close>Close</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid || inProgress" (click)="submit()">Submit</button>
    </mat-dialog-actions>
  `,
  styles: [
    `.summary{ display:grid; gap:6px; padding: 8px 0 14px 0; }
     .form{ display:grid; gap: 12px; }
     .full{ width:100%; }
     .warn{ padding: 10px 12px; border-radius: 10px; border: 1px solid rgba(239,68,68,.35); background: rgba(239,68,68,.08); color: #991b1b; }`
  ]
})
export class LikeCardsOrderActionsDialogComponent {
  private ordersService = inject(LikeCardsOrdersService);
  private notificationService = inject(NotificationService);
  private dialogRef = inject(MatDialogRef<LikeCardsOrderActionsDialogComponent>);

  inProgress = false;

  actionControl = new FormControl<OrderAction>('verify', { nonNullable: true });
  verifiedByControl = new FormControl<string>('', { nonNullable: true });
  serialIdControl = new FormControl<string>('', { nonNullable: true });
  messageControl = new FormControl<string>('', { nonNullable: true });
  reasonControl = new FormControl<string>('', { nonNullable: true });

  form :FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: LikeCardsOrderActionsDialogData) {
    this.form = new FormGroup({
      action: this.actionControl,
      verifiedBy: this.verifiedByControl,
      serialId: this.serialIdControl,
      message: this.messageControl,
      reason: this.reasonControl,
    });

    this.applyValidators();
    this.actionControl.valueChanges.subscribe(() => this.applyValidators());
  }

  private applyValidators(): void {
    this.verifiedByControl.clearValidators();
    this.reasonControl.clearValidators();

    const action = this.actionControl.value;
    if (action === 'verify') {
      this.verifiedByControl.addValidators([Validators.required]);
    }
    if (action === 'cancel' || action === 'fail' || action === 'reject') {
      this.reasonControl.addValidators([Validators.required]);
    }

    this.verifiedByControl.updateValueAndValidity({ emitEvent: false });
    this.reasonControl.updateValueAndValidity({ emitEvent: false });
  }

  submit(): void {
    if (this.form.invalid || this.inProgress) return;

    const orderId = this.data.order.id;
    const action = this.actionControl.value;

    if (action === 'delete') {
      if (!confirm('Delete this order?')) return;
    }

    this.inProgress = true;

    const done = () => (this.inProgress = false);

    if (action === 'verify') {
      this.ordersService.verify(orderId, this.verifiedByControl.value).subscribe({
        next: () => {
          this.notificationService.success('Order verified');
          done();
          this.dialogRef.close(true);
        },
        error: e => {
          done();
          this.notificationService.error(e?.error?.message || e?.message || 'Failed to verify');
        },
      });
      return;
    }

    if (action === 'complete') {
      const serialId = this.serialIdControl.value?.trim() || null;
      const message = this.messageControl.value?.trim() || null;
      this.ordersService.complete(orderId, serialId, message).subscribe({
        next: () => {
          this.notificationService.success('Order completed');
          done();
          this.dialogRef.close(true);
        },
        error: e => {
          done();
          this.notificationService.error(e?.error?.message || e?.message || 'Failed to complete');
        },
      });
      return;
    }

    if (action === 'cancel') {
      this.ordersService.cancel(orderId, this.reasonControl.value).subscribe({
        next: () => {
          this.notificationService.success('Order cancelled');
          done();
          this.dialogRef.close(true);
        },
        error: e => {
          done();
          this.notificationService.error(e?.error?.message || e?.message || 'Failed to cancel');
        },
      });
      return;
    }

    if (action === 'fail') {
      this.ordersService.fail(orderId, this.reasonControl.value).subscribe({
        next: () => {
          this.notificationService.success('Order failed');
          done();
          this.dialogRef.close(true);
        },
        error: e => {
          done();
          this.notificationService.error(e?.error?.message || e?.message || 'Failed to fail');
        },
      });
      return;
    }

    if (action === 'reject') {
      this.ordersService.reject(orderId, this.reasonControl.value).subscribe({
        next: () => {
          this.notificationService.success('Order rejected');
          done();
          this.dialogRef.close(true);
        },
        error: e => {
          done();
          this.notificationService.error(e?.error?.message || e?.message || 'Failed to reject');
        },
      });
      return;
    }

    this.ordersService.delete(orderId).subscribe({
      next: () => {
        this.notificationService.success('Order deleted');
        done();
        this.dialogRef.close(true);
      },
      error: e => {
        done();
        this.notificationService.error(e?.error?.message || e?.message || 'Failed to delete');
      },
    });
  }
}
