import { Component, inject, signal } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { DataTableComponent, ColumnDef } from '../../shared/components/data-table/data-table.component';
import { MatDialog } from '@angular/material/dialog';
import { FormDialogComponent, FormDialogData } from '../../shared/components/form-dialog/form-dialog.component';
import { GameSession } from './session.model';
import { GameStatus } from './GameStatus';
import { SessionService } from './session.service';
import { GameService } from '../game/game.service';
import { NotificationService } from '../../core/notifications/notification.service';
import { Observable, switchMap, BehaviorSubject, map, of, catchError, shareReplay } from 'rxjs';
import { Game } from '../game/game.model';
import { Player } from '../players/player.model';
import { SessionCriteria } from '../../core/models/page-criteria.models';
import { FilterConfig } from '../../core/models/filter-config.model';
import { TableFiltersComponent } from '../../shared/components/table-filters/table-filters.component';
import { PagedData } from '../../core/models/api-response.model';
import { PlayerService } from '../players/player.service';

@Component({
  selector: 'app-sessions',
  standalone: true,
  imports: [SharedModule, DataTableComponent, TableFiltersComponent],
  template: `
    <div class="sessions-page">
      <mat-toolbar color="primary">
        <span>Game Sessions</span>
        <span class="spacer"></span>
        <button mat-raised-button color="accent" (click)="openCreate()">
          <mat-icon>add</mat-icon>
          New Session
        </button>
      </mat-toolbar>

      <mat-card>
        <mat-card-content>
          <!-- Game Selection -->
          <div class="game-selector">
            <mat-form-field appearance="outline" class="game-select-field">
              <mat-label>Select Game</mat-label>
              <mat-select [(value)]="selectedGameId" (selectionChange)="onGameSelected($event.value)">
                <mat-option [value]="null">All Games</mat-option>
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
              [actions]="true"
              (edit)="openEdit($event)" 
              (remove)="deleteSession($event)">
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
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);
  private playerService = inject(PlayerService);
  private gameService = inject(GameService);

  selectedGameId: string | null = null;
  currentCriteria = signal<SessionCriteria>({});
  private criteriaSubject = new BehaviorSubject<SessionCriteria>({});

  pagedData$: Observable<PagedData<GameSession>> = this.criteriaSubject.pipe(
    switchMap(criteria => {
      // Don't call API if no game is selected
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

  allGames$: Observable<Game[]> = this.gameService.list().pipe(
    map(pagedData => pagedData.items)
  );

  filterConfig: FilterConfig = {
    showSearch: false,
    showSort: true,
    sortOptions: [
      { label: 'Started At', value: 'startedAt' },
      { label: 'Ended At', value: 'endedAt' },
      { label: 'Final Score', value: 'finalScore' },
      { label: 'Status', value: 'status' },
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
        name: 'playerId',
        label: 'Player',
        type: 'select',
        options: [],
      },
    ],
  };

  columns: ColumnDef<GameSession>[] = [
    { columnDef: 'gameName', header: 'Game' },
    { columnDef: 'status', header: 'Status', cell: r => GameStatus[r.status] },
    { columnDef: 'finalScore', header: 'Final Score' },
    { columnDef: 'startedAt', header: 'Started', cell: r => new Date(r.startedAt).toLocaleString() },
    { columnDef: 'endedAt', header: 'Ended', cell: r => r.endedAt ? new Date(r.endedAt).toLocaleString() : '-' },
    { columnDef: 'duration', header: 'Duration' },
    { columnDef: 'rejectionReason', header: 'Rejection Reason', cell: r => r.rejectionReason || '-' },
    { columnDef: 'createdAt', header: 'Created At', cell: r => new Date(r.createdAt).toLocaleString() },
    { columnDef: 'createdBy', header: 'Created By' },
    { columnDef: 'updatedAt', header: 'Updated At', cell: r => r.updatedAt ? new Date(r.updatedAt).toLocaleString() : '-' },
    { columnDef: 'updatedBy', header: 'Updated By' },
  ];

  playersOpts: { label: string; value: string }[] = [];
  gamesOpts: { label: string; value: string }[] = [];

  constructor() {
    this.playerService.list().subscribe(pagedPlayers => {
      this.playersOpts = pagedPlayers.items.map((p: Player) => ({ label: p.username, value: p.id }));
      // Update filter config with player options
      const playerField = this.filterConfig.customFields?.find(f => f.name === 'playerId');
      if (playerField) {
        playerField.options = this.playersOpts;
      }
    });
    this.gameService.list().pipe(
      catchError(error => {
        console.error('Error loading games:', error);
        this.notificationService.error('Failed to load games list');
        return of({ items: [], pageNumber: 1, pageSize: 10, totalCount: 0, totalPages: 0, hasPreviousPage: false, hasNextPage: false });
      })
    ).subscribe(games => {
      this.gamesOpts = games.items.map((g: Game) => ({ label: g.name, value: g.id }));
    });
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

  openCreate() {
    const data: FormDialogData = {
      title: 'Create Session',
      submitLabel: 'Create',
      cols: 2,
      config: [
        { name: 'playerId', label: 'Player', type: 'select', required: true, options: this.playersOpts, colSpan: 1 },
        { name: 'gameId', label: 'Game', type: 'select', required: true, options: this.gamesOpts, colSpan: 1 },
        { name: 'status', label: 'Status', type: 'select', required: true, enumType: GameStatus, defaultValue: GameStatus.Active },
        { name: 'finalScore', label: 'Final Score', type: 'number', validators: [{ name: 'min', value: 0 }] },
        { name: 'durationSeconds', label: 'Duration (seconds)', type: 'number', validators: [{ name: 'min', value: 0 }] },
        { name: 'startedAt', label: 'Started At', type: 'date', required: true, colSpan: 1 },
        { name: 'endedAt', label: 'Ended At', type: 'date', colSpan: 1 },
        { name: 'gameData', label: 'Game Data (JSON)', type: 'textarea', colSpan: 2 },
      ],
    };
    this.dialog.open(FormDialogComponent, { data, width: '720px', maxWidth: '95vw' }).afterClosed().subscribe(result => {
      if (result) {
        // Convert dates to ISO strings if Date objects
        if (result.startedAt instanceof Date) result.startedAt = result.startedAt.toISOString();
        if (result.endedAt instanceof Date) result.endedAt = result.endedAt.toISOString();
        this.sessionService.create(result).subscribe(() => {
          this.notificationService.success('Session created');
        });
      }
    });
  }

  openEdit(row: GameSession) {
    const data: FormDialogData = {
      title: 'Edit Session',
      submitLabel: 'Update',
      value: {
        ...row,
        startedAt: row.startedAt ? new Date(row.startedAt) : null,
        endedAt: row.endedAt ? new Date(row.endedAt) : null,
      },
      cols: 2,
      config: [
        { name: 'playerId', label: 'Player', type: 'select', required: true, options: this.playersOpts, colSpan: 1 },
        { name: 'gameId', label: 'Game', type: 'select', required: true, options: this.gamesOpts, colSpan: 1 },
        { name: 'status', label: 'Status', type: 'select', required: true, enumType: GameStatus },
        { name: 'finalScore', label: 'Final Score', type: 'number', validators: [{ name: 'min', value: 0 }] },
        { name: 'durationSeconds', label: 'Duration (seconds)', type: 'number', validators: [{ name: 'min', value: 0 }] },
        { name: 'startedAt', label: 'Started At', type: 'date', required: true, colSpan: 1 },
        { name: 'endedAt', label: 'Ended At', type: 'date', colSpan: 1 },
        { name: 'gameData', label: 'Game Data (JSON)', type: 'textarea', colSpan: 2 },
      ],
    };
    this.dialog.open(FormDialogComponent, { data, width: '720px', maxWidth: '95vw' }).afterClosed().subscribe((result: any) => {
      if (result) {
        if (result.startedAt instanceof Date) result.startedAt = result.startedAt.toISOString();
        if (result.endedAt instanceof Date) result.endedAt = result.endedAt.toISOString();
        this.sessionService.update(row.id, result).subscribe(() => {
          this.notificationService.success('Session updated');
        });
      }
    });
  }

  deleteSession(session: GameSession): void {
    if (confirm(`Delete session for game ${session.gameName}?`)) {
      this.sessionService.delete(session.id).subscribe(() => {
        this.notificationService.success('Session deleted');
      });
    }
  }
}
