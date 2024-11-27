document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const uploadResult = document.getElementById('uploadResult');
    const themeToggle = document.getElementById('themeToggle');

    // Тема
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon();

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon();
    });

    function updateThemeIcon() {
        const theme = document.documentElement.getAttribute('data-theme');
        themeToggle.innerHTML = theme === 'light' 
            ? '<i class="fas fa-moon"></i>' 
            : '<i class="fas fa-sun"></i>';
    }

    // Загрузка файлов
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.transform = 'scale(1.02)';
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.style.transform = 'scale(1)';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.transform = 'scale(1)';
        const files = e.dataTransfer.files;
        handleFile(files[0]);
    });

    fileInput.addEventListener('change', (e) => {
        handleFile(e.target.files[0]);
    });

    function handleFile(file) {
        if (!file) {
            showResult('error', 'Файл не выбран');
            return;
        }

        if (file.size > 100 * 1024 * 1024) {
            showResult('error', 'Файл слишком большой. Максимальный размер: 100MB');
            return;
        }

        const forbiddenTypes = [
            '.exe', '.msi', '.bat', '.cmd', '.sh', '.bash', '.php', '.php3', '.php4', '.php5', '.phtml',
            '.asp', '.aspx', '.html', '.htm', '.xhtml', '.js', '.jsx', '.ts', '.tsx', '.cgi', '.pl', '.py',
            '.jar', '.dll', '.vbs', '.ps1', '.wsf', '.com'
        ];
        const fileExt = '.' + file.name.split('.').pop().toLowerCase();
        if (forbiddenTypes.includes(fileExt)) {
            showResult('error', 'Этот тип файла запрещен по соображениям безопасности');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        showResult('loading', 'Загрузка файла...');

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
            showResult('success', `
                <p class="success-message">Файл успешно загружен!</p>
                <p>Короткая ссылка: <a href="${data.shortUrl}" target="_blank">${data.shortUrl}</a></p>
            `);
        })
        .catch(error => {
            showResult('error', error.message);
        });
    }

    function showResult(type, message) {
        uploadResult.style.display = 'block';
        
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
                // Добавляем конфетти
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
                // Добавляем еще конфетти с разных сторон
                setTimeout(() => {
                    confetti({
                        particleCount: 50,
                        angle: 60,
                        spread: 55,
                        origin: { x: 0 }
                    });
                    confetti({
                        particleCount: 50,
                        angle: 120,
                        spread: 55,
                        origin: { x: 1 }
                    });
                }, 250);
                break;
        }
    }
}); 