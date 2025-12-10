import { BaseModel } from '../../../core/models/base-model';
import { BadgeType } from '../enums/BadgeType';

export interface Badge extends BaseModel {
  name: string;
  badgeType: BadgeType;
  iconUrl: string;
  description: string;
  isActive: boolean;
}
