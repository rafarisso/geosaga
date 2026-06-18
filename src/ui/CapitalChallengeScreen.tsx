import { useMemo, useState, type CSSProperties } from 'react';
import capitalsSudesteBg from '../assets/backgrounds/capitals-sudeste-cinematic-bg.png';
import { CAPITAL_MISSIONS } from '../data/capitalChallenges';
import type { CapitalId, CapitalMissionResult, GameProgress } from '../data/types';

interface CapitalChallengeScreenProps {
  progress: GameProgress;
  onBack: () => void;
  onCompleteMission: (result: CapitalMissionResult) => void;
}

export function CapitalChallengeScreen({ progress, onBack, onCompleteMission }: CapitalChallengeScreenProps) {
  const nextIndex = CAPITAL_MISSIONS.findIndex((mission) => !progress.completedCapitals.includes(mission.id));
  const activeIndex = nextIndex === -1 ? CAPITAL_MISSIONS.length - 1 : nextIndex;
  const [selectedId, setSelectedId] = useState<CapitalId>(CAPITAL_MISSIONS[activeIndex].id);
  const [collected, setCollected] = useState<string[]>([]);
  const [wrongChoice, setWrongChoice] = useState<number | null>(null);

  const selected = useMemo(
    () => CAPITAL_MISSIONS.find((mission) => mission.id === selectedId) ?? CAPITAL_MISSIONS[0],
    [selectedId],
  );
  const selectedIndex = CAPITAL_MISSIONS.findIndex((mission) => mission.id === selected.id);
  const selectedDone = progress.completedCapitals.includes(selected.id);
  const selectedUnlocked = selectedIndex <= activeIndex || selectedDone;
  const allClues = collected.length === selected.clues.length;
  const routeComplete = CAPITAL_MISSIONS.every((mission) => progress.completedCapitals.includes(mission.id));

  function selectCapital(id: CapitalId) {
    const mission = CAPITAL_MISSIONS.find((item) => item.id === id);
    if (!mission) return;
    const index = CAPITAL_MISSIONS.indexOf(mission);
    const done = progress.completedCapitals.includes(id);
    if (index > activeIndex && !done) return;
    setSelectedId(id);
    setCollected([]);
    setWrongChoice(null);
  }

  function collectClue(clue: string) {
    if (!selectedUnlocked || selectedDone || collected.includes(clue)) return;
    setCollected((current) => [...current, clue]);
  }

  function answer(index: number) {
    if (!allClues || selectedDone) return;
    if (index !== selected.question.answerIndex) {
      setWrongChoice(index);
      return;
    }
    const stars = wrongChoice === null ? 3 : 2;
    const score = 400 + selected.clues.length * 80 + stars * 120;
    onCompleteMission({
      capital: selected.id,
      route: selected.route,
      score,
      stars,
      completed: true,
    });
    setWrongChoice(null);
    const nextMission = CAPITAL_MISSIONS[selectedIndex + 1];
    if (nextMission) {
      setSelectedId(nextMission.id);
      setCollected([]);
    }
  }

  return (
    <main
      className="capital-screen"
      style={{ '--capitals-bg': `url(${capitalsSudesteBg})` } as CSSProperties}
    >
      <header className="capital-topbar">
        <button className="btn-ghost" onClick={onBack}>Voltar</button>
        <div>
          <span className="eyebrow">Modo pós-jogo</span>
          <h1>Desafio das Capitais: Sudeste</h1>
          <p>Percorra a rota urbana, colete pistas no cenário e responda para liberar a próxima capital.</p>
        </div>
        <div className="capital-route-score">
          <span>Rota</span>
          <strong>{progress.completedCapitals.length}/4</strong>
        </div>
      </header>

      <section className="capital-route-map" aria-label="Rota das capitais">
        {CAPITAL_MISSIONS.map((mission, index) => {
          const done = progress.completedCapitals.includes(mission.id);
          const unlocked = index <= activeIndex || done;
          return (
            <button
              className={`capital-route-stop ${mission.id === selected.id ? 'active' : ''} ${done ? 'done' : ''}`}
              key={mission.id}
              type="button"
              disabled={!unlocked}
              onClick={() => selectCapital(mission.id)}
            >
              <span>{index + 1}</span>
              <strong>{mission.city}</strong>
              <small>{done ? `${progress.capitalStars[mission.id] ?? 1} estrelas` : unlocked ? 'Disponível' : 'Bloqueada'}</small>
            </button>
          );
        })}
      </section>

      <section className={`capital-mission capital-scenery-${selected.scenery}`}>
        <div className="capital-scene" aria-label={`Cenário de ${selected.city}`}>
          <div className="capital-sky" />
          <div className="capital-depth capital-depth-back" />
          <div className="capital-depth capital-depth-mid" />
          <div className="capital-depth capital-depth-front" />
          {!selectedDone && selected.clues.map((clue, index) => (
            <button
              className={`capital-hotspot hotspot-${index + 1} ${collected.includes(clue) ? 'collected' : ''}`}
              key={clue}
              type="button"
              onClick={() => collectClue(clue)}
            >
              {collected.includes(clue) ? '✓' : index + 1}
            </button>
          ))}
        </div>

        <article className="capital-mission-panel">
          <span className="capital-state">{selected.state}</span>
          <h2>{selected.city}</h2>
          <h3>{selected.title}</h3>
          <p>{selected.summary}</p>
          <div className="capital-brief">
            <strong>Missão</strong>
            <span>{selected.challenge}</span>
          </div>
          <div className="capital-brief visual">
            <strong>Cenário</strong>
            <span>{selected.visualHook}</span>
          </div>

          <div className="capital-clues">
            <div>
              <strong>{collected.length}/{selected.clues.length}</strong>
              <span>{selected.collectLabel}</span>
            </div>
            {selected.clues.map((clue) => (
              <small className={collected.includes(clue) || selectedDone ? 'found' : ''} key={clue}>
                {clue}
              </small>
            ))}
          </div>

          {selectedDone ? (
            <div className="capital-complete-card">
              <strong>Capital concluída</strong>
              <span>{progress.capitalScores[selected.id] ?? 0} pontos</span>
            </div>
          ) : (
            <div className={`capital-quiz ${allClues ? 'ready' : ''}`}>
              <strong>{allClues ? selected.question.statement : 'Colete todas as pistas para liberar o quiz.'}</strong>
              {allClues && (
                <div className="capital-choices">
                  {selected.question.choices.map((choice, index) => (
                    <button
                      className={wrongChoice === index ? 'wrong' : ''}
                      key={choice}
                      type="button"
                      onClick={() => answer(index)}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              )}
              {wrongChoice !== null && <p>{selected.question.explanation}</p>}
            </div>
          )}
        </article>
      </section>

      {routeComplete && (
        <section className="capital-route-complete" role="status">
          <strong>Rota Sudeste concluída.</strong>
          <span>Próximo passo: liberar novas regiões de capitais brasileiras.</span>
        </section>
      )}
    </main>
  );
}
