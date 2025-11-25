import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { GameSession } from '../models/session.model';
import { SessionCriteria } from '../models/page-criteria.models';
import { CriteriaNormalizerService } from './criteria-normalizer.service';
import { PagedResponse, PagedData } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly reload$ = new BehaviorSubject<void>(undefined);
  
  constructor(
    private http: HttpClient,
    private criteriaService: CriteriaNormalizerService
  ) {}

  refresh(): void {
    this.reload$.next();
  }

  list(criteria?: SessionCriteria): Observable<PagedData<GameSession>> {
    return this.reload$.pipe(
      switchMap(() => {
        // gameId is required and must be in the route
        if (!criteria?.gameId) {
          throw new Error('gameId is required to fetch game sessions');
        }

        let params = new HttpParams();
        if (criteria) {
          const normalized = this.criteriaService.normalize(criteria);
          Object.keys(normalized).forEach(key => {
            // Skip gameId as it's part of the route, not query params
            if (key === 'gameId') return;
            
            const value = normalized[key];
            if (value !== null && value !== undefined && value !== '') {
              params = params.set(key, String(value));
            }
          });
        }
        
        // Use gameId in the route path
        return this.http.get<PagedResponse<GameSession>>(`GameSessions/game/${criteria.gameId}`, { params });
      }),
      map(response => response.data)
    );
  }

  getByGameId(gameId: string, criteria?: SessionCriteria): Observable<PagedData<GameSession>> {
    const mergedCriteria = { ...criteria, gameId };
    return this.list(mergedCriteria);
  }

  get(id: string): Observable<GameSession> {
    return this.http.get<any>(`GameSessions/${id}`).pipe(
      map(response => (response?.data ?? response) as GameSession)
    );
  }

  create(payload: Omit<GameSession, 'id'>): Observable<GameSession> {
    return this.http.post<any>('GameSessions', payload).pipe(
      map(response => (response?.data ?? response) as GameSession),
      tap(() => this.refresh())
    );
  }

  update(id: string, changes: Partial<GameSession>): Observable<GameSession> {
    return this.http.put<any>(`GameSessions/${id}`, changes).pipe(
      map(response => (response?.data ?? response) as GameSession),
      tap(() => this.refresh())
    );
  }

  delete(id: string): Observable<boolean> {
    return this.http.delete<any>(`GameSessions/${id}`).pipe(
      map(() => true),
      tap(() => this.refresh())
    );
  }
}
