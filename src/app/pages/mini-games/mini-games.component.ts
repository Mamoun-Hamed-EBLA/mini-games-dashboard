import { Component, Signal, inject, signal } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { DataTableComponent, ColumnDef } from '../../shared/components/data-table/data-table.component';
import { MatDialog } from '@angular/material/dialog';
import { FormDialogComponent, FormDialogData } from '../../shared/components/form-dialog/form-dialog.component';
import { MiniGame } from './mini-game.model';
import { MiniGameService } from './mini-game.service';
import { NotificationService } from '../../core/notifications/notification.service';
import { Observable } from 'rxjs';
import { FormFieldConfig } from '../../shared/components/dynamic-form/dynamic-form.component';

@Component({
  selector: 'app-mini-games',
  standalone: true,
  imports: [SharedModule, DataTableComponent],
  template: `
    <div class="mini-games-page">
      <mat-toolbar color="primary">
        <span>Mini Games</span>
        <span class="spacer"></span>
        <button mat-raised-button color="accent" (click)="openCreate()">
          <mat-icon>add</mat-icon>
          New Mini Game
        </button>
      </mat-toolbar>

      <mat-card>
        <mat-card-content>
          <app-data-table
            [columns]="columns"
            [data]="(items$ | async) ?? []"
            [actions]="true"
            (edit)="openEdit($event)"
            (remove)="delete($event)">
          </app-data-table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `.mini-games-page{ display:flex; flex-direction:column; gap:16px; }
     .spacer{ flex: 1 1 auto; }`
  ]
})
export class MiniGamesComponent {
  private svc = inject(MiniGameService);
  private dialog = inject(MatDialog);
  private notify = inject(NotificationService);

  items$: Observable<MiniGame[]> = this.svc.list();

  columns: ColumnDef<MiniGame>[] = [
    { columnDef: 'name', header: 'Name' },
    { columnDef: 'description', header: 'Description' },
    { columnDef: 'isActive', header: 'Active', cell: r => (r.isActive ? 'Yes' : 'No') },
  ];

  formFields: Signal<FormFieldConfig[]> = signal([
        { name: 'name', label: 'Name', type: 'text', required: true, validators: [{ name: 'maxLength', value: 100 }] },
        { name: 'description', label: 'Description', type: 'textarea', required: true, colSpan: 2, validators: [{ name: 'maxLength', value: 500 }] },
        { name: 'isActive', label: 'Active', type: 'toggle', defaultValue: true },
      ]);

  openCreate() {
    const data: FormDialogData = {
      title: 'Create Mini Game',
      submitLabel: 'Create',
      cols: 2,
      config: this.formFields(),
    };
    this.dialog
      .open(FormDialogComponent, { data, width: '720px', maxWidth: '95vw' })
      .afterClosed()
      .subscribe(result => {
        if (result) {
          this.svc.create(result).subscribe(() => {
            this.notify.success('Mini game created');
          });
        }
      });
  }

  openEdit(row: MiniGame) {
    const data: FormDialogData = {
      title: 'Edit Mini Game',
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
          this.svc.update(row.id, result).subscribe(() => {
            this.notify.success('Mini game updated');
          });
        }
      });
  }

  delete(row: MiniGame) {
    if (confirm(`Delete mini game ${row.name}?`)) {
      this.svc.delete(row.id).subscribe(() => {
        this.notify.success('Mini game deleted');
      });
    }
  }
}
