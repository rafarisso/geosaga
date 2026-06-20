import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import maceioStageBg from '../../assets/backgrounds/capital-maceio-stage-bg.png';
import guardiaoAfogadoBoss from '../../assets/bosses/capital-maceio-boss-guardiao-afogado-lagoa.png';
import ancoraPredatoriaImg from '../../assets/enemies/capital-maceio-enemy-ancora-predatoria.png';
import correntezaCegaImg from '../../assets/enemies/capital-maceio-enemy-correnteza-cega.png';
import manchaEsgotoImg from '../../assets/enemies/capital-maceio-enemy-mancha-esgoto.png';
import turismoSemLimiteImg from '../../assets/enemies/capital-maceio-enemy-turismo-sem-limite.png';
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
type LagoonEnemyKind = 'mancha' | 'ancora' | 'correnteza' | 'turismo';
type StepResult = 'playing' | 'quiz' | 'victory' | 'defeat';

type LagoonEnemy = {
  id: number;
  kind: LagoonEnemyKind;
  name: string;
  concept: string;
  x: number;
  lane: number;
  w: number;
  h: number;
  hp: number;
  maxHp: number;
  damage: number;
  drift: number;
  image: string;
  passed: boolean;
  hitFlash: number;
};

type LagoonMarker = { id: string; label: string; concept: string; x: number; lane: number; collected: boolean };
type LagoonProjectile = { id: number; x: number; y: number; vx: number; damage: number; life: number };
type LagoonParticle = { id: number; text: string; x: number; y: number; color: string; life: number; maxLife: number };

type LagoonState = {
  guardian: RegionId;
  hp: number;
  maxHp: number;
  energy: number;
  score: number;
  px: number;
  lane: number;
  laneCooldown: number;
  vx: number;
  facing: 1 | -1;
  attackTimer: number;
  attackCooldown: number;
  invuln: number;
  guardFlash: number;
  specialFlash: number;
  tideTime: number;
  tideLevel: number;
  tideDamageCooldown: number;
  camera: number;
  bossActive: boolean;
  bossHp: number;
  bossMaxHp: number;
  bossAttack: number;
  bossShake: number;
  enemies: LagoonEnemy[];
  markers: LagoonMarker[];
  projectiles: LagoonProjectile[];
  particles: LagoonParticle[];
  quizCorrect: number;
  quizTotal: number;
  nextEnemy: number;
  nextProjectile: number;
  nextParticle: number;
};

interface CapitalLagoonStageProps {
  mission: CapitalMission;
  completed: boolean;
  onComplete: (result: CapitalMissionResult) => void;
}

const GUARDIAN_ORDER: RegionId[] = ['nordeste', 'norte', 'sudeste', 'centro-oeste', 'sul'];
const STAGE_W = 3220;
const LANES = [292, 366, 438] as const;
const LANE_NAMES = ['Recifes', 'Canal', 'Lagoa'] as const;
const PLAYER_START_X = 112;
const BOSS_X = 2760;
const BOSS_W = 260;
const BOSS_H = 280;
const MAX_SPEED = 300;
const ACCEL = 1750;
const FRICTION = 1300;
const PROJECTILE_SPEED = 740;
const PROJECTILE_W = 44;
const PROJECTILE_H = 16;
const ATTACK_DAMAGE = 40;
const SPECIAL_DAMAGE = 165;

const ENEMY_DEFS = [
  { kind: 'mancha', name: 'Mancha de Esgoto', concept: 'Saneamento', x: 620, lane: 1, w: 122, h: 94, hp: 70, damage: 12, drift: 16, image: manchaEsgotoImg },
  { kind: 'ancora', name: 'Ancora Predatoria', concept: 'Recifes bloqueados', x: 1050, lane: 0, w: 116, h: 124, hp: 82, damage: 14, drift: 0, image: ancoraPredatoriaImg },
  { kind: 'correnteza', name: 'Correnteza Cega', concept: 'Ciclo das mares', x: 1540, lane: 2, w: 128, h: 100, hp: 76, damage: 13, drift: 32, image: correntezaCegaImg },
  { kind: 'turismo', name: 'Turismo Sem Limite', concept: 'Uso da orla', x: 2100, lane: 1, w: 132, h: 108, hp: 86, damage: 15, drift: 10, image: turismoSemLimiteImg },
] satisfies Array<Omit<LagoonEnemy, 'id' | 'maxHp' | 'passed' | 'hitFlash'>>;

const MARKER_DEFS = [
  { id: 'pajucara', label: 'Pajucara', concept: 'Jangadas', x: 430, lane: 1 },
  { id: 'ponta-verde', label: 'Ponta Verde', concept: 'Orla urbana', x: 1160, lane: 0 },
  { id: 'piscinas', label: 'Piscinas naturais', concept: 'Recifes', x: 1840, lane: 1 },
  { id: 'mundau', label: 'Lagoa Mundau', concept: 'Sistema lagunar', x: 2420, lane: 2 },
];

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function createEnemies(): LagoonEnemy[] {
  return ENEMY_DEFS.map((enemy, index) => ({ ...enemy, id: index + 1, maxHp: enemy.hp, passed: false, hitFlash: 0 }));
}

function createMarkers(): LagoonMarker[] {
  return MARKER_DEFS.map((marker) => ({ ...marker, collected: false }));
}

function createState(guardian: RegionId): LagoonState {
  const boost = CAPITAL_GUARDIAN_BOOSTS[guardian];
  const maxHp = 108 + boost.hp;
  return {
    guardian,
    hp: maxHp,
    maxHp,
    energy: 34,
    score: 0,
    px: PLAYER_START_X,
    lane: 1,
    laneCooldown: 0,
    vx: 0,
    facing: 1,
    attackTimer: 0,
    attackCooldown: 0,
    invuln: 0,
    guardFlash: 0,
    specialFlash: 0,
    tideTime: 0,
    tideLevel: 0.5,
    tideDamageCooldown: 0,
    camera: 0,
    bossActive: false,
    bossHp: 430,
    bossMaxHp: 430,
    bossAttack: 1.25,
    bossShake: 0,
    enemies: createEnemies(),
    markers: createMarkers(),
    projectiles: [],
    particles: [],
    quizCorrect: 0,
    quizTotal: 0,
    nextEnemy: 60,
    nextProjectile: 1,
    nextParticle: 1,
  };
}

function cloneState(state: LagoonState): LagoonState {
  return {
    ...state,
    enemies: state.enemies.map((enemy) => ({ ...enemy })),
    markers: state.markers.map((marker) => ({ ...marker })),
    projectiles: state.projectiles.map((projectile) => ({ ...projectile })),
    particles: state.particles.map((particle) => ({ ...particle })),
  };
}

function laneY(lane: number): number {
  return LANES[clamp(lane, 0, LANES.length - 1)]!;
}

function addParticle(state: LagoonState, text: string, x: number, y: number, color = '#ffe26b') {
  state.particles.push({ id: state.nextParticle, text, x, y, color, life: 0.78, maxLife: 0.78 });
  state.nextParticle += 1;
}

function hurt(state: LagoonState, amount: number, x: number, y: number) {
  if (state.invuln > 0) return;
  const boost = CAPITAL_GUARDIAN_BOOSTS[state.guardian];
  state.hp = Math.max(0, state.hp - amount * boost.damageTaken);
  state.invuln = 0.82;
  state.guardFlash = 0.28;
  addParticle(state, '-vida', x, y, '#ff786b');
}

function enemyRect(enemy: LagoonEnemy) {
  const y = laneY(enemy.lane);
  return { left: enemy.x, right: enemy.x + enemy.w, top: y - enemy.h, bottom: y };
}

function playerRect(state: LagoonState) {
  const y = laneY(state.lane);
  return { left: state.px + 22, right: state.px + 86, top: y - 118, bottom: y - 12 };
}

function projectileRect(projectile: LagoonProjectile) {
  return { left: projectile.x, right: projectile.x + PROJECTILE_W, top: projectile.y - PROJECTILE_H / 2, bottom: projectile.y + PROJECTILE_H / 2 };
}

function intersects(a: { left: number; right: number; top: number; bottom: number }, b: { left: number; right: number; top: number; bottom: number }) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function rewardEnemy(state: LagoonState, enemy: LagoonEnemy, label: string) {
  if (enemy.passed) return;
  enemy.passed = true;
  enemy.hp = 0;
  state.score += 130 + Math.round(enemy.maxHp * 0.5);
  state.energy = clamp(state.energy + 16 + CAPITAL_GUARDIAN_BOOSTS[state.guardian].energyGain, 0, CAPITAL_MAX_ENERGY);
  addParticle(state, label, enemy.x + enemy.w / 2, laneY(enemy.lane) - enemy.h - 14, '#8ef0c6');
}

function damageEnemy(state: LagoonState, enemy: LagoonEnemy, amount: number) {
  enemy.hp = Math.max(0, enemy.hp - amount);
  enemy.hitFlash = 0.18;
  addParticle(state, 'tiro', enemy.x + enemy.w / 2, laneY(enemy.lane) - enemy.h - 8, '#fff3a1');
  if (enemy.hp <= 0) rewardEnemy(state, enemy, '+geo');
}

function damageBoss(state: LagoonState, amount: number, canFinish: boolean) {
  const nextHp = state.bossHp - amount;
  state.bossHp = canFinish ? Math.max(0, nextHp) : Math.max(1, nextHp);
  state.bossShake = 0.24;
  state.energy = clamp(state.energy + (canFinish ? 0 : 6), 0, CAPITAL_MAX_ENERGY);
  addParticle(state, canFinish ? 'Quiz Geo' : 'rachou', BOSS_X + 96, laneY(1) - BOSS_H + 48, canFinish ? '#ffe26b' : '#fff3a1');
}

function fireShot(state: LagoonState) {
  if (state.attackCooldown > 0) return;
  state.attackTimer = 0.18;
  state.attackCooldown = 0.27;
  const y = laneY(state.lane) - 98;
  state.projectiles.push({
    id: state.nextProjectile,
    x: state.px + CAPITAL_PLAYER_W - 8,
    y,
    vx: PROJECTILE_SPEED,
    damage: ATTACK_DAMAGE + CAPITAL_GUARDIAN_BOOSTS[state.guardian].attack,
    life: 1.08,
  });
  state.nextProjectile += 1;
}

function spawnBossWave(state: LagoonState) {
  const variants: Array<Omit<LagoonEnemy, 'id' | 'maxHp' | 'passed' | 'hitFlash'>> = [
    { kind: 'mancha', name: 'Mancha Turva', concept: 'Agua poluida', x: BOSS_X - 60, lane: 1, w: 120, h: 92, hp: 56, damage: 13, drift: 180, image: manchaEsgotoImg },
    { kind: 'correnteza', name: 'Corrente Forte', concept: 'Mare puxando', x: BOSS_X - 30, lane: 0, w: 122, h: 96, hp: 52, damage: 12, drift: 198, image: correntezaCegaImg },
    { kind: 'turismo', name: 'Fluxo Desordenado', concept: 'Pressao turistica', x: BOSS_X - 20, lane: 2, w: 128, h: 102, hp: 54, damage: 12, drift: 174, image: turismoSemLimiteImg },
  ];
  const def = variants[state.nextEnemy % variants.length]!;
  state.enemies.push({ ...def, id: state.nextEnemy, maxHp: def.hp, passed: false, hitFlash: 0 });
  state.nextEnemy += 1;
}

function processShots(state: LagoonState, dt: number) {
  for (const projectile of state.projectiles) {
    projectile.x += projectile.vx * dt;
    projectile.life -= dt;
    if (projectile.life <= 0) continue;
    const shot = projectileRect(projectile);
    const target = state.enemies.find((enemy) => !enemy.passed && enemy.hp > 0 && intersects(shot, enemyRect(enemy)));
    if (target) {
      damageEnemy(state, target, projectile.damage);
      state.energy = clamp(state.energy + 5, 0, CAPITAL_MAX_ENERGY);
      projectile.life = 0;
      continue;
    }
    if (state.bossActive && state.bossHp > 0) {
      const boss = { left: BOSS_X + 24, right: BOSS_X + BOSS_W - 20, top: laneY(1) - BOSS_H + 34, bottom: laneY(1) - 10 };
      if (intersects(shot, boss)) {
        damageBoss(state, projectile.damage * 0.7, false);
        projectile.life = 0;
      }
    }
  }
  state.projectiles = state.projectiles.filter((projectile) => projectile.life > 0 && projectile.x > state.camera - 80 && projectile.x < state.camera + CAPITAL_VIEW_W + 120);
}

function stepLagoon(state: LagoonState, input: InputState, dt: number): StepResult {
  state.laneCooldown = Math.max(0, state.laneCooldown - dt);
  state.attackTimer = Math.max(0, state.attackTimer - dt);
  state.attackCooldown = Math.max(0, state.attackCooldown - dt);
  state.invuln = Math.max(0, state.invuln - dt);
  state.guardFlash = Math.max(0, state.guardFlash - dt);
  state.specialFlash = Math.max(0, state.specialFlash - dt);
  state.tideDamageCooldown = Math.max(0, state.tideDamageCooldown - dt);
  state.bossShake = Math.max(0, state.bossShake - dt);
  state.tideTime += dt;
  state.tideLevel = (Math.sin(state.tideTime * 0.92) + 1) / 2;

  if (input.jumpPressed && state.laneCooldown <= 0) {
    state.lane = clamp(state.lane - 1, 0, LANES.length - 1);
    state.laneCooldown = 0.18;
  }
  if (input.crouch && state.laneCooldown <= 0) {
    state.lane = clamp(state.lane + 1, 0, LANES.length - 1);
    state.laneCooldown = 0.18;
  }
  if (input.attackPressed) fireShot(state);
  if (input.specialPressed && state.energy >= CAPITAL_MAX_ENERGY) {
    input.jumpPressed = false;
    input.attackPressed = false;
    input.specialPressed = false;
    return 'quiz';
  }
  input.jumpPressed = false;
  input.attackPressed = false;
  input.specialPressed = false;

  const topSpeed = MAX_SPEED + CAPITAL_GUARDIAN_BOOSTS[state.guardian].speed;
  if (input.right) {
    state.vx += ACCEL * dt;
    state.facing = 1;
  }
  if (input.left) {
    state.vx -= ACCEL * dt;
    state.facing = -1;
  }
  if (!input.left && !input.right) {
    const friction = FRICTION * dt;
    if (Math.abs(state.vx) <= friction) state.vx = 0;
    else state.vx -= Math.sign(state.vx) * friction;
  }
  const passiveCurrent = 30 + state.tideLevel * 26;
  state.vx = clamp(state.vx, -120, topSpeed);
  state.px = clamp(state.px + (state.vx + passiveCurrent) * dt, 18, STAGE_W - 170);

  const riskyLowTide = state.tideLevel < 0.22 && state.lane === 0;
  const riskyHighTide = state.tideLevel > 0.78 && state.lane === 2;
  if ((riskyLowTide || riskyHighTide) && state.tideDamageCooldown <= 0) {
    hurt(state, 7, state.px + 74, laneY(state.lane) - 100);
    addParticle(state, riskyLowTide ? 'recife raso' : 'mare forte', state.px + 84, laneY(state.lane) - 136, '#9ee9ff');
    state.tideDamageCooldown = 1.1;
  }

  for (const marker of state.markers) {
    if (marker.collected) continue;
    if (marker.lane === state.lane && Math.abs(state.px + CAPITAL_PLAYER_W / 2 - marker.x) < 82) {
      marker.collected = true;
      state.score += 170;
      state.energy = clamp(state.energy + 22, 0, CAPITAL_MAX_ENERGY);
      addParticle(state, marker.label, marker.x, laneY(marker.lane) - 124, '#ffe26b');
    }
  }

  processShots(state, dt);

  const pbox = playerRect(state);
  for (const enemy of state.enemies) {
    if (enemy.passed || enemy.hp <= 0) continue;
    enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
    enemy.x -= enemy.drift * dt;
    if (enemy.x + enemy.w < state.camera - 100) {
      enemy.passed = true;
      continue;
    }
    if (!intersects(pbox, enemyRect(enemy))) continue;
    hurt(state, enemy.damage, enemy.x + enemy.w / 2, laneY(enemy.lane) - enemy.h / 2);
    enemy.passed = true;
  }
  state.enemies = state.enemies.filter((enemy) => !enemy.passed || enemy.x > state.camera - 180);

  const collectedAll = state.markers.every((marker) => marker.collected);
  const clearedBase = state.enemies.filter((enemy) => enemy.id < 60).every((enemy) => enemy.passed || enemy.hp <= 0);
  if (!state.bossActive && (state.px > BOSS_X - 500 || (collectedAll && clearedBase))) {
    state.bossActive = true;
    state.energy = CAPITAL_MAX_ENERGY;
    state.bossAttack = 1.0;
    addParticle(state, 'Guardiao Afogado', BOSS_X + 100, laneY(1) - BOSS_H - 12, '#ff786b');
  }

  if (state.bossActive && state.bossHp > 0) {
    state.bossAttack -= dt;
    if (state.bossAttack <= 0) {
      spawnBossWave(state);
      state.bossAttack = 1.35 + state.bossHp / state.bossMaxHp * 0.52;
    }
    if (state.px + CAPITAL_PLAYER_W > BOSS_X + 22 && state.px < BOSS_X + BOSS_W - 24) hurt(state, 14, BOSS_X + 96, laneY(1) - BOSS_H / 2);
  }

  for (const particle of state.particles) particle.life -= dt;
  state.particles = state.particles.filter((particle) => particle.life > 0);
  state.camera = clamp(state.px - 250, 0, STAGE_W - CAPITAL_VIEW_W);

  if (state.bossActive && state.bossHp <= 0) {
    state.bossHp = 0;
    state.score += 580;
    return 'victory';
  }
  if (state.hp <= 0) return 'defeat';
  return 'playing';
}

function playerStateFor(state: LagoonState): AnimationState {
  if (state.hp <= 0) return 'hit';
  if (state.attackTimer > 0) return 'attack';
  if (Math.abs(state.vx) > 16) return 'walk';
  return 'idle';
}

function starsFor(state: LagoonState): number {
  const hpRatio = state.hp / state.maxHp;
  const markerCount = state.markers.filter((marker) => marker.collected).length;
  if (hpRatio >= 0.68 && markerCount >= 4 && state.quizCorrect >= 2) return 3;
  if (hpRatio >= 0.34 && markerCount >= 3) return 2;
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
export function CapitalLagoonStage({ mission, completed, onComplete }: CapitalLagoonStageProps) {
  const [guardian, setGuardian] = useState<RegionId>('nordeste');
  const [snapshot, setSnapshot] = useState<LagoonState>(() => createState('nordeste'));
  const stateRef = useRef<LagoonState>(snapshot);
  const [phase, setPhase] = useState<Phase>('intro');
  const [question, setQuestion] = useState<CapitalSpecialQuestion | null>(null);
  const [stars, setStars] = useState(0);
  const [muted, setMutedState] = useState(isMuted());
  const renderElapsedRef = useRef(0);
  const victorySavedRef = useRef(false);
  const questionDeckRef = useRef<CapitalSpecialQuestion[]>([]);
  const lastQuestionIdRef = useRef<string | null>(null);
  const lastAnswerIndexRef = useRef<AnswerIndex | null>(null);
  const sfxRef = useRef({ hp: snapshot.hp, enemies: snapshot.enemies.length, markers: 0, boss: false });

  const { isTouch, isPortrait } = useDeviceMode();
  const needsRotate = isTouch && isPortrait;
  const active = phase === 'playing' && !needsRotate;
  const { inputRef, setButton } = useKeyboardControls(active);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const state = snapshot;
  const character = CHARACTERS[guardian];
  const hpRatio = Math.max(0, state.hp / state.maxHp);
  const energyRatio = Math.max(0, Math.min(1, state.energy / CAPITAL_MAX_ENERGY));
  const bossRatio = Math.max(0, state.bossHp / state.bossMaxHp);
  const progressRatio = clamp(state.px / (BOSS_X + BOSS_W), 0, 1);

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

  function publish() {
    setSnapshot(cloneState(stateRef.current));
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
    sfxRef.current = { hp: fresh.hp, enemies: fresh.enemies.length, markers: 0, boss: false };
    publish();
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

  function drawQuestion(): CapitalSpecialQuestion {
    const bank = CAPITAL_SPECIAL_QUESTIONS[mission.id].length > 0 ? CAPITAL_SPECIAL_QUESTIONS[mission.id] : CAPITAL_SPECIAL_QUESTIONS.salvador;
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

  function emitSfx(next: LagoonState) {
    const liveEnemies = next.enemies.filter((enemy) => !enemy.passed && enemy.hp > 0).length;
    const markerCount = next.markers.filter((marker) => marker.collected).length;
    if (next.hp < sfxRef.current.hp) playSound('hurt');
    if (liveEnemies < sfxRef.current.enemies) playSound('defeatEnemy');
    if (markerCount > sfxRef.current.markers) playSound('pickup');
    if (next.bossActive && !sfxRef.current.boss) playSound('bossAppear');
    sfxRef.current = { hp: next.hp, enemies: liveEnemies, markers: markerCount, boss: next.bossActive };
  }

  function handleStep(dt: number): boolean {
    const outcome = stepLagoon(stateRef.current, inputRef.current, dt);
    if (outcome === 'quiz') {
      setQuestion(drawQuestion());
      publish();
      setPhase('quiz');
      return false;
    }
    if (outcome === 'victory') {
      const nextStars = starsFor(stateRef.current);
      setStars(nextStars);
      playSound('victory');
      publish();
      setPhase('victory');
      return false;
    }
    if (outcome === 'defeat') {
      playSound('gameover');
      publish();
      setPhase('defeat');
      return false;
    }
    renderElapsedRef.current += dt;
    if (renderElapsedRef.current >= 1 / 30) {
      renderElapsedRef.current = 0;
      emitSfx(stateRef.current);
      publish();
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
      current.specialFlash = 0.62;
      current.score += 250;
      if (current.bossActive) {
        damageBoss(current, SPECIAL_DAMAGE + CAPITAL_GUARDIAN_BOOSTS[current.guardian].attack * 2, true);
        current.bossShake = 0.48;
      } else {
        const target = current.enemies.find((enemy) => !enemy.passed && enemy.hp > 0);
        if (target) damageEnemy(current, target, SPECIAL_DAMAGE);
      }
      addParticle(current, 'Raio Geo', current.px + 112, laneY(current.lane) - 122, '#ffe26b');
      playSound('special');
    } else {
      hurt(current, 16, current.px + 84, laneY(current.lane) - 94);
      playSound('hurt');
    }
    setQuestion(null);
    if (current.bossActive && current.bossHp <= 0) {
      setStars(starsFor(current));
      playSound('victory');
      publish();
      setPhase('victory');
      return;
    }
    if (current.hp <= 0) {
      playSound('gameover');
      publish();
      setPhase('defeat');
      return;
    }
    publish();
    setPhase('playing');
  }

  return (
    <section
      className="capital-play-root maceio-lagoon-root"
      style={{
        '--capital-stage-bg': `url(${maceioStageBg})`,
        '--region-color': character.themeColor,
      } as CSSProperties}
    >
      <div className={`capital-play-viewport maceio-lagoon-viewport ${state.specialFlash > 0 ? 'special-active' : ''}`} ref={viewportRef}>
        <div className="capital-play-scaler" style={worldStyle}>
          <div className="maceio-lagoon-world" style={{ width: STAGE_W, transform: `translateX(${-state.camera}px)` }}>
            <div className="maceio-lagoon-backdrop" style={{ width: STAGE_W }} />
            <div className="maceio-lagoon-glare" style={{ width: STAGE_W }} />
            <div className="maceio-lagoon-progress"><span style={{ width: `${progressRatio * 100}%` }} /></div>
            <div className="maceio-lagoon-tide" style={{ left: state.camera + 58 }}>
              <strong>{state.tideLevel > 0.72 ? 'Mare alta' : state.tideLevel < 0.28 ? 'Mare baixa' : 'Mare media'}</strong>
            </div>
            <div className="maceio-lagoon-lanes" style={{ width: STAGE_W }}>
              {LANES.map((y, index) => <div className={`maceio-lagoon-lane ${state.lane === index ? 'active' : ''}`} key={LANE_NAMES[index]} style={{ top: y - 28 }}><span>{LANE_NAMES[index]}</span></div>)}
            </div>
            <div className="maceio-lagoon-finish" style={{ left: BOSS_X + 36 }}><strong>Lagoa Mundau</strong><span>Finalize no quiz</span></div>

            {state.markers.map((marker) => (
              <div className={`maceio-lagoon-marker ${marker.collected ? 'collected' : ''}`} key={marker.id} style={{ left: marker.x, top: laneY(marker.lane) - 122 }}>
                <span>{marker.collected ? 'OK' : 'Geo'}</span>
                <strong>{marker.label}</strong>
                <small>{marker.concept}</small>
              </div>
            ))}

            {state.enemies.map((enemy) => {
              const ratio = Math.max(0, enemy.hp / enemy.maxHp);
              const wobble = enemy.hitFlash > 0 ? Math.sin(enemy.hitFlash * 90) * 7 : 0;
              return (
                <div
                  className={`maceio-lagoon-enemy maceio-lagoon-enemy-${enemy.kind} ${enemy.passed ? 'passed' : ''}`}
                  key={enemy.id}
                  style={{ left: enemy.x, top: laneY(enemy.lane) - enemy.h, width: enemy.w, height: enemy.h, transform: `translateX(${wobble}px)`, filter: enemy.hitFlash > 0 ? 'brightness(1.9) saturate(0.75)' : undefined }}
                >
                  <img src={enemy.image} alt="" aria-hidden />
                  <div className="maceio-lagoon-enemy-health"><span style={{ width: `${ratio * 100}%` }} /></div>
                  <strong>{enemy.name}</strong>
                  <small>{enemy.concept}</small>
                </div>
              );
            })}

            {state.bossActive && state.bossHp > 0 && (
              <div className="maceio-lagoon-boss" style={{ left: BOSS_X, top: laneY(1) - BOSS_H, width: BOSS_W, height: BOSS_H, transform: `translateX(${state.bossShake > 0 ? Math.sin(state.bossShake * 80) * 9 : 0}px)` }}>
                <img src={guardiaoAfogadoBoss} alt="" aria-hidden />
                <strong>Guardiao Afogado da Lagoa</strong>
              </div>
            )}

            {state.projectiles.map((projectile) => <span className="maceio-lagoon-shot" key={projectile.id} style={{ left: projectile.x, top: projectile.y }} />)}

            <span className="maceio-lagoon-raft" style={{ left: state.px + 12, top: laneY(state.lane) - 26 }} />
            <Player
              region={guardian}
              state={playerStateFor(state)}
              facing={state.facing}
              x={state.px}
              feetY={laneY(state.lane)}
              width={CAPITAL_PLAYER_W}
              height={CAPITAL_PLAYER_H}
              blinking={state.invuln > 0}
              guarding={state.guardFlash > 0}
              guardFlash={state.guardFlash > 0}
            />

            {state.specialFlash > 0 && (
              <div className="capital-special-burst facing-right" style={{ left: state.px + CAPITAL_PLAYER_W - 8, top: laneY(state.lane) - 112 }}>
                <span className="capital-special-burst-beam" />
                <span className="capital-special-burst-core" />
                <span className="capital-special-burst-ring ring-one" />
                <span className="capital-special-burst-ring ring-two" />
              </div>
            )}

            {state.particles.map((particle) => {
              const alpha = clamp(particle.life / particle.maxLife, 0, 1);
              const scaleValue = 0.82 + (1 - alpha) * 0.5;
              return <span className="capital-particle capital-particle-text" key={particle.id} style={{ left: particle.x, top: particle.y, opacity: alpha, color: particle.color, transform: `translate(-50%, -50%) scale(${scaleValue})` }}>{particle.text}</span>;
            })}
          </div>
        </div>

        {state.specialFlash > 0 && <div className="capital-special-screen-flash" />}
        <div className="maceio-lagoon-objective-panel">
          <strong>Jangada nas Piscinas Naturais</strong>
          <span>Troque de canal, atire nos obstaculos, leia a mare e finalize o boss com resposta correta.</span>
        </div>
      </div>

      <div className="capital-play-hud maceio-lagoon-hud">
        <div className="capital-hud-bars">
          <span className="capital-hud-name">{character.name} em Maceio</span>
          <div className="stage-bar stage-bar-health"><span style={{ width: `${hpRatio * 100}%` }} /><small>HP {Math.max(0, Math.round(state.hp))}</small></div>
          <div className={`stage-bar stage-bar-energy ${energyRatio >= 1 ? 'ready' : ''}`}><span style={{ width: `${energyRatio * 100}%` }} /><small>{energyRatio >= 1 ? 'Quiz Geo pronto' : 'Conhecimento em carga'}</small></div>
        </div>
        <div className="capital-hud-meta">
          <div><span>Marcos</span><strong>{state.markers.filter((marker) => marker.collected).length}/{state.markers.length}</strong></div>
          <div><span>Quiz</span><strong>{state.quizCorrect}/{state.quizTotal}</strong></div>
          <div><span>Pontos</span><strong>{state.score}</strong></div>
          <button className="stage-icon-btn" onClick={toggleMute}>{muted ? 'Sem som' : 'Som'}</button>
          <button className="stage-icon-btn" onClick={exitStage}>Sair</button>
        </div>
        {state.bossActive && state.bossHp > 0 && (
          <div className="capital-boss-hud enraged">
            <span>Guardiao Afogado da Lagoa</span>
            <div className="stage-bar stage-bar-boss"><span style={{ width: `${bossRatio * 100}%` }} /><small>Tiros enfraquecem; resposta certa finaliza</small></div>
          </div>
        )}
      </div>

      {isTouch && !needsRotate && <MobileControls setButton={setButton} attackVerb="Atirar" specialVerb="Quiz Geo" specialReady={energyRatio >= 1} />}

      {needsRotate && (
        <div className="stage-rotate" role="alertdialog" aria-label="Gire o celular">
          <div className="stage-rotate-card">
            <span className="stage-rotate-icon" aria-hidden>ROT</span>
            <h2>Gire o celular</h2>
            <p>A navegacao de Maceio foi pensada para jogar na horizontal.</p>
            <div className="stage-overlay-actions"><button className="btn-primary" onClick={() => void enterImmersiveMode()}>Usar tela cheia</button><button className="btn-secondary" onClick={exitStage}>Voltar</button></div>
          </div>
        </div>
      )}

      {phase === 'intro' && (
        <div className="stage-overlay">
          <div className="stage-overlay-card capital-intro-card maceio-lagoon-intro">
            <span className="eyebrow">{completed ? 'Rejogar capital' : 'Nova fase jogavel'}</span>
            <h2>Maceio: Jangada nas Piscinas Naturais</h2>
            <p className="stage-overlay-objective">Navegue por canais de mare, desvie dos recifes rasos, atire nos problemas da orla e derrote o Guardiao Afogado apenas com conhecimento geografico.</p>
            <div className="capital-guardian-select" aria-label="Escolha seu guardiao">
              {GUARDIAN_ORDER.map((id) => <button className={id === guardian ? 'active' : ''} key={id} type="button" onClick={() => chooseGuardian(id)}><span>{CHARACTERS[id].name}</span><small>{CAPITAL_GUARDIAN_BOOSTS[id].label}</small></button>)}
            </div>
            <ul className="stage-controls-help">
              <li><strong>A/D</strong> ou <strong>setas</strong> controlam a jangada no eixo da orla</li>
              <li><strong>Espaco/W</strong> sobe de canal; <strong>S</strong> desce de canal</li>
              <li><strong>J</strong> atira; <strong>K</strong> abre o Quiz Geo para finalizar o boss</li>
            </ul>
            <button className="btn-primary btn-large" onClick={startMission}>Comecar navegacao</button>
          </div>
        </div>
      )}

      {phase === 'quiz' && question && (
        <div className="stage-overlay">
          <div className="stage-overlay-card capital-quiz-card">
            <span className="eyebrow">Quiz Geo de Maceio</span>
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
            <h2>Maceio concluida</h2>
            <div className="stage-stars" aria-label={`${stars} de 3 estrelas`}>{[1, 2, 3].map((n) => <span className={n <= stars ? 'star on' : 'star'} key={n}>*</span>)}</div>
            <p>Voce leu a mare, protegeu recifes, conectou Pajucara, Ponta Verde, piscinas naturais e Lagoa Mundau.</p>
            <div className="stage-result-score"><strong>{state.score}</strong><span>pontos</span></div>
            <div className="stage-overlay-actions"><button className="btn-secondary" onClick={() => reset()}>Jogar de novo</button><button className="btn-primary btn-large" onClick={exitStage}>Voltar a rota</button></div>
          </div>
        </div>
      )}

      {phase === 'defeat' && (
        <div className="stage-overlay stage-overlay-defeat">
          <div className="stage-overlay-card">
            <span className="eyebrow">A jangada perdeu o canal</span>
            <h2>{character.name} foi vencido pela mare</h2>
            <p>Troque de canal cedo, atire nas manchas e ancoras, evite recife raso na mare baixa e finalize o boss com uma resposta certa.</p>
            <div className="stage-overlay-actions"><button className="btn-secondary" onClick={exitStage}>Voltar</button><button className="btn-primary btn-large" onClick={() => reset()}>Tentar de novo</button></div>
          </div>
        </div>
      )}
    </section>
  );
}