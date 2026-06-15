import araucaProcessed from '../assets/characters/processed/arauca-pose-sheet-transparent.png';
import buritiProcessed from '../assets/characters/processed/buriti-pose-sheet-transparent.png';
import iareProcessed from '../assets/characters/processed/iare-pose-sheet-transparent.png';
import jequiProcessed from '../assets/characters/processed/jequi-pose-sheet-transparent.png';
import mandacaruProcessed from '../assets/characters/processed/mandacaru-pose-sheet-transparent.png';
import type { AnimationState, RegionId } from './types';

export interface CharacterData {
  id: string;
  name: string;
  region: RegionId;
  description: string;
  themeColor: string;
  originalAsset: string;
  processedAsset: string;
  guardianType: string;
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
    sheet: { width: 1916, height: 821, frameCount: 5, approximateFrameWidth: 383 },
    animationFrames,
  },
};
