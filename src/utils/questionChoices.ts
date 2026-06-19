export type AnswerIndex = 0 | 1 | 2 | 3;
type FourChoices = [string, string, string, string];

interface QuestionWithChoices {
  choices: FourChoices;
  answerIndex: AnswerIndex;
}

function asAnswerIndex(index: number): AnswerIndex {
  if (index < 0 || index > 3) throw new Error(`Invalid answer index: ${index}`);
  return index as AnswerIndex;
}

function shuffledOptions(question: QuestionWithChoices) {
  const options = question.choices.map((choice, index) => ({
    choice,
    correct: index === question.answerIndex,
  }));

  for (let index = options.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    const current = options[index]!;
    options[index] = options[target]!;
    options[target] = current;
  }

  return options;
}

export function shuffleQuestionChoices<T extends QuestionWithChoices>(question: T, avoidAnswerIndex?: AnswerIndex | null): T {
  let options = shuffledOptions(question);
  let answerIndex = options.findIndex((option) => option.correct);

  for (let attempt = 0; avoidAnswerIndex !== null && answerIndex === avoidAnswerIndex && attempt < 8; attempt += 1) {
    options = shuffledOptions(question);
    answerIndex = options.findIndex((option) => option.correct);
  }

  return {
    ...question,
    choices: options.map((option) => option.choice) as FourChoices,
    answerIndex: asAnswerIndex(answerIndex),
  };
}

export function shuffleQuestionChoiceDeck<T extends QuestionWithChoices>(questions: T[]): T[] {
  let previousAnswerIndex: AnswerIndex | null = null;
  return questions.map((question) => {
    const shuffled = shuffleQuestionChoices(question, previousAnswerIndex);
    previousAnswerIndex = shuffled.answerIndex;
    return shuffled;
  });
}