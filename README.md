# VistoriApp

VistoriApp é uma aplicação web construída em React para apoiar equipes de vistoria na gestão de laudos, relatórios e comunicação com clientes. Este repositório reúne o código gerado inicialmente no Lovable, mas agora organizado para um fluxo de desenvolvimento profissional, com controle de qualidade e automações locais.

## Stack principal

- [Vite](https://vitejs.dev) + [React](https://react.dev) + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com) e [shadcn/ui](https://ui.shadcn.com)
- [Supabase](https://supabase.com) para autenticação e persistência de dados
- [TanStack Query](https://tanstack.com/query/latest) para gestão de cache e requisições assíncronas

## Pré-requisitos

- Node.js 18.18+ ou 20+
- npm 9+

Recomendamos usar [Volta](https://volta.sh) ou [nvm](https://github.com/nvm-sh/nvm) para gerenciar versões de Node.js.

## Configuração inicial

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie um arquivo `.env` na raiz do projeto com as credenciais públicas do Supabase. Um modelo está disponível em `.env.example`:

   ```bash
   cp .env.example .env
   ```

   Atualize os valores de acordo com os ambientes (dev/staging/prod). Nunca versione o arquivo `.env`.

### Variáveis de ambiente

| Variável                 | Onde configurar         | Descrição                                                             |
| ------------------------ | ----------------------- | --------------------------------------------------------------------- |
| `VITE_SUPABASE_URL`      | `.env` do frontend      | URL do projeto Supabase, utilizada pelo cliente web.                  |
| `VITE_SUPABASE_ANON_KEY` | `.env` do frontend      | Chave pública (anon) do Supabase para acesso via navegador.           |
| `FRONTEND_BASE_URL`      | Supabase Edge Functions | URL pública do frontend para gerar links em emails enviados via Edge. |

3. Execute o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

   O Vite ficará disponível em `http://localhost:5173` por padrão.

## Scripts disponíveis

| Script                 | Descrição                                                                  |
| ---------------------- | -------------------------------------------------------------------------- |
| `npm run dev`          | Inicia o servidor Vite em modo desenvolvimento.                            |
| `npm run build`        | Gera o bundle de produção.                                                 |
| `npm run preview`      | Serve o bundle de produção localmente.                                     |
| `npm run lint`         | Executa o ESLint nos arquivos do projeto.                                  |
| `npm run lint:fix`     | Tenta corrigir automaticamente problemas identificados pelo ESLint.        |
| `npm run format`       | Formata todos os arquivos suportados via Prettier.                         |
| `npm run format:check` | Verifica se os arquivos estão formatados de acordo com o Prettier.         |
| `npm run typecheck`    | Executa o TypeScript sem gerar código para garantir consistência de tipos. |
| `npm run check`        | Atalho que roda lint + typecheck.                                          |

## Qualidade de código

- **Prettier**: formatação consistente definida em `.prettierrc.cjs`.
- **ESLint**: regras base para JavaScript/TypeScript e React em `eslint.config.js`.
- **Husky + lint-staged**: executa automaticamente verificação e formatação (`lint-staged`) antes de cada commit.

Se desejar desativar temporariamente os hooks, use `HUSKY=0 git commit ...`.

## Alias e organização de pastas

Os imports relativos profundos foram substituídos por aliases definidos em `tsconfig.paths.json` e carregados automaticamente pelo plugin `vite-tsconfig-paths`. Utilize `@/` para importar arquivos a partir de `src/`:

```ts
import { supabase } from "@/integrations/supabase/client";
```

A estrutura de pastas principal é:

```
src/
├── components/         # Componentes reutilizáveis
├── integrations/       # Clientes e tipagens de integrações externas (Supabase, etc.)
├── pages/              # Páginas roteadas
├── utils/              # Funções utilitárias e helpers
└── env.d.ts            # Tipagem das variáveis de ambiente expostas pelo Vite
```

## Próximos passos sugeridos

- Configurar pipelines de CI (ex.: GitHub Actions) executando `npm run check` e `npm run build` em cada Pull Request.
- Definir ambientes Supabase por stage e automatizar migrations/seeds quando aplicável.
- Instrumentar monitoramento de erros (Sentry, LogRocket) e métricas de uso relevantes.

## Licença

Este projeto é proprietário e de uso interno da equipe responsável pelo VistoriApp. Consulte a liderança do projeto antes de compartilhar o código fora da organização.
