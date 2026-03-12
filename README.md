# Viral Scanner - Gerador de Vídeos Virais

Uma plataforma web inteligente para gerar vídeos curtos virais otimizados para TikTok, Instagram Reels e YouTube Shorts usando IA, síntese de fala em português e composição automática de vídeos.

## Características Principais

### 🎬 Geração Automática de Vídeos
- **Roteiros Virais com IA**: Usa LLM para gerar roteiros otimizados com hooks de atenção
- **Áudio em Português**: Síntese de fala natural em português brasileiro
- **Composição Automática**: Combina imagens, legenda e áudio em vídeos 9:16
- **Mídia de Stock**: Integração com Pexels e Unsplash para imagens de alta qualidade

### 👤 Autenticação e Perfil
- Autenticação via Manus OAuth
- Histórico de vídeos gerados
- Perfil de usuário com preferências

### 📊 Templates Virais
- Curiosidades Chocantes
- Dicas Práticas
- Conteúdo Motivacional
- Estrutura customizável por template

### ☁️ Armazenamento e Download
- Upload automático para S3
- Download de vídeos em MP4
- Notificações quando vídeo está pronto

## Stack Tecnológico

### Frontend
- React 19 + TypeScript
- Tailwind CSS 4
- shadcn/ui
- tRPC para chamadas type-safe

### Backend
- Express 4 + Node.js
- tRPC 11
- Drizzle ORM
- MySQL/TiDB

### Processamento
- MoviePy (Python) para composição de vídeo
- Manus LLM para geração de roteiros
- Manus TTS para síntese de fala
- Manus S3 para armazenamento

## Começar Rápido

### Instalação Local

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/viral-scanner.git
cd viral-scanner

# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env.local

# Iniciar servidor de desenvolvimento
pnpm dev
```

O servidor estará disponível em `http://localhost:3000`

### Testes

```bash
# Rodar testes unitários
pnpm test

# Modo watch
pnpm test --watch
```

## Arquitetura

```
┌─────────────────────────────────────────┐
│           Frontend (React)              │
│  - Home (landing page)                  │
│  - GenerateVideo (formulário)           │
│  - VideoHistory (histórico)             │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      tRPC API (Type-Safe)               │
│  - videos.generate                      │
│  - videos.getStatus                     │
│  - videos.list                          │
│  - videos.listTemplates                 │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴────────┐
       ▼                ▼
┌─────────────┐  ┌──────────────────┐
│  Serviços   │  │  Banco de Dados  │
│             │  │                  │
│ - LLM       │  │ - users          │
│ - TTS       │  │ - video_templates│
│ - MediaAPI  │  │ - generated_videos
│ - MoviePy   │  │ - video_assets   │
│ - Storage   │  │                  │
└─────────────┘  └──────────────────┘
```

## Fluxo de Geração

```
1. Usuário insere tema
   ↓
2. Seleciona template
   ↓
3. LLM gera roteiro viral
   ↓
4. TTS converte para áudio (PT-BR)
   ↓
5. MediaAPI busca imagens
   ↓
6. MoviePy compõe vídeo
   ↓
7. Upload para S3
   ↓
8. Notificação ao usuário
   ↓
9. Download disponível
```

## Documentação

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitetura detalhada do sistema
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guia de deploy em hospedagem gratuita
- [API.md](./API.md) - Documentação das rotas tRPC

## Variáveis de Ambiente

```env
# Banco de Dados
DATABASE_URL=mysql://user:password@host/database

# Autenticação
VITE_APP_ID=seu_app_id
JWT_SECRET=seu_jwt_secret
OAUTH_SERVER_URL=https://api.manus.im

# APIs Externas
PEXELS_API_KEY=sua_chave
UNSPLASH_ACCESS_KEY=sua_chave

# Manus Built-in
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=sua_chave
```

## Roadmap

### MVP (Atual)
- ✅ Geração básica de vídeos
- ✅ Autenticação de usuários
- ✅ Histórico de vídeos
- ✅ Download de vídeos

### Fase 2
- [ ] Painel de templates customizáveis
- [ ] Análise de performance
- [ ] Sugestão de temas virais
- [ ] Integração com redes sociais

### Fase 3
- [ ] Monetização (créditos/planos)
- [ ] API pública
- [ ] Aplicativo mobile
- [ ] Análise de trending topics

## Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja [LICENSE](./LICENSE) para detalhes.

## Suporte

Para suporte, abra uma issue no repositório ou entre em contato através de [support@viralscan ner.com](mailto:support@viralscanner.com).

## Autor

Desenvolvido com ❤️ usando Manus AI

---

**Pronto para criar vídeos virais?** [Comece agora](http://localhost:3000)
