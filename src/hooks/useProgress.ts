import { useCallback, useState } from 'react';
import type { GameProgress, QuizResult, StageResult } from '../data/types';
import {
  loadProgress,
  registerQuizResult,
  registerStageResult,
} from '../services/progressService';

/**
 * Centraliza o progresso do jogador (localStorage) e expõe ações para
 * registrar resultados de quiz e de fases jogáveis, mantendo a mesma fonte
 * de verdade para todas as telas.
 */
export function useProgress() {
  const [progress, setProgress] = useState<GameProgress>(loadProgress);

  const completeQuiz = useCallback((result: QuizResult) => {
    setProgress((current) => registerQuizResult(current, result));
  }, []);

  const completeStage = useCallback((result: StageResult) => {
    setProgress((current) => registerStageResult(current, result));
  }, []);

  return { progress, completeQuiz, completeStage };
}
