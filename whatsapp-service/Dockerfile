# Imagem leve para caber no Free Tier do Render.com
FROM node:20-slim

WORKDIR /app

# Instala apenas as dependências de produção primeiro (melhor cache)
COPY package.json ./
RUN npm install --omit=dev

# Copia o código do serviço
COPY server.js ./

# O Render injeta a variável PORT automaticamente
ENV NODE_ENV=production

# Cria o diretório persistente das credenciais do WhatsApp
RUN mkdir -p /app/auth_state

EXPOSE 3001

CMD ["node", "server.js"]
