import { Component, inject, signal } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, shareReplay, switchMap } from 'rxjs';
import { PagedData } from '../../core/models/api-response.model';
import { BaseCriteria } from '../../core/models/base-criteria.model';
import { FilterConfig } from '../../core/models/filter-config.model';
import { NotificationService } from '../../core/notifications/notification.service';
import { ColumnDef, DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { TableFiltersComponent } from '../../shared/components/table-filters/table-filters.component';
import { SharedModule } from '../../shared/shared.module';
import { Player } from './player.model';
import { PlayerService } from './player.service';
import { DateUtilities } from '../../core/utils/date-utilities';

@Component({
  selector: 'app-players',
  standalone: true,
  imports: [SharedModule, DataTableComponent, TableFiltersComponent],
  template: `
    <div class="players-page">
      <mat-toolbar color="primary">
        <span>Players</span>
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
            [data]="(players$ | async) ?? []" 
            [paginationInfo]="(paginationInfo$ | async) ?? null"
            [actions]="false">
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
    )),
    shareReplay(1)
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
      { name: 'Username', id: 'username' },
      { name: 'Score', id: 'score' },
      { name: 'Last Login', id: 'lastLoginAt' },
      { name: 'Created At', id: 'createdAt' },
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
    { columnDef: 'lastLoginAt', header: 'Last Login', cell: r => DateUtilities.formatDateTime(r.lastLoginAt)},
  ];

  constructor() {}

  onFiltersChanged(criteria: BaseCriteria): void {
    this.currentCriteria.set(criteria);
    this.criteriaSubject.next(criteria);
  }


  deletePlayer(player: Player): void {
    if (confirm(`Delete player ${player.username}?`)) {
      this.playerService.delete(player.id).subscribe(() => {
        this.notificationService.success('Player deleted');
      });
    }
  }
}
