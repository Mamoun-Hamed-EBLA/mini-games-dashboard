import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Player } from '../models/player.model';
import { BaseCriteria } from '../models/base-criteria.model';
import { CriteriaNormalizerService } from './criteria-normalizer.service';
import { BaseCrudService } from './base-crud.service';

@Injectable({ providedIn: 'root' })
export class PlayerService extends BaseCrudService<Player, BaseCriteria> {
  constructor(http: HttpClient, criteriaService: CriteriaNormalizerService) {
    super(http, 'Players', criteriaService);
  }
}
