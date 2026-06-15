import { useEffect, useRef } from 'react';

export type GameButton = 'left' | 'right' | 'jump' | 'attack' | 'special';

/**
 * Estado de entrada lido pelo loop do jogo a cada quadro.
 * - `left`/`right`: mantidos enquanto a tecla/botão está pressionado.
 * - `jump`/`attack`/`special`: disparos (edge) consumidos pelo loop.
 */
export interface InputState {
  left: boolean;
  right: boolean;
  jumpPressed: boolean;
  attackPressed: boolean;
  specialPressed: boolean;
}

function createInput(): InputState {
  return {
    left: false,
    right: false,
    jumpPressed: false,
    attackPressed: false,
    specialPressed: false,
  };
}

const KEY_MAP: Record<string, GameButton> = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  KeyA: 'left',
  KeyD: 'right',
  Space: 'jump',
  ArrowUp: 'jump',
  KeyW: 'jump',
  KeyJ: 'attack',
  KeyK: 'special',
};

export interface KeyboardControls {
  inputRef: React.RefObject<InputState>;
  /** Aciona um botão virtual (mobile). isDown=true ao tocar, false ao soltar. */
  setButton: (button: GameButton, isDown: boolean) => void;
}

/**
 * Captura controles de teclado e expõe uma API para botões virtuais (mobile),
 * ambos alimentando o mesmo `InputState`. `enabled=false` ignora o teclado
 * (ex.: enquanto o modal de quiz está aberto).
 */
export function useKeyboardControls(enabled = true): KeyboardControls {
  const inputRef = useRef<InputState>(createInput());

  const setButton = (button: GameButton, isDown: boolean) => {
    const input = inputRef.current;
    if (button === 'left' || button === 'right') {
      input[button] = isDown;
    } else if (isDown) {
      if (button === 'jump') input.jumpPressed = true;
      if (button === 'attack') input.attackPressed = true;
      if (button === 'special') input.specialPressed = true;
    }
  };

  useEffect(() => {
    if (!enabled) {
      // Solta direções ao desabilitar para evitar movimento "preso".
      inputRef.current.left = false;
      inputRef.current.right = false;
      return;
    }

    const handleDown = (event: KeyboardEvent) => {
      const button = KEY_MAP[event.code];
      if (!button) return;
      event.preventDefault();
      if (event.repeat && button !== 'left' && button !== 'right') return;
      setButton(button, true);
    };

    const handleUp = (event: KeyboardEvent) => {
      const button = KEY_MAP[event.code];
      if (!button) return;
      event.preventDefault();
      if (button === 'left' || button === 'right') setButton(button, false);
    };

    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
    };
  }, [enabled]);

  return { inputRef, setButton };
}
