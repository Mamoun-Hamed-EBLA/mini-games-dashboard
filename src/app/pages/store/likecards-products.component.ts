import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Observable, catchError, filter, map, of, shareReplay, startWith, switchMap } from 'rxjs';
import { NotificationService } from '../../core/notifications/notification.service';
import { SharedModule } from '../../shared/shared.module';
import { ColumnDef, DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { FormDialogComponent, FormDialogData } from '../../shared/components/form-dialog/form-dialog.component';
import { FormFieldConfig } from '../../shared/components/dynamic-form/dynamic-form.component';
import { ClientLanguage } from './enums/client-language.enum';
import { Country } from './enums/country.enum';
import { LikeCardsProductDto } from './models/likecards.model';
import { ProductService } from './services/product.service';

@Component({
  selector: 'app-likecards-products',
  standalone: true,
  imports: [SharedModule, DataTableComponent, ReactiveFormsModule],
  template: `
    <div class="likecards-products-page">
      <mat-toolbar color="primary">
        <span>LikeCards Products</span>
        <span class="spacer"></span>
      </mat-toolbar>

      <mat-card>
        <mat-card-content>
          <div class="filters-row">
            <mat-form-field appearance="outline" class="country-field">
              <mat-label>Country</mat-label>
              <mat-select [formControl]="countryControl">
                @for (option of countryOptions; track option.value) {
                  <mat-option [value]="option.value">{{ option.label }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>

          @if (errorMessage$ | async; as errorMessage) {
            <div class="error-box">{{ errorMessage }}</div>
          }

          <app-data-table
            [columns]="columns"
            [data]="(items$ | async) ?? []"
            [actions]="true"
            [actionMode]="'add'"
            (add)="openAdd($event)">
          </app-data-table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `.likecards-products-page{ display:flex; flex-direction:column; gap:16px; }
     .spacer{ flex: 1 1 auto; }
     .filters-row{ display:flex; gap:12px; align-items:center; margin-bottom: 8px; }
     .country-field{ width: 320px; max-width: 100%; }
     .error-box{ padding: 12px 14px; border: 1px solid rgba(239,68,68,.35); background: rgba(239,68,68,.08); color: #991b1b; border-radius: 10px; margin-bottom: 12px; }`
  ]
})
export class LikeCardsProductsComponent {
  private productService = inject(ProductService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);

  countryControl = new FormControl<Country>(Country.Emirates, { nonNullable: true });

  private errorMessageSubject = new BehaviorSubject<string | null>(null);
  errorMessage$ = this.errorMessageSubject.asObservable();

  countryOptions = Object.keys(Country)
    .filter(key => isNaN(Number(key)))
    .map(key => ({
      label: key.replace(/_/g, ' '),
      value: (Country as any)[key] as Country,
    }));

  items$: Observable<LikeCardsProductDto[]> = this.countryControl.valueChanges.pipe(
    startWith(this.countryControl.value),
    filter((country): country is Country => country !== null && country !== undefined),
    switchMap(country => {
      this.errorMessageSubject.next(null);
      return this.productService.getLikeCardsProducts({ country, language: ClientLanguage.English }).pipe(
        catchError(error => {
          const message = error?.error?.message || error?.message || 'Failed to load LikeCards products';
          this.errorMessageSubject.next(message);
          this.notificationService.error(message);
          return of([] as LikeCardsProductDto[]);
        })
      );
    }),
    shareReplay(1)
  );

  columns: ColumnDef<LikeCardsProductDto>[] = [
    { columnDef: 'productName', header: 'Name' },
    { columnDef: 'productCurrency', header: 'Currency' },
    { columnDef: 'productPrice', header: 'LikeCards Price', cell: r => r.productPrice },
    { columnDef: 'available', header: 'Available', cell: r => (r.available ? 'Yes' : 'No') },
    { columnDef: 'categoryId', header: 'Category Id' },
    { columnDef: 'productId', header: 'Product Id' },
  ];

  private get priceFormConfig(): FormFieldConfig[] {
    return [
      {
        name: 'price',
        label: 'Price',
        type: 'number',
        required: true,
        validators: [{ name: 'min', value: 1 }],
      },
    ];
  }

  openAdd(row: LikeCardsProductDto): void {
    if (!row.available) {
      this.notificationService.info('This product is not available');
      return;
    }

    const data: FormDialogData = {
      title: `Add: ${row.productName}`,
      submitLabel: 'Create',
      config: this.priceFormConfig,
      value: { price: Math.ceil(Number(row.productPrice) || 1) },
      cols: 1,
    };

    this.dialog
      .open(FormDialogComponent, { data, width: '520px', maxWidth: '95vw' })
      .afterClosed()
      .pipe(
        filter(result => !!result),
        map(result => ({ price: Number((result as any).price) }))
      )
      .subscribe(({ price }) => {
        const payload = {
          title: row.productName,
          price,
          imageUrl: row.productImage,
          categoryId: row.categoryId,
          country: this.countryControl.value,
          isActive: true,
        };

        this.productService.createProduct(payload).subscribe({
          next: () => {
            this.notificationService.success('Product created');
            this.productService.refresh();
          },
          error: error => {
            const message = error?.error?.message || error?.message || 'Failed to create product';
            this.notificationService.error(message);
          },
        });
      });
  }
}
