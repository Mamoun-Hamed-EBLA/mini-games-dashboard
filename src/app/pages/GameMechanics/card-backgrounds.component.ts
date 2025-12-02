import { Component, WritableSignal, inject, signal } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { DataTableComponent, ColumnDef } from '../../shared/components/data-table/data-table.component';
import { TableFiltersComponent } from '../../shared/components/table-filters/table-filters.component';
import { MatDialog } from '@angular/material/dialog';
import { FormDialogComponent, FormDialogData } from '../../shared/components/form-dialog/form-dialog.component';
import { CardBackground } from '../../core/models/card-background.model';
import { CardBackgroundService } from '../../core/services/card-background.service';
import { NotificationService } from '../../core/notifications/notification.service';
import { Observable, BehaviorSubject, switchMap, map, catchError, of, shareReplay } from 'rxjs';
import { BaseCriteria } from '../../core/models/base-criteria.model';
import { FilterConfig } from '../../core/models/filter-config.model';
import { PagedData } from '../../core/models/api-response.model';
import { FormFieldConfig } from '../../shared/components/dynamic-form/dynamic-form.component';
import { Game } from '../../core/models/game.model';
import { GameService } from '../../core/services/game.service';

interface CardBackgroundCriteria extends BaseCriteria {
  gameId?: string;
  isActive?: boolean;
  isPurchasable?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

@Component({
  selector: 'app-card-backgrounds',
  standalone: true,
  imports: [SharedModule, DataTableComponent, TableFiltersComponent],
  template: `
    <div class="card-backgrounds-page">
      <mat-toolbar color="primary">
        <span>Card Backgrounds</span>
        <span class="spacer"></span>
        <button mat-raised-button color="accent" (click)="openCreate()">
          <mat-icon>add</mat-icon>
          New Card Background
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
            (remove)="deleteItem($event)">
          </app-data-table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `.card-backgrounds-page{ display:flex; flex-direction:column; gap:16px; }
     .spacer{ flex: 1 1 auto; }`
  ]
})
export class CardBackgroundsComponent {
  private cardBackgroundService = inject(CardBackgroundService);
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);
  private gameService = inject(GameService);

  currentCriteria = signal<CardBackgroundCriteria>({});
  private criteriaSubject = new BehaviorSubject<CardBackgroundCriteria>({});

  pagedData$: Observable<PagedData<CardBackground>> = this.criteriaSubject.pipe(
    switchMap(criteria => this.cardBackgroundService.list(criteria).pipe(
      catchError(error => {
        console.error('Error loading card backgrounds:', error);
        this.notificationService.error(
          error?.error?.message || error?.message || 'Failed to load card backgrounds'
        );
        return of({
          items: [],
          pageNumber: 1,
          pageSize: 10,
          totalCount: 0,
          totalPages: 0,
          hasPreviousPage: false,
          hasNextPage: false,
        });
      })
    )),
    shareReplay(1)
  );

  items$: Observable<CardBackground[]> = this.pagedData$.pipe(
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

  gameOptions: { label: string; value: string }[] = [];

  filterConfig: FilterConfig = {
    showSearch: true,
    searchPlaceholder: 'Search card backgrounds...',
    showSort: true,
    sortOptions: [
      { label: 'Name', value: 'name' },
      { label: 'Price', value: 'price' },
      { label: 'Created Date', value: 'createdAt' },
    ],
    showDateFilters: true,
    customFields: [
      {
        name: 'gameId',
        label: 'Game',
        type: 'select',
        options: [],
      },
      {
        name: 'isActive',
        label: 'Active Status',
        type: 'boolean',
      },
      {
        name: 'isPurchasable',
        label: 'Purchasable',
        type: 'boolean',
      },
      {
        name: 'minPrice',
        label: 'Min Price',
        type: 'number',
        placeholder: 'Minimum price',
      },
      {
        name: 'maxPrice',
        label: 'Max Price',
        type: 'number',
        placeholder: 'Maximum price',
      },
    ],
  };

  columns: ColumnDef<CardBackground>[] = [
    { columnDef: 'name', header: 'Name' },
    { columnDef: 'gameId', header: 'Game ID' },
    { columnDef: 'description', header: 'Description' },
    { columnDef: 'imageUrl', header: 'Image URL' },
    { columnDef: 'isPurchasable', header: 'Purchasable', cell: r => (r.isPurchasable ? 'Yes' : 'No') },
    { columnDef: 'price', header: 'Price' },
    { columnDef: 'isActive', header: 'Active', cell: r => (r.isActive ? 'Yes' : 'No') },
    { columnDef: 'createdAt', header: 'Created At', cell: r => new Date(r.createdAt).toLocaleString() },
    { columnDef: 'createdBy', header: 'Created By' },
    { columnDef: 'updatedAt', header: 'Updated At', cell: r => r.updatedAt ? new Date(r.updatedAt).toLocaleString() : '-' },
    { columnDef: 'updatedBy', header: 'Updated By' },
  ];

  formFields: WritableSignal<FormFieldConfig[]> = signal([
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'gameId', label: 'Game', type: 'select', required: true, options: this.gameOptions },
        { name: 'imageUrl', label: 'Image URL', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
        { name: 'isPurchasable', label: 'Purchasable', type: 'toggle', defaultValue: false },
        { name: 'price', label: 'Price', type: 'number',
          defaultValue:0,
          validators: [{ name: 'min', value: 0 }], visible: v => !!v['isPurchasable'] },
        { name: 'isActive', label: 'Active', type: 'toggle', defaultValue: true },
      ]);

  constructor() {
    this.gameService.list().pipe(
      catchError(error => {
        console.error('Error loading games:', error);
        this.notificationService.error('Failed to load games list');
        return of({ items: [], pageNumber: 1, pageSize: 10, totalCount: 0, totalPages: 0, hasPreviousPage: false, hasNextPage: false });
      })
    ).subscribe(games => {
      const options = games.items.map((g: Game) => ({ label: g.name, value: g.id }));

      // Update form select options
      this.formFields.update((fields: FormFieldConfig[]) =>
        fields.map((field: FormFieldConfig) => field.name === 'gameId' ? { ...field, options } : field)
      );

      // Update filter select options
      const gameField = this.filterConfig.customFields?.find(f => f.name === 'gameId');
      if (gameField) {
        gameField.options = options;
      }
    });
  }

  onFiltersChanged(criteria: CardBackgroundCriteria): void {
    this.currentCriteria.set(criteria);
    this.criteriaSubject.next(criteria);
  }

  openCreate() {
    const data: FormDialogData = {
      title: 'Create Card Background',
      submitLabel: 'Create',
      cols: 2,
      config: this.formFields(),
    };
    this.dialog
      .open(FormDialogComponent, { data, width: '720px', maxWidth: '95vw' })
      .afterClosed()
      .subscribe(result => {
        if (result) {
          this.cardBackgroundService.create(result).subscribe(() => {
            this.notificationService.success('Card background created');
          });
        }
      });
  }

  openEdit(row: CardBackground) {
    const data: FormDialogData = {
      title: 'Edit Card Background',
      submitLabel: 'Update',
      value: row,
      cols: 2,
      config: this.formFields(),
    };
    this.dialog
      .open(FormDialogComponent, { data, width: '720px', maxWidth: '95vw' })
      .afterClosed()
      .subscribe(result => {
        if (result) {
          this.cardBackgroundService.update(row.id, result).subscribe(() => {
            this.notificationService.success('Card background updated');
          });
        }
      });
  }

  deleteItem(row: CardBackground): void {
    if (confirm(`Delete card background ${row.name}?`)) {
      this.cardBackgroundService.delete(row.id).subscribe(() => {
        this.notificationService.success('Card background deleted');
      });
    }
  }
}
