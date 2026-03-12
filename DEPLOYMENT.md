# Viral Scanner - Guia de Deploy e Execução

## Execução Local

### Pré-requisitos

- Node.js 22+
- pnpm 10+
- Python 3.8+ (para MoviePy)
- MySQL/TiDB (banco de dados)

### Instalação de Dependências Python

Para o processamento de vídeos com MoviePy, instale as dependências:

```bash
pip install moviepy pillow pydub numpy
```

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Banco de Dados
DATABASE_URL=mysql://user:password@localhost:3306/viral_scanner

# Autenticação Manus
VITE_APP_ID=seu_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://login.manus.im
JWT_SECRET=seu_jwt_secret

# APIs de Mídia (opcional)
PEXELS_API_KEY=sua_chave_pexels
UNSPLASH_ACCESS_KEY=sua_chave_unsplash

# S3 (Manus Built-in)
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=sua_chave_forge
```

### Executar Localmente

```bash
# Instalar dependências
pnpm install

# Iniciar servidor de desenvolvimento
pnpm dev

# O servidor estará disponível em http://localhost:3000
```

### Executar Testes

```bash
# Rodar todos os testes
pnpm test

# Rodar em modo watch
pnpm test --watch
```

---

## Deploy em Hospedagem Gratuita

### Opção 1: Vercel (Recomendado para Frontend)

Vercel oferece hospedagem gratuita com suporte a Node.js e bancos de dados.

1. **Conectar repositório**
   ```bash
   git push origin main
   ```

2. **Configurar no Vercel**
   - Acesse [vercel.com](https://vercel.com)
   - Conecte seu repositório GitHub
   - Configure variáveis de ambiente

3. **Limitações**
   - Funções serverless têm timeout de 10 segundos
   - MoviePy pode não funcionar (requer ffmpeg)
   - Melhor para apenas frontend + API

### Opção 2: Railway (Recomendado para Backend Completo)

Railway oferece hospedagem gratuita com suporte a Docker e processos long-running.

1. **Criar Dockerfile**
   ```dockerfile
   FROM node:22-alpine
   
   WORKDIR /app
   COPY package.json pnpm-lock.yaml ./
   RUN npm install -g pnpm && pnpm install
   
   COPY . .
   RUN pnpm build
   
   EXPOSE 3000
   CMD ["pnpm", "start"]
   ```

2. **Deploy**
   ```bash
   # Instalar Railway CLI
   npm i -g @railway/cli
   
   # Fazer login
   railway login
   
   # Deploy
   railway up
   ```

3. **Configurar Banco de Dados**
   - Railway oferece MySQL gratuito
   - Configurar variável DATABASE_URL automaticamente

### Opção 3: Render (Alternativa a Railway)

1. **Conectar repositório**
   - Acesse [render.com](https://render.com)
   - Conecte seu repositório GitHub

2. **Criar serviço**
   - Tipo: Web Service
   - Build command: `pnpm build`
   - Start command: `pnpm start`

3. **Adicionar banco de dados**
   - Render oferece PostgreSQL gratuito
   - Atualizar `DATABASE_URL` para PostgreSQL

### Opção 4: Hugging Face Spaces (Para Prototipagem)

Hugging Face oferece hospedagem gratuita com suporte a Docker.

1. **Criar Space**
   - Acesse [huggingface.co/spaces](https://huggingface.co/spaces)
   - Criar novo Space com Docker

2. **Fazer upload do código**
   ```bash
   git clone https://huggingface.co/spaces/seu_usuario/viral-scanner
   cd viral-scanner
   git push
   ```

---

## Considerações de Performance

### Limites de Uso Gratuito

| Serviço | Limite | Solução |
|---------|--------|---------|
| Pexels API | 50 req/hora | Cache de imagens em S3 |
| Unsplash API | ~50 req/hora | Usar ambos alternadamente |
| MoviePy | Sem limite | Fila de processamento |
| S3 (Manus) | Generoso | Comprimir vídeos |

### Otimizações Recomendadas

1. **Cache de Imagens**
   - Armazenar imagens em S3 após primeira busca
   - Reutilizar para temas similares

2. **Compressão de Vídeo**
   ```python
   # Em videoComposer.ts
   codec='libx264'  # Melhor compressão
   crf=28           # Qualidade (18-28)
   ```

3. **Fila de Processamento**
   - Limitar processamento simultâneo a 2-3 vídeos
   - Usar Redis para fila (opcional)

4. **Timeout de Processamento**
   - Máximo 5 minutos por vídeo
   - Cancelar se exceder tempo

---

## Troubleshooting

### Erro: "MoviePy not found"

```bash
pip install moviepy
# Se ainda falhar, instalar ffmpeg
sudo apt-get install ffmpeg  # Linux
brew install ffmpeg          # macOS
```

### Erro: "Database connection failed"

```bash
# Verificar variável DATABASE_URL
echo $DATABASE_URL

# Testar conexão
mysql -u user -p -h host database_name
```

### Erro: "TTS API not responding"

- Verificar BUILT_IN_FORGE_API_KEY
- Verificar BUILT_IN_FORGE_API_URL
- Consultar status em [api.manus.im/status](https://api.manus.im/status)

### Vídeo muito grande

```python
# Reduzir resolução em videoComposer.ts
width = 720   # De 1080
height = 1280 # De 1920
```

---

## Monitoramento

### Logs em Produção

```bash
# Railway
railway logs

# Render
# Acessar via dashboard

# Vercel
# Acessar via dashboard
```

### Métricas Importantes

- Tempo de geração de vídeo (objetivo: < 2 min)
- Taxa de sucesso de processamento (objetivo: > 95%)
- Uso de API (manter dentro de limites gratuitos)

---

## Próximos Passos

1. **Adicionar Templates Pré-configurados**
   - Inserir templates no banco via SQL
   - Criar UI para gerenciar templates

2. **Implementar Fila de Processamento**
   - Usar Bull Queue ou similar
   - Permitir processamento paralelo

3. **Adicionar Análise de Performance**
   - Rastrear qual template gera mais views
   - Sugerir temas populares

4. **Integração com Redes Sociais**
   - Auto-upload para TikTok
   - Agendamento de publicação

---

## Suporte

Para problemas ou dúvidas:
- Consulte ARCHITECTURE.md para detalhes técnicos
- Verifique logs do servidor
- Teste localmente antes de fazer deploy
