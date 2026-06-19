import type { CapitalId, CapitalRouteId } from './types';

export interface CapitalMission {
  id: CapitalId;
  route: CapitalRouteId;
  city: string;
  state: string;
  title: string;
  scenery: 'sao-paulo' | 'rio' | 'belo-horizonte' | 'vitoria' | 'curitiba' | 'florianopolis' | 'porto-alegre' | 'brasilia';
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

export const CAPITAL_ROUTE_IDS: CapitalRouteId[] = ['sudeste', 'sul', 'centro-oeste'];

export const CAPITAL_ROUTE_META: Record<CapitalRouteId, { name: string; label: string; description: string }> = {
  sudeste: {
    name: 'Sudeste',
    label: 'Metrópoles e serras',
    description: 'São Paulo, Rio de Janeiro, Belo Horizonte e Vitória em fases urbanas e costeiras.',
  },
  sul: {
    name: 'Sul',
    label: 'Araucárias, ilhas e pampas',
    description: 'Curitiba, Florianópolis e Porto Alegre completam a rota das capitais do Sul.',
  },
  'centro-oeste': {
    name: 'Centro-Oeste',
    label: 'Cerrado e capital federal',
    description: 'Brasília inicia a rota do Centro-Oeste, conectando planejamento urbano, Cerrado e Lago Paranoá.',
  },
};

export const CAPITAL_ROUTE_ID: CapitalRouteId = 'sudeste';
export const SUL_CAPITAL_ROUTE_ID: CapitalRouteId = 'sul';
export const CENTRO_OESTE_CAPITAL_ROUTE_ID: CapitalRouteId = 'centro-oeste';

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
  {
    id: 'curitiba',
    route: SUL_CAPITAL_ROUTE_ID,
    city: 'Curitiba',
    state: 'PR',
    title: 'Araucárias e Cidade Planejada',
    scenery: 'curitiba',
    summary: 'Parques lineares, tubos de ônibus, clima frio e araucárias formam uma fase urbana verde e estratégica.',
    challenge: 'Conecte mobilidade, drenagem, parques e clima subtropical antes que a neblina trave a cidade.',
    visualHook: 'Jardim Botânico, araucárias, tubos de transporte, chuva fina e corredores verdes.',
    collectLabel: 'marcos verdes',
    clues: ['Jardim Botânico', 'Araucárias', 'Transporte integrado'],
    question: {
      statement: 'Curitiba é a capital de qual estado?',
      choices: ['Paraná', 'Santa Catarina', 'Rio Grande do Sul', 'São Paulo'],
      answerIndex: 0,
      explanation: 'Curitiba é a capital do Paraná e é reconhecida por planejamento urbano, parques e transporte coletivo.',
    },
  },
  {
    id: 'florianopolis',
    route: SUL_CAPITAL_ROUTE_ID,
    city: 'Florianópolis',
    state: 'SC',
    title: 'Ilha, Dunas e Lagoas',
    scenery: 'florianopolis',
    summary: 'Uma capital-ilha com praias, dunas, lagoas, pontes e morros costeiros.',
    challenge: 'Equilibre turismo, ecossistemas costeiros, mobilidade e crescimento urbano na ilha.',
    visualHook: 'Ponte, ilha, praias, dunas, lagoas e morros verdes cercados pelo Atlântico.',
    collectLabel: 'trilhas costeiras',
    clues: ['Capital-ilha', 'Dunas', 'Lagoa da Conceição'],
    question: {
      statement: 'Florianópolis é capital de qual estado?',
      choices: ['Paraná', 'Santa Catarina', 'Rio Grande do Sul', 'Mato Grosso do Sul'],
      answerIndex: 1,
      explanation: 'Florianópolis é a capital de Santa Catarina e se destaca por sua geografia insular e costeira.',
    },
  },
  {
    id: 'porto-alegre',
    route: SUL_CAPITAL_ROUTE_ID,
    city: 'Porto Alegre',
    state: 'RS',
    title: 'Guaíba, Pampas e Metrópole',
    scenery: 'porto-alegre',
    summary: 'A cidade se abre para o Guaíba, com áreas urbanas, parques, ilhas e influência dos pampas.',
    challenge: 'Conecte lago, drenagem, mobilidade, memória urbana e clima subtropical no extremo sul do Brasil.',
    visualHook: 'Pôr do sol no Guaíba, parques urbanos, orla, ilhas e céu amplo dos pampas.',
    collectLabel: 'rotas do Guaíba',
    clues: ['Lago Guaíba', 'Orla', 'Pampas'],
    question: {
      statement: 'Porto Alegre é capital de qual estado?',
      choices: ['Santa Catarina', 'Paraná', 'Rio Grande do Sul', 'Goiás'],
      answerIndex: 2,
      explanation: 'Porto Alegre é a capital do Rio Grande do Sul e uma das principais metrópoles do Sul.',
    },
  },
  {
    id: 'brasilia',
    route: CENTRO_OESTE_CAPITAL_ROUTE_ID,
    city: 'Brasília',
    state: 'DF',
    title: 'Cerrado, Eixo Monumental e Lago Paranoá',
    scenery: 'brasilia',
    summary: 'A capital federal combina cidade planejada, Cerrado, grandes eixos viários, arquitetura moderna e pressão sobre recursos hídricos.',
    challenge: 'Equilibre expansão urbana, clima seco, mobilidade planejada, Cerrado e gestão da água no Planalto Central.',
    visualHook: 'Eixo Monumental, céu amplo do Cerrado, ipês, Lago Paranoá, concreto modernista e solo vermelho.',
    collectLabel: 'marcos do Cerrado',
    clues: ['Eixo Monumental', 'Lago Paranoá', 'Cerrado'],
    question: {
      statement: 'Brasília é capital de qual unidade federativa?',
      choices: ['Distrito Federal', 'Goiás', 'Mato Grosso', 'Minas Gerais'],
      answerIndex: 0,
      explanation: 'Brasília é a capital federal do Brasil e fica no Distrito Federal, no Centro-Oeste.',
    },
  },
];
