import { useEffect, useRef } from 'react';

/**
 * Loop de jogo com simulação fixa em 60 Hz. Quadros lentos executam mais de um
 * passo de física, mantendo velocidade e dificuldade consistentes no celular.
 *
 * `running` permite pausar o loop (ex.: durante o quiz ou tela de vitória)
 * sem desmontar o componente.
 */
export function useGameLoop(callback: (deltaSeconds: number) => boolean | void, running = true): void {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!running) return;

    let frameId = 0;
    let last = performance.now();
    let accumulator = 0;
    const fixedStep = 1 / 60;
    const maxFrameDelta = 0.15;
    const maxStepsPerFrame = 6;

    const tick = (now: number) => {
      const delta = Math.min((now - last) / 1000, maxFrameDelta);
      last = now;
      accumulator += delta;

      let steps = 0;
      while (accumulator >= fixedStep && steps < maxStepsPerFrame) {
        const keepRunningThisFrame = callbackRef.current(fixedStep);
        accumulator -= fixedStep;
        steps += 1;
        if (keepRunningThisFrame === false) {
          accumulator = 0;
          break;
        }
      }

      if (steps === maxStepsPerFrame) accumulator = Math.min(accumulator, fixedStep);
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [running]);
}
