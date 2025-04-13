# backend_monitoring
Для  докера
1. заходим на vps ssh
2. скачаиваем репозиторий или обновляем через git pull origin main
3. создаем или пересоздаем образ "docker build -t backend ."
4. запускаем контейнер "docker run -d -p 3000:3000 -v /backend/backend_monitoring:/app backend"
5. проверяем http://139.28.223.9:3000/
