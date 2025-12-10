import { BaseModel } from './base-model';

export interface MiniGame extends BaseModel {
  name: string;
  description: string;
  isActive: boolean;
}
