# Project Ascend

> **Sistema Operacional de Evolução Pessoal Gamificada | MVP Robusto sem Inteligência Artificial**

Project Ascend é um SaaS moderno para planejamento de vida, missões hierárquicas, planner diário inteligente e gamificação inspirada em RPGs, desenvolvido sob rigor de engenharia de software e **100% determinístico** (zero modelos de linguagem ou dependências de IA).

---

## 🛠️ Stack Tecnológica

- **Framework**: Next.js 15 (App Router com Server & Client Components)
- **Linguagem**: TypeScript em modo estrito (`strict: true`)
- **Estilização**: Tailwind CSS v4 com paleta Dark Obsidian profissional
- **Ícones**: Lucide React
- **Banco de Dados**: PostgreSQL no Supabase com Row Level Security (RLS) completo
- **Visualização de Dados**: Recharts
- **Suíte de Testes**: Vitest (21 testes unitários determinísticos passando)
- **PWA**: Web App Manifest (`/manifest.json`) com suporte a instalação mobile e desktop

---

## 🚀 Como Executar Localmente

### 1. Clonar ou Acessar o Diretório
```bash
cd "C:\Users\USER\.gemini\antigravity\scratch\project-ascend"
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
Copie o arquivo `.env.example` para `.env.local`:
```bash
cp .env.example .env.local
```
*(Nota: O aplicativo funciona 100% offline out-of-the-box mesmo sem chaves do Supabase preenchidas, utilizando sua camada de persistência local e dados semente de demonstração).*

### 4. Executar os Testes Automatizados
```bash
npm test
```

### 5. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse `http://localhost:3000` no seu navegador.

---

## 📐 Estrutura do Projeto

```
project-ascend/
├── docs/
│   ├── architecture.md             # Especificação arquitetural dos motores determinísticos
│   └── database-schema.md          # Documentação do schema PostgreSQL e RLS
├── supabase/
│   └── migrations/
│       └── 20261020000001_project_ascend_schema.sql # Schema SQL com RLS e índices
├── src/
│   ├── app/                        # Next.js App Router (17 rotas estáticas e dinâmicas)
│   │   ├── (app)/                  # Rotas internas autenticadas com Sidebar e Header
│   │   │   ├── dashboard/          # Command Center
│   │   │   ├── missions/           # Gestão de Missões e Detalhes
│   │   │   │   └── tree/           # Mission Tree visual navegável
│   │   │   ├── planner/            # Planner diário com controle de carga de tempo
│   │   │   ├── habits/             # Hábitos e rituais com cálculo de streaks
│   │   │   ├── library/            # Biblioteca de trilhas com clonagem independente
│   │   │   ├── smart-task/[id]/    # Smart Task Engine (Bíblia, Treino, Pomodoro, etc.)
│   │   │   ├── character/          # Perfil RPG e Livro-Razão de Auditoria de XP
│   │   │   ├── achievements/       # Conquistas desbloqueadas determinísticamente
│   │   │   ├── analytics/          # Life Analytics com Recharts
│   │   │   └── settings/           # Configurações, Timezone e Exportação LGPD (.json)
│   │   ├── auth/                   # Telas de Login e Cadastro
│   │   └── page.tsx                # Landing Page de apresentação
│   ├── components/
│   │   ├── layout/                 # Sidebar, Header, MobileNav
│   │   └── ui/                     # Button, Card, Badge, Progress, LevelProgressBar
│   └── lib/
│       ├── bible/                  # Módulo bíblico canônico offline (Almeida)
│       ├── catalog/                # Trilhas prontas da biblioteca
│       ├── domain/                 # Motores puros de progresso, gamificação e planner
│       │   └── __tests__/          # Testes unitários com Vitest
│       ├── store/                  # Repositório unificado de estado e persistência
│       └── utils.ts
└── PROJECT_STATUS.md               # Relatório contínuo de status e testes
```

---

## 🔒 Princípios de Segurança e Integridade

1. **Zero IA**: Todos os cálculos, recomendações de ordem e concessões de pontos são 100% explicáveis por fórmulas matemáticas e regras de negócio.
2. **Idempotência de XP**: O livro-razão (`xp_ledger`) garante que uma mesma ação nunca conceda pontos repetidos. Na reabertura de uma tarefa, o XP é automaticamente estornado.
3. **Prevenção de Ciclos**: O grafo de dependências rejeita dependências circulares através de busca em profundidade (DFS).
4. **Row Level Security**: Isolamento de 100% das tabelas privadas no PostgreSQL.
