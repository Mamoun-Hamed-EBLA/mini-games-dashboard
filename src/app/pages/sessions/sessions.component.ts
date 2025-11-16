import { Component, inject } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { DataTableComponent, ColumnDef } from '../../shared/components/data-table/data-table.component';
import { MatDialog } from '@angular/material/dialog';
import { FormDialogComponent, FormDialogData } from '../../shared/components/form-dialog/form-dialog.component';
import { GameSession } from '../../core/models/session.model';
import { GameStatus } from '../../core/enums/GameStatus';
import { SessionService } from '../../core/services/session.service';
import { PlayerService } from '../../core/services/player.service';
import { GameService } from '../../core/services/game.service';
import { NotificationService } from '../../core/notifications/notification.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-sessions',
  standalone: true,
  imports: [SharedModule, DataTableComponent],
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
          <app-data-table [columns]="columns" [data]="(sessions$ | async) ?? []" [actions]="true"
                           (edit)="openEdit($event)" (remove)="delete($event)"></app-data-table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `.sessions-page{ display:flex; flex-direction:column; gap:16px; }
     .spacer{ flex: 1 1 auto; }`
  ]
})
export class SessionsComponent {
  private svc = inject(SessionService);
  private dialog = inject(MatDialog);
  private notify = inject(NotificationService);
  private playersSvc = inject(PlayerService);
  private gamesSvc = inject(GameService);

  sessions$: Observable<GameSession[]> = this.svc.list();

  columns: ColumnDef<GameSession>[] = [
    { columnDef: 'playerId', header: 'Player', cell: r => this.playerName(r.playerId) },
    { columnDef: 'gameId', header: 'Game', cell: r => this.gameName(r.gameId) },
    { columnDef: 'status', header: 'Status', cell: r => GameStatus[r.status] },
    { columnDef: 'finalScore', header: 'Final Score' },
    { columnDef: 'startedAt', header: 'Started', cell: r => new Date(r.startedAt).toLocaleString() },
    { columnDef: 'endedAt', header: 'Ended', cell: r => r.endedAt ? new Date(r.endedAt).toLocaleString() : '-' },
    { columnDef: 'durationSeconds', header: 'Duration (s)' },
    { columnDef: 'gameData', header: 'Data' },
  ];

  playersOpts: { label: string; value: string }[] = [];
  gamesOpts: { label: string; value: string }[] = [];

  constructor() {
    this.playersSvc.list().subscribe(players => {
      this.playersOpts = players.map(p => ({ label: p.username, value: p.id }));
    });
    this.gamesSvc.list().subscribe(games => {
      this.gamesOpts = games.map(g => ({ label: g.name, value: g.id }));
    });
  }

  playerName(id: string) {
    const opt = this.playersOpts.find(o => o.value === id); return opt ? opt.label : id;
  }
  gameName(id: string) {
    const opt = this.gamesOpts.find(o => o.value === id); return opt ? opt.label : id;
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
        this.svc.create(result).subscribe(() => this.notify.success('Session created'));
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
        this.svc.update(row.id, result).subscribe(() => this.notify.success('Session updated'));
      }
    });
  }

  delete(row: GameSession) {
    if (confirm(`Delete session ${row.id}?`)) {
      this.svc.delete(row.id).subscribe(() => this.notify.success('Session deleted'));
    }
  }
}
