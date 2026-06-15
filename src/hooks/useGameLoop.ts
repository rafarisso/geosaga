import { useEffect, useRef } from 'react';

/**
 * Loop de jogo baseado em requestAnimationFrame com passo de tempo limitado.
 * Chama `callback(deltaSeconds)` a cada quadro. O delta é limitado a 1/30 s
 * para evitar "saltos" de física quando a aba volta a ficar ativa.
 *
 * `running` permite pausar o loop (ex.: durante o quiz ou tela de vitória)
 * sem desmontar o componente.
 */
export function useGameLoop(callback: (deltaSeconds: number) => void, running = true): void {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!running) return;

    let frameId = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const delta = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      callbackRef.current(delta);
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [running]);
}
