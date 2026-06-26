# GeoSaga

GeoSaga e um jogo educativo de Geografia do Brasil com estetica de aventura 2D. O jogador comeca enfrentando os cinco guardioes regionais e, depois, percorre uma campanha jogavel pelas 27 capitais brasileiras.

- Jogo publicado: https://geosaga-brasil.netlify.app
- Repositorio: https://github.com/rafarisso/geosaga
- Contato do projeto: risso_rafa@hotmail.com
- Assinatura: Desenvolvedor e Prof Rafael de Geografia

## Estado atual

A versao atual contem:

- tela inicial cinematografica com os cinco guardioes;
- campanha regional com Norte, Nordeste, Centro-Oeste, Sudeste e Sul;
- quiz rapido por regiao;
- fases jogaveis regionais com combate, chefes e poder especial ligado a perguntas;
- campanha das capitais com as 27 capitais do Brasil jogaveis;
- fases de capitais com cenario proprio, inimigos tematicos, chefe, marcos geograficos e banco de perguntas;
- tela final de encerramento quando o jogador completa as 27 capitais;
- progresso salvo no `localStorage`;
- controles para desktop e mobile;
- build e deploy configurados para Netlify.

## Campanha das capitais

A campanha das capitais e organizada por regiao:

| Regiao | Capitais jogaveis |
| --- | --- |
| Sudeste | Sao Paulo, Rio de Janeiro, Belo Horizonte, Vitoria |
| Sul | Curitiba, Florianopolis, Porto Alegre |
| Centro-Oeste | Brasilia, Goiania, Cuiaba, Campo Grande |
| Nordeste | Salvador, Recife, Fortaleza, Natal, Joao Pessoa, Maceio, Aracaju, Teresina, Sao Luis |
| Norte | Belem, Manaus, Boa Vista, Macapa, Porto Velho, Rio Branco, Palmas |

Cada capital tem uma proposta visual e geografica propria. As fases no padrao de acao lateral usam:

- personagem guardiao controlavel;
- deslocamento da esquerda para a direita;
- inimigos simbolicos ligados a problemas ou caracteristicas da cidade;
- chefes com vida propria;
- marcos geograficos coletaveis;
- poder especial liberado por pergunta correta;
- regra de boss que exige conhecimento geografico para finalizar a fase.

## Tela final

Ao completar todas as 27 capitais, o jogo apresenta uma tela de conclusao com:

- resumo de capitais vencidas;
- rotas regionais finalizadas;
- estrelas conquistadas;
- pontuacao da campanha;
- assinatura do projeto;
- e-mail de contato: `risso_rafa@hotmail.com`.

## Controles

Desktop:

- mover: `A` / `D` ou setas;
- pular: `Espaco`, `W` ou seta para cima;
- abaixar: `S` ou seta para baixo;
- atacar/atirar/restaurar: `J`;
- defender: `L`;
- especial/quiz: `K` quando a barra estiver cheia.

Mobile:

- botoes virtuais aparecem na tela;
- direcionais ficam a esquerda;
- acoes ficam a direita.

## Como executar localmente

Requisitos: Node.js 20 ou superior e npm.

```bash
npm install
npm run dev
```

O Vite normalmente abre em:

```text
http://localhost:5173
```

Para testar uma capital diretamente, use:

```text
http://localhost:5173/?screen=capitals&capital=palmas
```

Troque `palmas` por qualquer id de capital, por exemplo `salvador`, `brasilia`, `sao-luis` ou `rio-branco`.

## Validacao

Comandos principais:

```bash
npm run lint
npm run build
npm run stages:validate
```

O build de producao gera a pasta `dist`.

## Arquitetura principal

```text
src/
  assets/
    backgrounds/       # cenarios regionais e das capitais
    bosses/            # chefes das capitais
    characters/        # guardioes e sprites processados
    enemies/           # inimigos tematicos das capitais
    logo/
  components/game/
    CapitalPlayableStage.tsx     # renderizacao das fases de capitais no motor lateral
    capitalStageEngine.ts        # motor de fisica, combate, camera, objetivos e boss
    GameStage.tsx                # fases regionais
    stageEngine.ts               # motor das fases regionais
  data/
    capitalChallenges.ts         # lista e rotas das capitais
    capitalQuestions.ts          # banco de perguntas das capitais
    characters.ts                # guardioes
    questions.ts                 # perguntas regionais
    regions.ts                   # dados das regioes
    types.ts                     # tipos compartilhados
  services/
    progressService.ts           # persistencia em localStorage
  ui/
    App.tsx
    CapitalChallengeScreen.tsx
    CapitalFinaleScreen.tsx
    MasteryCelebrationScreen.tsx
    RegionSelectScreen.tsx
    StartScreen.tsx
scripts/
  process-assets.mjs
  validate-stage-obstacles.mjs
```

## Deploy na Netlify

O projeto usa `netlify.toml` com:

- comando de build: `npm run build`;
- pasta publicada: `dist`;
- fallback de SPA para `index.html`.

Deploy manual de producao pela CLI:

```bash
netlify deploy --prod --dir=dist
```

## Observacoes de performance

O jogo usa muitas imagens profissionais em PNG. Por isso, o build pode exibir aviso de chunks grandes. Esse aviso nao impede o deploy. Uma melhoria futura natural e converter assets grandes para WebP/AVIF e carregar fases sob demanda.