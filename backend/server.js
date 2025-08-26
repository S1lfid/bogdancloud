const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');
const schedule = require('node-schedule');

const app = express();
const port = process.env.PORT || 3000;

// Конфигурация
const MAX_FILE_SIZE = 500 * 1024 * 1024;

app.use(cors());
app.use(express.json());
app.use(express.static('frontend'));
app.use('/uploads', express.static('uploads'));

// База данных
const files = new Map();

// Настройка multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const shortId = crypto.randomBytes(6).toString('hex');
        cb(null, shortId + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: MAX_FILE_SIZE
    }
});

// Функция для удаления файла
function deleteFile(fileId) {
    const fileInfo = files.get(fileId);
    if (fileInfo) {
        // Удаляем физический файл
        const filePath = path.join(__dirname, 'uploads', fileInfo.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        // Удаляем из базы
        files.delete(fileId);
        console.log(`Файл ${fileId} удален`);
    }
}

// API эндпоинты
app.post('/api/upload', upload.single('file'), (req, res) => {
    const startTime = Date.now();
    const { expireTime } = req.body;
    
    if (!req.file) {
        return res.status(400).json({ error: 'Файл не загружен' });
    }
    
    const fileId = path.parse(req.file.filename).name;
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    let expirationDate = null;
    let deleteJob = null;
// Добавьте этот эндпоинт в server.js
app.get('/api/myip', (req, res) => {
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    res.json({ ip: clientIp });
});
    // Устанавливаем время удаления
    if (expireTime && expireTime !== 'unlimited') {
        expirationDate = new Date();
        const timeUnits = {
            '3days': 3 * 24 * 60 * 60 * 1000,
            'week': 7 * 24 * 60 * 60 * 1000,
            'month': 30 * 24 * 60 * 60 * 1000,
            '6months': 6 * 30 * 24 * 60 * 60 * 1000
        };
        
        expirationDate.setTime(expirationDate.getTime() + timeUnits[expireTime]);
        
        // Планируем удаление
        deleteJob = schedule.scheduleJob(expirationDate, () => {
            deleteFile(fileId);
        });
    }

    files.set(fileId, {
        originalName: req.file.originalname,
        filename: req.file.filename,
        uploadDate: new Date(),
        expirationDate: expirationDate,
        deleteJob: deleteJob,
        downloads: 0,
        size: req.file.size,
        expireTime: expireTime
    });

    const uploadTime = Date.now() - startTime;

    res.json({ 
        success: true, 
        fileUrl: fileUrl,
        shortUrl: `${req.protocol}://${req.get('host')}/f/${fileId}`,
        uploadTime: uploadTime,
        fileSize: req.file.size,
        expirationDate: expirationDate
    });
});

app.get('/f/:fileId', (req, res) => {
    const fileInfo = files.get(req.params.fileId);
    
    if (!fileInfo) {
        return res.status(404).json({ error: 'Файл не найден' });
    }

    // Проверяем не истекло ли время
    if (fileInfo.expirationDate && new Date() > fileInfo.expirationDate) {
        deleteFile(req.params.fileId);
        return res.status(404).json({ error: 'Время хранения файла истекло' });
    }

    fileInfo.downloads++;
    res.redirect(`/uploads/${fileInfo.filename}`);
});

// Статистика файла
app.get('/api/stats/:fileId', (req, res) => {
    const fileInfo = files.get(req.params.fileId);
    
    if (!fileInfo) {
        return res.status(404).json({ error: 'Файл не найден' });
    }

    res.json({
        originalName: fileInfo.originalName,
        uploadDate: fileInfo.uploadDate,
        expirationDate: fileInfo.expirationDate,
        downloads: fileInfo.downloads,
        size: fileInfo.size,
        expireTime: fileInfo.expireTime
    });
});

// Очистка старых файлов при запуске
function cleanupOldFiles() {
    const now = new Date();
    for (const [fileId, fileInfo] of files.entries()) {
        if (fileInfo.expirationDate && now > fileInfo.expirationDate) {
            deleteFile(fileId);
        }
    }
}

// Запускаем очистку при старте
cleanupOldFiles();

app.listen(port, () => {
    console.log(`БогданCloud запущен на порту ${port}`);
});