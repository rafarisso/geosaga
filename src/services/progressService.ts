import { CAPITAL_MISSIONS } from '../data/capitalChallenges';
import type { CapitalId, CapitalMissionResult, CapitalRouteId, GameProgress, QuizResult, RegionId, StageResult } from '../data/types';

const STORAGE_KEY = 'geosaga-progress-v1';

export const EMPTY_PROGRESS: GameProgress = {
  completedRegions: [],
  badges: [],
  bestScores: {},
  totalScore: 0,
  lastRegion: null,
  completedStages: [],
  stageScores: {},
  stageStars: {},
  masterOfBrazil: false,
  completedCapitals: [],
  capitalScores: {},
  capitalStars: {},
  completedCapitalRoutes: [],
};

const ALL_REGIONS: RegionId[] = ['norte', 'nordeste', 'centro-oeste', 'sudeste', 'sul'];
const ALL_CAPITALS: CapitalId[] = ['sao-paulo', 'rio-de-janeiro', 'belo-horizonte', 'vitoria', 'curitiba', 'florianopolis', 'porto-alegre', 'brasilia', 'goiania', 'cuiaba', 'campo-grande', 'salvador', 'recife', 'fortaleza', 'natal', 'joao-pessoa', 'maceio', 'aracaju', 'teresina', 'sao-luis', 'belem', 'manaus', 'boa-vista', 'macapa', 'porto-velho', 'rio-branco', 'palmas'];
const ALL_CAPITAL_ROUTES: CapitalRouteId[] = ['sudeste', 'sul', 'centro-oeste', 'nordeste', 'norte'];

function isRegionId(value: unknown): value is RegionId {
  return ['norte', 'nordeste', 'centro-oeste', 'sudeste', 'sul'].includes(String(value));
}

function isCapitalId(value: unknown): value is CapitalId {
  return ALL_CAPITALS.includes(String(value) as CapitalId);
}

function isCapitalRouteId(value: unknown): value is CapitalRouteId {
  return ALL_CAPITAL_ROUTES.includes(String(value) as CapitalRouteId);
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
    const stageStars = parsed.stageStars ?? {};
    const completedCapitals = (parsed.completedCapitals ?? []).filter(isCapitalId);
    const capitalScores = parsed.capitalScores ?? {};
    const capitalStars = parsed.capitalStars ?? {};
    const completedCapitalRoutes = (parsed.completedCapitalRoutes ?? []).filter(isCapitalRouteId);
    const totalScore =
      Object.values(bestScores).reduce((sum, score) => sum + (score ?? 0), 0) +
      Object.values(stageScores).reduce((sum, score) => sum + (score ?? 0), 0) +
      Object.values(capitalScores).reduce((sum, score) => sum + (score ?? 0), 0);

    return {
      completedRegions,
      badges,
      bestScores,
      totalScore,
      lastRegion: isRegionId(parsed.lastRegion) ? parsed.lastRegion : null,
      completedStages,
      stageScores,
      stageStars,
      masterOfBrazil: parsed.masterOfBrazil === true,
      completedCapitals,
      capitalScores,
      capitalStars,
      completedCapitalRoutes,
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
    totalScore: sumScores(bestScores, progress.stageScores, progress.capitalScores),
    lastRegion: result.region,
  };
  saveProgress(nextProgress);
  return nextProgress;
}

function sumScores(...maps: Partial<Record<string, number>>[]): number {
  let total = 0;
  for (const map of maps) {
    for (const value of Object.values(map)) {
      total += value ?? 0;
    }
  }
  return total;
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
  const stageStars = {
    ...progress.stageStars,
    [result.region]: Math.max(progress.stageStars[result.region] ?? 0, result.stars),
  };
  const masterOfBrazil =
    progress.masterOfBrazil || ALL_REGIONS.every((id) => completedStages.includes(id));

  const nextProgress: GameProgress = {
    ...progress,
    completedRegions,
    badges,
    completedStages,
    stageScores,
    stageStars,
    masterOfBrazil,
    totalScore: sumScores(progress.bestScores, stageScores, progress.capitalScores),
    lastRegion: result.region,
  };
  saveProgress(nextProgress);
  return nextProgress;
}

export function registerCapitalMissionResult(progress: GameProgress, result: CapitalMissionResult): GameProgress {
  const capitalScores = {
    ...progress.capitalScores,
    [result.capital]: Math.max(progress.capitalScores[result.capital] ?? 0, result.score),
  };
  const capitalStars = {
    ...progress.capitalStars,
    [result.capital]: Math.max(progress.capitalStars[result.capital] ?? 0, result.stars),
  };
  const completedCapitals = result.completed
    ? Array.from(new Set([...progress.completedCapitals, result.capital]))
    : progress.completedCapitals;
  const routeMissionIds = CAPITAL_MISSIONS
    .filter((mission) => mission.route === result.route)
    .map((mission) => mission.id);
  const routeComplete = routeMissionIds.every((id) => completedCapitals.includes(id));
  const completedCapitalRoutes = routeComplete
    ? Array.from(new Set([...progress.completedCapitalRoutes, result.route]))
    : progress.completedCapitalRoutes;

  const nextProgress: GameProgress = {
    ...progress,
    completedCapitals,
    capitalScores,
    capitalStars,
    completedCapitalRoutes,
    totalScore: sumScores(progress.bestScores, progress.stageScores, capitalScores),
  };
  saveProgress(nextProgress);
  return nextProgress;
}

