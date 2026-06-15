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
  /** Regiões cuja fase jogável (não apenas o quiz) já foi vencida. */
  completedStages: RegionId[];
  /** Melhor pontuação obtida na fase jogável de cada região. */
  stageScores: Partial<Record<RegionId, number>>;
}

/** Atributos de gameplay de cada guardião controlável. */
export interface CharacterStats {
  /** Vida máxima do guardião na fase. */
  vida: number;
  /** Velocidade horizontal em pixels por segundo. */
  velocidade: number;
  /** Impulso vertical do pulo em pixels por segundo. */
  pulo: number;
  /** Dano do ataque básico (restaurar). */
  ataque: number;
  /** Dano do golpe especial quando o quiz é acertado. */
  poderEspecial: number;
}

/** Um problema socioambiental da região, representado como inimigo simbólico. */
export interface RegionalProblem {
  id: string;
  region: RegionId;
  name: string;
  /** Placeholder visual enquanto não há arte final. */
  emoji: string;
  description: string;
  /** Pontos de vida do problema. */
  hp: number;
  /** Dano causado ao jogador por contato. */
  contactDamage: number;
  /** Cor temática do bloco/card do inimigo. */
  color: string;
}

/** Definição de uma fase jogável de uma região. */
export interface StageDefinition {
  region: RegionId;
  title: string;
  /** Objetivo regional exibido na HUD. */
  objective: string;
  /** Verbo simbólico do ataque básico (ex.: "Purificar"). */
  attackVerb: string;
  /** Verbo simbólico do golpe especial (ex.: "Onda das águas"). */
  specialVerb: string;
  /** Mensagem mostrada ao concluir a fase. */
  victoryMessage: string;
  /** Lista de ids de problemas regionais que aparecem na fase. */
  enemyIds: string[];
  /** Tema visual do cenário lateral. */
  scenery: {
    skyTop: string;
    skyBottom: string;
    ground: string;
    groundAccent: string;
    hill: string;
  };
}

export interface StageResult {
  region: RegionId;
  score: number;
  victory: boolean;
}

