import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Badge } from '../models/badge.model';
import { BaseCriteria } from '../../../core/models/base-criteria.model';
import { CriteriaNormalizerService } from '../../../core/services/criteria-normalizer.service';
import { BaseCrudService } from '../../../core/services/base-crud.service';

@Injectable({ providedIn: 'root' })
export class BadgeService extends BaseCrudService<Badge, BaseCriteria> {
  constructor(http: HttpClient, criteriaService: CriteriaNormalizerService) {
    super(http, 'Badges', criteriaService);
  }
}
