import type { CapitalId } from './types';

export interface CapitalSpecialQuestion {
  id: string;
  capital: CapitalId;
  statement: string;
  choices: [string, string, string, string];
  answerIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

export const CAPITAL_SPECIAL_QUESTIONS: Record<CapitalId, CapitalSpecialQuestion[]> = {
  'sao-paulo': [
    {
      id: 'sp-ilha-calor',
      capital: 'sao-paulo',
      statement: 'Qual acao ajuda a reduzir ilhas de calor em uma metropole como Sao Paulo?',
      choices: [
        'Trocar areas verdes por mais asfalto',
        'Criar corredores verdes e ampliar arborizacao',
        'Eliminar pracas para abrir avenidas',
        'Concentrar deslocamentos apenas em carros',
      ],
      answerIndex: 1,
      explanation: 'Vegetacao, parques e corredores verdes reduzem temperatura, melhoram a infiltracao da agua e qualificam o espaco urbano.',
    },
    {
      id: 'sp-rios-urbanos',
      capital: 'sao-paulo',
      statement: 'Quais rios sao muito associados a drenagem urbana da cidade de Sao Paulo?',
      choices: ['Amazonas e Negro', 'Tiete e Pinheiros', 'Parana e Iguacu', 'Sao Francisco e Tocantins'],
      answerIndex: 1,
      explanation: 'Tiete e Pinheiros atravessam a metropole e ajudam a explicar drenagem, enchentes, retificacao e recuperacao ambiental.',
    },
    {
      id: 'sp-mobilidade',
      capital: 'sao-paulo',
      statement: 'Por que metro, trem e corredores de onibus sao importantes em Sao Paulo?',
      choices: [
        'Porque reduzem a dependencia do carro individual',
        'Porque eliminam todos os bairros perifericos',
        'Porque impedem o crescimento urbano',
        'Porque substituem rios e areas verdes',
      ],
      answerIndex: 0,
      explanation: 'Transporte coletivo de alta capacidade melhora a mobilidade e reduz congestionamentos e emissoes por pessoa transportada.',
    },
    {
      id: 'sp-metropole',
      capital: 'sao-paulo',
      statement: 'Sao Paulo e um exemplo de metropole porque...',
      choices: [
        'tem baixa concentracao de servicos',
        'exerce influencia economica e urbana sobre uma grande rede de cidades',
        'nao possui periferias',
        'nao se conecta com outras regioes do Brasil',
      ],
      answerIndex: 1,
      explanation: 'Metropoles concentram servicos, fluxos, trabalho, transporte e influencia sobre municipios ao redor.',
    },
    {
      id: 'sp-enchentes',
      capital: 'sao-paulo',
      statement: 'Um fator que aumenta enchentes em areas urbanas densas e...',
      choices: [
        'solo permeavel e vegetacao abundante',
        'impermeabilizacao do solo por asfalto e concreto',
        'uso de parques lineares',
        'recuperacao de varzeas',
      ],
      answerIndex: 1,
      explanation: 'Asfalto e concreto reduzem a infiltracao da agua, aceleram o escoamento e podem sobrecarregar galerias e rios urbanos.',
    },
    {
      id: 'sp-mata-atlantica',
      capital: 'sao-paulo',
      statement: 'Qual bioma originalmente predominava em grande parte da regiao de Sao Paulo?',
      choices: ['Caatinga', 'Pampa', 'Mata Atlantica', 'Pantanal'],
      answerIndex: 2,
      explanation: 'A Mata Atlantica marca a historia ambiental do Sudeste e ainda aparece em fragmentos, serras e parques urbanos.',
    },
    {
      id: 'sp-verticalizacao',
      capital: 'sao-paulo',
      statement: 'A verticalizacao em Sao Paulo significa principalmente...',
      choices: [
        'crescimento com muitos edificios e maior adensamento',
        'desaparecimento total do comercio',
        'substituicao da cidade por areas rurais',
        'queda da populacao metropolitana',
      ],
      answerIndex: 0,
      explanation: 'Verticalizacao aumenta a presenca de predios e muda paisagem, densidade, sombra, circulacao e uso do solo.',
    },
    {
      id: 'sp-regiao-metropolitana',
      capital: 'sao-paulo',
      statement: 'Quando municipios vizinhos ficam muito integrados a Sao Paulo, formam uma...',
      choices: ['fronteira agricola', 'regiao metropolitana', 'chapada sedimentar', 'zona polar'],
      answerIndex: 1,
      explanation: 'Regiao metropolitana reune municipios conectados por trabalho, transporte, servicos, moradia e fluxos diarios.',
    },
    {
      id: 'sp-poluicao',
      capital: 'sao-paulo',
      statement: 'Uma forma geografica de reduzir poluicao atmosferica urbana e...',
      choices: [
        'aumentar o uso de combustiveis poluentes',
        'priorizar transporte coletivo limpo e mobilidade ativa',
        'derrubar toda arborizacao urbana',
        'canalizar mais rios sem tratamento',
      ],
      answerIndex: 1,
      explanation: 'Transporte coletivo eficiente, energia limpa, caminhada e bicicleta reduzem emissoes no espaco urbano.',
    },
    {
      id: 'sp-desigualdade-espacial',
      capital: 'sao-paulo',
      statement: 'Desigualdade socioespacial em uma metropole aparece quando...',
      choices: [
        'todos os bairros tem os mesmos servicos',
        'moradia, transporte, saneamento e oportunidades se distribuem de forma desigual',
        'nao existem deslocamentos diarios',
        'a cidade deixa de ter centro e periferia',
      ],
      answerIndex: 1,
      explanation: 'A geografia urbana estuda como infraestrutura, renda, acesso e oportunidades variam entre areas da cidade.',
    },
  ],
  'rio-de-janeiro': [],
  'belo-horizonte': [],
  vitoria: [],
};
