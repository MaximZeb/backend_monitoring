const express = require('express'); // Подключаем Express
const cors = require('cors');      // Подключаем CORS
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// Ваш секретный ключ для токенов
const SECRET_KEY = 'fed12g%4hfd$w3267rdabbjl894!34%&*33D';
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
// Подключаем cookie-parser
app.use(cookieParser());

// Подключение к MongoDB
mongoose.connect('mongodb://localhost:27017/monitoring', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Подключено к MongoDB'))
.catch((err: any) => console.error('Ошибка подключения к MongoDB:', err));

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

        // Генерируем токен
        const token = jwt.sign(
            { userId: newUser._id, login: newUser.login },
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        // Устанавливаем токен в HttpOnly cookie
        res.cookie('authToken', token, {
            httpOnly: true, // Недоступен для JavaScript
            secure: false, // Использовать secure cookies только на HTTPS
            sameSite: 'Lax', // Защищает от CSRF атак
            maxAge: 3600 * 1000, // 1 час
        });

        res.status(201).json({ 
            message: 'Пользователь успешно зарегистрирован',
            name,
            surname,
            middleName,
            position,
            division,
            enterpriseId: '679798e11b73903d632233a3',
         });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Модель для коллекции mines
const mineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sections: [
    {
      name: { type: String, required: true },
      combine_complexes: [
        {
          name: { type: String, required: true },
          combineId: { type: String, default: null },
          bunkerId: { type: String, default: null },
          samohodniVagonId: { type: String, default: null },
        },
      ],
    },
  ],
});

const Mine = mongoose.model('Mine', mineSchema);

// получить шахту
// Middleware для аутентификации
const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: 'Токен отсутствует' });

  try {
    req.user = jwt.verify(token, SECRET_KEY);
    next();
  } catch {
    res.status(401).json({ message: 'Недействительный токен' });
  }
};

// Защищённый маршрут для получения данных о шахте
app.get('/mines/:id', authMiddleware, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    console.log('ID, полученный в запросе:', id); // Логируем ID
    
    const mine = await Mine.findOne({_id: id});
    console.log('Результат поиска:', mine); // Логируем результат запроса

    if (!mine) return res.status(404).json({ message: 'Документ не найден' });
    res.status(200).json(mine);
  } catch {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});


// Маршрут для входа
app.post('/entry', async (req: any, res: any) => {
    const { login, password } = req.body;
  
    try {
      // Находим пользователя по логину
      const user = await User.findOne({ login });
  
      if (!user) {
        return res.status(400).json({ message: 'Неверный логин или пароль' });
      }
  
      // Проверяем пароль
      const isMatch = await bcrypt.compare(password, user.password);
  
      if (!isMatch) {
        return res.status(400).json({ message: 'Неверный логин или пароль' });
      }
  
      // Генерация JWT токена
      const token = jwt.sign(
        { userId: user._id, login: user.login }, 
        SECRET_KEY,  // Убедитесь, что используете сложный секретный ключ
        { expiresIn: '1h' }  // Токен будет действителен 1 час
      );
  
          // Отправляем токен в HTTPOnly cookie
    res.cookie('token', token, {
        httpOnly: true,  // Недоступен для JS
        secure: false, // Включите true только для HTTPS
        sameSite: 'Lax',  // Использовать secure только в production
        maxAge: 3600000,  // 1 час
    });

      // Возвращаем токен
      res.json({ message: 'Успешный вход',  enterpriseId: '679798e11b73903d632233a3'});
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  });

// Запускаем сервер
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
