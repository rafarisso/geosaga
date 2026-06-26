import { useState } from 'react';
import { CAPITAL_MISSIONS } from '../data/capitalChallenges';
import type { CapitalId, CapitalMissionResult, GameDifficulty, QuizResult, RegionId } from '../data/types';
import { gameEvents, EVENTS } from '../game/events';
import { useProgress } from '../hooks/useProgress';
import { GameStage } from '../components/game/GameStage';
import { CapitalChallengeScreen } from './CapitalChallengeScreen';
import { CapitalFinaleScreen } from './CapitalFinaleScreen';
import { MasteryCelebrationScreen } from './MasteryCelebrationScreen';
import { QuizPanel } from './QuizPanel';
import { RegionSelectScreen } from './RegionSelectScreen';
import { StartScreen } from './StartScreen';

type Screen = 'start' | 'regions' | 'stage' | 'mastery' | 'capitals' | 'capital-finale';

const ALL_REGIONS: RegionId[] = ['norte', 'nordeste', 'centro-oeste', 'sudeste', 'sul'];

const DIFFICULTY_KEY = 'geosaga:difficulty';
const CAPITAL_LINK_IDS: CapitalId[] = [
  'sao-paulo',
  'rio-de-janeiro',
  'belo-horizonte',
  'vitoria',
  'curitiba',
  'florianopolis',
  'porto-alegre',
  'brasilia',
  'goiania',
  'cuiaba',
  'campo-grande',
  'salvador',
  'recife',
  'fortaleza',
  'natal',
  'joao-pessoa',
  'maceio',
  'aracaju',
  'teresina',
  'sao-luis',
  'belem',
  'manaus',
  'boa-vista',
  'macapa',
  'porto-velho',
  'rio-branco',
  'palmas',
];

function normalizeCapitalLink(value: string | null): string | null {
  if (!value) return null;
  return value.split('http://')[0].split('https://')[0].trim();
}

function isCapitalLinkId(value: string | null): value is CapitalId {
  return !!value && CAPITAL_LINK_IDS.includes(value as CapitalId);
}

function readInitialNavigation(): { screen: Screen; capital: CapitalId | null } {
  if (typeof window === 'undefined') return { screen: 'start', capital: null };

  const params = new URLSearchParams(window.location.search);
  const capital = normalizeCapitalLink(params.get('capital'));
  if (params.get('screen') === 'capitals' || capital) {
    return { screen: 'capitals', capital: isCapitalLinkId(capital) ? capital : null };
  }

  return { screen: 'start', capital: null };
}

function loadDifficulty(): GameDifficulty {
  if (typeof localStorage === 'undefined') return 'normal';
  const saved = localStorage.getItem(DIFFICULTY_KEY);
  return saved === 'facil' || saved === 'dificil' ? saved : 'normal';
}

export default function App() {
  const [initialNavigation] = useState(readInitialNavigation);
  const [screen, setScreen] = useState<Screen>(initialNavigation.screen);
  const [quizRegion, setQuizRegion] = useState<RegionId | null>(null);
  const [stageRegion, setStageRegion] = useState<RegionId | null>(null);
  const [pendingMastery, setPendingMastery] = useState(false);
  const [difficulty, setDifficulty] = useState<GameDifficulty>(loadDifficulty);
  const { progress, completeQuiz, completeStage, completeCapitalMission } = useProgress();

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

  function exitStage() {
    setStageRegion(null);
    if (pendingMastery) {
      setPendingMastery(false);
      setScreen('mastery');
    } else {
      setScreen('regions');
    }
  }

  function handleCapitalMissionComplete(result: CapitalMissionResult) {
    const completedAfter = new Set(result.completed ? [...progress.completedCapitals, result.capital] : progress.completedCapitals);
    completeCapitalMission(result);

    if (result.completed && CAPITAL_MISSIONS.every((mission) => completedAfter.has(mission.id))) {
      setScreen('capital-finale');
    }
  }

  if (screen === 'stage' && stageRegion) {
    return (
      <div className="app-shell">
        <GameStage
          region={stageRegion}
          difficulty={difficulty}
          onExit={exitStage}
          onVictory={(score, stars) => {
            const completedAfter = new Set([...progress.completedStages, stageRegion]);
            setPendingMastery(!progress.masterOfBrazil && ALL_REGIONS.every((region) => completedAfter.has(region)));
            completeStage({ region: stageRegion, score, victory: true, stars });
          }}
        />
      </div>
    );
  }

  if (screen === 'mastery') {
    return (
      <div className="app-shell">
        <MasteryCelebrationScreen
          progress={progress}
          onStartCapitals={() => setScreen('capitals')}
          onBackToMap={() => setScreen('regions')}
        />
      </div>
    );
  }

  if (screen === 'capitals') {
    return (
      <div className="app-shell">
        <CapitalChallengeScreen
          progress={progress}
          initialCapitalId={initialNavigation.capital}
          onBack={() => setScreen('regions')}
          onCompleteMission={handleCapitalMissionComplete}
        />
      </div>
    );
  }


  if (screen === 'capital-finale') {
    return (
      <div className="app-shell">
        <CapitalFinaleScreen
          progress={progress}
          onBackToCapitals={() => setScreen('capitals')}
          onBackToStart={() => setScreen('start')}
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
          onCapitals={() => setScreen('capitals')}
          onContinue={() => setScreen('regions')}
        />
      ) : (
        <RegionSelectScreen
          progress={progress}
          onQuiz={(region) => setQuizRegion(region)}
          onPlayStage={handlePlayStage}
          onCapitals={() => setScreen('capitals')}
          onBack={() => setScreen('start')}
        />
      )}
      {quizRegion && <QuizPanel region={quizRegion} onClose={handleQuizClose} />}
    </div>
  );
}
