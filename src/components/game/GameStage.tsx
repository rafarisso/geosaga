import { useEffect, useMemo, useRef, useState } from 'react';
import { CHARACTERS } from '../../data/characters';
import { REGIONS } from '../../data/regions';
import { STAGES } from '../../data/stages';
import type { Question, RegionId } from '../../data/types';
import { fetchQuestions } from '../../services/questionService';
import { useGameLoop } from '../../hooks/useGameLoop';
import { useKeyboardControls } from '../../hooks/useKeyboardControls';
import { Enemy } from './Enemy';
import { HUD } from './HUD';
import { MobileControls } from './MobileControls';
import { Player } from './Player';
import { SpecialQuizModal } from './SpecialQuizModal';
import {
  ENEMY_SIZE,
  GOAL_X,
  GROUND_Y,
  MAX_ENERGY,
  PLAYER_H,
  PLAYER_W,
  STAGE_WIDTH,
  StageEngine,
  VIEW_H,
  VIEW_W,
  type View,
} from './stageEngine';

type Phase = 'intro' | 'playing' | 'quiz' | 'victory' | 'defeat';

interface GameStageProps {
  region: RegionId;
  onExit: () => void;
  /** Chamado uma vez quando a fase é vencida, para persistir o progresso. */
  onVictory: (score: number) => void;
}

export function GameStage({ region, onExit, onVictory }: GameStageProps) {
  const character = CHARACTERS[region];
  const stage = STAGES[region];
  const regionInfo = REGIONS[region];

  const [engine, setEngine] = useState(() => new StageEngine(region));

  const questionsRef = useRef<Question[]>([]);
  const [view, setView] = useState<View>(() => engine.view());
  const [phase, setPhase] = useState<Phase>('intro');
  const [special, setSpecial] = useState<Question | null>(null);
  const victorySavedRef = useRef(false);

  const { inputRef, setButton } = useKeyboardControls(phase === 'playing');

  // Carrega as perguntas da região para alimentar o golpe especial.
  useEffect(() => {
    let cancelled = false;
    fetchQuestions({ region, count: 5 })
      .then((items) => { if (!cancelled) questionsRef.current = items; })
      .catch(() => { questionsRef.current = []; });
    return () => { cancelled = true; };
  }, [region]);

  // Escala o palco lógico (960x540) para preencher o contêiner.
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;
    const update = () => {
      const { width, height } = node.getBoundingClientRect();
      setScale(Math.min(width / VIEW_W, height / VIEW_H));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Persiste a vitória uma única vez.
  useEffect(() => {
    if (phase === 'victory' && !victorySavedRef.current) {
      victorySavedRef.current = true;
      onVictory(engine.currentScore);
    }
  }, [phase, onVictory, engine]);

  function resolveSpecial(correct: boolean) {
    engine.applySpecial(correct);
    setView(engine.view());
    setSpecial(null);
    setPhase('playing');
  }

  function handleStep(dt: number) {
    const outcome = engine.step(dt, inputRef.current);
    if (outcome === 'requestSpecial') {
      const bank = questionsRef.current;
      if (bank.length > 0) {
        setSpecial(bank[Math.floor(Math.random() * bank.length)]);
        setView(engine.view());
        setPhase('quiz');
        return;
      }
    } else if (outcome === 'victory') {
      setView(engine.view());
      setPhase('victory');
      return;
    } else if (outcome === 'defeat') {
      setView(engine.view());
      setPhase('defeat');
      return;
    }
    setView(engine.view());
  }

  useGameLoop(handleStep, phase === 'playing');

  const specialReady = view.energy >= MAX_ENERGY;

  const worldStyle = useMemo(
    () => ({ width: VIEW_W, height: VIEW_H, transform: `scale(${scale})` }),
    [scale],
  );

  function restart() {
    const fresh = new StageEngine(region);
    setEngine(fresh);
    victorySavedRef.current = false;
    setView(fresh.view());
    setSpecial(null);
    setPhase('intro');
  }

  return (
    <div
      className="stage-root"
      style={{
        '--sky-top': stage.scenery.skyTop,
        '--sky-bottom': stage.scenery.skyBottom,
        '--ground': stage.scenery.ground,
        '--ground-accent': stage.scenery.groundAccent,
        '--hill': stage.scenery.hill,
        '--region-color': character.themeColor,
      } as React.CSSProperties}
    >
      <div className="stage-viewport" ref={viewportRef}>
        <div className="stage-world-scaler" style={worldStyle}>
          <div className="stage-world" style={{ transform: `translateX(${-view.camera}px)` }}>
            <div className="stage-hills" />
            <div className="stage-ground" style={{ width: STAGE_WIDTH }} />

            {view.goalActive && (
              <div className="stage-goal" style={{ left: GOAL_X, top: GROUND_Y - 180 }}>
                <span className="stage-goal-glow" />
                <span className="stage-goal-icon" aria-hidden>🌿</span>
                <span className="stage-goal-label">Objetivo</span>
              </div>
            )}

            {view.enemies.map((enemy) => (
              <Enemy
                key={enemy.key}
                problem={enemy.problem}
                x={enemy.x}
                feetY={enemy.feetY}
                size={ENEMY_SIZE}
                hp={enemy.hp}
                maxHp={enemy.maxHp}
                hitFlash={enemy.hitFlash}
              />
            ))}

            <Player
              region={region}
              state={view.pstate}
              facing={view.pfacing}
              x={view.px}
              feetY={view.pfeet}
              width={PLAYER_W}
              height={PLAYER_H}
              blinking={view.blinking}
            />
          </div>
        </div>
      </div>

      <HUD
        guardianName={character.name}
        stage={stage}
        themeColor={character.themeColor}
        hp={view.hp}
        maxHp={view.maxHp}
        energy={view.energy}
        maxEnergy={MAX_ENERGY}
        score={view.score}
        enemiesRemaining={view.enemiesRemaining}
        totalEnemies={engine.totalEnemies}
        specialReady={specialReady}
        goalActive={view.goalActive}
        onExit={onExit}
      />

      <MobileControls
        setButton={setButton}
        attackVerb={stage.attackVerb}
        specialVerb={stage.specialVerb}
        specialReady={specialReady}
      />

      {phase === 'intro' && (
        <div className="stage-overlay">
          <div className="stage-overlay-card">
            <span className="eyebrow">Fase {regionInfo.name}</span>
            <h2>{stage.title}</h2>
            <p className="stage-overlay-objective">🎯 {stage.objective}</p>
            <ul className="stage-controls-help">
              <li><strong>← →</strong> ou <strong>A / D</strong> mover</li>
              <li><strong>Espaço</strong> pular</li>
              <li><strong>J</strong> {stage.attackVerb}</li>
              <li><strong>K</strong> {stage.specialVerb} (responda a pergunta!)</li>
            </ul>
            <button className="btn-primary btn-large" onClick={() => setPhase('playing')}>
              Começar missão
            </button>
          </div>
        </div>
      )}

      {phase === 'quiz' && special && (
        <SpecialQuizModal
          region={region}
          guardianName={character.name}
          specialVerb={stage.specialVerb}
          question={special}
          onResolve={resolveSpecial}
        />
      )}

      {phase === 'victory' && (
        <div className="stage-overlay stage-overlay-victory">
          <div className="stage-overlay-card">
            <span className="eyebrow">Missão cumprida</span>
            <h2>Selo {regionInfo.name} conquistado! 🏅</h2>
            <p>{stage.victoryMessage}</p>
            <div className="stage-result-score">
              <strong>{view.score}</strong>
              <span>pontos</span>
            </div>
            <div className="stage-overlay-actions">
              <button className="btn-secondary" onClick={restart}>Jogar de novo</button>
              <button className="btn-primary btn-large" onClick={onExit}>Voltar ao mapa do Brasil</button>
            </div>
          </div>
        </div>
      )}

      {phase === 'defeat' && (
        <div className="stage-overlay stage-overlay-defeat">
          <div className="stage-overlay-card">
            <span className="eyebrow">Não foi dessa vez</span>
            <h2>{character.name} precisa recuperar as forças</h2>
            <p>Os problemas da região ainda resistem. Estude, recarregue o conhecimento e tente de novo!</p>
            <div className="stage-overlay-actions">
              <button className="btn-secondary" onClick={onExit}>Voltar ao mapa</button>
              <button className="btn-primary btn-large" onClick={restart}>Tentar de novo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
