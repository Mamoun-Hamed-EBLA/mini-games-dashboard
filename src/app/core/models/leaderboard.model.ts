import { BaseModel } from './base-model';

export interface LeaderboardEntry extends BaseModel {
  playerId: string;
  playerName: string;
  totalScore: number;
  gamesPlayed: number;
  lastGamePlayed: string;
}
