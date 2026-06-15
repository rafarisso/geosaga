import { useState } from 'react';
import logo from '../assets/logo/logo-geosaga.png';
import { REGION_LIST } from '../data/regions';
import type { GameProgress } from '../data/types';
import { GuardianSprite } from './GuardianSprite';

interface StartScreenProps {
  onPlay: () => void;
  onContinue: () => void;
  progress: GameProgress;
}

export function StartScreen({ onPlay, onContinue, progress }: StartScreenProps) {
  const [showHowTo, setShowHowTo] = useState(false);
  const hasProgress = progress.lastRegion !== null || progress.totalScore > 0;

  return (
    <main className="start-screen">
      <div className="sun-glow" />
      <div className="landscape landscape-back" />
      <div className="landscape landscape-front" />

      <section className="hero-copy">
        <span className="hero-kicker">Uma aventura educativa pelo Brasil</span>
        <img className="game-logo" src={logo} alt="GeoSaga" />
        <p className="start-subtitle">
          Enfrente os cinco guardiões, desvende os biomas e domine a geografia de cada região.
        </p>
        <div className="start-actions">
          <button className="btn-primary btn-large" onClick={onPlay}>Jogar</button>
          <button className="btn-secondary" onClick={() => setShowHowTo(true)}>Como jogar</button>
          <button className="btn-continue" onClick={onContinue} disabled={!hasProgress}>
            Continuar
            <small>{hasProgress ? `${progress.totalScore} pontos salvos` : 'Nenhum progresso salvo'}</small>
          </button>
        </div>
      </section>

      <section className="guardian-lineup" aria-label="Os cinco guardiões do GeoSaga">
        {REGION_LIST.map((region) => (
          <div className={`lineup-guardian lineup-${region.id}`} key={region.id}>
            <GuardianSprite region={region.id} />
            <span>{region.guardian.name}</span>
          </div>
        ))}
      </section>

      <footer className="creator-credit">
        Desenvolvedor: Profº Rafael Risso - Geografia|
      </footer>

      {showHowTo && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowHowTo(false)}>
          <section className="how-to-card" role="dialog" aria-modal="true" aria-labelledby="how-to-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowHowTo(false)} aria-label="Fechar">×</button>
            <span className="eyebrow">Manual do explorador</span>
            <h2 id="how-to-title">Como jogar</h2>
            <ol>
              <li>Escolha uma das cinco regiões brasileiras.</li>
              <li>Responda às cinco perguntas do guardião.</li>
              <li>Leia as explicações para aprender com cada resposta.</li>
              <li>Consiga pelo menos três acertos para conquistar o selo regional.</li>
              <li>Complete as cinco regiões e torne-se Mestre do Brasil.</li>
            </ol>
            <button className="btn-primary" onClick={() => { setShowHowTo(false); onPlay(); }}>Começar jornada</button>
          </section>
        </div>
      )}
    </main>
  );
}
