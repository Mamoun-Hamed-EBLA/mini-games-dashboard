import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Reward } from '../models/reward.model';
import { BaseCriteria } from '../models/base-criteria.model';
import { CriteriaNormalizerService } from './criteria-normalizer.service';
import { BaseCrudService } from './base-crud.service';

@Injectable({ providedIn: 'root' })
export class RewardService extends BaseCrudService<Reward, BaseCriteria> {
  constructor(http: HttpClient, criteriaService: CriteriaNormalizerService) {
    super(http, 'Rewards', criteriaService);
  }
}
