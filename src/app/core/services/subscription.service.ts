import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { TenantSubscription } from '../models/tenant-subscription.model';
import { BaseCrudService } from './base-crud.service';

@Injectable({ providedIn: 'root' })
export class SubscriptionService extends BaseCrudService<TenantSubscription, void, TenantSubscription[]> {
  constructor(http: HttpClient) {
    super(http, 'Subscription');
  }

  override list(): Observable<TenantSubscription[]> {
    return this.reload$.pipe(
      switchMap(() => this.http.get<any>(this.endpoint)),
      map(resp => (resp?.data ?? resp) as TenantSubscription[])
    );
  }
}
