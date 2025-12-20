import { Component, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Observable, catchError, map, of, shareReplay, switchMap } from 'rxjs';
import { BaseCriteria } from '../../core/models/base-criteria.model';
import { FilterConfig } from '../../core/models/filter-config.model';
import { PagedData } from '../../core/models/api-response.model';
import { NotificationService } from '../../core/notifications/notification.service';
import { SharedModule } from '../../shared/shared.module';
import { ColumnDef, DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { FormDialogComponent, FormDialogData } from '../../shared/components/form-dialog/form-dialog.component';
import { FormFieldConfig } from '../../shared/components/dynamic-form/dynamic-form.component';
import { TableFiltersComponent } from '../../shared/components/table-filters/table-filters.component';
import { ProductDto } from './models/product.model';
import { ProductService } from './services/product.service';

@Component({
  selector: 'app-store-products',
  standalone: true,
  imports: [SharedModule, DataTableComponent, TableFiltersComponent],
  template: `
    <div class="store-products-page">
      <mat-toolbar color="primary">
        <span>Products</span>
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
            (edit)="openEdit($event)"
            (remove)="deleteProduct($event)">
          </app-data-table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `.store-products-page{ display:flex; flex-direction:column; gap:16px; }
     .spacer{ flex: 1 1 auto; }`
  ]
})
export class StoreProductsComponent {
  private productService = inject(ProductService);
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);

  currentCriteria = signal<BaseCriteria>({});
  private criteriaSubject = new BehaviorSubject<BaseCriteria>({});

  pagedData$: Observable<PagedData<ProductDto>> = this.criteriaSubject.pipe(
    switchMap(criteria =>
      this.productService.list(criteria).pipe(
        catchError(error => {
          const message = error?.error?.message || error?.message || 'Failed to load products';
          this.notificationService.error(message);
          return of({
            items: [],
            pageNumber: 1,
            pageSize: 10,
            totalCount: 0,
            totalPages: 0,
            hasPreviousPage: false,
            hasNextPage: false,
          } as PagedData<ProductDto>);
        })
      )
    ),
    shareReplay(1)
  );

  items$: Observable<ProductDto[]> = this.pagedData$.pipe(map(p => p.items));

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
    searchPlaceholder: 'Search products...',
    showSort: true,
    sortOptions: [
      { name: 'Title', id: 'title' },
      { name: 'Price', id: 'price' },
      { name: 'Created Date', id: 'createdAt' },
    ],
    showDateFilters: true,
    customFields: [
      {
        name: 'isActive',
        label: 'Active Status',
        type: 'boolean',
      },
    ],
  };

  columns: ColumnDef<ProductDto>[] = [
    { columnDef: 'title', header: 'Title' },
    { columnDef: 'price', header: 'Price' },
    { columnDef: 'country', header: 'Country' },
    { columnDef: 'categoryId', header: 'Category Id' },
    { columnDef: 'isEnabled', header: 'Enabled', cell: r => (r.isEnabled ? 'Yes' : 'No') },
  ];

  private get formConfig(): FormFieldConfig[] {
    return [
      { name: 'title', label: 'Title', type: 'text', required: true, validators: [{ name: 'maxLength', value: 200 }] },
      { name: 'price', label: 'Price', type: 'number', required: true, validators: [{ name: 'min', value: 1 }] },
      { name: 'imageUrl', label: 'Image Url', type: 'text', required: true, validators: [{ name: 'maxLength', value: 500 }] },
      { name: 'isActive', label: 'Active', type: 'toggle', defaultValue: true },
    ];
  }

  onFiltersChanged(criteria: BaseCriteria): void {
    this.currentCriteria.set(criteria);
    this.criteriaSubject.next(criteria);
  }

  openEdit(row: ProductDto): void {
    const data: FormDialogData = {
      title: 'Update Product',
      submitLabel: 'Update',
      config: this.formConfig,
      cols: 1,
      value: {
        title: row.title,
        price: row.price,
        imageUrl: row.imageUrl,
        isActive: row.isEnabled,
      },
    };

    this.dialog
      .open(FormDialogComponent, { data, width: '720px', maxWidth: '95vw' })
      .afterClosed()
      .subscribe(result => {
        if (!result) return;

        this.productService.updateProduct(row.id, result).subscribe({
          next: () => {
            this.notificationService.success('Product updated');
            this.productService.refresh();
          },
          error: error => {
            const message = error?.error?.message || error?.message || 'Failed to update product';
            this.notificationService.error(message);
          },
        });
      });
  }

  deleteProduct(row: ProductDto): void {
    if (!confirm(`Delete product ${row.title}?`)) return;

    this.productService.deleteProduct(row.id).subscribe({
      next: () => this.notificationService.success('Product deleted'),
      error: error => {
        const message = error?.error?.message || error?.message || 'Failed to delete product';
        this.notificationService.error(message);
      },
    });
  }
}
