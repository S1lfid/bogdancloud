const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 3000;

// Конфигурация
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const FORBIDDEN_TYPES = [
    '.exe', '.msi', '.bat', '.cmd', '.sh', '.bash', '.php', '.php3', '.php4', '.php5', '.phtml',
    '.asp', '.aspx', '.html', '.htm', '.xhtml', '.js', '.jsx', '.ts', '.tsx', '.cgi', '.pl', '.py',
    '.jar', '.dll', '.vbs', '.ps1', '.wsf', '.com'
];

app.use(cors());
app.use(express.json());
app.use(express.static('frontend'));
app.use('/uploads', express.static('uploads'));

// База данных (для примера используем объект, в реальности нужно использовать настоящую БД)
const files = new Map();

// Настройка multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const shortId = crypto.randomBytes(4).toString('hex');
        cb(null, shortId + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: MAX_FILE_SIZE
    },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (FORBIDDEN_TYPES.includes(ext)) {
            cb(new Error('Запрещенный тип файла'));
        } else {
            cb(null, true);
        }
    }
});

// API эндпоинты
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Файл не загружен' });
    }
    
    const fileId = path.parse(req.file.filename).name;
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    files.set(fileId, {
        originalName: req.file.originalname,
        filename: req.file.filename,
        uploadDate: new Date(),
        downloads: 0
    });

    res.json({ 
        success: true, 
        fileUrl: fileUrl,
        shortUrl: `${req.protocol}://${req.get('host')}/f/${fileId}`
    });
});

app.get('/f/:fileId', (req, res) => {
    const fileInfo = files.get(req.params.fileId);
    
    if (!fileInfo) {
        return res.status(404).json({ error: 'Файл не найден' });
    }

    fileInfo.downloads++;
    res.redirect(`/uploads/${fileInfo.filename}`);
});

// Добавим middleware для обработки ошибок после существующих настроек app.use()
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: `Файл слишком большой. Максимальный размер: ${MAX_FILE_SIZE / (1024 * 1024)}MB`
            });
        }
        return res.status(400).json({ error: 'Ошибка при загрузке файла' });
    }
    
    if (err.message === 'Запрещенный тип файла') {
        return res.status(400).json({ 
            error: `Этот тип файла запрещен по соображениям безопасности`
        });
    }
    
    console.error(err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
}); 