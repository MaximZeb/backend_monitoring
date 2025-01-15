const express = require('express'); // Подключаем Express
const cors = require('cors');      // Подключаем CORS
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');


const app = express();             // Создаём экземпляр приложения
const PORT = 3000;                 // Порт для сервера

const userSchema = new mongoose.Schema({
    login: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    surname: { type: String, required: true },
    middleName: { type: String, required: true },
    position: { type: String, required: true },
    division: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Подключаем CORS
app.use(cors({
    origin: 'http://localhost:4200', // Разрешаем запросы только с Angular приложения
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Разрешённые методы
    allowedHeaders: ['Content-Type', 'Authorization'], // Разрешённые заголовки
    credentials: true // Разрешаем передачу cookies и других credentials
}));
app.use(bodyParser.json());

// Подключение к MongoDB
mongoose.connect('mongodb://localhost:27017/monitoring', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Подключено к MongoDB'))
.catch((err: any) => console.error('Ошибка подключения к MongoDB:', err));

// Маршрут для главной страницы
app.get('/', (req: any, res: any) => {
    res.send('Привет, мир! Это мой первый backend на Node.js.');
});

app.post('/register', async (req: any, res: any) => {
    try {
        const { login, password, name, surname, middleName, position, division } = req.body;

        // Проверяем, существует ли пользователь
        const existingUser = await User.findOne({ login });
        if (existingUser) {
            return res.status(400).json({ message: 'Пользователь с таким логином уже существует' });
        }

        // Хэшируем пароль
        const hashedPassword = await bcrypt.hash(password, 10);

        // Создаём нового пользователя
        const newUser = new User({
            login,
            password: hashedPassword,
            name,
            surname,
            middleName,
            position,
            division,
        });

        await newUser.save();
        res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Маршрут для примера
app.get('/api', (req: any, res: any) => {
    res.json({ message: 'Привет из API!', timestamp: new Date() });
});

// Запускаем сервер
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
