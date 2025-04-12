# Используем официальный образ Node.js как базовый образ
FROM node:16.20.0-alpine

# Устанавливаем рабочую директорию в контейнере
WORKDIR /app

# Копируем файл package.json и package-lock.json (если есть)
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем все остальные файлы приложения
COPY . .

# Компилируем TypeScript в JavaScript
RUN npm run build  # Используем скрипт "build" из package.json

# Открываем порт, на котором будет слушать приложение (обычно 3000)
EXPOSE 3000

# Команда для запуска приложения
CMD ["npm", "start"]  # или "node dist/index.js", если у вас нет скрипта "start" в package.json