import type { CapitalId, CapitalRouteId } from './types';

export interface CapitalMission {
  id: CapitalId;
  route: CapitalRouteId;
  city: string;
  state: string;
  title: string;
  scenery: 'sao-paulo' | 'rio' | 'belo-horizonte' | 'vitoria';
  summary: string;
  challenge: string;
  visualHook: string;
  collectLabel: string;
  clues: string[];
  question: {
    statement: string;
    choices: [string, string, string, string];
    answerIndex: 0 | 1 | 2 | 3;
    explanation: string;
  };
}

export const CAPITAL_ROUTE_ID: CapitalRouteId = 'sudeste';

export const CAPITAL_MISSIONS: CapitalMission[] = [
  {
    id: 'sao-paulo',
    route: CAPITAL_ROUTE_ID,
    city: 'São Paulo',
    state: 'SP',
    title: 'Metrópole em Movimento',
    scenery: 'sao-paulo',
    summary: 'Arranha-céus, avenidas, metrô e grafites formam uma fase urbana densa e acelerada.',
    challenge: 'Organize a mobilidade e reduza a névoa de poluição antes que a cidade trave.',
    visualHook: 'Cidade vertical, trânsito intenso, luzes de metrô e concreto molhado.',
    collectLabel: 'mapas de mobilidade',
    clues: ['Linhas de metrô', 'Avenida Paulista', 'Ilhas de calor'],
    question: {
      statement: 'Qual é a capital do estado de São Paulo?',
      choices: ['Campinas', 'Santos', 'São Paulo', 'São Bernardo do Campo'],
      answerIndex: 2,
      explanation: 'São Paulo é a capital estadual e a maior metrópole brasileira.',
    },
  },
  {
    id: 'rio-de-janeiro',
    route: CAPITAL_ROUTE_ID,
    city: 'Rio de Janeiro',
    state: 'RJ',
    title: 'Morro, Praia e Baía',
    scenery: 'rio',
    summary: 'Uma favela em morro domina o primeiro plano, com praia, mar e montanhas no horizonte.',
    challenge: 'Conecte áreas de encosta, praia e baía, desviando dos impactos sociais e ambientais.',
    visualHook: 'Casas coloridas em encosta, areia clara, mar azul e silhueta do Pão de Açúcar.',
    collectLabel: 'pontos de paisagem',
    clues: ['Morro urbanizado', 'Praia ao fundo', 'Baía de Guanabara'],
    question: {
      statement: 'Qual capital brasileira é conhecida pela Baía de Guanabara?',
      choices: ['Vitória', 'Rio de Janeiro', 'Florianópolis', 'Salvador'],
      answerIndex: 1,
      explanation: 'A Baía de Guanabara é uma das paisagens marcantes do Rio de Janeiro.',
    },
  },
  {
    id: 'belo-horizonte',
    route: CAPITAL_ROUTE_ID,
    city: 'Belo Horizonte',
    state: 'MG',
    title: 'Horizonte das Serras',
    scenery: 'belo-horizonte',
    summary: 'Cidade planejada, praças, avenidas largas e serras mineiras ao fundo.',
    challenge: 'Use o relevo e a malha urbana para equilibrar crescimento, áreas verdes e patrimônio.',
    visualHook: 'Luzes quentes, Serra do Curral, edifícios médios e praças geométricas.',
    collectLabel: 'marcos urbanos',
    clues: ['Serra do Curral', 'Praças planejadas', 'Patrimônio mineiro'],
    question: {
      statement: 'Belo Horizonte é a capital de qual estado?',
      choices: ['Minas Gerais', 'Espírito Santo', 'Goiás', 'Paraná'],
      answerIndex: 0,
      explanation: 'Belo Horizonte é a capital de Minas Gerais.',
    },
  },
  {
    id: 'vitoria',
    route: CAPITAL_ROUTE_ID,
    city: 'Vitória',
    state: 'ES',
    title: 'Ilha, Porto e Manguezal',
    scenery: 'vitoria',
    summary: 'Uma capital-ilha com pontes, porto, manguezais e relevo costeiro.',
    challenge: 'Atravesse a cidade-ilha preservando manguezais e administrando o fluxo portuário.',
    visualHook: 'Ponte iluminada, navios no porto, água refletindo a cidade e mangue nas margens.',
    collectLabel: 'rotas costeiras',
    clues: ['Capital-ilha', 'Porto de Vitória', 'Manguezal urbano'],
    question: {
      statement: 'Vitória é capital de qual unidade federativa?',
      choices: ['Rio de Janeiro', 'Santa Catarina', 'Espírito Santo', 'Mato Grosso'],
      answerIndex: 2,
      explanation: 'Vitória é a capital do Espírito Santo.',
    },
  },
];

