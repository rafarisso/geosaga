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
const SEEN_KEY = 'geosaga-seen-questions-v1';

export interface FetchQuestionsOptions {
  region: RegionId;
  difficulty?: Difficulty;
  count?: number;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function readSeen(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
  } catch {
    return {};
  }
}

function writeSeen(seen: Record<string, string[]>): void {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
  } catch {
    // Ignora ambientes sem localStorage.
  }
}

/**
 * Seleciona `count` questões da região de forma rotativa: prioriza as ainda
 * não vistas (registradas no localStorage) e embaralha, para que partidas
 * repetidas não tragam sempre as mesmas perguntas. Quando o banco se esgota,
 * o ciclo recomeça evitando repetir as últimas vistas.
 */
function pickRotating(region: RegionId, count: number): Question[] {
  const all = QUESTIONS[region];
  if (all.length <= count) return shuffle(all);

  const seen = readSeen();
  const seenIds = new Set(seen[region] ?? []);
  const unseen = all.filter((q) => !seenIds.has(q.id));
  const pool = shuffle(unseen);

  let selected: Question[];
  if (pool.length >= count) {
    selected = pool.slice(0, count);
  } else {
    // Esgotou o banco: completa com as vistas (menos as recém-escolhidas).
    const chosenIds = new Set(pool.map((q) => q.id));
    const remainder = shuffle(all.filter((q) => !chosenIds.has(q.id)));
    selected = [...pool, ...remainder].slice(0, count);
  }

  const selectedIds = selected.map((q) => q.id);
  const updatedSeen = [...(seen[region] ?? []), ...selectedIds];
  // Mantém apenas o último ciclo no histórico para não inflar o storage.
  seen[region] = updatedSeen.slice(-all.length);
  writeSeen(seen);

  return selected;
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

  return pickRotating(region, count);
}

