# GeoSaga: documento-base para video, apresentacao e bastidores do projeto

## Como usar este documento

Este material foi escrito para servir como base de roteiro para um video no YouTube e tambem como insumo para gerar slides em outra ferramenta.

Ele esta dividido em quatro usos principais:

- **Roteiro narrativo:** explica a historia do projeto, o problema que ele resolve e como ele evoluiu.
- **Documentacao tecnica:** resume arquitetura, arquivos importantes, fluxo de imagens, validacoes e deploy.
- **Base para slides:** traz uma sugestao de sequencia de apresentacao, slide por slide.
- **Memorial do processo criativo:** registra escolhas de prompt, geracao de imagens, ajustes de jogabilidade e melhorias feitas ao longo do desenvolvimento.

> Observacao de estado atual: este documento descreve o projeto com a campanha das 27 capitais concluida, incluindo a Regiao Norte, Palmas e a tela final de encerramento com contato do projeto.

---

# 1. Visao geral do projeto

## O que e o GeoSaga

**GeoSaga** e um jogo educativo de geografia do Brasil, criado para transformar o estudo das regioes brasileiras e das capitais em uma experiencia visual, jogavel e progressiva.

A ideia central e simples:

> O aluno aprende geografia enquanto enfrenta desafios, derrota problemas regionais, responde quizzes e desbloqueia novas etapas do mapa brasileiro.

O projeto comecou com cinco guardioes, cada um representando uma regiao do Brasil:

- Norte
- Nordeste
- Centro-Oeste
- Sudeste
- Sul

Depois, a experiencia evoluiu para uma campanha maior: ao concluir os cinco niveis regionais, o jogador libera uma nova etapa com as capitais brasileiras.

## Proposta educacional

O jogo nao foi pensado apenas como um quiz. A proposta e combinar tres elementos:

- **Conteudo geografico:** regioes, biomas, capitais, paisagens, problemas urbanos e caracteristicas culturais.
- **Jogo de acao:** deslocamento, defesa, tiro, esquiva, inimigos, chefes e poderes especiais.
- **Gamificacao:** progresso, pontuacao, desbloqueio, desafio crescente e recompensas visuais.

O objetivo e reduzir a sensacao de aula passiva. O jogador aprende porque precisa usar o conhecimento para avancar.

---

# 2. Premissa narrativa

## A historia principal

O Brasil do GeoSaga e protegido por guardioes regionais. Cada guardiao representa uma paisagem, um bioma e uma identidade geografica.

Em cada fase, o jogador enfrenta "problemas" que aparecem na forma de inimigos. Esses problemas nao sao pessoas. Eles representam obstaculos urbanos, ambientais, climaticos, logisticos ou sociais ligados ao espaco geografico.

Exemplos:

- excesso de som urbano;
- alagamentos;
- residuos nas praias;
- transito;
- ocupacao desordenada;
- assoreamento;
- calor extremo;
- problemas de mobilidade;
- conflitos entre preservacao e crescimento urbano.

## Por que usar personagens e inimigos

O uso de personagens ajuda a transformar conteudo abstrato em memoria visual. Em vez de apenas ler que uma cidade tem litoral, manguezal, planicie, serra ou metropole, o jogador enxerga isso no cenario, nos inimigos e nas missoes.

O jogo busca criar associacoes:

- **Salvador:** cidade historica, costa, baia, som urbano e energia cultural.
- **Maceio:** piscinas naturais, jangadas, lagoas e turismo costeiro.
- **Joao Pessoa:** mare, amanhecer, orla e equilibrio ambiental.
- **Aracaju:** orla planejada, estuario, manguezal e pressao urbana.
- **Brasilia:** plano piloto, cerrado, monumentos e decisao politica.

Essas associacoes facilitam a retencao do conteudo.

---

# 3. Evolucao do jogo

## Primeira etapa: as regioes

A primeira versao jogavel foi organizada em torno das cinco regioes brasileiras.

Cada card de regiao apresenta:

- nome da regiao;
- guardiao;
- descricao geografica;
- quiz rapido;
- fase jogavel.

Os cinco guardioes regionais sao:

| Regiao | Guardiao | Identidade visual |
| --- | --- | --- |
| Norte | Iare | agua, floresta, rios, Amazonia |
| Nordeste | Mandacaru | sertao, litoral, caatinga, resistencia |
| Centro-Oeste | Buriti | cerrado, pantanal, chapadas |
| Sudeste | Jequi | metropole, mata atlantica, serras |
| Sul | Arauca | araucarias, pampas, clima subtropical |

## Problemas corrigidos no inicio

Durante a evolucao do projeto, alguns problemas importantes foram identificados e corrigidos:

- Na tela inicial, algumas frases estavam desorganizadas e quebravam a leitura.
- No desktop, os personagens apareciam inteiros, mas no mobile alguns ficavam cortados.
- A apresentacao inicial parecia fraca para a ambicao visual do jogo.
- Algumas fases tinham dinamica repetitiva demais.
- Em certas fases, o chefe podia ser derrotado sem exigir resposta correta no quiz.
- Algumas imagens de inimigos estavam viradas para o lado errado.
- Em Maceio, a camera andava para uma area azul sem cenario.

Esses ajustes mudaram o projeto de um prototipo visual para um jogo mais consistente.

---

# 4. Segunda etapa: campanha das capitais

## Ideia da campanha

Depois de concluir os cinco niveis regionais, o jogador recebe uma tela de parabens e e convidado a jogar uma nova campanha: **as capitais do Brasil**.

A proposta e percorrer as capitais por regiao, usando cenarios mais especificos e mecanicas diferentes para evitar que as 27 fases parecam iguais.

## Status atual das capitais

| Regiao | Capitais jogaveis | Status |
| --- | --- | --- |
| Sudeste | Sao Paulo, Rio de Janeiro, Belo Horizonte, Vitoria | Completa |
| Sul | Curitiba, Florianopolis, Porto Alegre | Completa |
| Centro-Oeste | Brasilia, Goiania, Cuiaba, Campo Grande | Completa |
| Nordeste | Salvador, Recife, Fortaleza, Natal, Joao Pessoa, Maceio, Aracaju, Teresina, Sao Luis | Completa |
| Norte | Belem, Manaus, Boa Vista, Macapa, Porto Velho, Rio Branco, Palmas | Completa |

A campanha principal das capitais chegou ao ciclo completo: 27 capitais jogaveis, incluindo Brasilia. O jogador percorre todas as regioes e, ao concluir a ultima capital, recebe uma tela final de encerramento com resumo da campanha, estrelas, pontuacao e contato do projeto.

## Encerramento da campanha

A tela final aparece quando todas as 27 capitais foram concluidas. Ela reforca a conquista do jogador, fecha a jornada de aprendizagem e apresenta a assinatura:

- Desenvolvedor e Prof Rafael de Geografia
- risso_rafa@hotmail.com

---

# 5. Filosofia de design das fases

## Problema identificado

Em um ponto do desenvolvimento, ficou claro que varias fases estavam ficando parecidas:

- mesmo tipo de movimento;
- mesmo padrao de inimigo;
- mesmo tipo de combate;
- mesmo fluxo de quiz;
- apenas troca de fundo e personagem.

Isso enfraquecia a sensacao de descoberta.

## Nova direcao

A direcao atual e fazer cada capital ter uma dinamica propria, inspirada na geografia e na identidade da cidade.

Exemplos de variacao:

- fase de corrida nas dunas;
- fase de mare e canais;
- fase de patrulha em estuario;
- fase com tiro nos inimigos;
- fase com boss protegido por quiz geografico;
- fase costeira com possivel jogo de surf em cidade litoranea;
- fases urbanas com transito, verticalizacao, poluicao sonora ou problemas de infraestrutura.

O objetivo e que o aluno pense:

> "Essa fase so poderia acontecer nessa cidade."

---

# 6. Mecanicas principais de jogabilidade

## Movimento

O personagem se desloca da esquerda para a direita, como em um jogo de acao lateral.

As mecanicas principais incluem:

- andar;
- pular;
- abaixar;
- defender;
- atirar;
- coletar marcos geograficos;
- carregar poder especial;
- responder quiz para finalizar chefes.

## Defesa e esquiva

Um pedido importante foi tornar o jogo mais justo. Antes, esquivar de tiros e ataques era dificil demais.

Foram adicionadas ou reforcadas mecanicas como:

- abaixar;
- defender;
- evitar ataques por faixa ou altura;
- ler o padrao dos inimigos;
- usar o momento certo do poder especial.

## Tiro e ataque

Algumas fases permitem que o personagem atire nos inimigos, evitando que o jogador fique apenas passivo.

Isso melhora a sensacao de controle, especialmente para adolescentes acostumados com jogos mais dinamicos.

## Poder especial

O poder especial fica ligado ao quiz educativo:

1. O jogador coleta ou carrega conhecimento geografico.
2. Uma pergunta aparece.
3. Ao responder corretamente, o personagem libera um poder.
4. O poder causa dano relevante no chefe ou limpa obstaculos.

Uma melhoria importante foi dar mais feedback visual ao poder, com luz, impacto, brilho e sensacao de evento especial.

## Regra contra "matar chefe sem aprender"

Um ajuste essencial foi impedir que o jogador derrote o chefe apenas atirando.

A regra adotada:

- ataques normais podem enfraquecer o chefe;
- o chefe nao deve morrer apenas com tiros comuns;
- a finalizacao exige uma resposta correta no quiz geografico.

Essa regra preserva o objetivo educacional.

---

# 7. Estrutura educativa do quiz

## Papel do quiz

O quiz nao deve ser um elemento separado do jogo. Ele funciona como chave de progressao.

O jogador responde perguntas para:

- carregar poder;
- enfraquecer chefe;
- desbloquear finalizacao;
- reforcar conteudo da capital.

## Banco de questoes

Um problema identificado foi a repeticao de perguntas. Para resolver isso, as fases passaram a usar bancos de questoes por capital.

O banco deve conter perguntas sobre:

- localizacao;
- paisagem;
- bioma;
- clima;
- economia;
- cultura;
- marcos urbanos;
- problemas ambientais;
- rios, baia, litoral, relevo ou vegetacao.

## Posicao das respostas

Outro cuidado importante foi nao deixar a resposta correta sempre no mesmo lugar.

Para isso, o projeto usa duas estrategias:

- perguntas com `answerIndex` variado;
- embaralhamento das alternativas na interface de quiz.

Isso evita que o jogador acerte por padrao visual em vez de conhecimento.

---

# 8. Campanha das capitais: fases e conceitos

## Sudeste

| Capital | Conceito de fase | Intencao educativa |
| --- | --- | --- |
| Sao Paulo | Corrida da metropole | metropole, urbanizacao, mobilidade |
| Rio de Janeiro | Favela, praia e relevo | paisagem urbana, litoral, morros |
| Belo Horizonte | Cidade planejada e serras | relevo, urbanizacao, interior |
| Vitoria | Ilha, porto e manguezal | capital-ilha, costa, porto |

## Sul

| Capital | Conceito de fase | Intencao educativa |
| --- | --- | --- |
| Curitiba | Planejamento urbano | transporte, clima, urbanismo |
| Florianopolis | Ilha e litoral | insularidade, turismo, costa |
| Porto Alegre | Guaiba e pampas | hidrografia, sul, cultura regional |

## Centro-Oeste

| Capital | Conceito de fase | Intencao educativa |
| --- | --- | --- |
| Brasilia | Cerrado e capital federal | plano piloto, politica, cerrado |
| Goiania | Cerrado urbano | crescimento urbano e agro |
| Cuiaba | Portal do Pantanal | clima, pantanal, transicao |
| Campo Grande | Cerrado e Pantanal | vegetacao, pecuaria, biodiversidade |

## Nordeste em andamento

| Capital | Conceito de fase | Diferencial de jogabilidade |
| --- | --- | --- |
| Salvador | Baia, ladeiras, centro historico e paredoes | inimigos tematicos, energia urbana |
| Recife | Agua, pontes e cidade costeira | cenario litoraneo e urbano |
| Fortaleza | Orla, vento, litoral | dinamica costeira |
| Natal | Corrida das Dunas | fase com vento, dunas e fluxo diferente |
| Joao Pessoa | Mare do Amanhecer | mecanica de mare, tiro e defesa |
| Maceio | Jangada nas Piscinas Naturais | canais, mare, jangada e quiz final |
| Aracaju | Patrulha da Orla | ciclovia, calcadao, mangue e estuario |

---

# 9. Salvador como virada de qualidade

## O que mudou em Salvador

Salvador marcou uma virada importante no projeto.

A fase trouxe:

- cenario mais marcante;
- inimigos com identidade propria;
- referencias a som urbano e paredoes;
- chefao tematico;
- melhor conexao entre problema, cidade e gameplay.

Antes, alguns inimigos pareciam genericos. Depois de Salvador, a direcao passou a ser:

> Cada problema da fase deve ter imagem propria, comportamento proprio e relacao clara com a cidade.

## Exemplo de inimigo tematico

Na fase de Salvador, a ideia de onda sonora foi transformada em inimigo visual.

Isso tornou o jogo mais intuitivo:

- se o problema e som alto, o inimigo pode ser uma caixa de som;
- se o problema e alagamento, o inimigo pode ser um bueiro;
- se o problema e poluicao, o inimigo pode representar lixo, fumaca ou residuos;
- se o problema e mobilidade, o inimigo pode ser transito, obstaculo ou gargalo urbano.

Esse padrao deve guiar as proximas capitais.

---

# 10. Aracaju: fase mais recente

## Conceito

Aracaju foi planejada como uma fase de patrulha pela orla e pelo estuario.

Nome sugerido da experiencia:

> **Aracaju: Patrulha da Orla**

## Elementos geograficos

A fase trabalha:

- litoral;
- orla planejada;
- estuario;
- manguezal;
- canais;
- pressao urbana;
- uso turistico da costa.

## Faixas de jogo

A fase usa faixas de deslocamento:

- Ciclovia
- Calcadao
- Mangue

Cada faixa ajuda a dar sensacao de movimento e leitura espacial.

## Inimigos

Os inimigos foram criados para representar problemas locais:

| Inimigo | Representa |
| --- | --- |
| Caranguejo de Plastico | residuos e lixo em areas costeiras |
| Bueiro Alagado | drenagem urbana e alagamento |
| Calor da Orla | ilhas de calor e exposicao costeira |
| Barco Assoreado | assoreamento e pressao sobre canais |

## Chefao

O chefao da fase e o **Senhor do Estuario**, uma figura visualmente mais forte, criada para conectar mangue, agua, lixo, sombras e tensao ambiental.

## Estado tecnico

Aracaju foi implementada localmente com:

- cenario proprio;
- sprites de inimigos;
- sprite de chefe;
- perguntas especificas;
- validacao por build;
- validacao por lint;
- validacao das fases;
- rota local testavel.

Rota local:

```txt
http://127.0.0.1:5175/?screen=capitals&capital=aracaju
```

---

# 11. Processo de geracao das imagens

## Objetivo visual

O projeto evoluiu quando ficou claro que os jovens se apegam muito ao visual. Por isso, os cenarios e personagens passaram a ser tratados como parte central da aprendizagem.

A direcao visual busca:

- imagens bonitas;
- leitura rapida do ambiente;
- personagens memoraveis;
- chefes impactantes;
- inimigos tematicos;
- cenarios com identidade geografica real.

## Tipos de imagem usados

O projeto usa imagens para:

- fundos das fases;
- guardioes;
- chefes;
- inimigos;
- elementos de interface;
- apresentacao inicial.

## Fluxo de criacao dos sprites

Para personagens, inimigos e chefes, o fluxo mais usado foi:

1. Criar prompt visual especifico.
2. Gerar imagem com fundo magenta puro.
3. Remover o fundo magenta.
4. Salvar PNG com transparencia.
5. Ajustar tamanho e orientacao.
6. Testar dentro da fase.

## Por que fundo magenta

O fundo magenta facilita remover o fundo da imagem automaticamente. Isso e util para transformar uma imagem gerada por IA em sprite transparente.

Exemplo de ideia de prompt:

```txt
Crie um inimigo de jogo 2D representando um bueiro urbano alagado,
com expressao ameaçadora, estilo fantasia realista, visto de lado,
voltado para a esquerda, corpo inteiro, fundo solido #ff00ff,
sem sombra no chao, sem texto.
```

## Orientacao dos inimigos

Como o personagem anda da esquerda para a direita, os inimigos precisam olhar para a esquerda.

Esse detalhe foi importante porque algumas imagens geradas vinham viradas para o lado errado. A regra atual e:

> inimigo deve estar voltado para a esquerda, encarando o jogador.

## Organizacao dos assets

Os assets ficam organizados por tipo:

```txt
src/assets/backgrounds
src/assets/bosses
src/assets/enemies
```

Essa separacao facilita encontrar, trocar e validar imagens.

---

# 12. Arquitetura tecnica

## Stack principal

O projeto usa:

- React
- TypeScript
- Vite
- CSS modularizado no `src/index.css`
- Netlify para deploy
- GitHub para versionamento

## Scripts principais

```bash
npm run dev
npm run build
npm run lint
npm run stages:validate
```

## Rodar localmente

Com o terminal dentro da pasta `geosaga`:

```bash
npm install
npm run dev -- --host 127.0.0.1
```

Depois, abrir:

```txt
http://127.0.0.1:5173
```

Se a porta estiver ocupada, o Vite pode subir em outra porta, como `5174` ou `5175`.

## Rotas uteis para teste

Tela de capitais:

```txt
http://127.0.0.1:5175/?screen=capitals
```

Fase especifica:

```txt
http://127.0.0.1:5175/?screen=capitals&capital=salvador
http://127.0.0.1:5175/?screen=capitals&capital=maceio
http://127.0.0.1:5175/?screen=capitals&capital=aracaju
```

## Arquivos importantes

| Arquivo | Papel |
| --- | --- |
| `src/ui/App.tsx` | fluxo principal da interface |
| `src/ui/CapitalChallengeScreen.tsx` | tela da campanha das capitais |
| `src/data/capitalChallenges.ts` | dados das capitais, missoes e cenarios |
| `src/data/capitalQuestions.ts` | banco de perguntas por capital |
| `src/data/types.ts` | tipos usados nas capitais e regioes |
| `src/components/game/capitalStageEngine.ts` | motor/base das fases de capitais |
| `src/components/game/CapitalDuneRunnerStage.tsx` | fase especial de Natal |
| `src/components/game/CapitalTideStage.tsx` | fase especial de Joao Pessoa |
| `src/components/game/CapitalLagoonStage.tsx` | fase especial de Maceio |
| `src/components/game/CapitalEstuaryStage.tsx` | fase especial de Aracaju |
| `src/services/progressService.ts` | progresso salvo e capitais concluidas |
| `src/index.css` | estilos globais e estilos das fases |

---

# 13. Validacao e qualidade

## Antes de enviar para producao

O fluxo recomendado antes de commit e deploy:

```bash
npm run build
npm run lint
npm run stages:validate
git diff --check
```

## O que cada validacao cobre

| Comando | O que verifica |
| --- | --- |
| `npm run build` | TypeScript e build final do Vite |
| `npm run lint` | padroes de codigo e erros comuns |
| `npm run stages:validate` | consistencia dos dados de fases e obstaculos |
| `git diff --check` | espacos/trailing whitespace e problemas no diff |

## Teste manual recomendado

Para cada nova capital:

- abrir a rota direta;
- verificar se o fundo cobre toda a fase;
- confirmar se personagem e inimigos aparecem;
- testar movimento;
- testar defesa;
- testar tiro, se existir;
- confirmar que inimigos olham para a esquerda;
- chegar ao chefe;
- tentar derrotar sem quiz;
- confirmar que a finalizacao exige resposta correta;
- testar no desktop;
- testar no mobile ou viewport estreito.

---

# 14. Deploy

## GitHub

O versionamento do projeto e feito no GitHub.

Fluxo tipico:

```bash
git status -sb
git diff --stat
git add .
git commit -m "Mensagem objetiva da alteracao"
git push
```

## Netlify

O deploy em producao e feito no Netlify.

Comando usado no fluxo do projeto:

```bash
npx netlify deploy --prod --build
```

URL de producao:

```txt
https://geosaga.com.br
```

## Configuracao

O projeto usa build com:

```txt
npm run build
```

Publicacao da pasta:

```txt
dist
```

---

# 15. Estrategia de prompts

## Prompt inicial do projeto

O primeiro prompt do projeto pode ser apresentado no video como:

```txt
Crie um jogo educativo de geografia do Brasil chamado GeoSaga.
O jogador deve enfrentar guardioes das cinco regioes brasileiras,
aprender sobre biomas, capitais e caracteristicas regionais,
responder quizzes e avancar por fases jogaveis.
```

## Prompt de melhoria visual

Quando a apresentacao inicial parecia fraca, a direcao mudou para:

```txt
Quero uma entrada mais forte, com imagem marcante, personagens e visual
que representem a verdadeira realidade do jogo. A tela inicial deve
mostrar que este e um jogo de aventura geografica, nao apenas um quiz.
```

## Prompt de jogabilidade

Quando o jogo parecia dificil ou pouco interativo:

```txt
Adicione maneiras de o personagem se defender e esquivar dos tiros.
Quero que ele possa se abaixar, se proteger e usar poderes especiais.
A jogabilidade precisa ficar mais envolvente para adolescentes.
```

## Prompt de fase por capital

Modelo atual:

```txt
Crie uma fase jogavel para [capital], usando a geografia real da cidade
como base. O cenario precisa ser bonito, forte e memoravel. Os inimigos
devem representar problemas urbanos ou ambientais da capital. O chefe
so deve ser derrotado com conhecimento geografico, usando quiz.
```

## Prompt de imagem de inimigo

```txt
Crie um sprite 2D de jogo para um inimigo que represente [problema].
Ele deve ter personalidade propria, parecer ameaçador, estar voltado
para a esquerda, ter corpo inteiro, estilo fantasia realista e fundo
magenta solido #ff00ff para remocao posterior.
```

## Prompt de cenario

```txt
Crie um cenario panoramico horizontal para jogo 2D, inspirado em [capital].
Inclua elementos reais da cidade: [elementos geograficos e urbanos].
O visual deve ser bonito, cinematografico, realista, colorido e legivel
para gameplay lateral. Sem texto, sem logotipo, sem personagens principais.
```

---

# 16. Sugestao de roteiro para video no YouTube

## Abertura

Ideia de fala:

> Neste video eu vou mostrar como criei o GeoSaga, um jogo educativo de geografia do Brasil que comecou como uma ideia simples de quiz e evoluiu para uma campanha jogavel com guardioes, fases, chefes, imagens geradas por IA e capitais brasileiras.

Mostrar:

- tela inicial do jogo;
- logo;
- alguns guardioes;
- uma fase em movimento.

## Parte 1: o problema

Fala sugerida:

> Eu queria ensinar geografia de um jeito menos parado. Em vez de fazer apenas perguntas e respostas, a ideia foi criar um jogo em que o aluno aprende porque precisa usar conhecimento para avancar.

Mostrar:

- tela das regioes;
- cards dos guardioes;
- quiz rapido.

## Parte 2: os cinco guardioes

Fala sugerida:

> A primeira estrutura foi dividir o jogo nas cinco regioes brasileiras. Cada regiao ganhou um guardiao, uma identidade visual e um conjunto de perguntas.

Mostrar:

- Norte, Nordeste, Centro-Oeste, Sudeste e Sul;
- destaque visual para cada personagem.

## Parte 3: primeiros problemas e correcoes

Fala sugerida:

> No comeco, alguns problemas apareceram: textos quebrados, personagens cortados no mobile e uma apresentacao inicial que nao transmitia a forca do jogo. Entao comecei a melhorar a interface, a responsividade e o impacto visual.

Mostrar:

- antes e depois, se houver prints;
- versao desktop e mobile.

## Parte 4: melhorando a jogabilidade

Fala sugerida:

> Tambem percebi que o jogo precisava ser mais justo e mais divertido. Entao entraram mecanicas como abaixar, defender, atirar, usar poder especial e enfrentar chefes com quiz.

Mostrar:

- personagem se movendo;
- inimigo atacando;
- defesa;
- poder especial.

## Parte 5: a campanha das capitais

Fala sugerida:

> Depois dos cinco guardioes, veio a ideia de expandir para as capitais do Brasil. A partir dai, cada capital passou a ganhar uma fase propria, com cenario, inimigos e problemas ligados a geografia local.

Mostrar:

- tela da campanha das capitais;
- capitais por regiao;
- fases ja feitas.

## Parte 6: Salvador como ponto de virada

Fala sugerida:

> Salvador foi um ponto de virada. Ali ficou claro que os inimigos precisavam ter personalidade propria. Se o problema era som alto, o inimigo deveria parecer uma caixa de som ou uma onda sonora. Isso deixou o jogo mais visual e mais facil de entender.

Mostrar:

- fase de Salvador;
- inimigos tematicos;
- boss.

## Parte 7: variando as mecanicas

Fala sugerida:

> Para evitar que as 27 capitais fossem iguais, comecei a pensar em mecanicas especificas: dunas em Natal, mare em Joao Pessoa, jangada em Maceio e estuario em Aracaju.

Mostrar:

- Natal;
- Joao Pessoa;
- Maceio;
- Aracaju.

## Parte 8: imagens geradas por IA

Fala sugerida:

> Grande parte do impacto visual veio da geracao de imagens. Usei prompts para criar cenarios, chefes e inimigos. Depois tratei os sprites com fundo magenta para deixar tudo com transparencia dentro do jogo.

Mostrar:

- exemplo de prompt;
- imagem original com fundo magenta;
- imagem recortada;
- sprite dentro da fase.

## Parte 9: educacao dentro do jogo

Fala sugerida:

> Um cuidado importante foi manter o jogo educativo. Por isso, o chefe nao pode simplesmente morrer com tiros. O jogador precisa responder corretamente uma pergunta de geografia para finalizar a fase.

Mostrar:

- quiz;
- barra do chefe;
- finalizacao.

## Parte 10: validacao e deploy

Fala sugerida:

> Antes de subir cada versao, eu rodo build, lint, validacao das fases e depois publico no Netlify.

Mostrar:

- terminal;
- comandos;
- GitHub;
- Netlify;
- site em producao.

## Fechamento

Fala sugerida:

> O GeoSaga ainda esta evoluindo. A ideia e completar todas as capitais do Brasil, variar ainda mais as mecanicas e transformar a geografia em uma experiencia visual, jogavel e memoravel.

Mostrar:

- mapa/campanha;
- fases futuras;
- chamada para acompanhar a evolucao.

---

# 17. Estrutura sugerida de slides

## Slide 1: Titulo

**GeoSaga: criando um jogo educativo de geografia com IA**

Elementos visuais:

- logo do jogo;
- guardioes;
- fundo de cenario marcante.

## Slide 2: A ideia

Mensagem:

- ensinar geografia de forma jogavel;
- unir quiz, aventura e personagens;
- transformar regioes e capitais em fases.

## Slide 3: O problema educacional

Mensagem:

- geografia pode parecer abstrata;
- quizzes isolados cansam;
- visual e interacao aumentam engajamento.

## Slide 4: A solucao

Mensagem:

- guardioes regionais;
- fases jogaveis;
- chefes;
- perguntas integradas ao combate.

## Slide 5: Os cinco guardioes

Mostrar:

- Iare, Mandacaru, Buriti, Jequi e Arauca.

## Slide 6: Primeira versao

Mostrar:

- tela inicial;
- cards das regioes;
- fluxo quiz + fase.

## Slide 7: Problemas encontrados

Listar:

- textos quebrados;
- mobile cortando personagens;
- apresentacao fraca;
- dificuldade de esquiva;
- fases parecidas.

## Slide 8: Melhorias de interface

Mostrar:

- nova apresentacao;
- responsividade;
- melhor leitura.

## Slide 9: Melhorias de jogabilidade

Listar:

- defesa;
- abaixar;
- tiro;
- poder especial;
- boss com quiz.

## Slide 10: A campanha das capitais

Mensagem:

- nova etapa apos as regioes;
- 27 capitais;
- progressao por regiao.

## Slide 11: Status das regioes

Tabela:

- Sudeste completa;
- Sul completa;
- Centro-Oeste completa;
- Nordeste em andamento;
- Norte pendente.

## Slide 12: Salvador

Mensagem:

- ponto de virada visual;
- inimigos tematicos;
- identidade urbana.

## Slide 13: Natal

Mensagem:

- corrida das dunas;
- variacao de gameplay;
- vento e relevo costeiro.

## Slide 14: Joao Pessoa

Mensagem:

- mare do amanhecer;
- tiro e defesa;
- quiz obrigatorio para o chefe.

## Slide 15: Maceio

Mensagem:

- jangada e piscinas naturais;
- correcao do fundo azul;
- boss com regra educativa.

## Slide 16: Aracaju

Mensagem:

- orla, mangue e estuario;
- inimigos ligados a problemas ambientais;
- fase validada localmente.

## Slide 17: Como as imagens foram feitas

Mostrar:

- prompt;
- imagem gerada;
- fundo magenta;
- sprite final.

## Slide 18: Arquitetura do projeto

Mostrar:

- React + TypeScript + Vite;
- dados em arquivos;
- componentes por fase;
- assets separados.

## Slide 19: Banco de perguntas

Mensagem:

- perguntas por capital;
- alternativas embaralhadas;
- conhecimento como chave de progressao.

## Slide 20: Validacao

Comandos:

```bash
npm run build
npm run lint
npm run stages:validate
```

## Slide 21: Deploy

Mostrar:

- GitHub;
- Netlify;
- dominio `geosaga.com.br`.

## Slide 22: O que falta

Listar:

- terminar Nordeste;
- implantar Norte;
- variar mais mecanicas;
- melhorar feedback visual;
- adicionar novas modalidades.

## Slide 23: Aprendizados

Mensagem:

- IA acelera prototipagem;
- prompt precisa ser iterativo;
- jogo educativo precisa ser jogo de verdade;
- visual e mecanica caminham juntos.

## Slide 24: Fechamento

Mensagem:

- GeoSaga como projeto vivo;
- proximas capitais;
- convite para acompanhar a evolucao.

---

# 18. Checklist para gravar o video

Antes de gravar:

- abrir o projeto local;
- testar tela inicial;
- testar campanha das capitais;
- escolher 3 ou 4 fases para mostrar;
- preparar prints de antes/depois, se houver;
- abrir terminal com comandos principais;
- abrir GitHub e Netlify;
- deixar prompts exemplos separados;
- testar audio e resolucao da gravacao.

Durante a gravacao:

- mostrar primeiro o resultado final;
- depois explicar como chegou ali;
- evitar comecar pelo codigo;
- alternar entre jogo, prompt, imagem e codigo;
- explicar decisoes de design;
- reforcar o objetivo educativo.

Depois da gravacao:

- gerar slides;
- adicionar capturas das fases;
- marcar capitulos no YouTube;
- incluir links do projeto, se desejar;
- fazer thumbnail com logo e guardioes.

---

# 19. Possiveis capitulos do YouTube

```txt
00:00 Introducao
01:00 A ideia do GeoSaga
03:00 Os cinco guardioes do Brasil
06:00 Primeiros problemas e melhorias
09:00 Como a jogabilidade evoluiu
13:00 A campanha das capitais
17:00 Salvador e os inimigos tematicos
21:00 Gerando imagens com IA
27:00 Criando sprites com fundo transparente
32:00 Quiz geografico dentro do combate
37:00 Validando o projeto
41:00 Deploy no Netlify
45:00 Proximos passos
```

---

# 20. Roadmap recomendado

## Curto prazo

- Finalizar Teresina.
- Finalizar Sao Luis.
- Commitar e publicar Aracaju quando aprovado.
- Revisar a consistencia visual das fases do Nordeste.
- Garantir que todas as respostas corretas estejam variando.

## Medio prazo

- Polir visualmente a Regiao Norte em testes com alunos.
- Criar uma fase com mecanica de surf em uma capital litoranea.
- Criar mais poderes especiais por guardiao.
- Adicionar recompensas apos concluir regioes.
- Evoluir a tela final com conquistas, tempo de campanha e chamada para revisao.

## Longo prazo

- Criar expansoes alem das 27 capitais, como desafios de revisao e missoes especiais.
- Adicionar ranking local.
- Adicionar conquistas.
- Criar modo revisao para estudar perguntas.
- Criar painel do professor.
- Criar banco expansivel de questoes.
- Exportar relatorio de desempenho.

---

# 21. Principais aprendizados do projeto

## 1. Um jogo educativo precisa ser jogo primeiro

Se o jogo parecer apenas um quiz com fundo bonito, o jogador perde interesse. A aprendizagem precisa estar integrada a uma experiencia divertida.

## 2. Visual gera apego

Cenarios fortes, personagens memoraveis e inimigos com personalidade aumentam a vontade de continuar jogando.

## 3. Repeticao precisa ser combatida

Se todas as capitais tiverem a mesma dinamica, o jogo fica previsivel. Cada cidade precisa ter uma assinatura propria.

## 4. O quiz deve ter consequencia

Responder corretamente precisa mudar algo no jogo: causar dano, liberar poder, abrir caminho ou finalizar chefe.

## 5. IA acelera, mas nao substitui direcao

As imagens geradas por IA precisam de curadoria:

- orientar lado correto;
- remover fundo;
- ajustar escala;
- testar no cenario;
- trocar quando o resultado nao transmite a ideia.

## 6. Validacao evita regressao

Cada melhoria visual pode quebrar algo no jogo. Por isso, build, lint, validacao e teste manual sao parte do processo criativo.

---

# 22. Frase central para a apresentacao

> GeoSaga transforma geografia brasileira em aventura: cada regiao vira guardiao, cada capital vira fase e cada resposta certa vira poder dentro do jogo.

---

# 23. Resumo executivo

GeoSaga e um jogo educativo de geografia do Brasil desenvolvido com foco em visual forte, personagens marcantes e jogabilidade progressiva.

O projeto comecou com cinco guardioes regionais e evoluiu para uma campanha com as capitais brasileiras. A cada fase, o jogador enfrenta problemas inspirados na realidade geografica e urbana da cidade, coleta marcos, responde perguntas e derrota chefes usando conhecimento.

A direcao atual e tornar cada capital unica, combinando:

- cenario realista e bonito;
- inimigos tematicos;
- mecanica propria;
- quiz integrado ao combate;
- progressao por regioes.

O jogo ja possui regioes completas e a campanha das 27 capitais concluida. O proximo grande marco e validar a experiencia com jogadores, otimizar os assets e continuar criando variacoes de jogabilidade para futuras expansoes.

