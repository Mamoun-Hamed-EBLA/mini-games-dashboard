import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { CardBackground } from '../models/card-background.model';
import { BaseCriteria } from '../models/base-criteria.model';
import { CriteriaNormalizerService } from './criteria-normalizer.service';
import { PagedResponse, PagedData } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class CardBackgroundService {
  private readonly reload$ = new BehaviorSubject<void>(undefined);

  constructor(
    private http: HttpClient,
    private criteriaService: CriteriaNormalizerService
  ) {}

  refresh(): void {
    this.reload$.next();
  }

  list(criteria?: BaseCriteria): Observable<PagedData<CardBackground>> {
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
        return this.http.get<PagedResponse<CardBackground>>('CardBackgrounds', { params });
      }),
      map(response => response.data)
    );
  }

  get(id: string): Observable<CardBackground> {
    return this.http.get<any>(`CardBackgrounds/${id}`).pipe(
      map(response => (response?.data ?? response) as CardBackground)
    );
  }

  create(payload: Omit<CardBackground, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Observable<CardBackground> {
    return this.http.post<any>('CardBackgrounds', payload).pipe(
      map(response => (response?.data ?? response) as CardBackground),
      tap(() => this.refresh())
    );
  }

  update(id: string, changes: Partial<CardBackground>): Observable<CardBackground> {
    return this.http.put<any>(`CardBackgrounds/${id}`, changes).pipe(
      map(response => (response?.data ?? response) as CardBackground),
      tap(() => this.refresh())
    );
  }

  delete(id: string): Observable<boolean> {
    return this.http.delete<any>(`CardBackgrounds/${id}`).pipe(
      map(() => true),
      tap(() => this.refresh())
    );
  }
}
