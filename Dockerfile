FROM node:18-alpine

WORKDIR /app

# Устанавливаем системные зависимости (если необходимо)
# RUN apk add --no-cache ...

COPY package*.json ./

RUN npm install --production  # Или npm ci

COPY . .

# Создаем пользователя (рекомендуется)
RUN addgroup -g 1001 nodejs
RUN adduser -S -u 1001 nodejs -G nodejs
USER nodejs

EXPOSE 3000

CMD ["npm", "start"]
