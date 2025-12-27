import { Component, inject, signal } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, shareReplay, switchMap } from 'rxjs';
import { PagedData } from '../../core/models/api-response.model';
import { FilterConfig } from '../../core/models/filter-config.model';
import { SessionCriteria } from '../../core/models/page-criteria.models';
import { NotificationService } from '../../core/notifications/notification.service';
import { ColumnDef, DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { TableFiltersComponent } from '../../shared/components/table-filters/table-filters.component';
import { SharedModule } from '../../shared/shared.module';
import { Game } from '../game/game.model';
import { GameService } from '../game/game.service';
import { GameStatus } from './GameStatus';
import { GameSession } from './session.model';
import { SessionService } from './session.service';
import { DateUtilities } from '../../core/utils/date-utilities';

@Component({
  selector: 'app-sessions',
  standalone: true,
  imports: [SharedModule, DataTableComponent, TableFiltersComponent],
  template: `
    <div class="sessions-page">
      <mat-card>
        <mat-card-content>
          <!-- Game Selection -->
          <div class="game-selector">
            <mat-form-field appearance="outline" class="game-select-field">
              <mat-label>Select Game</mat-label>
              <mat-select [(value)]="selectedGameId" (selectionChange)="onGameSelected($event.value)">
                @for (game of (allGames$ | async) ?? []; track game.id) {
                  <mat-option [value]="game.id">{{ game.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>

          <!-- Filters -->
          <app-table-filters 
            [config]="filterConfig"
            [initialCriteria]="currentCriteria()"
            (filtersChanged)="onFiltersChanged($event)">
          </app-table-filters>
          
          <!-- Data Table -->
          @if (selectedGameId) {
            <app-data-table 
              [columns]="columns" 
              [data]="(sessions$ | async) ?? []" 
              [paginationInfo]="(paginationInfo$ | async) ?? null"
              [actions]="false"
            >
            </app-data-table>
          } @else {
            <div class="no-game-selected">
              <mat-icon class="large-icon">info</mat-icon>
              <h3>No Game Selected</h3>
              <p>Please select a game from the dropdown above to view its sessions.</p>
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `.sessions-page{ display:flex; flex-direction:column; gap:16px; }`,
    `.spacer{ flex: 1 1 auto; }`,
    `.game-selector{ margin-bottom: 1rem; }`,
    `.game-select-field{ min-width: 300px; }`,
    `.no-game-selected{ display:flex; flex-direction:column; align-items:center; justify-content:center; padding:4rem 2rem; text-align:center; color:#64748b; }`,
    `.no-game-selected .large-icon{ font-size:64px; width:64px; height:64px; color:#94a3b8; margin-bottom:1rem; }`,
    `.no-game-selected h3{ margin:0 0 0.5rem 0; color:#475569; }`,
    `.no-game-selected p{ margin:0; font-size:14px; }`
  ]
})
export class SessionsComponent {
  private sessionService = inject(SessionService);
  private notificationService = inject(NotificationService);
  private gameService = inject(GameService);

  selectedGameId: string | null = null;
  statusOptions = Object.keys(GameStatus)
    .filter(key => isNaN(Number(key)))
    .map(key => ({ id: key, name: key }));

  currentCriteria = signal<SessionCriteria>({});
  private criteriaSubject = new BehaviorSubject<SessionCriteria>({});

  pagedData$: Observable<PagedData<GameSession>> = this.criteriaSubject.pipe(
    switchMap(criteria => {
      if (!criteria.gameId) {
        return of({
          items: [],
          pageNumber: 1,
          pageSize: 10,
          totalCount: 0,
          totalPages: 0,
          hasPreviousPage: false,
          hasNextPage: false,
        });
      }
      return this.sessionService.list(criteria).pipe(
        catchError(error => {
          console.error('Error loading sessions:', error);
          this.notificationService.error(
            error?.error?.message || error?.message || 'Failed to load game sessions'
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
      );
    }),
    shareReplay(1)
  );

  sessions$: Observable<GameSession[]> = this.pagedData$.pipe(
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

  allGames$: Observable<Game[]> = this.gameService.loadAsLookup().pipe(
    map(pagedData => pagedData as any)
  );

  filterConfig: FilterConfig = {
    showSearch: false,
    showSort: true,
    sortOptions: [
      { name: 'Started At', id: 'startedAt' },
      { name: 'Ended At', id: 'endedAt' },
      { name: 'Final Score', id: 'finalScore' },
      { name: 'Status', id: 'status' },
    ],
    showDateFilters: false,
    customFields: [
      {
        name: 'minScore',
        label: 'Min Score',
        type: 'number',
        placeholder: 'Minimum score',
      },
      {
        name: 'maxScore',
        label: 'Max Score',
        type: 'number',
        placeholder: 'Maximum score',
      },
      {
        name: 'startedFrom',
        label: 'Started From',
        type: 'date',
      },
      {
        name: 'startedTo',
        label: 'Started To',
        type: 'date',
      },
      {
        name: 'endedFrom',
        label: 'Ended From',
        type: 'date',
      },
      {
        name: 'endedTo',
        label: 'Ended To',
        type: 'date',
      },
      {
        name: 'minDuration',
        label: 'Min Duration (sec)',
        type: 'number',
      },
      {
        name: 'maxDuration',
        label: 'Max Duration (sec)',
        type: 'number',
      },
      {
        name: 'playerId',
        label: 'Player Id',
        type: 'text',
        placeholder: 'Guid',
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        options: this.statusOptions,
      },
    ],
  };

  columns: ColumnDef<GameSession>[] = [
    { columnDef: 'gameName', header: 'Game' },
    { columnDef: 'status', header: 'Status', cell: r => GameStatus[r.status] },
    { columnDef: 'finalScore', header: 'Final Score' },
    { columnDef: 'startedAt', header: 'Started', cell: r => DateUtilities.formatDateTime(r.startedAt) },
    { columnDef: 'endedAt', header: 'Ended', cell: r => DateUtilities.formatDateTime(r.endedAt) },
    { columnDef: 'duration', header: 'Duration', cell: r => DateUtilities.formatDuration(r.duration) },
    { columnDef: 'rejectionReason', header: 'Rejection Reason', cell: r => r.rejectionReason || '-' },
    { columnDef: 'createdBy', header: 'Created By' },
  ];

  constructor() {
    
  }

  onGameSelected(gameId: string | null): void {
    const criteria = { ...this.currentCriteria(), gameId: gameId || undefined };
    this.currentCriteria.set(criteria);
    this.criteriaSubject.next(criteria);
  }

  onFiltersChanged(criteria: SessionCriteria): void {
    const mergedCriteria = { ...criteria, gameId: this.selectedGameId || undefined };
    this.currentCriteria.set(mergedCriteria);
    this.criteriaSubject.next(mergedCriteria);
  }

}
