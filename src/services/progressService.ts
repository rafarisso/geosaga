import type { GameProgress, QuizResult, RegionId } from '../data/types';

const STORAGE_KEY = 'geosaga-progress-v1';

export const EMPTY_PROGRESS: GameProgress = {
  completedRegions: [],
  badges: [],
  bestScores: {},
  totalScore: 0,
  lastRegion: null,
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
    const totalScore = Object.values(bestScores).reduce((sum, score) => sum + (score ?? 0), 0);

    return {
      completedRegions,
      badges,
      bestScores,
      totalScore,
      lastRegion: isRegionId(parsed.lastRegion) ? parsed.lastRegion : null,
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
    completedRegions,
    badges,
    bestScores,
    totalScore: Object.values(bestScores).reduce((sum, value) => sum + (value ?? 0), 0),
    lastRegion: result.region,
  };
  saveProgress(nextProgress);
  return nextProgress;
}

