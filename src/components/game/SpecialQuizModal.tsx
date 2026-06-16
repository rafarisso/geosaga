import { useEffect, useState } from 'react';
import { GuardianSprite } from '../../ui/GuardianSprite';
import type { Question, RegionId } from '../../data/types';

interface SpecialQuizModalProps {
  region: RegionId;
  guardianName: string;
  specialVerb: string;
  question: Question;
  /**
   * Chamado ao concluir: `correct` decide o golpe especial e `speedBonus`
   * (0–1) recompensa a rapidez da resposta com mais dano.
   */
  onResolve: (correct: boolean, speedBonus: number) => void;
}

/** Tempo (s) para responder antes de o golpe falhar por hesitação. */
const QUIZ_TIME = 9;

/**
 * Pergunta rápida que arma o golpe especial. Acertar libera o golpe forte;
 * errar (ou deixar o tempo acabar) mostra a explicação didática e resulta em
 * golpe fraco. Responder rápido aumenta o dano — risco x recompensa que liga o
 * conteúdo de geografia à ação. Mantém o caráter educativo do quiz no combate.
 */
export function SpecialQuizModal({
  region,
  guardianName,
  specialVerb,
  question,
  onResolve,
}: SpecialQuizModalProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME);
  // Bônus de velocidade capturado no instante da resposta (fração de tempo restante).
  const [speedBonus, setSpeedBonus] = useState(0);

  const answered = selected !== null;
  const timeUp = timeLeft <= 0;
  const locked = answered || timeUp;
  const correct = answered && selected === question.answerIndex;

  // Contagem regressiva enquanto a pergunta está aberta.
  useEffect(() => {
    if (locked) return;
    const startedAt = performance.now();
    let frame = 0;
    const tick = () => {
      const elapsed = (performance.now() - startedAt) / 1000;
      setTimeLeft(Math.max(0, QUIZ_TIME - elapsed));
      if (elapsed < QUIZ_TIME) frame = requestAnimationFrame(tick);
      else setTimeLeft(0);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [locked]);

  function choose(index: number) {
    if (locked) return;
    setSpeedBonus(Math.max(0, Math.min(1, timeLeft / QUIZ_TIME)));
    setSelected(index);
  }

  const timeRatio = Math.max(0, Math.min(1, timeLeft / QUIZ_TIME));
  const urgent = !locked && timeRatio < 0.34;

  return (
    <div className="quiz-overlay stage-quiz-overlay">
      <div className="quiz-shell stage-quiz-shell">
        <aside className="quiz-guardian-panel">
          <span className="eyebrow">Golpe especial</span>
          <h2>{specialVerb}</h2>
          <p>Acerte para liberar o poder de {guardianName}. Responda rápido para um golpe ainda mais forte!</p>
          <GuardianSprite region={region} state={locked ? (correct ? 'victory' : 'hit') : 'attack'} />
        </aside>

        <section className="quiz-card">
          <header className="quiz-header">
            <div>
              <span>Pergunta relâmpago</span>
              <strong>Conhecimento = Poder</strong>
            </div>
          </header>

          <div className={`quiz-timer ${urgent ? 'urgent' : ''} ${locked ? 'locked' : ''}`} aria-hidden>
            <span style={{ width: `${timeRatio * 100}%` }} />
          </div>

          <h1 className="quiz-statement">{question.statement}</h1>

          <div className="quiz-choices">
            {question.choices.map((choice, index) => {
              let className = 'quiz-choice';
              if (locked) {
                if (index === question.answerIndex) className += ' correct';
                else if (index === selected) className += ' wrong';
              }
              return (
                <button
                  key={choice}
                  className={className}
                  onClick={() => choose(index)}
                  disabled={locked}
                >
                  <span>{String.fromCharCode(65 + index)}</span>{choice}
                </button>
              );
            })}
          </div>

          {locked && (
            <div className={correct ? 'quiz-feedback correct-feedback' : 'quiz-feedback wrong-feedback'}>
              <div>
                <strong>
                  {correct
                    ? (speedBonus > 0.6 ? `${specialVerb} turbinado!` : `${specialVerb} carregado!`)
                    : timeUp && !answered
                      ? 'O tempo acabou! Estude e tente de novo.'
                      : 'Quase! Aprenda e tente de novo.'}
                </strong>
                <p>{question.explanation}</p>
              </div>
              <button
                className="btn-primary"
                onClick={() => onResolve(correct, correct ? speedBonus : 0)}
              >
                {correct ? 'Soltar golpe!' : 'Continuar'}
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
