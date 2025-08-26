document.addEventListener('DOMContentLoaded', () => {
    const historyFloating = document.getElementById('historyFloating');
    const historyButton = document.getElementById('historyButton');
    const historyPopup = document.getElementById('historyPopup');
    const historyContent = document.getElementById('historyContent');
    const historyClose = document.getElementById('historyClose');
    const historyClear = document.getElementById('historyClear');
    const historyBadge = document.getElementById('historyBadge');

    const HISTORY_KEY = 'bogdancloud_history';
    let historyItems = [];

    // Загрузка истории из localStorage
    function loadHistory() {
        try {
            const saved = localStorage.getItem(HISTORY_KEY);
            historyItems = saved ? JSON.parse(saved) : [];
            updateHistoryUI();
        } catch (error) {
            console.error('Ошибка загрузки истории:', error);
            historyItems = [];
            updateHistoryUI();
        }
    }

    // Сохранение истории в localStorage
    function saveHistory() {
        try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(historyItems));
            updateHistoryUI();
        } catch (error) {
            console.error('Ошибка сохранения истории:', error);
        }
    }

    // Добавление файла в историю - ТЕПЕРЬ С ЗАЩИТОЙ
    function addToHistory(fileData) {
        // Защита от неправильных данных
        if (!fileData || typeof fileData !== 'object') {
            console.error('Invalid file data:', fileData);
            return;
        }

        const historyItem = {
            id: Date.now() + Math.random(),
            timestamp: new Date().toISOString(),
            shortUrl: fileData.shortUrl || '',
            fileUrl: fileData.fileUrl || '',
            fileName: fileData.fileName || 'Файл',
            fileSize: fileData.fileSize || 0,
            uploadTime: fileData.uploadTime || 0,
            expirationDate: fileData.expirationDate || null
        };

        // Проверяем, что есть хотя бы одна ссылка
        if (!historyItem.shortUrl && !historyItem.fileUrl) {
            console.error('No URLs in file data:', fileData);
            return;
        }

        historyItems.unshift(historyItem);
        if (historyItems.length > 20) {
            historyItems = historyItems.slice(0, 20);
        }

        saveHistory();
    }

    // Обновление интерфейса истории
    function updateHistoryUI() {
        if (!historyContent || !historyBadge || !historyFloating) return;

        const hasHistory = historyItems.length > 0;
        
        // Показываем/скрываем плавающую кнопку
        historyFloating.style.display = hasHistory ? 'block' : 'none';
        
        // Обновляем бейдж
        historyBadge.textContent = historyItems.length;
        
        // Обновляем содержимое попапа
        if (hasHistory) {
            historyContent.innerHTML = historyItems.map(item => `
                <div class="history-item" data-id="${item.id}">
                    <div class="history-item-main">
                        <div class="history-file-info">
                            <div class="history-file-name">📄 ${item.fileName}</div>
                            <div class="history-file-size">${formatFileSize(item.fileSize)}</div>
                        </div>
                        <div class="history-time">${formatTime(new Date(item.timestamp))}</div>
                    </div>
                    <div class="history-item-links">
                        ${item.shortUrl ? `
                            <a href="${item.shortUrl}" target="_blank" class="history-link history-link-short">
                                <i class="fas fa-link"></i> Короткая ссылка
                            </a>
                        ` : ''}
                        ${item.fileUrl ? `
                            <a href="${item.fileUrl}" target="_blank" class="history-link history-link-direct">
                                <i class="fas fa-download"></i> Прямая ссылка
                            </a>
                        ` : ''}
                        ${item.shortUrl ? `
                            <button class="history-copy" data-url="${item.shortUrl}">
                                <i class="fas fa-copy"></i>
                            </button>
                        ` : ''}
                    </div>
                    ${item.expirationDate ? `
                        <div class="history-expiry">
                            ⏰ До: ${formatExpirationDate(item.expirationDate)}
                        </div>
                    ` : ''}
                </div>
            `).join('');
        } else {
            historyContent.innerHTML = '<p class="history-empty">История загрузок пуста</p>';
        }

        // Добавляем обработчики для кнопок копирования
        document.querySelectorAll('.history-copy').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const url = btn.dataset.url;
                copyToClipboard(url);
                
                // Анимация копирования
                btn.innerHTML = '<i class="fas fa-check"></i>';
                btn.classList.add('copied');
                setTimeout(() => {
                    btn.innerHTML = '<i class="fas fa-copy"></i>';
                    btn.classList.remove('copied');
                }, 2000);
            });
        });
    }

    // Вспомогательные функции
    function formatFileSize(bytes) {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function formatTime(date) {
        try {
            const now = new Date();
            const diff = now - new Date(date);
            const minutes = Math.floor(diff / 60000);
            const hours = Math.floor(diff / 3600000);
            const days = Math.floor(diff / 86400000);

            if (minutes < 1) return 'только что';
            if (minutes < 60) return `${minutes} мин назад`;
            if (hours < 24) return `${hours} ч назад`;
            if (days < 7) return `${days} д назад`;
            return new Date(date).toLocaleDateString('ru-RU');
        } catch (e) {
            return 'недавно';
        }
    }

    function formatExpirationDate(date) {
        if (!date) return 'Неограниченно';
        try {
            return new Date(date).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } catch (e) {
            return 'Неограниченно';
        }
    }

    function copyToClipboard(text) {
        try {
            navigator.clipboard.writeText(text).then(() => {
                console.log('Ссылка скопирована:', text);
            });
        } catch (error) {
            console.error('Ошибка копирования:', error);
        }
    }

    // Обработчики событий
    if (historyButton) {
        historyButton.addEventListener('click', (e) => {
            e.stopPropagation();
            historyPopup.classList.toggle('show');
            historyButton.classList.toggle('active');
        });
    }

    if (historyClose) {
        historyClose.addEventListener('click', (e) => {
            e.stopPropagation();
            historyPopup.classList.remove('show');
            historyButton.classList.remove('active');
        });
    }

    if (historyClear) {
        historyClear.addEventListener('click', () => {
            if (confirm('Очистить всю историю загрузок?')) {
                historyItems = [];
                saveHistory();
                historyPopup.classList.remove('show');
            }
        });
    }

    // Закрытие попапа при клике вне его
    document.addEventListener('click', (e) => {
        if (historyPopup && !historyPopup.contains(e.target) && e.target !== historyButton) {
            historyPopup.classList.remove('show');
            if (historyButton) historyButton.classList.remove('active');
        }
    });

    // Загрузка истории при старте
    loadHistory();

    // Экспортируем функцию для добавления в историю
    window.addFileToHistory = addToHistory;
});