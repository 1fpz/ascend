# 🚀 Guia de Deploy — Project Ascend

> Guia passo a passo pra colocar o app no ar **gratuitamente** (GitHub + Vercel + Supabase).
> Estimativa total: **20–30 minutos**. Custo: **R$ 0**.

---

## 📋 O que você vai fazer (resumo)

1. **GitHub** — subir o código pra um repositório.
2. **Vercel** — hospedar o site de graça (detecta o Next.js sozinho).
3. **Supabase** — criar o banco de backup e ligar no app.
4. **Testar** — confirmar que backup/restauração funcionam.

> **O app funciona 100% sem o Supabase.** Todo o estado fica no `localStorage` do navegador
> (offline-first). O Supabase é **camada opcional de backup** — só pra você não perder os dados
> se limpar o navegador ou trocar de dispositivo. Se quiser pular o passo 3, o app roda normal.

---

## Pré-requisitos

- [Git](https://git-scm.com/downloads) instalado
- Conta no [GitHub](https://github.com) (grátis)
- Conta na [Vercel](https://vercel.com) (grátis — use "Continue with GitHub")
- Node.js 18+ instalado (provavelmente já tem, rode `node -v` pra conferir)

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

Troque `SEU_USUARIO` pelo seu usuário. Pronto — código no GitHub. ✅

---

## Parte 2 — Publicar na Vercel

1. Acesse [vercel.com/new](https://vercel.com/new) e entre com sua conta GitHub.
2. Clique em **"Import"** no repositório `project-ascend`.
3. A Vercel detecta o Next.js **automaticamente** — não mude nada nas configurações.
4. Clique em **"Deploy"**.

Espere ~1 minuto. Vai aparecer um link tipo `project-ascend-xyz.vercel.app` — **seu site no ar!** 🎉

> Opcional mas recomendado: em **Settings → Domains**, você pode plugar um domínio próprio
> (ex: ascend.seudominio.com) — mas pra começar, o link `.vercel.app` já basta.

---

## Parte 3 — Supabase (backup na nuvem)

Isso é o que faz seus dados **sobreviverem** fora do navegador.

### 3.1 Criar o projeto

1. Acesse [supabase.com](https://supabase.com) → **Start your project** → entre com GitHub.
2. **New Project**:
   - Nome: `project-ascend` (ou o que quiser)
   - Database Password: **anote em local seguro** (não é usado pelo app, mas não esqueça)
   - Region: **South America (São Paulo)** — mais perto de você
3. Aguarde criar (~2 minutos).

### 3.2 Criar a tabela de backup

No painel do Supabase, vá em **SQL Editor** → **New query** → cole o código abaixo → **Run**:

```sql
-- Tabela de backup do Project Ascend
create table if not exists public.backups (
  id         text primary key,
  payload    jsonb not null,
  updated_at timestamptz not null default now()
);

-- Habilita RLS (Row Level Security)
alter table public.backups enable row level security;

-- Política que permite acesso via anon key (app pessoal, sem login)
-- A proteção vem do seu "código de sincronização" — quem não tem o código, não restaura.
create policy "allow_anon_full_access"
  on public.backups
  for all
  using (true)
  with check (true);
```

> ⚠️ **Nota de segurança (leia):** essa política deixa a tabela acessível pra **qualquer um que
> tenha a URL + anon key**. Como é uma ferramenta **pessoal** e a restauração exige seu **código
> de sincronização** (uma frase que só você sabe), o risco aceitável pra uso próprio. Se um dia
> for multi-usuário, aí sim mude pra autenticação real (RLS por usuário).

### 3.3 Pegar as credenciais

No painel: **Project Settings** (engrenagem, canto inferior esquerdo) → **API**. Copie:

- **Project URL** — algo como `https://abcdefgh.supabase.co`
- **anon public key** — uma chave longa começando com `eyJ...`

### 3.4 Ligar no app (Vercel)

Volte à Vercel, no projeto `project-ascend`:

1. **Settings** → **Environment Variables**
2. Adicione **duas** variáveis:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | *(a Project URL que copiou)* |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(a anon public key)* |

3. Clique **Save** e depois vá em **Deployments** → **⋯** → **Redeploy** (pra aplicar as env vars).

> **Importante:** o prefixo `NEXT_PUBLIC_` é obrigatório — sem ele o app não enxerga a variável
> no navegador.

---

## Parte 4 — Testar que tá redondo

1. Abra seu site (link `.vercel.app`).
2. Entre em **Configurações** (no menu lateral).
3. Role até o card **"Backup na Nuvem (Supabase)"**. Se apareceu sem o aviso amarelo,
   o Supabase tá ligado. ✅
4. Digite um **código de sincronização** (ex: `minha-frase-secreta-2026`) → **Enviar Backup**.
5. Pra testar restauração: aperte **F12** → **Application** → **Local Storage** → apague a chave
   `project_ascend_store_v1` → recarregue (o app volta ao estado inicial) → volte em
   **Configurações**, digite o mesmo código → **Restaurar**. Seus dados voltam. ✅

---

## 🔧 Solução de problemas

| Problema | Causa provável | Solução |
|----------|----------------|---------|
| Card mostra aviso amarelo "não configurado" | Env vars não aplicadas | Confirme o nome exato (`NEXT_PUBLIC_...`) e **Redeploy** |
| Erro ao enviar backup | Tabela não criada ou política errada | Rode o SQL do 3.2 de novo no SQL Editor |
| "Nenhum backup encontrado" | Código de sync diferente | Use exatamente o mesmo código do envio |
| Build falha na Vercel | — | Rode `npm run build` local pra ver o erro; geralmente é tipo/erro de lint |

---

## 🧹 Manutenção / re-deploy

Toda vez que você mudar código:

```bash
git add -A
git commit -m "descreva a mudança"
git push
```

A Vercel **detecta o push e faz deploy automático**. Não precisa fazer nada na plataforma.

---

## ✅ Checklist final

- [ ] Código no GitHub
- [ ] Projeto importado e publicado na Vercel
- [ ] Projeto Supabase criado (região São Paulo)
- [ ] Tabela `backups` criada via SQL Editor
- [ ] `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` na Vercel
- [ ] Redeploy feito após salvar as env vars
- [ ] Teste de backup + restauração passou

Qualquer dúvida no meio do caminho, me chame que eu destravo. 🚀
