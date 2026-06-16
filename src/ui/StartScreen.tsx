import { useState } from 'react';
import logo from '../assets/logo/logo-geosaga.png';
import { DIFFICULTY_LIST } from '../data/difficulty';
import { REGION_LIST } from '../data/regions';
import type { GameDifficulty, GameProgress } from '../data/types';
import { GuardianSprite } from './GuardianSprite';

interface StartScreenProps {
  onPlay: () => void;
  onContinue: () => void;
  progress: GameProgress;
  difficulty: GameDifficulty;
  onSelectDifficulty: (difficulty: GameDifficulty) => void;
}

export function StartScreen({ onPlay, onContinue, progress, difficulty, onSelectDifficulty }: StartScreenProps) {
  const [showHowTo, setShowHowTo] = useState(false);
  const hasProgress = progress.lastRegion !== null || progress.totalScore > 0;
  const activeDifficulty = DIFFICULTY_LIST.find((option) => option.id === difficulty) ?? DIFFICULTY_LIST[1];

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

        <ul className="start-dynamics" aria-label="Como funciona o jogo">
          <li><span aria-hidden>🌎</span> Explore a fase e restaure os problemas da região</li>
          <li><span aria-hidden>💡</span> Cada acerto carrega seu <strong>conhecimento</strong></li>
          <li><span aria-hidden>⚡</span> Restaure em sequência para o <strong>combo</strong> de pontos</li>
          <li><span aria-hidden>👟</span> Pule na cabeça dos problemas e pegue <strong>itens</strong> de vida e energia</li>
          <li><span aria-hidden>👑</span> No fim, vença o <strong>chefe</strong> respondendo ao quiz</li>
        </ul>

        <div className="start-difficulty" role="group" aria-label="Nível de desafio">
          <span className="start-difficulty-label">Nível de desafio</span>
          <div className="start-difficulty-options">
            {DIFFICULTY_LIST.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`difficulty-chip ${option.id === difficulty ? 'active' : ''}`}
                aria-pressed={option.id === difficulty}
                onClick={() => onSelectDifficulty(option.id)}
              >
                <span aria-hidden>{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
          <small className="start-difficulty-hint">{activeDifficulty.hint}</small>
        </div>

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
        Desenvolvedor: Profº Rafael Risso - Geografia
      </footer>

      {showHowTo && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowHowTo(false)}>
          <section className="how-to-card" role="dialog" aria-modal="true" aria-labelledby="how-to-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowHowTo(false)} aria-label="Fechar">×</button>
            <span className="eyebrow">Manual do explorador</span>
            <h2 id="how-to-title">Como jogar</h2>
            <ol>
              <li>Escolha uma das cinco regiões brasileiras.</li>
              <li>Em cada região, escolha <strong>📚 Quiz rápido</strong> para estudar ou <strong>🎮 Jogar fase</strong> para a aventura 2D.</li>
              <li>Na fase, mova-se (<strong>← →</strong> ou <strong>A D</strong>), pule (<strong>espaço</strong>) e lance sua onda para restaurar os problemas (<strong>J</strong>).</li>
              <li>Cada problema restaurado enche a barra de <strong>conhecimento</strong>. Restaure vários em sequência para somar <strong>combo</strong> e multiplicar os pontos.</li>
              <li>Você também pode <strong>pular na cabeça</strong> dos problemas. Alguns deles soltam <strong>itens</strong>: ❤️ recupera vida e 💡 recarrega energia.</li>
              <li>Atenção aos tipos: 🎯 atira rápido (parado), 💨 avança no corpo a corpo e ⬆️ fica saltando.</li>
              <li>Com o conhecimento cheio, use o golpe especial (<strong>K</strong>): responda à pergunta — quanto mais rápido acertar, mais forte o golpe.</li>
              <li>Restaurado o último problema, o <strong>chefe da região aparece sozinho</strong>. Desvie dos ataques (ele "carrega" antes de atirar!) e só o vence acertando o quiz.</li>
              <li>Abaixo da metade da vida, o chefe entra em <strong>fúria</strong> — fica mais rápido e agressivo. Vença-o para conquistar o selo da região.</li>
            </ol>
            <p className="how-to-tip">💡 Dica: pular na hora certa evita os projéteis. E lembre-se: estudar o quiz deixa seu guardião mais poderoso!</p>
            <button className="btn-primary" onClick={() => { setShowHowTo(false); onPlay(); }}>Começar jornada</button>
          </section>
        </div>
      )}
    </main>
  );
}
