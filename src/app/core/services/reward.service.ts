import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { Reward } from '../models/reward.model';
import { BaseCriteria } from '../models/base-criteria.model';
import { CriteriaNormalizerService } from './criteria-normalizer.service';
import { PagedResponse, PagedData } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class RewardService {
  private readonly reload$ = new BehaviorSubject<void>(undefined);

  constructor(
    private http: HttpClient,
    private criteriaService: CriteriaNormalizerService
  ) {}

  refresh(): void {
    this.reload$.next();
  }

  list(criteria?: BaseCriteria): Observable<PagedData<Reward>> {
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
        return this.http.get<PagedResponse<Reward>>('Rewards', { params });
      }),
      map(response => response.data)
    );
  }

  get(id: string): Observable<Reward> {
    return this.http.get<any>(`Rewards/${id}`).pipe(
      map(response => (response?.data ?? response) as Reward)
    );
  }

  create(payload: Omit<Reward, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Observable<Reward> {
    return this.http.post<any>('Rewards', payload).pipe(
      map(response => (response?.data ?? response) as Reward),
      tap(() => this.refresh())
    );
  }

  update(id: string, changes: Partial<Reward>): Observable<Reward> {
    return this.http.put<any>(`Rewards/${id}`, changes).pipe(
      map(response => (response?.data ?? response) as Reward),
      tap(() => this.refresh())
    );
  }

  delete(id: string): Observable<boolean> {
    return this.http.delete<any>(`Rewards/${id}`).pipe(
      map(() => true),
      tap(() => this.refresh())
    );
  }
}
