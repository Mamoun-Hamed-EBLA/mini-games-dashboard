
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CriteriaNormalizerService } from '../../../core/services/criteria-normalizer.service';
import { BaseCrudService } from '../../../core/services/base-crud.service';
import { ProductSerialDto } from '../models/product-serial.model';
import { ProductSerialCriteria } from '../models/product-serial-criteria.model';

@Injectable({ providedIn: 'root' })
export class ProductSerialService extends BaseCrudService<ProductSerialDto, ProductSerialCriteria> {
  constructor(http: HttpClient, criteriaService: CriteriaNormalizerService) {
    super(http, 'ProductSerials', criteriaService);
  }
}
