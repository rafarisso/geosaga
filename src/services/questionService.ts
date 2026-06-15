import { z } from 'zod';
import { QUESTIONS } from '../data/questions';
import type { Difficulty, Question, RegionId } from '../data/types';

const questionSchema = z.object({
  id: z.string().min(1),
  statement: z.string().min(10),
  choices: z.tuple([z.string().min(1), z.string().min(1), z.string().min(1), z.string().min(1)]),
  answerIndex: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  explanation: z.string().min(5),
  region: z.enum(['norte', 'nordeste', 'centro-oeste', 'sudeste', 'sul']),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
});

const responseSchema = z.object({ questions: z.array(questionSchema).min(1) });
const API_BASE = import.meta.env.VITE_API_BASE_URL;

export interface FetchQuestionsOptions {
  region: RegionId;
  difficulty?: Difficulty;
  count?: number;
}

export async function fetchQuestions({
  region,
  difficulty = 1,
  count = 5,
}: FetchQuestionsOptions): Promise<Question[]> {
  if (API_BASE) {
    try {
      const response = await fetch(`${API_BASE}/generate-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region, difficulty, count }),
      });
      if (!response.ok) throw new Error(`API respondeu ${response.status}`);
      return responseSchema.parse(await response.json()).questions as Question[];
    } catch (error) {
      console.warn(`[questionService] Usando banco local para ${region}.`, error);
    }
  }

  return QUESTIONS[region].slice(0, count);
}

