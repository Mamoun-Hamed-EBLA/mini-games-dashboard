import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseCriteria } from '../../../core/models/base-criteria.model';
import { CriteriaNormalizerService } from '../../../core/services/criteria-normalizer.service';
import { BaseCrudService } from '../../../core/services/base-crud.service';
import { Reward } from '../models/reward.model';

@Injectable({ providedIn: 'root' })
export class RewardService extends BaseCrudService<Reward, BaseCriteria> {
  constructor(http: HttpClient, criteriaService: CriteriaNormalizerService) {
    super(http, 'Rewards', criteriaService);
  }
}
