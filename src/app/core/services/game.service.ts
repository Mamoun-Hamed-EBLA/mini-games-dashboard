import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { Game } from '../models/game.model';
import { GameCriteria } from '../models/page-criteria.models';
import { CriteriaNormalizerService } from './criteria-normalizer.service';
import { PagedResponse, PagedData } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class GameService {
  private readonly reload$ = new BehaviorSubject<void>(undefined);
  constructor(
    private http: HttpClient,
    private criteriaService: CriteriaNormalizerService
  ) {}

  refresh() { this.reload$.next(); }

  list(criteria?: GameCriteria): Observable<PagedData<Game>> {
    return this.reload$.pipe(
      switchMap(() => {
        let params = new HttpParams();
        if (criteria) {
          const normalized = this.criteriaService.normalize(criteria);
          Object.keys(normalized).forEach(key => {
            const value = normalized[key];
            if (value !== null && value !== undefined && value !== '') {
              params = params.set(key, String(value));
            }
          });
        }
        return this.http.get<PagedResponse<Game>>('Games', { params });
      }),
      map(response => response.data)
    );
  }

  get(id: string): Observable<Game> {
    return this.http.get<any>(`Games/${id}`).pipe(map(r => (r?.data ?? r) as Game));
  }

  create(payload: Omit<Game, 'id'>): Observable<Game> {
    return this.http.post<any>('Games', payload).pipe(
      map(r => (r?.data ?? r) as Game),
      tap(() => this.refresh())
    );
  }

  update(id: string, changes: Partial<Game>): Observable<Game> {
    return this.http.put<any>(`Games/${id}`, changes).pipe(
      map(r => (r?.data ?? r) as Game),
      tap(() => this.refresh())
    );
  }

  delete(id: string): Observable<boolean> {
    return this.http.delete<any>(`Games/${id}`).pipe(
      map(() => true),
      tap(() => this.refresh())
    );
  }
}
