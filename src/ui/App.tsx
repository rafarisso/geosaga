import { useState } from 'react';
import type { GameDifficulty, QuizResult, RegionId } from '../data/types';
import { gameEvents, EVENTS } from '../game/events';
import { useProgress } from '../hooks/useProgress';
import { GameStage } from '../components/game/GameStage';
import { QuizPanel } from './QuizPanel';
import { RegionSelectScreen } from './RegionSelectScreen';
import { StartScreen } from './StartScreen';

type Screen = 'start' | 'regions' | 'stage';

const DIFFICULTY_KEY = 'geosaga:difficulty';

function loadDifficulty(): GameDifficulty {
  if (typeof localStorage === 'undefined') return 'normal';
  const saved = localStorage.getItem(DIFFICULTY_KEY);
  return saved === 'facil' || saved === 'dificil' ? saved : 'normal';
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('start');
  const [quizRegion, setQuizRegion] = useState<RegionId | null>(null);
  const [stageRegion, setStageRegion] = useState<RegionId | null>(null);
  const [difficulty, setDifficulty] = useState<GameDifficulty>(loadDifficulty);
  const { progress, completeQuiz, completeStage } = useProgress();

  function chooseDifficulty(next: GameDifficulty) {
    setDifficulty(next);
    if (typeof localStorage !== 'undefined') localStorage.setItem(DIFFICULTY_KEY, next);
  }

  function handleQuizClose(result: QuizResult | null) {
    if (result) {
      completeQuiz(result);
      gameEvents.emit(EVENTS.QUIZ_CLOSED, { region: result.region, passed: result.passed });
    }
    setQuizRegion(null);
  }

  function handlePlayStage(region: RegionId) {
    setStageRegion(region);
    setScreen('stage');
  }

  if (screen === 'stage' && stageRegion) {
    return (
      <div className="app-shell">
        <GameStage
          region={stageRegion}
          difficulty={difficulty}
          onExit={() => { setStageRegion(null); setScreen('regions'); }}
          onVictory={(score, stars) => completeStage({ region: stageRegion, score, victory: true, stars })}
        />
      </div>
    );
  }

  return (
    <div className="app-shell">
      {screen === 'start' ? (
        <StartScreen
          progress={progress}
          difficulty={difficulty}
          onSelectDifficulty={chooseDifficulty}
          onPlay={() => setScreen('regions')}
          onContinue={() => setScreen('regions')}
        />
      ) : (
        <RegionSelectScreen
          progress={progress}
          onQuiz={(region) => setQuizRegion(region)}
          onPlayStage={handlePlayStage}
          onBack={() => setScreen('start')}
        />
      )}
      {quizRegion && <QuizPanel region={quizRegion} onClose={handleQuizClose} />}
    </div>
  );
}
