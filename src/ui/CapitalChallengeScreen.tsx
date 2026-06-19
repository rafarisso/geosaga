import { useState, type CSSProperties } from 'react';
import capitalsSudesteBg from '../assets/backgrounds/capitals-sudeste-cinematic-bg.png';
import centroOesteCinematicBg from '../assets/backgrounds/centro-oeste-cinematic-bg.png';
import nordesteCinematicBg from '../assets/backgrounds/nordeste-cinematic-bg.png';
import sulCinematicBg from '../assets/backgrounds/sul-cinematic-bg.png';
import { CapitalPlayableStage } from '../components/game/CapitalPlayableStage';
import { PLAYABLE_CAPITAL_IDS } from '../components/game/capitalStageEngine';
import { CAPITAL_MISSIONS, CAPITAL_ROUTE_IDS, CAPITAL_ROUTE_META } from '../data/capitalChallenges';
import type { CapitalId, CapitalMissionResult, CapitalRouteId, GameProgress } from '../data/types';

interface CapitalChallengeScreenProps {
  progress: GameProgress;
  initialCapitalId?: CapitalId | null;
  onBack: () => void;
  onCompleteMission: (result: CapitalMissionResult) => void;
}

const DEFAULT_ROUTE: CapitalRouteId = 'sudeste';
const PLAYABLE_CAPITALS = new Set<CapitalId>(PLAYABLE_CAPITAL_IDS);
const CAPITAL_ROUTE_BACKGROUNDS: Record<CapitalRouteId, string> = {
  sudeste: capitalsSudesteBg,
  sul: sulCinematicBg,
  'centro-oeste': centroOesteCinematicBg,
  nordeste: nordesteCinematicBg,
};

function isPlayableCapital(id: CapitalId): boolean {
  return PLAYABLE_CAPITALS.has(id);
}

function firstMissionIdForRoute(route: CapitalRouteId): CapitalId {
  const mission =
    CAPITAL_MISSIONS.find((item) => item.route === route && isPlayableCapital(item.id))
    ?? CAPITAL_MISSIONS.find((item) => item.route === route)
    ?? CAPITAL_MISSIONS[0]!;
  return mission.id;
}
function missionRouteForCapital(capital: CapitalId | null | undefined): CapitalRouteId | null {
  const mission = capital ? CAPITAL_MISSIONS.find((item) => item.id === capital) : undefined;
  return mission?.route ?? null;
}

export function CapitalChallengeScreen({ progress, initialCapitalId, onBack, onCompleteMission }: CapitalChallengeScreenProps) {
  const requestedRoute = missionRouteForCapital(initialCapitalId);
  const firstOpenRoute = CAPITAL_ROUTE_IDS.find((route) => !progress.completedCapitalRoutes.includes(route)) ?? DEFAULT_ROUTE;
  const initialRoute = requestedRoute ?? firstOpenRoute;
  const initialMissionId = requestedRoute ? initialCapitalId! : firstMissionIdForRoute(initialRoute);
  const [selectedRouteId, setSelectedRouteId] = useState<CapitalRouteId>(initialRoute);
  const [selectedId, setSelectedId] = useState<CapitalId>(initialMissionId);

  const routeMissions = CAPITAL_MISSIONS.filter((mission) => mission.route === selectedRouteId);
  const selected = routeMissions.find((mission) => mission.id === selectedId) ?? routeMissions[0] ?? CAPITAL_MISSIONS[0]!;
  const routeMeta = CAPITAL_ROUTE_META[selectedRouteId];
  const routePlayableIds = routeMissions.filter((mission) => isPlayableCapital(mission.id)).map((mission) => mission.id);
  const selectedCompleted = progress.completedCapitals.includes(selected.id);
  const completedPlayableCount = routePlayableIds.filter((id) => progress.completedCapitals.includes(id)).length;

  function chooseRoute(route: CapitalRouteId) {
    setSelectedRouteId(route);
    setSelectedId(firstMissionIdForRoute(route));
  }

  return (
    <main
      className="capital-screen capital-screen-playable"
      style={{ '--capitals-bg': `url(${CAPITAL_ROUTE_BACKGROUNDS[selectedRouteId]})` } as CSSProperties}
    >
      <header className="capital-topbar">
        <button className="btn-ghost" onClick={onBack}>Voltar</button>
        <div>
          <span className="eyebrow">Modo pós-jogo</span>
          <h1>Campanha das Capitais: {routeMeta.name}</h1>
          <p>{routeMeta.description}</p>
        </div>
        <div className="capital-route-score">
          <span>Jogáveis</span>
          <strong>{completedPlayableCount}/{routePlayableIds.length}</strong>
        </div>
      </header>

      <section className="capital-region-tabs" aria-label="Escolha a região das capitais">
        {CAPITAL_ROUTE_IDS.map((route) => {
          const missions = CAPITAL_MISSIONS.filter((mission) => mission.route === route);
          const playable = missions.filter((mission) => isPlayableCapital(mission.id));
          const completed = playable.filter((mission) => progress.completedCapitals.includes(mission.id)).length;
          return (
            <button
              className={route === selectedRouteId ? 'active' : ''}
              key={route}
              type="button"
              onClick={() => chooseRoute(route)}
            >
              <strong>{CAPITAL_ROUTE_META[route].name}</strong>
              <span>{CAPITAL_ROUTE_META[route].label}</span>
              <small>{completed}/{playable.length} jogáveis</small>
            </button>
          );
        })}
      </section>

      <section className="capital-route-map" aria-label="Rota das capitais">
        {routeMissions.map((mission, index) => {
          const done = progress.completedCapitals.includes(mission.id);
          const playable = isPlayableCapital(mission.id);
          return (
            <button
              className={`capital-route-stop ${mission.id === selected.id ? 'active' : ''} ${done ? 'done' : ''} ${!playable ? 'planned' : ''}`}
              key={mission.id}
              type="button"
              onClick={() => setSelectedId(mission.id)}
            >
              <span>{index + 1}</span>
              <strong>{mission.city}</strong>
              <small>{done ? `${progress.capitalStars[mission.id] ?? 1} estrelas` : playable ? 'Fase jogável' : 'Próxima entrega'}</small>
            </button>
          );
        })}
      </section>

      {isPlayableCapital(selected.id) ? (
        <CapitalPlayableStage
          key={selected.id}
          mission={selected}
          completed={selectedCompleted}
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
            <strong>Próxima fase jogável</strong>
            <span>
              Esta capital vai seguir o modelo jogável da campanha: cenário gerado em imagem, guardiões jogáveis,
              inimigos próprios, boss urbano e quiz apenas como golpe especial.
            </span>
          </div>
        </section>
      )}
    </main>
  );
}