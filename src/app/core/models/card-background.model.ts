import { BaseModel } from './base-model';

export interface CardBackground extends BaseModel {
  name: string;
  gameId: string;
  imageUrl: string;
  description: string;
  isActive: boolean;
  isPurchasable: boolean;
  price?: number | null;
}
