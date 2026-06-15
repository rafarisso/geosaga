import { useState } from 'react';
import type { QuizResult, RegionId } from '../data/types';
import { gameEvents, EVENTS } from '../game/events';
import { useProgress } from '../hooks/useProgress';
import { GameStage } from '../components/game/GameStage';
import { QuizPanel } from './QuizPanel';
import { RegionSelectScreen } from './RegionSelectScreen';
import { StartScreen } from './StartScreen';

type Screen = 'start' | 'regions' | 'stage';

export default function App() {
  const [screen, setScreen] = useState<Screen>('start');
  const [quizRegion, setQuizRegion] = useState<RegionId | null>(null);
  const [stageRegion, setStageRegion] = useState<RegionId | null>(null);
  const { progress, completeQuiz, completeStage } = useProgress();

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
          onExit={() => { setStageRegion(null); setScreen('regions'); }}
          onVictory={(score) => completeStage({ region: stageRegion, score, victory: true })}
        />
      </div>
    );
  }

  return (
    <div className="app-shell">
      {screen === 'start' ? (
        <StartScreen
          progress={progress}
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
