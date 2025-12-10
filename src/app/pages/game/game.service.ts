import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Game } from './game.model';
import { GameCriteria } from '../../core/models/page-criteria.models';
import { CriteriaNormalizerService } from '../../core/services/criteria-normalizer.service';
import { BaseCrudService } from '../../core/services/base-crud.service';

@Injectable({ providedIn: 'root' })
export class GameService extends BaseCrudService<Game, GameCriteria> {
  constructor(http: HttpClient, criteriaService: CriteriaNormalizerService) {
    super(http, 'Games', criteriaService);
  }
}
