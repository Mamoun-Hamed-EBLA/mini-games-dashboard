import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Tenant } from '../models/tenant.model';
import { TenantCriteria } from '../models/page-criteria.models';
import { CriteriaNormalizerService } from './criteria-normalizer.service';
import { BaseCrudService } from './base-crud.service';

@Injectable({ providedIn: 'root' })
export class TenantService extends BaseCrudService<Tenant, TenantCriteria> {
  constructor(http: HttpClient, criteriaService: CriteriaNormalizerService) {
    super(http, 'Tenant', criteriaService);
  }
}
