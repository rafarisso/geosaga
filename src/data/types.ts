export type RegionId = 'norte' | 'nordeste' | 'centro-oeste' | 'sudeste' | 'sul';

export type Difficulty = 1 | 2 | 3;

export type AnimationState = 'idle' | 'walk' | 'jump' | 'attack' | 'hit' | 'victory';

export interface Guardian {
  id: string;
  name: string;
  title: string;
  power: string;
  description: string;
}

export interface Region {
  id: RegionId;
  name: string;
  guardian: Guardian;
  biome: string;
  shortDescription: string;
  color: number;
  themeColor: string;
  accentColor: string;
  mapX: number;
  mapY: number;
  unlocked: boolean;
}

export interface Question {
  id: string;
  statement: string;
  choices: [string, string, string, string];
  answerIndex: 0 | 1 | 2 | 3;
  explanation: string;
  region: RegionId;
  difficulty: Difficulty;
}

export interface QuizResult {
  region: RegionId;
  correctAnswers: number;
  totalQuestions: number;
  passed: boolean;
}

export interface GameProgress {
  completedRegions: RegionId[];
  badges: RegionId[];
  bestScores: Partial<Record<RegionId, number>>;
  totalScore: number;
  lastRegion: RegionId | null;
}

