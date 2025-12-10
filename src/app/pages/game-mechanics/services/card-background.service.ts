import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CardBackground } from '../models/card-background.model';
import { BaseCriteria } from '../../../core/models/base-criteria.model';
import { CriteriaNormalizerService } from '../../../core/services/criteria-normalizer.service';
import { BaseCrudService } from '../../../core/services/base-crud.service';

@Injectable({ providedIn: 'root' })
export class CardBackgroundService extends BaseCrudService<CardBackground, BaseCriteria> {
  constructor(http: HttpClient, criteriaService: CriteriaNormalizerService) {
    super(http, 'CardBackgrounds', criteriaService);
  }
}
