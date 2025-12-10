import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { PagedResponse, PagedData } from '../models/api-response.model';
import { CriteriaNormalizerService } from './criteria-normalizer.service';

export abstract class BaseCrudService<T, TCriteria = void, TListResponse = PagedData<T>> {
  protected readonly reload$ = new BehaviorSubject<void>(undefined);

  constructor(
    protected http: HttpClient,
    protected endpoint: string,
    protected criteriaService?: CriteriaNormalizerService
  ) {}

  refresh(): void {
    this.reload$.next();
  }

  list(criteria?: TCriteria): Observable<TListResponse> {
    return this.reload$.pipe(
      switchMap(() => {
        const params = this.buildParams(criteria);
        return this.http.get<PagedResponse<T>>(this.endpoint, { params });
      }),
      map(response => response.data as TListResponse)
    );
  }

  get(id: string): Observable<T> {
    return this.http.get<any>(`${this.endpoint}/${id}`).pipe(
      map(response => (response?.data ?? response) as T)
    );
  }

  create(payload: Partial<T>): Observable<T> {
    return this.http.post<any>(this.endpoint, payload).pipe(
      map(response => (response?.data ?? response) as T),
      tap(() => this.refresh())
    );
  }

  update(id: string, changes: Partial<T>): Observable<T> {
    return this.http.put<any>(`${this.endpoint}/${id}`, changes).pipe(
      map(response => (response?.data ?? response) as T),
      tap(() => this.refresh())
    );
  }

  delete(id: string): Observable<boolean> {
    return this.http.delete<any>(`${this.endpoint}/${id}`).pipe(
      map(() => true),
      tap(() => this.refresh())
    );
  }

  protected buildParams(criteria?: TCriteria): HttpParams {
    let params = new HttpParams();
    if (criteria && this.criteriaService) {
      const normalized = this.criteriaService.normalize(criteria);
      Object.keys(normalized).forEach(key => {
        const value = normalized[key];
        if (value !== null && value !== undefined && value !== '') {
          params = params.set(key, String(value));
        }
      });
    }
    return params;
  }
}
