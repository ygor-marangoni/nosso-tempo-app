# Runbook: dominio nosso-tempo.com fora do ar

Este documento registra o incidente em que `https://nosso-tempo.com` ficou fora do ar mesmo com o deploy da Vercel em estado `Ready`.

## Resumo do problema

O site nao estava fora por erro de codigo, build ou deploy. O problema estava no DNS do dominio raiz (`nosso-tempo.com`).

O registro DNS estava assim:

```text
A    @    216.198.79.1    TTL 300
CNAME www  718124f677a5b1e7.vercel-dns-017.com  TTL 300
```

O `www.nosso-tempo.com` e o dominio da Vercel estavam vivos, mas redirecionavam para `https://nosso-tempo.com/`. Como o dominio raiz apontava para um IP que dava timeout, todos os caminhos acabavam caindo no mesmo ponto quebrado.

## Sintomas

- Navegador mostrando `ERR_CONNECTION_TIMED_OUT`.
- Vercel mostrando production deployment como `Ready`.
- Build local passando com `npm run build`.
- `www.nosso-tempo.com` respondendo com redirect `308` para `https://nosso-tempo.com/`.
- `nosso-tempo-six.vercel.app` respondendo com redirect `308` para `https://nosso-tempo.com/`.
- `https://nosso-tempo.com` nao respondendo.

## Como confirmamos

Comandos usados no PowerShell:

```powershell
Resolve-DnsName nosso-tempo.com -Type A
Resolve-DnsName nosso-tempo.com -Type A -Server 1.1.1.1
Resolve-DnsName nosso-tempo.com -Type A -Server 8.8.8.8
curl.exe -I --max-time 20 https://nosso-tempo.com
curl.exe -I -L --max-time 20 https://www.nosso-tempo.com
curl.exe -I -L --max-time 20 https://nosso-tempo-six.vercel.app
```

Resultado ruim:

```text
nosso-tempo.com -> 216.198.79.1
https://nosso-tempo.com -> timeout
```

Teste de prova, forcando outro IP da Vercel:

```powershell
curl.exe -I --max-time 20 --resolve nosso-tempo.com:443:76.76.21.21 https://nosso-tempo.com
```

Resultado esperado:

```text
HTTP/1.1 200 OK
Server: Vercel
```

Isso confirmou que o app/deploy estava correto e que o problema era o IP usado pelo registro `A` do dominio raiz.

## Correcao aplicada

No painel DNS da Hostinger, o registro `A` do dominio raiz foi alterado:

```text
Antes:
A    @    216.198.79.1

Depois:
A    @    76.76.21.21
```

O registro `www` foi mantido:

```text
CNAME    www    718124f677a5b1e7.vercel-dns-017.com
```

Depois da mudanca, o DNS passou a resolver corretamente:

```text
nosso-tempo.com -> 76.76.21.21
```

E o site voltou:

```text
https://nosso-tempo.com -> 200 OK
https://www.nosso-tempo.com -> 308 -> https://nosso-tempo.com -> 200 OK
https://nosso-tempo-six.vercel.app -> 308 -> https://nosso-tempo.com -> 200 OK
```

## O que fazer se acontecer de novo

1. Primeiro, nao clicar em `Instant Rollback`.

   Rollback reverte deploy/codigo. Se o problema for DNS, rollback nao corrige e ainda pode reverter uma versao boa do app.

2. Confirmar se o deploy esta `Ready` na Vercel.

   Se o deploy estiver `Ready`, suspeitar de dominio/DNS antes de suspeitar do codigo.

3. Rodar o build local:

```powershell
npm run build
```

Se passar, o codigo provavelmente esta ok.

4. Conferir o DNS publico:

```powershell
Resolve-DnsName nosso-tempo.com -Type A
Resolve-DnsName nosso-tempo.com -Type A -Server 1.1.1.1
Resolve-DnsName nosso-tempo.com -Type A -Server 8.8.8.8
```

O esperado hoje:

```text
A    @    76.76.21.21
```

5. Conferir se o site responde:

```powershell
curl.exe -I --max-time 20 https://nosso-tempo.com
curl.exe -I -L --max-time 20 https://www.nosso-tempo.com
```

O esperado:

```text
HTTP/1.1 200 OK
Server: Vercel
```

6. Se `nosso-tempo.com` falhar, testar forcar o IP recomendado:

```powershell
curl.exe -I --max-time 20 --resolve nosso-tempo.com:443:76.76.21.21 https://nosso-tempo.com
```

Se esse comando retornar `200 OK`, mas o acesso normal falhar, o problema e DNS/propagacao/registro errado.

7. Conferir no painel DNS se existe conflito.

Evitar:

```text
A     @    IP antigo ou diferente do recomendado pela Vercel
AAAA  @    qualquer IPv6 nao configurado corretamente
CNAME @    no dominio raiz, se o provedor nao suportar flattening corretamente
```

Manter:

```text
A     @    76.76.21.21
CNAME www  valor indicado pela Vercel
```

8. Aguardar propagacao.

Com TTL `300`, muitos resolvedores atualizam em cerca de 5 minutos. Algumas redes, roteadores, navegadores ou provedores podem segurar cache por mais tempo.

## Quando usar rollback

Usar `Instant Rollback` somente quando:

- O deploy novo esta quebrado.
- O dominio resolve corretamente.
- O site responde, mas mostra erro de app.
- Uma versao anterior funcionava e a nova nao.

Nao usar rollback quando:

- O navegador mostra timeout de conexao.
- `curl` nao consegue conectar no dominio.
- O DNS aponta para IP errado.
- `www` ou `.vercel.app` redirecionam para o dominio raiz e o raiz nao responde.

## Prevencao

- Manter este DNS como referencia:

```text
A     @    76.76.21.21
CNAME www  718124f677a5b1e7.vercel-dns-017.com
TTL        300
```

- Antes de alterar DNS, tirar print dos registros atuais.
- Depois de alterar DNS, testar com `Resolve-DnsName` em `1.1.1.1` e `8.8.8.8`.
- Manter `www` e o dominio `.vercel.app` redirecionando para o dominio principal somente quando o dominio principal estiver saudavel.
- Em caso de duvida, conferir o valor recomendado em `Vercel > Project > Settings > Domains`.

