import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { z } from 'zod';

/**
 * Proxy seguro para o Azure OpenAI. A chave (AZURE_OPENAI_API_KEY) vive
 * apenas aqui, em env var, e nunca chega ao navegador. Input do cliente
 * é validado com zod e há rate limit simples por IP.
 */

const requestSchema = z.object({
  region: z.enum(['norte', 'nordeste', 'centro-oeste', 'sudeste', 'sul']),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(1),
  count: z.number().int().min(1).max(10).default(5),
});

const aiQuestionSchema = z.object({
  statement: z.string().min(10),
  choices: z.tuple([z.string().min(1), z.string().min(1), z.string().min(1), z.string().min(1)]),
  answerIndex: z.number().int().min(0).max(3),
  explanation: z.string().min(5),
});

const aiResponseSchema = z.object({
  questions: z.array(aiQuestionSchema).min(1),
});

// Rate limit simples em memória: 20 requisições por minuto por IP.
// Suficiente para MVP; em produção com várias instâncias, trocar por
// armazenamento compartilhado (ex.: Cosmos DB ou Redis).
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;
const hits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

const REGION_NAMES: Record<string, string> = {
  norte: 'Norte',
  nordeste: 'Nordeste',
  'centro-oeste': 'Centro-Oeste',
  sudeste: 'Sudeste',
  sul: 'Sul',
};

async function handler(req: HttpRequest, ctx: InvocationContext): Promise<HttpResponseInit> {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (isRateLimited(ip)) {
    return { status: 429, jsonBody: { error: 'Muitas requisições. Tente novamente em instantes.' } };
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return { status: 400, jsonBody: { error: 'Corpo da requisição não é JSON válido.' } };
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return { status: 400, jsonBody: { error: 'Parâmetros inválidos.' } };
  }
  const { region, difficulty, count } = parsed.data;

  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  if (!endpoint || !apiKey || !deployment) {
    ctx.warn('Azure OpenAI não configurado (env vars ausentes).');
    return { status: 503, jsonBody: { error: 'Geração de perguntas não configurada.' } };
  }

  const systemPrompt =
    'Você é um professor de Geografia do Brasil criando perguntas de quiz para um jogo educativo. ' +
    'Responda APENAS com JSON válido, sem markdown, no formato: ' +
    '{"questions":[{"statement":"...","choices":["a","b","c","d"],"answerIndex":0,"explanation":"..."}]}. ' +
    'Cada pergunta tem exatamente 4 alternativas, 1 correta (answerIndex de 0 a 3) e explicação curta.';

  const userPrompt =
    `Gere ${count} perguntas sobre a região ${REGION_NAMES[region]} do Brasil, ` +
    `dificuldade ${difficulty} numa escala de 1 (fácil) a 3 (difícil). ` +
    'Temas: estados e capitais, clima, biomas, relevo, hidrografia, economia e cultura da região.';

  const url =
    `${endpoint.replace(/\/$/, '')}/openai/deployments/${deployment}` +
    '/chat/completions?api-version=2024-06-01';

  const aiRes = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
  });

  if (!aiRes.ok) {
    ctx.error(`Azure OpenAI respondeu ${aiRes.status}`);
    return { status: 502, jsonBody: { error: 'Falha ao gerar perguntas.' } };
  }

  const data = (await aiRes.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content ?? '';

  let payload: unknown;
  try {
    payload = JSON.parse(content);
  } catch {
    ctx.error('Resposta do modelo não é JSON válido.');
    return { status: 502, jsonBody: { error: 'Resposta do modelo em formato inesperado.' } };
  }

  const validated = aiResponseSchema.safeParse(payload);
  if (!validated.success) {
    ctx.error('Resposta do modelo não passou na validação de schema.');
    return { status: 502, jsonBody: { error: 'Resposta do modelo em formato inesperado.' } };
  }

  const stamp = Date.now();
  const questions = validated.data.questions.slice(0, count).map((q, i) => ({
    ...q,
    id: `${region}-ai-${stamp}-${i}`,
    region,
    difficulty,
  }));

  return { jsonBody: { questions } };
}

app.http('generateQuestions', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'generate-questions',
  handler,
});
