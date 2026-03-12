# 🚀 Viral Scanner - Deploy Gratuito HOJE

Guia passo-a-passo para colocar a plataforma rodando em produção **SEM GASTAR NADA**.

## Opção 1: Railway (Recomendado - Mais Fácil)

Railway oferece hospedagem gratuita com suporte a Docker e MySQL.

### Passo 1: Criar Conta no Railway

1. Acesse [railway.app](https://railway.app)
2. Clique em "Start a New Project"
3. Conecte sua conta GitHub

### Passo 2: Conectar Repositório

```bash
# No seu repositório local
git add .
git commit -m "Add deployment configs"
git push origin main
```

### Passo 3: Deploy no Railway

1. No Railway, clique em "Deploy from GitHub"
2. Selecione seu repositório `viral-scanner`
3. Clique em "Deploy"

### Passo 4: Configurar Banco de Dados

1. No Railway dashboard, clique em "Add Service"
2. Selecione "MySQL"
3. Railway criará automaticamente a variável `DATABASE_URL`

### Passo 5: Configurar Variáveis de Ambiente

No Railway dashboard, vá para "Variables" e adicione:

```env
NODE_ENV=production
YOUTUBE_API_KEY=sua_chave_youtube
BUILT_IN_FORGE_API_KEY=sua_chave_manus
BUILT_IN_FORGE_API_URL=https://api.manus.im
VITE_APP_ID=seu_app_id
JWT_SECRET=seu_jwt_secret_aleatorio
```

### Passo 6: Executar Migrations

1. No Railway, abra o terminal do serviço
2. Execute:

```bash
pnpm drizzle-kit migrate
```

### Pronto! 🎉

Seu app estará disponível em: `https://seu-projeto.railway.app`

---

## Opção 2: Hugging Face Spaces (Alternativa)

Hugging Face oferece hospedagem gratuita com Docker.

### Passo 1: Criar Space

1. Acesse [huggingface.co/spaces](https://huggingface.co/spaces)
2. Clique em "Create new Space"
3. Selecione "Docker"
4. Nome: `viral-scanner`

### Passo 2: Upload do Código

```bash
# Clonar seu space
git clone https://huggingface.co/spaces/seu-usuario/viral-scanner
cd viral-scanner

# Copiar arquivos do projeto
cp -r /caminho/para/viral-scanner/* .

# Fazer push
git add .
git commit -m "Initial deployment"
git push
```

### Passo 3: Configurar Variáveis

1. No Hugging Face, vá para "Settings"
2. Adicione as variáveis de ambiente

### Pronto! 🎉

Seu app estará disponível em: `https://seu-usuario-viral-scanner.hf.space`

---

## Opção 3: Render (Alternativa)

Render oferece hospedagem gratuita com suporte a PostgreSQL.

### Passo 1: Criar Serviço

1. Acesse [render.com](https://render.com)
2. Clique em "New +"
3. Selecione "Web Service"

### Passo 2: Conectar GitHub

1. Selecione seu repositório
2. Nome: `viral-scanner`
3. Build command: `pnpm build`
4. Start command: `pnpm start`

### Passo 3: Adicionar Banco de Dados

1. Clique em "New +"
2. Selecione "PostgreSQL"
3. Render criará a variável `DATABASE_URL`

### Pronto! 🎉

Seu app estará disponível em: `https://viral-scanner.onrender.com`

---

## Configurar YouTube API (Gratuito)

Para buscar vídeos virais, você precisa da YouTube Data API.

### Passo 1: Criar Projeto no Google Cloud

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Clique em "Create Project"
3. Nome: `viral-scanner`

### Passo 2: Ativar YouTube Data API

1. No menu, clique em "APIs & Services"
2. Clique em "Enable APIs and Services"
3. Procure por "YouTube Data API v3"
4. Clique em "Enable"

### Passo 3: Criar Chave de API

1. Clique em "Credentials"
2. Clique em "Create Credentials"
3. Selecione "API Key"
4. Copie a chave

### Passo 4: Adicionar ao Projeto

Adicione a chave como variável de ambiente:

```env
YOUTUBE_API_KEY=sua_chave_aqui
```

**Limite gratuito**: 10.000 requisições/dia (mais que suficiente!)

---

## Testar Localmente Antes de Deploy

```bash
# Instalar dependências
pnpm install

# Rodar testes
pnpm test

# Iniciar servidor local
pnpm dev

# Acessar em http://localhost:3000
```

---

## Troubleshooting

### Erro: "Database connection failed"

```bash
# Verificar variável DATABASE_URL
echo $DATABASE_URL

# Testar conexão
mysql -u user -p -h host database_name
```

### Erro: "MoviePy not found"

O Dockerfile já instala MoviePy. Se ainda falhar:

```bash
# No Railway terminal
pip3 install moviepy
```

### Erro: "YouTube API key invalid"

1. Verificar se a chave foi criada corretamente
2. Verificar se YouTube Data API está ativada
3. Esperar alguns minutos para a chave ficar ativa

### Vídeos muito grandes

Reduzir resolução em `videoComposer.ts`:

```typescript
width: 720   // De 1080
height: 1280 // De 1920
```

---

## Monitoramento em Produção

### Railway

```bash
# Ver logs
railway logs

# Ver variáveis
railway variables
```

### Hugging Face

- Logs disponíveis no dashboard
- Acessar via "Logs" na página do Space

### Render

- Logs disponíveis no dashboard
- Acessar via "Logs" na página do serviço

---

## Próximos Passos Após Deploy

1. **Testar fluxo completo**
   - Criar conta
   - Gerar vídeo
   - Verificar se notificação foi enviada

2. **Monitorar performance**
   - Tempo de geração de vídeo
   - Taxa de sucesso
   - Uso de API

3. **Otimizar**
   - Aumentar cache de imagens
   - Implementar fila de processamento
   - Adicionar mais templates

---

## Custos

| Serviço | Limite Gratuito | Custo Extra |
|---------|-----------------|------------|
| Railway | 5GB/mês | $5/GB depois |
| Hugging Face | Ilimitado | Nenhum |
| Render | 750h/mês | Pago depois |
| YouTube API | 10k req/dia | $1-5/1k req |
| Manus TTS | Generoso | Conforme uso |

**Total: R$0 para começar!**

---

## Suporte

- Railway: [docs.railway.app](https://docs.railway.app)
- Hugging Face: [huggingface.co/docs](https://huggingface.co/docs)
- Render: [render.com/docs](https://render.com/docs)

---

**Pronto para colocar no ar?** Escolha uma opção acima e siga os passos! 🚀
