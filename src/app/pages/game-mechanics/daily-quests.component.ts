import { Component, inject, signal } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { DataTableComponent, ColumnDef } from '../../shared/components/data-table/data-table.component';
import { TableFiltersComponent } from '../../shared/components/table-filters/table-filters.component';
import { MatDialog } from '@angular/material/dialog';
import { FormDialogComponent, FormDialogData } from '../../shared/components/form-dialog/form-dialog.component';
import { DailyQuestService } from './services/daily-quest.service';
import { NotificationService } from '../../core/notifications/notification.service';
import { Observable, BehaviorSubject, switchMap, map, catchError, of, shareReplay } from 'rxjs';
import { BaseCriteria } from '../../core/models/base-criteria.model';
import { FilterConfig } from '../../core/models/filter-config.model';
import { PagedData } from '../../core/models/api-response.model';
import { FormFieldConfig } from '../../shared/components/dynamic-form/dynamic-form.component';
import { DailyQuest } from './models/daily-quest.model';
import { QuestStatus } from './enums/QuestStatus';
import { GameService } from '../game/game.service';

@Component({
  selector: 'app-daily-quests',
  standalone: true,
  imports: [SharedModule, DataTableComponent, TableFiltersComponent],
  template: `
    <div class="daily-quests-page">
      <mat-toolbar color="primary">
        <span>Daily Quests</span>
        <span class="spacer"></span>
        <button mat-raised-button color="accent" (click)="openCreate()">
          <mat-icon>add</mat-icon>
          New Quest
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
    `.daily-quests-page{ display:flex; flex-direction:column; gap:16px; }
     .spacer{ flex: 1 1 auto; }`
  ]
})
export class DailyQuestsComponent {
  private dailyQuestService = inject(DailyQuestService);
  private gameService = inject(GameService);
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);

  currentCriteria = signal<BaseCriteria>({});
  private criteriaSubject = new BehaviorSubject<BaseCriteria>({});

  pagedData$: Observable<PagedData<DailyQuest>> = this.criteriaSubject.pipe(
    switchMap(criteria => this.dailyQuestService.list(criteria).pipe(
      catchError(error => {
        console.error('Error loading daily quests:', error);
        this.notificationService.error(
          error?.error?.message || error?.message || 'Failed to load daily quests'
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

  items$: Observable<DailyQuest[]> = this.pagedData$.pipe(
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
    searchPlaceholder: 'Search quests...',
    showSort: true,
    sortOptions: [
      { label: 'Date', value: 'date' },
      { label: 'Created Date', value: 'createdAt' },
    ],
    showDateFilters: true,
  };

  columns: ColumnDef<DailyQuest>[] = [
    { columnDef: 'date', header: 'Date', cell: r => new Date(r.date).toLocaleDateString() },
    { columnDef: 'gameId', header: 'Game ID' },
    { columnDef: 'requiredScore', header: 'Required Score' },
    { columnDef: 'gemReward', header: 'Gem Reward' },
    { columnDef: 'status', header: 'Status', cell: r => QuestStatus[r.status] },
    { columnDef: 'description', header: 'Description' },
    { columnDef: 'createdAt', header: 'Created At', cell: r => new Date(r.createdAt).toLocaleString() },
  ];

  formFields = signal<FormFieldConfig[]>([
    { name: 'date', label: 'Date', type: 'date', required: true },
    { name: 'gameId', label: 'Game', type: 'select', required: true, options: [] },
    { name: 'requiredScore', label: 'Required Score', type: 'number', required: true, validators: [{ name: 'min', value: 0 }] },
    { name: 'gemReward', label: 'Gem Reward', type: 'number', required: true, validators: [{ name: 'min', value: 0 }] },
    { name: 'description', label: 'Description', type: 'textarea', colSpan: 2, validators: [{ name: 'maxLength', value: 1000 }] },
  ]);

  constructor() {
    this.gameService.list({ pageSize: 100 }).pipe(
      catchError(error => {
        console.error('Error loading games:', error);
        return of({ items: [] });
      })
    ).subscribe((games: any) => {
      const options = games.items.map((g: any) => ({ label: g.name, value: g.id }));
      this.formFields.update(fields =>
        fields.map(field => field.name === 'gameId' ? { ...field, options } : field)
      );
    });
  }

  onFiltersChanged(criteria: BaseCriteria): void {
    this.currentCriteria.set(criteria);
    this.criteriaSubject.next(criteria);
  }

  openCreate() {
    const data: FormDialogData = {
      title: 'Create Daily Quest',
      submitLabel: 'Create',
      cols: 2,
      config: this.formFields(),
      closeOnSubmit: false,
    };
    const dialogRef = this.dialog.open(FormDialogComponent, { data, width: '720px', maxWidth: '95vw' });

    const sub = dialogRef.componentInstance.formSubmit.subscribe(formValue => {
      const payload = this.normalizePayload(formValue);
      this.dailyQuestService.create(payload).subscribe({
        next: () => {
          this.notificationService.success('Daily quest created');
          dialogRef.close(payload);
          sub.unsubscribe();
          this.refresh();
        },
        error: error => {
          console.error('Error creating daily quest:', error);
          this.notificationService.error(
            error?.error?.message || error?.message || 'Failed to create daily quest'
          );
        },
      });
    });
  }

  openEdit(row: DailyQuest) {
    const data: FormDialogData = {
      title: 'Edit Daily Quest',
      submitLabel: 'Update',
      value: {
        ...row,
        date: new Date(row.date),
      },
      cols: 2,
      config: this.formFields(),
      closeOnSubmit: false,
    };
    const dialogRef = this.dialog.open(FormDialogComponent, { data, width: '720px', maxWidth: '95vw' });

    const sub = dialogRef.componentInstance.formSubmit.subscribe(formValue => {
      const payload = this.normalizePayload(formValue);
      this.dailyQuestService.update(row.id, payload).subscribe({
        next: () => {
          this.notificationService.success('Daily quest updated');
          dialogRef.close(payload);
          sub.unsubscribe();
          this.refresh();
        },
        error: error => {
          console.error('Error updating daily quest:', error);
          this.notificationService.error(
            error?.error?.message || error?.message || 'Failed to update daily quest'
          );
        },
      });
    });
  }

  private normalizePayload(formValue: any): any {
    const payload: any = { ...formValue };
    if (payload.date instanceof Date) {
      payload.date = payload.date.toISOString();
    }
    return payload;
  }

  deleteItem(row: DailyQuest): void {
    if (confirm(`Delete daily quest for ${new Date(row.date).toLocaleDateString()}?`)) {
      this.dailyQuestService.delete(row.id).subscribe(() => {
        this.notificationService.success('Daily quest deleted');
        this.refresh();
      });
    }
  }

  refresh() {
    this.criteriaSubject.next(this.currentCriteria());
  }
}
