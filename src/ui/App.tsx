import { useState } from 'react';
import type { QuizResult, RegionId } from '../data/types';
import { gameEvents, EVENTS } from '../game/events';
import { loadProgress, registerQuizResult } from '../services/progressService';
import { QuizPanel } from './QuizPanel';
import { RegionSelectScreen } from './RegionSelectScreen';
import { StartScreen } from './StartScreen';

type Screen = 'start' | 'regions';

export default function App() {
  const [screen, setScreen] = useState<Screen>('start');
  const [quizRegion, setQuizRegion] = useState<RegionId | null>(null);
  const [progress, setProgress] = useState(loadProgress);

  function handleQuizClose(result: QuizResult | null) {
    if (result) {
      setProgress((current) => registerQuizResult(current, result));
      gameEvents.emit(EVENTS.QUIZ_CLOSED, { region: result.region, passed: result.passed });
    }
    setQuizRegion(null);
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
          onSelect={(region) => setQuizRegion(region)}
          onBack={() => setScreen('start')}
        />
      )}
      {quizRegion && <QuizPanel region={quizRegion} onClose={handleQuizClose} />}
    </div>
  );
}
