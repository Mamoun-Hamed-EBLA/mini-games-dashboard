import { Component, inject, signal } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { DataTableComponent, ColumnDef } from '../../shared/components/data-table/data-table.component';
import { TableFiltersComponent } from '../../shared/components/table-filters/table-filters.component';
import { MatDialog } from '@angular/material/dialog';
import { FormDialogComponent, FormDialogData } from '../../shared/components/form-dialog/form-dialog.component';
import { Reward } from '../../core/models/reward.model';
import { RewardService } from '../../core/services/reward.service';
import { BadgeService } from '../../core/services/badge.service';
import { CardBackgroundService } from '../../core/services/card-background.service';
import { NotificationService } from '../../core/notifications/notification.service';
import { RewardType } from '../../core/enums/RewardType';
import { KeyType } from '../../core/enums/KeyType';
import { Observable, BehaviorSubject, switchMap, map, catchError, of } from 'rxjs';
import { BaseCriteria } from '../../core/models/base-criteria.model';
import { FilterConfig } from '../../core/models/filter-config.model';
import { PagedData } from '../../core/models/api-response.model';
import { FormFieldConfig } from '../../shared/components/dynamic-form/dynamic-form.component';

interface RewardCriteria extends BaseCriteria {
  rewardType?: RewardType;
  isActive?: boolean;
}

@Component({
  selector: 'app-rewards',
  standalone: true,
  imports: [SharedModule, DataTableComponent, TableFiltersComponent],
  template: `
    <div class="rewards-page">
      <mat-toolbar color="primary">
        <span>Rewards</span>
        <span class="spacer"></span>
        <button mat-raised-button color="accent" (click)="openCreate()">
          <mat-icon>add</mat-icon>
          New Reward
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
    `.rewards-page{ display:flex; flex-direction:column; gap:16px; }
     .spacer{ flex: 1 1 auto; }`
  ]
})
export class RewardsComponent {
  private rewardService = inject(RewardService);
  private badgeService = inject(BadgeService);
  private cardBackgroundService = inject(CardBackgroundService);
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);

  currentCriteria = signal<RewardCriteria>({});
  private criteriaSubject = new BehaviorSubject<RewardCriteria>({});

  pagedData$: Observable<PagedData<Reward>> = this.criteriaSubject.pipe(
    switchMap(criteria => this.rewardService.list(criteria).pipe(
      catchError(error => {
        console.error('Error loading rewards:', error);
        this.notificationService.error(
          error?.error?.message || error?.message || 'Failed to load rewards'
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

  items$: Observable<Reward[]> = this.pagedData$.pipe(
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
    searchPlaceholder: 'Search rewards...',
    showSort: true,
    sortOptions: [
      { label: 'Name', value: 'name' },
      { label: 'Reward Type', value: 'rewardType' },
      { label: 'Created Date', value: 'createdAt' },
    ],
    showDateFilters: true,
    customFields: [
      {
        name: 'rewardType',
        label: 'Reward Type',
        type: 'select',
        options: Object.keys(RewardType)
          .filter(k => isNaN(Number(k)))
          .map(k => ({ label: k, value: (RewardType as any)[k] })),
      },
      {
        name: 'isActive',
        label: 'Active Status',
        type: 'boolean',
      },
    ],
  };

  columns: ColumnDef<Reward>[] = [
    { columnDef: 'name', header: 'Name' },
    { columnDef: 'description', header: 'Description' },
    { columnDef: 'rewardType', header: 'Type', cell: r => RewardType[r.rewardType] },
    { columnDef: 'quantity', header: 'Quantity' },
    { columnDef: 'badgeId', header: 'Badge Id' },
    { columnDef: 'cardBackgroundId', header: 'Card Background Id' },
    { columnDef: 'resourceUrl', header: 'Resource URL' },
    { columnDef: 'keyType', header: 'Key Type', cell: r => r.keyType != null ? KeyType[r.keyType] : '-' },
    { columnDef: 'expiresAt', header: 'Expires At', cell: r => r.expiresAt ? new Date(r.expiresAt).toLocaleString() : '-' },
    { columnDef: 'isActive', header: 'Active', cell: r => (r.isActive ? 'Yes' : 'No') },
    { columnDef: 'createdAt', header: 'Created At', cell: r => new Date(r.createdAt).toLocaleString() },
    { columnDef: 'createdBy', header: 'Created By' },
    { columnDef: 'updatedAt', header: 'Updated At', cell: r => r.updatedAt ? new Date(r.updatedAt).toLocaleString() : '-' },
    { columnDef: 'updatedBy', header: 'Updated By' },
  ];

  formFields = signal<FormFieldConfig[]>([
        { name: 'name', label: 'Name', type: 'text', required: true, colSpan: 2 },
        { name: 'description', label: 'Description', type: 'textarea', required: true, colSpan: 2 },
        { name: 'rewardType', label: 'Reward Type', type: 'select', required: true, enumType: RewardType, colSpan: 2 },
        { name: 'quantity', label: 'Quantity', type: 'number', validators: [{ name: 'min', value: 1 }],
          visible: v => {
            const t = v['rewardType'];
            return t === RewardType.Gems || t === RewardType.LikeCard || t === RewardType.Key;
          },
        },
        { name: 'badgeId', label: 'Badge', type: 'select', options: [],
          visible: v => v['rewardType'] === RewardType.Badge,
          defaultValue: null,
        },
        { name: 'cardBackgroundId', label: 'Card Background', type: 'select', options: [],
          visible: v => v['rewardType'] === RewardType.CardBackground,
          defaultValue: null,
        },
        { name: 'resourceUrl', label: 'Resource URL', type: 'text',
          visible: v => v['rewardType'] === RewardType.Avatar,
        },
        { name: 'keyType', label: 'Key Type', type: 'select', enumType: KeyType,
          visible: v => v['rewardType'] === RewardType.Key,
        },
        { name: 'expiresAt', label: 'Expires At', type: 'date',
          visible: v => v['rewardType'] === RewardType.Key || v['rewardType'] === RewardType.Gems,
        },
        { name: 'isActive', label: 'Active', type: 'toggle', defaultValue: true },
      ]);

  constructor() {
    this.badgeService.list().pipe(
      catchError(error => {
        console.error('Error loading badges:', error);
        this.notificationService.error('Failed to load badges list');
        return of({ items: [], pageNumber: 1, pageSize: 10, totalCount: 0, totalPages: 0, hasPreviousPage: false, hasNextPage: false });
      })
    ).subscribe(badges => {
      const options = badges.items.map(b => ({ label: b.name, value: b.id }));
      this.formFields.update(fields =>
        fields.map(field => field.name === 'badgeId' ? { ...field, options } : field)
      );
    });

    this.cardBackgroundService.list().pipe(
      catchError(error => {
        console.error('Error loading card backgrounds:', error);
        this.notificationService.error('Failed to load card backgrounds list');
        return of({ items: [], pageNumber: 1, pageSize: 10, totalCount: 0, totalPages: 0, hasPreviousPage: false, hasNextPage: false });
      })
    ).subscribe(cardBackgrounds => {
      const options = cardBackgrounds.items.map(cb => ({ label: cb.name, value: cb.id }));
      this.formFields.update(fields =>
        fields.map(field => field.name === 'cardBackgroundId' ? { ...field, options } : field)
      );
    });
  }

  onFiltersChanged(criteria: RewardCriteria): void {
    this.currentCriteria.set(criteria);
    this.criteriaSubject.next(criteria);
  }

  openCreate() {
    const data: FormDialogData = {
      title: 'Create Reward',
      submitLabel: 'Create',
      cols: 2,
      config: this.formFields(),
      closeOnSubmit: false,
    };
    const dialogRef = this.dialog.open(FormDialogComponent, { data, width: '720px', maxWidth: '95vw' });

    const sub = dialogRef.componentInstance.formSubmit.subscribe(formValue => {
      const payload = this.normalizePayload(formValue);
      this.rewardService.create(payload).subscribe({
        next: () => {
          this.notificationService.success('Reward created');
          dialogRef.close(payload);
          sub.unsubscribe();
        },
        error: error => {
          console.error('Error creating reward:', error);
          this.notificationService.error(
            error?.error?.message || error?.message || 'Failed to create reward'
          );
        },
      });
    });
  }

  openEdit(row: Reward) {
    const data: FormDialogData = {
      title: 'Edit Reward',
      submitLabel: 'Update',
      value: {
        ...row,
        expiresAt: row.expiresAt ? new Date(row.expiresAt) : null,
      },
      cols: 2,
      config: this.formFields(),
      closeOnSubmit: false,
    };
    const dialogRef = this.dialog.open(FormDialogComponent, { data, width: '720px', maxWidth: '95vw' });

    const sub = dialogRef.componentInstance.formSubmit.subscribe(formValue => {
      const payload = this.normalizePayload(formValue);
      this.rewardService.update(row.id, payload).subscribe({
        next: () => {
          this.notificationService.success('Reward updated');
          dialogRef.close(payload);
          sub.unsubscribe();
        },
        error: error => {
          console.error('Error updating reward:', error);
          this.notificationService.error(
            error?.error?.message || error?.message || 'Failed to update reward'
          );
        },
      });
    });
  }

  private normalizePayload(formValue: any): any {
    const payload: any = { ...formValue };

    if (payload.expiresAt instanceof Date) {
      payload.expiresAt = payload.expiresAt.toISOString();
    }

    const rewardType: RewardType = payload.rewardType;

    // Default all optional fields to null
    payload.quantity = null;
    payload.badgeId = null;
    payload.cardBackgroundId = null;
    payload.resourceUrl = null;
    payload.keyType = null;

    if (rewardType === RewardType.Gems || rewardType === RewardType.LikeCard) {
      payload.quantity = payload.quantity ?? null;
    } else if (rewardType === RewardType.Badge) {
      // if not selected or empty string, send null
      payload.badgeId = payload.badgeId || null;
    } else if (rewardType === RewardType.CardBackground) {
      // if not selected or empty string, send null
      payload.cardBackgroundId = payload.cardBackgroundId || null;
    } else if (rewardType === RewardType.Avatar) {
      payload.resourceUrl = payload.resourceUrl ?? null;
    } else if (rewardType === RewardType.Key) {
      payload.quantity = payload.quantity ?? null;
      payload.keyType = payload.keyType ?? null;
      // expiresAt is optional; keep whatever value (string or null)
    }

    return payload;
  }

  deleteItem(row: Reward): void {
    if (confirm(`Delete reward ${row.name}?`)) {
      this.rewardService.delete(row.id).subscribe(() => {
        this.notificationService.success('Reward deleted');
      });
    }
  }
}
