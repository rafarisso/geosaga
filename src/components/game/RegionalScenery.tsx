import type { CSSProperties } from 'react';
import type { SceneryDecoration, StageDefinition } from '../../data/types';
import { STAGE_WIDTH } from './stageEngine';

interface RegionalSceneryProps {
  stage: StageDefinition;
  camera: number;
}

const DEPTH_FACTOR: Record<SceneryDecoration['depth'], number> = {
  far: 0.12,
  mid: 0.28,
  near: 0.55,
};

/** Camadas leves de cenário regional com parallax, sem imagens pesadas. */
export function RegionalScenery({ stage, camera }: RegionalSceneryProps) {
  return (
    <div className={`stage-scenery stage-scenery-${stage.region}`} aria-hidden>
      <div className="stage-scenery-haze" />
      <div className="stage-scenery-ridges" style={{ width: STAGE_WIDTH }} />

      {(['far', 'mid', 'near'] as const).map((depth) => (
        <div
          className={`stage-scenery-layer stage-scenery-${depth}`}
          key={depth}
          style={{
            width: STAGE_WIDTH,
            transform: `translate3d(${-camera * DEPTH_FACTOR[depth]}px, 0, 0)`,
          }}
        >
          {stage.scenery.decorations
            .filter((decoration) => decoration.depth === depth)
            .map((decoration, index) => (
              <span
                className={`stage-decoration stage-decoration-${decoration.kind}`}
                key={`${decoration.kind}-${decoration.x}-${index}`}
                style={{
                  left: decoration.x,
                  bottom: decoration.bottom ?? 68,
                  '--decoration-scale': decoration.scale ?? 1,
                } as CSSProperties}
              />
            ))}
        </div>
      ))}
    </div>
  );
}
