# 🚀 Deploy no Railway - Um Clique

## Opção 1: Deploy Automático com Botão (Mais Fácil)

Clique no botão abaixo para fazer deploy automático:

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new?template=https%3A%2F%2Fgithub.com%2Fseu-usuario%2Fviral-scanner)

---

## Opção 2: Deploy Manual (5 minutos)

### Passo 1: Criar Conta Railway
1. Acesse [railway.app](https://railway.app)
2. Clique em "Start a New Project"
3. Conecte sua conta GitHub

### Passo 2: Deploy do Repositório
1. Clique em "Deploy from GitHub"
2. Selecione seu repositório `viral-scanner`
3. Clique em "Deploy"

**Aguarde 2-3 minutos...**

### Passo 3: Adicionar Banco de Dados
1. No dashboard Railway, clique em "Add Service"
2. Selecione "MySQL"
3. Railway criará automaticamente `DATABASE_URL`

### Passo 4: Adicionar Variáveis de Ambiente
No Railway, vá para "Variables" e adicione:

```
NODE_ENV=production
YOUTUBE_API_KEY=AIzaSyCrh8sL6TrofvP9ze1CQ2_7gQXaAy3UX1c
```

(As outras chaves já vêm do sistema Manus)

### Passo 5: Pronto! 🎉
Acesse a URL que Railway forneceu e comece a gerar vídeos!

---

## Troubleshooting

### Erro: "Build failed"
- Verifique se o Dockerfile está correto
- Tente fazer redeploy

### Erro: "Database connection failed"
- Aguarde 30 segundos para MySQL iniciar
- Verifique se `DATABASE_URL` está configurada

### Erro: "YouTube API not working"
- Verifique se a chave está correta
- Aguarde alguns minutos para a chave ficar ativa

---

## Monitorar Logs

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Fazer login
railway login

# Ver logs
railway logs
```

---

## Próximos Passos

1. ✅ Deploy feito
2. ⏳ Criar conta
3. ⏳ Gerar primeiro vídeo
4. ⏳ Compartilhar com amigos!

---

**Pronto?** [Vá para railway.app](https://railway.app) 🚀
