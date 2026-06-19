import { useEffect, useState } from 'react';
import { REGIONS } from '../data/regions';
import type { Question, QuizResult, RegionId } from '../data/types';
import { fetchQuestions } from '../services/questionService';
import { shuffleQuestionChoiceDeck } from '../utils/questionChoices';
import { GuardianSprite } from './GuardianSprite';

interface QuizPanelProps {
  region: RegionId;
  onClose: (result: QuizResult | null) => void;
}

const PASS_RATIO = 0.6;

export function QuizPanel({ region, onClose }: QuizPanelProps) {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const regionInfo = REGIONS[region];

  useEffect(() => {
    let cancelled = false;
    fetchQuestions({ region })
      .then((items) => { if (!cancelled) setQuestions(shuffleQuestionChoiceDeck(items)); })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : 'Erro ao carregar perguntas.');
      });
    return () => { cancelled = true; };
  }, [region]);

  if (error) {
    return (
      <div className="quiz-overlay">
        <div className="quiz-card quiz-state-card">
          <h2>O desafio não pôde ser carregado</h2>
          <p>{error}</p>
          <button className="btn-primary" onClick={() => onClose(null)}>Voltar às regiões</button>
        </div>
      </div>
    );
  }

  if (!questions) {
    return (
      <div className="quiz-overlay">
        <div className="quiz-card quiz-state-card">
          <div className="loading-orbit" />
          <p>{regionInfo.guardian.name} está preparando o desafio...</p>
        </div>
      </div>
    );
  }

  const passed = score / questions.length >= PASS_RATIO;
  const result: QuizResult = {
    region,
    correctAnswers: score,
    totalQuestions: questions.length,
    passed,
  };

  if (finished) {
    return (
      <div className="quiz-overlay">
        <div className="quiz-card result-card">
          <GuardianSprite region={region} state={passed ? 'victory' : 'idle'} className="result-guardian" />
          <div className="result-copy">
            <span className="eyebrow">Desafio concluído</span>
            <h2>{passed ? `Selo ${regionInfo.name} conquistado!` : 'Você está quase lá!'}</h2>
            <div className="result-score"><strong>{score}</strong><span>de {questions.length}<br />respostas corretas</span></div>
            <p>{passed
              ? `${regionInfo.guardian.name} reconheceu seu conhecimento. A região ${regionInfo.name} agora faz parte da sua saga.`
              : `Revise as explicações e tente novamente. Você precisa de três acertos para conquistar o selo.`}</p>
            <button className="btn-primary" onClick={() => onClose(result)}>Voltar às regiões</button>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[current];
  const answered = selected !== null;

  function handleSelect(index: number) {
    if (answered) return;
    setSelected(index);
    if (index === question.answerIndex) setScore((value) => value + 1);
  }

  function handleNext() {
    if (current + 1 >= questions!.length) setFinished(true);
    else {
      setCurrent((value) => value + 1);
      setSelected(null);
    }
  }

  return (
    <div className="quiz-overlay">
      <div className="quiz-shell">
        <aside className="quiz-guardian-panel" style={{ '--region-color': regionInfo.themeColor } as React.CSSProperties}>
          <button className="quiz-exit" onClick={() => onClose(null)}>Sair</button>
          <span className="eyebrow">Guardião da região {regionInfo.name}</span>
          <h2>{regionInfo.guardian.name}</h2>
          <p>{regionInfo.guardian.title}</p>
          <GuardianSprite region={region} state={answered && selected === question.answerIndex ? 'victory' : 'idle'} />
        </aside>

        <section className="quiz-card">
          <header className="quiz-header">
            <div>
              <span>Questão {current + 1} de {questions.length}</span>
              <strong>{score * 100} pontos</strong>
            </div>
            <div className="quiz-progress-track">
              <span style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
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
                <button key={choice} className={className} onClick={() => handleSelect(index)} disabled={answered}>
                  <span>{String.fromCharCode(65 + index)}</span>{choice}
                </button>
              );
            })}
          </div>

          {answered && (
            <div className={selected === question.answerIndex ? 'quiz-feedback correct-feedback' : 'quiz-feedback wrong-feedback'}>
              <div>
                <strong>{selected === question.answerIndex ? 'Resposta certa!' : 'Ainda não.'}</strong>
                <p>{question.explanation}</p>
              </div>
              <button className="btn-primary" onClick={handleNext}>
                {current + 1 >= questions.length ? 'Ver resultado' : 'Próxima questão'}
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

