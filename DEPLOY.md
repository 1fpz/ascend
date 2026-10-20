# 🚀 Guia de Deploy — Project Ascend

> Guia passo a passo pra colocar o app no ar **gratuitamente** (GitHub + Vercel + Supabase),
> com **contas reais de usuário** e **cada um com os dados dele isolados no banco**.
> Estimativa total: **30–40 minutos**. Custo: **R$ 0**.

---

## 📋 O que você vai fazer (resumo)

1. **GitHub** — subir o código pra um repositório.
2. **Vercel** — hospedar o site de graça (detecta o Next.js sozinho).
3. **Supabase** — criar o banco **grátis** com autenticação + tabela por usuário (RLS).
4. **Ligar** — pôr as 2 variáveis de ambiente na Vercel.
5. **Testar** — criar 2 contas e confirmar que os dados não se misturam.

### 💰 Custo real: R$ 0

| Serviço | Plano | O que você ganha |
|---------|-------|------------------|
| **Supabase** | Free | 500 MB de banco, **50.000 usuários ativos/mês**, auth e API inclusos |
| **Vercel** | Hobby | Deploy ilimitado (uso não-comercial) |
| **GitHub** | Free | Repositório ilimitado |

> **Nota Vercel:** o plano Hobby é para uso **não-comercial**. Se um dia você cobrar dos
> usuários, aí seria preciso migrar pro Pro (pago). Enquanto for gratuito, tá tudo certo.

> **Importante:** o app tem **modo local de fallback**. Se o Supabase não estiver configurado,
> ele funciona normalmente (um usuário por navegador, dados só no `localStorage`) e mostra um
> aviso amarelo. Ou seja: **nunca quebra** — mas pra múltiplos usuários de verdade, configure
> o Supabase (Parte 3).

---

## Pré-requisitos

- [Git](https://git-scm.com/downloads) instalado
- Conta no [GitHub](https://github.com) (grátis)
- Conta na [Vercel](https://vercel.com) (grátis — use "Continue with GitHub")
- Conta no [Supabase](https://supabase.com) (grátis — entre com GitHub)
- Node.js 18+ instalado (rode `node -v` pra conferir)

---

## Parte 1 — Subir pro GitHub

Na pasta do projeto, rode:

```bash
# 1. Crie um repositório vazio no GitHub (pelo site: github.com/new)
#    Nome sugerido: project-ascend  ·  deixe PUBLIC ou PRIVATE (tanto faz)

# 2. Conecte e envie o código
git remote add origin https://github.com/SEU_USUARIO/project-ascend.git
git branch -M main
git push -u origin main
```

Troque `SEU_USUARIO` pelo seu usuário. ✅

---

## Parte 2 — Publicar na Vercel

1. Acesse [vercel.com/new](https://vercel.com/new) e entre com sua conta GitHub.
2. Clique em **"Import"** no repositório `project-ascend`.
3. A Vercel detecta o Next.js **automaticamente** — não mude nada ainda.
4. Clique em **"Deploy"**.

Vai ficar no ar com um link tipo `project-ascend-xyz.vercel.app`, mas **ainda em modo local**
(falta o Supabase — é esperado, a próxima parte conserta).

---

## Parte 3 — Supabase (contas + banco por usuário)

### 3.1 Criar o projeto

1. Acesse [supabase.com](https://supabase.com) → **Start your project** → entre com GitHub.
2. **New Project**:
   - Nome: `project-ascend`
   - Database Password: **anote em local seguro**
   - Region: **South America (São Paulo)** — mais perto de você
3. Aguarde criar (~2 minutos).

### 3.2 Ativar a confirmação de e-mail (recomendado)

Em **Authentication** → **Providers** → **Email**, mantenha **"Confirm email" LIGADO** por
padrão (mais seguro: só quem tem acesso ao e-mail cria conta).

> 💡 **Dica:** pra testar sem burocracia, pode **desligar** "Confirm email" — aí o cadastro
> entra direto sem precisar clicar no link do e-mail. Depois de testar, ligue de volta.

### 3.3 Criar a tabela por usuário (com RLS)

Vá em **SQL Editor** → **New query** → cole **todo** este código → **Run**:

```sql
-- =====================================================================
-- Project Ascend — snapshot de estado por usuário
-- Cada usuário tem exatamente UMA linha, com o estado dele.
-- O RLS garante que cada um só enxerga a própria linha.
-- =====================================================================
create table if not exists public.profiles (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  state      jsonb not null,
  updated_at timestamptz not null default now()
);

-- Habilita Row Level Security
alter table public.profiles enable row level security;

-- Cada usuário só lê a própria linha
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = user_id);

-- Cada usuário só insere a própria linha
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = user_id);

-- Cada usuário só atualiza a própria linha
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Cada usuário só apaga a própria linha
create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = user_id);
```

> 🔐 **Isso é o coração da segurança.** O `auth.uid() = user_id` significa que **o banco
> em si bloqueia** um usuário de ler os dados de outro — mesmo que alguém tente manipular
> as requisições. Não depende do código do app, depende do PostgreSQL.

### 3.4 Pegar as credenciais

Em **Project Settings** (engrenagem, canto inferior esquerdo) → **API**. Copie:

- **Project URL** — `https://abcdefgh.supabase.co`
- **anon public key** — chave longa começando com `eyJ...`

### 3.5 Ligar na Vercel

Na Vercel, no projeto `project-ascend`:

1. **Settings** → **Environment Variables**
2. Adicione as **duas** variáveis:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | *(a Project URL)* |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(a anon public key)* |

3. **Save** → depois **Deployments** → **⋯** → **Redeploy**.

> O prefixo `NEXT_PUBLIC_` é obrigatório — sem ele o navegador não enxerga a variável.

---

## Parte 4 — Testar que funciona redondo

### 4.1 Teste de login e sync

1. Abra o site → clique em **Entrar** (ou acesse `/auth/login`).
2. O aviso amarelo "Supabase não configurado" **não deve aparecer** mais. ✅
3. Vá em **Configurações** → o card deve mostrar **"Conta & Sincronização"** com seu e-mail.
4. Faça alguma ação (completar uma tarefa, criar missão) → espere ~2s → o card deve mostrar
   a hora de **"Sincronizado"** atualizada. ✅

### 4.2 Teste de isolamento (o mais importante)

Este teste prova que **usuários não perdem nem misturam progresso**:

1. **Conta A:** crie uma conta `user-a@exemplo.com` → complete 2 tarefas → **Sair da Conta**.
2. **Conta B:** crie `user-b@exemplo.com` → ele deve ver o **estado inicial** (sem as tarefas
   da conta A). ✅
3. **Volte pra Conta A:** faça login de novo → as **2 tarefas completadas voltam** (vieram do
   banco). ✅
4. **Teste entre dispositivos:** faça login na mesma conta num celular/PC diferente → os dados
   aparecem. ✅

### 4.3 Conferir no banco

No Supabase, vá em **Table Editor** → `profiles`. Cada conta deve ter **uma linha**, com o
`state` (jsonb) dela.

---

## 🔧 Solução de problemas

| Problema | Causa provável | Solução |
|----------|----------------|---------|
| Aviso amarelo "Supabase não configurado" | Env vars não aplicadas | Confirme o nome exato (`NEXT_PUBLIC_...`) e **Redeploy** |
| Erro "relation profiles does not exist" | SQL não rodou | Rode o SQL do 3.3 de novo no SQL Editor |
| Erro "row-level security policy" | Policies ausentes | Confirme que as 4 policies do 3.3 foram criadas |
| Cadastro pede "verifique o e-mail" | Confirmação ligada | Confirme o e-mail, ou desligue em Auth → Providers → Email |
| Login retorna "Invalid login credentials" | Senha/e-mail errados | Confira a senha; não existe auto-fill de admin |
| Dados não sincronizam | Salvo antes do redeploy | Espere ~2s e recarregue; veja se o card mostra "Sincronizado" |
| Um usuário vê dados do outro | — | Isso **não deve acontecer** (RLS bloqueia). Se acontecer, rode o 3.3 de novo |
| Build falha na Vercel | — | Rode `npm run build` local pra ver o erro |

---

## 🧹 Manutenção / re-deploy

```bash
git add -A
git commit -m "descreva a mudança"
git push
```

A Vercel **detecta o push e faz deploy automático**.

---

## ✅ Checklist final

- [ ] Código no GitHub
- [ ] Projeto importado na Vercel
- [ ] Projeto Supabase criado (região São Paulo)
- [ ] Confirmação de e-mail decidida (3.2)
- [ ] Tabela `profiles` + **4 policies RLS** criadas (3.3)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` na Vercel
- [ ] Redeploy feito após salvar as env vars
- [ ] Login funciona sem aviso amarelo
- [ ] **Teste de isolamento com 2 contas passou** (4.2) ← o mais importante
- [ ] Dados persistem entre dispositivos

Qualquer dúvida no meio do caminho, me chame que eu destravo. 🚀
