import { Component, inject } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { DataTableComponent, ColumnDef } from '../../shared/components/data-table/data-table.component';
import { MatDialog } from '@angular/material/dialog';
import { FormDialogComponent, FormDialogData } from '../../shared/components/form-dialog/form-dialog.component';
import { Game } from '../../core/models/game.model';
import { Observable } from 'rxjs';
import { GameService } from '../../core/services/game.service';
import { NotificationService } from '../../core/notifications/notification.service';

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [SharedModule, DataTableComponent],
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
          <app-data-table [columns]="columns" [data]="(games$ | async) ?? []" [actions]="true"
                           (edit)="openEdit($event)" (remove)="delete($event)"></app-data-table>
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
  private svc = inject(GameService);
  private dialog = inject(MatDialog);
  private notify = inject(NotificationService);

  games$: Observable<Game[]> = this.svc.list();

  columns: ColumnDef<Game>[] = [
    { columnDef: 'name', header: 'Name' },
    { columnDef: 'description', header: 'Description' },
    { columnDef: 'maxScore', header: 'Max Score' },
    { columnDef: 'timeLimit', header: 'Time Limit (min)' },
    { columnDef: 'isActive', header: 'Active', cell: r => (r.isActive ? 'Yes' : 'No') },
    { columnDef: 'rules', header: 'Rules' },
  ];

  constructor() {}

  openCreate() {
    const data: FormDialogData = {
      title: 'Create Game',
      submitLabel: 'Create',
      config: [
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'maxScore', label: 'Max Score', type: 'number', validators: [{ name: 'min', value: 0 }] },
        { name: 'timeLimit', label: 'Time Limit (minutes)', type: 'number', validators: [{ name: 'min', value: 1 }] },
        { name: 'isActive', label: 'Active', type: 'toggle', defaultValue: true },
        { name: 'rules', label: 'Rules', type: 'textarea' },
      ],
    };
    this.dialog.open(FormDialogComponent, { data, width: '720px', maxWidth: '95vw' }).afterClosed().subscribe(result => {
      if (result) {
        this.svc.create(result).subscribe(() => this.notify.success('Game created'));
      }
    });
  }

  openEdit(row: Game) {
    const data: FormDialogData = {
      title: 'Edit Game',
      submitLabel: 'Update',
      value: row,
      config: [
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'maxScore', label: 'Max Score', type: 'number', validators: [{ name: 'min', value: 0 }] },
        { name: 'timeLimit', label: 'Time Limit (minutes)', type: 'number', validators: [{ name: 'min', value: 1 }] },
        { name: 'isActive', label: 'Active', type: 'toggle' },
        { name: 'rules', label: 'Rules', type: 'textarea' },
      ],
    };
    this.dialog.open(FormDialogComponent, { data, width: '720px', maxWidth: '95vw' }).afterClosed().subscribe(result => {
      if (result) {
        this.svc.update(row.id, result).subscribe(() => this.notify.success('Game updated'));
      }
    });
  }

  delete(row: Game) {
    if (confirm(`Delete game ${row.name}?`)) {
      this.svc.delete(row.id).subscribe(() => this.notify.success('Game deleted'));
    }
  }
}
