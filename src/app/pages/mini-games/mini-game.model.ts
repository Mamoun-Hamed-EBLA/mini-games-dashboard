import { BaseModel } from '../../core/models/base-model';

export interface MiniGame extends BaseModel {
  name: string;
  description: string;
  isActive: boolean;
}
