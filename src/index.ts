// server.js

const express = require('express'); // Подключаем Express
const app = express();             // Создаём экземпляр приложения
const PORT = 3000;                 // Порт для сервера

// Маршрут для главной страницы
app.get('/', (req, res) => {
    res.send('Привет, мир! Это мой первый backend на Node.js.');
});

// Маршрут для примера
app.get('/api', (req, res) => {
    res.json({ message: 'Привет из API!', timestamp: new Date() });
});

// Запускаем сервер
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
