const express = require('express'); // Подключаем Express
const cors = require('cors');      // Подключаем CORS
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const nn = require('./neuralNetwork'); // Импортируем функции нейронной сети

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

// Загружаем модель при старте сервера
nn.loadModel();

// Подключаем CORS
app.use(cors({
    origin: ['http://localhost:4200', 'http://localhost:50777', 'http://localhost:54772', 'http://localhost:62166', 'http://139.28.223.9'] , // Разрешаем запросы только с Angular приложения
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Разрешённые методы
    allowedHeaders: ['Content-Type', 'Authorization'], // Разрешённые заголовки
    credentials: true, // Разрешаем передачу cookies и других credentials
    sameSite: 'None' // Критично для кросс-доменных запросов!
}));
app.use(bodyParser.json());
// Подключаем cookie-parser
app.use(cookieParser());

// Подключение к MongoDB password: UQh09PXozhepFBOR maksim
mongoose.connect('mongodb+srv://maksim:UQh09PXozhepFBOR@monitoring.tjlre3l.mongodb.net/?retryWrites=true&w=majority&appName=Monitoring', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Подключено к MongoDB'))
.catch((err: any) => console.error('Ошибка подключения к MongoDB:', err));

app.get('/', (req: any, res: any) => {
  res.send('Привет, мир!'); 
});

// Метод регистрации
app.post('/register', async (req: any, res: any) => {
    try {
        const { login, password, name, surname, middleName, position, division } = req.body;

        // Проверяем, существует ли пользователь
        const existingUser = await User.findOne({ login });
        if (existingUser) {
            return res.status(400).json({ data: { message: 'Пользователь с таким логином уже существует' }});
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

        res.status(201).json({ data: {
          message: 'Пользователь успешно зарегистрирован',
          name,
          surname,
          middleName,
          position,
          division,
          enterpriseId: '679798e11b73903d632233a3',
        }});
    } catch (err) {
        console.error(err);
        res.status(500).json({data: { message: 'Ошибка сервера' }});
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

// Модель для коллекции combine
const technicsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  indications: [
    {
      time: { type: String, required: true },
      work_shift: { type: String, required: true },
      machine_readings: [
        {
          name_machine_readings: { type: String, required: true },
          times_readings: [{ type: String }],
          readings: [{ type: Number }]
        },
      ],
    },
  ],
});

// Модель для коллекции month_plan
const monthPlanSchema = new mongoose.Schema({
  time: { type: String, required: true },
  work_shift: { type: String, required: true },
  indications_month: 
    {
      name_machine_readings: { type: String, required: true },
      plan: { type: String, required: true },
      times_readings: [{ type: String }],
      name_month:{ type: String, required: true },
      readings: [{ type: Number }]
    }
});

// Модель для коллекции work_shift
const workShiftSchema = new mongoose.Schema({
  time: { type: String, required: true },
  work_shift: { type: String, required: true },
  indications: 
    {
      name_machine_readings: { type: String, required: true },
      plan: { type: String, required: true },
      times_readings: [{ type: String }],
      readings: [{ type: Number }]
    },
});

const SamohodniiVagon = mongoose.model('SamohodniiVagon', technicsSchema, 'samohodniiVagon');
const Bunker = mongoose.model('Bunker', technicsSchema, 'bunker');
const Combine = mongoose.model('Combine', technicsSchema, 'combine');
const Work_shift = mongoose.model('Work_shift', workShiftSchema, 'work_shift');
const Month_plan = mongoose.model('Month_plan', monthPlanSchema, 'month_plan');

// получить шахту
// Middleware для аутентификации
const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({data: { message: 'Токен отсутствует' } });

  try {
    req.user = jwt.verify(token, SECRET_KEY);
    next();
  } catch {
    res.status(401).json({data: { message: 'Недействительный токен' }});
  }
};

// Защищённый маршрут для получения данных о шахте
app.get('/mines/:id', authMiddleware, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    
    const mine = await Mine.findOne({_id: id});

    if (!mine) {
      return res.status(404).json({data: { message: 'Документ не найден' }})
    };

    res.status(200).json({data: mine});
  } catch {
    res.status(500).json({data: { message: 'Ошибка сервера' }});
  }
});

// Защищённый маршрут для получения данных о combine
app.get('/combine/:id', authMiddleware, async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const technicsCombine = await Combine.findOne({_id: id});
    if (!technicsCombine) {
      return res.status(404).json({data: { message: 'Документ не найден' }})
    };

    res.status(200).json({data: technicsCombine});
  } catch {
    res.status(500).json({data: { message: 'Ошибка сервера' }});
  }
});

// Защищённый маршрут для получения данных о work_shift
app.get('/work_shift/:id', authMiddleware, async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const WorkShiftCombine = await Work_shift.findOne({_id: id});
    if (!WorkShiftCombine) {
      return res.status(404).json({data: { message: 'Документ не найден' }})
    };

    res.status(200).json({data: WorkShiftCombine});
  } catch {
    res.status(500).json({data: { message: 'Ошибка сервера' }});
  }
});

// Защищённый маршрут для получения данных о month_plan
app.get('/month_plan/:id', authMiddleware, async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const MonthPlanCombine = await Month_plan.findOne({_id: id});
    if (!MonthPlanCombine) {
      return res.status(404).json({data: { message: 'Документ не найден' }})
    };

    res.status(200).json({data: MonthPlanCombine});
  } catch {
    res.status(500).json({data: { message: 'Ошибка сервера' }});
  }
});

// Защищённый маршрут для получения данных о work_shift
app.get('/work_shift/:date/:workShift', authMiddleware, async (req: any, res: any) => {
  try {
    const { date, workShift } = req.params;
    console.log(date, workShift)
    if (date === '1' && workShift === '1') {
      res.status(200).json({
        data: {
          combineId: '67b43d4dc4a16ca114d044d9',
          bunkerId: '67b4aa1359900f39ac5d4b92',
          samohodniVagonId: '67b4b38c59900f39ac5d4bb5',
          workShiftId: '67ba01e8a705a2a315725eec',
          monthPlanId: '67bd92d0ce0049202ac0ba46'
        }
      })
    } else {
      res.status(200).json({data: { message: 'Документ не найден' }});
    }

  } catch {
    res.status(500).json({data: { message: 'Ошибка сервера' }});
  }
});

// Защищённый маршрут для получения данных о samohodniiVagon
app.get('/samohodniiVagon/:id', authMiddleware, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    
    const technicsSamohodniiVagon = await SamohodniiVagon.findOne({_id: id});

    if (!technicsSamohodniiVagon) {
      return res.status(404).json({data: { message: 'Документ не найден' }})
    };

    res.status(200).json({data: technicsSamohodniiVagon});
  } catch {
    res.status(500).json({data: { message: 'Ошибка сервера' }});
  }
});

// Защищённый маршрут для получения данных о bunker
app.get('/bunker/:id', authMiddleware, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    
    const technicsBunker = await Bunker.findOne({_id: id});

    if (!technicsBunker) {
      return res.status(404).json({data: { message: 'Документ не найден' }})
    };

    res.status(200).json({data: technicsBunker});
  } catch {
    res.status(500).json({data: { message: 'Ошибка сервера' }});
  }
});

//Маршрут для гард защиты
app.get('/validate', authMiddleware, (req: any, res: any) => {
  res.status(200).send({data: { message: 'Токен валидный' }});
})

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
      const { name, surname, middleName, position, division } = user;
      // Возвращаем токен
      res.json({ data: {
        message: 'Успешный вход',
        name,
        surname,
        middleName,
        position,
        division,
        enterpriseId: '679798e11b73903d632233a3'
      }});
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Эндпоинт для предсказания
app.post('/predict', (req: any, res: any) => {
  try {
    const inputData = req.body;

    if (!inputData || typeof inputData.plan !== 'number') {
      return res.status(400).json({data: { error: 'Невреный данные. Ожидалось получить {plan: number}' }});
    }

    const prognoz = nn.getPrediction(inputData);
    const response = { data: { fact: prognoz } };
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({data: { error: 'Ошибка сервера' }});
  }
});

// Обучаем сеть при запуске сервера
try {
  nn.trainNetwork();
  nn.saveModel();
  console.log('Network trained and model saved on startup.');

} catch (error) {
  console.error('Error during training/testing on startup:', error);
}


// Запускаем сервер
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
