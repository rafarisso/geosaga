import { CHARACTERS } from '../../data/characters';
import { getProblem } from '../../data/regionalProblems';
import { REGIONS } from '../../data/regions';
import { STAGES } from '../../data/stages';
import type { AnimationState, RegionId, RegionalProblem } from '../../data/types';
import type { InputState } from '../../hooks/useKeyboardControls';

export const VIEW_W = 960;
export const VIEW_H = 540;
export const STAGE_WIDTH = 2600;
export const GROUND_Y = 470; // linha dos pés (topo do chão)
export const PLAYER_W = 104;
export const PLAYER_H = 168;
export const ENEMY_SIZE = 96;
export const GOAL_X = STAGE_WIDTH - 230;
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

/** Resultado de um quadro de simulação, lido pelo componente React. */
export type StepOutcome = 'playing' | 'requestSpecial' | 'victory' | 'defeat';

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
  alive: boolean;
  hitFlash: number;
  phase: number;
  shake: number;
}

interface Projectile {
  id: number;
  x: number;
  y: number;
  vx: number;
  life: number;
  color: string;
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

/** Dados de render de um projétil/partícula (snapshot imutável). */
export interface ProjectileView {
  id: number;
  x: number;
  y: number;
  r: number;
  color: string;
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

/** Snapshot imutável usado para renderizar (a UI nunca toca no mundo mutável). */
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
  goalActive: boolean;
  enemiesRemaining: number;
  hasFired: boolean;
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
  projectiles: ProjectileView[];
  particles: ParticleView[];
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

/**
 * Motor da fase 2D: mantém o mundo mutável (jogador, inimigos, ondas, partículas)
 * e o simula com passo de tempo fixo. Vive fora dos componentes React de propósito,
 * para que a UI apenas leia snapshots (`view()`) e não mute estado de render.
 */
export class StageEngine {
  private player: PlayerWorld;
  private enemies: EnemyWorld[];
  private projectiles: Projectile[] = [];
  private particles: Particle[] = [];
  private camera = 0;
  private score = 0;
  private time = 0;
  private goalActive = false;
  private shotsFired = 0;
  private nextId = 1;
  private readonly stats: (typeof CHARACTERS)[RegionId]['stats'];
  private readonly accent: string;

  constructor(region: RegionId) {
    const character = CHARACTERS[region];
    const stage = STAGES[region];
    this.stats = character.stats;
    this.accent = REGIONS[region].accentColor;
    this.enemies = stage.enemyIds.flatMap((id, index) => {
      const problem = getProblem(id);
      if (!problem) return [];
      const enemy: EnemyWorld = {
        key: `${id}-${index}`,
        problem,
        baseX: 620 + index * 560,
        x: 620 + index * 560,
        feetY: GROUND_Y,
        hp: problem.hp,
        maxHp: problem.hp,
        alive: true,
        hitFlash: 0,
        phase: index * 1.3,
        shake: 0,
      };
      return [enemy];
    });
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
      this.particles.push({
        id: this.nextId++,
        kind: 'restore',
        x: cx,
        y: cy - 10,
        vy: -40,
        life: 1,
        maxLife: 1,
        text: 'Restaurado!',
        color: this.accent,
      });
      this.player.energy = Math.min(MAX_ENERGY, this.player.energy + ENERGY_ON_KILL);
    } else {
      enemy.baseX = clamp(enemy.baseX + knock * 18, 120, STAGE_WIDTH - ENEMY_SIZE);
    }
  }

  /** Aplica o golpe especial após o quiz: acerto = onda forte em área. */
  applySpecial(correct: boolean): void {
    const { player, enemies } = this;
    if (correct) {
      for (const enemy of enemies) {
        if (!enemy.alive) continue;
        this.damageEnemy(enemy, this.stats.poderEspecial, enemy.x < player.x ? -1 : 1);
      }
      this.score += 50;
      player.energy = 0;
      player.state = 'victory';
      player.stateTimer = 0.6;
    } else {
      const target = enemies
        .filter((enemy) => enemy.alive)
        .sort((a, b) => Math.abs(a.x - player.x) - Math.abs(b.x - player.x))[0];
      if (target) this.damageEnemy(target, this.stats.poderEspecial * 0.35, 1);
      player.energy = Math.max(0, player.energy - SPECIAL_COST * 0.5);
    }
    if (enemies.every((enemy) => !enemy.alive)) this.goalActive = true;
  }

  private fireProjectile(): void {
    const { player } = this;
    this.shotsFired += 1;
    this.projectiles.push({
      id: this.nextId++,
      x: player.x + PLAYER_W / 2 + player.facing * (PLAYER_W / 2),
      y: player.feetY - PLAYER_H * 0.52,
      vx: player.facing * PROJECTILE_SPEED,
      life: PROJECTILE_LIFE,
      color: this.accent,
    });
  }

  private updateProjectiles(dt: number): void {
    for (const p of this.projectiles) {
      p.x += p.vx * dt;
      p.life -= dt;
      if (p.life <= 0) continue;
      for (const enemy of this.enemies) {
        if (!enemy.alive) continue;
        const cx = enemy.x + ENEMY_SIZE / 2;
        const cy = enemy.feetY - ENEMY_SIZE / 2;
        if (Math.abs(p.x - cx) < ENEMY_SIZE / 2 + PROJECTILE_R && Math.abs(p.y - cy) < ENEMY_SIZE / 2 + PROJECTILE_R) {
          this.damageEnemy(enemy, this.stats.ataque, Math.sign(p.vx) || 1);
          this.player.energy = Math.min(MAX_ENERGY, this.player.energy + ENERGY_PER_HIT);
          p.life = 0; // a onda se desfaz ao atingir
          break;
        }
      }
    }
    this.projectiles = this.projectiles.filter((p) => p.life > 0 && p.x > -60 && p.x < STAGE_WIDTH + 60);
  }

  private updateParticles(dt: number): void {
    for (const part of this.particles) {
      part.x += 0;
      part.y += part.vy * dt;
      part.life -= dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
  }

  step(dt: number, input: InputState): StepOutcome {
    const { player } = this;
    this.time += dt;

    // Movimento horizontal
    let move = 0;
    if (input.left) move -= 1;
    if (input.right) move += 1;
    if (player.invuln <= 0 || player.state !== 'hit') {
      player.vx = move * this.stats.velocidade;
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

    // Ataque básico → lança uma onda à frente
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

    // Golpe especial → pede o quiz se houver energia
    if (input.specialPressed) {
      input.specialPressed = false;
      if (player.energy >= SPECIAL_COST) return 'requestSpecial';
    }

    // Física vertical
    player.vy += GRAVITY * dt;
    player.feetY += player.vy * dt;
    if (player.feetY >= GROUND_Y) {
      player.feetY = GROUND_Y;
      player.vy = 0;
      player.onGround = true;
    }
    player.x = clamp(player.x + player.vx * dt, 0, STAGE_WIDTH - PLAYER_W);

    // Temporizadores
    player.attackTimer = Math.max(0, player.attackTimer - dt);
    player.attackCooldown = Math.max(0, player.attackCooldown - dt);
    player.invuln = Math.max(0, player.invuln - dt);
    player.stateTimer = Math.max(0, player.stateTimer - dt);

    this.updateProjectiles(dt);
    this.updateParticles(dt);

    // Inimigos: flutuam, avançam devagar até o jogador e causam dano por contato
    const playerHitMinX = player.x + (PLAYER_W - PLAYER_HITBOX_W) / 2;
    const playerHitMaxX = playerHitMinX + PLAYER_HITBOX_W;
    const playerTop = player.feetY - PLAYER_H;

    for (const enemy of this.enemies) {
      enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
      enemy.shake = Math.max(0, enemy.shake - dt);
      if (!enemy.alive) continue;
      enemy.phase += dt;
      // Avança lentamente na direção do jogador quando ele está por perto.
      const dx = player.x - enemy.baseX;
      if (Math.abs(dx) > 60 && Math.abs(dx) < 520) {
        enemy.baseX += Math.sign(dx) * ENEMY_APPROACH_SPEED * dt;
      }
      enemy.x = enemy.baseX + Math.sin(enemy.phase * 0.8) * 26;
      enemy.feetY = GROUND_Y - 4 - Math.abs(Math.sin(enemy.phase * 1.6)) * 16;

      const enemyMinX = enemy.x + (ENEMY_SIZE - ENEMY_HITBOX_W) / 2;
      const enemyMaxX = enemyMinX + ENEMY_HITBOX_W;
      const enemyTop = enemy.feetY - ENEMY_SIZE;
      const overlapX = playerHitMinX < enemyMaxX && playerHitMaxX > enemyMinX;
      const overlapY = playerTop < enemy.feetY && player.feetY > enemyTop;
      if (overlapX && overlapY && player.invuln <= 0) {
        player.hp -= enemy.problem.contactDamage;
        player.invuln = HIT_INVULN;
        player.state = 'hit';
        player.stateTimer = 0.35;
        const knock = player.x < enemy.x ? -1 : 1;
        player.x = clamp(player.x + knock * 40, 0, STAGE_WIDTH - PLAYER_W);
        player.vy = -360;
        player.onGround = false;
        this.spawnDamage(player.x + PLAYER_W / 2, player.feetY - PLAYER_H * 0.6, enemy.problem.contactDamage, '#ff8a73');
      }
    }

    // Estado de animação padrão
    if (player.stateTimer <= 0) {
      if (!player.onGround) player.state = 'jump';
      else if (player.vx !== 0) player.state = 'walk';
      else player.state = 'idle';
    }

    // Câmera
    this.camera = clamp(player.x + PLAYER_W / 2 - VIEW_W / 2, 0, STAGE_WIDTH - VIEW_W);

    // Condições de fim
    if (player.hp <= 0) {
      player.hp = 0;
      return 'defeat';
    }
    if (this.goalActive) {
      const centerX = player.x + PLAYER_W / 2;
      if (centerX >= GOAL_X - 40 && centerX <= GOAL_X + 120) {
        player.state = 'victory';
        return 'victory';
      }
    }
    return 'playing';
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
      goalActive: this.goalActive,
      enemiesRemaining: this.enemies.filter((enemy) => enemy.alive).length,
      hasFired: this.shotsFired > 0,
      enemies: this.enemies
        .filter((enemy) => enemy.alive)
        .map((enemy) => ({
          key: enemy.key,
          problem: enemy.problem,
          x: enemy.x,
          feetY: enemy.feetY,
          hp: enemy.hp,
          maxHp: enemy.maxHp,
          hitFlash: enemy.hitFlash,
          shake: enemy.shake,
        })),
      projectiles: this.projectiles.map((p) => ({
        id: p.id,
        x: p.x,
        y: p.y,
        r: PROJECTILE_R,
        color: p.color,
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
    };
  }
}
