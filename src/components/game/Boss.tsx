import type { CSSProperties } from 'react';
import type { BossView } from './stageEngine';
import { BOSS_H, BOSS_W } from './stageEngine';

interface BossProps {
  boss: BossView;
}

/** Chefe regional — o "problema-mor" da região, renderizado com arte dedicada. */
export function Boss({ boss }: BossProps) {
  const offset = boss.shake > 0 ? Math.sin(boss.shake * 70) * 7 : 0;
  const visual = boss.visual ?? 'default';
  const style: CSSProperties = {
    left: boss.x,
    top: boss.feetY - BOSS_H,
    width: BOSS_W,
    height: BOSS_H,
    transform: `translateX(${offset}px)`,
    '--boss-color': boss.color,
    filter: boss.hitFlash > 0 ? 'brightness(2.2) saturate(0.5)' : undefined,
  } as CSSProperties;

  const classes = [
    'stage-boss',
    `stage-boss-${visual}`,
    boss.intro ? 'stage-boss-intro' : '',
    boss.charging ? 'stage-boss-charging' : '',
    boss.enraged ? 'stage-boss-enraged' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} style={style} role="img" aria-label={boss.name}>
      <span className="stage-boss-tell" aria-hidden />
      <span className="stage-boss-core" aria-hidden />
      {boss.image ? (
        <img className="stage-boss-image" src={boss.image} alt="" aria-hidden />
      ) : (
        <span className="stage-boss-emoji" aria-hidden>{boss.emoji}</span>
      )}
    </div>
  );
}
