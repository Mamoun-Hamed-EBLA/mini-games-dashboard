import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseCriteria } from '../../core/models/base-criteria.model';
import { BaseCrudService } from '../../core/services/base-crud.service';
import { CriteriaNormalizerService } from '../../core/services/criteria-normalizer.service';
import { Player } from './player.model';


@Injectable({ providedIn: 'root' })
export class PlayerService extends BaseCrudService<Player, BaseCriteria> {
  constructor(http: HttpClient, criteriaService: CriteriaNormalizerService) {
    super(http, 'Players', criteriaService);
  }
}
