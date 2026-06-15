# Segurança

Este documento descreve as medidas de segurança aplicadas neste projeto e o que ainda está pendente. Atualize sempre que mudar algo da postura de segurança.

Última atualização: 2026-06-09

## Stack

- Frontend: React + Vite + TypeScript + Phaser 3
- Backend: Azure Functions (pasta `api/`)
- Host: Azure Static Web Apps (previsto)
- Banco: nenhum por enquanto (Cosmos DB previsto para progresso do jogador)

## Postura aplicada

### API keys e secrets
- [x] Chave do Azure OpenAI fica APENAS na Azure Function (`AZURE_OPENAI_API_KEY` em env var), nunca no bundle do navegador
- [x] `.env*` e `local.settings.json` no `.gitignore` antes do primeiro commit
- [x] `.env.example` e `api/local.settings.example.json` versionados sem valores reais
- [x] Nenhuma variável `VITE_*` contém secret (apenas `VITE_API_BASE_URL`, pública)

### Headers HTTP
- [x] HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- Configurado em: `staticwebapp.config.json` (globalHeaders do Azure Static Web Apps)
- CSP restritiva: `connect-src 'self'` (a API é mesma origem), `frame-ancestors 'none'`

### CORS
- Origens permitidas: mesma origem apenas. No Azure Static Web Apps, `/api` é servida no mesmo domínio do frontend, então não há CORS aberto. Em dev, o proxy do Vite (`vite.config.ts`) encaminha `/api` para a Function local.

### Validação de input
- Biblioteca: zod (frontend e backend)
- Backend: `api/src/functions/generateQuestions.ts` valida região (enum), dificuldade (1 a 3) e count (1 a 10) antes de tocar o Azure OpenAI; a RESPOSTA do modelo também é validada por schema antes de ir ao cliente
- Frontend: `src/services/questionService.ts` valida a resposta da API antes de entregar ao jogo

### Autenticação
- Não há contas de usuário no MVP. Quando houver (ranking, progresso na nuvem), usar Azure Static Web Apps Auth ou Entra ID, com sessão em httpOnly cookies.

### Rate limiting
- Implementação: em memória, na própria Function
- `/api/generate-questions`: 20 req / 1 minuto por IP
- Limitação conhecida: com múltiplas instâncias da Function o contador não é compartilhado. Trocar por Redis/Cosmos quando escalar.

### Webhooks
- Não há webhooks no projeto. Se entrarem (pagamentos, integrações), validar HMAC com `timingSafeEqual`.

### LGPD
- O MVP não coleta dados pessoais (sem cadastro, sem analytics, sem cookies de rastreio), então LGPD ainda não se aplica.
- [ ] Ao adicionar contas/ranking: política de privacidade, consentimento e endpoints de exportação/exclusão de dados. Atenção redobrada por ser público potencialmente infantil.

## Variáveis de ambiente

Ver `.env.example` (frontend) e `api/local.settings.example.json` (backend). Configurar em produção nas Application Settings do Static Web App:

- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_API_KEY`
- `AZURE_OPENAI_DEPLOYMENT`

## Pendências conhecidas

1. Rate limit distribuído quando a Function escalar para múltiplas instâncias
2. LGPD e auth quando entrar progresso do jogador na nuvem (Cosmos DB)
3. Rodar https://securityheaders.com após o primeiro deploy e ajustar a CSP se algo quebrar (começar com Report-Only se necessário)
4. Limite de custo/quota no recurso Azure OpenAI (orçamento e alertas no portal Azure)

## Plano de resposta a incidentes

1. Detecção: logs da Function (Application Insights) e alertas de billing do Azure
2. Contenção: rotacionar a chave do Azure OpenAI no portal, desativar a Function se necessário
3. Avaliação de impacto: verificar uso indevido da API de geração
4. Comunicação: não há dados de usuários no MVP
5. Pós-incidente: documentar aqui e ajustar limites

## Histórico de auditoria

| Data | Versão | Mudanças |
|------|--------|----------|
| 2026-06-09 | 1.0 | Setup inicial de segurança (scaffold) |
