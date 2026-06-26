import type { CSSProperties } from 'react';
import finaleBg from '../assets/backgrounds/capital-palmas-stage-bg.png';
import { CAPITAL_MISSIONS } from '../data/capitalChallenges';
import type { CapitalRouteId, GameProgress } from '../data/types';

interface CapitalFinaleScreenProps {
  progress: GameProgress;
  onBackToCapitals: () => void;
  onBackToStart: () => void;
}

const ROUTE_NAMES: Record<CapitalRouteId, string> = {
  sudeste: 'Sudeste',
  sul: 'Sul',
  'centro-oeste': 'Centro-Oeste',
  nordeste: 'Nordeste',
  norte: 'Norte',
};

export function CapitalFinaleScreen({ progress, onBackToCapitals, onBackToStart }: CapitalFinaleScreenProps) {
  const completed = new Set(progress.completedCapitals);
  const completedCount = CAPITAL_MISSIONS.filter((mission) => completed.has(mission.id)).length;
  const routeIds = Array.from(new Set(CAPITAL_MISSIONS.map((mission) => mission.route)));
  const routeCount = routeIds.filter((route) => progress.completedCapitalRoutes.includes(route)).length;
  const totalCapitalScore = CAPITAL_MISSIONS.reduce((sum, mission) => sum + (progress.capitalScores[mission.id] ?? 0), 0);
  const totalStars = CAPITAL_MISSIONS.reduce((sum, mission) => sum + (progress.capitalStars[mission.id] ?? 0), 0);
  const maxStars = CAPITAL_MISSIONS.length * 3;

  return (
    <main className="capital-finale-screen" style={{ '--capital-finale-bg': `url(${finaleBg})` } as CSSProperties}>
      <section className="capital-finale-hero">
        <span className="eyebrow">Campanha das capitais concluida</span>
        <h1>Parabens, voce completou as 27 capitais do Brasil.</h1>
        <p>
          Voce atravessou todas as regioes, enfrentou chefes urbanos, decifrou paisagens e conectou rios,
          serras, litoral, cerrado, metropoles e Amazonia em uma jornada geografica completa.
        </p>

        <div className="capital-finale-stats" aria-label="Resumo final da campanha">
          <div>
            <strong>{completedCount}/27</strong>
            <span>capitais vencidas</span>
          </div>
          <div>
            <strong>{routeCount}/5</strong>
            <span>rotas regionais</span>
          </div>
          <div>
            <strong>{totalStars}/{maxStars}</strong>
            <span>estrelas</span>
          </div>
          <div>
            <strong>{totalCapitalScore}</strong>
            <span>pontos nas capitais</span>
          </div>
        </div>

        <div className="capital-finale-routes" aria-label="Regioes finalizadas">
          {routeIds.map((route) => (
            <span className={progress.completedCapitalRoutes.includes(route) ? 'done' : ''} key={route}>
              {ROUTE_NAMES[route]}
            </span>
          ))}
        </div>

        <div className="capital-finale-actions">
          <button className="btn-primary btn-large" onClick={onBackToCapitals}>Rever capitais</button>
          <button className="btn-secondary" onClick={onBackToStart}>Voltar ao inicio</button>
        </div>
      </section>

      <section className="capital-finale-signature" aria-label="Contato do projeto">
        <span>Contato do projeto</span>
        <strong>Desenvolvedor e Prof Rafael de Geografia</strong>
        <a href="mailto:risso_rafa@hotmail.com">risso_rafa@hotmail.com</a>
      </section>
    </main>
  );
}