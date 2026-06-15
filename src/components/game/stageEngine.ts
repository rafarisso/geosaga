import { CHARACTERS } from '../../data/characters';
import { getProblem } from '../../data/regionalProblems';
import { REGIONS } from '../../data/regions';
import { STAGES } from '../../data/stages';
import type {
  AnimationState,
  BossDefinition,
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
  stateTimer: number;
  attackTimer: number;
  attackCooldown: number;
  invuln: number;
  feetY: number;
}

interface EnemyWorld {
  key: string;
  problem: RegionalProblem;
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
  emoji: string;
  color: string;
  visual?: BossDefinition['visual'];
  x: number;
  feetY: number;
  hp: number;
  maxHp: number;
  hitFlash: number;
  shake: number;
}

type HazardView = HazardDef & { restored: boolean };

export interface View {
  px: number;
  pfeet: number;
  pstate: AnimationState;
  pfacing: 1 | -1;
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
  enemiesRemaining: number;
  enemies: {
    key: string;
    problem: RegionalProblem;
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
  private camera = 0;
  private score = 0;
  private time = 0;
  private shotsFired = 0;
  private shake = 0;
  private bossActive = false;
  private bossBannerTimer = 0;
  private specialsTried = 0;
  private specialsCorrect = 0;
  private nextId = 1;
  private readonly stats: (typeof CHARACTERS)[RegionId]['stats'];
  private readonly accent: string;
  private readonly platforms: PlatformDef[];
  private readonly hazards: HazardDef[];
  private readonly movement: (typeof STAGES)[RegionId]['movement'];
  private readonly restoredHazards = new Set<string>();

  constructor(region: RegionId) {
    const character = CHARACTERS[region];
    const stage = STAGES[region];
    const diff = stage.difficulty;
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
    };

    this.player = {
      x: 120,
      vx: 0,
      vy: 0,
      facing: 1,
      onGround: true,
      hp: character.stats.vida,
      maxHp: character.stats.vida,
      energy: 0,
      state: 'idle',
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
      this.score += 100;
      this.spawnText(cx, cy - 10, 'Restaurado!', this.accent);
      this.restoreHazardsFor(enemy.problem.id);
      this.player.energy = Math.min(MAX_ENERGY, this.player.energy + ENERGY_ON_KILL);
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
    }
  }

  /** Golpe especial após o quiz: alvo principal é o chefe (quando ativo). */
  applySpecial(correct: boolean): void {
    const { player, enemies } = this;
    this.specialsTried += 1;
    if (correct) this.specialsCorrect += 1;
    player.state = correct ? 'victory' : 'hit';
    player.stateTimer = 0.5;

    if (this.bossActive && this.boss.alive) {
      const amount = correct
        ? this.stats.poderEspecial * SPECIAL_BOSS_FACTOR
        : this.stats.poderEspecial * 0.4;
      this.damageBoss(amount);
    } else if (correct) {
      for (const enemy of enemies) {
        if (!enemy.alive) continue;
        this.damageEnemy(enemy, this.stats.poderEspecial, enemy.x < player.x ? -1 : 1);
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
    this.bossBannerTimer = 2.6;
    this.shake = Math.min(1, this.shake + 0.7);
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
        const cy = this.player.feetY - PLAYER_H / 2;
        if (this.player.invuln <= 0 && Math.abs(p.x - cx) < PLAYER_HITBOX_W / 2 + ENEMY_PROJ_R && Math.abs(p.y - cy) < PLAYER_H / 2 + ENEMY_PROJ_R) {
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

  step(dt: number, input: InputState): StepOutcome {
    const { player } = this;
    this.time += dt;
    this.shake = Math.max(0, this.shake - dt * 1.6);
    this.bossBannerTimer = Math.max(0, this.bossBannerTimer - dt);

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
      const maxSpeed = this.stats.velocidade * (terrain?.speedMultiplier ?? 1);
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
      if (player.onGround) {
        player.vy = -this.stats.pulo;
        player.onGround = false;
      }
    }

    // Ataque básico → onda
    if (input.attackPressed) {
      input.attackPressed = false;
      if (player.attackCooldown <= 0) {
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

    // Zonas de perigo (no chão): dano, correnteza e redução de velocidade.
    if (player.feetY >= GROUND_Y - 6) {
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
    player.stateTimer = Math.max(0, player.stateTimer - dt);

    this.updateProjectiles(dt);
    this.updateParticles(dt);

    const justClearedMinions = this.updateEnemies(dt);
    if (this.bossActive) this.updateBoss(dt);

    // Estado de animação padrão
    if (player.stateTimer <= 0) {
      if (!player.onGround) player.state = 'jump';
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
    const playerTop = player.feetY - PLAYER_H;
    const anyAliveBefore = this.enemies.some((e) => e.alive);

    for (const enemy of this.enemies) {
      enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
      enemy.shake = Math.max(0, enemy.shake - dt);
      if (!enemy.alive) continue;
      enemy.phase += dt;
      const dx = player.x - enemy.baseX;
      if (Math.abs(dx) > 60 && Math.abs(dx) < 520) {
        enemy.baseX += Math.sign(dx) * ENEMY_APPROACH_SPEED * dt;
      }
      enemy.x = enemy.baseX + Math.sin(enemy.phase * 0.8) * 24;
      enemy.feetY = GROUND_Y - 4 - Math.abs(Math.sin(enemy.phase * 1.6)) * 16;

      // Ataca o jogador quando está por perto
      enemy.attackTimer -= dt;
      if (enemy.attackTimer <= 0 && Math.abs(dx) < ENEMY_ATTACK_RANGE) {
        enemy.attackTimer = ENEMY_ATTACK_INTERVAL;
        this.fireEnemyShot(
          enemy.x + ENEMY_SIZE / 2,
          enemy.feetY - ENEMY_SIZE / 2,
          Math.max(5, Math.round(enemy.contactDamage * 0.7)),
          enemy.problem.color,
        );
      }

      const enemyMinX = enemy.x + (ENEMY_SIZE - ENEMY_HITBOX_W) / 2;
      const enemyMaxX = enemyMinX + ENEMY_HITBOX_W;
      const enemyTop = enemy.feetY - ENEMY_SIZE;
      const overlapX = playerHitMinX < enemyMaxX && playerHitMaxX > enemyMinX;
      const overlapY = playerTop < enemy.feetY && player.feetY > enemyTop;
      if (overlapX && overlapY) this.hurtPlayer(enemy.contactDamage, enemy.x);
    }

    const anyAliveAfter = this.enemies.some((e) => e.alive);
    if (anyAliveBefore && !anyAliveAfter && !this.bossActive) {
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

    // Mantém distância do jogador, oscilando
    const desired = player.x + (player.x < boss.x ? 300 : -300);
    boss.x += Math.sign(desired - boss.x) * BOSS_SPEED * dt;
    boss.x = clamp(boss.x, 80, STAGE_WIDTH - BOSS_W - 20);
    boss.feetY = BOSS_HOVER + Math.sin(boss.phase * 1.4) * 26;

    boss.attackTimer -= dt;
    if (boss.attackTimer <= 0) {
      boss.attackTimer = boss.def.attackInterval;
      const fromX = boss.x + BOSS_W / 2;
      const fromY = boss.feetY - BOSS_H / 2;
      if (boss.def.attackPattern === 'single') {
        this.fireEnemyShot(fromX, fromY, Math.round(boss.contactDamage * 1.2), boss.def.color, 0, 1.08);
      } else if (boss.def.attackPattern === 'spread') {
        this.fireEnemyShot(fromX, fromY, Math.round(boss.contactDamage * 0.72), boss.def.color, -115, 0.92);
        this.fireEnemyShot(fromX, fromY, Math.round(boss.contactDamage * 0.72), boss.def.color, 0, 0.96);
        this.fireEnemyShot(fromX, fromY, Math.round(boss.contactDamage * 0.72), boss.def.color, 115, 0.92);
      } else if (boss.def.attackPattern === 'barrage') {
        this.fireEnemyShot(fromX, fromY - 12, Math.round(boss.contactDamage * 0.78), boss.def.color, -92, 1.1);
        this.fireEnemyShot(fromX, fromY, Math.round(boss.contactDamage * 0.72), boss.def.color, 0, 1.18);
        this.fireEnemyShot(fromX, fromY + 16, Math.round(boss.contactDamage * 0.66), boss.def.color, 86, 1.02);
      } else {
        this.fireEnemyShot(fromX, fromY, boss.contactDamage, boss.def.color);
        this.fireEnemyShot(fromX, fromY - 18, Math.round(boss.contactDamage * 0.8), boss.def.color, 70);
      }
    }

    const bxMin = boss.x + 24;
    const bxMax = boss.x + BOSS_W - 24;
    const pxMin = player.x + (PLAYER_W - PLAYER_HITBOX_W) / 2;
    const pxMax = pxMin + PLAYER_HITBOX_W;
    if (pxMin < bxMax && pxMax > bxMin && player.feetY - PLAYER_H < boss.feetY && player.feetY > boss.feetY - BOSS_H) {
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
      bossBanner: this.bossBannerTimer > 0 ? this.boss.def.taunt : null,
      enemiesRemaining: this.enemies.filter((e) => e.alive).length,
      enemies: this.enemies
        .filter((e) => e.alive)
        .map((e) => ({
          key: e.key,
          problem: e.problem,
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
            emoji: this.boss.def.emoji,
            color: this.boss.def.color,
            visual: this.boss.def.visual,
            x: this.boss.x,
            feetY: this.boss.feetY,
            hp: this.boss.hp,
            maxHp: this.boss.maxHp,
            hitFlash: this.boss.hitFlash,
            shake: this.boss.shake,
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
      platforms: this.platforms,
      hazards: this.hazards.map((hazard) => ({
        ...hazard,
        restored: this.isHazardRestored(hazard),
      })),
    };
  }
}
