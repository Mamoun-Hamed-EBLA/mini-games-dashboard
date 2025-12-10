import { Component, inject, signal } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { DataTableComponent, ColumnDef } from '../../shared/components/data-table/data-table.component';
import { MatDialog } from '@angular/material/dialog';
import { FormDialogComponent, FormDialogData } from '../../shared/components/form-dialog/form-dialog.component';
import { TenantService } from './tenant.service';
import { SubscriptionService } from '../subscriptions/services/subscription.service';
import { NotificationService } from '../../core/notifications/notification.service';
import { Observable, switchMap, BehaviorSubject, map } from 'rxjs';
import { TenantCriteria } from '../../core/models/page-criteria.models';
import { FilterConfig } from '../../core/models/filter-config.model';
import { TableFiltersComponent } from '../../shared/components/table-filters/table-filters.component';
import { PagedData } from '../../core/models/api-response.model';
import { Tenant } from './tenant.model';

@Component({
  selector: 'app-tenants',
  standalone: true,
  imports: [SharedModule, DataTableComponent, TableFiltersComponent],
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
          <app-table-filters 
            [config]="filterConfig"
            [initialCriteria]="currentCriteria()"
            (filtersChanged)="onFiltersChanged($event)">
          </app-table-filters>
          
          <app-data-table 
            [columns]="columns" 
            [data]="(items$ | async) ?? []" 
            [paginationInfo]="(paginationInfo$ | async) ?? null"
            [actions]="true"
            (edit)="openEdit($event)" 
            (remove)="deleteTenant($event)">
          </app-data-table>
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
  private tenantService = inject(TenantService);
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);
  private subscriptionService = inject(SubscriptionService);

  currentCriteria = signal<TenantCriteria>({});
  private criteriaSubject = new BehaviorSubject<TenantCriteria>({});
  
  pagedData$: Observable<PagedData<Tenant>> = this.criteriaSubject.pipe(
    switchMap(criteria => this.tenantService.list(criteria))
  );

  items$: Observable<Tenant[]> = this.pagedData$.pipe(
    map(pagedData => pagedData.items)
  );

  paginationInfo$ = this.pagedData$.pipe(
    map(pagedData => ({
      pageNumber: pagedData.pageNumber,
      pageSize: pagedData.pageSize,
      totalCount: pagedData.totalCount,
      totalPages: pagedData.totalPages,
      hasPreviousPage: pagedData.hasPreviousPage,
      hasNextPage: pagedData.hasNextPage,
    }))
  );

  filterConfig: FilterConfig = {
    showSearch: true,
    searchPlaceholder: 'Search tenants...',
    showSort: true,
    sortOptions: [
      { label: 'Name', value: 'name' },
      { label: 'Created Date', value: 'createdAt' },
      { label: 'Updated Date', value: 'updatedAt' },
    ],
    showDateFilters: true,
    customFields: [
      {
        name: 'subscriptionId',
        label: 'Subscription',
        type: 'select',
        options: [],
      },
    ],
  };

  columns: ColumnDef<Tenant>[] = [
    { columnDef: 'name', header: 'Name' },
    { columnDef: 'description', header: 'Description' },
    // { columnDef: 'subscriptionId', header: 'Subscription' },
    // { columnDef: 'superAdminUsername', header: 'Admin Username' },
    // { columnDef: 'superAdminEmail', header: 'Admin Email' },
  ];

  subsOpts: { label: string; value: string }[] = [];

  constructor() {
    this.subscriptionService.list().subscribe(subscriptions => {
      this.subsOpts = subscriptions.map(sub => ({ label: sub.name, value: sub.id }));
      // Update filter config with subscription options
      const subscriptionField = this.filterConfig.customFields?.find(f => f.name === 'subscriptionId');
      if (subscriptionField) {
        subscriptionField.options = this.subsOpts;
      }
    });
  }

  onFiltersChanged(criteria: TenantCriteria): void {
    this.currentCriteria.set(criteria);
    this.criteriaSubject.next(criteria);
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
        this.tenantService.create(result).subscribe(() => {
          this.notificationService.success('Tenant created');
        });
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
        this.tenantService.update(row.id, result).subscribe(() => {
          this.notificationService.success('Tenant updated');
        });
      }
    });
  }

  deleteTenant(tenant: Tenant): void {
    if (confirm(`Delete tenant ${tenant.name}?`)) {
      this.tenantService.delete(tenant.id).subscribe(() => {
        this.notificationService.success('Tenant deleted');
      });
    }
  }
}
