import { BaseCriteria } from '../../../core/models/base-criteria.model';

export interface ProductSerialCriteria extends BaseCriteria {
  productId?: string | null;
  ownerId?: string | null;
  isUsed?: boolean | null;
  validFrom?: Date | string | null;
  validTo?: Date | string | null;
}
