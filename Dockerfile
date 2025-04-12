FROM node:16.20.0-alpine

WORKDIR /app  # Устанавливаем рабочую директорию

RUN npm install  # Устанавливаем зависимости

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
