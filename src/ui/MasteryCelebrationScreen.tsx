import type { CSSProperties } from 'react';
import capitalsSudesteBg from '../assets/backgrounds/capitals-sudeste-cinematic-bg.png';
import { REGION_LIST } from '../data/regions';
import type { GameProgress } from '../data/types';
import { GuardianSprite } from './GuardianSprite';

interface MasteryCelebrationScreenProps {
  progress: GameProgress;
  onStartCapitals: () => void;
  onBackToMap: () => void;
}

export function MasteryCelebrationScreen({ progress, onStartCapitals, onBackToMap }: MasteryCelebrationScreenProps) {
  const totalStars = REGION_LIST.reduce((sum, region) => sum + (progress.stageStars[region.id] ?? 0), 0);

  return (
    <main
      className="mastery-screen"
      style={{ '--capitals-bg': `url(${capitalsSudesteBg})` } as CSSProperties}
    >
      <section className="mastery-hero">
        <span className="eyebrow">Missão nacional cumprida</span>
        <h1>Parabéns, você restaurou as 5 regiões do Brasil.</h1>
        <p>
          Os guardiões reconheceram sua jornada. Agora começa uma etapa maior:
          atravessar capitais brasileiras, cidade por cidade, coletando pistas e vencendo desafios urbanos.
        </p>
        <div className="mastery-stats" aria-label="Resumo da conquista">
          <div>
            <strong>5</strong>
            <span>regiões completas</span>
          </div>
          <div>
            <strong>{totalStars}</strong>
            <span>estrelas regionais</span>
          </div>
          <div>
            <strong>{progress.totalScore}</strong>
            <span>pontos acumulados</span>
          </div>
        </div>
        <div className="mastery-actions">
          <button className="btn-primary btn-large" onClick={onStartCapitals}>Iniciar Capitais</button>
          <button className="btn-secondary" onClick={onBackToMap}>Voltar ao mapa</button>
        </div>
      </section>

      <section className="mastery-guardians" aria-label="Guardiões conquistados">
        {REGION_LIST.map((region) => (
          <article className={`mastery-guardian mastery-guardian-${region.id}`} key={region.id}>
            <GuardianSprite region={region.id} state="victory" />
            <span>{region.name}</span>
          </article>
        ))}
      </section>

      <section className="capital-unlock-card" aria-label="Novo modo desbloqueado">
        <span>Nova jornada desbloqueada</span>
        <h2>Desafio das Capitais: Sudeste</h2>
        <p>São Paulo, Rio de Janeiro, Belo Horizonte e Vitória formam a primeira rota pós-jogo.</p>
      </section>
    </main>
  );
}
