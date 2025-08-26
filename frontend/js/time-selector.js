document.addEventListener('DOMContentLoaded', () => {
    const timeButton = document.getElementById('timeButton');
    const timeMenu = document.getElementById('timeMenu');
    const currentTimeIcon = document.getElementById('currentTimeIcon');
    const currentTimeText = document.getElementById('currentTimeText');
    
    const timeOptions = {
        '3days': { icon: '🌅', text: '3 дня' },
        'week': { icon: '📅', text: 'Неделя' },
        'month': { icon: '📆', text: 'Месяц' },
        '6months': { icon: '🗓️', text: 'Полгода' },
        'unlimited': { icon: '∞', text: 'Неограниченно' }
    };

    // Загрузка сохраненного времени
    const savedTime = localStorage.getItem('fileExpireTime') || 'unlimited';
    window.selectedExpireTime = savedTime;
    updateTimeDisplay(savedTime);

    // Открытие/закрытие меню времени
    timeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        timeMenu.classList.toggle('show');
        timeButton.classList.toggle('active');
    });

    // Закрытие меню при клике вне его
    document.addEventListener('click', (e) => {
        if (!timeMenu.contains(e.target) && e.target !== timeButton) {
            timeMenu.classList.remove('show');
            timeButton.classList.remove('active');
        }
    });

    // Обработчик выбора времени
    timeMenu.querySelectorAll('.time-item').forEach(item => {
        item.addEventListener('click', () => {
            const time = item.dataset.time;
            window.selectedExpireTime = time;
            localStorage.setItem('fileExpireTime', time);
            updateTimeDisplay(time);
            timeMenu.classList.remove('show');
            timeButton.classList.remove('active');
            
            // Анимация выбора
            timeButton.classList.add('selected');
            setTimeout(() => {
                timeButton.classList.remove('selected');
            }, 500);
        });
    });

    function updateTimeDisplay(time) {
        currentTimeIcon.textContent = timeOptions[time].icon;
        currentTimeText.textContent = timeOptions[time].text;
    }
});