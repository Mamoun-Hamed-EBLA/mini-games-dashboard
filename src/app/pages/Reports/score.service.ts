import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../../core/models/api-response.model';
import { LeaderboardEntry } from '../../core/models/leaderboard.model';
import { WeeklyScore } from '../../core/models/weekly-score.model';


@Injectable({ providedIn: 'root' })
export class ScoreService {
  constructor(private http: HttpClient) {}

  getLeaderboard(count?: number): Observable<LeaderboardEntry[]> {
    let params = new HttpParams();
    if (count != null) {
      params = params.set('count', String(count));
    }
    return this.http
      .get<ApiResponse<LeaderboardEntry[]>>('Scores/leaderboard', { params })
      .pipe(map(response => response.data));
  }

  getGameLeaderboard(gameId: string, count?: number): Observable<LeaderboardEntry[]> {
    let params = new HttpParams();
    if (count != null) {
      params = params.set('count', String(count));
    }
    return this.http
      .get<ApiResponse<LeaderboardEntry[]>>(`Scores/leaderboard/${gameId}`, { params })
      .pipe(map(response => response.data));
  }

  getWeeklyScores(weekStart?: string): Observable<WeeklyScore[]> {
    let params = new HttpParams();
    if (weekStart) {
      params = params.set('weekStart', weekStart);
    }
    return this.http
      .get<ApiResponse<WeeklyScore[]>>('Scores/weekly', { params })
      .pipe(map(response => response.data));
  }
}
