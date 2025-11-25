import { BaseModel } from "./base-model";

export class Game extends BaseModel  {
  name!: string;
  description!: string;
  maxScore!: number;
  timeLimit!: number; // seconds or minutes; UI uses minutes
  isActive!: boolean;
  rules?: string | null;
}
