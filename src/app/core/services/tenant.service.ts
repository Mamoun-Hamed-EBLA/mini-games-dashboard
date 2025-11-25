import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { Tenant } from '../models/tenant.model';
import { TenantCriteria } from '../models/page-criteria.models';
import { CriteriaNormalizerService } from './criteria-normalizer.service';
import { PagedResponse, PagedData } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class TenantService {
  private readonly reload$ = new BehaviorSubject<void>(undefined);
  constructor(
    private http: HttpClient,
    private criteriaService: CriteriaNormalizerService
  ) {}

  refresh() { this.reload$.next(); }

  list(criteria?: TenantCriteria): Observable<PagedData<Tenant>> {
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
        return this.http.get<PagedResponse<Tenant>>('Tenant', { params });
      }),
      map(response => response.data)
    );
  }

  get(id: string): Observable<Tenant> {
    return this.http.get<any>(`Tenant/${id}`).pipe(map(r => (r?.data ?? r) as Tenant));
  }

  create(payload: Omit<Tenant, 'id'>): Observable<Tenant> {
    return this.http.post<any>('Tenant', payload).pipe(
      map(r => (r?.data ?? r) as Tenant),
      tap(() => this.refresh())
    );
  }

  update(id: string, changes: Partial<Tenant>): Observable<Tenant> {
    return this.http.put<any>(`Tenant/${id}`, changes).pipe(
      map(r => (r?.data ?? r) as Tenant),
      tap(() => this.refresh())
    );
  }

  delete(id: string): Observable<boolean> {
    return this.http.delete<any>(`Tenant/${id}`).pipe(
      map(() => true),
      tap(() => this.refresh())
    );
  }
}
