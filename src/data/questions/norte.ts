import type { Question } from '../types';

export const NORTE_QUESTIONS: Question[] = [
  {
    id: 'norte-001',
    statement: 'Qual é o maior estado da região Norte (e também do Brasil) em área territorial?',
    choices: ['Pará', 'Amazonas', 'Roraima', 'Acre'],
    answerIndex: 1,
    explanation:
      'O Amazonas tem cerca de 1,56 milhão de km², o maior estado do Brasil em área.',
    region: 'norte',
    difficulty: 1,
  },
  {
    id: 'norte-002',
    statement: 'Qual rio, o mais caudaloso do mundo, atravessa a região Norte?',
    choices: ['Rio Tocantins', 'Rio São Francisco', 'Rio Amazonas', 'Rio Paraná'],
    answerIndex: 2,
    explanation:
      'O Rio Amazonas despeja no oceano cerca de 1/5 de toda a água doce que chega aos mares no mundo.',
    region: 'norte',
    difficulty: 1,
  },
  {
    id: 'norte-003',
    statement: 'Qual é o clima predominante na região Norte?',
    choices: ['Semiárido', 'Subtropical', 'Tropical de altitude', 'Equatorial'],
    answerIndex: 3,
    explanation:
      'O clima equatorial é quente e úmido o ano todo, com chuvas abundantes, típico da Amazônia.',
    region: 'norte',
    difficulty: 1,
  },
  {
    id: 'norte-004',
    statement: 'Quantos estados formam a região Norte do Brasil?',
    choices: ['5', '6', '7', '9'],
    answerIndex: 2,
    explanation:
      'São 7 estados: Acre, Amapá, Amazonas, Pará, Rondônia, Roraima e Tocantins.',
    region: 'norte',
    difficulty: 2,
  },
  {
    id: 'norte-005',
    statement: 'Em qual cidade da região Norte está localizada a Zona Franca, importante polo industrial?',
    choices: ['Belém', 'Porto Velho', 'Macapá', 'Manaus'],
    answerIndex: 3,
    explanation:
      'A Zona Franca de Manaus, criada em 1967, concentra indústrias com incentivos fiscais na capital do Amazonas.',
    region: 'norte',
    difficulty: 2,
  },
];
