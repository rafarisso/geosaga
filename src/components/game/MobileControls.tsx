import type { PointerEvent } from 'react';
import type { GameButton } from '../../hooks/useKeyboardControls';

interface MobileControlsProps {
  setButton: (button: GameButton, isDown: boolean) => void;
  attackVerb: string;
  specialVerb: string;
  specialReady: boolean;
}

/**
 * Controles de toque para o celular (paisagem). Direcionais grandes à esquerda
 * (press/release), botão de ataque em destaque e ações à direita, dentro da
 * área segura. Pensado para os polegares — não imita teclas de teclado.
 */
export function MobileControls({ setButton, attackVerb, specialVerb, specialReady }: MobileControlsProps) {
  const hold = (button: GameButton) => ({
    onPointerDown: (event: PointerEvent) => {
      event.preventDefault();
      try {
        event.currentTarget.setPointerCapture?.(event.pointerId);
      } catch {
        // Alguns navegadores podem rejeitar a captura; o controle segue funcionando.
      }
      setButton(button, true);
    },
    onPointerUp: (event: PointerEvent) => {
      event.preventDefault();
      setButton(button, false);
    },
    onPointerLeave: () => setButton(button, false),
    onPointerCancel: () => setButton(button, false),
    onLostPointerCapture: () => setButton(button, false),
  });

  const tap = (button: GameButton) => ({
    onPointerDown: (event: PointerEvent) => {
      event.preventDefault();
      navigator.vibrate?.(button === 'special' ? 20 : 8);
      setButton(button, true);
    },
  });

  return (
    <div className="stage-touch" aria-label="Controles de toque">
      <div className="stage-touch-dpad">
        <button className="touch-btn touch-dir" aria-label="Mover para a esquerda" {...hold('left')}>◀</button>
        <button className="touch-btn touch-dir" aria-label="Mover para a direita" {...hold('right')}>▶</button>
      </div>

      <div className="stage-touch-actions">
        <button className="touch-btn touch-jump" aria-label="Pular" {...tap('jump')}>
          <span aria-hidden>⤴</span><small>Pular</small>
        </button>
        <button className="touch-btn touch-attack" aria-label={attackVerb} {...tap('attack')}>
          <span aria-hidden>🌊</span><small>{attackVerb}</small>
        </button>
        <button
          className={`touch-btn touch-special ${specialReady ? 'ready' : 'locked'}`}
          aria-label={specialReady ? specialVerb : `${specialVerb}: carregando conhecimento`}
          disabled={!specialReady}
          {...tap('special')}
        >
          <span aria-hidden>⭐</span><small>{specialVerb}</small>
        </button>
      </div>
    </div>
  );
}
