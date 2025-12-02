import { Component, Signal, inject, signal } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { DataTableComponent, ColumnDef } from '../../shared/components/data-table/data-table.component';
import { TableFiltersComponent } from '../../shared/components/table-filters/table-filters.component';
import { MatDialog } from '@angular/material/dialog';
import { FormDialogComponent, FormDialogData } from '../../shared/components/form-dialog/form-dialog.component';
import { Badge } from '../../core/models/badge.model';
import { BadgeService } from '../../core/services/badge.service';
import { NotificationService } from '../../core/notifications/notification.service';
import { BadgeType } from '../../core/enums/BadgeType';
import { Observable, BehaviorSubject, switchMap, map, catchError, of, shareReplay } from 'rxjs';
import { BaseCriteria } from '../../core/models/base-criteria.model';
import { FilterConfig } from '../../core/models/filter-config.model';
import { PagedData } from '../../core/models/api-response.model';
import { FormFieldConfig } from '../../shared/components/dynamic-form/dynamic-form.component';

@Component({
  selector: 'app-badges',
  standalone: true,
  imports: [SharedModule, DataTableComponent, TableFiltersComponent],
  template: `
    <div class="badges-page">
      <mat-toolbar color="primary">
        <span>Badges</span>
        <span class="spacer"></span>
        <button mat-raised-button color="accent" (click)="openCreate()">
          <mat-icon>add</mat-icon>
          New Badge
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
            [data]="(badges$ | async) ?? []" 
            [paginationInfo]="(paginationInfo$ | async) ?? null"
            [actions]="true"
            (edit)="openEdit($event)" 
            (remove)="deleteBadge($event)">
          </app-data-table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `.badges-page{ display:flex; flex-direction:column; gap:16px; }
     .spacer{ flex: 1 1 auto; }`
  ]
})
export class BadgesComponent {
  private badgeService = inject(BadgeService);
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);

  currentCriteria = signal<BaseCriteria>({});
  private criteriaSubject = new BehaviorSubject<BaseCriteria>({});

  pagedData$: Observable<PagedData<Badge>> = this.criteriaSubject.pipe(
    switchMap(criteria => this.badgeService.list(criteria).pipe(
      catchError(error => {
        console.error('Error loading badges:', error);
        this.notificationService.error(
          error?.error?.message || error?.message || 'Failed to load badges'
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

  badges$: Observable<Badge[]> = this.pagedData$.pipe(
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
    searchPlaceholder: 'Search badges...',
    showSort: true,
    sortOptions: [
      { label: 'Name', value: 'name' },
      { label: 'Created Date', value: 'createdAt' },
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

  columns: ColumnDef<Badge>[] = [
    { columnDef: 'name', header: 'Name' },
    { columnDef: 'badgeType', header: 'Type', cell: r => BadgeType[r.badgeType] },
    { columnDef: 'description', header: 'Description' },
    { columnDef: 'iconUrl', header: 'Icon URL' },
    { columnDef: 'isActive', header: 'Active', cell: r => (r.isActive ? 'Yes' : 'No') },
    { columnDef: 'createdAt', header: 'Created At', cell: r => new Date(r.createdAt).toLocaleString() },
    { columnDef: 'createdBy', header: 'Created By' },
    { columnDef: 'updatedAt', header: 'Updated At', cell: r => r.updatedAt ? new Date(r.updatedAt).toLocaleString() : '-' },
    { columnDef: 'updatedBy', header: 'Updated By' },
  ];

  formFields: Signal<FormFieldConfig[]> = signal([
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'badgeType', label: 'Badge Type', type: 'select', required: true, enumType: BadgeType },
        { name: 'iconUrl', label: 'Icon URL', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
        { name: 'isActive', label: 'Active', type: 'toggle', defaultValue: true },
      ]);

  onFiltersChanged(criteria: BaseCriteria): void {
    this.currentCriteria.set(criteria);
    this.criteriaSubject.next(criteria);
  }

  openCreate() {
    const data: FormDialogData = {
      title: 'Create Badge',
      submitLabel: 'Create',
      cols: 2,
      config: this.formFields(),
    };
    this.dialog
      .open(FormDialogComponent, { data, width: '720px', maxWidth: '95vw' })
      .afterClosed()
      .subscribe(result => {
        if (result) {
          this.badgeService.create(result).subscribe(() => {
            this.notificationService.success('Badge created');
          });
        }
      });
  }

  openEdit(row: Badge) {
    const data: FormDialogData = {
      title: 'Edit Badge',
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
          this.badgeService.update(row.id, result).subscribe(() => {
            this.notificationService.success('Badge updated');
          });
        }
      });
  }

  deleteBadge(badge: Badge): void {
    if (confirm(`Delete badge ${badge.name}?`)) {
      this.badgeService.delete(badge.id).subscribe(() => {
        this.notificationService.success('Badge deleted');
      });
    }
  }
}
