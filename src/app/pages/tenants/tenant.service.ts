import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TenantCriteria } from '../../core/models/page-criteria.models';
import { CriteriaNormalizerService } from '../../core/services/criteria-normalizer.service';
import { BaseCrudService } from '../../core/services/base-crud.service';
import { Tenant } from './tenant.model';

@Injectable({ providedIn: 'root' })
export class TenantService extends BaseCrudService<Tenant, TenantCriteria> {
  constructor(http: HttpClient, criteriaService: CriteriaNormalizerService) {
    super(http, 'Tenant', criteriaService);
  }
}
