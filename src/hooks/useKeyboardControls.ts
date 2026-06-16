import { useCallback, useEffect, useRef } from 'react';

export type GameButton = 'left' | 'right' | 'jump' | 'crouch' | 'attack' | 'special';

/**
 * Estado de entrada lido pelo loop do jogo a cada quadro.
 * - `left`/`right`: mantidos enquanto a tecla/botão está pressionado.
 * - `jump`/`attack`/`special`: disparos (edge) consumidos pelo loop.
 */
export interface InputState {
  left: boolean;
  right: boolean;
  crouch: boolean;
  jumpPressed: boolean;
  attackPressed: boolean;
  specialPressed: boolean;
}

function createInput(): InputState {
  return {
    left: false,
    right: false,
    crouch: false,
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
  ArrowDown: 'crouch',
  KeyS: 'crouch',
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

  const resetInput = useCallback(() => {
    inputRef.current = createInput();
  }, []);

  const setButton = useCallback((button: GameButton, isDown: boolean) => {
    if (!enabled) return;
    const input = inputRef.current;
    if (button === 'left' || button === 'right' || button === 'crouch') {
      input[button] = isDown;
    } else if (isDown) {
      if (button === 'jump') input.jumpPressed = true;
      if (button === 'attack') input.attackPressed = true;
      if (button === 'special') input.specialPressed = true;
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      resetInput();
      return;
    }

    const handleDown = (event: KeyboardEvent) => {
      const button = KEY_MAP[event.code];
      if (!button) return;
      event.preventDefault();
      if (event.repeat && button !== 'left' && button !== 'right' && button !== 'crouch') return;
      setButton(button, true);
    };

    const handleUp = (event: KeyboardEvent) => {
      const button = KEY_MAP[event.code];
      if (!button) return;
      event.preventDefault();
      if (button === 'left' || button === 'right' || button === 'crouch') setButton(button, false);
    };

    const handleVisibility = () => {
      if (document.hidden) resetInput();
    };

    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    window.addEventListener('blur', resetInput);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
      window.removeEventListener('blur', resetInput);
      document.removeEventListener('visibilitychange', handleVisibility);
      resetInput();
    };
  }, [enabled, resetInput, setButton]);

  return { inputRef, setButton };
}
