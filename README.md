# 🔭 monitora-me-backend

API REST do **MonitoraME**, plataforma de monitoramento de compras e licitações públicas do Ceará, desenvolvida ao longo do curso de **Desenvolvimento Fullstack (Node.js)** do Amontada Valley.

Este repositório é também **material didático**: cada camada do código existe para ilustrar um conceito visto em aula. Leia este README inteiro antes de mexer no projeto.

---

## 📑 Sumário

1. [Stack](#-stack)
2. [Pré-requisitos](#-pré-requisitos)
3. [Instalação passo a passo](#-instalação-passo-a-passo)
4. [Variáveis de ambiente](#-variáveis-de-ambiente)
5. [Scripts disponíveis](#-scripts-disponíveis)
6. [Estrutura de pastas](#-estrutura-de-pastas)
7. [Arquitetura em camadas](#-arquitetura-em-camadas)
8. [Endpoints](#-endpoints)
9. [Banco de dados e Prisma](#-banco-de-dados-e-prisma)
10. [Autenticação: até onde chegamos](#-autenticação-até-onde-chegamos)
11. [Fluxo de trabalho com Git](#-fluxo-de-trabalho-com-git)
12. [Padrão de commits](#-padrão-de-commits)
13. [Problemas comuns](#-problemas-comuns)
14. [Roadmap](#-roadmap)

---

## 🧰 Stack

| Tecnologia | Para que serve |
| --- | --- |
| [Node.js](https://nodejs.org) + [TypeScript 5](https://www.typescriptlang.org) | Linguagem e ambiente de execução |
| [Fastify 5](https://fastify.dev) | Framework HTTP |
| [@fastify/cors](https://github.com/fastify/fastify-cors) | Libera o front-end no CORS |
| [@fastify/swagger](https://github.com/fastify/fastify-swagger) + swagger-ui | Documentação interativa em `/docs` |
| [Prisma 6](https://www.prisma.io) | ORM, schema e migrations |
| [PostgreSQL (Supabase)](https://supabase.com) | Banco de dados |
| [bcrypt](https://github.com/kelektiv/node.bcrypt.js) | Hash de senhas |
| [tsx](https://tsx.is) | Executa TypeScript direto, com *watch* |
| [Bun](https://bun.sh) | Gerenciador de pacotes do projeto |

> ⚠️ O Prisma está **fixado na major 6** (6.19.x). Não atualize para a 7.x: ela muda o formato de configuração (`prisma.config.ts`) e quebra o que foi ensinado em aula.

---

## ✅ Pré-requisitos

- [Node.js](https://nodejs.org) 22 ou superior
- [Bun](https://bun.sh) (gerenciador de pacotes usado no projeto)
- [Git](https://git-scm.com)
- Acesso à string de conexão do Supabase do projeto (peça ao professor)

---

## 🚀 Instalação passo a passo

```bash
# 1. Clone o repositório
git clone https://github.com/iriscoxta/monitora-me-backend.git
cd monitora-me-backend

# 2. Instale as dependências
bun install

# 3. Crie o seu .env a partir do exemplo
cp .env.example .env
# (edite o .env e preencha DATABASE_URL e DIRECT_URL)

# 4. Gere o Prisma Client
bunx prisma generate

# 5. Suba o servidor em modo desenvolvimento
bun run dev
```

Se tudo deu certo, você verá `Servidor rodando em http://...:3333`.

- API: <http://localhost:3333>
- Documentação (Swagger): <http://localhost:3333/docs>

> 🔑 **O passo 4 é obrigatório depois de todo `clone`.** O Prisma Client é gerado em `src/generated/prisma`, pasta que está no `.gitignore` e, por isso, **não vem com o repositório**. Sem ele, o servidor nem inicia (`did not initialize yet`). Rode também `bunx prisma generate` sempre que alterar o `schema.prisma`.

---

## 🔐 Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `PORT` | Não (padrão `3333`) | Porta em que a API escuta |
| `FRONTEND_URL` | Não (padrão `http://localhost:3000`) | Origem liberada no CORS. Use a URL exata do front, nunca `*` |
| `DATABASE_URL` | **Sim** | Conexão do Prisma com o banco (pooler do Supabase, porta `6543`, com `?pgbouncer=true`) |
| `DIRECT_URL` | **Sim** | Conexão direta, usada pelas migrations (porta `5432`) |

As duas strings de conexão ficam em **Supabase → Project Settings → Database → Connection string**.

> 🚫 **Nunca** faça commit do `.env`. Ele já está no `.gitignore`. Quem mantém o modelo versionado é o `.env.example`, sem valores reais: sempre que criar uma variável nova no `.env`, registre o nome dela no `.env.example`.

---

## 📜 Scripts disponíveis

| Comando | O que faz |
| --- | --- |
| `bun run dev` | Sobe o servidor com recarga automática (`tsx watch --env-file=.env src/server.ts`) |
| `bunx prisma generate` | Gera o Prisma Client em `src/generated/prisma` |
| `bunx prisma migrate dev --name <nome>` | Cria e aplica uma migration em desenvolvimento |
| `bunx prisma migrate status` | Mostra se o banco está em dia com as migrations |
| `bunx prisma db pull` | Atualiza o `schema.prisma` a partir do banco real |
| `bunx prisma studio` | Abre uma interface visual do banco |
| `bunx tsc --noEmit` | Verifica erros de tipo sem gerar arquivos |

---

## 🗂️ Estrutura de pastas

```
monitora-me-backend/
├── prisma/
│   ├── schema.prisma          # Models e configuração do Prisma
│   └── migrations/            # Histórico de migrations (versionado no Git)
├── src/
│   ├── generated/prisma/      # Prisma Client gerado (NÃO versionado)
│   ├── lib/
│   │   └── prisma.ts          # Única instância do PrismaClient
│   ├── repositories/          # Acesso ao banco
│   │   ├── suppliers-repository.ts
│   │   └── users-repository.ts
│   ├── services/              # Regras de negócio
│   │   └── suppliers-service.ts
│   ├── routes/                # Rotas HTTP e schemas do Swagger
│   │   └── suppliers-routes.ts
│   └── server.ts              # Ponto de entrada: plugins e registro das rotas
├── .env                       # Seus segredos (NÃO versionado)
├── .env.example               # Modelo das variáveis
├── bun.lock
├── package.json
└── tsconfig.json
```

---

## 🏛️ Arquitetura em camadas

Cada requisição atravessa três camadas, e **cada uma só conversa com a camada logo abaixo**:

```
Requisição HTTP
      │
      ▼
┌─────────────┐   valida a entrada (schema), traduz erros em status HTTP
│   Routes    │   (200, 201, 204, 400, 404)
└──────┬──────┘
       ▼
┌─────────────┐   aplica regras de negócio e lança erros de domínio
│  Services   │   ex.: "Fornecedor não encontrado"
└──────┬──────┘
       ▼
┌─────────────┐   é o único lugar que fala com o banco via Prisma
│ Repositories│
└──────┬──────┘
       ▼
   PostgreSQL
```

Regras que valem para todo o código novo:

- **Routes** nunca chamam o Prisma. **Repositories** nunca conhecem HTTP (`request`, `reply`).
- **Services** lançam `Error("mensagem de domínio")`; a rota decide se vira 400 ou 404.
- Todo repository importa o Prisma de `src/lib/prisma.ts`. **Nunca** crie um `new PrismaClient()` em outro arquivo: isso abre conexões demais no banco.
- Rotas são funções `async function xRoutes(app: FastifyInstance)` registradas com `app.register(...)` no `server.ts`. Use `import type` para tipos.
- Toda rota precisa de um objeto `schema` (`tags`, `params`, `body`, `response`), para aparecer corretamente no `/docs`.
- Nomes de arquivos em `kebab-case` (`suppliers-routes.ts`); nomes de domínio em inglês, mensagens ao usuário em português.

### Ordem de registro no `server.ts`

A ordem importa. Mantenha:

1. `cors`
2. `swagger`
3. `swaggerUi`
4. as rotas

---

## 🌐 Endpoints

Recurso implementado até agora: **fornecedores** (`suppliers`).

| Método | Rota | Descrição | Sucesso | Erros |
| --- | --- | --- | --- | --- |
| `GET` | `/suppliers` | Lista todos os fornecedores | `200` | |
| `GET` | `/suppliers/:id` | Busca um fornecedor pelo id | `200` | `404` |
| `POST` | `/suppliers` | Cria um fornecedor | `201` | `400` |
| `PATCH` | `/suppliers/:id` | Atualização **parcial** (envie só os campos que mudam) | `200` | `404` |
| `DELETE` | `/suppliers/:id` | Remove um fornecedor | `204` (sem corpo) | `404` |

Exemplo de corpo para `POST /suppliers`:

```json
{
  "name": "Construtora Exemplo LTDA",
  "cnpj": "12345678000190",
  "porte": "ME"
}
```

Formato dos erros:

```json
{
  "message": "Fornecedor não encontrado"
}
```

Teste tudo pelo Swagger em **<http://localhost:3333/docs>**.

---

## 🗃️ Banco de dados e Prisma

### Models atuais (`prisma/schema.prisma`)

| Model | Tabela | Observação |
| --- | --- | --- |
| `Supplier` | `Supplier` | Fornecedor. `cnpj` é único |
| `Bidding` | `Bidding` | Licitação de um fornecedor (relação N:1 com `Supplier`) |
| `Orgao` | `orgaos` | Órgão público. Model ilustrativo, usado para mostrar `@map` e relações |
| `Licitacao` | `licitacoes` | Licitação (PNCP) de um órgão. Model ilustrativo, sem rotas ainda |
| `User` | `User` | Usuário do sistema (`email` único, `passwordHash`, `role`) |

A turma de Dados usa um banco próprio e só expõe os dados ao Fullstack por uma rota FastAPI; este banco é exclusivo do Fullstack. Os models `Orgao` e `Licitacao` usam `@map` e `@@map` para manter **camelCase no TypeScript** enquanto o banco usa **snake_case**:

```prisma
model Orgao {
  id          String      @id @default(uuid())
  cnpj        String      @unique
  razaoSocial String      @map("razao_social")
  licitacoes  Licitacao[]

  @@map("orgaos")
}
```

### Por que `DATABASE_URL` e `DIRECT_URL`?

O Supabase expõe o banco por um *pooler* (porta `6543`), ótimo para a aplicação em execução, mas que não serve para migrations. Por isso o `datasource` declara as duas:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### Fluxo para alterar o banco

1. Edite o `prisma/schema.prisma`.
2. Rode `bunx prisma migrate dev --name descricao_da_mudanca`.
3. Confira o SQL gerado em `prisma/migrations/`.
4. Faça commit do schema **e** da pasta de migration juntos.

> ⚠️ Se o Prisma avisar que vai **apagar dados** ou **recriar tabelas**, pare e chame o professor. Em caso de dúvida, use `bunx prisma migrate status` e `bunx prisma db pull` para entender o estado do banco antes de forçar uma migration.

---

## 🔒 Autenticação: até onde chegamos

O projeto está na **Aula 14**. Já existe:

- Model `User` com `passwordHash` (a senha em texto puro **nunca** é gravada).
- `src/repositories/users-repository.ts` com:
  - `create({ email, password, role })`: gera o hash com `bcrypt.hash(senha, 10)` e grava.
  - `findByEmail(email)`: busca o usuário pelo e-mail.

**Ainda não existe** (e não deve ser adicionado antes da aula correspondente):

| Recurso | Aula |
| --- | --- |
| Rota de login e JWT (`@fastify/jwt`) | 15 |
| Proteção de rotas com `preHandler` e controle de perfis (`requireRole`, RBAC) | 16 |

> 🛡️ **Segurança:** nunca use `console.log` com senha, hash ou token, nem deixe arquivos de teste soltos em `src/`.

---

## 🌿 Fluxo de trabalho com Git

O projeto segue o **GitFlow**:

| Branch | Uso |
| --- | --- |
| `main` | Código estável, pronto para entrega |
| `develop` | Integração das features |
| `feature/*` | Uma branch por funcionalidade (`feature/suppliers-crud`) |
| `release/*` | Preparação de uma versão |
| `hotfix/*` | Correção urgente sobre a `main` |

Fluxo do dia a dia:

```bash
git checkout develop
git pull
git checkout -b feature/nome-da-funcionalidade

# ... trabalhe, faça commits ...

git push -u origin feature/nome-da-funcionalidade
# abra um Pull Request para a develop no GitHub
```

---

## 💬 Padrão de commits

Usamos **commits semânticos com emojis**, conforme o guia [iuricode/padroes-de-commits](https://github.com/iuricode/padroes-de-commits).

Formato:

```
:emoji: tipo: descrição curta no imperativo
```

| Emoji | Código | Tipo | Quando usar |
| --- | --- | --- | --- |
| ✨ | `:sparkles:` | `feat` | Nova funcionalidade |
| 🐛 | `:bug:` | `fix` | Correção de bug |
| 📚 | `:books:` | `docs` | Documentação |
| ✅ | `:white_check_mark:` | `test` | Testes |
| 📦 | `:package:` | `build` | Build e dependências |
| ♻️ | `:recycle:` | `refactor` | Refatoração sem mudar comportamento |
| 🔧 | `:wrench:` | `chore` | Configurações e tarefas de manutenção |
| 🧹 | `:broom:` | `cleanup` | Limpeza de código |
| 🔥 | `:fire:` | `remove` | Remoção de arquivos ou código |
| 🎉 | `:tada:` | | Commit inicial |

Exemplos:

```bash
git commit -m ":sparkles: feat: adiciona rota PATCH de fornecedores"
git commit -m ":bug: fix: corrige status 404 ao deletar fornecedor inexistente"
git commit -m ":books: docs: atualiza o README"
```

Um commit por assunto: não misture correção de bug com documentação no mesmo commit.

---

## 🩺 Problemas comuns

| Sintoma | Causa provável | Solução |
| --- | --- | --- |
| `@prisma/client did not initialize yet` | Prisma Client não foi gerado | `bunx prisma generate` |
| `Cannot find module '../generated/prisma/client'` | Mesmo caso acima | `bunx prisma generate` |
| `500` com `Error querying the database` | `DATABASE_URL` incorreta ou projeto do Supabase pausado | Confira no painel se o projeto está ativo (veja a linha abaixo) |
| `FATAL: (ENOTFOUND) tenant/user ... not found` | **Projeto pausado**: o plano Free pausa após cerca de 1 semana sem uso | No painel do Supabase, clique em **Resume project** e espere o status ficar *Healthy* (até 5 min) |
| Erro de CORS no navegador | `FRONTEND_URL` diferente da origem do front | Ajuste no `.env` e reinicie o servidor |
| `EADDRINUSE` | Porta `3333` já está em uso | Feche o outro processo ou mude o `PORT` no `.env` |
| Variável nova não é lida | O `.env` só é carregado ao iniciar | Reinicie o `bun run dev` |

---

## 🗺️ Roadmap

- [x] Setup com Fastify e TypeScript
- [x] Camadas Routes, Services e Repositories
- [x] CORS e variáveis de ambiente
- [x] Prisma, schema e migrations
- [x] Sincronização com o schema da turma de Dados
- [x] CRUD completo de fornecedores
- [x] Documentação com Swagger
- [x] Hash de senhas com bcrypt (Aula 14)
- [ ] Login e JWT (Aula 15)
- [ ] Controle de acesso por perfil, RBAC (Aula 16)
- [ ] Filtros, agregações e `include` nas consultas do repository
- [ ] Rotas para `Orgao`, `Licitacao` e `User`

---

Projeto didático do **Amontada Valley** em parceria com o **SEBRAE-CE**.
