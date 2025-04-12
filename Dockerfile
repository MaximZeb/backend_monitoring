FROM node:18-alpine

WORKDIR /app  # Устанавливаем рабочую директорию

COPY package.json package-lock.json ./  # Копируем package.json и package-lock.json

RUN npm install  # Устанавливаем зависимости

COPY . .  # Копируем все остальные файлы проекта

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
