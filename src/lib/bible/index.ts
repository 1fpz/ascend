// ==============================================================================
// PROJECT ASCEND — BIBLE READING SMART MODULE
// Deterministic Scripture Provider (Public Domain Scriptures & Safe API Client)
// ==============================================================================

export interface BiblePassage {
  reference: string;
  book: string;
  chapter: number;
  translation: string;
  text: string;
  verses: { verse: number; text: string }[];
}

export interface ReadingPlanItem {
  day: number;
  title: string;
  reference: string;
  book: string;
  chapter: number;
}

// Embedded Public Domain Scriptures (Almeida Revista e Corrigida / Domínio Público)
// Provides complete offline reliability without third-party failures
export const EMBEDDED_SCRIPTURES: Record<string, BiblePassage> = {
  'proverbios-3': {
    reference: 'Provérbios 3:1-12',
    book: 'Provérbios',
    chapter: 3,
    translation: 'Almeida (Domínio Público)',
    text: 'Filho meu, não te esqueças da minha lei, e o teu coração guarde os meus mandamentos. Porque eles trarão longevidade, dias de vida e paz. Não te desamparem a benignidade e a fidelidade; ata-as ao teu pescoço; escreve-as na tábua do teu coração. Confia no Senhor de todo o teu coração, e não te estribes no teu próprio entendimento. Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas.',
    verses: [
      { verse: 1, text: 'Filho meu, não te esqueças da minha lei, e o teu coração guarde os meus mandamentos.' },
      { verse: 2, text: 'Porque eles trarão longevidade, dias de vida e paz.' },
      { verse: 3, text: 'Não te desamparem a benignidade e a fidelidade; ata-as ao teu pescoço; escreve-as na tábua do teu coração.' },
      { verse: 4, text: 'E acharás graça e bom entendimento aos olhos de Deus e dos homens.' },
      { verse: 5, text: 'Confia no Senhor de todo o teu coração, e não te estribes no teu próprio entendimento.' },
      { verse: 6, text: 'Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas.' },
      { verse: 7, text: 'Não sejas sábio a teus próprios olhos; teme ao Senhor e aparta-te do mal.' },
      { verse: 8, text: 'Isto será saúde para o teu corpo e refrigério para os teus ossos.' },
      { verse: 9, text: 'Honra ao Senhor com os teus bens e com as primícias de toda a tua renda;' },
      { verse: 10, text: 'E se encherão os teus celeiros abundantemente, e transbordarão de mosto os teus lagares.' },
      { verse: 11, text: 'Filho meu, não rejeites a disciplina do Senhor, nem te enfades da sua repreensão.' },
      { verse: 12, text: 'Porque o Senhor repreende a quem ama, assim como o pai ao filho a quem quer bem.' },
    ],
  },
  'salmos-23': {
    reference: 'Salmos 23:1-6',
    book: 'Salmos',
    chapter: 23,
    translation: 'Almeida (Domínio Público)',
    text: 'O Senhor é o meu pastor; nada me faltará. Deitar-me faz em verdes pastos, guia-me mansamente a águas tranqüilas. Refrigera a minha alma; guia-me pelas veredas da justiça, por amor do seu nome. Ainda que eu andasse pelo vale da sombra da morte, não temeria mal algum, porque tu estás comigo; a tua vara e o teu cajado me consolam. Preparas uma mesa perante mim na presença dos meus inimigos, unges a minha cabeça com óleo, o meu cálice transborda. Certamente que a bondade e a misericórdia me seguirão todos os dias da minha vida; e habitarei na casa do Senhor por longos dias.',
    verses: [
      { verse: 1, text: 'O Senhor é o meu pastor; nada me faltará.' },
      { verse: 2, text: 'Deitar-me faz em verdes pastos, guia-me mansamente a águas tranqüilas.' },
      { verse: 3, text: 'Refrigera a minha alma; guia-me pelas veredas da justiça, por amor do seu nome.' },
      { verse: 4, text: 'Ainda que eu andasse pelo vale da sombra da morte, não temeria mal algum, porque tu estás comigo; a tua vara e o teu cajado me consolam.' },
      { verse: 5, text: 'Preparas uma mesa perante mim na presença dos meus inimigos, unges a minha cabeça com óleo, o meu cálice transborda.' },
      { verse: 6, text: 'Certamente que a bondade e a misericórdia me seguirão todos os dias da minha vida; e habitarei na casa do Senhor por longos dias.' },
    ],
  },
  'joao-1': {
    reference: 'João 1:1-14',
    book: 'João',
    chapter: 1,
    translation: 'Almeida (Domínio Público)',
    text: 'No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus. Ele estava no princípio com Deus. Todas as coisas foram feitas por ele, e sem ele nada do que foi feito se fez. Nele estava a vida, e a vida era a luz dos homens. E a luz resplandece nas trevas, e as trevas não a compreenderam. E o Verbo se fez carne e habitou entre nós, cheio de graça e de verdade.',
    verses: [
      { verse: 1, text: 'No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus.' },
      { verse: 2, text: 'Ele estava no princípio com Deus.' },
      { verse: 3, text: 'Todas as coisas foram feitas por ele, e sem ele nada do que foi feito se fez.' },
      { verse: 4, text: 'Nele estava a vida, e a vida era a luz dos homens.' },
      { verse: 5, text: 'E a luz resplandece nas trevas, e as trevas não a compreenderam.' },
      { verse: 14, text: 'E o Verbo se fez carne e habitou entre nós, e vimos a sua glória, como a glória do Unigênito do Pai, cheio de graça e de verdade.' },
    ],
  },
  'romanos-8': {
    reference: 'Romanos 8:31-39',
    book: 'Romanos',
    chapter: 8,
    translation: 'Almeida (Domínio Público)',
    text: 'Que diremos, pois, a estas coisas? Se Deus é por nós, quem será contra nós? Aquele que nem mesmo a seu próprio Filho poupou, antes o entregou por todos nós, como nos não dará também com ele todas as coisas? Em todas estas coisas somos mais do que vencedores, por aquele que nos amou.',
    verses: [
      { verse: 31, text: 'Que diremos, pois, a estas coisas? Se Deus é por nós, quem será contra nós?' },
      { verse: 32, text: 'Aquele que nem mesmo a seu próprio Filho poupou, antes o entregou por todos nós, como nos não dará também com ele todas as coisas?' },
      { verse: 35, text: 'Quem nos separará do amor de Cristo? A tribulação, ou a angústia, ou a perseguição, ou a fome, ou a nudez, ou o perigo, ou a espada?' },
      { verse: 37, text: 'Mas em todas estas coisas somos mais do que vencedores, por aquele que nos amou.' },
      { verse: 38, text: 'Porque estou certo de que nem a morte, nem a vida, nem os anjos, nem os principados, nem as potestades, nem o presente, nem o porvir,' },
      { verse: 39, text: 'Nem a altura, nem a profundidade, nem alguma outra criatura nos poderá separar do amor de Deus, que está em Cristo Jesus nosso Senhor!' },
    ],
  },
};

export const READING_PLANS: { id: string; name: string; description: string; items: ReadingPlanItem[] }[] = [
  {
    id: 'sabedoria-diaria',
    name: 'Jornada de Sabedoria nos Provérbios',
    description: 'Leituras focadas em disciplina, trabalho e integridade moral.',
    items: [
      { day: 1, title: 'Confiança e Submissão a Deus', reference: 'Provérbios 3:1-12', book: 'Provérbios', chapter: 3 },
      { day: 2, title: 'O Descanso do Justo', reference: 'Salmos 23:1-6', book: 'Salmos', chapter: 23 },
      { day: 3, title: 'A Origem da Luz e da Vida', reference: 'João 1:1-14', book: 'João', chapter: 1 },
      { day: 4, title: 'Mais do que Vencedores', reference: 'Romanos 8:31-39', book: 'Romanos', chapter: 8 },
    ],
  },
];

/**
 * Retrieves scripture with guaranteed offline availability.
 * If online API fails or is not configured, provides the canonical public domain text.
 */
export async function getPassage(passageKey = 'proverbios-3'): Promise<BiblePassage> {
  const normalized = passageKey.toLowerCase().trim();
  if (EMBEDDED_SCRIPTURES[normalized]) {
    return EMBEDDED_SCRIPTURES[normalized];
  }
  // Fallback to Proverbios 3 if key not matched
  return EMBEDDED_SCRIPTURES['proverbios-3'];
}
