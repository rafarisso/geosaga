import type { PointerEvent } from 'react';
import type { GameButton } from '../../hooks/useKeyboardControls';

interface MobileControlsProps {
  setButton: (button: GameButton, isDown: boolean) => void;
  attackVerb: string;
  specialVerb: string;
  specialReady: boolean;
}

/**
 * Botões virtuais para toque. Direcionais usam press/release; ações (pulo,
 * ataque, especial) disparam no toque. Também funcionam com mouse para teste.
 */
export function MobileControls({ setButton, attackVerb, specialVerb, specialReady }: MobileControlsProps) {
  const hold = (button: GameButton) => ({
    onPointerDown: (event: PointerEvent) => {
      event.preventDefault();
      setButton(button, true);
    },
    onPointerUp: (event: PointerEvent) => {
      event.preventDefault();
      setButton(button, false);
    },
    onPointerLeave: () => setButton(button, false),
    onPointerCancel: () => setButton(button, false),
  });

  const tap = (button: GameButton) => ({
    onPointerDown: (event: PointerEvent) => {
      event.preventDefault();
      setButton(button, true);
    },
  });

  return (
    <div className="stage-mobile-controls" aria-hidden={false}>
      <div className="stage-pad-left">
        <button className="stage-pad-btn" aria-label="Mover para a esquerda" {...hold('left')}>◀</button>
        <button className="stage-pad-btn" aria-label="Mover para a direita" {...hold('right')}>▶</button>
      </div>
      <div className="stage-pad-right">
        <button className="stage-action-btn stage-action-jump" aria-label="Pular" {...tap('jump')}>
          ⤴<small>Pular</small>
        </button>
        <button className="stage-action-btn stage-action-attack" aria-label={attackVerb} {...tap('attack')}>
          ✦<small>{attackVerb}</small>
        </button>
        <button
          className={`stage-action-btn stage-action-special ${specialReady ? 'ready' : 'locked'}`}
          aria-label={specialVerb}
          {...tap('special')}
        >
          ★<small>{specialVerb}</small>
        </button>
      </div>
    </div>
  );
}
