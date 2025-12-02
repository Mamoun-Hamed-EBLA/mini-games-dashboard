import { BaseModel } from './base-model';
import { RewardType } from '../enums/RewardType';
import { KeyType } from '../enums/KeyType';

export interface Reward extends BaseModel {
  name: string;
  description: string;
  rewardType: RewardType;
  isActive: boolean;
  quantity?: number | null;
  badgeId?: string | null;
  cardBackgroundId?: string | null;
  resourceUrl?: string | null;
  keyType?: KeyType | null;
  expiresAt?: string | null;
}
