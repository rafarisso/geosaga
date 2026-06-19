import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import colossoCurralBoss from '../../assets/bosses/capital-belo-horizonte-boss-colosso-curral.png';
import caosMetropoleBoss from '../../assets/bosses/capital-sao-paulo-boss-caos-metropole.png';
import neblinaAraucariasBoss from '../../assets/bosses/capital-curitiba-boss-neblina-araucarias.png';
import tormentaIlhaBoss from '../../assets/bosses/capital-florianopolis-boss-tormenta-ilha.png';
import sombraBaiaBoss from '../../assets/bosses/capital-rio-boss-sombra-baia.png';
import sentinelaManguezalBoss from '../../assets/bosses/capital-vitoria-boss-sentinela-manguezal.png';
import beloHorizonteStageBg from '../../assets/backgrounds/capital-belo-horizonte-stage-bg.png';
import curitibaStageBg from '../../assets/backgrounds/capital-curitiba-stage-bg.png';
import florianopolisStageBg from '../../assets/backgrounds/capital-florianopolis-stage-bg.png';
import rioStageBg from '../../assets/backgrounds/capital-rio-de-janeiro-stage-bg.png';
import saoPauloStageBg from '../../assets/backgrounds/capital-sao-paulo-stage-bg.png';
import vitoriaStageBg from '../../assets/backgrounds/capital-vitoria-stage-bg.png';
import { CHARACTERS } from '../../data/characters';
import type { CapitalMission } from '../../data/capitalChallenges';
import { CAPITAL_SPECIAL_QUESTIONS, type CapitalSpecialQuestion } from '../../data/capitalQuestions';
import type { CapitalId, CapitalMissionResult, RegionId } from '../../data/types';
import { isMuted, playSound, setMuted } from '../../game/soundEngine';
import { useDeviceMode } from '../../hooks/useDeviceMode';
import { useGameLoop } from '../../hooks/useGameLoop';
import { useKeyboardControls } from '../../hooks/useKeyboardControls';
import { shuffleQuestionChoices, type AnswerIndex } from '../../utils/questionChoices';
import { MobileControls } from './MobileControls';
import { Player } from './Player';
import {
  CAPITAL_BOSS_H,
  CAPITAL_BOSS_W,
  CAPITAL_ENEMY_SIZE,
  CAPITAL_GUARDIAN_BOOSTS,
  CAPITAL_MAX_ENERGY,
  CAPITAL_PLAYER_H,
  CAPITAL_PLAYER_W,
  CAPITAL_STAGE_W,
  CAPITAL_VIEW_H,
  CAPITAL_VIEW_W,
  CapitalStageEngine,
  getCapitalStageDefinition,
  type CapitalStageView,
} from './capitalStageEngine';

type Phase = 'intro' | 'playing' | 'quiz' | 'victory' | 'defeat';

const GUARDIAN_ORDER: RegionId[] = ['sudeste', 'norte', 'centro-oeste', 'nordeste', 'sul'];

const CAPITAL_STAGE_BACKGROUNDS: Partial<Record<CapitalId, string>> = {
  'sao-paulo': saoPauloStageBg,
  'rio-de-janeiro': rioStageBg,
  'belo-horizonte': beloHorizonteStageBg,
  vitoria: vitoriaStageBg,
  curitiba: curitibaStageBg,
  florianopolis: florianopolisStageBg,
};

const CAPITAL_STAGE_BOSS_IMAGES: Partial<Record<CapitalId, string>> = {
  'sao-paulo': caosMetropoleBoss,
  'rio-de-janeiro': sombraBaiaBoss,
  'belo-horizonte': colossoCurralBoss,
  vitoria: sentinelaManguezalBoss,
  curitiba: neblinaAraucariasBoss,
  florianopolis: tormentaIlhaBoss,
};

interface CapitalPlayableStageProps {
  mission: CapitalMission;
  completed: boolean;
  onComplete: (result: CapitalMissionResult) => void;
}

function shuffleQuestions(items: CapitalSpecialQuestion[]): CapitalSpecialQuestion[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    const current = copy[index]!;
    copy[index] = copy[target]!;
    copy[target] = current;
  }
  return copy;
}

export function CapitalPlayableStage({ mission, completed, onComplete }: CapitalPlayableStageProps) {
  const [guardian, setGuardian] = useState<RegionId>('sudeste');
  const [engine, setEngine] = useState(() => new CapitalStageEngine('sudeste', mission.id));
  const [view, setView] = useState<CapitalStageView>(() => engine.view());
  const [phase, setPhase] = useState<Phase>('intro');
  const [specialQuestion, setSpecialQuestion] = useState<CapitalSpecialQuestion | null>(null);
  const [stars, setStars] = useState(0);
  const [muted, setMutedState] = useState(isMuted());
  const renderElapsedRef = useRef(0);
  const victorySavedRef = useRef(false);
  const sfxRef = useRef({ hp: view.hp, enemies: view.enemies.length, objectives: view.objectiveCount, boss: false });
  const questionDeckRef = useRef<CapitalSpecialQuestion[]>([]);
  const lastQuestionIdRef = useRef<string | null>(null);
  const lastAnswerIndexRef = useRef<AnswerIndex | null>(null);

  const { isTouch, isPortrait } = useDeviceMode();
  const needsRotate = isTouch && isPortrait;
  const active = phase === 'playing' && !needsRotate;
  const { inputRef, setButton } = useKeyboardControls(active);

  const viewportRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const stageDefinition = getCapitalStageDefinition(mission.id);
  const backgroundImage = CAPITAL_STAGE_BACKGROUNDS[mission.id] ?? saoPauloStageBg;
  const bossImage = CAPITAL_STAGE_BOSS_IMAGES[mission.id] ?? caosMetropoleBoss;

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;
    const update = () => {
      const { width, height } = node.getBoundingClientRect();
      setScale(Math.min(width / CAPITAL_VIEW_W, height / CAPITAL_VIEW_H));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const worldStyle = useMemo(
    () => {
      const touchLift = isTouch && !needsRotate ? Math.min(128, Math.max(0, (1 - scale) * 390)) : 0;
      return { width: CAPITAL_VIEW_W, height: CAPITAL_VIEW_H, transform: `translateY(${-touchLift}px) scale(${scale})` };
    },
    [isTouch, needsRotate, scale],
  );

  function reset(nextGuardian = guardian) {
    const fresh = new CapitalStageEngine(nextGuardian, mission.id);
    setGuardian(nextGuardian);
    setEngine(fresh);
    setView(fresh.view());
    setPhase('intro');
    setSpecialQuestion(null);
    setStars(0);
    victorySavedRef.current = false;
    sfxRef.current = { hp: fresh.view().hp, enemies: fresh.view().enemies.length, objectives: 0, boss: false };
    renderElapsedRef.current = 0;
    lastAnswerIndexRef.current = null;
  }

  function chooseGuardian(next: RegionId) {
    reset(next);
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
      // Nem todo navegador permite tela cheia/orientacao travada.
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

  function exitStage() {
    reset();
  }

  function emitSfx(next: CapitalStageView) {
    if (next.hp < sfxRef.current.hp) playSound('hurt');
    if (next.enemies.length < sfxRef.current.enemies) playSound('defeatEnemy');
    if (next.objectiveCount > sfxRef.current.objectives) playSound('pickup');
    if (next.boss && !sfxRef.current.boss) playSound('bossAppear');
    sfxRef.current = {
      hp: next.hp,
      enemies: next.enemies.length,
      objectives: next.objectiveCount,
      boss: Boolean(next.boss),
    };
  }

  function drawSpecialQuestion(): CapitalSpecialQuestion {
    const bank = CAPITAL_SPECIAL_QUESTIONS[mission.id].length > 0
      ? CAPITAL_SPECIAL_QUESTIONS[mission.id]
      : CAPITAL_SPECIAL_QUESTIONS['sao-paulo'];
    if (questionDeckRef.current.length === 0) {
      const withoutImmediateRepeat = bank.filter((item) => item.id !== lastQuestionIdRef.current);
      questionDeckRef.current = shuffleQuestions(withoutImmediateRepeat.length > 0 ? withoutImmediateRepeat : bank);
    }
    const next = questionDeckRef.current.pop() ?? bank[0]!;
    lastQuestionIdRef.current = next.id;
    const shuffled = shuffleQuestionChoices(next, lastAnswerIndexRef.current);
    lastAnswerIndexRef.current = shuffled.answerIndex;
    return shuffled;
  }

  function handleStep(dt: number): boolean {
    const outcome = engine.step(dt, inputRef.current);
    if (outcome === 'requestSpecial') {
      setSpecialQuestion(drawSpecialQuestion());
      setView(engine.view());
      setPhase('quiz');
      return false;
    }
    if (outcome === 'victory') {
      const nextStars = engine.starsEarned();
      setStars(nextStars);
      setView(engine.view());
      playSound('victory');
      setPhase('victory');
      return false;
    }
    if (outcome === 'defeat') {
      setView(engine.view());
      playSound('gameover');
      setPhase('defeat');
      return false;
    }
    renderElapsedRef.current += dt;
    if (renderElapsedRef.current >= 1 / 30) {
      renderElapsedRef.current = 0;
      const next = engine.view();
      emitSfx(next);
      setView(next);
    }
    return true;
  }

  useGameLoop(handleStep, active);

  useEffect(() => {
    if (phase !== 'victory' || victorySavedRef.current) return;
    victorySavedRef.current = true;
    onComplete({
      capital: mission.id,
      route: mission.route,
      score: engine.currentScore,
      stars,
      completed: true,
    });
  }, [engine, mission.id, mission.route, onComplete, phase, stars]);

  function answer(index: number) {
    if (!specialQuestion) return;
    const correct = index === specialQuestion.answerIndex;
    engine.applySpecial(correct);
    playSound(correct ? 'special' : 'hurt');
    setView(engine.view());
    setSpecialQuestion(null);
    setPhase('playing');
  }

  const character = CHARACTERS[guardian];
  const energyRatio = Math.max(0, Math.min(1, view.energy / CAPITAL_MAX_ENERGY));
  const hpRatio = Math.max(0, view.hp / view.maxHp);
  const bossRatio = view.boss ? Math.max(0, view.boss.hp / view.boss.maxHp) : 0;

  return (
    <section
      className="capital-play-root"
      style={{
        '--capital-stage-bg': `url(${backgroundImage})`,
        '--region-color': character.themeColor,
      } as CSSProperties}
    >
      <div className="capital-play-viewport" ref={viewportRef}>
        <div className="capital-play-scaler" style={worldStyle}>
          <div className="capital-play-world" style={{ transform: `translateX(${-view.camera}px)` }}>
            <div className="capital-play-backdrop" style={{ width: CAPITAL_STAGE_W }} />
            <div className="capital-play-atmosphere" style={{ width: CAPITAL_STAGE_W }} />
            <div className="capital-play-ground" style={{ width: CAPITAL_STAGE_W }} />
            <div className="capital-play-finish" style={{ left: CAPITAL_STAGE_W - 250 }}>
              <strong>Marco final</strong>
              <span>{stageDefinition.finishLabel}</span>
            </div>

            {view.objectives.map((objective) => (
              <div
                className={`capital-objective ${objective.collected ? 'collected' : ''}`}
                key={objective.id}
                style={{ left: objective.x, top: objective.y }}
              >
                <span>{objective.collected ? '✓' : '◆'}</span>
                <strong>{objective.label}</strong>
                <small>{objective.concept}</small>
              </div>
            ))}

            {view.enemies.map((enemy) => {
              const ratio = Math.max(0, enemy.hp / enemy.maxHp);
              const offset = enemy.shake > 0 ? Math.sin(enemy.shake * 70) * 5 : 0;
              return (
                <div
                  className={`capital-enemy capital-enemy-${enemy.kind} ${enemy.slowed ? 'slowed' : ''}`}
                  key={enemy.id}
                  style={{
                    left: enemy.x,
                    top: enemy.feetY - CAPITAL_ENEMY_SIZE,
                    width: CAPITAL_ENEMY_SIZE,
                    height: CAPITAL_ENEMY_SIZE,
                    transform: `translateX(${offset}px)`,
                    filter: enemy.hitFlash > 0 ? 'brightness(2.1) saturate(0.5)' : undefined,
                  }}
                  role="img"
                  aria-label={enemy.name}
                >
                  <span className="capital-enemy-core" />
                  <span className="capital-enemy-face" />
                  <div className="capital-enemy-health"><span style={{ width: `${ratio * 100}%` }} /></div>
                  <strong>{enemy.name}</strong>
                  <small>{enemy.concept}</small>
                </div>
              );
            })}

            {view.boss && (
              <div
                className={`capital-boss ${view.boss.charging ? 'charging' : ''} ${view.boss.enraged ? 'enraged' : ''}`}
                style={{
                  left: view.boss.x,
                  top: view.boss.feetY - CAPITAL_BOSS_H,
                  width: CAPITAL_BOSS_W,
                  height: CAPITAL_BOSS_H,
                  transform: `translateX(${view.boss.shake > 0 ? Math.sin(view.boss.shake * 70) * 7 : 0}px)`,
                  filter: view.boss.hitFlash > 0 ? 'brightness(2.1) saturate(0.5)' : undefined,
                }}
              >
                <span className="capital-boss-core" />
                <span className="capital-boss-ring" />
                <img className="capital-boss-image" src={bossImage} alt="" aria-hidden />
                <strong>{view.boss.name}</strong>
              </div>
            )}

            {view.pickups.map((pickup) => (
              <span
                className={`capital-pickup capital-pickup-${pickup.kind}`}
                key={pickup.id}
                style={{ left: pickup.x, top: pickup.y }}
              >
                {pickup.kind === 'heal' ? '♥' : pickup.kind === 'boost' ? '⚡' : '★'}
              </span>
            ))}

            <Player
              region={guardian}
              state={view.pstate}
              facing={view.pfacing}
              x={view.px}
              feetY={view.pfeet}
              width={CAPITAL_PLAYER_W}
              height={CAPITAL_PLAYER_H}
              blinking={view.blinking}
              guarding={view.guarding}
              guardFlash={view.guardFlash}
            />

            {view.projectiles.map((projectile) => (
              <span
                className={`capital-projectile capital-projectile-${projectile.team}`}
                key={projectile.id}
                style={{
                  left: projectile.x - projectile.r,
                  top: projectile.y - projectile.r,
                  width: projectile.r * 2,
                  height: projectile.r * 2,
                  '--proj-color': projectile.color,
                } as CSSProperties}
              />
            ))}

            {view.particles.map((particle) => (
              <span
                className={`capital-particle capital-particle-${particle.kind}`}
                key={particle.id}
                style={{
                  left: particle.x,
                  top: particle.y,
                  opacity: particle.alpha,
                  color: particle.color,
                  transform: `translate(-50%, -50%) scale(${particle.scale})`,
                  '--spark-color': particle.color,
                } as CSSProperties}
              >
                {particle.text}
              </span>
            ))}
          </div>
        </div>

        {view.combo >= 2 && (
          <div className="capital-combo" role="status">
            <strong>Combo urbano x{view.comboMultiplier}</strong>
            <span>{view.combo} restauracoes em sequencia</span>
          </div>
        )}

        {view.bossGate && (
          <div className="capital-stage-hint">
            {stageDefinition.gateHint}
          </div>
        )}
      </div>

      <div className="capital-play-hud">
        <div className="capital-hud-bars">
          <span className="capital-hud-name">{character.name} em {stageDefinition.city}</span>
          <div className="stage-bar stage-bar-health">
            <span style={{ width: `${hpRatio * 100}%` }} />
            <small>♥ {Math.max(0, Math.round(view.hp))}</small>
          </div>
          <div className={`stage-bar stage-bar-energy ${energyRatio >= 1 ? 'ready' : ''}`}>
            <span style={{ width: `${energyRatio * 100}%` }} />
            <small>{energyRatio >= 1 ? 'Poder geografico pronto' : 'Foco geografico'}</small>
          </div>
        </div>
        <div className="capital-hud-meta">
          <div>
            <span>Marcos</span>
            <strong>{view.objectiveCount}/{view.totalObjectives}</strong>
          </div>
          <div>
            <span>Pontos</span>
            <strong>{view.score}</strong>
          </div>
          <button className="stage-icon-btn" onClick={toggleMute}>{muted ? '🔇' : '🔊'}</button>
          <button className="stage-icon-btn" onClick={exitStage}>Sair</button>
        </div>
        {view.boss && (
          <div className={`capital-boss-hud ${view.boss.enraged ? 'enraged' : ''}`}>
            <span>{view.boss.name}</span>
            <div className="stage-bar stage-bar-boss">
              <span style={{ width: `${bossRatio * 100}%` }} />
              <small>Use o poder geografico para finalizar</small>
            </div>
          </div>
        )}
      </div>

      {isTouch && !needsRotate && (
        <MobileControls
          setButton={setButton}
          attackVerb="Purificar"
          specialVerb="Poder Geo"
          specialReady={energyRatio >= 1}
        />
      )}

      {needsRotate && (
        <div className="stage-rotate" role="alertdialog" aria-label="Gire o celular">
          <div className="stage-rotate-card">
            <span className="stage-rotate-icon" aria-hidden>📱↻</span>
            <h2>Gire o celular</h2>
            <p>A campanha das capitais foi pensada para jogar na horizontal.</p>
            <div className="stage-overlay-actions">
              <button className="btn-primary" onClick={() => void enterImmersiveMode()}>Usar tela cheia</button>
              <button className="btn-secondary" onClick={exitStage}>Voltar</button>
            </div>
          </div>
        </div>
      )}

      {phase === 'intro' && (
        <div className="stage-overlay">
          <div className="stage-overlay-card capital-intro-card">
            <span className="eyebrow">{completed ? 'Rejogar capital' : 'Nova campanha jogavel'}</span>
            <h2>{stageDefinition.introTitle}</h2>
            <p className="stage-overlay-objective">
              {stageDefinition.introObjective}
            </p>
            <div className="capital-guardian-select" aria-label="Escolha seu guardiao">
              {GUARDIAN_ORDER.map((id) => (
                <button
                  className={id === guardian ? 'active' : ''}
                  key={id}
                  type="button"
                  onClick={() => chooseGuardian(id)}
                >
                  <span>{CHARACTERS[id].name}</span>
                  <small>{CAPITAL_GUARDIAN_BOOSTS[id].label}</small>
                </button>
              ))}
            </div>
            <ul className="stage-controls-help">
              <li><strong>A/D</strong> ou <strong>←/→</strong> mover · <strong>Espaco</strong> pular</li>
              <li><strong>S/↓</strong> abaixar e defender tiros baixos · <strong>J</strong> atacar</li>
              <li><strong>K</strong> ativa o Poder Geo: responda para causar dano forte</li>
            </ul>
            <button className="btn-primary btn-large" onClick={startMission}>Entrar na fase</button>
          </div>
        </div>
      )}

      {phase === 'quiz' && specialQuestion && (
        <div className="stage-overlay">
          <div className="stage-overlay-card capital-quiz-card">
            <span className="eyebrow">Poder geografico</span>
            <h2>{specialQuestion.statement}</h2>
            <div className="capital-quiz-options">
              {specialQuestion.choices.map((choice, index) => (
                <button key={choice} type="button" onClick={() => answer(index)}>
                  {choice}
                </button>
              ))}
            </div>
            <p>{specialQuestion.explanation}</p>
          </div>
        </div>
      )}

      {phase === 'victory' && (
        <div className="stage-overlay stage-overlay-victory">
          <div className="stage-overlay-card">
            <span className="eyebrow">Capital restaurada</span>
            <h2>{stageDefinition.victoryTitle}</h2>
            <div className="stage-stars" aria-label={`${stars} de 3 estrelas`}>
              {[1, 2, 3].map((n) => <span className={n <= stars ? 'star on' : 'star'} key={n}>★</span>)}
            </div>
            <p>{stageDefinition.victoryBody}</p>
            <div className="stage-result-score">
              <strong>{view.score}</strong>
              <span>pontos</span>
            </div>
            <div className="stage-overlay-actions">
              <button className="btn-secondary" onClick={() => reset()}>Jogar de novo</button>
              <button className="btn-primary btn-large" onClick={exitStage}>Voltar a rota</button>
            </div>
          </div>
        </div>
      )}

      {phase === 'defeat' && (
        <div className="stage-overlay stage-overlay-defeat">
          <div className="stage-overlay-card">
            <span className="eyebrow">Tente outra estrategia</span>
            <h2>{character.name} perdeu o foco</h2>
            <p>Use a defesa baixa contra tiros, colete marcos e escolha um guardiao com poder adequado para a cidade.</p>
            <div className="stage-overlay-actions">
              <button className="btn-secondary" onClick={exitStage}>Voltar</button>
              <button className="btn-primary btn-large" onClick={() => reset()}>Tentar de novo</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
