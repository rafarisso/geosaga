import { useEffect, useMemo, useRef, useState } from 'react';
import { CHARACTERS } from '../../data/characters';
import { QUESTIONS } from '../../data/questions';
import { REGIONS } from '../../data/regions';
import { STAGES } from '../../data/stages';
import type { GameDifficulty, Question, RegionId } from '../../data/types';
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
import { RegionalScenery } from './RegionalScenery';
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

function shuffleQuestions(items: Question[]): Question[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
}

interface GameStageProps {
  region: RegionId;
  /** Nível de desafio escolhido pelo jogador. */
  difficulty?: GameDifficulty;
  onExit: () => void;
  /** Chamado uma vez quando a fase é vencida, para persistir o progresso. */
  onVictory: (score: number, stars: number) => void;
}

export function GameStage({ region, difficulty = 'normal', onExit, onVictory }: GameStageProps) {
  const character = CHARACTERS[region];
  const stage = STAGES[region];
  const regionInfo = REGIONS[region];

  const [engine, setEngine] = useState(() => new StageEngine(region, difficulty));

  const questionsRef = useRef<Question[]>([]);
  const questionDeckRef = useRef<Question[]>([]);
  const lastQuestionIdRef = useRef<string | null>(null);
  const renderElapsedRef = useRef(0);
  const [view, setView] = useState<View>(() => engine.view());
  const [phase, setPhase] = useState<Phase>('intro');
  const [special, setSpecial] = useState<Question | null>(null);
  const [stars, setStars] = useState(0);
  const [muted, setMutedState] = useState(isMuted());
  const victorySavedRef = useRef(false);

  // Estado anterior para disparar efeitos sonoros por diferença.
  const sfx = useRef({
    hp: engine.view().hp,
    enemies: engine.totalEnemies,
    proj: 0,
    boss: false,
    charging: false,
    enraged: false,
    pickups: 0,
  });

  const { isTouch, isPortrait } = useDeviceMode();
  const needsRotate = isTouch && isPortrait;
  const active = phase === 'playing' && !needsRotate;

  const { inputRef, setButton } = useKeyboardControls(active);

  useEffect(() => {
    let cancelled = false;
    const applyQuestionBank = (items: Question[]) => {
      const bank = items.length > 0 ? items : QUESTIONS[region];
      questionsRef.current = bank;
      const withoutImmediateRepeat = bank.filter((question) => question.id !== lastQuestionIdRef.current);
      questionDeckRef.current = shuffleQuestions(withoutImmediateRepeat.length > 0 ? withoutImmediateRepeat : bank);
    };
    applyQuestionBank(QUESTIONS[region]);
    fetchQuestions({ region, count: 8 })
      .then((items) => { if (!cancelled) applyQuestionBank(items); })
      .catch(() => { if (!cancelled) applyQuestionBank(QUESTIONS[region]); });
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
    const charging = v.boss?.charging ?? false;
    const enraged = v.boss?.enraged ?? false;
    if (playerProj > sfx.current.proj) playSound('attack');
    if (v.hp < sfx.current.hp) playSound('hurt');
    if (v.enemiesRemaining < sfx.current.enemies) playSound('defeatEnemy');
    if (v.bossActive && !sfx.current.boss) playSound('bossAppear');
    if (charging && !sfx.current.charging) playSound('bossCharge');
    if (enraged && !sfx.current.enraged) playSound('bossEnrage');
    if (v.pickupsCollected > sfx.current.pickups) playSound('pickup');
    sfx.current = {
      hp: v.hp,
      enemies: v.enemiesRemaining,
      proj: playerProj,
      boss: v.bossActive,
      charging,
      enraged,
      pickups: v.pickupsCollected,
    };
  }

  function resolveSpecial(correct: boolean, speedBonus = 0) {
    const hadBoss = engine.view().bossActive;
    engine.applySpecial(correct, speedBonus);
    playSound(hadBoss ? 'bossHit' : 'special');
    const v = engine.view();
    sfx.current.boss = v.bossActive;
    setView(v);
    setSpecial(null);
    setPhase('playing');
    navigator.vibrate?.(correct ? [30, 30, 55] : 35);
  }

  function drawQuestion(): Question {
    const source = questionsRef.current.length > 0 ? questionsRef.current : QUESTIONS[region];
    if (questionDeckRef.current.length === 0) {
      const withoutImmediateRepeat = source.filter((question) => question.id !== lastQuestionIdRef.current);
      questionDeckRef.current = shuffleQuestions(withoutImmediateRepeat.length > 0 ? withoutImmediateRepeat : source);
    }
    const question = questionDeckRef.current.pop() ?? source[0];
    lastQuestionIdRef.current = question.id;
    return question;
  }

  function handleStep(dt: number): boolean {
    const outcome = engine.step(dt, inputRef.current);
    if (outcome === 'requestSpecial') {
      const v = engine.view();
      setSpecial(drawQuestion());
      setView(v);
      setPhase('quiz');
      return false;
    } else if (outcome === 'victory') {
      const v = engine.view();
      setStars(engine.starsEarned());
      playSound('victory');
      setView(v);
      setPhase('victory');
      return false;
    } else if (outcome === 'defeat') {
      const v = engine.view();
      playSound('gameover');
      setView(v);
      setPhase('defeat');
      return false;
    }

    renderElapsedRef.current += dt;
    if (renderElapsedRef.current >= 1 / 30 || outcome === 'bossIncoming') {
      renderElapsedRef.current = 0;
      const v = engine.view();
      emitSfx(v);
      setView(v);
    }
    return true;
  }

  useGameLoop(handleStep, active);

  const specialReady = view.energy >= MAX_ENERGY;

  const worldStyle = useMemo(
    () => {
      const touchLift = isTouch && !needsRotate ? Math.min(128, Math.max(0, (1 - scale) * 390)) : 0;
      return { width: VIEW_W, height: VIEW_H, transform: `translateY(${-touchLift}px) scale(${scale})` };
    },
    [isTouch, needsRotate, scale],
  );

  function restart() {
    const fresh = new StageEngine(region, difficulty);
    setEngine(fresh);
    victorySavedRef.current = false;
    sfx.current = { hp: fresh.view().hp, enemies: fresh.totalEnemies, proj: 0, boss: false, charging: false, enraged: false, pickups: 0 };
    setView(fresh.view());
    setSpecial(null);
    setStars(0);
    renderElapsedRef.current = 0;
    setPhase('intro');
  }

  async function enterImmersiveMode() {
    if (!isTouch) return;
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.();
      const orientation = screen.orientation as ScreenOrientation & {
        lock?: (value: 'landscape') => Promise<void>;
      };
      await orientation.lock?.('landscape');
    } catch {
      // iOS e alguns navegadores não permitem bloquear a orientação.
    }
  }

  function startMission() {
    setPhase('playing');
    void enterImmersiveMode();
  }

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
  }

  return (
    <div
      className={`stage-root stage-region-${region} ${stage.scenery.backgroundImage ? 'stage-has-backdrop' : ''} ${isTouch ? 'stage-touch-device' : ''} ${view.slowmo ? 'stage-slowmo' : ''}`}
      style={{
        '--sky-top': stage.scenery.skyTop,
        '--sky-bottom': stage.scenery.skyBottom,
        '--ground': stage.scenery.ground,
        '--ground-accent': stage.scenery.groundAccent,
        '--hill': stage.scenery.hill,
        '--scenery-haze': stage.scenery.haze,
        '--stage-backdrop': stage.scenery.backgroundImage ? `url(${stage.scenery.backgroundImage})` : undefined,
        '--region-color': character.themeColor,
      } as React.CSSProperties}
    >
      <div className="stage-viewport" ref={viewportRef}>
        <div className="stage-world-scaler" style={worldStyle}>
          <RegionalScenery stage={stage} camera={view.camera} />
          <div className="stage-world" style={{ transform: `translate(${-view.camera + view.shakeX}px, ${view.shakeY}px)` }}>
            {stage.scenery.backgroundImage && <div className="stage-world-backdrop" style={{ width: STAGE_WIDTH }} />}
            <div className="stage-ground" style={{ width: STAGE_WIDTH }} />

            {view.hazards.map((hz) => (
              <div
                key={hz.id ?? hz.x}
                className={`stage-hazard stage-hazard-${hz.kind} ${hz.restored ? 'stage-hazard-restored' : ''}`}
                style={{ left: hz.x, top: GROUND_Y, width: hz.width }}
              >
                <span aria-hidden>{hz.restored ? '✓' : HAZARD_EMOJI[hz.kind]}</span>
                <small>{hz.restored ? hz.restoredLabel ?? 'Área recuperada' : hz.label}</small>
              </div>
            ))}

            {view.platforms.map((plat) => (
              <div
                key={`${plat.x}-${plat.y}`}
                className="stage-platform"
                style={{ left: plat.x, top: plat.y, width: plat.width }}
              >
                {plat.guide && <small className="stage-platform-guide">{plat.guide}</small>}
              </div>
            ))}

            {view.enemies.map((enemy) => (
              <Enemy
                key={enemy.key}
                problem={enemy.problem}
                behavior={enemy.behavior}
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

            {view.pickups.map((item) => (
              <span
                key={item.id}
                className={`stage-pickup stage-pickup-${item.kind}`}
                style={{ left: item.x, top: item.y }}
                role="img"
                aria-label={item.kind === 'heal' ? 'Item de vida' : 'Item de energia'}
              >
                {item.kind === 'heal' ? '❤️' : '💡'}
              </span>
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
            {isTouch ? (
              <>Toque em <strong>{stage.attackVerb}</strong> para atingir os problemas à distância.</>
            ) : (
              <><strong>J</strong> lança sua onda para restaurar os problemas à distância!</>
            )}
          </div>
        )}

        {view.bossBanner && (
          <div className="stage-boss-banner" role="status">
            <strong>⚠ {stage.boss.name}</strong>
            <span>{view.bossBanner}</span>
          </div>
        )}

        {phase === 'playing' && view.combo >= 2 && (
          <div className="stage-combo" role="status" aria-live="off">
            <strong>{view.combo} em sequência</strong>
            <span>Pontos x{view.comboMultiplier}</span>
          </div>
        )}

        {view.slowmo && <div className="stage-slowmo-vignette" aria-hidden />}
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
            <div className="stage-overlay-actions">
              <button className="btn-primary" onClick={() => void enterImmersiveMode()}>Usar tela cheia</button>
              <button className="btn-secondary" onClick={onExit}>Voltar ao mapa</button>
            </div>
          </div>
        </div>
      )}

      {phase === 'intro' && (
        <div className="stage-overlay">
          <div className="stage-overlay-card">
            <span className="eyebrow">Fase {regionInfo.name}</span>
            <h2>{stage.title}</h2>
            <p className="stage-overlay-objective">🎯 {stage.objective}</p>
            <div className="stage-mechanic-card">
              <strong>{stage.mechanic.label}</strong>
              <span>{stage.mechanic.hint}</span>
            </div>
            <ul className="stage-controls-help">
              {isTouch ? (
                <>
                  <li>Use os direcionais à esquerda para se mover.</li>
                  <li>Os botões à direita controlam pulo, ataque e golpe especial.</li>
                  <li>O golpe especial acende quando o conhecimento chega a 100%.</li>
                </>
              ) : (
                <>
                  <li><strong>← →</strong> ou <strong>A / D</strong> mover · <strong>Espaço</strong> pular</li>
                  <li><strong>J</strong> lançar onda de {stage.attackVerb.toLowerCase()} (à distância)</li>
                  <li><strong>K</strong> {stage.specialVerb} — responda à pergunta para o golpe forte</li>
                </>
              )}
            </ul>
            <p className="stage-overlay-tip">
              💡 Restaure os problemas, desvie dos ataques (pule!) e enfrente o chefe <strong>{stage.boss.name}</strong>.
              Ele só é vencido com o golpe especial — ou seja, acertando o quiz!
            </p>
            <button className="btn-primary btn-large" onClick={startMission}>
              Começar missão
            </button>
          </div>
        </div>
      )}

      {phase === 'quiz' && special && (
        <SpecialQuizModal
          key={special.id}
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
