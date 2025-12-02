import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { Badge } from '../models/badge.model';
import { BaseCriteria } from '../models/base-criteria.model';
import { CriteriaNormalizerService } from './criteria-normalizer.service';
import { PagedResponse, PagedData } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class BadgeService {
  private readonly reload$ = new BehaviorSubject<void>(undefined);

  constructor(
    private http: HttpClient,
    private criteriaService: CriteriaNormalizerService
  ) {}

  refresh(): void {
    this.reload$.next();
  }

  list(criteria?: BaseCriteria): Observable<PagedData<Badge>> {
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
        return this.http.get<PagedResponse<Badge>>('Badges', { params });
      }),
      map(response => response.data)
    );
  }

  get(id: string): Observable<Badge> {
    return this.http.get<any>(`Badges/${id}`).pipe(
      map(response => (response?.data ?? response) as Badge)
    );
  }

  create(payload: Omit<Badge, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Observable<Badge> {
    return this.http.post<any>('Badges', payload).pipe(
      map(response => (response?.data ?? response) as Badge),
      tap(() => this.refresh())
    );
  }

  update(id: string, changes: Partial<Badge>): Observable<Badge> {
    return this.http.put<any>(`Badges/${id}`, changes).pipe(
      map(response => (response?.data ?? response) as Badge),
      tap(() => this.refresh())
    );
  }

  delete(id: string): Observable<boolean> {
    return this.http.delete<any>(`Badges/${id}`).pipe(
      map(() => true),
      tap(() => this.refresh())
    );
  }
}
