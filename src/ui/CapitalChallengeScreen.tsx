import { useState, type CSSProperties } from 'react';
import capitalsSudesteBg from '../assets/backgrounds/capitals-sudeste-cinematic-bg.png';
import { CapitalPlayableStage } from '../components/game/CapitalPlayableStage';
import { CAPITAL_MISSIONS } from '../data/capitalChallenges';
import type { CapitalId, CapitalMissionResult, GameProgress } from '../data/types';

interface CapitalChallengeScreenProps {
  progress: GameProgress;
  onBack: () => void;
  onCompleteMission: (result: CapitalMissionResult) => void;
}

const PLAYABLE_CAPITAL: CapitalId = 'sao-paulo';

export function CapitalChallengeScreen({ progress, onBack, onCompleteMission }: CapitalChallengeScreenProps) {
  const [selectedId, setSelectedId] = useState<CapitalId>(PLAYABLE_CAPITAL);
  const selected = CAPITAL_MISSIONS.find((mission) => mission.id === selectedId) ?? CAPITAL_MISSIONS[0];
  const completedSaoPaulo = progress.completedCapitals.includes(PLAYABLE_CAPITAL);

  return (
    <main
      className="capital-screen capital-screen-playable"
      style={{ '--capitals-bg': `url(${capitalsSudesteBg})` } as CSSProperties}
    >
      <header className="capital-topbar">
        <button className="btn-ghost" onClick={onBack}>Voltar</button>
        <div>
          <span className="eyebrow">Modo pos-jogo</span>
          <h1>Campanha das Capitais: Sudeste</h1>
          <p>Agora a rota e jogavel: escolha um guardiao, atravesse a cidade, derrote problemas urbanos e use geografia como poder.</p>
        </div>
        <div className="capital-route-score">
          <span>Modelo</span>
          <strong>{completedSaoPaulo ? '1/4' : '0/4'}</strong>
        </div>
      </header>

      <section className="capital-route-map" aria-label="Rota das capitais">
        {CAPITAL_MISSIONS.map((mission, index) => {
          const done = progress.completedCapitals.includes(mission.id);
          const playable = mission.id === PLAYABLE_CAPITAL;
          return (
            <button
              className={`capital-route-stop ${mission.id === selected.id ? 'active' : ''} ${done ? 'done' : ''} ${!playable ? 'planned' : ''}`}
              key={mission.id}
              type="button"
              onClick={() => setSelectedId(mission.id)}
            >
              <span>{index + 1}</span>
              <strong>{mission.city}</strong>
              <small>{done ? `${progress.capitalStars[mission.id] ?? 1} estrelas` : playable ? 'Fase jogavel' : 'Proxima entrega'}</small>
            </button>
          );
        })}
      </section>

      {selected.id === PLAYABLE_CAPITAL ? (
        <CapitalPlayableStage
          completed={completedSaoPaulo}
          onComplete={onCompleteMission}
        />
      ) : (
        <section className="capital-planned-stage">
          <div>
            <span className="capital-state">{selected.state}</span>
            <h2>{selected.city}</h2>
            <h3>{selected.title}</h3>
            <p>{selected.summary}</p>
          </div>
          <div className="capital-planned-card">
            <strong>Proxima fase jogavel</strong>
            <span>
              Esta capital vai seguir o modelo de Sao Paulo: cenario gerado em imagem, guardioes jogaveis,
              inimigos proprios, boss urbano e quiz apenas como golpe especial.
            </span>
          </div>
        </section>
      )}
    </main>
  );
}
