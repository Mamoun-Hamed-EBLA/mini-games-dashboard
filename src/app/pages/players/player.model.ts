import { BaseModel } from '../../core/models/base-model';

export interface Player extends BaseModel {
  username: string;
  socialMediaId: string;
  countryCode: string;
  icon: string;
  frame: string;
  score: number;
  lastLoginAt?: string | null;
  isActive: boolean;
}
