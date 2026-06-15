import type { CSSProperties } from 'react';
import type { RegionalProblem } from '../../data/types';

interface EnemyProps {
  problem: RegionalProblem;
  x: number;
  feetY: number;
  size: number;
  hp: number;
  maxHp: number;
  /** > 0 logo após ser atingido (flash branco). */
  hitFlash: number;
}

/**
 * Inimigo/problema regional como placeholder visual (bloco colorido + emoji),
 * com barra de vida. Estrutura pronta para receber sprites: substitua o emoji
 * por uma imagem/spritesheet usando `problem` quando a arte existir.
 */
export function Enemy({ problem, x, feetY, size, hp, maxHp, hitFlash }: EnemyProps) {
  const ratio = Math.max(0, hp / maxHp);
  const style: CSSProperties = {
    left: x,
    top: feetY - size,
    width: size,
    height: size,
    '--enemy-color': problem.color,
    filter: hitFlash > 0 ? 'brightness(2.4) saturate(0.4)' : undefined,
  } as CSSProperties;

  return (
    <div className="stage-enemy" style={style} role="img" aria-label={problem.name}>
      <div className="stage-enemy-healthbar">
        <span style={{ width: `${ratio * 100}%` }} />
      </div>
      <div className="stage-enemy-body">
        <span className="stage-enemy-emoji" aria-hidden>{problem.emoji}</span>
      </div>
      <span className="stage-enemy-label">{problem.name}</span>
    </div>
  );
}
