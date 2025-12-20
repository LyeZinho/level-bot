# Dockerfile para Level Bot
FROM node:20-alpine

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Cria diretório da app
WORKDIR /usr/src/app

# Copia package.json e package-lock.json (se existir) e instala dependências
COPY package.json package-lock.json* ./

# Instala dependências de build para sharp/libvips e em seguida instala as dependências node
RUN apk add --no-cache --virtual .build-deps build-base python3 pkgconfig
RUN apk add --no-cache vips-dev libjpeg-turbo-dev libpng-dev fftw-dev ttf-dejavu
RUN if [ -f package-lock.json ]; then npm ci --only=production; else npm install --only=production; fi
RUN apk del .build-deps

# Copia o restante dos arquivos
COPY . .

# Definimos o usuário node para maior segurança (padrão da imagem node)
USER node

# Inicializa o bot
CMD [ "node", "src/index.js" ]
