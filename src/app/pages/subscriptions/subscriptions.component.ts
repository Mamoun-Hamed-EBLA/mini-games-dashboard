import { Component, inject, Signal, signal } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { DataTableComponent, ColumnDef } from '../../shared/components/data-table/data-table.component';
import { MatDialog } from '@angular/material/dialog';
import { FormDialogComponent, FormDialogData } from '../../shared/components/form-dialog/form-dialog.component';
import { SubscriptionService } from './services/subscription.service';
import { NotificationService } from '../../core/notifications/notification.service';
import { Observable } from 'rxjs';
import { FormFieldConfig } from '../../shared/components/dynamic-form/dynamic-form.component';
import { SubscriptionType } from './enum/SubscriptionType';
import { TenantSubscription } from './models/tenantSubscription';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [SharedModule, DataTableComponent],
  template: `
    <div class="subscriptions-page">
      <mat-toolbar color="primary">
        <span>Subscriptions</span>
        <span class="spacer"></span>
        <button mat-raised-button color="accent" (click)="openCreate()">
          <mat-icon>add</mat-icon>
          New Subscription
        </button>
      </mat-toolbar>

      <mat-card>
        <mat-card-content>
          <app-data-table [columns]="columns" [data]="(items$ | async) ?? []" [actions]="true"
                           (edit)="openEdit($event)" (remove)="delete($event)"></app-data-table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `.subscriptions-page{ display:flex; flex-direction:column; gap:16px; }
     .spacer{ flex: 1 1 auto; }`
  ]
})
export class SubscriptionsComponent {
  private svc = inject(SubscriptionService);
  private dialog = inject(MatDialog);
  private notify = inject(NotificationService);

  items$: Observable<TenantSubscription[]> = this.svc.list();

  columns: ColumnDef<TenantSubscription>[] = [
    { columnDef: 'name', header: 'Name' },
    { columnDef: 'description', header: 'Description' },
    { columnDef: 'price', header: 'Price' },
    { columnDef: 'durationInDays', header: 'Duration (days)' },
    { columnDef: 'maxPlayers', header: 'Max Players' },
    { columnDef: 'maxKeysPerMonth', header: 'Max Keys/Month' },
    { columnDef: 'type', header: 'Type', cell: (r) => SubscriptionType[r.type as number] },
  ];

  formFields:Signal<FormFieldConfig[]> = signal([
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'price', label: 'Price', type: 'number', validators: [{ name: 'min', value: 0 }] },
        { name: 'durationInDays', label: 'Duration (days)', type: 'number', validators: [{ name: 'min', value: 1 }] },
        { name: 'maxPlayers', label: 'Max Players', type: 'number', validators: [{ name: 'min', value: 0 }] },
        { name: 'maxKeysPerMonth', label: 'Max Keys Per Month', type: 'number', validators: [{ name: 'min', value: 0 }] },
        { name: 'type', label: 'Type', type: 'select', enumType: SubscriptionType},
        { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },

      ]);
  openCreate() {
    const data: FormDialogData = {
      title: 'Create Subscription',
      submitLabel: 'Create',
      cols: 2,
      config: this.formFields(),
    };
    this.dialog.open(FormDialogComponent, { data, width: '720px', maxWidth: '95vw' }).afterClosed().subscribe(result => {
      if (result) {
        this.svc.create(result).subscribe(() => this.notify.success('Subscription created'));
      }
    });
  }

  openEdit(row: TenantSubscription) {
    const data: FormDialogData = {
      title: 'Edit Subscription',
      submitLabel: 'Update',
      value: row,
      cols: 2,
      config: this.formFields(),
    };
    this.dialog.open(FormDialogComponent, { data, width: '720px', maxWidth: '95vw' }).afterClosed().subscribe(result => {
      if (result) {
        this.svc.update(row.id, result).subscribe(() => this.notify.success('Subscription updated'));
      }
    });
  }

  delete(row: TenantSubscription) {
    if (confirm(`Delete subscription ${row.name}?`)) {
      this.svc.delete(row.id).subscribe(() => this.notify.success('Subscription deleted'));
    }
  }
}
