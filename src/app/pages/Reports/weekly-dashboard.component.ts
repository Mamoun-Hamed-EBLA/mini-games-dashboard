import { Component, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { DataTableComponent, ColumnDef } from '../../shared/components/data-table/data-table.component';
import { Observable } from 'rxjs';
import { map, switchMap, startWith, debounceTime, distinctUntilChanged, shareReplay } from 'rxjs';
import { WeeklyScore } from '../../core/models/weekly-score.model';
import { ScoreService } from './score.service';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';

interface WeeklyRow extends WeeklyScore {
  rank: number;
}

@Component({
  selector: 'app-weekly-dashboard',
  standalone: true,
  imports: [SharedModule, DataTableComponent,MatDatepickerModule],
  template: `
    <div class="weekly-dashboard-page">
      <mat-toolbar color="primary">
        <span>Weekly Dashboard</span>
        <span class="spacer"></span>
      </mat-toolbar>

      <mat-card>
        <mat-card-content>
          <div class="filters-row">
            <mat-form-field appearance="outline" class="date-field">
              <mat-label>Week start</mat-label>
              <input
                matInput
                [matDatepicker]="weekPicker"
                [formControl]="weekStartControl"
              />
              <mat-datepicker-toggle matSuffix [for]="weekPicker"></mat-datepicker-toggle>
              <mat-datepicker #weekPicker></mat-datepicker>
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
    `.weekly-dashboard-page{ display:flex; flex-direction:column; gap:16px; }
     .spacer{ flex:1 1 auto; }
     .filters-row{ display:flex; align-items:center; gap:12px; margin-bottom:12px; flex-wrap:wrap; }
     .date-field{ width:220px; max-width:100%; }
     @media (max-width: 768px){ .weekly-dashboard-page{ gap:12px; } .date-field{ width:100%; } }`
  ]
})
export class WeeklyDashboardComponent {
  private scoreService = inject(ScoreService);

  weekStartControl = new FormControl<Date | null>(this.getDefaultWeekStart());

  private weekStart$ = this.weekStartControl.valueChanges.pipe(
    startWith(this.weekStartControl.value),
    debounceTime(300),
    map(date => date ? date.toISOString() : ''),
    distinctUntilChanged(),
  );

  private weeklyScores$: Observable<WeeklyScore[]> = this.weekStart$.pipe(
    switchMap(weekStart => this.scoreService.getWeeklyScores(weekStart || undefined)),
    shareReplay(1)
  );

  rows$: Observable<WeeklyRow[]> = this.weeklyScores$.pipe(
    map(entries => entries.map((entry, index) => ({ ...entry, rank: index + 1 })))
  );

  columns: ColumnDef<WeeklyRow>[] = [
    { columnDef: 'rank', header: '#', cell: row => row.rank },
    { columnDef: 'playerName', header: 'Player' },
    { columnDef: 'weeklyScore', header: 'Weekly Score' },
    { columnDef: 'gamesPlayedThisWeek', header: 'Games This Week' },
    { columnDef: 'weekStartDate', header: 'Week Start', cell: r => new Date(r.weekStartDate).toLocaleDateString() },
    { columnDef: 'weekEndDate', header: 'Week End', cell: r => new Date(r.weekEndDate).toLocaleDateString() },
  ];

  private getDefaultWeekStart(): Date {
    const today = new Date();
    const day = today.getDay();
    const diff = (day + 6) % 7;
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - diff);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  }
}
