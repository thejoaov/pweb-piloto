
<div align="center">

  <h1>
    Programação Web
    <h3>IFPI - 2024.1</h3>
  </h>

  <img src="https://raw.githubusercontent.com/thejoaov/pweb-piloto/refs/heads/main/public/logo-ifpi.png" width="300px">

</div>

### Stack
- [T3 Stack](https://create.t3.gg/)
- [Next.js 15](https://nextjs.org)
- [Supabase](https://supabase.com)
- [Drizzle](https://orm.drizzle.team)
- [BiomeJS](https://biomejs.dev/pt-br/)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

### Funcionalidades
- Cadastro de usuários (através de form de `/signup`) com envio de email de confirmação
- CRUD de produtos, com quantidade e valor, e status de modificação
- CRUD de ordens/pedidos, com progressão de status e condicionais

### Como testar
- [Vercel](https://pweb-cadweb.vercel.app)

ou

#### Localmente
- Instale as dependências com
`pnpm install`

Se não tiver o pnpm instalado, instale usando `npm i -g pnpm` ou `corepack install` (se o tiver habilitado)

- Se tiver [Docker](https://docker.io) instalado, prossiga com [Supabase local](https://supabase.com/docs/guides/local-development)

`pnpm supabase start`

- Copie o conteúdo do arquivo `.env.example` pra um `.env` na raiz do projeto, se necesário crie este arquivo

`cp .env.example .env`

- Rode as [migrations](https://orm.drizzle.team/docs/kit-overview)

`pnpm db:migrate`

- Após isso, rode o projeto com `pnpm dev`

- Se quiser usar a cloud do supabase, crie o projeto lá e coloque depois as variáveis de ambiente de acordo com o projeto supabase criado.
