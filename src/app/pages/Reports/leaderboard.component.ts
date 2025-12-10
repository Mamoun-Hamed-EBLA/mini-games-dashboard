import { Component, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { DataTableComponent, ColumnDef } from '../../shared/components/data-table/data-table.component';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, switchMap, startWith, debounceTime, distinctUntilChanged, shareReplay } from 'rxjs/operators';
import { LeaderboardEntry } from '../../core/models/leaderboard.model';
import { ScoreService } from './score.service';

interface LeaderboardRow extends LeaderboardEntry {
  rank: number;
}

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [SharedModule, DataTableComponent],
  template: `
    <div class="leaderboard-page">
      <mat-toolbar color="primary">
        <span>Leaderboard</span>
        <span class="spacer"></span>
      </mat-toolbar>

      <mat-card>
        <mat-card-content>
          <div class="filters-row">
            <mat-form-field appearance="outline" class="count-field">
              <mat-label>Top players</mat-label>
              <input
                matInput
                type="number"
                min="1"
                [formControl]="topCountControl"
              />
            </mat-form-field>
          </div>

          <app-data-table
            [columns]="columns"
            [data]="(rows$ | async) ?? []"
            [actions]="false"
          >
          </app-data-table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `.leaderboard-page{ display:flex; flex-direction:column; gap:16px; }
     .spacer{ flex:1 1 auto; }
     .filters-row{ display:flex; align-items:center; gap:12px; margin-bottom:12px; flex-wrap:wrap; }
     .count-field{ width:160px; max-width:100%; }
     @media (max-width: 768px){ .leaderboard-page{ gap:12px; } .count-field{ width:100%; } }`
  ]
})
export class LeaderboardComponent {
  private scoreService = inject(ScoreService);

  topCountControl = new FormControl<number>(50, { nonNullable: true });

  private topCount$ = this.topCountControl.valueChanges.pipe(
    startWith(this.topCountControl.value),
    debounceTime(300),
    map(value => {
      const n = Number(value) || 0;
      if (n <= 0) { return 1; }
      return n;
    }),
    distinctUntilChanged(),
  );

  private leaderboard$: Observable<LeaderboardEntry[]> = this.topCount$.pipe(
    switchMap(count => this.scoreService.getLeaderboard(count)),
    shareReplay(1)
  );

  rows$: Observable<LeaderboardRow[]> = this.leaderboard$.pipe(
    map(entries => entries.map((entry, index) => ({ ...entry, rank: index + 1 })))
  );

  columns: ColumnDef<LeaderboardRow>[] = [
    { columnDef: 'rank', header: '#', cell: row => row.rank },
    { columnDef: 'playerName', header: 'Player' },
    { columnDef: 'totalScore', header: 'Total Score' },
    { columnDef: 'gamesPlayed', header: 'Games Played' },
    { columnDef: 'lastGamePlayed', header: 'Last Game', cell: r => new Date(r.lastGamePlayed).toLocaleString() },
  ];
}
