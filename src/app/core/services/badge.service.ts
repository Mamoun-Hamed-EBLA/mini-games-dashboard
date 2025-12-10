import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Badge } from '../models/badge.model';
import { BaseCriteria } from '../models/base-criteria.model';
import { CriteriaNormalizerService } from './criteria-normalizer.service';
import { BaseCrudService } from './base-crud.service';

@Injectable({ providedIn: 'root' })
export class BadgeService extends BaseCrudService<Badge, BaseCriteria> {
  constructor(http: HttpClient, criteriaService: CriteriaNormalizerService) {
    super(http, 'Badges', criteriaService);
  }
}
