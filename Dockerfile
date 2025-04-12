FROM node:18.20.0

WORKDIR /app

RUN npm cache clean --force

RUN npm install
RUN npm run build

EXPOSE 3000  # Замените 3000 на ваш порт

CMD ["npm", "start"]  # Или yarn start, или ваш скрипт запуска
