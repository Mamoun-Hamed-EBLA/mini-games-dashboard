
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { CriteriaNormalizerService } from '../../../core/services/criteria-normalizer.service';
import { BaseCrudService } from '../../../core/services/base-crud.service';
import { LikeCardsOrderDto } from '../models/likecards-order.model';
import { LikeCardsOrderCriteria } from '../models/likecards-order-criteria.model';

@Injectable({ providedIn: 'root' })
export class LikeCardsOrdersService extends BaseCrudService<LikeCardsOrderDto, LikeCardsOrderCriteria> {
  constructor(http: HttpClient, criteriaService: CriteriaNormalizerService) {
    super(http, 'LikeCardsOrders', criteriaService);
  }

  complete(orderId: string, serialId: string | null, message: string | null): Observable<boolean> {
    return this.http
      .put<any>(`${this.endpoint}/${orderId}/complete`, { serialId, message })
      .pipe(
        map(() => true),
        tap(() => this.refresh())
      );
  }

  cancel(orderId: string, reason: string): Observable<boolean> {
    return this.http
      .put<any>(`${this.endpoint}/${orderId}/cancel`, { reason })
      .pipe(
        map(() => true),
        tap(() => this.refresh())
      );
  }

  fail(orderId: string, reason: string): Observable<boolean> {
    return this.http
      .put<any>(`${this.endpoint}/${orderId}/fail`, { reason })
      .pipe(
        map(() => true),
        tap(() => this.refresh())
      );
  }

  reject(orderId: string, reason: string): Observable<boolean> {
    return this.http
      .put<any>(`${this.endpoint}/${orderId}/reject`, { reason })
      .pipe(
        map(() => true),
        tap(() => this.refresh())
      );
  }

  verify(orderId: string, verifiedBy: string): Observable<boolean> {
    return this.http
      .put<any>(`${this.endpoint}/${orderId}/verify`, { verifiedBy })
      .pipe(
        map(() => true),
        tap(() => this.refresh())
      );
  }
}
