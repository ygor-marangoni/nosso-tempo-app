# Nosso Tempo

SaaS para casais registrarem momentos, fotos, marcos e relatórios em um espaço privado compartilhado.

O projeto foi migrado para `Next.js + Firebase`, mantendo a identidade visual original do app e adicionando autenticação, onboarding, convite entre parceiros, isolamento multi-tenant e conta demo local.

## Stack

- `Next.js 14` com `App Router`
- `React 18`
- `Firebase Auth`
- `Cloud Firestore`
- `Firebase Storage`
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
- Conta demo local para navegar sem Firebase pronto

## Estrutura

```text
src/
  app/
    page.js                 # Landing pública
    layout.js               # Metadata, fontes e analytics
    auth/
    onboarding/
    invite/[code]/
    app/
      home/
      register/
      history/
      reports/
      album/
      timeline/
      settings/
  components/
    analytics/
    common/
    layout/
    reports/
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

# Opcional
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GA_ID=
```

## Scripts

```bash
npm run dev
npm run dev:turbo
npm run build
npm run start
npm run test
```

## Firebase

Este projeto usa Firebase direto no frontend.

Arquivos relevantes:

- `firestore.rules`
- `firestore.indexes.json`
- `storage.rules`
- `firebase.json`

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

## Conta demo

Enquanto o Firebase não estiver pronto, dá para usar a conta local:

- Email: `teste@nosso-tempo.local`
- Senha: `123456`

Tudo fica salvo no `localStorage` do navegador.

## Deploy

Fluxo recomendado:

1. Configurar Firebase Auth, Firestore e Storage
2. Publicar regras e índices
3. Definir variáveis na Vercel
4. Configurar `NEXT_PUBLIC_SITE_URL`
5. Opcionalmente configurar `NEXT_PUBLIC_GA_ID`

## Qualidade e performance

- Imagens são convertidas automaticamente para `WebP` com variantes responsivas
- Firestore usa cache local no navegador
- Rotas principais fazem prefetch
- Lightbox e modais usam portal global
- Build validada com `next build`

## Testes

Há testes básicos de utilitários com `Vitest` para garantir regressões menores em datas, convites e nomes.
