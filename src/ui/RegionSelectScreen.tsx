import { REGION_LIST } from '../data/regions';
import type { GameProgress, RegionId } from '../data/types';
import { GuardianSprite } from './GuardianSprite';

interface RegionSelectScreenProps {
  progress: GameProgress;
  onQuiz: (region: RegionId) => void;
  onPlayStage: (region: RegionId) => void;
  onCapitals: () => void;
  onBack: () => void;
}

export function RegionSelectScreen({ progress, onQuiz, onPlayStage, onCapitals, onBack }: RegionSelectScreenProps) {
  return (
    <main className="region-screen">
      <header className="game-topbar">
        <button className="btn-ghost" onClick={onBack}>Início</button>
        <div className="topbar-title">
          <span className="eyebrow">Jornada pelo Brasil</span>
          <h1>Escolha sua próxima região</h1>
        </div>
        <div className="score-pill" aria-label={`${progress.totalScore} pontos`}>
          <span>Pontos</span>
          <strong>{progress.totalScore}</strong>
        </div>
      </header>

      <section className="region-grid" aria-label="Regiões do Brasil">
        {REGION_LIST.map((region) => {
          const completed = progress.completedRegions.includes(region.id);
          const stageDone = progress.completedStages.includes(region.id);
          const score = progress.bestScores[region.id] ?? 0;
          const starCount = progress.stageStars[region.id] ?? 0;
          return (
            <article
              className={`region-card region-${region.id} ${completed ? 'completed' : ''}`}
              key={region.id}
              style={{ '--region-color': region.themeColor, '--region-accent': region.accentColor } as React.CSSProperties}
            >
              <div className="region-card-art">
                <span className="region-number">0{REGION_LIST.indexOf(region) + 1}</span>
                {stageDone
                  ? <span className="badge-earned">Fase vencida</span>
                  : completed && <span className="badge-earned">Selo do quiz</span>}
                {stageDone && (
                  <span className="card-stars" aria-label={`${starCount} de 3 estrelas`}>
                    {[1, 2, 3].map((n) => (
                      <span key={n} className={n <= starCount ? 'on' : ''}>★</span>
                    ))}
                  </span>
                )}
                <GuardianSprite region={region.id} state={completed ? 'victory' : 'idle'} />
              </div>
              <div className="region-card-content">
                <span className="region-biome">{region.biome}</span>
                <h2>{region.name}</h2>
                <h3>{region.guardian.name}</h3>
                <p>{region.shortDescription}</p>
                <div className="region-card-footer">
                  <span>{score > 0 ? `Melhor quiz: ${score} pts` : '5 perguntas'}</span>
                  <div className="region-card-buttons">
                    <button className="btn-region btn-region-quiz" onClick={() => onQuiz(region.id)}>
                      📚 Quiz rápido
                    </button>
                    <button className="btn-region btn-region-play" onClick={() => onPlayStage(region.id)}>
                      🎮 Jogar fase
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {progress.masterOfBrazil && (
        <div className="master-banner" role="status">
          <span>🏆 Você venceu as cinco regiões e é <strong>Mestre do Brasil</strong>!</span>
          <button className="btn-primary" type="button" onClick={onCapitals}>Desafio das Capitais</button>
        </div>
      )}

      <div className="badge-trail" aria-label="Progresso de regiões">
        {REGION_LIST.map((region) => (
          <div className={progress.badges.includes(region.id) ? 'trail-item earned' : 'trail-item'} key={region.id}>
            <span>{progress.badges.includes(region.id) ? '✓' : '·'}</span>
            {region.name}
          </div>
        ))}
      </div>
    </main>
  );
}

