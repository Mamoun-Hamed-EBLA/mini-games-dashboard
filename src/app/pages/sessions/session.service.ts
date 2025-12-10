import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { GameSession } from './session.model';
import { SessionCriteria } from '../../core/models/page-criteria.models';
import { CriteriaNormalizerService } from '../../core/services/criteria-normalizer.service';
import { PagedResponse, PagedData } from '../../core/models/api-response.model';
import { BaseCrudService } from '../../core/services/base-crud.service';

@Injectable({ providedIn: 'root' })
export class SessionService extends BaseCrudService<GameSession, SessionCriteria> {
  constructor(http: HttpClient, criteriaService: CriteriaNormalizerService) {
    super(http, 'GameSessions', criteriaService);
  }

  override list(criteria?: SessionCriteria): Observable<PagedData<GameSession>> {
    return this.reload$.pipe(
      switchMap(() => {
        if (!criteria?.gameId) {
          throw new Error('gameId is required to fetch game sessions');
        }

        let params = new HttpParams();
        const normalized = this.criteriaService!.normalize(criteria);
        Object.keys(normalized).forEach(key => {
          if (key === 'gameId') return;
          const value = normalized[key];
          if (value !== null && value !== undefined && value !== '') {
            params = params.set(key, String(value));
          }
        });

        return this.http.get<PagedResponse<GameSession>>(`${this.endpoint}/game/${criteria.gameId}`, { params });
      }),
      map(response => response.data)
    );
  }

  getByGameId(gameId: string, criteria?: SessionCriteria): Observable<PagedData<GameSession>> {
    return this.list({ ...criteria, gameId });
  }
}
