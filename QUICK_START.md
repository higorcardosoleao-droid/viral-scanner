# ⚡ Quick Start - Deploy em 5 Minutos

## Opção Mais Rápida: Railway

### 1. Preparar Repositório

```bash
cd ~/viral-scanner
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Criar Conta Railway

- Acesse [railway.app](https://railway.app)
- Clique em "Start a New Project"
- Conecte GitHub

### 3. Deploy

- Clique em "Deploy from GitHub"
- Selecione `viral-scanner`
- Clique em "Deploy"

### 4. Adicionar MySQL

- Clique em "Add Service"
- Selecione "MySQL"
- Railway configura automaticamente

### 5. Variáveis de Ambiente

No dashboard Railway, adicione:

```
NODE_ENV=production
YOUTUBE_API_KEY=sua_chave
BUILT_IN_FORGE_API_KEY=sua_chave_manus
JWT_SECRET=qualquer_string_aleatoria
```

### 6. Pronto! 🎉

Acesse: `https://seu-projeto.railway.app`

---

## Obter Chaves Necessárias

### YouTube API (Gratuito)

1. [console.cloud.google.com](https://console.cloud.google.com)
2. Create Project → `viral-scanner`
3. Enable APIs → YouTube Data API v3
4. Credentials → Create API Key
5. Copie a chave

### Manus API Key

Já vem configurada automaticamente no Manus!

---

## Testar Localmente Primeiro

```bash
# Instalar
pnpm install

# Rodar
pnpm dev

# Acessar
# http://localhost:3000
```

---

## Comandos Úteis

```bash
# Build
pnpm build

# Testes
pnpm test

# TypeScript check
pnpm check

# Migrations
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

---

## Após Deploy

1. Criar conta
2. Gerar primeiro vídeo
3. Verificar se funcionou
4. Compartilhar com amigos!

---

**Dúvidas?** Consulte `DEPLOY_HOJE.md` para guia completo.
