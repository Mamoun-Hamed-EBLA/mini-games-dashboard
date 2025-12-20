import { Component, inject, signal } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of, shareReplay, switchMap } from 'rxjs';
import { SharedModule } from '../../shared/shared.module';
import { TableFiltersComponent } from '../../shared/components/table-filters/table-filters.component';
import { ColumnDef, DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { FilterConfig } from '../../core/models/filter-config.model';
import { PagedData } from '../../core/models/api-response.model';
import { NotificationService } from '../../core/notifications/notification.service';
import { ProductSerialService } from './services/product.serial.service';
import { ProductSerialDto } from './models/product-serial.model';
import { ProductSerialCriteria } from './models/product-serial-criteria.model';

@Component({
  selector: 'app-product-serials',
  standalone: true,
  imports: [SharedModule, DataTableComponent, TableFiltersComponent],
  template: `
    <div class="product-serials-page">
      <mat-toolbar color="primary">
        <span>Product Serials</span>
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
            [paginationInfo]="(paginationInfo$ | async) ?? null">
          </app-data-table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `.product-serials-page{ display:flex; flex-direction:column; gap:16px; }
     .spacer{ flex: 1 1 auto; }`
  ]
})
export class ProductSerialsComponent {
  private serialService = inject(ProductSerialService);
  private notificationService = inject(NotificationService);

  currentCriteria = signal<ProductSerialCriteria>({});
  private criteriaSubject = new BehaviorSubject<ProductSerialCriteria>({});

  pagedData$: Observable<PagedData<ProductSerialDto>> = this.criteriaSubject.pipe(
    switchMap(criteria =>
      this.serialService.list(criteria).pipe(
        catchError(error => {
          const message = error?.error?.message || error?.message || 'Failed to load serials';
          this.notificationService.error(message);
          return of({
            items: [],
            pageNumber: 1,
            pageSize: 10,
            totalCount: 0,
            totalPages: 0,
            hasPreviousPage: false,
            hasNextPage: false,
          } as PagedData<ProductSerialDto>);
        })
      )
    ),
    shareReplay(1)
  );

  items$: Observable<ProductSerialDto[]> = this.pagedData$.pipe(map(p => p.items));

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
    searchPlaceholder: 'Search serials...',
    showSort: true,
    sortOptions: [
      { name: 'Valid To', id: 'validTo' },
      { name: 'Created Date', id: 'createdAt' },
    ],
    showDateFilters: false,
    customFields: [
      { name: 'productId', label: 'Product Id', type: 'text', placeholder: 'Guid' },
      { name: 'ownerId', label: 'Owner Id', type: 'text', placeholder: 'Guid' },
      { name: 'isUsed', label: 'Is Used', type: 'boolean' },
      { name: 'validFrom', label: 'Valid From', type: 'date' },
      { name: 'validTo', label: 'Valid To', type: 'date' },
    ],
  };

  columns: ColumnDef<ProductSerialDto>[] = [
    { columnDef: 'product', header: 'Product', cell: r => r.product?.title ?? '-' },
    { columnDef: 'owner', header: 'Owner', cell: r => (r.owner as any)?.username ?? '-' },
    { columnDef: 'code', header: 'Code' },
    { columnDef: 'serialNumber', header: 'Serial Number' },
    { columnDef: 'isUsed', header: 'Used', cell: r => (r.isUsed ? 'Yes' : 'No') },
    { columnDef: 'validTo', header: 'Valid To', cell: r => (r.validTo ? new Date(r.validTo).toLocaleString() : '-') },
  ];

  onFiltersChanged(criteria: ProductSerialCriteria): void {
    this.currentCriteria.set(criteria);
    this.criteriaSubject.next(criteria);
  }
}
