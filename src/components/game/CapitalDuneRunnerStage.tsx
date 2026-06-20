import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import natalStageBg from '../../assets/backgrounds/capital-natal-stage-bg.png';
import titaFalesiaBoss from '../../assets/bosses/capital-natal-boss-tita-falesia.png';
import buggyImg from '../../assets/enemies/capital-natal-enemy-buggy-desgovernado.png';
import dunaImg from '../../assets/enemies/capital-natal-enemy-duna-instavel.png';
import mareImg from '../../assets/enemies/capital-natal-enemy-mare-avancando.png';
import ventoImg from '../../assets/enemies/capital-natal-enemy-vento-cruzado.png';
import { CHARACTERS } from '../../data/characters';
import type { CapitalMission } from '../../data/capitalChallenges';
import { CAPITAL_SPECIAL_QUESTIONS, type CapitalSpecialQuestion } from '../../data/capitalQuestions';
import type { AnimationState, CapitalMissionResult, RegionId } from '../../data/types';
import { isMuted, playSound, setMuted } from '../../game/soundEngine';
import { useDeviceMode } from '../../hooks/useDeviceMode';
import { useGameLoop } from '../../hooks/useGameLoop';
import { useKeyboardControls, type InputState } from '../../hooks/useKeyboardControls';
import { shuffleQuestionChoices, type AnswerIndex } from '../../utils/questionChoices';
import { MobileControls } from './MobileControls';
import { Player } from './Player';
import { CAPITAL_GUARDIAN_BOOSTS, CAPITAL_MAX_ENERGY, CAPITAL_PLAYER_H, CAPITAL_PLAYER_W, CAPITAL_VIEW_H, CAPITAL_VIEW_W } from './capitalStageEngine';

type Phase = 'intro' | 'playing' | 'quiz' | 'victory' | 'defeat';
type SafeAction = 'jump' | 'crouch' | 'attack' | 'lane';
type ObstacleKind = 'duna' | 'vento' | 'mare' | 'buggy';

type Obstacle = {
  id: number;
  kind: ObstacleKind;
  name: string;
  concept: string;
  action: SafeAction;
  lane: number;
  x: number;
  w: number;
  h: number;
  damage: number;
  score: number;
  image: string;
  passed: boolean;
  hit: boolean;
};

type Particle = { id: number; text: string; x: number; y: number; color: string; life: number; maxLife: number };

type RunnerState = {
  guardian: RegionId;
  hp: number;
  maxHp: number;
  energy: number;
  score: number;
  distance: number;
  speed: number;
  lane: number;
  laneCooldown: number;
  jumpTimer: number;
  attackTimer: number;
  attackCooldown: number;
  invuln: number;
  shield: number;
  boost: number;
  spawnTimer: number;
  spawnIndex: number;
  nextId: number;
  nextParticle: number;
  bossActive: boolean;
  bossHp: number;
  bossMaxHp: number;
  bossAttack: number;
  bossShake: number;
  obstacles: Obstacle[];
  collected: string[];
  particles: Particle[];
  quizCorrect: number;
  quizTotal: number;
  flash: number;
  crouching: boolean;
};

interface CapitalDuneRunnerStageProps {
  mission: CapitalMission;
  completed: boolean;
  onComplete: (result: CapitalMissionResult) => void;
}

const LANES = [350, 405, 458] as const;
const LANE_LABELS = ['Orla', 'Dunas', 'Via Costeira'] as const;
const GUARDIAN_ORDER: RegionId[] = ['nordeste', 'centro-oeste', 'sudeste', 'norte', 'sul'];
const PLAYER_X = 168;
const TRACK_DISTANCE = 3350;
const JUMP_DURATION = 0.62;
const BASE_SPEED = 292;
const BOOST_SPEED = 84;
const BOSS_DAMAGE_PER_DODGE = 14;
const BOSS_SPECIAL_DAMAGE = 128;

const OBSTACLES = [
  { kind: 'duna', name: 'Duna Instavel', concept: 'Dinamica costeira', action: 'jump', damage: 13, score: 95, image: dunaImg },
  { kind: 'vento', name: 'Vento Cruzado', concept: 'Ventos litoraneos', action: 'crouch', damage: 11, score: 88, image: ventoImg },
  { kind: 'mare', name: 'Mare Avancando', concept: 'Erosao costeira', action: 'lane', damage: 14, score: 100, image: mareImg },
  { kind: 'buggy', name: 'Buggy Desgovernado', concept: 'Turismo e risco', action: 'attack', damage: 16, score: 112, image: buggyImg },
] satisfies Array<{ kind: ObstacleKind; name: string; concept: string; action: SafeAction; damage: number; score: number; image: string }>;

const MARKERS = [
  { id: 'ponta-negra', label: 'Ponta Negra', concept: 'Orla turistica', distance: 660, lane: 0 },
  { id: 'morro-careca', label: 'Morro do Careca', concept: 'Duna costeira', distance: 1320, lane: 1 },
  { id: 'parque-dunas', label: 'Parque das Dunas', concept: 'Unidade de conservacao', distance: 2030, lane: 2 },
  { id: 'via-costeira', label: 'Via Costeira', concept: 'Turismo e mobilidade', distance: 2700, lane: 1 },
];

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function createState(guardian: RegionId): RunnerState {
  const boost = CAPITAL_GUARDIAN_BOOSTS[guardian];
  const maxHp = 104 + boost.hp;
  return {
    guardian,
    hp: maxHp,
    maxHp,
    energy: 28,
    score: 0,
    distance: 0,
    speed: BASE_SPEED,
    lane: 1,
    laneCooldown: 0,
    jumpTimer: 0,
    attackTimer: 0,
    attackCooldown: 0,
    invuln: 0,
    shield: 0,
    boost: 0,
    spawnTimer: 0.85,
    spawnIndex: 0,
    nextId: 1,
    nextParticle: 1,
    bossActive: false,
    bossHp: 390,
    bossMaxHp: 390,
    bossAttack: 1.8,
    bossShake: 0,
    obstacles: [],
    collected: [],
    particles: [],
    quizCorrect: 0,
    quizTotal: 0,
    flash: 0,
    crouching: false,
  };
}

function cloneState(state: RunnerState): RunnerState {
  return {
    ...state,
    obstacles: state.obstacles.map((item) => ({ ...item })),
    collected: [...state.collected],
    particles: state.particles.map((item) => ({ ...item })),
  };
}

function liftFor(state: RunnerState): number {
  if (state.jumpTimer <= 0) return 0;
  return Math.sin((1 - state.jumpTimer / JUMP_DURATION) * Math.PI) * 118;
}

function actionLabel(action: SafeAction): string {
  if (action === 'jump') return 'Pule';
  if (action === 'crouch') return 'Abaixe';
  if (action === 'attack') return 'Pulso';
  return 'Troque de faixa';
}

function addParticle(state: RunnerState, text: string, x: number, y: number, color = '#ffe26b') {
  state.particles.push({ id: state.nextParticle, text, x, y, color, life: 0.72, maxLife: 0.72 });
  state.nextParticle += 1;
}

function spawnObstacle(state: RunnerState) {
  const def = OBSTACLES[state.spawnIndex % OBSTACLES.length]!;
  const lane = (state.spawnIndex * 2 + Math.floor(state.distance / 620)) % LANES.length;
  state.obstacles.push({
    id: state.nextId,
    kind: def.kind,
    name: def.name,
    concept: def.concept,
    action: def.action,
    lane,
    x: CAPITAL_VIEW_W + 80,
    w: def.kind === 'buggy' ? 128 : 108,
    h: def.kind === 'vento' ? 118 : 105,
    damage: def.damage,
    score: def.score,
    image: def.image,
    passed: false,
    hit: false,
  });
  state.nextId += 1;
  state.spawnIndex += 1;
}

function reward(state: RunnerState, obstacle: Obstacle, label: string) {
  if (obstacle.passed) return;
  const boost = CAPITAL_GUARDIAN_BOOSTS[state.guardian];
  obstacle.passed = true;
  state.score += obstacle.score;
  state.energy = clamp(state.energy + 13 + boost.energyGain, 0, CAPITAL_MAX_ENERGY);
  if (state.bossActive) {
    state.bossHp = Math.max(0, state.bossHp - BOSS_DAMAGE_PER_DODGE);
    state.bossShake = 0.22;
  }
  addParticle(state, label, PLAYER_X + 92, LANES[obstacle.lane]! - 86, '#8ef0c6');
}

function hurt(state: RunnerState, amount: number, x: number, y: number) {
  if (state.invuln > 0 || state.shield > 0) {
    addParticle(state, 'defesa', x, y, '#9ee9ff');
    return;
  }
  const boost = CAPITAL_GUARDIAN_BOOSTS[state.guardian];
  state.hp = Math.max(0, state.hp - amount * boost.damageTaken);
  state.invuln = 0.92;
  state.flash = 0.32;
  addParticle(state, '-vida', x, y, '#ff786b');
}

function pulse(state: RunnerState) {
  if (state.attackCooldown > 0) return;
  state.attackTimer = 0.18;
  state.attackCooldown = 0.52;
  const target = state.obstacles.find((item) => (
    !item.passed && !item.hit && item.lane === state.lane && item.x > PLAYER_X + 62 && item.x < PLAYER_X + 310
  ));
  if (!target) return;
  reward(state, target, 'pulso');
  target.hit = true;
  state.score += 40;
}

function stepRunner(state: RunnerState, input: InputState, dt: number): 'playing' | 'quiz' | 'victory' | 'defeat' {
  state.laneCooldown = Math.max(0, state.laneCooldown - dt);
  state.jumpTimer = Math.max(0, state.jumpTimer - dt);
  state.attackTimer = Math.max(0, state.attackTimer - dt);
  state.attackCooldown = Math.max(0, state.attackCooldown - dt);
  state.invuln = Math.max(0, state.invuln - dt);
  state.shield = Math.max(0, state.shield - dt);
  state.boost = Math.max(0, state.boost - dt);
  state.flash = Math.max(0, state.flash - dt);
  state.bossShake = Math.max(0, state.bossShake - dt);
  state.crouching = input.crouch;

  if (input.left && state.laneCooldown <= 0) {
    state.lane = clamp(state.lane - 1, 0, LANES.length - 1);
    state.laneCooldown = 0.18;
  }
  if (input.right && state.laneCooldown <= 0) {
    state.lane = clamp(state.lane + 1, 0, LANES.length - 1);
    state.laneCooldown = 0.18;
  }
  if (input.jumpPressed && state.jumpTimer <= 0) state.jumpTimer = JUMP_DURATION;
  if (input.attackPressed) pulse(state);
  if (input.specialPressed && state.energy >= CAPITAL_MAX_ENERGY) {
    input.jumpPressed = false;
    input.attackPressed = false;
    input.specialPressed = false;
    return 'quiz';
  }
  input.jumpPressed = false;
  input.attackPressed = false;
  input.specialPressed = false;

  state.speed = BASE_SPEED + Math.min(72, state.distance / 34) + (state.boost > 0 ? BOOST_SPEED : 0);
  state.distance += state.speed * dt;

  if (!state.bossActive && state.distance >= TRACK_DISTANCE) {
    state.bossActive = true;
    state.energy = CAPITAL_MAX_ENERGY;
    state.spawnTimer = 0.3;
    addParticle(state, 'chefao', CAPITAL_VIEW_W - 190, 185, '#ff786b');
  }

  state.spawnTimer -= dt;
  if (state.spawnTimer <= 0 && state.bossHp > 0) {
    spawnObstacle(state);
    state.spawnTimer = (state.bossActive ? 1.02 : 1.24) + Math.max(0, 0.25 - state.distance / 18000);
  }

  const lift = liftFor(state);
  const playerRight = PLAYER_X + CAPITAL_PLAYER_W * 0.78;
  const playerLeft = PLAYER_X + CAPITAL_PLAYER_W * 0.2;

  for (const marker of MARKERS) {
    if (state.collected.includes(marker.id)) continue;
    const x = CAPITAL_VIEW_W + marker.distance - state.distance;
    if (marker.lane === state.lane && x < playerRight + 46 && x > playerLeft - 46) {
      state.collected.push(marker.id);
      state.score += 160;
      state.energy = clamp(state.energy + 24, 0, CAPITAL_MAX_ENERGY);
      addParticle(state, marker.label, PLAYER_X + 88, LANES[marker.lane]! - 108, '#ffe26b');
    }
  }

  for (const obstacle of state.obstacles) {
    const extra = obstacle.kind === 'buggy' ? 82 : obstacle.kind === 'vento' ? 36 : 0;
    obstacle.x -= (state.speed + extra) * dt;
    if (obstacle.passed || obstacle.hit) continue;

    const sameLane = obstacle.lane === state.lane;
    const overlap = obstacle.x < playerRight && obstacle.x + obstacle.w > playerLeft;
    if (!overlap) {
      if (obstacle.x + obstacle.w < playerLeft) reward(state, obstacle, '+geo');
      continue;
    }
    if (!sameLane) {
      reward(state, obstacle, '+faixa');
      continue;
    }

    const avoided = (obstacle.action === 'jump' && lift > 54)
      || (obstacle.action === 'crouch' && state.crouching)
      || (obstacle.action === 'attack' && state.attackTimer > 0);
    if (avoided) {
      reward(state, obstacle, actionLabel(obstacle.action));
      continue;
    }
    hurt(state, obstacle.damage, obstacle.x, LANES[obstacle.lane]! - 92);
    obstacle.hit = true;
  }

  state.obstacles = state.obstacles.filter((item) => item.x > -170 && !(item.hit && item.x < PLAYER_X - 80));
  for (const particle of state.particles) particle.life -= dt;
  state.particles = state.particles.filter((particle) => particle.life > 0);

  if (state.bossActive && state.bossHp > 0) {
    state.bossAttack -= dt;
    if (state.bossAttack <= 0) {
      const def = OBSTACLES[(state.spawnIndex + 2) % OBSTACLES.length]!;
      const lane = (state.spawnIndex + 1) % LANES.length;
      state.obstacles.push({
        id: state.nextId,
        kind: def.kind,
        name: def.name,
        concept: def.concept,
        action: def.action,
        lane,
        x: CAPITAL_VIEW_W - 210,
        w: def.kind === 'buggy' ? 132 : 112,
        h: def.kind === 'vento' ? 118 : 108,
        damage: def.damage + 2,
        score: def.score + 28,
        image: def.image,
        passed: false,
        hit: false,
      });
      state.nextId += 1;
      state.spawnIndex += 1;
      state.bossAttack = 1.55;
    }
  }

  if (state.bossActive && state.bossHp <= 0) {
    state.bossHp = 0;
    state.score += 520;
    return 'victory';
  }
  if (state.hp <= 0) return 'defeat';
  return 'playing';
}

function playerStateFor(state: RunnerState): AnimationState {
  if (state.hp <= 0) return 'hit';
  if (state.attackTimer > 0) return 'attack';
  if (liftFor(state) > 2) return 'jump';
  if (state.crouching) return 'crouch';
  return 'walk';
}

function starsFor(state: RunnerState): number {
  const hpRatio = state.hp / state.maxHp;
  if (hpRatio >= 0.68 && state.collected.length >= 4 && state.quizCorrect >= 2) return 3;
  if (hpRatio >= 0.36 && state.collected.length >= 3) return 2;
  return 1;
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

export function CapitalDuneRunnerStage({ mission, completed, onComplete }: CapitalDuneRunnerStageProps) {
  const [guardian, setGuardian] = useState<RegionId>('nordeste');
  const [runner, setRunner] = useState<RunnerState>(() => createState('nordeste'));
  const stateRef = useRef<RunnerState>(runner);
  const [phase, setPhase] = useState<Phase>('intro');
  const [stars, setStars] = useState(0);
  const [question, setQuestion] = useState<CapitalSpecialQuestion | null>(null);
  const [muted, setMutedState] = useState(isMuted());
  const renderElapsedRef = useRef(0);
  const victorySavedRef = useRef(false);
  const questionDeckRef = useRef<CapitalSpecialQuestion[]>([]);
  const lastQuestionIdRef = useRef<string | null>(null);
  const lastAnswerIndexRef = useRef<AnswerIndex | null>(null);
  const sfxRef = useRef({ hp: 0, markers: 0, boss: false, obstacles: 0 });

  const { isTouch, isPortrait } = useDeviceMode();
  const needsRotate = isTouch && isPortrait;
  const active = phase === 'playing' && !needsRotate;
  const { inputRef, setButton } = useKeyboardControls(active);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const state = runner;
  const character = CHARACTERS[guardian];
  const lift = liftFor(state);
  const playerFeetY = LANES[state.lane]! - lift;
  const hpRatio = Math.max(0, state.hp / state.maxHp);
  const energyRatio = Math.max(0, Math.min(1, state.energy / CAPITAL_MAX_ENERGY));
  const progressRatio = clamp(state.distance / TRACK_DISTANCE, 0, 1);
  const bossRatio = state.bossActive ? Math.max(0, state.bossHp / state.bossMaxHp) : 0;

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

  const worldStyle = useMemo(() => {
    const touchLift = isTouch && !needsRotate ? Math.min(128, Math.max(0, (1 - scale) * 390)) : 0;
    return { width: CAPITAL_VIEW_W, height: CAPITAL_VIEW_H, transform: `translateY(${-touchLift}px) scale(${scale})` };
  }, [isTouch, needsRotate, scale]);

  function forceRender() {
    setRunner(cloneState(stateRef.current));
  }

  function reset(nextGuardian = guardian) {
    const fresh = createState(nextGuardian);
    stateRef.current = fresh;
    setGuardian(nextGuardian);
    setPhase('intro');
    setQuestion(null);
    setStars(0);
    victorySavedRef.current = false;
    renderElapsedRef.current = 0;
    questionDeckRef.current = [];
    lastAnswerIndexRef.current = null;
    sfxRef.current = { hp: fresh.hp, markers: 0, boss: false, obstacles: 0 };
    forceRender();
  }

  function chooseGuardian(next: RegionId) {
    reset(next);
  }

  async function enterImmersiveMode() {
    if (!isTouch) return;
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.();
      const orientation = screen.orientation as ScreenOrientation & { lock?: (value: 'landscape') => Promise<void> };
      await orientation.lock?.('landscape');
    } catch {
      // Mobile browsers can deny fullscreen or orientation locking.
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

  function emitSfx(next: RunnerState) {
    if (next.hp < sfxRef.current.hp) playSound('hurt');
    if (next.collected.length > sfxRef.current.markers) playSound('pickup');
    if (next.bossActive && !sfxRef.current.boss) playSound('bossAppear');
    if (next.obstacles.length < sfxRef.current.obstacles) playSound('defeatEnemy');
    sfxRef.current = { hp: next.hp, markers: next.collected.length, boss: next.bossActive, obstacles: next.obstacles.length };
  }

  function drawQuestion(): CapitalSpecialQuestion {
    const bank = CAPITAL_SPECIAL_QUESTIONS[mission.id].length > 0 ? CAPITAL_SPECIAL_QUESTIONS[mission.id] : CAPITAL_SPECIAL_QUESTIONS.fortaleza;
    if (questionDeckRef.current.length === 0) {
      const filtered = bank.filter((item) => item.id !== lastQuestionIdRef.current);
      questionDeckRef.current = shuffleQuestions(filtered.length > 0 ? filtered : bank);
    }
    const next = questionDeckRef.current.pop() ?? bank[0]!;
    lastQuestionIdRef.current = next.id;
    const shuffled = shuffleQuestionChoices(next, lastAnswerIndexRef.current);
    lastAnswerIndexRef.current = shuffled.answerIndex;
    return shuffled;
  }

  function handleStep(dt: number): boolean {
    const outcome = stepRunner(stateRef.current, inputRef.current, dt);
    if (outcome === 'quiz') {
      setQuestion(drawQuestion());
      setPhase('quiz');
      forceRender();
      return false;
    }
    if (outcome === 'victory') {
      const nextStars = starsFor(stateRef.current);
      setStars(nextStars);
      playSound('victory');
      setPhase('victory');
      forceRender();
      return false;
    }
    if (outcome === 'defeat') {
      playSound('gameover');
      setPhase('defeat');
      forceRender();
      return false;
    }
    renderElapsedRef.current += dt;
    if (renderElapsedRef.current >= 1 / 30) {
      renderElapsedRef.current = 0;
      emitSfx(stateRef.current);
      forceRender();
    }
    return true;
  }

  useGameLoop(handleStep, active);

  useEffect(() => {
    if (phase !== 'victory' || victorySavedRef.current) return;
    victorySavedRef.current = true;
    onComplete({ capital: mission.id, route: mission.route, score: stateRef.current.score, stars, completed: true });
  }, [mission.id, mission.route, onComplete, phase, stars]);

  function answer(index: number) {
    if (!question) return;
    const current = stateRef.current;
    const correct = index === question.answerIndex;
    current.quizTotal += 1;
    current.energy = 0;
    if (correct) {
      current.quizCorrect += 1;
      current.flash = 0.46;
      current.shield = 2.1;
      current.boost = 3.2;
      current.score += 230;
      if (current.bossActive) {
        current.bossHp = Math.max(0, current.bossHp - BOSS_SPECIAL_DAMAGE);
        current.bossShake = 0.44;
      } else {
        for (const obstacle of current.obstacles) {
          if (!obstacle.passed && obstacle.x > PLAYER_X) reward(current, obstacle, 'poder');
        }
      }
      addParticle(current, 'Poder Geo', PLAYER_X + 138, playerFeetY - 118, '#ffe26b');
      playSound('special');
    } else {
      hurt(current, 15, PLAYER_X + 80, playerFeetY - 90);
      playSound('hurt');
    }
    setQuestion(null);
    if (current.bossActive && current.bossHp <= 0) {
      setStars(starsFor(current));
      setPhase('victory');
      playSound('victory');
      forceRender();
      return;
    }
    if (current.hp <= 0) {
      setPhase('defeat');
      playSound('gameover');
      forceRender();
      return;
    }
    setPhase('playing');
    forceRender();
  }

  return (
    <section
      className="capital-play-root natal-runner-root"
      style={{
        '--capital-stage-bg': `url(${natalStageBg})`,
        '--region-color': character.themeColor,
        '--runner-bg-offset': `${-state.distance * 0.22}px`,
      } as CSSProperties}
    >
      <div className={`capital-play-viewport natal-runner-viewport ${state.flash > 0 ? 'special-active' : ''}`} ref={viewportRef}>
        <div className="capital-play-scaler" style={worldStyle}>
          <div className="natal-runner-world">
            <div className="natal-runner-backdrop" />
            <div className="natal-runner-sun-glare" />
            <div className="natal-runner-track">
              {LANES.map((feetY, index) => (
                <div className={`natal-runner-lane ${index === state.lane ? 'active' : ''}`} key={LANE_LABELS[index]} style={{ top: feetY - 24 }}>
                  <span>{LANE_LABELS[index]}</span>
                </div>
              ))}
            </div>
            <div className="natal-runner-progress" aria-label="Progresso ate o chefao">
              <span style={{ width: `${progressRatio * 100}%` }} />
            </div>

            {MARKERS.map((marker) => {
              const x = CAPITAL_VIEW_W + marker.distance - state.distance;
              const collected = state.collected.includes(marker.id);
              return (
                <div className={`natal-runner-marker ${collected ? 'collected' : ''}`} key={marker.id} style={{ left: x, top: LANES[marker.lane]! - 112 }}>
                  <span>{collected ? 'OK' : 'Geo'}</span>
                  <strong>{marker.label}</strong>
                  <small>{marker.concept}</small>
                </div>
              );
            })}

            {state.obstacles.map((obstacle) => (
              <div
                className={`natal-runner-obstacle natal-runner-obstacle-${obstacle.kind} ${obstacle.passed ? 'passed' : ''}`}
                key={obstacle.id}
                style={{ left: obstacle.x, top: LANES[obstacle.lane]! - obstacle.h, width: obstacle.w, height: obstacle.h }}
              >
                <img src={obstacle.image} alt="" aria-hidden />
                <strong>{obstacle.name}</strong>
                <small>{actionLabel(obstacle.action)}</small>
              </div>
            ))}

            {state.bossActive && state.bossHp > 0 && (
              <div className="natal-runner-boss" style={{ transform: `translateX(${state.bossShake > 0 ? Math.sin(state.bossShake * 80) * 8 : 0}px)` }}>
                <img src={titaFalesiaBoss} alt="" aria-hidden />
                <strong>Tita da Falesia</strong>
              </div>
            )}

            <Player
              region={guardian}
              state={playerStateFor(state)}
              facing={1}
              x={PLAYER_X}
              feetY={playerFeetY}
              width={CAPITAL_PLAYER_W}
              height={CAPITAL_PLAYER_H}
              blinking={state.invuln > 0}
              guarding={state.crouching || state.shield > 0}
              guardFlash={state.shield > 0}
            />

            {state.particles.map((particle) => {
              const alpha = clamp(particle.life / particle.maxLife, 0, 1);
              const scaleValue = 0.8 + (1 - alpha) * 0.45;
              return (
                <span
                  className="capital-particle capital-particle-text"
                  key={particle.id}
                  style={{ left: particle.x, top: particle.y, opacity: alpha, color: particle.color, transform: `translate(-50%, -50%) scale(${scaleValue})` }}
                >
                  {particle.text}
                </span>
              );
            })}
          </div>
        </div>

        {state.flash > 0 && <div className="capital-special-screen-flash" />}
        <div className="natal-runner-objective-panel">
          <strong>Corrida das Dunas</strong>
          <span>Troque de faixa, pule, abaixe e use o quiz como impulso contra o chefao.</span>
        </div>
      </div>

      <div className="capital-play-hud natal-runner-hud">
        <div className="capital-hud-bars">
          <span className="capital-hud-name">{character.name} em Natal</span>
          <div className="stage-bar stage-bar-health"><span style={{ width: `${hpRatio * 100}%` }} /><small>HP {Math.max(0, Math.round(state.hp))}</small></div>
          <div className={`stage-bar stage-bar-energy ${energyRatio >= 1 ? 'ready' : ''}`}><span style={{ width: `${energyRatio * 100}%` }} /><small>{energyRatio >= 1 ? 'Quiz Geo pronto' : 'Conhecimento em carga'}</small></div>
        </div>
        <div className="capital-hud-meta">
          <div><span>Marcos</span><strong>{state.collected.length}/{MARKERS.length}</strong></div>
          <div><span>Quiz</span><strong>{state.quizCorrect}/{state.quizTotal}</strong></div>
          <div><span>Pontos</span><strong>{state.score}</strong></div>
          <button className="stage-icon-btn" onClick={toggleMute}>{muted ? 'Sem som' : 'Som'}</button>
          <button className="stage-icon-btn" onClick={exitStage}>Sair</button>
        </div>
        {state.bossActive && state.bossHp > 0 && (
          <div className="capital-boss-hud enraged">
            <span>Tita da Falesia</span>
            <div className="stage-bar stage-bar-boss"><span style={{ width: `${bossRatio * 100}%` }} /><small>Desvie para enfraquecer e acerte o quiz para quebrar a falesia</small></div>
          </div>
        )}
      </div>

      {isTouch && !needsRotate && <MobileControls setButton={setButton} attackVerb="Pulso" specialVerb="Quiz Geo" specialReady={energyRatio >= 1} />}

      {needsRotate && (
        <div className="stage-rotate" role="alertdialog" aria-label="Gire o celular">
          <div className="stage-rotate-card">
            <span className="stage-rotate-icon" aria-hidden>ROT</span>
            <h2>Gire o celular</h2>
            <p>A Corrida das Dunas foi pensada para jogar na horizontal.</p>
            <div className="stage-overlay-actions"><button className="btn-primary" onClick={() => void enterImmersiveMode()}>Usar tela cheia</button><button className="btn-secondary" onClick={exitStage}>Voltar</button></div>
          </div>
        </div>
      )}

      {phase === 'intro' && (
        <div className="stage-overlay">
          <div className="stage-overlay-card capital-intro-card natal-runner-intro">
            <span className="eyebrow">{completed ? 'Rejogar capital' : 'Novo modo jogavel'}</span>
            <h2>Natal: Corrida das Dunas</h2>
            <p className="stage-overlay-objective">Avance automaticamente pela orla, leia as dunas e use respostas certas para transformar conhecimento em impulso contra a Tita da Falesia.</p>
            <div className="capital-guardian-select" aria-label="Escolha seu guardiao">
              {GUARDIAN_ORDER.map((id) => (
                <button className={id === guardian ? 'active' : ''} key={id} type="button" onClick={() => chooseGuardian(id)}><span>{CHARACTERS[id].name}</span><small>{CAPITAL_GUARDIAN_BOOSTS[id].label}</small></button>
              ))}
            </div>
            <ul className="stage-controls-help">
              <li><strong>A/D</strong> ou <strong>setas</strong> trocam de faixa durante a corrida</li>
              <li><strong>Espaco</strong> pula dunas, <strong>S</strong> abaixa contra vento e <strong>J</strong> solta pulso curto</li>
              <li><strong>K</strong> abre o Quiz Geo: acertar cria impulso, escudo e dano forte no chefao</li>
            </ul>
            <button className="btn-primary btn-large" onClick={startMission}>Comecar corrida</button>
          </div>
        </div>
      )}

      {phase === 'quiz' && question && (
        <div className="stage-overlay">
          <div className="stage-overlay-card capital-quiz-card">
            <span className="eyebrow">Quiz Geo de Natal</span>
            <h2>{question.statement}</h2>
            <div className="capital-quiz-options">{question.choices.map((choice, index) => <button key={choice} type="button" onClick={() => answer(index)}>{choice}</button>)}</div>
            <p>{question.explanation}</p>
          </div>
        </div>
      )}

      {phase === 'victory' && (
        <div className="stage-overlay stage-overlay-victory">
          <div className="stage-overlay-card">
            <span className="eyebrow">Capital restaurada</span>
            <h2>Natal concluida</h2>
            <div className="stage-stars" aria-label={`${stars} de 3 estrelas`}>{[1, 2, 3].map((n) => <span className={n <= stars ? 'star on' : 'star'} key={n}>*</span>)}</div>
            <p>Voce conectou Ponta Negra, Morro do Careca, Parque das Dunas, vento, turismo e preservacao costeira numa fase de ritmo diferente.</p>
            <div className="stage-result-score"><strong>{state.score}</strong><span>pontos</span></div>
            <div className="stage-overlay-actions"><button className="btn-secondary" onClick={() => reset()}>Jogar de novo</button><button className="btn-primary btn-large" onClick={exitStage}>Voltar a rota</button></div>
          </div>
        </div>
      )}

      {phase === 'defeat' && (
        <div className="stage-overlay stage-overlay-defeat">
          <div className="stage-overlay-card">
            <span className="eyebrow">Tente outro ritmo</span>
            <h2>{character.name} perdeu a corrida</h2>
            <p>Troque de faixa cedo, use pulso contra buggy, abaixe contra vento e guarde o Quiz Geo para a Tita da Falesia.</p>
            <div className="stage-overlay-actions"><button className="btn-secondary" onClick={exitStage}>Voltar</button><button className="btn-primary btn-large" onClick={() => reset()}>Tentar de novo</button></div>
          </div>
        </div>
      )}
    </section>
  );
}
