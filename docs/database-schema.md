# Especificação do Banco de Dados — Project Ascend

## 1. Arquitetura do Banco de Dados
O Project Ascend adota PostgreSQL no Supabase com isolamento rigoroso por **Row Level Security (RLS)** em todas as tabelas contendo dados do usuário. O modelo prioriza integridade referencial, constraints explícitas e prevenção de duplicidade através de chaves únicas e identificadores idempotentes.

## 2. Princípios de Segurança e Integridade
- **Sem privilégios concedidos ao client-side**: Todos os updates de XP passam por regras de negócio validadas no servidor.
- **Idempotência**: A tabela `xp_ledger` possui constraint `UNIQUE (idempotency_key)` impedindo que a repetição de requisições conceda XP duplicado.
- **Prevenção de Ciclos**: As tabelas `task_dependencies` e `submission_dependencies` contam com constraints `CHECK (id <> depends_on_id)` e validação determinística de ordenação topológica (DFS com detecção de ciclo) no domínio.
- **RLS em 100% das tabelas privadas**: Cada registro pertence a `auth.uid() = user_id`.

## 3. Entidades Centrais
- `profiles`: Metadados do usuário e fuso horário para interpretação correta de datas de calendário.
- `character_profiles`: Registro de atributos do RPG (`discipline`, `knowledge`, `health`, `execution`, `consistency`) e nível.
- `life_areas`: Categorização das missões (Carreira, Negócios, Saúde, etc.).
- `missions`: Missões primárias de alto nível com prazo, critério de sucesso e progresso calculado.
- `submissions`: Fases ou etapas intermediárias filhas de uma missão.
- `tasks`: Ações concretas gerenciadas pelo Smart Task Engine.
- `habits` & `habit_logs`: Definição de rotinas e registros de ocorrências independentes.
- `xp_ledger`: Livro-razão de auditoria de cada ponto de XP ganho ou estornado.
- `achievements` & `user_achievements`: Conquistas desbloqueadas determinísticamente.
- `mission_templates`: Catálogo versionado e pré-definido para clonagem independente.
