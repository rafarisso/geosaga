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
  /** Melhor avaliação por estrelas (0–3) na fase jogável de cada região. */
  stageStars: Partial<Record<RegionId, number>>;
  /** Verdadeiro quando o jogador venceu o Desafio Brasil (todas as regiões). */
  masterOfBrazil: boolean;
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

/** Chefe regional: o "problema-mor" da região, só derrotado com o quiz. */
export interface BossDefinition {
  name: string;
  emoji: string;
  color: string;
  /** Vida do chefe (antes da escala por região). */
  hp: number;
  /** Dano por contato com o chefe. */
  contactDamage: number;
  /** Intervalo, em segundos, entre os ataques do chefe. */
  attackInterval: number;
  /** Padrão dos projéteis disparados pelo chefe. */
  attackPattern: 'single' | 'double' | 'spread';
  /** Fala exibida quando o chefe aparece. */
  taunt: string;
}

/** Plataforma estática (one-way) onde o jogador pode pousar. */
export interface PlatformDef {
  x: number;
  /** Altura do topo da plataforma (coordenada Y do mundo). */
  y: number;
  width: number;
}

export type HazardKind = 'fogo' | 'agua' | 'gelo' | 'fumaca';

/** Zona de perigo temática que causa dano ao jogador. */
export interface HazardDef {
  x: number;
  width: number;
  kind: HazardKind;
  label: string;
  /** Dano por contato. */
  damage?: number;
  /** Força horizontal aplicada enquanto o jogador está na área. */
  push?: number;
  /** Multiplicador da velocidade máxima dentro da área. */
  speedMultiplier?: number;
}

export type SceneryDecorationKind =
  | 'amazon-tree'
  | 'river'
  | 'cactus'
  | 'rock'
  | 'buriti'
  | 'wetland'
  | 'skyline'
  | 'factory'
  | 'araucaria'
  | 'pampas';

export interface SceneryDecoration {
  kind: SceneryDecorationKind;
  x: number;
  bottom?: number;
  scale?: number;
  depth: 'far' | 'mid' | 'near';
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
  /** Ícone temático do objetivo final liberado ao limpar a fase. */
  goalIcon: string;
  /** Rótulo do objetivo final (ex.: "Cisterna", "Floresta"). */
  goalLabel: string;
  /** Lista de ids de problemas regionais que aparecem na fase. */
  enemyIds: string[];
  /** Posições horizontais dos problemas, na mesma ordem de enemyIds. */
  enemySpawns: number[];
  /** Chefe regional enfrentado após limpar os problemas. */
  boss: BossDefinition;
  /** Plataformas da fase (verticalidade). */
  platforms: PlatformDef[];
  /** Zonas de perigo temáticas. */
  hazards: HazardDef[];
  /** Multiplicador de dificuldade (vida/dano dos inimigos e do chefe). */
  difficulty: number;
  /** Sensação de movimento própria da fase. */
  movement: {
    acceleration: number;
    deceleration: number;
    airControl: number;
  };
  /** Mecânica regional apresentada ao jogador. */
  mechanic: {
    label: string;
    hint: string;
  };
  /** Tema visual do cenário lateral. */
  scenery: {
    skyTop: string;
    skyBottom: string;
    ground: string;
    groundAccent: string;
    hill: string;
    haze: string;
    decorations: SceneryDecoration[];
  };
}

export interface StageResult {
  region: RegionId;
  score: number;
  victory: boolean;
  /** Estrelas conquistadas (0–3) conforme desempenho. */
  stars: number;
}

