import type { StageDefinition } from '../../data/types';

interface HUDProps {
  guardianName: string;
  stage: StageDefinition;
  themeColor: string;
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  score: number;
  enemiesRemaining: number;
  totalEnemies: number;
  specialReady: boolean;
  goalActive: boolean;
  onExit: () => void;
}

/** Camada de interface da fase: vida, energia/conhecimento, objetivo e progresso. */
export function HUD({
  guardianName,
  stage,
  themeColor,
  hp,
  maxHp,
  energy,
  maxEnergy,
  score,
  enemiesRemaining,
  totalEnemies,
  specialReady,
  goalActive,
  onExit,
}: HUDProps) {
  const hpRatio = Math.max(0, hp / maxHp);
  const energyRatio = Math.max(0, Math.min(1, energy / maxEnergy));

  return (
    <div className="stage-hud" style={{ '--region-color': themeColor } as React.CSSProperties}>
      <div className="stage-hud-top">
        <div className="stage-hud-bars">
          <span className="stage-hud-name">{guardianName}</span>
          <div className="stage-bar stage-bar-health" aria-label={`Vida ${Math.round(hp)} de ${maxHp}`}>
            <span style={{ width: `${hpRatio * 100}%` }} />
            <small>❤️ {Math.max(0, Math.round(hp))}</small>
          </div>
          <div
            className={`stage-bar stage-bar-energy ${specialReady ? 'ready' : ''}`}
            aria-label={`Conhecimento ${Math.round(energyRatio * 100)}%`}
          >
            <span style={{ width: `${energyRatio * 100}%` }} />
            <small>💡 {specialReady ? 'Golpe especial pronto!' : 'Conhecimento'}</small>
          </div>
        </div>

        <div className="stage-hud-meta">
          <div className="stage-score-pill">
            <span>Pontos</span>
            <strong>{score}</strong>
          </div>
          <button className="stage-exit-btn" onClick={onExit}>Sair</button>
        </div>
      </div>

      <div className="stage-objective" role="status">
        <span className="stage-objective-tag">Objetivo</span>
        <p>{goalActive ? 'Alcance o totem brilhante para concluir a missão!' : stage.objective}</p>
        <span className="stage-objective-count">
          {goalActive ? '✦ Caminho liberado' : `Problemas restantes: ${enemiesRemaining}/${totalEnemies}`}
        </span>
      </div>
    </div>
  );
}
