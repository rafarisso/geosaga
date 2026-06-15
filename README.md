# GeoSaga

GeoSaga é um jogo educativo de Geografia do Brasil com estética de aventura 2D. O jogador enfrenta os guardiões das cinco regiões brasileiras, responde a desafios didáticos e conquista selos regionais.

- Jogo publicado: https://geosaga-brasil.netlify.app
- Repositório: https://github.com/rafarisso/geosaga

Este repositório contém o MVP web em React, TypeScript, Vite e Phaser. A interface e o modo jogável atuais usam React (loop de jogo com `requestAnimationFrame`); o Phaser permanece preparado para futuras cenas. O quiz original continua intacto e agora também é usado como mecânica de poder dentro das fases.

## Recursos do MVP

- tela inicial responsiva com o logo e os cinco guardiões;
- experiência mobile-first em retrato e paisagem, com áreas de toque adequadas;
- seleção das regiões Norte, Nordeste, Centro-Oeste, Sudeste e Sul;
- dois modos por região: **Quiz rápido** (estudo) e **Jogar fase** (aventura 2D);
- 25 perguntas locais, cinco para cada região;
- feedback explicativo para respostas certas e erradas;
- pontuação, melhores resultados e selos regionais;
- progresso de quiz e de fases persistido no `localStorage`;
- botão Continuar com recuperação do progresso;
- folhas de pose originais preservadas e versões PNG com transparência;
- metadados e estados preparados para animações futuras.

## Modo jogável (fase 2D lateral)

Cada região tem uma fase de plataforma/combate simbólico, jogável pelo botão **🎮 Jogar fase**.

- **Movimento:** setas `← →` ou `A` / `D`.
- **Pulo:** `Espaço` (ou seta para cima / `W`).
- **Ataque básico (restaurar/purificar):** `J` — causa dano e carrega o conhecimento.
- **Golpe especial:** `K` — quando a barra de conhecimento enche, abre uma **pergunta da região**. Acertar libera um golpe forte em área; errar mostra a explicação didática e o golpe sai fraco.
- **Mobile:** botões virtuais na tela (direcionais à esquerda, ações à direita).

O combate é simbólico e educativo: os inimigos são **problemas socioambientais** da região (rio poluído, desmatamento, seca, queimada, poluição urbana, geada etc.), modelados como placeholders (emoji + bloco colorido) prontos para troca por arte real.

### Desafio e progressão

- **Inimigos que atacam:** os problemas avançam e lançam projéteis; é preciso desviar (pular/mover), o que dá uso real ao pulo.
- **Plataformas e perigos temáticos:** cada fase tem plataformas e uma zona de perigo (queimada, enchente, geada…) que dá dano — atravesse pulando.
- **Chefe regional:** ao limpar os problemas, surge o "problema-mor" da região (ex.: *Maré Negra*, *Fúria das Chamas*, *Rei do Gelo*). O chefe **resiste à onda comum e só é derrotado com o golpe especial** — ou seja, **acertando o quiz**. Isso torna o conhecimento de Geografia a arma decisiva.
- **Dificuldade crescente** do Norte ao Sul (vida e dano escalam por região).
- **Avaliação por estrelas (0–3):** vencer (1) + manter a vida acima da metade (1) + bom desempenho no quiz (1). As estrelas e o título **Mestre do Brasil** (zerar as cinco fases) aparecem na seleção de regiões.
- **Som e game feel:** efeitos sonoros sintetizados (Web Audio, sem arquivos), tremor de tela e partículas de dano. Há um botão de **mudo** no HUD.

### Arquitetura do modo jogável

```text
src/
  components/game/
    GameStage.tsx        # tela/rota da fase: orquestra UI, fases e loop
    stageEngine.ts       # motor mutável (física, combate, câmera) fora do React
    Player.tsx           # guardião controlável (recorte de frames do spritesheet)
    Enemy.tsx            # problema regional (placeholder com barra de vida)
    HUD.tsx              # vida, conhecimento, objetivo, pontos
    MobileControls.tsx   # botões virtuais (toque)
    SpecialQuizModal.tsx # pergunta-relâmpago do golpe especial
  data/
    regionalProblems.ts  # inimigos/problemas por região
    stages.ts            # objetivo, cenário e verbos de cada fase
  hooks/
    useGameLoop.ts          # loop com requestAnimationFrame (passo limitado)
    useKeyboardControls.ts  # teclado + entrada virtual compartilhada
    useProgress.ts          # progresso (quiz e fases) com localStorage
```

Os atributos de gameplay de cada guardião (`vida`, `velocidade`, `pulo`, `ataque`, `poderEspecial`, além de `asset`, `corTematica` e a direção nativa do sprite em `spriteFaces`) ficam em `src/data/characters.ts`. As **cinco regiões são jogáveis**, cada uma com guardião, cenário, objetivo temático (totem próprio), problemas regionais e verbos de ação distintos, todas sobre o mesmo motor de fase (`stageEngine.ts`).

## Como executar

Requisitos: Node.js 20 ou superior e npm.

```bash
npm install
npm run dev
```

O Vite mostrará o endereço local, normalmente `http://localhost:5173`.

Em celulares, o jogo funciona em retrato. A orientação horizontal oferece uma versão mais compacta da tela inicial e do quiz para aparelhos com pouca altura disponível.

Comandos de validação:

```bash
npm run lint
npm run build
```

## Estrutura principal

```text
src/
  assets/
    logo/
    characters/
      arauca/
      buriti/
      iare/
      jequi/
      mandacaru/
      processed/
    backgrounds/
    ui/
  data/
    characters.ts
    questions.ts
    regions.ts
    types.ts
  game/
    scenes/
  services/
    progressService.ts
    questionService.ts
  ui/
    App.tsx
    GuardianSprite.tsx
    QuizPanel.tsx
    RegionSelectScreen.tsx
    StartScreen.tsx
scripts/
  process-assets.mjs
```

## Personagens e sprites

Cada guardião possui duas versões:

- `*-pose-sheet-original.png`: arquivo original, sem alterações;
- `processed/*-pose-sheet-transparent.png`: versão processada para uso na interface e no jogo.

O arquivo `src/data/characters.ts` registra região, nome, descrição, cor, dimensões da folha, quantidade aproximada de frames e os estados planejados:

```text
idle, walk, jump, attack, hit, victory
```

As imagens atuais são folhas de poses, não spritesheets com frames perfeitamente uniformes. `GuardianSprite.tsx` usa um recorte aproximado por posição. Antes de animações quadro a quadro no Phaser, recomenda-se recortar e alinhar cada pose em frames individuais.

## Remoção do fundo

O processamento usa `sharp` e nunca sobrescreve os originais.

```bash
npm run assets:process
```

O script estima a cor do fundo pelas bordas esquerda e direita de cada linha, interpola o gradiente cinza e produz uma máscara alpha suave. O relatório com dimensões e proporção transparente fica em:

```text
src/assets/characters/processed/sprite-metadata.json
```

Se alguma borda precisar de ajuste, altere em `scripts/process-assets.mjs` os valores `transparentAt` e `opaqueAt`. Valores menores removem tons mais próximos do fundo; valores maiores preservam mais pixels. Efeitos muito translúcidos podem exigir retoque manual em um editor de imagens.

## Quiz e progresso

As perguntas locais ficam em `src/data/questions.ts`. Cada pergunta possui enunciado, quatro alternativas, índice da resposta correta, explicação, região e dificuldade.

Por padrão, o MVP usa o banco local. Quando `VITE_API_BASE_URL` estiver configurado, `questionService.ts` tenta obter perguntas da API e usa as perguntas locais como fallback.

O progresso é salvo na chave `geosaga-progress-v1` do `localStorage`. São armazenados:

- regiões concluídas;
- selos conquistados;
- melhor pontuação por região;
- pontuação total;
- última região jogada.

São necessários três acertos em cinco perguntas para conquistar um selo.

## Próximos passos

1. Recortar as folhas de pose em frames com dimensões uniformes.
2. Carregar os spritesheets na `BootScene` e criar animações no Phaser.
3. Adicionar cenas de exploração, plataforma e combate entre os quizzes.
4. Criar mapa ilustrado do Brasil e trilha de progressão entre regiões.
5. Otimizar os PNGs ou gerar WebP para reduzir o carregamento inicial.
6. Adicionar áudio, efeitos, acessibilidade de teclado e testes automatizados.

## Deploy na Netlify

O arquivo `netlify.toml` configura `npm run build`, publicação da pasta `dist` e fallback de SPA para `index.html`. Assim, o projeto pode ser conectado diretamente a um repositório GitHub na Netlify ou publicado pela CLI.
