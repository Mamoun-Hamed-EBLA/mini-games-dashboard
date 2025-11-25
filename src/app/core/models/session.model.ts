import { GameStatus } from '../enums/GameStatus';
import { BaseModel } from './base-model';

export interface GameSession extends BaseModel{
  playerId: string;
  gameId: string;
  gameName: string;
  status: GameStatus;
  startedAt: string;
  endedAt?: string | null;
  finalScore: number;
  duration?: string | null;
  gameData?: string | null;
  rejectionReason?: string | null;
}
