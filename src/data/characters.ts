import araucaProcessed from '../assets/characters/processed/arauca-pose-sheet-transparent.png';
import buritiProcessed from '../assets/characters/processed/buriti-pose-sheet-transparent.png';
import iareProcessed from '../assets/characters/processed/iare-pose-sheet-transparent.png';
import jequiProcessed from '../assets/characters/processed/jequi-pose-sheet-transparent.png';
import mandacaruProcessed from '../assets/characters/processed/mandacaru-pose-sheet-transparent.png';
import type { AnimationState, CharacterStats, RegionId } from './types';

export interface CharacterData {
  id: string;
  name: string;
  region: RegionId;
  description: string;
  /** Cor temática do guardião (corTematica). */
  themeColor: string;
  originalAsset: string;
  /** Asset usado em tela (sprite com fundo transparente). */
  processedAsset: string;
  guardianType: string;
  /**
   * Direção para a qual a arte-base aponta. O jogo espelha o sprite para que
   * ele olhe sempre na direção do movimento; se a arte for trocada por uma que
   * aponta para a direita, basta mudar este campo.
   */
  spriteFaces: 'left' | 'right';
  /** Atributos de gameplay (vida, velocidade, pulo, ataque, poderEspecial). */
  stats: CharacterStats;
  sheet: {
    width: number;
    height: number;
    frameCount: number;
    approximateFrameWidth: number;
  };
  animationFrames: Record<AnimationState, number>;
}

const animationFrames: Record<AnimationState, number> = {
  idle: 0,
  walk: 1,
  jump: 2,
  attack: 3,
  hit: 3,
  victory: 4,
};

export const CHARACTERS: Record<RegionId, CharacterData> = {
  norte: {
    id: 'iare',
    name: 'Iarê',
    region: 'norte',
    description: 'Guardiã das águas e da floresta amazônica.',
    themeColor: '#22c9b7',
    originalAsset: 'src/assets/characters/iare/iare-pose-sheet-original.png',
    processedAsset: iareProcessed,
    guardianType: 'Guardiã das águas',
    spriteFaces: 'left',
    stats: { vida: 100, velocidade: 230, pulo: 720, ataque: 16, poderEspecial: 45 },
    sheet: { width: 1916, height: 821, frameCount: 5, approximateFrameWidth: 383 },
    animationFrames,
  },
  nordeste: {
    id: 'mandacaru',
    name: 'Mandacaru',
    region: 'nordeste',
    description: 'Guardião do sertão e da resistência da caatinga.',
    themeColor: '#f4a340',
    originalAsset: 'src/assets/characters/mandacaru/mandacaru-pose-sheet-original.png',
    processedAsset: mandacaruProcessed,
    guardianType: 'Guardião do sertão',
    spriteFaces: 'left',
    stats: { vida: 120, velocidade: 205, pulo: 690, ataque: 20, poderEspecial: 48 },
    sheet: { width: 1916, height: 821, frameCount: 5, approximateFrameWidth: 383 },
    animationFrames,
  },
  'centro-oeste': {
    id: 'buriti',
    name: 'Buriti',
    region: 'centro-oeste',
    description: 'Guardiã dos caminhos do cerrado e do pantanal.',
    themeColor: '#efc24c',
    originalAsset: 'src/assets/characters/buriti/buriti-pose-sheet-original.png',
    processedAsset: buritiProcessed,
    guardianType: 'Guardiã do cerrado e pantanal',
    spriteFaces: 'right',
    stats: { vida: 105, velocidade: 240, pulo: 730, ataque: 17, poderEspecial: 46 },
    sheet: { width: 1672, height: 941, frameCount: 5, approximateFrameWidth: 334 },
    animationFrames,
  },
  sudeste: {
    id: 'jequi',
    name: 'Jequi',
    region: 'sudeste',
    description: 'Guardião da mata atlântica e das grandes cidades.',
    themeColor: '#65b7ff',
    originalAsset: 'src/assets/characters/jequi/jequi-pose-sheet-original.png',
    processedAsset: jequiProcessed,
    guardianType: 'Guardião da mata e das cidades',
    spriteFaces: 'right',
    stats: { vida: 110, velocidade: 225, pulo: 705, ataque: 18, poderEspecial: 47 },
    sheet: { width: 1774, height: 887, frameCount: 5, approximateFrameWidth: 355 },
    animationFrames,
  },
  sul: {
    id: 'arauca',
    name: 'Araucá',
    region: 'sul',
    description: 'Guardião dos pampas, do frio e das araucárias.',
    themeColor: '#9ee9ff',
    originalAsset: 'src/assets/characters/arauca/arauca-pose-sheet-original.png',
    processedAsset: araucaProcessed,
    guardianType: 'Guardião dos pampas e araucárias',
    spriteFaces: 'right',
    stats: { vida: 115, velocidade: 215, pulo: 700, ataque: 19, poderEspecial: 47 },
    sheet: { width: 1916, height: 821, frameCount: 5, approximateFrameWidth: 383 },
    animationFrames,
  },
};
