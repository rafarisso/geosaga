import { useEffect, useRef } from 'react';
import type Phaser from 'phaser';
import { createGame } from '../game/config';

/**
 * Monta o canvas do Phaser dentro de uma div controlada pelo React.
 * O ciclo de vida do jogo segue o do componente: criado no mount,
 * destruído no unmount (importante com o StrictMode em dev).
 */
export function PhaserGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;
    gameRef.current = createGame(containerRef.current);

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="game-container" />;
}
