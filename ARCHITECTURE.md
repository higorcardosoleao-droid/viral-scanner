# Viral Scanner - Arquitetura da Plataforma

## 1. Visão Geral

O **Viral Scanner** é uma plataforma web de geração automática de vídeos virais para redes sociais (TikTok, Instagram Reels, YouTube Shorts). O sistema automatiza todo o fluxo: entrada de tema, geração de roteiro via LLM, conversão para áudio em português brasileiro, composição de vídeo com mídia gratuita e notificação ao usuário.

### Fluxo Principal

```
Usuário insere tema
    ↓
LLM gera roteiro viral
    ↓
TTS converte roteiro em áudio (PT-BR)
    ↓
MoviePy compõe vídeo (imagens + legenda + áudio)
    ↓
Vídeo armazenado em S3
    ↓
Notificação enviada ao usuário
    ↓
Download disponível
```

## 2. Stack Tecnológico

### Frontend
- **React 19** com TypeScript
- **Tailwind CSS 4** para estilização
- **shadcn/ui** para componentes reutilizáveis
- **tRPC** para chamadas ao backend com type-safety

### Backend
- **Express 4** com Node.js
- **tRPC 11** para RPC type-safe
- **Drizzle ORM** para gerenciamento de banco de dados
- **MySQL/TiDB** para persistência

### Processamento de Vídeo
- **MoviePy** (Python) para composição de vídeo
- **pydub** para processamento de áudio
- **Pillow** para manipulação de imagens

### Integração Externa
- **LLM (Manus Built-in)** para geração de roteiros virais
- **TTS (Manus Built-in)** para síntese de fala em português
- **S3 (Manus Built-in)** para armazenamento de vídeos
- **Notificações (Manus Built-in)** para alertar usuários

### Bancos de Mídia Gratuitos
- **Pexels API** para imagens e vídeos de stock
- **Unsplash API** para imagens de alta qualidade

## 3. Modelos de Dados

### Tabelas do Banco de Dados

#### `users` (já existe)
Armazena informações de autenticação e perfil do usuário.

#### `video_templates`
Define templates virais pré-configurados com estrutura de roteiro.

```sql
CREATE TABLE video_templates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,           -- Ex: "Curiosidade Chocante"
  description TEXT,
  category VARCHAR(100),                 -- Ex: "curiosidade", "motivação", "dica"
  scriptStructure JSON,                  -- Estrutura de roteiro
  styleConfig JSON,                      -- Paleta de cores, ritmo, etc.
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

#### `generated_videos`
Histórico de vídeos gerados por usuários.

```sql
CREATE TABLE generated_videos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  templateId INT,
  theme VARCHAR(255) NOT NULL,
  script TEXT,                           -- Roteiro gerado pelo LLM
  audioUrl VARCHAR(500),                 -- URL do áudio em S3
  videoUrl VARCHAR(500),                 -- URL do vídeo em S3
  status ENUM('processing', 'ready', 'failed'),
  duration INT,                          -- Duração em segundos
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (templateId) REFERENCES video_templates(id)
);
```

#### `video_assets`
Armazena referências de imagens/vídeos usados na composição.

```sql
CREATE TABLE video_assets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  videoId INT NOT NULL,
  assetUrl VARCHAR(500),
  assetType ENUM('image', 'video'),
  source VARCHAR(100),                   -- Ex: "pexels", "unsplash"
  createdAt TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (videoId) REFERENCES generated_videos(id)
);
```

## 4. Arquitetura do Backend

### Estrutura de Diretórios

```
server/
├── routers/
│   ├── videos.ts              -- Rotas para geração e histórico de vídeos
│   ├── templates.ts           -- Rotas para templates virais
│   └── assets.ts              -- Rotas para gerenciamento de assets
├── services/
│   ├── scriptGenerator.ts     -- Integração com LLM para roteiros
│   ├── ttsService.ts          -- Integração com TTS (Manus)
│   ├── videoComposer.ts       -- Orquestração com MoviePy
│   ├── mediaFetcher.ts        -- Busca de imagens em Pexels/Unsplash
│   └── storageService.ts      -- Upload para S3
├── jobs/
│   └── videoProcessingQueue.ts -- Fila de processamento assíncrono
├── db.ts                      -- Query helpers
└── routers.ts                 -- Registro de routers
```

### Fluxo de Processamento Assíncrono

1. **Submissão**: Usuário submete formulário → tRPC cria registro com status `processing`
2. **Fila**: Job é enfileirado para processamento
3. **Processamento**:
   - Gera roteiro via LLM
   - Converte para áudio via TTS
   - Busca imagens em Pexels/Unsplash
   - Compõe vídeo com MoviePy
   - Faz upload para S3
4. **Notificação**: Envia notificação ao usuário quando pronto
5. **Download**: Usuário baixa vídeo da URL em S3

## 5. Integração com APIs Externas

### LLM (Geração de Roteiro)

```typescript
// Exemplo de prompt para roteiro viral
const prompt = `
Gere um roteiro viral em português brasileiro para TikTok/Reels.
Tema: ${tema}
Estilo: ${estilo}
Duração: 15 segundos
Estrutura: Hook (0-2s) → Corpo (2-12s) → CTA (12-15s)
Retorne apenas o roteiro, sem explicações.
`;
```

### TTS (Text-to-Speech)

Usar o serviço de TTS integrado do Manus com voz em português brasileiro.

### S3 (Armazenamento)

```typescript
import { storagePut } from "./server/storage";

const { url } = await storagePut(
  `videos/${userId}/${videoId}.mp4`,
  videoBuffer,
  "video/mp4"
);
```

### Notificações

```typescript
import { notifyOwner } from "./server/_core/notification";

await notifyOwner({
  title: "Vídeo pronto!",
  content: `Seu vídeo sobre "${tema}" está pronto para download.`
});
```

## 6. Templates Virais Pré-configurados

### Exemplo 1: Curiosidade Chocante

```json
{
  "name": "Curiosidade Chocante",
  "category": "curiosidade",
  "scriptStructure": {
    "hook": "Você sabia que...?",
    "body": "Fato surpreendente sobre o tema",
    "cta": "Salva este vídeo!"
  },
  "styleConfig": {
    "colors": { "bg": "#000000", "text": "#FFFFFF" },
    "textSize": "large",
    "rhythm": "fast",
    "duration": "15s"
  }
}
```

### Exemplo 2: Dica Prática

```json
{
  "name": "Dica Prática",
  "category": "dica",
  "scriptStructure": {
    "hook": "Aprenda este truque em 15 segundos",
    "body": "Passo 1, Passo 2, Passo 3",
    "cta": "Comenta aqui sua experiência"
  },
  "styleConfig": {
    "colors": { "bg": "#1a1a2e", "text": "#00ff88" },
    "textSize": "medium",
    "rhythm": "medium",
    "duration": "15s"
  }
}
```

### Exemplo 3: Motivação

```json
{
  "name": "Motivação",
  "category": "motivacao",
  "scriptStructure": {
    "hook": "Você consegue!",
    "body": "Mensagem inspiradora",
    "cta": "Compartilha com quem precisa"
  },
  "styleConfig": {
    "colors": { "bg": "#ff6b6b", "text": "#ffffff" },
    "textSize": "large",
    "rhythm": "slow",
    "duration": "20s"
  }
}
```

## 7. Fluxo de Dados

### Submissão de Vídeo

```
Frontend (formulário)
    ↓ POST /api/trpc/videos.generate
Backend (tRPC)
    ↓ Cria registro em generated_videos (status: processing)
    ↓ Enfileira job
    ↓ Retorna videoId ao frontend
Frontend (mostra "processando...")
    ↓ Poll /api/trpc/videos.getStatus
Backend (verifica status)
    ↓ Quando pronto, retorna videoUrl
Frontend (mostra botão download)
```

## 8. Considerações de Performance

### Otimizações

1. **Processamento Assíncrono**: Não bloqueia a requisição HTTP
2. **Cache de Imagens**: Armazena imagens em S3 para reutilização
3. **Compressão de Vídeo**: MoviePy com codec H.264 para arquivo menor
4. **Fila de Processamento**: Limita processamento simultâneo

### Limites de Uso Gratuito

- **Pexels/Unsplash**: ~50 requisições/hora
- **TTS**: Depende do Manus (geralmente generoso)
- **S3**: Armazenamento e banda limitados

## 9. Segurança

- **Autenticação**: Manus OAuth integrado
- **Autorização**: Usuários só acessam seus próprios vídeos
- **Validação**: Validar entrada de tema (max 500 caracteres)
- **Rate Limiting**: Limitar geração a 5 vídeos/hora por usuário

## 10. Roadmap

### MVP (Semana 1-2)
- [x] Schema de banco de dados
- [x] Autenticação e perfil de usuário
- [x] Formulário de entrada
- [x] Integração com LLM para roteiros
- [x] Integração com TTS
- [x] Composição básica de vídeo
- [x] Upload para S3
- [x] Notificações

### Fase 2
- [ ] Painel de templates customizáveis
- [ ] Histórico de vídeos com filtros
- [ ] Análise de performance (views, engajamento)
- [ ] Integração com redes sociais (auto-upload)

### Fase 3
- [ ] IA para sugerir temas virais
- [ ] Análise de trending topics
- [ ] Monetização (créditos, planos)

---

**Próximos passos**: Implementar schema de banco de dados e criar as rotas tRPC para geração de vídeos.
