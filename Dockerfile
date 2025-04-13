FROM node:18-alpine

WORKDIR /app

COPY dist ./dist  # Копируем уже скомпилированный код (предполагается, что он лежит в папке dist)

EXPOSE 3000

CMD ["node", "dist/index.js"]