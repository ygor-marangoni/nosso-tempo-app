# Nosso Tempo

SaaS para casais registrarem momentos, fotos, marcos e relatórios em um espaço privado compartilhado.

O projeto foi migrado para `Next.js + Firebase`, mantendo a identidade visual original do app e adicionando autenticação, onboarding, convite entre parceiros, isolamento multi-tenant e conta demo local. Para manter custo baixo sem abrir mão de uploads, a mídia é servida pelo `Cloudinary`.

## Stack

- `Next.js 14` com `App Router`
- `React 18`
- `Firebase Auth`
- `Cloud Firestore`
- `Cloudinary` para fotos
- `lucide-react`
- `Chart.js + react-chartjs-2`
- `CSS global puro`

## Funcionalidades

- Landing page pública
- Cadastro e login com `Google` e `email/senha`
- Recuperação de senha
- Envio de verificação de e-mail para contas por senha
- Onboarding do casal
- Convite por código/link
- Home com contador do relacionamento
- Registro de momentos
- Histórico com filtros por período e categoria
- Relatórios com gráficos
- Álbum com lightbox
- Linha do tempo com marcos
- Ajustes do casal, tema, frases, atividades personalizadas e conta
- Conta demo local para navegar sem infraestrutura pronta

## Estrutura

```text
src/
  app/
    page.js
    layout.js
    auth/
    onboarding/
    invite/[code]/
    api/cloudinary/
    app/
      home/
      register/
      history/
      reports/
      album/
      timeline/
      settings/
  components/
  contexts/
  lib/
```

## Variáveis de ambiente

Crie um arquivo `.env.local` com:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GA_ID=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Scripts

```bash
npm run dev
npm run dev:turbo
npm run build
npm run start
npm run test
npm run firebase:login
npm run firebase:emulators
npm run firebase:deploy
npm run firebase:deploy:rules
```

## Firebase

Este projeto usa Firebase direto no frontend para autenticação e banco.

Arquivos relevantes:

- `firestore.rules`
- `firestore.indexes.json`
- `firebase.json`
- `.firebaserc`
- `.env.example`

Estrutura principal:

```text
couples/{coupleId}
couples/{coupleId}/config/{coupleId}
couples/{coupleId}/members/{uid}
couples/{coupleId}/entries/{entryId}
couples/{coupleId}/album/{photoId}
couples/{coupleId}/timeline/{milestoneId}
couples/{coupleId}/phrases/{phraseId}
users/{uid}
invites/{code}
```

### Checklist real de ativação

1. Criar ou abrir o projeto `nosso-tempo-af8ed` no Firebase Console
2. Em `Authentication`, ativar:
   - `Email/Password`
   - `Google`
3. Em `Authentication > Settings > Authorized domains`, adicionar:
   - `localhost`
   - seu domínio da Vercel depois do primeiro deploy
4. Criar o `Cloud Firestore`
5. Criar um `Web App` no projeto e copiar as chaves para o `.env.local`
6. Rodar os deploys de regras e índices:

```bash
npm run firebase:login
npm run firebase:deploy
```

7. Reiniciar o app local com `npm run dev`

## Cloudinary

O app usa Cloudinary para:

- foto do casal
- álbum
- linha do tempo

Você precisa criar uma conta e copiar:

- `cloud name`
- `API key`
- `API secret`

O projeto usa upload assinado por rotas internas do próprio Next.js, então:

- não é necessário criar upload preset
- não é necessário backend separado
- as imagens continuam sendo entregues por CDN

## Conta demo

Enquanto a infraestrutura real não estiver pronta, dá para usar a conta local:

- Email: `teste@nosso-tempo.local`
- Senha: `123456`

Tudo fica salvo no `localStorage` do navegador.

## Deploy

Fluxo recomendado:

1. Configurar Firebase Auth e Firestore
2. Configurar Cloudinary
3. Publicar regras e índices
4. Definir variáveis na Vercel
5. Configurar `NEXT_PUBLIC_SITE_URL`
6. Opcionalmente configurar `NEXT_PUBLIC_GA_ID`

## Qualidade e performance

- Imagens são convertidas automaticamente para `WebP` com variantes responsivas
- Firestore usa cache local no navegador
- Rotas principais fazem prefetch
- Lightbox e modais usam portal global
- Relatórios carregam gráficos sob demanda
- Build validada com `next build`

## Testes

Há testes básicos de utilitários com `Vitest` para garantir regressões menores em datas, convites e nomes.
