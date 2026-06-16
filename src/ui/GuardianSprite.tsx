import type { CSSProperties } from 'react';
import { CHARACTERS } from '../data/characters';
import type { AnimationState, RegionId } from '../data/types';

interface GuardianSpriteProps {
  region: RegionId;
  state?: AnimationState;
  className?: string;
  label?: string;
}

export function GuardianSprite({ region, state = 'idle', className = '', label }: GuardianSpriteProps) {
  const character = CHARACTERS[region];
  const frame = character.animationFrames[state];
  const maxFrame = character.sheet.frameCount - 1;
  const position = maxFrame === 0 ? 0 : (frame / maxFrame) * 100;
  const frameWidth = character.sheet.width / character.sheet.frameCount;
  const style = {
    backgroundImage: `url(${character.processedAsset})`,
    backgroundSize: `${character.sheet.frameCount * 100}% auto`,
    backgroundPosition: `${position}% center`,
    // Razão de aspecto de um único frame. Onde o sprite usa largura automática
    // (cards de região), isso garante que o personagem caiba pela altura sem
    // cortes. Onde largura e altura são fixas (lineup, quiz), é ignorado.
    aspectRatio: `${frameWidth} / ${character.sheet.height}`,
  } satisfies CSSProperties;

  return (
    <div
      className={`guardian-sprite ${className}`}
      style={style}
      role="img"
      aria-label={label ?? `${character.name}, ${character.guardianType}`}
    />
  );
}

