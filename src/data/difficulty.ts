import type { GameDifficulty } from './types';

export interface DifficultyConfig {
  id: GameDifficulty;
  label: string;
  icon: string;
  hint: string;
  /** Multiplicador aplicado à vida/dano de inimigos e do chefe. */
  enemyScale: number;
  /** Multiplicador aplicado à vida máxima do guardião. */
  playerHpScale: number;
}

/** Níveis de desafio escolhíveis pelo jogador, do mais leve ao mais puxado. */
export const DIFFICULTIES: Record<GameDifficulty, DifficultyConfig> = {
  facil: {
    id: 'facil',
    label: 'Explorador',
    icon: '🌱',
    hint: 'Inimigos mais fracos e mais vida. Ideal para aprender.',
    enemyScale: 0.78,
    playerHpScale: 1.3,
  },
  normal: {
    id: 'normal',
    label: 'Guardião',
    icon: '🛡️',
    hint: 'O desafio equilibrado, do jeito que a aventura foi pensada.',
    enemyScale: 1,
    playerHpScale: 1,
  },
  dificil: {
    id: 'dificil',
    label: 'Herói',
    icon: '🔥',
    hint: 'Inimigos mais fortes e menos vida. Para quem domina a geografia.',
    enemyScale: 1.32,
    playerHpScale: 0.82,
  },
};

export const DIFFICULTY_LIST: DifficultyConfig[] = [
  DIFFICULTIES.facil,
  DIFFICULTIES.normal,
  DIFFICULTIES.dificil,
];
