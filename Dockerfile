FROM node:22-alpine

WORKDIR /app

# Instalar dependências do sistema
RUN apk add --no-cache python3 py3-pip ffmpeg

# Instalar dependências Python para MoviePy
RUN pip3 install --no-cache-dir moviepy pillow pydub numpy imageio

# Copiar package files
COPY package.json pnpm-lock.yaml ./

# Instalar pnpm e dependências
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copiar código fonte
COPY . .

# Build do projeto
RUN pnpm build

# Expor porta
EXPOSE 3000

# Comando de inicialização
CMD ["pnpm", "start"]
