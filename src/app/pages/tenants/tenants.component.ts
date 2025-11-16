import { Component, inject } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { DataTableComponent, ColumnDef } from '../../shared/components/data-table/data-table.component';
import { MatDialog } from '@angular/material/dialog';
import { FormDialogComponent, FormDialogData } from '../../shared/components/form-dialog/form-dialog.component';
import { Tenant } from '../../core/models/tenant.model';
import { TenantService } from '../../core/services/tenant.service';
import { SubscriptionService } from '../../core/services/subscription.service';
import { NotificationService } from '../../core/notifications/notification.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-tenants',
  standalone: true,
  imports: [SharedModule, DataTableComponent],
  template: `
    <div class="tenants-page">
      <mat-toolbar color="primary">
        <span>Tenants</span>
        <span class="spacer"></span>
        <button mat-raised-button color="accent" (click)="openCreate()">
          <mat-icon>add</mat-icon>
          New Tenant
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
    `.tenants-page{ display:flex; flex-direction:column; gap:16px; }
     .spacer{ flex: 1 1 auto; }`
  ]
})
export class TenantsComponent {
  private svc = inject(TenantService);
  private dialog = inject(MatDialog);
  private notify = inject(NotificationService);
  private subsSvc = inject(SubscriptionService);

  items$: Observable<Tenant[]> = this.svc.list();

  columns: ColumnDef<Tenant>[] = [
    { columnDef: 'name', header: 'Name' },
    { columnDef: 'description', header: 'Description' },
    // { columnDef: 'subscriptionId', header: 'Subscription' },
    // { columnDef: 'superAdminUsername', header: 'Admin Username' },
    // { columnDef: 'superAdminEmail', header: 'Admin Email' },
  ];

  subsOpts: { label: string; value: string }[] = [];

  constructor(){
    this.subsSvc.list().subscribe(items => this.subsOpts = items.map(x => ({ label: x.name, value: x.id })));
  }

  openCreate() {
    const data: FormDialogData = {
      title: 'Create Tenant',
      submitLabel: 'Create',
      cols: 2,
      config: [
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
        { name: 'databaseConnectionString', label: 'Database Connection String', type: 'text', colSpan: 2 },
        { name: 'subscriptionId', label: 'Subscription', type: 'select', options: this.subsOpts },
        { name: 'superAdminUsername', label: 'Super Admin Username', type: 'text' },
        { name: 'superAdminEmail', label: 'Super Admin Email', type: 'email' },
        { name: 'superAdminPassword', label: 'Super Admin Password', type: 'password' },
        { name: 'superAdminFullName', label: 'Super Admin Full Name', type: 'text' },
      ],
    };
    this.dialog.open(FormDialogComponent, { data, width: '760px', maxWidth: '95vw' }).afterClosed().subscribe(result => {
      if (result) {
        this.svc.create(result).subscribe(() => this.notify.success('Tenant created'));
      }
    });
  }

  openEdit(row: Tenant) {
    const data: FormDialogData = {
      title: 'Edit Tenant',
      submitLabel: 'Update',
      value: row,
      cols: 2,
      config: [
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
        { name: 'databaseConnectionString', label: 'Database Connection String', type: 'text', colSpan: 2 },
        { name: 'subscriptionId', label: 'Subscription', type: 'select', options: this.subsOpts },
        { name: 'superAdminUsername', label: 'Super Admin Username', type: 'text' },
        { name: 'superAdminEmail', label: 'Super Admin Email', type: 'email' },
        { name: 'superAdminPassword', label: 'Super Admin Password', type: 'password' },
        { name: 'superAdminFullName', label: 'Super Admin Full Name', type: 'text' },
      ],
    };
    this.dialog.open(FormDialogComponent, { data, width: '760px', maxWidth: '95vw' }).afterClosed().subscribe(result => {
      if (result) {
        this.svc.update(row.id, result).subscribe(() => this.notify.success('Tenant updated'));
      }
    });
  }

  delete(row: Tenant) {
    if (confirm(`Delete tenant ${row.name}?`)) {
      this.svc.delete(row.id).subscribe(() => this.notify.success('Tenant deleted'));
    }
  }
}
