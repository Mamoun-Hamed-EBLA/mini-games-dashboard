import { Component, inject, signal } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { DataTableComponent, ColumnDef } from '../../shared/components/data-table/data-table.component';
import { FormDialogComponent, FormDialogData } from '../../shared/components/form-dialog/form-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Player } from '../../core/models/player.model';
import { Observable, BehaviorSubject, switchMap, map, catchError, of } from 'rxjs';
import { PlayerService } from '../../core/services/player.service';
import { NotificationService } from '../../core/notifications/notification.service';
import { BaseCriteria } from '../../core/models/base-criteria.model';
import { FilterConfig } from '../../core/models/filter-config.model';
import { TableFiltersComponent } from '../../shared/components/table-filters/table-filters.component';
import { PagedData } from '../../core/models/api-response.model';

@Component({
  selector: 'app-players',
  standalone: true,
  imports: [SharedModule, DataTableComponent, TableFiltersComponent],
  template: `
    <div class="players-page">
      <mat-toolbar color="primary">
        <span>Players</span>
        <span class="spacer"></span>
        <button mat-raised-button color="accent" (click)="openCreate()">
          <mat-icon>add</mat-icon>
          New Player
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
            [data]="(players$ | async) ?? []" 
            [paginationInfo]="(paginationInfo$ | async) ?? null"
            [actions]="true"
            (edit)="openEdit($event)" 
            (remove)="deletePlayer($event)">
          </app-data-table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `.players-page{ display:flex; flex-direction:column; gap:16px; }
     .spacer{ flex: 1 1 auto; }`
  ]
})
export class PlayersComponent {
  private playerService = inject(PlayerService);
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);

  currentCriteria = signal<BaseCriteria>({});
  private criteriaSubject = new BehaviorSubject<BaseCriteria>({});

  pagedData$: Observable<PagedData<Player>> = this.criteriaSubject.pipe(
    switchMap(criteria => this.playerService.list(criteria).pipe(
      catchError(error => {
        console.error('Error loading players:', error);
        this.notificationService.error(
          error?.error?.message || error?.message || 'Failed to load players'
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
    ))
  );

  players$: Observable<Player[]> = this.pagedData$.pipe(
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
    searchPlaceholder: 'Search players...',
    showSort: true,
    sortOptions: [
      { label: 'Username', value: 'username' },
      { label: 'Score', value: 'score' },
      { label: 'Last Login', value: 'lastLoginAt' },
      { label: 'Created At', value: 'createdAt' },
    ],
    showDateFilters: false,
    customFields: [],
  };

  columns: ColumnDef<Player>[] = [
    { columnDef: 'username', header: 'Username' },
    { columnDef: 'socialMediaId', header: 'Social Media ID' },
    { columnDef: 'countryCode', header: 'Country' },
    { columnDef: 'score', header: 'Score' },
    { columnDef: 'isActive', header: 'Active', cell: r => (r.isActive ? 'Yes' : 'No') },
    { columnDef: 'lastLoginAt', header: 'Last Login', cell: r => r.lastLoginAt ? new Date(r.lastLoginAt).toLocaleString() : '-' },
    { columnDef: 'createdAt', header: 'Created At', cell: r => new Date(r.createdAt).toLocaleString() },
    { columnDef: 'createdBy', header: 'Created By' },
    { columnDef: 'updatedAt', header: 'Updated At', cell: r => r.updatedAt ? new Date(r.updatedAt).toLocaleString() : '-' },
    { columnDef: 'updatedBy', header: 'Updated By' },
  ];

  constructor() {}

  onFiltersChanged(criteria: BaseCriteria): void {
    this.currentCriteria.set(criteria);
    this.criteriaSubject.next(criteria);
  }

  openCreate() {
    const data: FormDialogData = {
      title: 'Create Player',
      submitLabel: 'Create',
      cols: 2,
      config: [
        { name: 'username', label: 'Username', type: 'text', required: true, colSpan: 2 },
        { name: 'socialMediaId', label: 'Social Media Id', type: 'text' },
        { name: 'countryCode', label: 'Country Code', type: 'text', hint: 'e.g., US, EG, FR' },
        { name: 'icon', label: 'Icon', type: 'text' },
        { name: 'frame', label: 'Frame', type: 'text' },
        { name: 'score', label: 'Score', type: 'number', validators: [{ name: 'min', value: 0 }] },
        { name: 'lastLoginAt', label: 'Last Login', type: 'date' },
        { name: 'isActive', label: 'Active', type: 'toggle', defaultValue: true, colSpan: 2 },
      ],
    };
    this.dialog.open(FormDialogComponent, { data, width: '720px', maxWidth: '95vw' }).afterClosed().subscribe(result => {
      if (result) {
        this.playerService.create(result).subscribe(() => {
          this.notificationService.success('Player created');
        });
      }
    });
  }

  openEdit(row: Player) {
    const data: FormDialogData = {
      title: 'Edit Player',
      submitLabel: 'Update',
      cols: 2,
      value: row,
      config: [
        { name: 'username', label: 'Username', type: 'text', required: true, colSpan: 2 },
        { name: 'socialMediaId', label: 'Social Media Id', type: 'text' },
        { name: 'countryCode', label: 'Country Code', type: 'text' },
        { name: 'icon', label: 'Icon', type: 'text' },
        { name: 'frame', label: 'Frame', type: 'text' },
        { name: 'score', label: 'Score', type: 'number', validators: [{ name: 'min', value: 0 }] },
        { name: 'lastLoginAt', label: 'Last Login', type: 'date' },
        { name: 'isActive', label: 'Active', type: 'toggle', colSpan: 2 },
      ],
    };
    this.dialog.open(FormDialogComponent, { data, width: '720px', maxWidth: '95vw' }).afterClosed().subscribe(result => {
      if (result) {
        this.playerService.update(row.id, result).subscribe(() => {
          this.notificationService.success('Player updated');
        });
      }
    });
  }

  deletePlayer(player: Player): void {
    if (confirm(`Delete player ${player.username}?`)) {
      this.playerService.delete(player.id).subscribe(() => {
        this.notificationService.success('Player deleted');
      });
    }
  }
}
