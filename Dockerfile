FROM node:18.20.0

WORKDIR /app

COPY package*.json ./  # Копируем package.json и package-lock.json (или yarn.lock, pnpm-lock.yaml)

# Чистим кэш npm (полезно, но не всегда необходимо)
RUN npm cache clean --force

# Устанавливаем зависимости
RUN npm install --production  # Или npm install --only=production, если вам нужны только production dependencies

# Если у вас есть скрипт build, выполните его (если не нужно, удалить)
# COPY . .  # Копируем остальные файлы проекта (после npm install)
# RUN npm run build

EXPOSE 3000  # Замените 3000 на ваш порт

CMD ["npm", "start"]  # Или yarn start, или ваш скрипт запуска
