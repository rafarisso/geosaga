import { CHARACTERS } from '../../data/characters';
import { DIFFICULTIES } from '../../data/difficulty';
import { getProblem } from '../../data/regionalProblems';
import { REGIONS } from '../../data/regions';
import { STAGES } from '../../data/stages';
import type {
  AnimationState,
  BossDefinition,
  EnemyBehavior,
  GameDifficulty,
  HazardDef,
  PlatformDef,
  RegionId,
  RegionalProblem,
} from '../../data/types';
import type { InputState } from '../../hooks/useKeyboardControls';

export const VIEW_W = 960;
export const VIEW_H = 540;
export const STAGE_WIDTH = 2600;
export const GROUND_Y = 470;
export const PLAYER_W = 104;
export const PLAYER_H = 168;
export const ENEMY_SIZE = 96;
export const BOSS_W = 150;
export const BOSS_H = 168;
export const MAX_ENERGY = 100;

const GRAVITY = 2400;
const PLAYER_HITBOX_W = 58;
const PLAYER_PROJECTILE_HITBOX_H = 64;
const PLAYER_CROUCH_HITBOX_H = 42;
const PLAYER_CROUCH_SPEED = 0.42;
const GUARD_FLASH_TIME = 0.22;
const GUARD_ENERGY_GAIN = 8;
const ENEMY_HITBOX_W = 70;
const ATTACK_DURATION = 0.18;
const ATTACK_COOLDOWN = 0.34;
const HIT_INVULN = 1;
const ENERGY_PER_HIT = 22;
const ENERGY_ON_KILL = 14;
const SPECIAL_COST = MAX_ENERGY;

const PROJECTILE_SPEED = 660;
const PROJECTILE_LIFE = 0.72;
const PROJECTILE_R = 30;
const ENEMY_APPROACH_SPEED = 34;
const ENEMY_ATTACK_RANGE = 440;
const ENEMY_PROJ_SPEED = 250;
const ENEMY_PROJ_R = 19;
const ENEMY_ATTACK_INTERVAL = 3;
const BOSS_SPEED = 80;
const BOSS_HOVER = GROUND_Y - 24;
const SPECIAL_BOSS_FACTOR = 3.5;
const DEFAULT_HAZARD_DAMAGE = 6;

// Entrada cinematográfica do chefe: ele voa para dentro da tela enquanto o
// tempo corre em câmera lenta (bullet time), valorizando o momento.
const BOSS_INTRO_TIME = 1.6;
const BOSS_INTRO_TIMESCALE = 0.4;
// Telegrafia: o chefe "carrega" antes de cada disparo, dando uma janela justa
// para o jogador desviar.
const BOSS_TELEGRAPH = 0.5;
// Segunda fase do chefe: abaixo desta fração de vida ele fica furioso (mais
// rápido, ataca com mais frequência e troca para um padrão mais agressivo).
const BOSS_ENRAGE_THRESHOLD = 0.5;
const BOSS_ENRAGE_SPEED = 1.45;
const BOSS_ENRAGE_INTERVAL = 0.62;
// Combo: restaurar problemas em sequência rápida multiplica os pontos.
const COMBO_WINDOW = 3;
const COMBO_MAX = 5;

// Pulo de cabeça (stomp): pisar no topo de um problema causa dano e dá um quique.
const STOMP_BAND = 42;
const STOMP_MIN_FALL = 80;
const STOMP_BOUNCE = 760;
const STOMP_DAMAGE_FACTOR = 1.4;

// Comportamentos de inimigo: modificadores de aproximação e tiro.
const RUSHER_APPROACH = 2.1;
const TURRET_INTERVAL_FACTOR = 0.62;
const ENEMY_JUMP_GRAVITY = 1700;
const ENEMY_JUMP_IMPULSE = 560;
const ENEMY_JUMP_INTERVAL = 1.9;

// Itens deixados pelos problemas restaurados (cura / conhecimento).
const PICKUP_DROP_CHANCE = 0.34;
const PICKUP_GRAVITY = 1400;
const PICKUP_R = 26;
const PICKUP_HEAL = 22;
const PICKUP_ENERGY = 40;

/** Quando furioso, o chefe troca o padrão de ataque por um mais agressivo. */
const ENRAGED_PATTERN: Record<BossDefinition['attackPattern'], BossDefinition['attackPattern']> = {
  single: 'spread',
  double: 'barrage',
  spread: 'barrage',
  barrage: 'barrage',
};

export type StepOutcome = 'playing' | 'requestSpecial' | 'bossIncoming' | 'victory' | 'defeat';

interface PlayerWorld {
  x: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  onGround: boolean;
  hp: number;
  maxHp: number;
  energy: number;
  state: AnimationState;
  crouching: boolean;
  guardFlash: number;
  stateTimer: number;
  attackTimer: number;
  attackCooldown: number;
  invuln: number;
  feetY: number;
}

interface EnemyWorld {
  key: string;
  problem: RegionalProblem;
  behavior: EnemyBehavior;
  baseX: number;
  x: number;
  feetY: number;
  hp: number;
  maxHp: number;
  contactDamage: number;
  alive: boolean;
  hitFlash: number;
  phase: number;
  shake: number;
  attackTimer: number;
  /** Estado vertical usado pelo comportamento `jumper`. `jumpHeight` ≤ 0 = altura acima do solo. */
  jumpVy: number;
  jumpTimer: number;
  jumpHeight: number;
}

type PickupKind = 'heal' | 'energy';

interface Pickup {
  id: number;
  kind: PickupKind;
  x: number;
  y: number;
  vy: number;
  grounded: boolean;
  life: number;
}

export interface PickupView {
  id: number;
  kind: PickupKind;
  x: number;
  y: number;
}

interface BossWorld {
  def: BossDefinition;
  x: number;
  feetY: number;
  vx: number;
  phase: number;
  hp: number;
  maxHp: number;
  contactDamage: number;
  hitFlash: number;
  shake: number;
  attackTimer: number;
  alive: boolean;
  /** Tempo restante da entrada cinematográfica (voo + câmera lenta). */
  introTimer: number;
  /** Tempo restante de "carga" antes do próximo disparo (telegrafia). */
  windup: number;
  /** Verdadeiro depois que o chefe cruza o limiar de fúria (2ª fase). */
  enraged: boolean;
}

interface Projectile {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  /** 'player' = onda; 'enemy' = ataque inimigo/chefe. */
  team: 'player' | 'enemy';
  damage: number;
}

type ParticleKind = 'damage' | 'spark' | 'restore';

interface Particle {
  id: number;
  kind: ParticleKind;
  x: number;
  y: number;
  vy: number;
  life: number;
  maxLife: number;
  text: string;
  color: string;
}

export interface ProjectileView {
  id: number;
  x: number;
  y: number;
  r: number;
  color: string;
  team: 'player' | 'enemy';
}

export interface ParticleView {
  id: number;
  kind: ParticleKind;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  scale: number;
}

export interface BossView {
  name: string;
  image?: string;
  emoji?: string;
  color: string;
  visual?: BossDefinition['visual'];
  x: number;
  feetY: number;
  hp: number;
  maxHp: number;
  hitFlash: number;
  shake: number;
  /** Entrando em cena (voo + câmera lenta): bloqueia interação. */
  intro: boolean;
  /** Carregando um ataque: dá o "tell" visual para o jogador desviar. */
  charging: boolean;
  /** Em fúria (2ª fase): muda o visual e a intensidade. */
  enraged: boolean;
}

type HazardView = HazardDef & { restored: boolean };

export interface View {
  px: number;
  pfeet: number;
  pstate: AnimationState;
  pfacing: 1 | -1;
  guarding: boolean;
  guardFlash: boolean;
  hp: number;
  maxHp: number;
  energy: number;
  blinking: boolean;
  camera: number;
  score: number;
  shakeX: number;
  shakeY: number;
  hasFired: boolean;
  bossActive: boolean;
  bossBanner: string | null;
  /** Verdadeiro durante a entrada do chefe (câmera lenta) — usado para vinheta. */
  slowmo: boolean;
  /** Combo atual de problemas restaurados em sequência (0 = sem combo). */
  combo: number;
  /** Multiplicador de pontos em vigor pelo combo (1–COMBO_MAX). */
  comboMultiplier: number;
  /** Total de itens já coletados (a UI dispara o som ao ver o número crescer). */
  pickupsCollected: number;
  enemiesRemaining: number;
  enemies: {
    key: string;
    problem: RegionalProblem;
    behavior: EnemyBehavior;
    x: number;
    feetY: number;
    hp: number;
    maxHp: number;
    hitFlash: number;
    shake: number;
  }[];
  boss: BossView | null;
  projectiles: ProjectileView[];
  particles: ParticleView[];
  pickups: PickupView[];
  platforms: PlatformDef[];
  hazards: HazardView[];
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

/**
 * Motor da fase 2D: simula jogador, problemas regionais (que avançam e atacam),
 * o chefe da região (só derrotado com o golpe especial do quiz), plataformas,
 * zonas de perigo e partículas. Vive fora do React para que a UI só leia
 * snapshots (`view()`).
 */
export class StageEngine {
  private player: PlayerWorld;
  private enemies: EnemyWorld[];
  private boss: BossWorld;
  private projectiles: Projectile[] = [];
  private particles: Particle[] = [];
  private pickups: Pickup[] = [];
  private camera = 0;
  private score = 0;
  private time = 0;
  private shotsFired = 0;
  private shake = 0;
  private bossActive = false;
  private bossBannerTimer = 0;
  private bossBannerText = '';
  private specialsTried = 0;
  private specialsCorrect = 0;
  private comboCount = 0;
  private comboTimer = 0;
  /** Contador monotônico de itens coletados — a UI usa a diferença para tocar o som. */
  private pickupsCollected = 0;
  private nextId = 1;
  private readonly stats: (typeof CHARACTERS)[RegionId]['stats'];
  private readonly accent: string;
  private readonly platforms: PlatformDef[];
  private readonly hazards: HazardDef[];
  private readonly movement: (typeof STAGES)[RegionId]['movement'];
  private readonly restoredHazards = new Set<string>();

  constructor(region: RegionId, difficulty: GameDifficulty = 'normal') {
    const character = CHARACTERS[region];
    const stage = STAGES[region];
    const tuning = DIFFICULTIES[difficulty];
    // A dificuldade da fase combina com o nível escolhido pelo jogador.
    const diff = stage.difficulty * tuning.enemyScale;
    this.stats = character.stats;
    this.accent = REGIONS[region].accentColor;
    this.platforms = stage.platforms;
    this.hazards = stage.hazards;
    this.movement = stage.movement;

    this.enemies = stage.enemyIds.flatMap((id, index) => {
      const problem = getProblem(id);
      if (!problem) return [];
      const enemy: EnemyWorld = {
        key: `${id}-${index}`,
        problem,
        behavior: problem.behavior ?? 'chaser',
        baseX: stage.enemySpawns[index] ?? 640 + index * 520,
        x: stage.enemySpawns[index] ?? 640 + index * 520,
        feetY: GROUND_Y,
        hp: Math.round(problem.hp * diff),
        maxHp: Math.round(problem.hp * diff),
        contactDamage: Math.round(problem.contactDamage * diff),
        alive: true,
        hitFlash: 0,
        phase: index * 1.3,
        shake: 0,
        attackTimer: ENEMY_ATTACK_INTERVAL + index * 0.7,
        jumpVy: 0,
        jumpTimer: ENEMY_JUMP_INTERVAL + index * 0.5,
        jumpHeight: 0,
      };
      return [enemy];
    });

    this.boss = {
      def: stage.boss,
      x: STAGE_WIDTH - 360,
      feetY: BOSS_HOVER,
      vx: 0,
      phase: 0,
      hp: stage.boss.hp,
      maxHp: stage.boss.hp,
      contactDamage: Math.round(stage.boss.contactDamage * diff),
      hitFlash: 0,
      shake: 0,
      attackTimer: stage.boss.attackInterval,
      alive: false,
      introTimer: 0,
      windup: 0,
      enraged: false,
    };

    const playerHp = Math.round(character.stats.vida * tuning.playerHpScale);
    this.player = {
      x: 120,
      vx: 0,
      vy: 0,
      facing: 1,
      onGround: true,
      hp: playerHp,
      maxHp: playerHp,
      energy: 0,
      state: 'idle',
      crouching: false,
      guardFlash: 0,
      stateTimer: 0,
      attackTimer: 0,
      attackCooldown: 0,
      invuln: 0,
      feetY: GROUND_Y,
    };
  }

  get totalEnemies(): number {
    return this.enemies.length;
  }

  get currentScore(): number {
    return this.score;
  }

  canSpecial(): boolean {
    return this.player.energy >= SPECIAL_COST;
  }

  /** Estrelas (0–3): vitória + vida preservada + bom desempenho no quiz. */
  starsEarned(): number {
    let stars = 1;
    if (this.player.hp >= this.player.maxHp * 0.5) stars += 1;
    if (this.specialsTried >= 2 && this.specialsCorrect / this.specialsTried >= 0.7) stars += 1;
    return stars;
  }

  private spawnDamage(x: number, y: number, amount: number, color: string): void {
    this.particles.push({
      id: this.nextId++,
      kind: 'damage',
      x,
      y,
      vy: -70,
      life: 0.8,
      maxLife: 0.8,
      text: `-${Math.round(amount)}`,
      color,
    });
  }

  private spawnSpark(x: number, y: number, color: string): void {
    this.particles.push({
      id: this.nextId++,
      kind: 'spark',
      x,
      y,
      vy: 0,
      life: 0.32,
      maxLife: 0.32,
      text: '',
      color,
    });
  }

  private spawnText(x: number, y: number, text: string, color: string): void {
    this.particles.push({
      id: this.nextId++,
      kind: 'restore',
      x,
      y,
      vy: -40,
      life: 1,
      maxLife: 1,
      text,
      color,
    });
  }

  private isHazardRestored(hazard: HazardDef): boolean {
    return Boolean(hazard.id && this.restoredHazards.has(hazard.id));
  }

  private restoreHazardsFor(problemId: string): void {
    for (const hazard of this.hazards) {
      if (!hazard.id || hazard.restoreWith !== problemId || this.restoredHazards.has(hazard.id)) continue;
      this.restoredHazards.add(hazard.id);
      this.score += 80;
      this.spawnText(
        hazard.x + hazard.width / 2,
        GROUND_Y - 52,
        hazard.restoredLabel ?? 'Área recuperada',
        this.accent,
      );
    }
  }

  /** Multiplicador de pontos atual conforme o combo (1–COMBO_MAX). */
  private comboMultiplier(): number {
    return clamp(this.comboCount, 1, COMBO_MAX);
  }

  /** Solta às vezes um item de cura ou energia onde o problema foi restaurado. */
  private maybeDropPickup(x: number, y: number): void {
    if (Math.random() > PICKUP_DROP_CHANCE) return;
    // Sem vida cheia, prioriza cura; senão, conhecimento. Empate decidido por sorteio.
    const wantsHeal = this.player.hp < this.player.maxHp * 0.7;
    const kind: PickupKind = wantsHeal ? (Math.random() < 0.7 ? 'heal' : 'energy') : 'energy';
    this.pickups.push({ id: this.nextId++, kind, x, y, vy: -120, grounded: false, life: 9 });
  }

  private damageEnemy(enemy: EnemyWorld, amount: number, knock: number): void {
    enemy.hp -= amount;
    enemy.hitFlash = 0.18;
    enemy.shake = 0.25;
    const cx = enemy.x + ENEMY_SIZE / 2;
    const cy = enemy.feetY - ENEMY_SIZE * 0.7;
    this.spawnDamage(cx, cy, amount, '#fff3a1');
    this.spawnSpark(cx, cy, this.accent);
    if (enemy.hp <= 0) {
      enemy.alive = false;
      // Combo: cada restauração dentro da janela aumenta o multiplicador.
      this.comboCount += 1;
      this.comboTimer = COMBO_WINDOW;
      const mult = this.comboMultiplier();
      this.score += 100 * mult;
      this.spawnText(cx, cy - 10, mult > 1 ? `Restaurado! x${mult}` : 'Restaurado!', this.accent);
      this.restoreHazardsFor(enemy.problem.id);
      this.player.energy = Math.min(MAX_ENERGY, this.player.energy + ENERGY_ON_KILL);
      this.maybeDropPickup(cx, enemy.feetY - ENEMY_SIZE / 2);
    } else {
      enemy.baseX = clamp(enemy.baseX + knock * 16, 120, STAGE_WIDTH - ENEMY_SIZE);
    }
  }

  private damageBoss(amount: number): void {
    const boss = this.boss;
    boss.hp -= amount;
    boss.hitFlash = 0.2;
    boss.shake = 0.4;
    this.shake = Math.min(1, this.shake + 0.6);
    const cx = boss.x + BOSS_W / 2;
    const cy = boss.feetY - BOSS_H * 0.6;
    this.spawnDamage(cx, cy, amount, '#fff3a1');
    this.spawnSpark(cx, cy, this.accent);
    if (boss.hp <= 0) {
      boss.hp = 0;
      boss.alive = false;
      this.score += 500;
      this.spawnText(cx, cy, 'Região salva!', this.accent);
      return;
    }
    // Segunda fase: ao cair abaixo do limiar, o chefe entra em fúria.
    if (!boss.enraged && boss.hp <= boss.maxHp * BOSS_ENRAGE_THRESHOLD) {
      boss.enraged = true;
      boss.windup = 0;
      boss.attackTimer = Math.min(boss.attackTimer, 0.5);
      this.shake = Math.min(1, this.shake + 0.8);
      this.bossBannerTimer = 2.4;
      this.bossBannerText = `${boss.def.name} está furioso!`;
      this.spawnText(cx, cy - 12, 'FÚRIA!', '#ff7a59');
    }
  }

  /**
   * Golpe especial após o quiz: alvo principal é o chefe (quando ativo).
   * `speedBonus` (0–1) recompensa quem respondeu rápido com mais dano.
   */
  applySpecial(correct: boolean, speedBonus = 0): void {
    const { player, enemies } = this;
    this.specialsTried += 1;
    if (correct) this.specialsCorrect += 1;
    player.state = correct ? 'victory' : 'hit';
    player.stateTimer = 0.5;
    // Resposta rápida amplia o golpe em até +50%.
    const bonusFactor = 1 + clamp(speedBonus, 0, 1) * 0.5;

    if (this.bossActive && this.boss.alive) {
      const amount = correct
        ? this.stats.poderEspecial * SPECIAL_BOSS_FACTOR * bonusFactor
        : this.stats.poderEspecial * 0.4;
      this.damageBoss(amount);
    } else if (correct) {
      for (const enemy of enemies) {
        if (!enemy.alive) continue;
        this.damageEnemy(enemy, this.stats.poderEspecial * bonusFactor, enemy.x < player.x ? -1 : 1);
      }
      this.score += 50;
    } else {
      const target = enemies
        .filter((enemy) => enemy.alive)
        .sort((a, b) => Math.abs(a.x - player.x) - Math.abs(b.x - player.x))[0];
      if (target) this.damageEnemy(target, this.stats.poderEspecial * 0.35, 1);
    }

    player.energy = correct ? 0 : Math.max(0, player.energy - SPECIAL_COST * 0.5);
    if (!this.bossActive && enemies.every((e) => !e.alive)) this.activateBoss();
  }

  private activateBoss(): void {
    this.bossActive = true;
    this.boss.alive = true;
    this.boss.introTimer = BOSS_INTRO_TIME;
    this.boss.windup = 0;
    // Começa fora da tela, à direita, para "voar" para dentro durante a intro.
    this.boss.x = this.player.x + VIEW_W * 0.65;
    this.bossBannerTimer = BOSS_INTRO_TIME + 1;
    this.bossBannerText = this.boss.def.taunt;
    this.shake = Math.min(1, this.shake + 0.7);
    // Zera o combo: o duelo contra o chefe é uma nova etapa.
    this.comboCount = 0;
    this.comboTimer = 0;
  }

  private fireProjectile(): void {
    const { player } = this;
    this.shotsFired += 1;
    this.projectiles.push({
      id: this.nextId++,
      x: player.x + PLAYER_W / 2 + player.facing * (PLAYER_W / 2),
      y: player.feetY - PLAYER_H * 0.52,
      vx: player.facing * PROJECTILE_SPEED,
      vy: 0,
      life: PROJECTILE_LIFE,
      color: this.accent,
      team: 'player',
      damage: this.stats.ataque,
    });
  }

  private fireEnemyShot(
    fromX: number,
    fromY: number,
    damage: number,
    color: string,
    targetYOffset = 0,
    speedMultiplier = 1,
  ): void {
    const { player } = this;
    const tx = player.x + PLAYER_W / 2;
    const ty = player.feetY - PLAYER_H * 0.5 + targetYOffset;
    const dx = tx - fromX;
    const dy = ty - fromY;
    const len = Math.hypot(dx, dy) || 1;
    this.projectiles.push({
      id: this.nextId++,
      x: fromX,
      y: fromY,
      vx: (dx / len) * ENEMY_PROJ_SPEED * speedMultiplier,
      vy: (dy / len) * ENEMY_PROJ_SPEED * speedMultiplier,
      life: 3,
      color,
      team: 'enemy',
      damage,
    });
  }

  private hurtPlayer(amount: number, fromX: number): void {
    const { player } = this;
    if (player.invuln > 0) return;
    player.hp -= amount;
    player.invuln = HIT_INVULN;
    player.state = 'hit';
    player.stateTimer = 0.35;
    const knock = player.x < fromX ? -1 : 1;
    player.x = clamp(player.x + knock * 34, 0, STAGE_WIDTH - PLAYER_W);
    player.vy = -300;
    player.onGround = false;
    this.shake = Math.min(1, this.shake + 0.4);
    this.spawnDamage(player.x + PLAYER_W / 2, player.feetY - PLAYER_H * 0.6, amount, '#ff8a73');
  }

  private guardProjectile(p: Projectile): boolean {
    const { player } = this;
    if (!player.crouching || !player.onGround) return false;
    const cx = player.x + PLAYER_W / 2;
    const guardReachX = PLAYER_HITBOX_W / 2 + ENEMY_PROJ_R + 20;
    const guardTop = player.feetY - 98;
    const guardBottom = player.feetY - 12;
    if (Math.abs(p.x - cx) > guardReachX || p.y < guardTop || p.y > guardBottom) return false;

    p.life = 0;
    player.guardFlash = GUARD_FLASH_TIME;
    player.energy = Math.min(MAX_ENERGY, player.energy + GUARD_ENERGY_GAIN);
    this.spawnSpark(p.x, p.y, '#bfefff');
    this.spawnText(cx, player.feetY - 118, 'Defesa!', '#bfefff');
    return true;
  }

  private updateProjectiles(dt: number): void {
    for (const p of this.projectiles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) continue;

      if (p.team === 'player') {
        // Onda contra o chefe: não fura o escudo, mas carrega energia.
        if (this.bossActive && this.boss.alive) {
          const bx = this.boss.x + BOSS_W / 2;
          const by = this.boss.feetY - BOSS_H / 2;
          if (Math.abs(p.x - bx) < BOSS_W / 2 + PROJECTILE_R && Math.abs(p.y - by) < BOSS_H / 2 + PROJECTILE_R) {
            this.boss.hitFlash = 0.12;
            this.spawnSpark(p.x, p.y, '#bfefff');
            this.player.energy = Math.min(MAX_ENERGY, this.player.energy + ENERGY_PER_HIT);
            p.life = 0;
            continue;
          }
        }
        for (const enemy of this.enemies) {
          if (!enemy.alive) continue;
          const cx = enemy.x + ENEMY_SIZE / 2;
          const cy = enemy.feetY - ENEMY_SIZE / 2;
          if (Math.abs(p.x - cx) < ENEMY_SIZE / 2 + PROJECTILE_R && Math.abs(p.y - cy) < ENEMY_SIZE / 2 + PROJECTILE_R) {
            this.damageEnemy(enemy, p.damage, Math.sign(p.vx) || 1);
            this.player.energy = Math.min(MAX_ENERGY, this.player.energy + ENERGY_PER_HIT);
            p.life = 0;
            break;
          }
        }
      } else {
        // Ataque inimigo contra o jogador.
        const cx = this.player.x + PLAYER_W / 2;
        const hitboxH = this.player.crouching ? PLAYER_CROUCH_HITBOX_H : PLAYER_PROJECTILE_HITBOX_H;
        const cy = this.player.crouching
          ? this.player.feetY - hitboxH / 2 - 12
          : this.player.feetY - PLAYER_H / 2;
        if (this.guardProjectile(p)) continue;
        if (
          this.player.invuln <= 0
          && Math.abs(p.x - cx) < PLAYER_HITBOX_W / 2 + ENEMY_PROJ_R
          && Math.abs(p.y - cy) < hitboxH / 2 + ENEMY_PROJ_R
        ) {
          this.hurtPlayer(p.damage, p.x);
          p.life = 0;
        }
      }
    }
    this.projectiles = this.projectiles.filter(
      (p) => p.life > 0 && p.x > -80 && p.x < STAGE_WIDTH + 80 && p.y > -120 && p.y < VIEW_H + 120,
    );
  }

  private updateParticles(dt: number): void {
    for (const part of this.particles) {
      part.y += part.vy * dt;
      part.life -= dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
  }

  /** Itens caem até o chão, somem com o tempo e são coletados por contato. */
  private updatePickups(dt: number): void {
    const { player } = this;
    const pcx = player.x + PLAYER_W / 2;
    const pcy = player.feetY - PLAYER_H / 2;
    for (const item of this.pickups) {
      if (!item.grounded) {
        item.vy += PICKUP_GRAVITY * dt;
        item.y += item.vy * dt;
        if (item.y >= GROUND_Y - PICKUP_R) {
          item.y = GROUND_Y - PICKUP_R;
          item.grounded = true;
          item.vy = 0;
        }
      }
      item.life -= dt;
      if (item.life <= 0) continue;
      // Coleta
      if (Math.abs(item.x - pcx) < PLAYER_W / 2 + PICKUP_R && Math.abs(item.y - pcy) < PLAYER_H / 2 + PICKUP_R) {
        if (item.kind === 'heal') {
          player.hp = Math.min(player.maxHp, player.hp + PICKUP_HEAL);
          this.spawnText(item.x, item.y - 16, `+${PICKUP_HEAL} vida`, '#7bf0a1');
        } else {
          player.energy = Math.min(MAX_ENERGY, player.energy + PICKUP_ENERGY);
          this.spawnText(item.x, item.y - 16, `+${PICKUP_ENERGY} energia`, '#ffe26b');
        }
        this.spawnSpark(item.x, item.y, item.kind === 'heal' ? '#7bf0a1' : '#ffe26b');
        this.pickupsCollected += 1;
        item.life = 0;
      }
    }
    this.pickups = this.pickups.filter((p) => p.life > 0);
  }

  /** Pousa o jogador no chão ou em uma plataforma (one-way). */
  private resolveVertical(dt: number, prevFeet: number): void {
    const { player } = this;
    player.vy += GRAVITY * dt;
    player.feetY += player.vy * dt;

    let ground = GROUND_Y;
    if (player.vy >= 0) {
      const cx = player.x + PLAYER_W / 2;
      for (const plat of this.platforms) {
        if (cx > plat.x && cx < plat.x + plat.width && prevFeet <= plat.y + 4 && player.feetY >= plat.y) {
          ground = Math.min(ground, plat.y);
        }
      }
    }
    if (player.feetY >= ground) {
      player.feetY = ground;
      player.vy = 0;
      player.onGround = true;
    } else {
      player.onGround = false;
    }
  }

  step(dtRaw: number, input: InputState): StepOutcome {
    const { player } = this;
    // Entrada do chefe roda em câmera lenta: escalamos o passo de simulação,
    // mas os temporizadores de UI (intro, banner, combo) correm em tempo real.
    const intro = this.boss.introTimer > 0;
    this.boss.introTimer = Math.max(0, this.boss.introTimer - dtRaw);
    const dt = intro ? dtRaw * BOSS_INTRO_TIMESCALE : dtRaw;

    this.time += dt;
    this.shake = Math.max(0, this.shake - dt * 1.6);
    this.bossBannerTimer = Math.max(0, this.bossBannerTimer - dtRaw);

    // Combo: a janela expira em tempo real; ao zerar, reinicia a sequência.
    if (this.comboTimer > 0) {
      this.comboTimer = Math.max(0, this.comboTimer - dtRaw);
      if (this.comboTimer === 0) this.comboCount = 0;
    }

    player.crouching = input.crouch && player.onGround && player.attackTimer <= 0 && player.state !== 'hit';

    // Movimento horizontal com aceleração. Cada região pode alterar a tração.
    let move = 0;
    if (input.left) move -= 1;
    if (input.right) move += 1;
    if (player.invuln <= 0 || player.state !== 'hit') {
      const center = player.x + PLAYER_W / 2;
      const terrain = this.hazards.find((hazard) => (
        !this.isHazardRestored(hazard)
        && center > hazard.x
        && center < hazard.x + hazard.width
      ));
      const maxSpeed = this.stats.velocidade * (terrain?.speedMultiplier ?? 1) * (player.crouching ? PLAYER_CROUCH_SPEED : 1);
      const targetSpeed = move * maxSpeed;
      const control = player.onGround ? 1 : this.movement.airControl;
      const rate = (move === 0 ? this.movement.deceleration : this.movement.acceleration) * control;
      const difference = targetSpeed - player.vx;
      player.vx += clamp(difference, -rate * dt, rate * dt);
      if (move !== 0) player.facing = move > 0 ? 1 : -1;
    }

    // Pulo
    if (input.jumpPressed) {
      input.jumpPressed = false;
      if (player.onGround && !player.crouching) {
        player.vy = -this.stats.pulo;
        player.onGround = false;
      }
    }

    // Ataque básico → onda
    if (input.attackPressed) {
      input.attackPressed = false;
      if (player.attackCooldown <= 0 && !player.crouching) {
        player.attackCooldown = ATTACK_COOLDOWN;
        player.attackTimer = ATTACK_DURATION;
        player.state = 'attack';
        player.stateTimer = ATTACK_DURATION;
        this.fireProjectile();
      }
    }

    // Especial → quiz, se houver energia
    if (input.specialPressed) {
      input.specialPressed = false;
      if (player.energy >= SPECIAL_COST) return 'requestSpecial';
    }

    // Física vertical (chão + plataformas)
    const prevFeet = player.feetY;
    this.resolveVertical(dt, prevFeet);
    player.x = clamp(player.x + player.vx * dt, 0, STAGE_WIDTH - PLAYER_W);
    if (!player.onGround || player.state === 'hit') {
      player.crouching = false;
    } else {
      player.crouching = input.crouch && player.attackTimer <= 0;
    }

    // Zonas de perigo (no chão): dano, correnteza e redução de velocidade.
    if (player.onGround && player.feetY >= GROUND_Y - 6) {
      const cx = player.x + PLAYER_W / 2;
      for (const hz of this.hazards) {
        if (this.isHazardRestored(hz)) continue;
        if (cx > hz.x && cx < hz.x + hz.width) {
          if (hz.push) {
            player.x = clamp(player.x + hz.push * dt, 0, STAGE_WIDTH - PLAYER_W);
            player.vx += hz.push * dt * 1.4;
          }
          if (player.invuln <= 0) {
            this.hurtPlayer(hz.damage ?? DEFAULT_HAZARD_DAMAGE, cx - (hz.push ?? 1));
          }
          break;
        }
      }
    }

    // Temporizadores
    player.attackTimer = Math.max(0, player.attackTimer - dt);
    player.attackCooldown = Math.max(0, player.attackCooldown - dt);
    player.invuln = Math.max(0, player.invuln - dt);
    player.guardFlash = Math.max(0, player.guardFlash - dt);
    player.stateTimer = Math.max(0, player.stateTimer - dt);

    this.updateProjectiles(dt);
    this.updateParticles(dt);
    this.updatePickups(dt);

    const justClearedMinions = this.updateEnemies(dt);
    if (this.bossActive) this.updateBoss(dt);

    // Estado de animação padrão
    if (player.stateTimer <= 0) {
      if (player.crouching) player.state = 'crouch';
      else if (!player.onGround) player.state = 'jump';
      else if (player.vx !== 0) player.state = 'walk';
      else player.state = 'idle';
    }

    // Câmera
    this.camera = clamp(player.x + PLAYER_W / 2 - VIEW_W / 2, 0, STAGE_WIDTH - VIEW_W);

    if (player.hp <= 0) {
      player.hp = 0;
      return 'defeat';
    }
    if (this.bossActive && !this.boss.alive) return 'victory';
    if (justClearedMinions) return 'bossIncoming';
    return 'playing';
  }

  /** Retorna true no quadro em que os problemas acabam (e o chefe entra). */
  private updateEnemies(dt: number): boolean {
    const { player } = this;
    const playerHitMinX = player.x + (PLAYER_W - PLAYER_HITBOX_W) / 2;
    const playerHitMaxX = playerHitMinX + PLAYER_HITBOX_W;
    const playerTop = player.feetY - (player.crouching ? PLAYER_H * 0.58 : PLAYER_H);

    for (const enemy of this.enemies) {
      enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
      enemy.shake = Math.max(0, enemy.shake - dt);
      if (!enemy.alive) continue;
      enemy.phase += dt;
      const dx = player.x - enemy.baseX;

      // Movimento horizontal conforme o comportamento.
      const approach =
        enemy.behavior === 'turret' ? 0
        : enemy.behavior === 'rusher' ? ENEMY_APPROACH_SPEED * RUSHER_APPROACH
        : ENEMY_APPROACH_SPEED;
      // O rusher persegue de qualquer distância; os demais só num corredor médio.
      const inRange = enemy.behavior === 'rusher' ? Math.abs(dx) > 40 : Math.abs(dx) > 60 && Math.abs(dx) < 520;
      if (approach > 0 && inRange) {
        enemy.baseX += Math.sign(dx) * approach * dt;
      }
      enemy.x = enemy.baseX + Math.sin(enemy.phase * 0.8) * (enemy.behavior === 'turret' ? 8 : 24);

      // Vertical: o jumper salta de verdade (jumpHeight ≤ 0); os demais flutuam levemente.
      if (enemy.behavior === 'jumper') {
        enemy.jumpTimer -= dt;
        if (enemy.jumpVy === 0 && enemy.jumpHeight === 0 && enemy.jumpTimer <= 0) {
          enemy.jumpVy = -ENEMY_JUMP_IMPULSE;
          enemy.jumpTimer = ENEMY_JUMP_INTERVAL;
        }
        if (enemy.jumpVy !== 0 || enemy.jumpHeight < 0) {
          enemy.jumpVy += ENEMY_JUMP_GRAVITY * dt;
          enemy.jumpHeight = Math.min(0, enemy.jumpHeight + enemy.jumpVy * dt);
          if (enemy.jumpHeight >= 0) {
            enemy.jumpHeight = 0;
            enemy.jumpVy = 0;
          }
        }
      }
      const bob = Math.abs(Math.sin(enemy.phase * 1.6)) * (enemy.behavior === 'turret' ? 6 : 16);
      enemy.feetY = GROUND_Y - 4 - bob + enemy.jumpHeight;

      // Tiro: turret atira mais rápido; rusher prefere o corpo a corpo (não atira).
      if (enemy.behavior !== 'rusher') {
        const interval = enemy.behavior === 'turret' ? ENEMY_ATTACK_INTERVAL * TURRET_INTERVAL_FACTOR : ENEMY_ATTACK_INTERVAL;
        const range = enemy.behavior === 'turret' ? ENEMY_ATTACK_RANGE * 1.4 : ENEMY_ATTACK_RANGE;
        enemy.attackTimer -= dt;
        if (enemy.attackTimer <= 0 && Math.abs(dx) < range) {
          enemy.attackTimer = interval;
          this.fireEnemyShot(
            enemy.x + ENEMY_SIZE / 2,
            enemy.feetY - ENEMY_SIZE / 2,
            Math.max(5, Math.round(enemy.contactDamage * 0.7)),
            enemy.problem.color,
          );
        }
      }

      const enemyMinX = enemy.x + (ENEMY_SIZE - ENEMY_HITBOX_W) / 2;
      const enemyMaxX = enemyMinX + ENEMY_HITBOX_W;
      const enemyTop = enemy.feetY - ENEMY_SIZE;
      const overlapX = playerHitMinX < enemyMaxX && playerHitMaxX > enemyMinX;
      const overlapY = playerTop < enemy.feetY && player.feetY > enemyTop;
      if (overlapX && overlapY) {
        // Pulo de cabeça: caindo sobre o topo do inimigo → dano + quique, sem se ferir.
        const stomping = player.vy > STOMP_MIN_FALL && player.feetY <= enemyTop + STOMP_BAND;
        if (stomping) {
          this.damageEnemy(enemy, this.stats.ataque * STOMP_DAMAGE_FACTOR, player.facing);
          player.vy = -STOMP_BOUNCE;
          player.onGround = false;
          player.feetY = enemyTop;
          this.player.energy = Math.min(MAX_ENERGY, this.player.energy + ENERGY_PER_HIT);
          this.spawnSpark(player.x + PLAYER_W / 2, enemyTop, this.accent);
        } else {
          this.hurtPlayer(enemy.contactDamage, enemy.x);
        }
      }
    }

    // Ativa o chefe assim que TODOS os problemas forem restaurados — não importa
    // se o último morreu pela onda (J), por contato ou pelo golpe especial.
    // (Antes isso só disparava quando a morte ocorria dentro deste método, então
    // matar o último com a onda deixava o chefe preso até apertar o especial.)
    if (!this.bossActive && this.enemies.length > 0 && this.enemies.every((e) => !e.alive)) {
      this.activateBoss();
      return true;
    }
    return false;
  }

  private updateBoss(dt: number): void {
    const boss = this.boss;
    boss.hitFlash = Math.max(0, boss.hitFlash - dt);
    boss.shake = Math.max(0, boss.shake - dt);
    if (!boss.alive) return;
    const { player } = this;
    boss.phase += dt;

    // Entrada cinematográfica: voa da direita até a posição de combate e só
    // então passa a atacar / causar dano por contato.
    if (boss.introTimer > 0) {
      const restX = clamp(player.x + 300, 80, STAGE_WIDTH - BOSS_W - 20);
      boss.x += (restX - boss.x) * Math.min(1, dt * 6);
      boss.feetY = BOSS_HOVER + Math.sin(boss.phase * 1.4) * 26;
      return;
    }

    const enraged = boss.enraged;
    const speed = BOSS_SPEED * (enraged ? BOSS_ENRAGE_SPEED : 1);
    const interval = enraged ? Math.min(boss.def.attackInterval, BOSS_ENRAGE_INTERVAL) : boss.def.attackInterval;
    const pattern = enraged ? ENRAGED_PATTERN[boss.def.attackPattern] : boss.def.attackPattern;

    // Mantém distância do jogador, oscilando
    const desired = player.x + (player.x < boss.x ? 300 : -300);
    boss.x += Math.sign(desired - boss.x) * speed * dt;
    boss.x = clamp(boss.x, 80, STAGE_WIDTH - BOSS_W - 20);
    const bob = enraged ? 34 : 26;
    boss.feetY = BOSS_HOVER + Math.sin(boss.phase * 1.4) * bob;

    // Telegrafia: ao zerar o cooldown, o chefe "carrega" por BOSS_TELEGRAPH
    // segundos (tell visual) antes de efetivamente disparar.
    if (boss.windup > 0) {
      boss.windup = Math.max(0, boss.windup - dt);
      if (boss.windup === 0) {
        const fromX = boss.x + BOSS_W / 2;
        const fromY = boss.feetY - BOSS_H / 2;
        if (pattern === 'single') {
          this.fireEnemyShot(fromX, fromY, Math.round(boss.contactDamage * 1.2), boss.def.color, 0, 1.08);
        } else if (pattern === 'spread') {
          this.fireEnemyShot(fromX, fromY, Math.round(boss.contactDamage * 0.72), boss.def.color, -115, 0.92);
          this.fireEnemyShot(fromX, fromY, Math.round(boss.contactDamage * 0.72), boss.def.color, 0, 0.96);
          this.fireEnemyShot(fromX, fromY, Math.round(boss.contactDamage * 0.72), boss.def.color, 115, 0.92);
        } else if (pattern === 'barrage') {
          this.fireEnemyShot(fromX, fromY - 12, Math.round(boss.contactDamage * 0.78), boss.def.color, -92, 1.1);
          this.fireEnemyShot(fromX, fromY, Math.round(boss.contactDamage * 0.72), boss.def.color, 0, 1.18);
          this.fireEnemyShot(fromX, fromY + 16, Math.round(boss.contactDamage * 0.66), boss.def.color, 86, 1.02);
        } else {
          this.fireEnemyShot(fromX, fromY, boss.contactDamage, boss.def.color);
          this.fireEnemyShot(fromX, fromY - 18, Math.round(boss.contactDamage * 0.8), boss.def.color, 70);
        }
      }
    } else {
      boss.attackTimer -= dt;
      if (boss.attackTimer <= 0) {
        boss.attackTimer = interval;
        boss.windup = BOSS_TELEGRAPH;
      }
    }

    const bxMin = boss.x + 24;
    const bxMax = boss.x + BOSS_W - 24;
    const pxMin = player.x + (PLAYER_W - PLAYER_HITBOX_W) / 2;
    const pxMax = pxMin + PLAYER_HITBOX_W;
    const playerTop = player.feetY - (player.crouching ? PLAYER_H * 0.58 : PLAYER_H);
    if (pxMin < bxMax && pxMax > bxMin && playerTop < boss.feetY && player.feetY > boss.feetY - BOSS_H) {
      this.hurtPlayer(boss.contactDamage, boss.x);
    }
  }

  view(): View {
    const { player } = this;
    return {
      px: player.x,
      pfeet: player.feetY,
      pstate: player.state,
      pfacing: player.facing,
      guarding: player.crouching,
      guardFlash: player.guardFlash > 0,
      hp: player.hp,
      maxHp: player.maxHp,
      energy: player.energy,
      blinking: player.invuln > 0 && Math.floor(this.time * 16) % 2 === 0,
      camera: this.camera,
      score: this.score,
      shakeX: Math.sin(this.time * 92) * this.shake * 15,
      shakeY: Math.cos(this.time * 71) * this.shake * 11,
      hasFired: this.shotsFired > 0,
      bossActive: this.bossActive && this.boss.alive,
      bossBanner: this.bossBannerTimer > 0 ? this.bossBannerText : null,
      slowmo: this.boss.introTimer > 0,
      combo: this.comboCount,
      comboMultiplier: this.comboMultiplier(),
      pickupsCollected: this.pickupsCollected,
      enemiesRemaining: this.enemies.filter((e) => e.alive).length,
      enemies: this.enemies
        .filter((e) => e.alive)
        .map((e) => ({
          key: e.key,
          problem: e.problem,
          behavior: e.behavior,
          x: e.x,
          feetY: e.feetY,
          hp: e.hp,
          maxHp: e.maxHp,
          hitFlash: e.hitFlash,
          shake: e.shake,
        })),
      boss: this.bossActive && this.boss.alive
        ? {
            name: this.boss.def.name,
            image: this.boss.def.image,
            emoji: this.boss.def.emoji,
            color: this.boss.def.color,
            visual: this.boss.def.visual,
            x: this.boss.x,
            feetY: this.boss.feetY,
            hp: this.boss.hp,
            maxHp: this.boss.maxHp,
            hitFlash: this.boss.hitFlash,
            shake: this.boss.shake,
            intro: this.boss.introTimer > 0,
            charging: this.boss.windup > 0,
            enraged: this.boss.enraged,
          }
        : null,
      projectiles: this.projectiles.map((p) => ({
        id: p.id,
        x: p.x,
        y: p.y,
        r: p.team === 'player' ? PROJECTILE_R : ENEMY_PROJ_R,
        color: p.color,
        team: p.team,
      })),
      particles: this.particles.map((p) => ({
        id: p.id,
        kind: p.kind,
        x: p.x,
        y: p.y,
        text: p.text,
        color: p.color,
        alpha: Math.max(0, p.life / p.maxLife),
        scale: p.kind === 'spark' ? 1 + (1 - p.life / p.maxLife) * 1.6 : 1,
      })),
      pickups: this.pickups.map((p) => ({
        id: p.id,
        kind: p.kind,
        x: p.x,
        y: p.y,
      })),
      platforms: this.platforms,
      hazards: this.hazards.map((hazard) => ({
        ...hazard,
        restored: this.isHazardRestored(hazard),
      })),
    };
  }
}
