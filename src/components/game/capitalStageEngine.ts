import { CHARACTERS } from '../../data/characters';
import type { AnimationState, CapitalId, CapitalRouteId, RegionId } from '../../data/types';
import type { InputState } from '../../hooks/useKeyboardControls';

export const CAPITAL_VIEW_W = 960;
export const CAPITAL_VIEW_H = 540;
export const CAPITAL_STAGE_W = 3200;
export const CAPITAL_GROUND_Y = 470;
export const CAPITAL_PLAYER_W = 104;
export const CAPITAL_PLAYER_H = 168;
export const CAPITAL_ENEMY_SIZE = 94;
export const CAPITAL_BOSS_W = 260;
export const CAPITAL_BOSS_H = 245;
export const CAPITAL_MAX_ENERGY = 100;

const GRAVITY = 2400;
const HIT_INVULN = 0.9;
const ATTACK_COOLDOWN = 0.28;
const ATTACK_DURATION = 0.16;
const PROJECTILE_SPEED = 730;
const ENEMY_PROJECTILE_SPEED = 300;
const PLAYER_HITBOX_W = 58;
const PLAYER_HITBOX_H = 122;
const CROUCH_HITBOX_H = 54;
const SPECIAL_COST = 100;
const COMBO_WINDOW = 3.2;

type EnemyKind = 'traffic' | 'smog' | 'flood' | 'heat';
type PickupKind = 'geo' | 'heal' | 'boost';
type ParticleKind = 'damage' | 'spark' | 'text';
export type CapitalStepOutcome = 'playing' | 'requestSpecial' | 'victory' | 'defeat';

export const PLAYABLE_CAPITAL_IDS: CapitalId[] = ['sao-paulo', 'rio-de-janeiro', 'belo-horizonte', 'vitoria', 'curitiba', 'florianopolis', 'porto-alegre', 'brasilia'];

export interface CapitalEnemyDefinition {
  id: string;
  kind: EnemyKind;
  name: string;
  concept: string;
  baseX: number;
  feetY: number;
  hp: number;
  damage: number;
  phase: number;
  attackTimer: number;
}

export interface CapitalObjectiveDefinition {
  id: string;
  label: string;
  concept: string;
  x: number;
  y: number;
}

export interface CapitalBossDefinition {
  name: string;
  hp: number;
  damage: number;
  attackTimer: number;
  spawnText: string;
  pressureText: string;
  victoryText: string;
}

export interface CapitalStageDefinition {
  capital: CapitalId;
  route: CapitalRouteId;
  city: string;
  introTitle: string;
  introObjective: string;
  finishLabel: string;
  gateHint: string;
  victoryTitle: string;
  victoryBody: string;
  boss: CapitalBossDefinition;
  enemies: CapitalEnemyDefinition[];
  objectives: CapitalObjectiveDefinition[];
}

interface GuardianBoost {
  label: string;
  hp: number;
  speed: number;
  attack: number;
  energyGain: number;
  damageTaken: number;
}

export const CAPITAL_GUARDIAN_BOOSTS: Record<RegionId, GuardianBoost> = {
  norte: {
    label: 'Escudo das aguas: coleta de vida cura mais e reduz dano de alagamento.',
    hp: 8,
    speed: 0,
    attack: 0,
    energyGain: 3,
    damageTaken: 0.9,
  },
  nordeste: {
    label: 'Casca do sertao: mais vida e menos dano por contato.',
    hp: 24,
    speed: -4,
    attack: 2,
    energyGain: 0,
    damageTaken: 0.82,
  },
  'centro-oeste': {
    label: 'Arranque do cerrado: movimento mais rapido e combo mais facil.',
    hp: 6,
    speed: 24,
    attack: 0,
    energyGain: 2,
    damageTaken: 0.95,
  },
  sudeste: {
    label: 'Pulso da mata urbana: ataques carregam conhecimento mais rapido.',
    hp: 10,
    speed: 8,
    attack: 4,
    energyGain: 8,
    damageTaken: 0.92,
  },
  sul: {
    label: 'Vento frio: projeteis desaceleram o caos urbano.',
    hp: 16,
    speed: 0,
    attack: 3,
    energyGain: 1,
    damageTaken: 0.88,
  },
};

interface PlayerWorld {
  x: number;
  feetY: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  hp: number;
  maxHp: number;
  energy: number;
  onGround: boolean;
  crouching: boolean;
  state: AnimationState;
  stateTimer: number;
  attackCooldown: number;
  attackTimer: number;
  invuln: number;
  guardFlash: number;
}

interface CapitalEnemyWorld {
  id: string;
  kind: EnemyKind;
  name: string;
  concept: string;
  baseX: number;
  x: number;
  feetY: number;
  hp: number;
  maxHp: number;
  damage: number;
  phase: number;
  attackTimer: number;
  alive: boolean;
  hitFlash: number;
  shake: number;
  slowed: number;
}

interface CapitalBossWorld {
  name: string;
  x: number;
  feetY: number;
  hp: number;
  maxHp: number;
  damage: number;
  active: boolean;
  hitFlash: number;
  shake: number;
  attackTimer: number;
  windup: number;
  enraged: boolean;
}

interface ProjectileWorld {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  team: 'player' | 'enemy';
  damage: number;
  life: number;
}

interface CapitalObjectiveWorld {
  id: string;
  label: string;
  concept: string;
  x: number;
  y: number;
  collected: boolean;
}

interface PickupWorld {
  id: number;
  kind: PickupKind;
  x: number;
  y: number;
  life: number;
}

interface ParticleWorld {
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

export interface CapitalStageView {
  px: number;
  pfeet: number;
  pstate: AnimationState;
  pfacing: 1 | -1;
  guarding: boolean;
  guardFlash: boolean;
  blinking: boolean;
  hp: number;
  maxHp: number;
  energy: number;
  score: number;
  camera: number;
  combo: number;
  comboMultiplier: number;
  objectiveCount: number;
  totalObjectives: number;
  bossGate: boolean;
  boss: {
    name: string;
    x: number;
    feetY: number;
    hp: number;
    maxHp: number;
    hitFlash: number;
    shake: number;
    charging: boolean;
    enraged: boolean;
  } | null;
  enemies: {
    id: string;
    kind: EnemyKind;
    name: string;
    concept: string;
    x: number;
    feetY: number;
    hp: number;
    maxHp: number;
    hitFlash: number;
    shake: number;
    slowed: boolean;
  }[];
  projectiles: ProjectileWorld[];
  objectives: CapitalObjectiveWorld[];
  pickups: PickupWorld[];
  particles: {
    id: number;
    kind: ParticleKind;
    x: number;
    y: number;
    text: string;
    color: string;
    alpha: number;
    scale: number;
  }[];
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const CAPITAL_STAGE_DEFINITIONS: Partial<Record<CapitalId, CapitalStageDefinition>> = {
  'sao-paulo': {
    capital: 'sao-paulo',
    route: 'sudeste',
    city: 'Sao Paulo',
    introTitle: 'Sao Paulo: Corrida da Metropole',
    introObjective:
      'Colete marcos geograficos, enfrente problemas urbanos e use conhecimento para derrotar o Caos da Metropole.',
    finishLabel: 'Restaurar a metropole',
    gateHint: 'Colete os 3 marcos e derrote os problemas urbanos para liberar o chefe.',
    victoryTitle: 'Sao Paulo concluida',
    victoryBody:
      'Voce conectou mobilidade, drenagem, ilhas de calor e areas verdes em uma unica leitura geografica da cidade.',
    boss: {
      name: 'Caos da Metropole',
      hp: 420,
      damage: 17,
      attackTimer: 1.4,
      spawnText: 'Chefe urbano liberado!',
      pressureText: 'Modo pressao!',
      victoryText: 'Sao Paulo restaurada!',
    },
    enemies: [
      {
        id: 'sp-traffic',
        kind: 'traffic',
        name: 'Engarrafamento Vivo',
        concept: 'Mobilidade urbana',
        baseX: 620,
        feetY: CAPITAL_GROUND_Y,
        hp: 92,
        damage: 12,
        phase: 0.2,
        attackTimer: 1.2,
      },
      {
        id: 'sp-smog',
        kind: 'smog',
        name: 'Drone de Smog',
        concept: 'Poluicao atmosferica',
        baseX: 1160,
        feetY: CAPITAL_GROUND_Y - 70,
        hp: 82,
        damage: 10,
        phase: 1.4,
        attackTimer: 1.6,
      },
      {
        id: 'sp-flood',
        kind: 'flood',
        name: 'Alagamento Relampago',
        concept: 'Drenagem urbana',
        baseX: 1680,
        feetY: CAPITAL_GROUND_Y,
        hp: 104,
        damage: 14,
        phase: 2.2,
        attackTimer: 1,
      },
      {
        id: 'sp-heat',
        kind: 'heat',
        name: 'Ilha de Calor',
        concept: 'Microclima urbano',
        baseX: 2240,
        feetY: CAPITAL_GROUND_Y - 28,
        hp: 118,
        damage: 13,
        phase: 3.1,
        attackTimer: 1.7,
      },
    ],
    objectives: [
      { id: 'metro', label: 'Metro integrado', concept: 'Rede urbana', x: 430, y: 338 },
      { id: 'drenagem', label: 'Canal recuperado', concept: 'Rios urbanos', x: 1460, y: 342 },
      { id: 'corredor-verde', label: 'Corredor verde', concept: 'Mata Atlantica', x: 2420, y: 330 },
    ],
  },
  'belo-horizonte': {
    capital: 'belo-horizonte',
    route: 'sudeste',
    city: 'Belo Horizonte',
    introTitle: 'Belo Horizonte: Colosso do Curral',
    introObjective:
      'Atravesse a cidade planejada, recupere Pampulha, Serra do Curral e eixos urbanos para derrotar o Colosso do Curral.',
    finishLabel: 'Restaurar o horizonte das serras',
    gateHint: 'Colete os 3 marcos e derrote os impactos de drenagem, expansao urbana e microclima para liberar o chefe.',
    victoryTitle: 'Belo Horizonte concluida',
    victoryBody:
      'Voce conectou cidade planejada, Serra do Curral, Pampulha, drenagem urbana e crescimento metropolitano em uma leitura geografica completa.',
    boss: {
      name: 'Colosso do Curral',
      hp: 455,
      damage: 18,
      attackTimer: 1.2,
      spawnText: 'O Colosso do Curral despertou!',
      pressureText: 'Serra em pressao!',
      victoryText: 'Belo Horizonte restaurada!',
    },
    enemies: [
      {
        id: 'bh-grid',
        kind: 'traffic',
        name: 'Grade Travada',
        concept: 'Cidade planejada',
        baseX: 620,
        feetY: CAPITAL_GROUND_Y,
        hp: 100,
        damage: 13,
        phase: 0.35,
        attackTimer: 1.12,
      },
      {
        id: 'bh-dust',
        kind: 'smog',
        name: 'Nuvem da Serra',
        concept: 'Qualidade do ar',
        baseX: 1170,
        feetY: CAPITAL_GROUND_Y - 78,
        hp: 90,
        damage: 11,
        phase: 1.45,
        attackTimer: 1.32,
      },
      {
        id: 'bh-arrudas',
        kind: 'flood',
        name: 'Arrudas Revolto',
        concept: 'Drenagem urbana',
        baseX: 1690,
        feetY: CAPITAL_GROUND_Y,
        hp: 112,
        damage: 14,
        phase: 2.15,
        attackTimer: 0.98,
      },
      {
        id: 'bh-concrete',
        kind: 'heat',
        name: 'Ilha de Concreto',
        concept: 'Microclima urbano',
        baseX: 2280,
        feetY: CAPITAL_GROUND_Y - 28,
        hp: 124,
        damage: 14,
        phase: 3.05,
        attackTimer: 1.38,
      },
    ],
    objectives: [
      { id: 'pampulha', label: 'Pampulha', concept: 'Lagoa e patrimonio', x: 430, y: 338 },
      { id: 'serra-curral', label: 'Serra do Curral', concept: 'Relevo e paisagem', x: 1460, y: 336 },
      { id: 'cidade-planejada', label: 'Eixo planejado', concept: 'Malha urbana', x: 2420, y: 330 },
    ],
  },
  'rio-de-janeiro': {
    capital: 'rio-de-janeiro',
    route: 'sudeste',
    city: 'Rio de Janeiro',
    introTitle: 'Rio de Janeiro: Sombra da Baia',
    introObjective:
      'Suba a encosta, atravesse praia e baia, recupere marcos da paisagem carioca e derrote a Sombra da Baia.',
    finishLabel: 'Restaurar a cidade costeira',
    gateHint: 'Colete os 3 marcos e derrote os impactos da encosta, da baia e da orla para liberar o chefe.',
    victoryTitle: 'Rio de Janeiro concluido',
    victoryBody:
      'Voce conectou relevo de morros, Mata Atlantica, zona costeira e Baia de Guanabara numa leitura geografica completa.',
    boss: {
      name: 'Sombra da Baia',
      hp: 440,
      damage: 18,
      attackTimer: 1.25,
      spawnText: 'A Sombra da Baia surgiu!',
      pressureText: 'Mar revolto!',
      victoryText: 'Rio de Janeiro restaurado!',
    },
    enemies: [
      {
        id: 'rj-slope',
        kind: 'traffic',
        name: 'Morro Instavel',
        concept: 'Ocupacao de encostas',
        baseX: 610,
        feetY: CAPITAL_GROUND_Y,
        hp: 98,
        damage: 13,
        phase: 0.4,
        attackTimer: 1.1,
      },
      {
        id: 'rj-bay',
        kind: 'smog',
        name: 'Nuvem da Baia',
        concept: 'Baia de Guanabara',
        baseX: 1180,
        feetY: CAPITAL_GROUND_Y - 76,
        hp: 88,
        damage: 11,
        phase: 1.5,
        attackTimer: 1.35,
      },
      {
        id: 'rj-coast',
        kind: 'flood',
        name: 'Correnteza da Orla',
        concept: 'Zona costeira',
        baseX: 1700,
        feetY: CAPITAL_GROUND_Y,
        hp: 108,
        damage: 14,
        phase: 2.1,
        attackTimer: 0.95,
      },
      {
        id: 'rj-heat',
        kind: 'heat',
        name: 'Calor Carioca',
        concept: 'Microclima urbano',
        baseX: 2260,
        feetY: CAPITAL_GROUND_Y - 28,
        hp: 120,
        damage: 14,
        phase: 3.2,
        attackTimer: 1.45,
      },
    ],
    objectives: [
      { id: 'guanabara', label: 'Baia de Guanabara', concept: 'Baia e estuario', x: 420, y: 338 },
      { id: 'mata-atlantica-rj', label: 'Mata Atlantica', concept: 'Encostas verdes', x: 1450, y: 336 },
      { id: 'zona-costeira', label: 'Zona costeira', concept: 'Praia e cidade', x: 2420, y: 330 },
    ],
  },
  vitoria: {
    capital: 'vitoria',
    route: 'sudeste',
    city: 'Vitoria',
    introTitle: 'Vitoria: Sentinela do Manguezal',
    introObjective:
      'Atravesse a capital-ilha, recupere porto, pontes e manguezais urbanos para derrotar a Sentinela do Manguezal.',
    finishLabel: 'Restaurar a capital-ilha',
    gateHint: 'Colete os 3 marcos e derrote os impactos de porto, manguezal e urbanizacao costeira para liberar o chefe.',
    victoryTitle: 'Vitoria concluida',
    victoryBody:
      'Voce conectou ilha, baia, pontes, porto, manguezal e relevo costeiro em uma leitura geografica completa do Espirito Santo.',
    boss: {
      name: 'Sentinela do Manguezal',
      hp: 450,
      damage: 18,
      attackTimer: 1.18,
      spawnText: 'A Sentinela do Manguezal emergiu!',
      pressureText: 'Mar em pressao!',
      victoryText: 'Vitoria restaurada!',
    },
    enemies: [
      {
        id: 'es-port-flow',
        kind: 'traffic',
        name: 'Fluxo Portuario',
        concept: 'Logistica portuaria',
        baseX: 620,
        feetY: CAPITAL_GROUND_Y,
        hp: 102,
        damage: 13,
        phase: 0.3,
        attackTimer: 1.08,
      },
      {
        id: 'es-salt-haze',
        kind: 'smog',
        name: 'Neblina Salina',
        concept: 'Clima costeiro',
        baseX: 1180,
        feetY: CAPITAL_GROUND_Y - 76,
        hp: 92,
        damage: 11,
        phase: 1.55,
        attackTimer: 1.3,
      },
      {
        id: 'es-mangrove-channel',
        kind: 'flood',
        name: 'Canal do Mangue',
        concept: 'Manguezal urbano',
        baseX: 1700,
        feetY: CAPITAL_GROUND_Y,
        hp: 114,
        damage: 14,
        phase: 2.05,
        attackTimer: 0.95,
      },
      {
        id: 'es-coastal-heat',
        kind: 'heat',
        name: 'Ilha de Concreto',
        concept: 'Urbanizacao costeira',
        baseX: 2280,
        feetY: CAPITAL_GROUND_Y - 28,
        hp: 126,
        damage: 14,
        phase: 3.25,
        attackTimer: 1.34,
      },
    ],
    objectives: [
      { id: 'porto-vitoria', label: 'Porto de Vitoria', concept: 'Fluxos economicos', x: 430, y: 338 },
      { id: 'manguezal-urbano', label: 'Manguezal urbano', concept: 'Ecossistema costeiro', x: 1460, y: 336 },
      { id: 'capital-ilha', label: 'Capital-ilha', concept: 'Pontes e baia', x: 2420, y: 330 },
    ],
  },
  curitiba: {
    capital: 'curitiba',
    route: 'sul',
    city: 'Curitiba',
    introTitle: 'Curitiba: Neblina das Araucárias',
    introObjective:
      'Atravesse parques, tubos de transporte e corredores verdes para dissipar a Neblina das Araucárias.',
    finishLabel: 'Restaurar a capital verde',
    gateHint: 'Colete os 3 marcos e derrote os impactos de mobilidade, drenagem, frio urbano e pressão sobre áreas verdes.',
    victoryTitle: 'Curitiba concluída',
    victoryBody:
      'Você conectou planejamento urbano, transporte integrado, parques lineares, araucárias e clima subtropical em uma leitura geográfica completa.',
    boss: {
      name: 'Neblina das Araucárias',
      hp: 435,
      damage: 17,
      attackTimer: 1.22,
      spawnText: 'A Neblina das Araucárias tomou a cidade!',
      pressureText: 'Frio em pressão!',
      victoryText: 'Curitiba restaurada!',
    },
    enemies: [
      {
        id: 'pr-transit-grid',
        kind: 'traffic',
        name: 'Tubo Travado',
        concept: 'Transporte integrado',
        baseX: 620,
        feetY: CAPITAL_GROUND_Y,
        hp: 98,
        damage: 12,
        phase: 0.25,
        attackTimer: 1.12,
      },
      {
        id: 'pr-cold-haze',
        kind: 'smog',
        name: 'Geada Cinzenta',
        concept: 'Clima subtropical',
        baseX: 1180,
        feetY: CAPITAL_GROUND_Y - 80,
        hp: 88,
        damage: 11,
        phase: 1.5,
        attackTimer: 1.3,
      },
      {
        id: 'pr-linear-park',
        kind: 'flood',
        name: 'Canal Gelado',
        concept: 'Drenagem e parques',
        baseX: 1700,
        feetY: CAPITAL_GROUND_Y,
        hp: 108,
        damage: 14,
        phase: 2.12,
        attackTimer: 0.98,
      },
      {
        id: 'pr-urban-heat',
        kind: 'heat',
        name: 'Asfalto Frio',
        concept: 'Microclima urbano',
        baseX: 2260,
        feetY: CAPITAL_GROUND_Y - 28,
        hp: 118,
        damage: 13,
        phase: 3.05,
        attackTimer: 1.42,
      },
    ],
    objectives: [
      { id: 'jardim-botanico', label: 'Jardim Botânico', concept: 'Paisagem urbana', x: 430, y: 338 },
      { id: 'araucarias', label: 'Araucárias', concept: 'Floresta Ombrófila Mista', x: 1460, y: 336 },
      { id: 'transporte-integrado', label: 'Transporte integrado', concept: 'Mobilidade urbana', x: 2420, y: 330 },
    ],
  },
  florianopolis: {
    capital: 'florianopolis',
    route: 'sul',
    city: 'Florianópolis',
    introTitle: 'Florianópolis: Tormenta da Ilha',
    introObjective:
      'Atravesse pontes, lagoas, dunas e morros costeiros para acalmar a Tormenta da Ilha.',
    finishLabel: 'Restaurar a capital-ilha',
    gateHint: 'Colete os 3 marcos e derrote os impactos de mobilidade insular, turismo, dunas, lagoas e urbanização costeira.',
    victoryTitle: 'Florianópolis concluída',
    victoryBody:
      'Você conectou ilha, pontes, lagoas, dunas, restinga, Mata Atlântica, turismo e mobilidade em uma leitura geográfica completa.',
    boss: {
      name: 'Tormenta da Ilha',
      hp: 445,
      damage: 18,
      attackTimer: 1.16,
      spawnText: 'A Tormenta da Ilha fechou a baía!',
      pressureText: 'Vento costeiro em pressão!',
      victoryText: 'Florianópolis restaurada!',
    },
    enemies: [
      {
        id: 'sc-bridge-flow',
        kind: 'traffic',
        name: 'Ponte Travada',
        concept: 'Mobilidade insular',
        baseX: 620,
        feetY: CAPITAL_GROUND_Y,
        hp: 104,
        damage: 13,
        phase: 0.28,
        attackTimer: 1.06,
      },
      {
        id: 'sc-salt-mist',
        kind: 'smog',
        name: 'Bruma Salina',
        concept: 'Clima costeiro',
        baseX: 1180,
        feetY: CAPITAL_GROUND_Y - 76,
        hp: 92,
        damage: 11,
        phase: 1.45,
        attackTimer: 1.26,
      },
      {
        id: 'sc-lagoon-surge',
        kind: 'flood',
        name: 'Lagoa Revolta',
        concept: 'Lagoas e drenagem',
        baseX: 1700,
        feetY: CAPITAL_GROUND_Y,
        hp: 116,
        damage: 14,
        phase: 2.08,
        attackTimer: 0.94,
      },
      {
        id: 'sc-dune-pressure',
        kind: 'heat',
        name: 'Duna Pressionada',
        concept: 'Turismo e restinga',
        baseX: 2280,
        feetY: CAPITAL_GROUND_Y - 28,
        hp: 126,
        damage: 14,
        phase: 3.18,
        attackTimer: 1.32,
      },
    ],
    objectives: [
      { id: 'ponte-hercilio-luz', label: 'Ponte Hercílio Luz', concept: 'Conexão ilha-continente', x: 430, y: 338 },
      { id: 'lagoa-conceicao', label: 'Lagoa da Conceição', concept: 'Lagoa costeira', x: 1460, y: 336 },
      { id: 'dunas-restinga', label: 'Dunas e restinga', concept: 'Ecossistema costeiro', x: 2420, y: 330 },
    ],
  },
  'porto-alegre': {
    capital: 'porto-alegre',
    route: 'sul',
    city: 'Porto Alegre',
    introTitle: 'Porto Alegre: Crepúsculo do Guaíba',
    introObjective:
      'Atravesse a orla, ilhas, parques e canais urbanos para conter o Crepúsculo do Guaíba.',
    finishLabel: 'Restaurar a orla do Guaíba',
    gateHint: 'Colete os 3 marcos e derrote os impactos de enchentes, poluição hídrica, mobilidade e pressão sobre ilhas.',
    victoryTitle: 'Porto Alegre concluída',
    victoryBody:
      'Você conectou Guaíba, orla, ilhas, parques urbanos, drenagem, pampas e metrópole em uma leitura geográfica completa.',
    boss: {
      name: 'Crepúsculo do Guaíba',
      hp: 455,
      damage: 18,
      attackTimer: 1.14,
      spawnText: 'O Crepúsculo do Guaíba avançou pela orla!',
      pressureText: 'Cheia em pressão!',
      victoryText: 'Porto Alegre restaurada!',
    },
    enemies: [
      {
        id: 'rs-orla-flow',
        kind: 'traffic',
        name: 'Orla Travada',
        concept: 'Mobilidade metropolitana',
        baseX: 620,
        feetY: CAPITAL_GROUND_Y,
        hp: 106,
        damage: 13,
        phase: 0.3,
        attackTimer: 1.05,
      },
      {
        id: 'rs-river-smog',
        kind: 'smog',
        name: 'Bruma do Guaíba',
        concept: 'Qualidade da água',
        baseX: 1180,
        feetY: CAPITAL_GROUND_Y - 76,
        hp: 94,
        damage: 11,
        phase: 1.42,
        attackTimer: 1.24,
      },
      {
        id: 'rs-flood-gate',
        kind: 'flood',
        name: 'Cheia Repentina',
        concept: 'Drenagem e enchentes',
        baseX: 1700,
        feetY: CAPITAL_GROUND_Y,
        hp: 118,
        damage: 15,
        phase: 2.04,
        attackTimer: 0.92,
      },
      {
        id: 'rs-island-heat',
        kind: 'heat',
        name: 'Concreto da Orla',
        concept: 'Urbanização costeira',
        baseX: 2280,
        feetY: CAPITAL_GROUND_Y - 28,
        hp: 128,
        damage: 14,
        phase: 3.12,
        attackTimer: 1.3,
      },
    ],
    objectives: [
      { id: 'orla-guaiba', label: 'Orla do Guaíba', concept: 'Paisagem urbana', x: 430, y: 338 },
      { id: 'ilhas-delta', label: 'Ilhas do delta', concept: 'Ambiente hídrico', x: 1460, y: 336 },
      { id: 'parques-urbanos', label: 'Parques urbanos', concept: 'Qualidade ambiental', x: 2420, y: 330 },
    ],
  },
  brasilia: {
    capital: 'brasilia',
    route: 'centro-oeste',
    city: 'Brasília',
    introTitle: 'Brasília: Eixo do Cerrado',
    introObjective:
      'Atravesse o Eixo Monumental, o Cerrado e o Lago Paranoá para conter o Eixo do Cerrado.',
    finishLabel: 'Restaurar a capital federal',
    gateHint: 'Colete os 3 marcos e derrote os impactos de clima seco, expansão urbana, mobilidade planejada e pressão hídrica.',
    victoryTitle: 'Brasília concluída',
    victoryBody:
      'Você conectou cidade planejada, Cerrado, Eixo Monumental, Lago Paranoá, clima seco e expansão urbana em uma leitura geográfica completa.',
    boss: {
      name: 'Eixo do Cerrado',
      hp: 450,
      damage: 18,
      attackTimer: 1.18,
      spawnText: 'O Eixo do Cerrado rachou o Planalto Central!',
      pressureText: 'Seca em pressão!',
      victoryText: 'Brasília restaurada!',
    },
    enemies: [
      {
        id: 'df-axis-flow',
        kind: 'traffic',
        name: 'Eixo Congestionado',
        concept: 'Cidade planejada',
        baseX: 620,
        feetY: CAPITAL_GROUND_Y,
        hp: 104,
        damage: 13,
        phase: 0.32,
        attackTimer: 1.08,
      },
      {
        id: 'df-dry-haze',
        kind: 'smog',
        name: 'Poeira do Cerrado',
        concept: 'Clima seco',
        baseX: 1180,
        feetY: CAPITAL_GROUND_Y - 78,
        hp: 92,
        damage: 11,
        phase: 1.5,
        attackTimer: 1.26,
      },
      {
        id: 'df-paranoa-water',
        kind: 'flood',
        name: 'Canal do Paranoá',
        concept: 'Gestão da água',
        baseX: 1700,
        feetY: CAPITAL_GROUND_Y,
        hp: 116,
        damage: 14,
        phase: 2.1,
        attackTimer: 0.96,
      },
      {
        id: 'df-heat-island',
        kind: 'heat',
        name: 'Asfalto Vermelho',
        concept: 'Ilha de calor',
        baseX: 2280,
        feetY: CAPITAL_GROUND_Y - 28,
        hp: 126,
        damage: 14,
        phase: 3.16,
        attackTimer: 1.34,
      },
    ],
    objectives: [
      { id: 'eixo-monumental', label: 'Eixo Monumental', concept: 'Planejamento urbano', x: 430, y: 338 },
      { id: 'lago-paranoa', label: 'Lago Paranoá', concept: 'Recursos hídricos', x: 1460, y: 336 },
      { id: 'cerrado-df', label: 'Cerrado', concept: 'Bioma do Planalto', x: 2420, y: 330 },
    ],
  },};

export function getCapitalStageDefinition(capital: CapitalId): CapitalStageDefinition {
  const definition = CAPITAL_STAGE_DEFINITIONS[capital];
  if (!definition) throw new Error(`Capital stage is not playable yet: ${capital}`);
  return definition;
}

function createEnemies(definitions: CapitalEnemyDefinition[]): CapitalEnemyWorld[] {
  return definitions.map((enemy) => ({
    ...enemy,
    x: enemy.baseX,
    maxHp: enemy.hp,
    alive: true,
    hitFlash: 0,
    shake: 0,
    slowed: 0,
  }));
}

function createObjectives(definitions: CapitalObjectiveDefinition[]): CapitalObjectiveWorld[] {
  return definitions.map((objective) => ({ ...objective, collected: false }));
}
export class CapitalStageEngine {
  private player: PlayerWorld;
  private enemies: CapitalEnemyWorld[];
  private objectives: CapitalObjectiveWorld[];
  private projectiles: ProjectileWorld[] = [];
  private pickups: PickupWorld[] = [];
  private particles: ParticleWorld[] = [];
  private boss: CapitalBossWorld;
  private camera = 0;
  private score = 0;
  private combo = 0;
  private comboTimer = 0;
  private bossGate = false;
  private nextId = 1;
  private time = 0;
  private specialsTried = 0;
  private specialsCorrect = 0;
  private readonly boost: GuardianBoost;
  private readonly guardian: RegionId;
  private readonly accent: string;
  private readonly speed: number;
  private readonly jump: number;
  private readonly attack: number;
  private readonly special: number;
  private readonly definition: CapitalStageDefinition;

  constructor(guardian: RegionId, capital: CapitalId = 'sao-paulo') {
    this.definition = getCapitalStageDefinition(capital);
    this.enemies = createEnemies(this.definition.enemies);
    this.objectives = createObjectives(this.definition.objectives);
    this.boss = {
      name: this.definition.boss.name,
      x: CAPITAL_STAGE_W - 360,
      feetY: CAPITAL_GROUND_Y - 4,
      hp: this.definition.boss.hp,
      maxHp: this.definition.boss.hp,
      damage: this.definition.boss.damage,
      active: false,
      hitFlash: 0,
      shake: 0,
      attackTimer: this.definition.boss.attackTimer,
      windup: 0,
      enraged: false,
    };
    const character = CHARACTERS[guardian];
    this.guardian = guardian;
    this.boost = CAPITAL_GUARDIAN_BOOSTS[guardian];
    this.accent = character.themeColor;
    this.speed = character.stats.velocidade + this.boost.speed;
    this.jump = character.stats.pulo + (guardian === 'centro-oeste' ? 16 : 0);
    this.attack = character.stats.ataque + this.boost.attack;
    this.special = character.stats.poderEspecial + this.boost.attack * 2;
    const maxHp = character.stats.vida + this.boost.hp;
    this.player = {
      x: 110,
      feetY: CAPITAL_GROUND_Y,
      vx: 0,
      vy: 0,
      facing: 1,
      hp: maxHp,
      maxHp,
      energy: 0,
      onGround: true,
      crouching: false,
      state: 'idle',
      stateTimer: 0,
      attackCooldown: 0,
      attackTimer: 0,
      invuln: 0,
      guardFlash: 0,
    };
  }

  get currentScore(): number {
    return this.score;
  }

  guardianPower(): string {
    return this.boost.label;
  }

  starsEarned(): number {
    let stars = 1;
    if (this.objectives.every((objective) => objective.collected)) stars += 1;
    if (this.player.hp >= this.player.maxHp * 0.55 && this.specialsCorrect >= 1) stars += 1;
    return stars;
  }

  private multiplier(): number {
    return clamp(this.combo, 1, 5);
  }

  private spawnText(x: number, y: number, text: string, color = this.accent): void {
    this.particles.push({
      id: this.nextId++,
      kind: 'text',
      x,
      y,
      vy: -42,
      life: 1,
      maxLife: 1,
      text,
      color,
    });
  }

  private spawnDamage(x: number, y: number, amount: number): void {
    this.particles.push({
      id: this.nextId++,
      kind: 'damage',
      x,
      y,
      vy: -62,
      life: 0.72,
      maxLife: 0.72,
      text: `-${Math.round(amount)}`,
      color: '#fff3a1',
    });
  }

  private spawnSpark(x: number, y: number, color = this.accent): void {
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

  private firePlayer(): void {
    const p = this.player;
    this.projectiles.push({
      id: this.nextId++,
      x: p.x + CAPITAL_PLAYER_W / 2 + p.facing * 42,
      y: p.feetY - CAPITAL_PLAYER_H * 0.53,
      vx: p.facing * PROJECTILE_SPEED,
      vy: 0,
      r: 22,
      color: this.accent,
      team: 'player',
      damage: this.attack,
      life: 0.8,
    });
  }

  private fireEnemy(fromX: number, fromY: number, damage: number, color: string, low = false): void {
    const targetX = this.player.x + CAPITAL_PLAYER_W / 2;
    const targetY = this.player.feetY - (low ? 38 : 88);
    const dx = targetX - fromX;
    const dy = targetY - fromY;
    const len = Math.hypot(dx, dy) || 1;
    this.projectiles.push({
      id: this.nextId++,
      x: fromX,
      y: fromY,
      vx: (dx / len) * ENEMY_PROJECTILE_SPEED,
      vy: (dy / len) * ENEMY_PROJECTILE_SPEED,
      r: low ? 18 : 20,
      color,
      team: 'enemy',
      damage,
      life: 3.2,
    });
  }

  private hurtPlayer(amount: number, sourceX: number): void {
    const p = this.player;
    if (p.invuln > 0) return;
    const reduced = Math.round(amount * this.boost.damageTaken);
    p.hp -= reduced;
    p.invuln = HIT_INVULN;
    p.state = 'hit';
    p.stateTimer = 0.34;
    p.vy = -300;
    p.onGround = false;
    p.x = clamp(p.x + (p.x < sourceX ? -34 : 34), 0, CAPITAL_STAGE_W - CAPITAL_PLAYER_W);
    this.spawnDamage(p.x + CAPITAL_PLAYER_W / 2, p.feetY - CAPITAL_PLAYER_H * 0.58, reduced);
  }

  private damageEnemy(enemy: CapitalEnemyWorld, amount: number): void {
    enemy.hp -= amount;
    enemy.hitFlash = 0.16;
    enemy.shake = 0.22;
    if (this.guardian === 'sul') enemy.slowed = Math.max(enemy.slowed, 1.7);
    this.spawnDamage(enemy.x + CAPITAL_ENEMY_SIZE / 2, enemy.feetY - CAPITAL_ENEMY_SIZE * 0.7, amount);
    this.spawnSpark(enemy.x + CAPITAL_ENEMY_SIZE / 2, enemy.feetY - CAPITAL_ENEMY_SIZE / 2);
    if (enemy.hp > 0) return;

    enemy.alive = false;
    this.combo += 1;
    this.comboTimer = this.guardian === 'centro-oeste' ? COMBO_WINDOW + 1 : COMBO_WINDOW;
    const points = 120 * this.multiplier();
    this.score += points;
    this.player.energy = Math.min(CAPITAL_MAX_ENERGY, this.player.energy + 18 + this.boost.energyGain);
    this.spawnText(enemy.x + 30, enemy.feetY - 104, `+${points} ${enemy.concept}`, '#ffe26b');
    this.dropPickup(enemy.x + CAPITAL_ENEMY_SIZE / 2, enemy.feetY - 70);
  }

  private dropPickup(x: number, y: number): void {
    const kind: PickupKind = this.player.hp < this.player.maxHp * 0.58 ? 'heal' : Math.random() > 0.45 ? 'geo' : 'boost';
    this.pickups.push({ id: this.nextId++, kind, x, y, life: 8 });
  }

  private activateBoss(): void {
    if (this.boss.active) return;
    this.boss.active = true;
    this.boss.x = Math.max(this.player.x + 520, CAPITAL_STAGE_W - 460);
    this.boss.feetY = CAPITAL_GROUND_Y - 4;
    this.spawnText(this.player.x + 380, 170, this.definition.boss.spawnText, '#ffe26b');
  }

  private damageBoss(amount: number): void {
    const boss = this.boss;
    boss.hp -= amount;
    boss.hitFlash = 0.18;
    boss.shake = 0.35;
    this.spawnDamage(boss.x + CAPITAL_BOSS_W / 2, boss.feetY - CAPITAL_BOSS_H * 0.62, amount);
    this.spawnSpark(boss.x + CAPITAL_BOSS_W / 2, boss.feetY - CAPITAL_BOSS_H / 2, '#ffe26b');
    if (!boss.enraged && boss.hp <= boss.maxHp * 0.45) {
      boss.enraged = true;
      this.spawnText(boss.x + 20, boss.feetY - CAPITAL_BOSS_H - 18, this.definition.boss.pressureText, '#ff8a59');
    }
    if (boss.hp <= 0) {
      boss.hp = 0;
      boss.active = false;
      this.score += 650;
      this.spawnText(boss.x, boss.feetY - CAPITAL_BOSS_H, this.definition.boss.victoryText, '#7bf0a1');
    }
  }

  applySpecial(correct: boolean): void {
    this.specialsTried += 1;
    if (correct) this.specialsCorrect += 1;
    this.player.energy = correct ? 0 : 45;
    this.player.state = correct ? 'victory' : 'hit';
    this.player.stateTimer = 0.42;
    if (this.boss.active) {
      this.damageBoss(correct ? this.special * 3.2 : this.special * 0.7);
      return;
    }
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      const distance = Math.abs(enemy.x - this.player.x);
      if (distance < 520 || correct) this.damageEnemy(enemy, correct ? this.special * 1.55 : this.special * 0.55);
    }
  }

  private updateMovement(dt: number, input: InputState): void {
    const p = this.player;
    p.crouching = input.crouch && p.onGround && p.attackTimer <= 0 && p.state !== 'hit';
    let move = 0;
    if (input.left) move -= 1;
    if (input.right) move += 1;
    const maxSpeed = this.speed * (p.crouching ? 0.45 : 1);
    const target = move * maxSpeed;
    const rate = move === 0 ? 2300 : 1900;
    p.vx += clamp(target - p.vx, -rate * dt, rate * dt);
    if (move !== 0) p.facing = move > 0 ? 1 : -1;

    if (input.jumpPressed) {
      input.jumpPressed = false;
      if (p.onGround && !p.crouching) {
        p.vy = -this.jump;
        p.onGround = false;
      }
    }

    if (input.attackPressed) {
      input.attackPressed = false;
      if (p.attackCooldown <= 0 && !p.crouching) {
        p.attackCooldown = ATTACK_COOLDOWN;
        p.attackTimer = ATTACK_DURATION;
        p.state = 'attack';
        p.stateTimer = ATTACK_DURATION;
        this.firePlayer();
      }
    }

    p.vy += GRAVITY * dt;
    p.x = clamp(p.x + p.vx * dt, 0, CAPITAL_STAGE_W - CAPITAL_PLAYER_W);
    p.feetY += p.vy * dt;
    if (p.feetY >= CAPITAL_GROUND_Y) {
      p.feetY = CAPITAL_GROUND_Y;
      p.vy = 0;
      p.onGround = true;
    } else {
      p.onGround = false;
    }
  }

  private updateEnemies(dt: number): void {
    const p = this.player;
    const pcx = p.x + CAPITAL_PLAYER_W / 2;
    const pxMin = p.x + (CAPITAL_PLAYER_W - PLAYER_HITBOX_W) / 2;
    const pxMax = pxMin + PLAYER_HITBOX_W;
    const pTop = p.feetY - (p.crouching ? CROUCH_HITBOX_H : PLAYER_HITBOX_H);
    for (const enemy of this.enemies) {
      enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
      enemy.shake = Math.max(0, enemy.shake - dt);
      enemy.slowed = Math.max(0, enemy.slowed - dt);
      if (!enemy.alive) continue;
      enemy.phase += dt * (enemy.slowed > 0 ? 0.45 : 1);
      const slowFactor = enemy.slowed > 0 ? 0.48 : 1;
      const dx = pcx - enemy.x;

      if (enemy.kind === 'traffic') {
        if (Math.abs(dx) < 560) enemy.baseX += Math.sign(dx) * 78 * slowFactor * dt;
        enemy.feetY = CAPITAL_GROUND_Y;
      } else if (enemy.kind === 'flood') {
        enemy.baseX += Math.sin(enemy.phase * 1.8) * 32 * slowFactor * dt;
        enemy.feetY = CAPITAL_GROUND_Y - Math.max(0, Math.sin(enemy.phase * 3.2)) * 44;
      } else {
        enemy.feetY = CAPITAL_GROUND_Y - (enemy.kind === 'smog' ? 88 : 40) - Math.sin(enemy.phase * 1.8) * 16;
      }
      enemy.x = enemy.baseX + Math.sin(enemy.phase) * (enemy.kind === 'traffic' ? 8 : 18);

      enemy.attackTimer -= dt * slowFactor;
      if (enemy.attackTimer <= 0 && Math.abs(dx) < 620) {
        enemy.attackTimer = enemy.kind === 'heat' ? 1.15 : enemy.kind === 'smog' ? 1.35 : 1.75;
        if (enemy.kind !== 'traffic') {
          this.fireEnemy(
            enemy.x + CAPITAL_ENEMY_SIZE / 2,
            enemy.feetY - CAPITAL_ENEMY_SIZE / 2,
            enemy.damage,
            enemy.kind === 'heat' ? '#ff8a59' : enemy.kind === 'flood' ? '#53c8ff' : '#a7adb5',
            enemy.kind === 'flood',
          );
        }
      }

      const exMin = enemy.x + 15;
      const exMax = enemy.x + CAPITAL_ENEMY_SIZE - 15;
      const eTop = enemy.feetY - CAPITAL_ENEMY_SIZE;
      if (pxMin < exMax && pxMax > exMin && pTop < enemy.feetY && p.feetY > eTop) {
        if (p.vy > 90 && p.feetY < eTop + 42) {
          this.damageEnemy(enemy, this.attack * 1.55);
          p.vy = -620;
          p.onGround = false;
          p.energy = Math.min(CAPITAL_MAX_ENERGY, p.energy + 14 + this.boost.energyGain);
        } else {
          this.hurtPlayer(enemy.damage, enemy.x);
        }
      }
    }
  }

  private updateBoss(dt: number): void {
    const boss = this.boss;
    boss.hitFlash = Math.max(0, boss.hitFlash - dt);
    boss.shake = Math.max(0, boss.shake - dt);
    if (!boss.active) return;
    const p = this.player;
    const speed = boss.enraged ? 92 : 64;
    const desired = p.x + (boss.x > p.x ? 360 : -360);
    boss.x += Math.sign(desired - boss.x) * speed * dt;
    boss.x = clamp(boss.x, 120, CAPITAL_STAGE_W - CAPITAL_BOSS_W - 20);
    boss.feetY = CAPITAL_GROUND_Y - 10 - Math.sin(this.time * 1.8) * 18;

    if (boss.windup > 0) {
      boss.windup = Math.max(0, boss.windup - dt);
      if (boss.windup === 0) {
        const shots = boss.enraged ? [-95, -10, 75] : [-48, 44];
        for (const offset of shots) {
          this.fireEnemy(
            boss.x + CAPITAL_BOSS_W / 2,
            boss.feetY - CAPITAL_BOSS_H / 2,
            Math.round(boss.damage * (boss.enraged ? 0.78 : 0.68)),
            '#ffbf47',
            offset > 50,
          );
        }
      }
    } else {
      boss.attackTimer -= dt;
      if (boss.attackTimer <= 0) {
        boss.attackTimer = boss.enraged ? 1 : 1.45;
        boss.windup = 0.42;
      }
    }

    const pxMin = p.x + 24;
    const pxMax = p.x + CAPITAL_PLAYER_W - 24;
    const pTop = p.feetY - (p.crouching ? CROUCH_HITBOX_H : PLAYER_HITBOX_H);
    if (pxMin < boss.x + CAPITAL_BOSS_W - 25 && pxMax > boss.x + 25 && pTop < boss.feetY && p.feetY > boss.feetY - CAPITAL_BOSS_H) {
      this.hurtPlayer(boss.damage, boss.x);
    }
  }

  private updateProjectiles(dt: number): void {
    const p = this.player;
    for (const projectile of this.projectiles) {
      projectile.x += projectile.vx * dt;
      projectile.y += projectile.vy * dt;
      projectile.life -= dt;
      if (projectile.life <= 0) continue;

      if (projectile.team === 'player') {
        if (this.boss.active) {
          const hitBoss =
            Math.abs(projectile.x - (this.boss.x + CAPITAL_BOSS_W / 2)) < CAPITAL_BOSS_W / 2 + projectile.r
            && Math.abs(projectile.y - (this.boss.feetY - CAPITAL_BOSS_H / 2)) < CAPITAL_BOSS_H / 2 + projectile.r;
          if (hitBoss) {
            projectile.life = 0;
            this.boss.hitFlash = 0.12;
            this.player.energy = Math.min(CAPITAL_MAX_ENERGY, this.player.energy + 16 + this.boost.energyGain);
            this.spawnSpark(projectile.x, projectile.y, '#ffe26b');
            continue;
          }
        }
        for (const enemy of this.enemies) {
          if (!enemy.alive) continue;
          const hit =
            Math.abs(projectile.x - (enemy.x + CAPITAL_ENEMY_SIZE / 2)) < CAPITAL_ENEMY_SIZE / 2 + projectile.r
            && Math.abs(projectile.y - (enemy.feetY - CAPITAL_ENEMY_SIZE / 2)) < CAPITAL_ENEMY_SIZE / 2 + projectile.r;
          if (hit) {
            projectile.life = 0;
            this.damageEnemy(enemy, projectile.damage);
            this.player.energy = Math.min(CAPITAL_MAX_ENERGY, this.player.energy + 14 + this.boost.energyGain);
            break;
          }
        }
      } else {
        const hitboxH = p.crouching ? CROUCH_HITBOX_H : PLAYER_HITBOX_H;
        const centerY = p.crouching ? p.feetY - 34 : p.feetY - 82;
        const centerX = p.x + CAPITAL_PLAYER_W / 2;
        const guarded = p.crouching && projectile.y < p.feetY - 18 && projectile.y > p.feetY - 112;
        if (guarded && Math.abs(projectile.x - centerX) < 64) {
          projectile.life = 0;
          p.energy = Math.min(CAPITAL_MAX_ENERGY, p.energy + 10 + this.boost.energyGain);
          p.guardFlash = 0.18;
          this.spawnText(centerX, centerY - 22, 'Defesa + foco', '#7bf0a1');
          continue;
        }
        const hit =
          Math.abs(projectile.x - centerX) < PLAYER_HITBOX_W / 2 + projectile.r
          && Math.abs(projectile.y - centerY) < hitboxH / 2 + projectile.r;
        if (hit) {
          projectile.life = 0;
          this.hurtPlayer(projectile.damage, projectile.x);
        }
      }
    }
    this.projectiles = this.projectiles.filter(
      (projectile) => projectile.life > 0 && projectile.x > -80 && projectile.x < CAPITAL_STAGE_W + 80 && projectile.y > -120 && projectile.y < CAPITAL_VIEW_H + 120,
    );
  }

  private updateObjectivesAndPickups(dt: number): void {
    const p = this.player;
    const pcx = p.x + CAPITAL_PLAYER_W / 2;
    const pcy = p.feetY - CAPITAL_PLAYER_H / 2;
    for (const objective of this.objectives) {
      if (objective.collected) continue;
      if (Math.abs(objective.x - pcx) < 72 && Math.abs(objective.y - pcy) < 96) {
        objective.collected = true;
        this.score += 180;
        p.energy = Math.min(CAPITAL_MAX_ENERGY, p.energy + 28 + this.boost.energyGain);
        this.spawnText(objective.x, objective.y - 24, objective.label, '#ffe26b');
      }
    }
    for (const pickup of this.pickups) {
      pickup.life -= dt;
      pickup.y += Math.sin((8 - pickup.life) * 4) * 0.28;
      if (Math.abs(pickup.x - pcx) < 58 && Math.abs(pickup.y - pcy) < 88) {
        if (pickup.kind === 'heal') {
          const amount = this.guardian === 'norte' ? 30 : 22;
          p.hp = Math.min(p.maxHp, p.hp + amount);
          this.spawnText(pickup.x, pickup.y, `+${amount} vida`, '#7bf0a1');
        } else if (pickup.kind === 'boost') {
          p.energy = Math.min(CAPITAL_MAX_ENERGY, p.energy + 32 + this.boost.energyGain);
          this.spawnText(pickup.x, pickup.y, '+foco', '#ffe26b');
        } else {
          this.score += 70;
          p.energy = Math.min(CAPITAL_MAX_ENERGY, p.energy + 18 + this.boost.energyGain);
          this.spawnText(pickup.x, pickup.y, '+geografia', '#9ee9ff');
        }
        pickup.life = 0;
      }
    }
    this.pickups = this.pickups.filter((pickup) => pickup.life > 0);
  }

  private updateParticles(dt: number): void {
    for (const particle of this.particles) {
      particle.y += particle.vy * dt;
      particle.life -= dt;
    }
    this.particles = this.particles.filter((particle) => particle.life > 0);
  }

  step(dt: number, input: InputState): CapitalStepOutcome {
    this.time += dt;
    this.bossGate = false;

    if (input.specialPressed) {
      input.specialPressed = false;
      if (this.player.energy >= SPECIAL_COST) return 'requestSpecial';
    }

    this.updateMovement(dt, input);
    this.updateProjectiles(dt);
    this.updateEnemies(dt);
    this.updateBoss(dt);
    this.updateObjectivesAndPickups(dt);
    this.updateParticles(dt);

    this.player.attackTimer = Math.max(0, this.player.attackTimer - dt);
    this.player.attackCooldown = Math.max(0, this.player.attackCooldown - dt);
    this.player.invuln = Math.max(0, this.player.invuln - dt);
    this.player.guardFlash = Math.max(0, this.player.guardFlash - dt);
    this.player.stateTimer = Math.max(0, this.player.stateTimer - dt);
    if (this.comboTimer > 0) {
      this.comboTimer = Math.max(0, this.comboTimer - dt);
      if (this.comboTimer === 0) this.combo = 0;
    }

    if (this.player.stateTimer <= 0) {
      if (this.player.crouching) this.player.state = 'crouch';
      else if (!this.player.onGround) this.player.state = 'jump';
      else if (Math.abs(this.player.vx) > 6) this.player.state = 'walk';
      else this.player.state = 'idle';
    }

    if (
      this.player.x > CAPITAL_STAGE_W - 780
      && this.objectives.every((objective) => objective.collected)
      && this.enemies.every((enemy) => !enemy.alive)
    ) {
      this.activateBoss();
    } else if (this.player.x > CAPITAL_STAGE_W - 850 && !this.boss.active) {
      this.bossGate = true;
    }

    this.camera = clamp(this.player.x + CAPITAL_PLAYER_W / 2 - CAPITAL_VIEW_W / 2, 0, CAPITAL_STAGE_W - CAPITAL_VIEW_W);
    if (this.player.hp <= 0) {
      this.player.hp = 0;
      return 'defeat';
    }
    if (!this.boss.active && this.boss.hp <= 0) return 'victory';
    return 'playing';
  }

  view(): CapitalStageView {
    const p = this.player;
    return {
      px: p.x,
      pfeet: p.feetY,
      pstate: p.state,
      pfacing: p.facing,
      guarding: p.crouching,
      guardFlash: p.guardFlash > 0,
      blinking: p.invuln > 0 && Math.floor(this.time * 16) % 2 === 0,
      hp: p.hp,
      maxHp: p.maxHp,
      energy: p.energy,
      score: this.score,
      camera: this.camera,
      combo: this.combo,
      comboMultiplier: this.multiplier(),
      objectiveCount: this.objectives.filter((objective) => objective.collected).length,
      totalObjectives: this.objectives.length,
      bossGate: this.bossGate,
      boss: this.boss.active
        ? {
            name: this.boss.name,
            x: this.boss.x,
            feetY: this.boss.feetY,
            hp: this.boss.hp,
            maxHp: this.boss.maxHp,
            hitFlash: this.boss.hitFlash,
            shake: this.boss.shake,
            charging: this.boss.windup > 0,
            enraged: this.boss.enraged,
          }
        : null,
      enemies: this.enemies
        .filter((enemy) => enemy.alive)
        .map((enemy) => ({
          id: enemy.id,
          kind: enemy.kind,
          name: enemy.name,
          concept: enemy.concept,
          x: enemy.x,
          feetY: enemy.feetY,
          hp: enemy.hp,
          maxHp: enemy.maxHp,
          hitFlash: enemy.hitFlash,
          shake: enemy.shake,
          slowed: enemy.slowed > 0,
        })),
      projectiles: [...this.projectiles],
      objectives: this.objectives.map((objective) => ({ ...objective })),
      pickups: [...this.pickups],
      particles: this.particles.map((particle) => ({
        id: particle.id,
        kind: particle.kind,
        x: particle.x,
        y: particle.y,
        text: particle.text,
        color: particle.color,
        alpha: Math.max(0, particle.life / particle.maxLife),
        scale: particle.kind === 'spark' ? 1 + (1 - particle.life / particle.maxLife) * 1.7 : 1,
      })),
    };
  }
}
