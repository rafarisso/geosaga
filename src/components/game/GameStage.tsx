import { useEffect, useMemo, useRef, useState } from 'react';
import { CHARACTERS } from '../../data/characters';
import { REGIONS } from '../../data/regions';
import { STAGES } from '../../data/stages';
import type { Question, RegionId } from '../../data/types';
import { fetchQuestions } from '../../services/questionService';
import { isMuted, playSound, setMuted } from '../../game/soundEngine';
import { useDeviceMode } from '../../hooks/useDeviceMode';
import { useGameLoop } from '../../hooks/useGameLoop';
import { useKeyboardControls } from '../../hooks/useKeyboardControls';
import { Boss } from './Boss';
import { Enemy } from './Enemy';
import { HUD } from './HUD';
import { MobileControls } from './MobileControls';
import { Player } from './Player';
import { SpecialQuizModal } from './SpecialQuizModal';
import {
  ENEMY_SIZE,
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

const HAZARD_EMOJI: Record<string, string> = { fogo: '🔥', agua: '🌊', gelo: '❄️', fumaca: '💨' };

interface GameStageProps {
  region: RegionId;
  onExit: () => void;
  /** Chamado uma vez quando a fase é vencida, para persistir o progresso. */
  onVictory: (score: number, stars: number) => void;
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
  const [stars, setStars] = useState(0);
  const [muted, setMutedState] = useState(isMuted());
  const victorySavedRef = useRef(false);

  // Estado anterior para disparar efeitos sonoros por diferença.
  const sfx = useRef({ hp: engine.view().hp, enemies: engine.totalEnemies, proj: 0, boss: false });

  const { isTouch, isPortrait } = useDeviceMode();
  const needsRotate = isTouch && isPortrait;
  const active = phase === 'playing' && !needsRotate;

  const { inputRef, setButton } = useKeyboardControls(active);

  useEffect(() => {
    let cancelled = false;
    fetchQuestions({ region, count: 5 })
      .then((items) => { if (!cancelled) questionsRef.current = items; })
      .catch(() => { questionsRef.current = []; });
    return () => { cancelled = true; };
  }, [region]);

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

  useEffect(() => {
    if (phase === 'victory' && !victorySavedRef.current) {
      victorySavedRef.current = true;
      onVictory(engine.currentScore, engine.starsEarned());
    }
  }, [phase, onVictory, engine]);

  function emitSfx(v: View) {
    const playerProj = v.projectiles.filter((p) => p.team === 'player').length;
    if (playerProj > sfx.current.proj) playSound('attack');
    if (v.hp < sfx.current.hp) playSound('hurt');
    if (v.enemiesRemaining < sfx.current.enemies) playSound('defeatEnemy');
    if (v.bossActive && !sfx.current.boss) playSound('bossAppear');
    sfx.current = { hp: v.hp, enemies: v.enemiesRemaining, proj: playerProj, boss: v.bossActive };
  }

  function resolveSpecial(correct: boolean) {
    const hadBoss = engine.view().bossActive;
    engine.applySpecial(correct);
    playSound(hadBoss ? 'bossHit' : 'special');
    const v = engine.view();
    sfx.current.boss = v.bossActive;
    setView(v);
    setSpecial(null);
    setPhase('playing');
  }

  function handleStep(dt: number) {
    const outcome = engine.step(dt, inputRef.current);
    const v = engine.view();
    emitSfx(v);
    if (outcome === 'requestSpecial') {
      const bank = questionsRef.current;
      if (bank.length > 0) {
        setSpecial(bank[Math.floor(Math.random() * bank.length)]);
        setView(v);
        setPhase('quiz');
        return;
      }
    } else if (outcome === 'victory') {
      setStars(engine.starsEarned());
      playSound('victory');
      setView(v);
      setPhase('victory');
      return;
    } else if (outcome === 'defeat') {
      playSound('gameover');
      setView(v);
      setPhase('defeat');
      return;
    }
    setView(v);
  }

  useGameLoop(handleStep, active);

  const specialReady = view.energy >= MAX_ENERGY;

  const worldStyle = useMemo(
    () => ({ width: VIEW_W, height: VIEW_H, transform: `scale(${scale})` }),
    [scale],
  );

  function restart() {
    const fresh = new StageEngine(region);
    setEngine(fresh);
    victorySavedRef.current = false;
    sfx.current = { hp: fresh.view().hp, enemies: fresh.totalEnemies, proj: 0, boss: false };
    setView(fresh.view());
    setSpecial(null);
    setStars(0);
    setPhase('intro');
  }

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
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
          <div className="stage-world" style={{ transform: `translate(${-view.camera + view.shakeX}px, ${view.shakeY}px)` }}>
            <div className="stage-hills" />
            <div className="stage-ground" style={{ width: STAGE_WIDTH }} />

            {view.hazards.map((hz) => (
              <div
                key={hz.x}
                className={`stage-hazard stage-hazard-${hz.kind}`}
                style={{ left: hz.x, top: GROUND_Y, width: hz.width }}
              >
                <span aria-hidden>{HAZARD_EMOJI[hz.kind]}</span>
                <small>{hz.label}</small>
              </div>
            ))}

            {view.platforms.map((plat) => (
              <div
                key={`${plat.x}-${plat.y}`}
                className="stage-platform"
                style={{ left: plat.x, top: plat.y, width: plat.width }}
              />
            ))}

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
                shake={enemy.shake}
              />
            ))}

            {view.boss && <Boss boss={view.boss} />}

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

            {view.projectiles.map((p) => (
              <span
                key={p.id}
                className={`stage-projectile stage-projectile-${p.team}`}
                style={{
                  left: p.x - p.r,
                  top: p.y - p.r,
                  width: p.r * 2,
                  height: p.r * 2,
                  '--proj-color': p.color,
                } as React.CSSProperties}
              />
            ))}

            {view.particles.map((part) => (
              <span
                key={part.id}
                className={`stage-particle stage-particle-${part.kind}`}
                style={{
                  left: part.x,
                  top: part.y,
                  opacity: part.alpha,
                  transform: `translate(-50%, -50%) scale(${part.scale})`,
                  color: part.color,
                  '--spark-color': part.color,
                } as React.CSSProperties}
              >
                {part.text}
              </span>
            ))}
          </div>
        </div>

        {phase === 'playing' && !view.hasFired && (
          <div className="stage-hint" role="status">
            <strong>J</strong> ou <strong>✦</strong> lança sua onda para restaurar os problemas à distância!
          </div>
        )}

        {view.bossBanner && (
          <div className="stage-boss-banner" role="status">
            <strong>⚠ {stage.boss.name}</strong>
            <span>{view.bossBanner}</span>
          </div>
        )}
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
        boss={view.boss}
        muted={muted}
        onToggleMute={toggleMute}
        onExit={onExit}
      />

      {isTouch && !needsRotate && (
        <MobileControls
          setButton={setButton}
          attackVerb={stage.attackVerb}
          specialVerb={stage.specialVerb}
          specialReady={specialReady}
        />
      )}

      {needsRotate && (
        <div className="stage-rotate" role="alertdialog" aria-label="Gire o celular">
          <div className="stage-rotate-card">
            <span className="stage-rotate-icon" aria-hidden>📱↻</span>
            <h2>Gire o celular</h2>
            <p>A fase de aventura é jogada na horizontal. Vire o aparelho para o modo paisagem para começar.</p>
            <button className="btn-secondary" onClick={onExit}>Voltar ao mapa</button>
          </div>
        </div>
      )}

      {phase === 'intro' && (
        <div className="stage-overlay">
          <div className="stage-overlay-card">
            <span className="eyebrow">Fase {regionInfo.name}</span>
            <h2>{stage.title}</h2>
            <p className="stage-overlay-objective">🎯 {stage.objective}</p>
            <ul className="stage-controls-help">
              <li><strong>← →</strong> ou <strong>A / D</strong> mover · <strong>Espaço</strong> pular</li>
              <li><strong>J</strong> lançar onda de {stage.attackVerb.toLowerCase()} (à distância)</li>
              <li><strong>K</strong> {stage.specialVerb} — responda à pergunta para o golpe forte</li>
            </ul>
            <p className="stage-overlay-tip">
              💡 Restaure os problemas, desvie dos ataques (pule!) e enfrente o chefe <strong>{stage.boss.name}</strong>.
              Ele só é vencido com o golpe especial — ou seja, acertando o quiz!
            </p>
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
            <div className="stage-stars" aria-label={`${stars} de 3 estrelas`}>
              {[1, 2, 3].map((n) => (
                <span key={n} className={n <= stars ? 'star on' : 'star'}>★</span>
              ))}
            </div>
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
