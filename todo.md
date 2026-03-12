# Viral Scanner - TODO List

## Fase 1: Banco de Dados e Modelos

- [x] Criar tabela `video_templates` com templates virais
- [x] Criar tabela `generated_videos` para histórico de vídeos
- [x] Criar tabela `video_assets` para rastreamento de mídia usada
- [x] Executar migrations no banco de dados

## Fase 2: Backend - Serviços Core

- [x] Implementar `scriptGenerator.ts` - integração com LLM para gerar roteiros
- [x] Implementar `ttsService.ts` - integração com TTS (Manus) em português
- [x] Implementar `mediaFetcher.ts` - busca de imagens em Pexels/Unsplash
- [x] Implementar `videoComposer.ts` - orquestração com MoviePy
- [x] Implementar `storageService.ts` - upload para S3

## Fase 3: Backend - Rotas tRPC

- [x] Criar `routers/videos.ts` - rotas para geração e histórico
- [x] Implementar tRPC procedure `videos.generate` - inicia geração
- [x] Implementar tRPC procedure `videos.getStatus` - verifica status
- [x] Implementar tRPC procedure `videos.list` - lista histórico
- [x] Implementar tRPC procedure `templates.listTemplates` - lista templates

## Fase 4: Backend - Processamento Assíncrono

- [ ] Implementar fila de processamento (`videoProcessingQueue.ts`)
- [ ] Integrar notificações ao usuário quando vídeo estiver pronto
- [ ] Implementar tratamento de erros e retry

## Fase 5: Frontend - Componentes e Páginas

- [x] Criar página de geração de vídeo (`GenerateVideo.tsx`)
- [x] Criar formulário com campos: tema, template, duração
- [x] Criar componente de preview de vídeo
- [ ] Criar página de histórico de vídeos (`VideoHistory.tsx`)
- [ ] Criar página de templates (`Templates.tsx`)

## Fase 6: Frontend - Integração com Backend

- [x] Conectar formulário ao tRPC `videos.generate`
- [x] Implementar polling de status com `videos.getStatus`
- [x] Implementar download de vídeo
- [ ] Implementar listagem de histórico com `videos.list`
- [x] Adicionar tratamento de erros e loading states

## Fase 7: Testes e Validação

- [ ] Testar fluxo completo de geração de vídeo
- [ ] Testar autenticação e autorização
- [ ] Testar upload para S3
- [ ] Testar notificações
- [ ] Corrigir bugs encontrados

## Fase 8: Deploy e Documentação

- [ ] Documentar instruções de execução local
- [ ] Documentar variáveis de ambiente necessárias
- [ ] Criar guia de deploy para hospedagem gratuita
- [ ] Salvar checkpoint final

---

**Status**: Em progresso - Fase 6 em andamento
