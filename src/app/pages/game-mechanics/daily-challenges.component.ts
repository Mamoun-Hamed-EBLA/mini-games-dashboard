import { Component, inject, signal } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { DataTableComponent, ColumnDef } from '../../shared/components/data-table/data-table.component';
import { TableFiltersComponent } from '../../shared/components/table-filters/table-filters.component';
import { MatDialog } from '@angular/material/dialog';
import { FormDialogComponent, FormDialogData } from '../../shared/components/form-dialog/form-dialog.component';
import { DailyChallengeService } from './services/daily-challenge.service';
import { NotificationService } from '../../core/notifications/notification.service';
import { Observable, BehaviorSubject, switchMap, map, catchError, of, shareReplay } from 'rxjs';
import { BaseCriteria } from '../../core/models/base-criteria.model';
import { FilterConfig } from '../../core/models/filter-config.model';
import { PagedData } from '../../core/models/api-response.model';
import { FormFieldConfig } from '../../shared/components/dynamic-form/dynamic-form.component';
import { DailyChallenge } from './models/daily-challenge.model';
import { ChallengeStatus } from './enums/ChallengeStatus';

@Component({
  selector: 'app-daily-challenges',
  standalone: true,
  imports: [SharedModule, DataTableComponent, TableFiltersComponent],
  template: `
    <div class="daily-challenges-page">
      <mat-toolbar color="primary">
        <span>Daily Challenges</span>
        <span class="spacer"></span>
        <button mat-raised-button color="accent" (click)="openCreate()">
          <mat-icon>add</mat-icon>
          New Challenge
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
    `.daily-challenges-page{ display:flex; flex-direction:column; gap:16px; }
     .spacer{ flex: 1 1 auto; }`
  ]
})
export class DailyChallengesComponent {
  private dailyChallengeService = inject(DailyChallengeService);
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);

  currentCriteria = signal<BaseCriteria>({});
  private criteriaSubject = new BehaviorSubject<BaseCriteria>({});

  pagedData$: Observable<PagedData<DailyChallenge>> = this.criteriaSubject.pipe(
    switchMap(criteria => this.dailyChallengeService.list(criteria).pipe(
      catchError(error => {
        console.error('Error loading daily challenges:', error);
        this.notificationService.error(
          error?.error?.message || error?.message || 'Failed to load daily challenges'
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

  items$: Observable<DailyChallenge[]> = this.pagedData$.pipe(
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
    searchPlaceholder: 'Search challenges...',
    showSort: true,
    sortOptions: [
      { name: 'Name', id: 'name' },
      { name: 'Start Time', id: 'startTime' },
      { name: 'Created Date', id: 'createdAt' },
    ],
    showDateFilters: true,
  };

  columns: ColumnDef<DailyChallenge>[] = [
    { columnDef: 'name', header: 'Name' },
    { columnDef: 'startTime', header: 'Start Time', cell: r => new Date(r.startTime).toLocaleString() },
    { columnDef: 'endTime', header: 'End Time', cell: r => new Date(r.endTime).toLocaleString() },
    { columnDef: 'entryFee', header: 'Entry Fee' },
    { columnDef: 'gemReward', header: 'Gem Reward' },
    { columnDef: 'playersLimit', header: 'Players Limit' },
    { columnDef: 'keysGranted', header: 'Keys Granted' },
    { columnDef: 'maxAttemptsPerPlayer', header: 'Max Attempts' },
    { columnDef: 'status', header: 'Status', cell: r => ChallengeStatus[r.status] },
    { columnDef: 'winnerId', header: 'Winner ID' },
    { columnDef: 'createdAt', header: 'Created At', cell: r => new Date(r.createdAt).toLocaleString() },
  ];

  formFields: FormFieldConfig[] = [
    { name: 'name', label: 'Name', type: 'text', required: true, colSpan: 2 },
    { name: 'startTime', label: 'Start Time', type: 'date', required: true },
    { name: 'endTime', label: 'End Time', type: 'date', required: true },
    { name: 'entryFee', label: 'Entry Fee', type: 'number', required: true, validators: [{ name: 'min', value: 0 }] },
    { name: 'gemReward', label: 'Gem Reward', type: 'number', required: true, validators: [{ name: 'min', value: 1 }] },
    { name: 'playersLimit', label: 'Players Limit', type: 'number', required: true, validators: [{ name: 'min', value: 1 }] },
    { name: 'keysGranted', label: 'Keys Granted', type: 'number', required: true, validators: [{ name: 'min', value: 0 }] },
    { name: 'maxAttemptsPerPlayer', label: 'Max Attempts', type: 'number', required: true, validators: [{ name: 'min', value: 1 }] },
  ];

  onFiltersChanged(criteria: BaseCriteria): void {
    this.currentCriteria.set(criteria);
    this.criteriaSubject.next(criteria);
  }

  openCreate() {
    const data: FormDialogData = {
      title: 'Create Daily Challenge',
      submitLabel: 'Create',
      cols: 2,
      config: this.formFields,
      closeOnSubmit: false,
    };
    const dialogRef = this.dialog.open(FormDialogComponent, { data, width: '720px', maxWidth: '95vw' });

    const sub = dialogRef.componentInstance.formSubmit.subscribe(formValue => {
      const payload = this.normalizePayload(formValue);
      this.dailyChallengeService.create(payload).subscribe({
        next: () => {
          this.notificationService.success('Daily challenge created');
          dialogRef.close(payload);
          sub.unsubscribe();
          this.refresh();
        },
        error: error => {
          console.error('Error creating daily challenge:', error);
          this.notificationService.error(
            error?.error?.message || error?.message || 'Failed to create daily challenge'
          );
        },
      });
    });
  }

  openEdit(row: DailyChallenge) {
    const data: FormDialogData = {
      title: 'Edit Daily Challenge',
      submitLabel: 'Update',
      value: {
        ...row,
        startTime: new Date(row.startTime),
        endTime: new Date(row.endTime),
      },
      cols: 2,
      config: this.formFields,
      closeOnSubmit: false,
    };
    const dialogRef = this.dialog.open(FormDialogComponent, { data, width: '720px', maxWidth: '95vw' });

    const sub = dialogRef.componentInstance.formSubmit.subscribe(formValue => {
      const payload = this.normalizePayload(formValue);
      this.dailyChallengeService.update(row.id, payload).subscribe({
        next: () => {
          this.notificationService.success('Daily challenge updated');
          dialogRef.close(payload);
          sub.unsubscribe();
          this.refresh();
        },
        error: error => {
          console.error('Error updating daily challenge:', error);
          this.notificationService.error(
            error?.error?.message || error?.message || 'Failed to update daily challenge'
          );
        },
      });
    });
  }

  private normalizePayload(formValue: any): any {
    const payload: any = { ...formValue };
    if (payload.startTime instanceof Date) {
      payload.startTime = payload.startTime.toISOString();
    }
    if (payload.endTime instanceof Date) {
      payload.endTime = payload.endTime.toISOString();
    }
    return payload;
  }

  deleteItem(row: DailyChallenge): void {
    if (confirm(`Delete daily challenge ${row.name}?`)) {
      this.dailyChallengeService.delete(row.id).subscribe(() => {
        this.notificationService.success('Daily challenge deleted');
        this.refresh();
      });
    }
  }

  refresh() {
    this.criteriaSubject.next(this.currentCriteria());
  }
}
