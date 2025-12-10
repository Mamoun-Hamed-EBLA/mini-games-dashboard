import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Game } from '../models/game.model';
import { GameCriteria } from '../models/page-criteria.models';
import { CriteriaNormalizerService } from './criteria-normalizer.service';
import { BaseCrudService } from './base-crud.service';

@Injectable({ providedIn: 'root' })
export class GameService extends BaseCrudService<Game, GameCriteria> {
  constructor(http: HttpClient, criteriaService: CriteriaNormalizerService) {
    super(http, 'Games', criteriaService);
  }
}
