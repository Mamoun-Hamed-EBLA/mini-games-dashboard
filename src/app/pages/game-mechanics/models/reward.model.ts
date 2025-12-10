import { KeyType } from "../../../core/enums/KeyType";
import { BaseModel } from "../../../core/models/base-model";
import { RewardType } from "../enums/RewardType";


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
