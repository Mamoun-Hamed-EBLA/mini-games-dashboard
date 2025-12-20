import { Component, inject, Signal, signal } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { DataTableComponent, ColumnDef } from '../../shared/components/data-table/data-table.component';
import { MatDialog } from '@angular/material/dialog';
import { FormDialogComponent, FormDialogData } from '../../shared/components/form-dialog/form-dialog.component';
import { Game } from './game.model';
import { Observable, switchMap, BehaviorSubject, map, shareReplay } from 'rxjs';
import { GameService } from './game.service';
import { NotificationService } from '../../core/notifications/notification.service';
import { GameCriteria } from '../../core/models/page-criteria.models';
import { FilterConfig } from '../../core/models/filter-config.model';
import { TableFiltersComponent } from '../../shared/components/table-filters/table-filters.component';
import { PagedData } from '../../core/models/api-response.model';
import { FormFieldConfig } from '../../shared/components/dynamic-form/dynamic-form.component';
import { MiniGameService } from '../mini-games/mini-game.service';

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [SharedModule, DataTableComponent, TableFiltersComponent],
  template: `
    <div class="games-page">
      <mat-toolbar color="primary">
        <span>Games</span>
        <span class="spacer"></span>
        <button mat-raised-button color="accent" (click)="openCreate()">
          <mat-icon>add</mat-icon>
          New Game
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
            [data]="(games$ | async) ?? []" 
            [paginationInfo]="(paginationInfo$ | async) ?? null"
            [actions]="true"
            (edit)="openEdit($event)" 
            (remove)="deleteGame($event)">
          </app-data-table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `.games-page{ display:flex; flex-direction:column; gap:16px; }
     .spacer{ flex: 1 1 auto; }`
  ]
})
export class GamesComponent {
  private gameService = inject(GameService);
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);
  private miniGameService = inject(MiniGameService);

  currentCriteria = signal<GameCriteria>({});
  private criteriaSubject = new BehaviorSubject<GameCriteria>({});
  
  pagedData$: Observable<PagedData<Game>> = this.criteriaSubject.pipe(
    switchMap(criteria => this.gameService.list(criteria)),
    shareReplay(1)
  );

  games$: Observable<Game[]> = this.pagedData$.pipe(
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
    searchPlaceholder: 'Search games...',
    showSort: true,
    sortOptions: [
      { name: 'Name', id: 'name' },
      { name: 'Max Score', id: 'maxScore' },
      { name: 'Time Limit', id: 'timeLimit' },
      { name: 'Created Date', id: 'createdAt' },
    ],
    showDateFilters: true,
    customFields: [
      {
        name: 'minMaxScore',
        label: 'Min Max Score',
        type: 'number',
        placeholder: 'Minimum score',
        min: 0,
      },
      {
        name: 'maxMaxScore',
        label: 'Max Max Score',
        type: 'number',
        placeholder: 'Maximum score',
        min: 0,
      },
      {
        name: 'minTimeLimit',
        label: 'Min Time Limit',
        type: 'number',
        placeholder: 'Minimum time (min)',
        min: 0,
      },
      {
        name: 'maxTimeLimit',
        label: 'Max Time Limit',
        type: 'number',
        placeholder: 'Maximum time (min)',
        min: 0,
      },
      {
        name: 'isActive',
        label: 'Active Status',
        type: 'boolean',
      },
    ],
  };

  columns: ColumnDef<Game>[] = [
    { columnDef: 'name', header: 'Name' },
    { columnDef: 'description', header: 'Description' },
    { columnDef: 'maxScore', header: 'Max Score' },
    { columnDef: 'timeLimit', header: 'Time Limit (min)' },
    { columnDef: 'isActive', header: 'Active', cell: r => (r.isActive ? 'Yes' : 'No') },
    { columnDef: 'rules', header: 'Rules' },
    { columnDef: 'createdAt', header: 'Created At', cell: r => new Date(r.createdAt).toLocaleString() },
    { columnDef: 'createdBy', header: 'Created By' },
    { columnDef: 'updatedAt', header: 'Updated At', cell: r => r.updatedAt ? new Date(r.updatedAt).toLocaleString() : '-' },
    { columnDef: 'updatedBy', header: 'Updated By' },
  ];

  miniGameOptions: { id: string; name: string }[] = [];

  constructor() {
    this.miniGameService.lookup().subscribe(options => {
      this.miniGameOptions = options;
    });
  }

  get formConfig(): FormFieldConfig[] {
    return [
      { name: 'name', label: 'Mini Game', type: 'select', required: true, options: this.miniGameOptions },
      { name: 'maxScore', label: 'Max Score', type: 'number', validators: [{ name: 'min', value: 0 }] },
      { name: 'timeLimit', label: 'Time Limit (minutes)', type: 'number', validators: [{ name: 'min', value: 1 }] },
      { name: 'isActive', label: 'Active', type: 'toggle', defaultValue: true },
      { name: 'description', label: 'Description', required: true, type: 'textarea' },
      { name: 'rules', label: 'Rules', type: 'textarea' },
    ];
  }
  onFiltersChanged(criteria: GameCriteria): void {
    this.currentCriteria.set(criteria);
    this.criteriaSubject.next(criteria);
  }
  openCreate() {
    const data: FormDialogData = {
      title: 'Create Game',
      submitLabel: 'Create',
      config: this.formConfig,
    };
    this.dialog.open(FormDialogComponent, { data, width: '720px', maxWidth: '95vw' }).afterClosed().subscribe(result => {
      if (result) {
        this.gameService.create(result).subscribe(() => {
          this.notificationService.success('Game created');
        });
      }
    });
  }

  openEdit(row: Game) {
    const data: FormDialogData = {
      title: 'Edit Game',
      submitLabel: 'Update',
      value: row,
      config: this.formConfig,
    };
    this.dialog.open(FormDialogComponent, { data, width: '720px', maxWidth: '95vw' }).afterClosed().subscribe(result => {
      if (result) {
        this.gameService.update(row.id, result).subscribe(() => {
          this.notificationService.success('Game updated');
        });
      }
    });
  }

  deleteGame(game: Game): void {
    if (confirm(`Delete game ${game.name}?`)) {
      this.gameService.delete(game.id).subscribe(() => {
        this.notificationService.success('Game deleted');
      });
    }
  }
}
