export interface TemplateTask {
  title: string;
  description: string;
  taskType:
    | 'simple'
    | 'reading'
    | 'bible_reading'
    | 'study'
    | 'habit'
    | 'workout'
    | 'meditation'
    | 'numeric_goal'
    | 'timed'
    | 'checklist';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  difficulty: 'easy' | 'medium' | 'hard' | 'epic';
  estimatedMinutes: number;
}

export interface TemplateSubmission {
  title: string;
  description: string;
  tasks: TemplateTask[];
}

export interface MissionTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'epic';
  estimatedDurationDays: number;
  icon: string;
  submissions: TemplateSubmission[];
}

export const PRESET_MISSION_TEMPLATES: MissionTemplate[] = [
  {
    id: 'tpl-saas-launch',
    title: 'Lançamento de Produto Digital (SaaS)',
    category: 'Negócios & Empreendedorismo',
    description:
      'Da validação de proposta de valor ao primeiro grupo de clientes pagantes sem desperdício.',
    difficulty: 'hard',
    estimatedDurationDays: 60,
    icon: 'Rocket',
    submissions: [
      {
        title: 'Fase 1: Validação do Problema e Proposta',
        description: 'Entrevistas de cliente e teste de demanda real.',
        tasks: [
          {
            title: 'Entrevistar 10 potenciais clientes',
            description: 'Mapear as maiores dores e objeções.',
            taskType: 'numeric_goal',
            priority: 'urgent',
            difficulty: 'medium',
            estimatedMinutes: 60,
          },
          {
            title: 'Redigir proposta de valor e manifesto de produto',
            description: 'Definir o núcleo do que o produto resolve e o que não resolve.',
            taskType: 'simple',
            priority: 'high',
            difficulty: 'medium',
            estimatedMinutes: 45,
          },
        ],
      },
      {
        title: 'Fase 2: Arquitetura e MVP Focado',
        description: 'Construir o fluxo crítico funcional.',
        tasks: [
          {
            title: 'Modelar banco de dados relacional e RLS',
            description: 'Garantir integridade e regras de negócio no banco.',
            taskType: 'study',
            priority: 'high',
            difficulty: 'hard',
            estimatedMinutes: 90,
          },
          {
            title: 'Implementar fluxo de onboarding e ativação',
            description: 'Reduzir atrito nos primeiros 5 minutos de uso.',
            taskType: 'simple',
            priority: 'high',
            difficulty: 'hard',
            estimatedMinutes: 120,
          },
        ],
      },
      {
        title: 'Fase 3: Lançamento e Primeiros Usuários',
        description: 'Distribuição direta e coleta de feedback.',
        tasks: [
          {
            title: 'Publicar landing page de conversão',
            description: 'Copywriting focado no problema resolvido.',
            taskType: 'checklist',
            priority: 'urgent',
            difficulty: 'medium',
            estimatedMinutes: 60,
          },
        ],
      },
    ],
  },
  {
    id: 'tpl-fullstack-mastery',
    title: 'Domínio de Arquitetura Full-Stack & TypeScript',
    category: 'Conhecimento & Programação',
    description:
      'Aprofundamento em sistemas distribuídos, patterns de design e engenharia de software determinística.',
    difficulty: 'epic',
    estimatedDurationDays: 90,
    icon: 'Code',
    submissions: [
      {
        title: 'Módulo 1: Fundamentos Avançados de TypeScript & Tipagem Estrita',
        description: 'Generics avançados, inferência condicional e contratos de tipo.',
        tasks: [
          {
            title: 'Estudo: Variância de Tipos e Type Narrowing',
            description: 'Compreender covariância, contravariância e discriminação de união.',
            taskType: 'study',
            priority: 'high',
            difficulty: 'hard',
            estimatedMinutes: 60,
          },
          {
            title: 'Flashcards: Padrões de Tipagem no TypeScript 5',
            description: 'Revisão ativa de conceitos de tipagem.',
            taskType: 'study',
            priority: 'medium',
            difficulty: 'medium',
            estimatedMinutes: 30,
          },
        ],
      },
      {
        title: 'Módulo 2: Modelagem Relacional & Performance SQL',
        description: 'PostgreSQL profundo, indexação e concorrência.',
        tasks: [
          {
            title: 'Leitura: Designing Data-Intensive Applications (Cap. 3)',
            description: 'Motores de armazenamento e índices B-Tree.',
            taskType: 'reading',
            priority: 'high',
            difficulty: 'hard',
            estimatedMinutes: 45,
          },
        ],
      },
    ],
  },
  {
    id: 'tpl-devocional-sabedoria',
    title: 'Leitura Bíblica & Sabedoria Diária',
    category: 'Espiritualidade & Reflexão',
    description:
      'Imersão contínua nas escrituras, memorização de princípios de sabedoria e registro reflexivo.',
    difficulty: 'medium',
    estimatedDurationDays: 30,
    icon: 'BookOpen',
    submissions: [
      {
        title: 'Ciclo 1: Sabedoria dos Provérbios',
        description: 'Leitura reflexiva de Provérbios sobre diligência e autocontrole.',
        tasks: [
          {
            title: 'Leitura Bíblica: Provérbios 3 (Confiança e Sabedoria)',
            description: 'Ler o texto bíblico e redigir reflexão diária.',
            taskType: 'bible_reading',
            priority: 'high',
            difficulty: 'easy',
            estimatedMinutes: 20,
          },
          {
            title: 'Meditação Silenciosa & Oração',
            description: 'Período focado de introspecção e serenidade.',
            taskType: 'meditation',
            priority: 'medium',
            difficulty: 'easy',
            estimatedMinutes: 15,
          },
        ],
      },
      {
        title: 'Ciclo 2: Romanos e Evangelho de João',
        description: 'Fundamentos de fé, graça e verdade.',
        tasks: [
          {
            title: 'Leitura Bíblica: João 1 (O Verbo Eterno)',
            description: 'Estudo do prólogo joanino e oração.',
            taskType: 'bible_reading',
            priority: 'high',
            difficulty: 'medium',
            estimatedMinutes: 25,
          },
        ],
      },
    ],
  },
  {
    id: 'tpl-fitness-discipline',
    title: 'Condicionamento Físico & Força Funcional',
    category: 'Saúde & Físico',
    description: 'Protocolo consistente de musculação e condicionamento aeróbico.',
    difficulty: 'hard',
    estimatedDurationDays: 45,
    icon: 'Dumbbell',
    submissions: [
      {
        title: 'Rotina Semanal: Força & Hipertrofia',
        description: 'Treinos estruturados com controle de carga e repetições.',
        tasks: [
          {
            title: 'Treino A: Peitoral, Deltóides e Tríceps',
            description: 'Supino, elevação lateral e tríceps testa.',
            taskType: 'workout',
            priority: 'high',
            difficulty: 'medium',
            estimatedMinutes: 50,
          },
          {
            title: 'Treino B: Dorsais, Bíceps e Trapézio',
            description: 'Puxada alta, remada curvada e rosca direta.',
            taskType: 'workout',
            priority: 'high',
            difficulty: 'medium',
            estimatedMinutes: 50,
          },
          {
            title: 'Hidratação: 3.5 Litros de Água',
            description: 'Meta de ingestão diária de líquidos.',
            taskType: 'numeric_goal',
            priority: 'medium',
            difficulty: 'easy',
            estimatedMinutes: 5,
          },
        ],
      },
    ],
  },
];
