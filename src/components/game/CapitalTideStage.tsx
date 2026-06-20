import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import joaoPessoaStageBg from '../../assets/backgrounds/capital-joao-pessoa-stage-bg.png';
import sombraFalesiaBoss from '../../assets/bosses/capital-joao-pessoa-boss-sombra-falesia.png';
import falesiaInstavelImg from '../../assets/enemies/capital-joao-pessoa-enemy-falesia-instavel.png';
import mangueSufocadoImg from '../../assets/enemies/capital-joao-pessoa-enemy-mangue-sufocado.png';
import mareAltaImg from '../../assets/enemies/capital-joao-pessoa-enemy-mare-alta-viva.png';
import turismoPredatorioImg from '../../assets/enemies/capital-joao-pessoa-enemy-turismo-predatorio.png';
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
type TideEnemyKind = 'mare' | 'falesia' | 'mangue' | 'turismo';
type TideAction = 'jump' | 'crouch' | 'attack' | 'shield';
type StepResult = 'playing' | 'quiz' | 'victory' | 'defeat';

type TideEnemy = {
  id: number;
  kind: TideEnemyKind;
  name: string;
  concept: string;
  action: TideAction;
  x: number;
  feetY: number;
  w: number;
  h: number;
  hp: number;
  maxHp: number;
  damage: number;
  speed: number;
  image: string;
  passed: boolean;
  hitFlash: number;
};

type TideMarker = {
  id: string;
  label: string;
  concept: string;
  x: number;
  y: number;
  collected: boolean;
};

type TideParticle = { id: number; text: string; x: number; y: number; color: string; life: number; maxLife: number };

type TideProjectile = { id: number; x: number; y: number; vx: number; damage: number; life: number; direction: 1 | -1 };

type TideState = {
  guardian: RegionId;
  hp: number;
  maxHp: number;
  energy: number;
  score: number;
  px: number;
  pfeet: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  onGround: boolean;
  crouching: boolean;
  attackTimer: number;
  attackCooldown: number;
  invuln: number;
  shield: number;
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
  enemies: TideEnemy[];
  markers: TideMarker[];
  projectiles: TideProjectile[];
  particles: TideParticle[];
  quizCorrect: number;
  quizTotal: number;
  nextEnemy: number;
  nextProjectile: number;
  nextParticle: number;
};

interface CapitalTideStageProps {
  mission: CapitalMission;
  completed: boolean;
  onComplete: (result: CapitalMissionResult) => void;
}

const GUARDIAN_ORDER: RegionId[] = ['nordeste', 'norte', 'sudeste', 'centro-oeste', 'sul'];
const STAGE_W = 3100;
const GROUND_Y = 462;
const PLAYER_START_X = 116;
const BOSS_X = 2670;
const BOSS_W = 252;
const BOSS_H = 270;
const GRAVITY = 2300;
const MOVE_ACCEL = 1900;
const FRICTION = 1550;
const MAX_SPEED = 278;
const CROUCH_SPEED = 148;
const JUMP_SPEED = -770;
const ATTACK_DAMAGE = 42;
const PROJECTILE_SPEED = 720;
const PROJECTILE_W = 42;
const PROJECTILE_H = 16;
const SPECIAL_DAMAGE = 156;
const TIDE_LOW_Y = 520;
const TIDE_RANGE = 92;

const ENEMY_DEFS = [
  { kind: 'mare', name: 'Mare Alta Viva', concept: 'Ciclo das mares', action: 'shield', x: 520, feetY: 468, w: 118, h: 90, hp: 68, damage: 11, speed: 0, image: mareAltaImg },
  { kind: 'falesia', name: 'Falesia Instavel', concept: 'Erosao costeira', action: 'jump', x: 940, feetY: 464, w: 112, h: 128, hp: 76, damage: 13, speed: 0, image: falesiaInstavelImg },
  { kind: 'mangue', name: 'Mangue Sufocado', concept: 'Protecao ambiental', action: 'attack', x: 1490, feetY: 466, w: 122, h: 118, hp: 88, damage: 14, speed: 0, image: mangueSufocadoImg },
  { kind: 'turismo', name: 'Turismo Predatorio', concept: 'Uso da orla', action: 'crouch', x: 2050, feetY: 466, w: 132, h: 100, hp: 82, damage: 15, speed: 22, image: turismoPredatorioImg },
] satisfies Array<Omit<TideEnemy, 'id' | 'maxHp' | 'passed' | 'hitFlash'>>;

const MARKER_DEFS = [
  { id: 'ponta-seixas', label: 'Ponta do Seixas', concept: 'Extremo oriental', x: 390, y: 318 },
  { id: 'cabo-branco', label: 'Cabo Branco', concept: 'Falesias costeiras', x: 1080, y: 282 },
  { id: 'manguezal', label: 'Manguezal urbano', concept: 'Berco de vida', x: 1760, y: 318 },
  { id: 'recifes', label: 'Piscinas naturais', concept: 'Mare e recifes', x: 2360, y: 294 },
];

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function createEnemies(): TideEnemy[] {
  return ENEMY_DEFS.map((enemy, index) => ({ ...enemy, id: index + 1, maxHp: enemy.hp, passed: false, hitFlash: 0 }));
}

function createMarkers(): TideMarker[] {
  return MARKER_DEFS.map((marker) => ({ ...marker, collected: false }));
}

function createState(guardian: RegionId): TideState {
  const boost = CAPITAL_GUARDIAN_BOOSTS[guardian];
  const maxHp = 110 + boost.hp;
  return {
    guardian,
    hp: maxHp,
    maxHp,
    energy: 32,
    score: 0,
    px: PLAYER_START_X,
    pfeet: GROUND_Y,
    vx: 0,
    vy: 0,
    facing: 1,
    onGround: true,
    crouching: false,
    attackTimer: 0,
    attackCooldown: 0,
    invuln: 0,
    shield: 0,
    guardFlash: 0,
    specialFlash: 0,
    tideTime: 0,
    tideLevel: 0,
    tideDamageCooldown: 0,
    camera: 0,
    bossActive: false,
    bossHp: 430,
    bossMaxHp: 430,
    bossAttack: 1.4,
    bossShake: 0,
    enemies: createEnemies(),
    markers: createMarkers(),
    projectiles: [],
    particles: [],
    quizCorrect: 0,
    quizTotal: 0,
    nextEnemy: 50,
    nextProjectile: 1,
    nextParticle: 1,
  };
}
function cloneState(state: TideState): TideState {
  return {
    ...state,
    enemies: state.enemies.map((enemy) => ({ ...enemy })),
    markers: state.markers.map((marker) => ({ ...marker })),
    projectiles: state.projectiles.map((projectile) => ({ ...projectile })),
    particles: state.particles.map((particle) => ({ ...particle })),
  };
}

function tideSurfaceY(state: TideState): number {
  return TIDE_LOW_Y - state.tideLevel * TIDE_RANGE;
}

function addParticle(state: TideState, text: string, x: number, y: number, color = '#ffe26b') {
  state.particles.push({ id: state.nextParticle, text, x, y, color, life: 0.82, maxLife: 0.82 });
  state.nextParticle += 1;
}

function hurt(state: TideState, amount: number, x: number, y: number) {
  if (state.invuln > 0 || state.shield > 0 || state.crouching) {
    state.guardFlash = 0.34;
    addParticle(state, 'defesa', x, y, '#9ee9ff');
    return;
  }
  const boost = CAPITAL_GUARDIAN_BOOSTS[state.guardian];
  state.hp = Math.max(0, state.hp - amount * boost.damageTaken);
  state.invuln = 0.84;
  addParticle(state, '-vida', x, y, '#ff786b');
}

function rewardEnemy(state: TideState, enemy: TideEnemy, label: string) {
  if (enemy.passed) return;
  const boost = CAPITAL_GUARDIAN_BOOSTS[state.guardian];
  enemy.passed = true;
  enemy.hp = 0;
  state.score += 115 + Math.round(enemy.maxHp * 0.55);
  state.energy = clamp(state.energy + 16 + boost.energyGain, 0, CAPITAL_MAX_ENERGY);
  addParticle(state, label, enemy.x + enemy.w / 2, enemy.feetY - enemy.h - 18, '#8ef0c6');
}

function enemyRect(enemy: TideEnemy) {
  return { left: enemy.x, right: enemy.x + enemy.w, top: enemy.feetY - enemy.h, bottom: enemy.feetY };
}

function playerRect(state: TideState) {
  const height = state.crouching ? 70 : 126;
  return { left: state.px + 22, right: state.px + 82, top: state.pfeet - height, bottom: state.pfeet - 8 };
}

function intersects(a: ReturnType<typeof playerRect>, b: ReturnType<typeof enemyRect>): boolean {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function actionLabel(action: TideAction): string {
  if (action === 'jump') return 'pulo limpo';
  if (action === 'crouch') return 'abaixou';
  if (action === 'attack') return 'atire';
  return 'defesa de mare';
}

function damageEnemy(state: TideState, enemy: TideEnemy, amount: number, label: string) {
  enemy.hp = Math.max(0, enemy.hp - amount);
  enemy.hitFlash = 0.18;
  addParticle(state, label, enemy.x + enemy.w / 2, enemy.feetY - enemy.h - 10, '#fff3a1');
  if (enemy.hp <= 0) rewardEnemy(state, enemy, '+geo');
}

function damageBoss(state: TideState, amount: number, canFinish: boolean) {
  const nextHp = state.bossHp - amount;
  state.bossHp = canFinish ? Math.max(0, nextHp) : Math.max(1, nextHp);
  state.bossShake = 0.22;
  state.energy = clamp(state.energy + (canFinish ? 0 : 6), 0, CAPITAL_MAX_ENERGY);
  addParticle(state, canFinish ? 'Quiz Geo' : 'rachou', BOSS_X + 84, GROUND_Y - BOSS_H + 54, canFinish ? '#ffe26b' : '#fff3a1');
}

function projectileRect(projectile: TideProjectile) {
  return {
    left: projectile.x,
    right: projectile.x + PROJECTILE_W,
    top: projectile.y - PROJECTILE_H / 2,
    bottom: projectile.y + PROJECTILE_H / 2,
  };
}

function fireAttack(state: TideState) {
  if (state.attackCooldown > 0) return;
  state.attackTimer = 0.18;
  state.attackCooldown = 0.28;
  const direction = state.facing;
  const x = direction === 1 ? state.px + CAPITAL_PLAYER_W - 8 : state.px - PROJECTILE_W + 8;
  const y = state.pfeet - 104;
  state.projectiles.push({
    id: state.nextProjectile,
    x,
    y,
    vx: PROJECTILE_SPEED * direction,
    damage: ATTACK_DAMAGE + CAPITAL_GUARDIAN_BOOSTS[state.guardian].attack,
    life: 1.05,
    direction,
  });
  state.nextProjectile += 1;
}

function processProjectiles(state: TideState, dt: number) {
  for (const projectile of state.projectiles) {
    projectile.x += projectile.vx * dt;
    projectile.life -= dt;
    if (projectile.life <= 0) continue;

    const shotRect = projectileRect(projectile);
    const target = state.enemies.find((enemy) => !enemy.passed && enemy.hp > 0 && intersects(shotRect, enemyRect(enemy)));
    if (target) {
      damageEnemy(state, target, projectile.damage, 'tiro');
      state.energy = clamp(state.energy + 5 + CAPITAL_GUARDIAN_BOOSTS[state.guardian].energyGain, 0, CAPITAL_MAX_ENERGY);
      projectile.life = 0;
      continue;
    }

    if (state.bossActive && state.bossHp > 0) {
      const bossRect = { left: BOSS_X + 22, right: BOSS_X + BOSS_W - 20, top: GROUND_Y - BOSS_H + 34, bottom: GROUND_Y - 18 };
      if (intersects(shotRect, bossRect)) {
        damageBoss(state, projectile.damage * 0.72, false);
        projectile.life = 0;
      }
    }
  }

  state.projectiles = state.projectiles.filter((projectile) => (
    projectile.life > 0
    && projectile.x > state.camera - 90
    && projectile.x < state.camera + CAPITAL_VIEW_W + 110
  ));
}

function spawnBossWave(state: TideState) {
  const variants: Array<Omit<TideEnemy, 'id' | 'maxHp' | 'passed' | 'hitFlash'>> = [
    { kind: 'mare', name: 'Mare de Ressaca', concept: 'Avanco do mar', action: 'shield', x: BOSS_X - 80, feetY: 468, w: 120, h: 86, hp: 58, damage: 13, speed: 182, image: mareAltaImg },
    { kind: 'falesia', name: 'Pedra Solta', concept: 'Queda de barreira', action: 'jump', x: BOSS_X - 40, feetY: 462, w: 100, h: 112, hp: 54, damage: 12, speed: 146, image: falesiaInstavelImg },
    { kind: 'turismo', name: 'Fluxo Sem Limite', concept: 'Pressao turistica', action: 'crouch', x: BOSS_X - 20, feetY: 466, w: 126, h: 94, hp: 52, damage: 12, speed: 168, image: turismoPredatorioImg },
  ];
  const def = variants[state.nextEnemy % variants.length]!;
  state.enemies.push({ ...def, id: state.nextEnemy, maxHp: def.hp, passed: false, hitFlash: 0 });
  state.nextEnemy += 1;
}

function stepTide(state: TideState, input: InputState, dt: number): StepResult {
  state.attackTimer = Math.max(0, state.attackTimer - dt);
  state.attackCooldown = Math.max(0, state.attackCooldown - dt);
  state.invuln = Math.max(0, state.invuln - dt);
  state.shield = Math.max(0, state.shield - dt);
  state.guardFlash = Math.max(0, state.guardFlash - dt);
  state.specialFlash = Math.max(0, state.specialFlash - dt);
  state.bossShake = Math.max(0, state.bossShake - dt);
  state.tideDamageCooldown = Math.max(0, state.tideDamageCooldown - dt);
  state.crouching = input.crouch && state.onGround;

  const topSpeed = (state.crouching ? CROUCH_SPEED : MAX_SPEED) + CAPITAL_GUARDIAN_BOOSTS[state.guardian].speed;
  if (input.left) {
    state.vx -= MOVE_ACCEL * dt;
    state.facing = -1;
  }
  if (input.right) {
    state.vx += MOVE_ACCEL * dt;
    state.facing = 1;
  }
  if (!input.left && !input.right) {
    const friction = FRICTION * dt;
    if (Math.abs(state.vx) <= friction) state.vx = 0;
    else state.vx -= Math.sign(state.vx) * friction;
  }
  state.vx = clamp(state.vx, -topSpeed, topSpeed);

  if (input.jumpPressed && state.onGround && !state.crouching) {
    state.vy = JUMP_SPEED;
    state.onGround = false;
  }
  if (input.attackPressed) fireAttack(state);
  if (input.specialPressed && state.energy >= CAPITAL_MAX_ENERGY) {
    input.jumpPressed = false;
    input.attackPressed = false;
    input.specialPressed = false;
    return 'quiz';
  }
  input.jumpPressed = false;
  input.attackPressed = false;
  input.specialPressed = false;

  state.tideTime += dt;
  state.tideLevel = (Math.sin(state.tideTime * 1.05) + 1) / 2;
  state.px = clamp(state.px + state.vx * dt, 18, STAGE_W - 170);
  state.vy += GRAVITY * dt;
  state.pfeet += state.vy * dt;
  if (state.pfeet >= GROUND_Y) {
    state.pfeet = GROUND_Y;
    state.vy = 0;
    state.onGround = true;
  }
  const surfaceY = tideSurfaceY(state);
  if (state.onGround && surfaceY < GROUND_Y + 18 && state.tideDamageCooldown <= 0) {
    if (state.crouching) {
      state.guardFlash = 0.28;
      state.energy = clamp(state.energy + 2, 0, CAPITAL_MAX_ENERGY);
      addParticle(state, 'segurou a mare', state.px + 70, state.pfeet - 118, '#9ee9ff');
    } else {
      hurt(state, 8, state.px + 62, state.pfeet - 86);
    }
    state.tideDamageCooldown = 1.05;
  }

  for (const marker of state.markers) {
    if (marker.collected) continue;
    if (Math.abs(state.px + CAPITAL_PLAYER_W / 2 - marker.x) < 76 && Math.abs(state.pfeet - marker.y) < 176) {
      marker.collected = true;
      state.score += 170;
      state.energy = clamp(state.energy + 22, 0, CAPITAL_MAX_ENERGY);
      addParticle(state, marker.label, marker.x, marker.y - 32, '#ffe26b');
    }
  }

  processProjectiles(state, dt);

  const pbox = playerRect(state);
  for (const enemy of state.enemies) {
    if (enemy.passed || enemy.hp <= 0) continue;
    enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
    enemy.x -= enemy.speed * dt;

    if (enemy.x + enemy.w < state.camera - 80) {
      enemy.passed = true;
      continue;
    }

    if (!intersects(pbox, enemyRect(enemy))) continue;
    const safe = (enemy.action === 'jump' && !state.onGround)
      || (enemy.action === 'crouch' && state.crouching)
      || (enemy.action === 'attack' && state.attackTimer > 0)
      || (enemy.action === 'shield' && (state.crouching || state.shield > 0));

    if (safe) {
      rewardEnemy(state, enemy, actionLabel(enemy.action));
    } else {
      hurt(state, enemy.damage, enemy.x + enemy.w / 2, enemy.feetY - enemy.h / 2);
      enemy.hitFlash = 0.22;
      enemy.passed = true;
    }
  }

  state.enemies = state.enemies.filter((enemy) => !enemy.passed || enemy.x > state.camera - 170);

  const collectedAll = state.markers.every((marker) => marker.collected);
  const clearedBase = state.enemies.filter((enemy) => enemy.id < 50).every((enemy) => enemy.passed || enemy.hp <= 0);
  if (!state.bossActive && (state.px > BOSS_X - 450 || (collectedAll && clearedBase))) {
    state.bossActive = true;
    state.energy = CAPITAL_MAX_ENERGY;
    state.bossAttack = 1.0;
    addParticle(state, 'Sombra da Falesia', BOSS_X + 110, GROUND_Y - BOSS_H - 12, '#ff786b');
  }

  if (state.bossActive && state.bossHp > 0) {
    state.bossAttack -= dt;
    if (state.bossAttack <= 0) {
      spawnBossWave(state);
      state.bossAttack = 1.45 + state.bossHp / state.bossMaxHp * 0.45;
    }
    const bossTouch = state.px + CAPITAL_PLAYER_W > BOSS_X + 20 && state.px < BOSS_X + BOSS_W - 24;
    if (bossTouch) hurt(state, 13, BOSS_X + 90, GROUND_Y - BOSS_H / 2);
  }

  for (const particle of state.particles) particle.life -= dt;
  state.particles = state.particles.filter((particle) => particle.life > 0);
  state.camera = clamp(state.px - 250, 0, STAGE_W - CAPITAL_VIEW_W);

  if (state.bossActive && state.bossHp <= 0) {
    state.bossHp = 0;
    state.score += 560;
    return 'victory';
  }
  if (state.hp <= 0) return 'defeat';
  return 'playing';
}

function playerStateFor(state: TideState): AnimationState {
  if (state.hp <= 0) return 'hit';
  if (state.attackTimer > 0) return 'attack';
  if (!state.onGround) return 'jump';
  if (state.crouching) return 'crouch';
  if (Math.abs(state.vx) > 12) return 'walk';
  return 'idle';
}

function starsFor(state: TideState): number {
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

export function CapitalTideStage({ mission, completed, onComplete }: CapitalTideStageProps) {
  const [guardian, setGuardian] = useState<RegionId>('nordeste');
  const [snapshot, setSnapshot] = useState<TideState>(() => createState('nordeste'));
  const stateRef = useRef<TideState>(snapshot);
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
  const tideY = tideSurfaceY(state);

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

  function emitSfx(next: TideState) {
    const liveEnemies = next.enemies.filter((enemy) => !enemy.passed && enemy.hp > 0).length;
    const markerCount = next.markers.filter((marker) => marker.collected).length;
    if (next.hp < sfxRef.current.hp) playSound('hurt');
    if (liveEnemies < sfxRef.current.enemies) playSound('defeatEnemy');
    if (markerCount > sfxRef.current.markers) playSound('pickup');
    if (next.bossActive && !sfxRef.current.boss) playSound('bossAppear');
    sfxRef.current = { hp: next.hp, enemies: liveEnemies, markers: markerCount, boss: next.bossActive };
  }

  function handleStep(dt: number): boolean {
    const outcome = stepTide(stateRef.current, inputRef.current, dt);
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
      current.shield = 1.8;
      current.score += 240;
      if (current.bossActive) {
        damageBoss(current, SPECIAL_DAMAGE + CAPITAL_GUARDIAN_BOOSTS[current.guardian].attack * 2, true);
        current.bossShake = 0.48;
      } else {
        const target = current.enemies.find((enemy) => !enemy.passed && enemy.hp > 0);
        if (target) damageEnemy(current, target, SPECIAL_DAMAGE, 'raio geo');
      }
      addParticle(current, 'Raio Geo', current.px + 112, current.pfeet - 132, '#ffe26b');
      playSound('special');
    } else {
      hurt(current, 16, current.px + 84, current.pfeet - 94);
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
      className="capital-play-root joao-tide-root"
      style={{
        '--capital-stage-bg': `url(${joaoPessoaStageBg})`,
        '--region-color': character.themeColor,
      } as CSSProperties}
    >
      <div className={`capital-play-viewport joao-tide-viewport ${state.specialFlash > 0 ? 'special-active' : ''}`} ref={viewportRef}>
        <div className="capital-play-scaler" style={worldStyle}>
          <div className="joao-tide-world" style={{ transform: `translateX(${-state.camera}px)` }}>
            <div className="joao-tide-backdrop" style={{ width: STAGE_W }} />
            <div className="joao-tide-sun" style={{ left: 720 + state.camera * 0.08 }} />
            <div className="joao-tide-progress"><span style={{ width: `${progressRatio * 100}%` }} /></div>
            <div className="joao-tide-ground" style={{ width: STAGE_W }} />
            <div className="joao-tide-water" style={{ width: STAGE_W, top: tideY }}><span>Mare {state.tideLevel > 0.68 ? 'alta' : state.tideLevel < 0.32 ? 'baixa' : 'subindo'}</span></div>
            <div className="joao-tide-finish" style={{ left: BOSS_X + 44 }}><strong>Ponto Oriental</strong><span>Quebre a sombra</span></div>

            {state.markers.map((marker) => (
              <div className={`joao-tide-marker ${marker.collected ? 'collected' : ''}`} key={marker.id} style={{ left: marker.x, top: marker.y }}>
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
                  className={`joao-tide-enemy joao-tide-enemy-${enemy.kind} ${enemy.passed ? 'passed' : ''}`}
                  key={enemy.id}
                  style={{ left: enemy.x, top: enemy.feetY - enemy.h, width: enemy.w, height: enemy.h, transform: `translateX(${wobble}px)`, filter: enemy.hitFlash > 0 ? 'brightness(1.9) saturate(0.75)' : undefined }}
                >
                  <img src={enemy.image} alt="" aria-hidden />
                  <div className="joao-tide-enemy-health"><span style={{ width: `${ratio * 100}%` }} /></div>
                  <strong>{enemy.name}</strong>
                  <small>{actionLabel(enemy.action)}</small>
                </div>
              );
            })}

            {state.bossActive && state.bossHp > 0 && (
              <div
                className="joao-tide-boss"
                style={{ left: BOSS_X, top: GROUND_Y - BOSS_H, width: BOSS_W, height: BOSS_H, transform: `translateX(${state.bossShake > 0 ? Math.sin(state.bossShake * 80) * 9 : 0}px)` }}
              >
                <img src={sombraFalesiaBoss} alt="" aria-hidden />
                <strong>Sombra da Falesia</strong>
              </div>
            )}

            {state.projectiles.map((projectile) => (
              <span
                className={`joao-tide-shot ${projectile.direction === -1 ? 'left' : 'right'}`}
                key={projectile.id}
                style={{ left: projectile.x, top: projectile.y }}
              />
            ))}
            <Player
              region={guardian}
              state={playerStateFor(state)}
              facing={state.facing}
              x={state.px}
              feetY={state.pfeet}
              width={CAPITAL_PLAYER_W}
              height={CAPITAL_PLAYER_H}
              blinking={state.invuln > 0}
              guarding={state.crouching || state.shield > 0}
              guardFlash={state.guardFlash > 0 || state.shield > 0}
            />

            {state.specialFlash > 0 && (
              <div className="capital-special-burst facing-right" style={{ left: state.px + CAPITAL_PLAYER_W - 8, top: state.pfeet - 112 }}>
                <span className="capital-special-burst-beam" />
                <span className="capital-special-burst-core" />
                <span className="capital-special-burst-ring ring-one" />
                <span className="capital-special-burst-ring ring-two" />
              </div>
            )}

            {state.particles.map((particle) => {
              const alpha = clamp(particle.life / particle.maxLife, 0, 1);
              const scaleValue = 0.82 + (1 - alpha) * 0.5;
              return (
                <span className="capital-particle capital-particle-text" key={particle.id} style={{ left: particle.x, top: particle.y, opacity: alpha, color: particle.color, transform: `translate(-50%, -50%) scale(${scaleValue})` }}>
                  {particle.text}
                </span>
              );
            })}
          </div>
        </div>

        {state.specialFlash > 0 && <div className="capital-special-screen-flash" />}
        <div className="joao-tide-objective-panel">
          <strong>Mare do Amanhecer</strong>
          <span>Avance, leia a mare, atire nos inimigos, abaixe para defender e use o Quiz Geo contra o chefao.</span>
        </div>
      </div>

      <div className="capital-play-hud joao-tide-hud">
        <div className="capital-hud-bars">
          <span className="capital-hud-name">{character.name} em Joao Pessoa</span>
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
            <span>Sombra da Falesia</span>
            <div className="stage-bar stage-bar-boss"><span style={{ width: `${bossRatio * 100}%` }} /><small>Tiros enfraquecem; resposta certa finaliza</small></div>
          </div>
        )}
      </div>

      {isTouch && !needsRotate && <MobileControls setButton={setButton} attackVerb="Atirar" specialVerb="Raio Geo" specialReady={energyRatio >= 1} />}

      {needsRotate && (
        <div className="stage-rotate" role="alertdialog" aria-label="Gire o celular">
          <div className="stage-rotate-card">
            <span className="stage-rotate-icon" aria-hidden>ROT</span>
            <h2>Gire o celular</h2>
            <p>A Mare do Amanhecer foi pensada para jogar na horizontal.</p>
            <div className="stage-overlay-actions"><button className="btn-primary" onClick={() => void enterImmersiveMode()}>Usar tela cheia</button><button className="btn-secondary" onClick={exitStage}>Voltar</button></div>
          </div>
        </div>
      )}

      {phase === 'intro' && (
        <div className="stage-overlay">
          <div className="stage-overlay-card capital-intro-card joao-tide-intro">
            <span className="eyebrow">{completed ? 'Rejogar capital' : 'Nova fase jogavel'}</span>
            <h2>Joao Pessoa: Mare do Amanhecer</h2>
            <p className="stage-overlay-objective">Controle o guardiao pela orla, use a mare como ameaca real e transforme respostas certas em raio geografico contra a Sombra da Falesia.</p>
            <div className="capital-guardian-select" aria-label="Escolha seu guardiao">
              {GUARDIAN_ORDER.map((id) => (
                <button className={id === guardian ? 'active' : ''} key={id} type="button" onClick={() => chooseGuardian(id)}><span>{CHARACTERS[id].name}</span><small>{CAPITAL_GUARDIAN_BOOSTS[id].label}</small></button>
              ))}
            </div>
            <ul className="stage-controls-help">
              <li><strong>A/D</strong> ou <strong>setas</strong> andam pela orla; o cenario nao corre sozinho</li>
              <li><strong>Espaco</strong> pula barreiras, <strong>S</strong> abaixa e defende contra mare alta</li>
              <li><strong>J</strong> atira nos inimigos; <strong>K</strong> abre o Quiz Geo quando a barra encher</li>
            </ul>
            <button className="btn-primary btn-large" onClick={startMission}>Comecar fase</button>
          </div>
        </div>
      )}

      {phase === 'quiz' && question && (
        <div className="stage-overlay">
          <div className="stage-overlay-card capital-quiz-card">
            <span className="eyebrow">Quiz Geo de Joao Pessoa</span>
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
            <h2>Joao Pessoa concluida</h2>
            <div className="stage-stars" aria-label={`${stars} de 3 estrelas`}>{[1, 2, 3].map((n) => <span className={n <= stars ? 'star on' : 'star'} key={n}>*</span>)}</div>
            <p>Voce conectou Ponta do Seixas, Cabo Branco, manguezais, recifes, mare e planejamento costeiro em uma fase de defesa e leitura de ambiente.</p>
            <div className="stage-result-score"><strong>{state.score}</strong><span>pontos</span></div>
            <div className="stage-overlay-actions"><button className="btn-secondary" onClick={() => reset()}>Jogar de novo</button><button className="btn-primary btn-large" onClick={exitStage}>Voltar a rota</button></div>
          </div>
        </div>
      )}

      {phase === 'defeat' && (
        <div className="stage-overlay stage-overlay-defeat">
          <div className="stage-overlay-card">
            <span className="eyebrow">A mare virou</span>
            <h2>{character.name} caiu na pressao costeira</h2>
            <p>Abaixe quando a mare subir, pule a falesia, atire nos inimigos e finalize a Sombra da Falesia com uma resposta certa do Quiz Geo.</p>
            <div className="stage-overlay-actions"><button className="btn-secondary" onClick={exitStage}>Voltar</button><button className="btn-primary btn-large" onClick={() => reset()}>Tentar de novo</button></div>
          </div>
        </div>
      )}
    </section>
  );
}