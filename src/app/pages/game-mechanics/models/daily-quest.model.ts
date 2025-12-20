import { BaseModel } from '../../../core/models/base-model';
import { QuestStatus } from '../enums/QuestStatus';

export class DailyQuest extends BaseModel {
  date!: string;
  gameId!: string;
  requiredScore!: number;
  gemReward!: number;
  status!: QuestStatus;
  description?: string;
}
