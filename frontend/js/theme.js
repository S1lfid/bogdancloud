document.addEventListener('DOMContentLoaded', () => {
    const themeButton = document.getElementById('themeButton');
    const themeMenu = document.getElementById('themeMenu');
    const currentThemeIcon = document.getElementById('currentThemeIcon');
    
    const themes = {
        'japan-red': { name: 'Акаи', icon: '🎌', color: '#e62b1e' },
        'japan-blue': { name: 'Аои', icon: '🏮', color: '#0a7abc' },
        'sakura': { name: 'Сакура', icon: '🌸', color: '#ffb7c5' },
        'dark-geisha': { name: 'Ёру', icon: '👺', color: '#ff6b6b' },
        'modern-tokyo': { name: 'Токио', icon: '🗼', color: '#00b4d8' }
    };

    // Загрузка темы
    const savedTheme = localStorage.getItem('theme') || 'japan-red';
    applyTheme(savedTheme);

    // Открытие/закрытие меню тем
    themeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        themeMenu.classList.toggle('show');
        themeButton.classList.toggle('active');
    });

    // Закрытие меню при клике вне его
    document.addEventListener('click', (e) => {
        if (!themeMenu.contains(e.target) && e.target !== themeButton) {
            themeMenu.classList.remove('show');
            themeButton.classList.remove('active');
        }
    });

    // Обработчик выбора темы
    themeMenu.querySelectorAll('.theme-item').forEach(item => {
        item.addEventListener('click', () => {
            const theme = item.dataset.theme;
            applyTheme(theme);
            themeMenu.classList.remove('show');
            themeButton.classList.remove('active');
        });
    });

    function applyTheme(themeName) {
        document.documentElement.setAttribute('data-theme', themeName);
        localStorage.setItem('theme', themeName);
        updateCurrentThemeIcon(themeName);
    }

    function updateCurrentThemeIcon(themeName) {
        currentThemeIcon.innerHTML = themes[themeName].icon;
        currentThemeIcon.style.background = themes[themeName].color;
    }
});