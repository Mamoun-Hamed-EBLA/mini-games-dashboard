import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { Tenant } from '../models/tenant.model';

@Injectable({ providedIn: 'root' })
export class TenantService {
  private readonly reload$ = new BehaviorSubject<void>(undefined);
  constructor(private http: HttpClient) {}

  refresh() { this.reload$.next(); }

  list(): Observable<Tenant[]> {
    return this.reload$.pipe(
      switchMap(() => this.http.get<any>('Tenant')),
      map(resp => (resp?.data ?? resp) as Tenant[])
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
