import type { CSSProperties } from 'react';
import { CHARACTERS } from '../../data/characters';
import type { AnimationState, RegionId } from '../../data/types';

interface PlayerProps {
  region: RegionId;
  state: AnimationState;
  facing: 1 | -1;
  /** Canto esquerdo do personagem em coordenadas do mundo. */
  x: number;
  /** Posição dos pés do personagem em coordenadas do mundo. */
  feetY: number;
  width: number;
  height: number;
  /** Pisca enquanto invulnerável após levar dano. */
  blinking: boolean;
}

/**
 * Renderiza o guardião controlável recortando o frame correspondente ao
 * estado de animação a partir do spritesheet (mesma técnica de GuardianSprite).
 * Preparado para spritesheets reais: troque `animationFrames`/`frameCount` em
 * characters.ts e o recorte por frame passa a usar as animações finais.
 */
export function Player({ region, state, facing, x, feetY, width, height, blinking }: PlayerProps) {
  const character = CHARACTERS[region];
  const frame = character.animationFrames[state];
  const maxFrame = character.sheet.frameCount - 1;
  const position = maxFrame === 0 ? 0 : (frame / maxFrame) * 100;

  const style: CSSProperties = {
    left: x,
    top: feetY - height,
    width,
    height,
    backgroundImage: `url(${character.processedAsset})`,
    backgroundSize: `${character.sheet.frameCount * 100}% auto`,
    backgroundPosition: `${position}% center`,
    transform: `scaleX(${facing})`,
    opacity: blinking ? 0.45 : 1,
  };

  return (
    <div
      className={`stage-player stage-player-${state}`}
      style={style}
      role="img"
      aria-label={`${character.name} em ação`}
    />
  );
}
