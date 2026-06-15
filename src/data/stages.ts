import type { RegionId, StageDefinition } from './types';

/**
 * Definição das fases jogáveis por região. O MVP entrega a fase Norte (Iarê)
 * totalmente jogável; as demais já têm objetivo, inimigos e cenário definidos
 * e são liberadas pelo mesmo motor de fase.
 */
export const STAGES: Record<RegionId, StageDefinition> = {
  norte: {
    region: 'norte',
    title: 'A travessia das águas',
    objective: 'Purifique os rios e proteja a floresta amazônica.',
    attackVerb: 'Restaurar',
    specialVerb: 'Onda das Águas',
    victoryMessage:
      'Iarê devolveu a vida aos rios! As águas voltam a correr limpas pela floresta.',
    goalIcon: '🌳',
    goalLabel: 'Floresta protegida',
    enemyIds: ['norte-rio-poluido', 'norte-desmatamento', 'norte-queimada'],
    scenery: {
      skyTop: '#0d6e8c',
      skyBottom: '#1ea88a',
      ground: '#15623f',
      groundAccent: '#1f8a55',
      hill: '#0f7a5a',
    },
  },
  nordeste: {
    region: 'nordeste',
    title: 'A resistência do sertão',
    objective: 'Ative as cisternas e combata a desertificação.',
    attackVerb: 'Reverdecer',
    specialVerb: 'Chuva do Sertão',
    victoryMessage:
      'Mandacaru trouxe água ao sertão! A caatinga reverdece e a vida resiste.',
    goalIcon: '💧',
    goalLabel: 'Cisterna ativada',
    enemyIds: [
      'nordeste-seca',
      'nordeste-solo-rachado',
      'nordeste-erosao',
      'nordeste-mandacaru-corrompido',
    ],
    scenery: {
      skyTop: '#e7a33c',
      skyBottom: '#f4cd6a',
      ground: '#a9722e',
      groundAccent: '#c89a3c',
      hill: '#bc7e35',
    },
  },
  'centro-oeste': {
    region: 'centro-oeste',
    title: 'O sopro do cerrado',
    objective: 'Apague as queimadas e proteja o Pantanal e o Cerrado.',
    attackVerb: 'Apagar',
    specialVerb: 'Ventania do Cerrado',
    victoryMessage:
      'Buriti apagou o fogo! O cerrado respira e o Pantanal volta a florescer.',
    goalIcon: '🦜',
    goalLabel: 'Pantanal salvo',
    enemyIds: [
      'centro-oeste-incendio',
      'centro-oeste-fumaca',
      'centro-oeste-area-degradada',
      'centro-oeste-animal-perigo',
    ],
    scenery: {
      skyTop: '#caa53a',
      skyBottom: '#efd06a',
      ground: '#8a6b2e',
      groundAccent: '#c2a040',
      hill: '#a98a36',
    },
  },
  sudeste: {
    region: 'sudeste',
    title: 'O pulso da metrópole',
    objective: 'Reduza a poluição urbana e restaure as áreas verdes.',
    attackVerb: 'Restaurar',
    specialVerb: 'Brisa da Mata',
    victoryMessage:
      'Jequi limpou o ar e devolveu o verde às cidades! A Mata Atlântica respira de novo.',
    goalIcon: '🌆',
    goalLabel: 'Cidade verde',
    enemyIds: ['sudeste-poluicao-urbana', 'sudeste-enchente', 'sudeste-fumaca-industrial'],
    scenery: {
      skyTop: '#3f6f9c',
      skyBottom: '#70a6c8',
      ground: '#2d5a44',
      groundAccent: '#3f8a5f',
      hill: '#356f55',
    },
  },
  sul: {
    region: 'sul',
    title: 'A guarda das araucárias',
    objective: 'Proteja as araucárias e os pampas e resista ao frio.',
    attackVerb: 'Proteger',
    specialVerb: 'Calor dos Pampas',
    victoryMessage:
      'Araucá protegeu as araucárias e os campos! O Sul resiste ao frio com vida.',
    goalIcon: '🌲',
    goalLabel: 'Araucárias salvas',
    enemyIds: ['sul-vento-gelado', 'sul-araucaria-ameacada', 'sul-geada'],
    scenery: {
      skyTop: '#5e8fb0',
      skyBottom: '#a9d2e6',
      ground: '#3f6b4e',
      groundAccent: '#5a8a64',
      hill: '#4a7a59',
    },
  },
};
