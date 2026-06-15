import { useState } from 'react';
import { GuardianSprite } from '../../ui/GuardianSprite';
import type { Question, RegionId } from '../../data/types';

interface SpecialQuizModalProps {
  region: RegionId;
  guardianName: string;
  specialVerb: string;
  question: Question;
  /** Chamado ao concluir: `correct` decide o golpe especial. */
  onResolve: (correct: boolean) => void;
}

/**
 * Pergunta rápida que arma o golpe especial. Acertar libera o golpe forte;
 * errar mostra a explicação didática e resulta em golpe fraco. Mantém o
 * caráter educativo do quiz dentro do combate.
 */
export function SpecialQuizModal({
  region,
  guardianName,
  specialVerb,
  question,
  onResolve,
}: SpecialQuizModalProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;
  const correct = answered && selected === question.answerIndex;

  return (
    <div className="quiz-overlay stage-quiz-overlay">
      <div className="quiz-shell stage-quiz-shell">
        <aside className="quiz-guardian-panel">
          <span className="eyebrow">Golpe especial</span>
          <h2>{specialVerb}</h2>
          <p>Acerte para liberar o poder de {guardianName}.</p>
          <GuardianSprite region={region} state={answered ? (correct ? 'victory' : 'hit') : 'attack'} />
        </aside>

        <section className="quiz-card">
          <header className="quiz-header">
            <div>
              <span>Pergunta relâmpago</span>
              <strong>Conhecimento = Poder</strong>
            </div>
          </header>

          <h1 className="quiz-statement">{question.statement}</h1>

          <div className="quiz-choices">
            {question.choices.map((choice, index) => {
              let className = 'quiz-choice';
              if (answered) {
                if (index === question.answerIndex) className += ' correct';
                else if (index === selected) className += ' wrong';
              }
              return (
                <button
                  key={choice}
                  className={className}
                  onClick={() => !answered && setSelected(index)}
                  disabled={answered}
                >
                  <span>{String.fromCharCode(65 + index)}</span>{choice}
                </button>
              );
            })}
          </div>

          {answered && (
            <div className={correct ? 'quiz-feedback correct-feedback' : 'quiz-feedback wrong-feedback'}>
              <div>
                <strong>{correct ? `${specialVerb} carregado!` : 'Quase! Aprenda e tente de novo.'}</strong>
                <p>{question.explanation}</p>
              </div>
              <button className="btn-primary" onClick={() => onResolve(correct)}>
                {correct ? 'Soltar golpe!' : 'Continuar'}
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
