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
  /** > 0 logo após ser atingido (tremor). */
  shake: number;
}

/**
 * Inimigo/problema regional como placeholder visual (bloco colorido + emoji),
 * com barra de vida. Estrutura pronta para receber sprites: substitua o emoji
 * por uma imagem/spritesheet usando `problem` quando a arte existir.
 */
export function Enemy({ problem, x, feetY, size, hp, maxHp, hitFlash, shake }: EnemyProps) {
  const ratio = Math.max(0, hp / maxHp);
  const offset = shake > 0 ? Math.sin(shake * 60) * 5 : 0;
  const visual = problem.visual ?? 'default';
  const style: CSSProperties = {
    left: x,
    top: feetY - size,
    width: size,
    height: size,
    transform: `translateX(${offset}px)`,
    '--enemy-color': problem.color,
    filter: hitFlash > 0 ? 'brightness(2.4) saturate(0.4)' : undefined,
  } as CSSProperties;

  return (
    <div className={`stage-enemy stage-enemy-visual-${visual} stage-problem-${problem.id}`} style={style} role="img" aria-label={problem.name}>
      <div className="stage-enemy-healthbar">
        <span style={{ width: `${ratio * 100}%` }} />
      </div>
      <div className="stage-enemy-body">
        <span className="stage-enemy-core" aria-hidden />
        <span className="stage-enemy-emoji" aria-hidden>{problem.emoji}</span>
      </div>
      <span className="stage-enemy-label">{problem.name}</span>
    </div>
  );
}
