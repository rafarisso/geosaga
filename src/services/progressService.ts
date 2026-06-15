import type { GameProgress, QuizResult, RegionId, StageResult } from '../data/types';

const STORAGE_KEY = 'geosaga-progress-v1';

export const EMPTY_PROGRESS: GameProgress = {
  completedRegions: [],
  badges: [],
  bestScores: {},
  totalScore: 0,
  lastRegion: null,
  completedStages: [],
  stageScores: {},
};

function isRegionId(value: unknown): value is RegionId {
  return ['norte', 'nordeste', 'centro-oeste', 'sudeste', 'sul'].includes(String(value));
}

export function loadProgress(): GameProgress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return EMPTY_PROGRESS;
    const parsed = JSON.parse(stored) as Partial<GameProgress>;
    const completedRegions = (parsed.completedRegions ?? []).filter(isRegionId);
    const badges = (parsed.badges ?? []).filter(isRegionId);
    const bestScores = parsed.bestScores ?? {};
    const completedStages = (parsed.completedStages ?? []).filter(isRegionId);
    const stageScores = parsed.stageScores ?? {};
    const totalScore =
      Object.values(bestScores).reduce((sum, score) => sum + (score ?? 0), 0) +
      Object.values(stageScores).reduce((sum, score) => sum + (score ?? 0), 0);

    return {
      completedRegions,
      badges,
      bestScores,
      totalScore,
      lastRegion: isRegionId(parsed.lastRegion) ? parsed.lastRegion : null,
      completedStages,
      stageScores,
    };
  } catch {
    return EMPTY_PROGRESS;
  }
}

export function saveProgress(progress: GameProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function registerQuizResult(progress: GameProgress, result: QuizResult): GameProgress {
  const score = result.correctAnswers * 100;
  const bestScores = {
    ...progress.bestScores,
    [result.region]: Math.max(progress.bestScores[result.region] ?? 0, score),
  };
  const completedRegions = result.passed
    ? Array.from(new Set([...progress.completedRegions, result.region]))
    : progress.completedRegions;
  const badges = result.passed
    ? Array.from(new Set([...progress.badges, result.region]))
    : progress.badges;

  const nextProgress: GameProgress = {
    ...progress,
    completedRegions,
    badges,
    bestScores,
    totalScore: sumScores(bestScores, progress.stageScores),
    lastRegion: result.region,
  };
  saveProgress(nextProgress);
  return nextProgress;
}

function sumScores(...maps: Partial<Record<RegionId, number>>[]): number {
  return maps.reduce(
    (total, map) => total + Object.values(map).reduce((sum, value) => sum + (value ?? 0), 0),
    0,
  );
}

/**
 * Registra a conclusão de uma fase jogável. Ao vencer, a região recebe o selo
 * (badge) e é marcada como concluída — reaproveitando o mesmo progresso do quiz.
 */
export function registerStageResult(progress: GameProgress, result: StageResult): GameProgress {
  const stageScores = {
    ...progress.stageScores,
    [result.region]: Math.max(progress.stageScores[result.region] ?? 0, result.score),
  };
  const completedStages = result.victory
    ? Array.from(new Set([...progress.completedStages, result.region]))
    : progress.completedStages;
  const completedRegions = result.victory
    ? Array.from(new Set([...progress.completedRegions, result.region]))
    : progress.completedRegions;
  const badges = result.victory
    ? Array.from(new Set([...progress.badges, result.region]))
    : progress.badges;

  const nextProgress: GameProgress = {
    ...progress,
    completedRegions,
    badges,
    completedStages,
    stageScores,
    totalScore: sumScores(progress.bestScores, stageScores),
    lastRegion: result.region,
  };
  saveProgress(nextProgress);
  return nextProgress;
}

