FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Устанавливаем необходимые инструменты для сборки
RUN apk add --no-cache --virtual .gyp python3 make g++  # Или cmake, если нужно

RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
