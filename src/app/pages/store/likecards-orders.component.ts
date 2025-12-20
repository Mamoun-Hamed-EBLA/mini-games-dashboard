import { Component, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Observable, catchError, map, of, shareReplay, switchMap } from 'rxjs';
import { SharedModule } from '../../shared/shared.module';
import { TableFiltersComponent } from '../../shared/components/table-filters/table-filters.component';
import { ColumnDef, DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { FilterConfig } from '../../core/models/filter-config.model';
import { PagedData } from '../../core/models/api-response.model';
import { NotificationService } from '../../core/notifications/notification.service';
import { LikeCardsOrderDto } from './models/likecards-order.model';
import { LikeCardsOrderCriteria } from './models/likecards-order-criteria.model';
import { LikeCardsOrderStatus } from './enums/likecards-order-status.enum';
import { LikeCardsOrdersService } from './services/likecards-orders.service';
import { LikeCardsOrderActionsDialogComponent } from './likecards-order-actions-dialog.component';

@Component({
  selector: 'app-likecards-orders',
  standalone: true,
  imports: [SharedModule, DataTableComponent, TableFiltersComponent],
  template: `
    <div class="likecards-orders-page">
      <mat-toolbar color="primary">
        <span>LikeCards Orders</span>
        <span class="spacer"></span>
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
            [actionMode]="'action'"
            (action)="openActions($event)">
          </app-data-table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `.likecards-orders-page{ display:flex; flex-direction:column; gap:16px; }
     .spacer{ flex: 1 1 auto; }`
  ]
})
export class LikeCardsOrdersComponent {
  private ordersService = inject(LikeCardsOrdersService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);

  currentCriteria = signal<LikeCardsOrderCriteria>({});
  private criteriaSubject = new BehaviorSubject<LikeCardsOrderCriteria>({});

  statusOptions = Object.keys(LikeCardsOrderStatus)
    .filter(k => isNaN(Number(k)))
    .map(k => ({ label: k, value: (LikeCardsOrderStatus as any)[k] as LikeCardsOrderStatus }));

  pagedData$: Observable<PagedData<LikeCardsOrderDto>> = this.criteriaSubject.pipe(
    switchMap(criteria =>
      this.ordersService.list(criteria).pipe(
        catchError(error => {
          const message = error?.error?.message || error?.message || 'Failed to load orders';
          this.notificationService.error(message);
          return of({
            items: [],
            pageNumber: 1,
            pageSize: 10,
            totalCount: 0,
            totalPages: 0,
            hasPreviousPage: false,
            hasNextPage: false,
          } as PagedData<LikeCardsOrderDto>);
        })
      )
    ),
    shareReplay(1)
  );

  items$: Observable<LikeCardsOrderDto[]> = this.pagedData$.pipe(map(p => p.items));

  paginationInfo$ = this.pagedData$.pipe(
    map(p => ({
      pageNumber: p.pageNumber,
      pageSize: p.pageSize,
      totalCount: p.totalCount,
      totalPages: p.totalPages,
      hasPreviousPage: p.hasPreviousPage,
      hasNextPage: p.hasNextPage,
    }))
  );

  filterConfig: FilterConfig = {
    showSearch: true,
    searchPlaceholder: 'Search orders...',
    showSort: true,
    sortOptions: [
      { label: 'Requested At', value: 'requestedAt' },
      { label: 'Created Date', value: 'createdAt' },
    ],
    showDateFilters: false,
    customFields: [
      { name: 'playerId', label: 'Player Id', type: 'text', placeholder: 'Guid' },
      { name: 'productId', label: 'Product Id', type: 'text', placeholder: 'Guid' },
      { name: 'status', label: 'Status', type: 'select', options: this.statusOptions },
      { name: 'isVerified', label: 'Is Verified', type: 'boolean' },
      { name: 'requestedFrom', label: 'Requested From', type: 'date' },
      { name: 'requestedTo', label: 'Requested To', type: 'date' },
      { name: 'referenceId', label: 'Reference Id', type: 'text' },
    ],
  };

  columns: ColumnDef<LikeCardsOrderDto>[] = [
    { columnDef: 'referenceId', header: 'Reference' },
    { columnDef: 'player', header: 'Player', cell: r => (r.player as any)?.username ?? '-' },
    { columnDef: 'product', header: 'Product', cell: r => r.product?.title ?? '-' },
    { columnDef: 'quantity', header: 'Qty' },
    { columnDef: 'orderPrice', header: 'Order Price' },
    { columnDef: 'status', header: 'Status', cell: r => (LikeCardsOrderStatus as any)[r.status] ?? String(r.status) },
    { columnDef: 'isVerified', header: 'Verified', cell: r => (r.isVerified ? 'Yes' : 'No') },
    { columnDef: 'requestedAt', header: 'Requested At', cell: r => (r.requestedAt ? new Date(r.requestedAt).toLocaleString() : '-') },
  ];

  onFiltersChanged(criteria: LikeCardsOrderCriteria): void {
    this.currentCriteria.set(criteria);
    this.criteriaSubject.next(criteria);
  }

  openActions(order: LikeCardsOrderDto): void {
    this.dialog
      .open(LikeCardsOrderActionsDialogComponent, { data: { order }, width: '720px', maxWidth: '95vw' })
      .afterClosed()
      .subscribe(result => {
        if (result) {
          this.ordersService.refresh();
        }
      });
  }
}
