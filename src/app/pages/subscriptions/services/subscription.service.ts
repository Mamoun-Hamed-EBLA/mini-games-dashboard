import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { BaseCrudService } from '../../../core/services/base-crud.service';
import { TenantSubscription } from '../models/tenantSubscription';

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
