import { Component, inject, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, map, Observable, shareReplay, switchMap } from 'rxjs';
import { PagedData } from '../../core/models/api-response.model';
import { FilterConfig } from '../../core/models/filter-config.model';
import { Lookup } from '../../core/models/lookup';
import { TenantCriteria } from '../../core/models/page-criteria.models';
import { NotificationService } from '../../core/notifications/notification.service';
import { ColumnDef, DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { FormDialogComponent, FormDialogData } from '../../shared/components/form-dialog/form-dialog.component';
import { TableFiltersComponent } from '../../shared/components/table-filters/table-filters.component';
import { SharedModule } from '../../shared/shared.module';
import { SubscriptionService } from '../subscriptions/services/subscription.service';
import { Tenant } from './tenant.model';
import { TenantService } from './tenant.service';

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
export class TenantsComponent implements OnInit {
  private tenantService = inject(TenantService);
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);
  private subscriptionService = inject(SubscriptionService);

  currentCriteria = signal<TenantCriteria>({});
  private criteriaSubject = new BehaviorSubject<TenantCriteria>({});
  
  private subscriptions$ = this.subscriptionService.list().pipe(
    shareReplay(1)
  );

  pagedData$: Observable<PagedData<Tenant>> = this.criteriaSubject.pipe(
    switchMap(criteria => this.tenantService.list(criteria)),
    shareReplay(1)
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
      { name: 'Name', id: 'name' },
      { name: 'Created Date', id: 'createdAt' },
      { name: 'Updated Date', id: 'updatedAt' },
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
  ];

  subsOpts: Lookup[] = [];

  ngOnInit(): void {
    this.subscriptions$.subscribe(subscriptions => {
      this.subsOpts = subscriptions.map(sub => ({ id: sub.id, name: sub.name }));
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
        { name: 'currentSubscriptionId', label: 'Subscription', type: 'select', options: this.subsOpts },
        { name: 'databaseConnectionString', label: 'Database Connection String', type: 'text', colSpan: 2 },
        { name: 'superAdminUsername', label: 'Super Admin Username', type: 'text' },
        { name: 'superAdminEmail', label: 'Super Admin Email', type: 'email' },
        { name: 'superAdminPassword', label: 'Super Admin Password', type: 'password' },
        { name: 'superAdminFullName', label: 'Super Admin Full Name', type: 'text' },
        { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
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
        { name: 'currentSubscriptionId', label: 'Subscription', type: 'select', options: this.subsOpts },
        { name: 'databaseConnectionString', label: 'Database Connection String', type: 'text', colSpan: 2 },
        { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
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
