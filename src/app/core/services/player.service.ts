import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { Player } from '../models/player.model';
import { BaseCriteria } from '../models/base-criteria.model';
import { CriteriaNormalizerService } from './criteria-normalizer.service';
import { PagedResponse, PagedData } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private readonly reload$ = new BehaviorSubject<void>(undefined);

  constructor(
    private http: HttpClient,
    private criteriaService: CriteriaNormalizerService
  ) {}

  refresh(): void {
    this.reload$.next();
  }

  list(criteria?: BaseCriteria): Observable<PagedData<Player>> {
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
        return this.http.get<PagedResponse<Player>>('Players', { params });
      }),
      map(response => response.data)
    );
  }

  get(id: string): Observable<Player> {
    return this.http.get<any>(`Players/${id}`).pipe(
      map(response => (response?.data ?? response) as Player)
    );
  }

  create(payload: Omit<Player, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Observable<Player> {
    return this.http.post<any>('Players', payload).pipe(
      map(response => (response?.data ?? response) as Player),
      tap(() => this.refresh())
    );
  }

  update(id: string, changes: Partial<Player>): Observable<Player> {
    return this.http.put<any>(`Players/${id}`, changes).pipe(
      map(response => (response?.data ?? response) as Player),
      tap(() => this.refresh())
    );
  }

  delete(id: string): Observable<boolean> {
    return this.http.delete<any>(`Players/${id}`).pipe(
      map(() => true),
      tap(() => this.refresh())
    );
  }
}
