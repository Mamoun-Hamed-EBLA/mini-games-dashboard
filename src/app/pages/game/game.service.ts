import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Game } from './game.model';
import { GameCriteria } from '../../core/models/page-criteria.models';
import { CriteriaNormalizerService } from '../../core/services/criteria-normalizer.service';
import { BaseCrudService } from '../../core/services/base-crud.service';
import { map, Observable } from 'rxjs';
import { Lookup } from '../../core/models/lookup';
import { ApiResponse } from '../../core/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class GameService extends BaseCrudService<Game, GameCriteria> {
  constructor(http: HttpClient, criteriaService: CriteriaNormalizerService) {
    super(http, 'Games', criteriaService);
  }
  loadAsLookup(): Observable<Lookup[]> {
    return this.http.get<ApiResponse<Lookup[]>>('Games/lookup').pipe(
      map(response => response.data as Lookup[])
    );
  }
}
