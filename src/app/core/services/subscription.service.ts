import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { Subscription } from '../models/subscription.model';
import { TenantSubscription } from '../models/tenant-subscription.model';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private readonly reload$ = new BehaviorSubject<void>(undefined);
  constructor(private http: HttpClient) {}

  refresh() { this.reload$.next(); }

  list(): Observable<TenantSubscription[]> {
    return this.reload$.pipe(
      switchMap(() => this.http.get<any>('Subscription')),
      map(resp => (resp?.data ?? resp) as TenantSubscription[])
    );
  }

  get(id: string): Observable<TenantSubscription> {
    return this.http.get<any>(`Subscription/${id}`).pipe(map(r => (r?.data ?? r) as TenantSubscription));
  }

  create(payload: Omit<TenantSubscription, 'id'>): Observable<TenantSubscription> {
    return this.http.post<any>('Subscription', payload).pipe(
      map(r => (r?.data ?? r) as TenantSubscription),
      tap(() => this.refresh())
    );
  }

  update(id: string, changes: Partial<TenantSubscription>): Observable<TenantSubscription> {
    return this.http.put<any>(`Subscription/${id}`, changes).pipe(
      map(r => (r?.data ?? r) as TenantSubscription),
      tap(() => this.refresh())
    );
  }

  delete(id: string): Observable<boolean> {
    return this.http.delete<any>(`Subscription/${id}`).pipe(
      map(() => true),
      tap(() => this.refresh())
    );
  }
}
