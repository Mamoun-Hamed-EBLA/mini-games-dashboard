import { BaseCriteria } from '../../../core/models/base-criteria.model';
import { LikeCardsOrderStatus } from '../enums/likecards-order-status.enum';

export interface LikeCardsOrderCriteria extends BaseCriteria {
  playerId?: string | null;
  productId?: string | null;
  status?: LikeCardsOrderStatus | null;
  isVerified?: boolean | null;
  requestedFrom?: Date | string | null;
  requestedTo?: Date | string | null;
  referenceId?: string | null;
}
