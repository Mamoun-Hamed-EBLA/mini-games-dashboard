import { Component, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { DataTableComponent, ColumnDef } from '../../shared/components/data-table/data-table.component';
import { Observable, combineLatest, of } from 'rxjs';
import { map, switchMap, startWith, debounceTime, distinctUntilChanged, shareReplay } from 'rxjs';
import { LeaderboardEntry } from '../../core/models/leaderboard.model';
import { Game } from '../../core/models/game.model';
import { ScoreService } from './score.service';
import { GameService } from '../../core/services/game.service';

interface GameLeaderboardRow extends LeaderboardEntry {
  rank: number;
}

@Component({
  selector: 'app-game-leaderboard',
  standalone: true,
  imports: [SharedModule, DataTableComponent],
  template: `
    <div class="game-leaderboard-page">
      <mat-toolbar color="primary">
        <span>Game Leaderboard</span>
        <span class="spacer"></span>
      </mat-toolbar>

      <mat-card>
        <mat-card-content>
          <div class="filters-row">
            <mat-form-field appearance="outline" class="game-field">
              <mat-label>Game</mat-label>
              <mat-select [formControl]="gameIdControl">
                <mat-option [value]="null">Select game</mat-option>
                @for (game of (games$ | async) ?? []; track game.id) {
                  <mat-option [value]="game.id">{{ game.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

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

          @if (selectedHasGame$ | async) {
            <app-data-table
              [columns]="columns"
              [data]="(rows$ | async) ?? []"
              [actions]="false"
            >
            </app-data-table>
          } @else {
            <div class="no-game-selected">
              <mat-icon class="large-icon">info</mat-icon>
              <h3>No Game Selected</h3>
              <p>Please choose a game to view its leaderboard.</p>
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `.game-leaderboard-page{ display:flex; flex-direction:column; gap:16px; }
     .spacer{ flex:1 1 auto; }
     .filters-row{ display:flex; align-items:center; gap:12px; margin-bottom:12px; flex-wrap:wrap; }
     .game-field{ min-width:220px; max-width:100%; }
     .count-field{ width:160px; max-width:100%; }
     .no-game-selected{ display:flex; flex-direction:column; align-items:center; justify-content:center; padding:3rem 1.5rem; text-align:center; color:#64748b; }
     .no-game-selected .large-icon{ font-size:56px; width:56px; height:56px; color:#94a3b8; margin-bottom:0.75rem; }
     .no-game-selected h3{ margin:0 0 0.35rem 0; color:#475569; }
     .no-game-selected p{ margin:0; font-size:14px; }
     @media (max-width: 768px){ .game-leaderboard-page{ gap:12px; } .game-field, .count-field{ width:100%; } }`
  ]
})
export class GameLeaderboardComponent {
  private scoreService = inject(ScoreService);
  private gameService = inject(GameService);

  gameIdControl = new FormControl<string | null>(null);
  topCountControl = new FormControl<number>(10, { nonNullable: true });

  games$: Observable<Game[]> = this.gameService.list().pipe(
    map(paged => paged.items)
  );

  private gameId$ = this.gameIdControl.valueChanges.pipe(
    startWith(this.gameIdControl.value),
    distinctUntilChanged(),
  );

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

  private params$ = combineLatest([this.gameId$, this.topCount$]);

  private leaderboard$: Observable<LeaderboardEntry[]> = this.params$.pipe(
    switchMap(([gameId, count]) => {
      if (!gameId) {
        return of([] as LeaderboardEntry[]);
      }
      return this.scoreService.getGameLeaderboard(gameId, count);
    }),
    shareReplay(1)
  );

  rows$: Observable<GameLeaderboardRow[]> = this.leaderboard$.pipe(
    map(entries => entries.map((entry, index) => ({ ...entry, rank: index + 1 })))
  );

  selectedHasGame$: Observable<boolean> = this.gameId$.pipe(
    map(id => !!id)
  );

  columns: ColumnDef<GameLeaderboardRow>[] = [
    { columnDef: 'rank', header: '#', cell: row => row.rank },
    { columnDef: 'playerName', header: 'Player' },
    { columnDef: 'totalScore', header: 'Total Score' },
    { columnDef: 'gamesPlayed', header: 'Games Played' },
    { columnDef: 'lastGamePlayed', header: 'Last Game', cell: r => new Date(r.lastGamePlayed).toLocaleString() },
  ];
}
