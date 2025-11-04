import { Component, inject } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { DataTableComponent, ColumnDef } from '../../shared/components/data-table/data-table.component';
import { FormDialogComponent, FormDialogData } from '../../shared/components/form-dialog/form-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Player } from '../../core/models/player.model';
import { Observable } from 'rxjs';
import { PlayerService } from '../../core/services/player.service';
import { NotificationService } from '../../core/notifications/notification.service';

@Component({
  selector: 'app-players',
  standalone: true,
  imports: [SharedModule, DataTableComponent],
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
          <app-data-table [columns]="columns" [data]="(players$ | async) ?? []" [actions]="true"
                           (edit)="openEdit($event)" (remove)="delete($event)"></app-data-table>
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
  private svc = inject(PlayerService);
  private dialog = inject(MatDialog);
  private notify = inject(NotificationService);

  players$: Observable<Player[]> = this.svc.list();

  columns: ColumnDef<Player>[] = [
    { columnDef: 'username', header: 'Username' },
    { columnDef: 'countryCode', header: 'Country' },
    { columnDef: 'score', header: 'Score' },
    { columnDef: 'isActive', header: 'Active', cell: r => (r.isActive ? 'Yes' : 'No') },
    { columnDef: 'lastLoginAt', header: 'Last Login', cell: r => r.lastLoginAt ? new Date(r.lastLoginAt).toLocaleString() : '-' },
  ];

  constructor() {}

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
        this.svc.create(result).subscribe(() => this.notify.success('Player created'));
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
        this.svc.update(row.id, result).subscribe(() => this.notify.success('Player updated'));
      }
    });
  }

  delete(row: Player) {
    if (confirm(`Delete player ${row.username}?`)) {
      this.svc.delete(row.id).subscribe(() => this.notify.success('Player deleted'));
    }
  }
}
