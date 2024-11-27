# FileShare

Простой и быстрый файлообменник без лишних функций. Загружайте файлы и делитесь ими через короткие ссылки.

![FileShare Screenshot](https://i.imgur.com/60mMKm7.png)

## Особенности

- 🚀 Быстрая загрузка файлов через drag-n-drop или клик
- 📎 Поддержка файлов до 100MB
- 🔗 Короткие ссылки для удобного шаринга
- 🌓 Темная и светлая темы
- 🔒 Блокировка потенциально опасных файлов
- 📱 Адаптивный дизайн
- 🔌 Простое API для интеграции

## Установка

1. Клонируйте репозиторий: 
```bash
git clone https://github.com/Master290/FileShare.git
cd FileShare
```

2. Установите зависимости:
```bash
npm install
```

3. Создайте папку `uploads` в корне проекта.

4. Запустите сервер:
```bash
node backend/server.js
```
Сервер будет доступен по адресу `http://localhost:3000`.

## API

### Загрузка файла
```bash
curl -X POST -F "file=@path/to/file" http://localhost:3000/upload
```
Ответ:
```json
{
    "success": true,
    "fileUrl": "http://example.com/uploads/filename.ext",
    "shortUrl": "http://example.com/f/shortId"
}
```

Подробная документация доступна на странице API

## Ограничения

- Максимальный размер файла: 100MB
- Запрещены к загрузке исполняемые файлы и скрипты (.exe, .php, .js и т.д.)

## Технологии

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Файловая система: multer
- Конфетти: canvas-confetti

## Разработка

Для добавления новых функций или исправления ошибок:

1. Создайте форк репозитория
2. Создайте ветку для новой функции (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте изменения (`git commit -m 'Add amazing feature'`)
4. Отправьте изменения в репозиторий (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## Лицензия

Распространяется под лицензией MIT. Смотрите файл [LICENSE](LICENSE) для получения дополнительной информации.

## Автор

- GitHub: [@Master290](https://github.com/Master290)

## Благодарности

- [Font Awesome](https://fontawesome.com/) - за иконки
- [canvas-confetti](https://github.com/catdad/canvas-confetti) - за эффект конфетти
