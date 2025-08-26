document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const uploadResult = document.getElementById('uploadResult');

    // Загрузка файлов
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    function formatFileSize(bytes) {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function formatTime(ms) {
        if (!ms) return '0мс';
        if (ms < 1000) return ms + 'мс';
        return (ms / 1000).toFixed(2) + 'с';
    }

    function formatExpirationDate(date) {
        if (!date) return 'Неограниченно';
        try {
            return new Date(date).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return 'Неограниченно';
        }
    }

    function handleFile(file) {
        if (!file) {
            showResult('error', 'Файл не выбран');
            return;
        }

        if (file.size > 500 * 1024 * 1024) {
            showResult('error', 'Файл слишком большой. Максимальный размер: 500MB');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('expireTime', window.selectedExpireTime || 'unlimited');

        showResult('loading', 'Загрузка файла...');
        const startTime = Date.now();

        fetch('/api/upload', {
            method: 'POST',
            body: formData
        })
        .then(async response => {
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Произошла ошибка при загрузке файла');
            }
            return data;
        })
        .then(data => {
            const uploadTime = Date.now() - startTime;
            const speed = data.fileSize / (uploadTime / 1000);
            
            // Добавляем в историю - ТЕПЕРЬ ПРАВИЛЬНО
            if (window.addFileToHistory) {
                window.addFileToHistory({
                    shortUrl: data.shortUrl || '',
                    fileUrl: data.fileUrl || '',
                    fileName: file.name || 'Файл',
                    fileSize: data.fileSize || 0,
                    uploadTime: data.uploadTime || 0,
                    expirationDate: data.expirationDate || null
                });
            }
            
            showResult('success', `
                <p class="success-message">Файл успешно загружен! 🎉</p>
                <p>Короткая ссылка: <a href="${data.shortUrl}" target="_blank">${data.shortUrl}</a></p>
                <p>Размер: ${formatFileSize(data.fileSize)}</p>
                <p>Время загрузки: ${formatTime(data.uploadTime)}</p>
                <p>Скорость: ${formatFileSize(speed)}/сек</p>
                <p>Хранение до: ${formatExpirationDate(data.expirationDate)}</p>
            `);
        })
        .catch(error => {
            showResult('error', error.message || 'Произошла неизвестная ошибка');
        });
    }

    function showResult(type, message) {
        if (!uploadResult) return;
        
        uploadResult.style.display = 'block';
        uploadResult.className = `result-area ${type}`;
        
        switch(type) {
            case 'loading':
                uploadResult.innerHTML = `
                    <div class="loading-spinner"></div>
                    <span>${message}</span>
                `;
                break;
            case 'error':
                uploadResult.innerHTML = `<p class="error-message">${message}</p>`;
                break;
            case 'success':
                uploadResult.innerHTML = message;
                try {
                    confetti({
                        particleCount: 150,
                        spread: 100,
                        origin: { y: 0.6 }
                    });
                } catch (e) {
                    console.log('Confetti error:', e);
                }
                break;
        }
    }
});