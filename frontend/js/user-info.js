document.addEventListener('DOMContentLoaded', async () => {
    const userInfo = document.getElementById('userInfo');
    const userIp = document.querySelector('.user-ip');
    const userBrowser = document.querySelector('.user-browser');
    const userLocation = document.querySelector('.user-location');

    // Определяем браузер
    function getBrowserInfo() {
        const ua = navigator.userAgent;
        let browser = '🦊 Неизвестный браузер';
        
        if (ua.includes('Chrome') && !ua.includes('Edg')) browser = '🚀 Chrome';
        else if (ua.includes('Firefox')) browser = '🦊 Firefox';
        else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = '🍎 Safari';
        else if (ua.includes('Edg')) browser = '🧩 Edge';
        else if (ua.includes('Opera') || ua.includes('OPR')) browser = '🎭 Opera';
        else if (ua.includes('YaBrowser')) browser = '🌷 Yandex';
        
        return browser;
    }

    // Получаем IP и локацию
    async function getUserInfo() {
        try {
            // Получаем IP
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipResponse.json();
            const ip = ipData.ip;
            
            // Получаем информацию по IP
            const locationResponse = await fetch(`https://ipapi.co/${ip}/json/`);
            const locationData = await locationResponse.json();
            
            // Форматируем локацию
            let location = '🌍 Неизвестно';
            if (locationData.country_name) {
                location = `${getCountryFlag(locationData.country_code)} ${locationData.city || locationData.country_name}`;
            }
            
            // Обновляем UI
            userIp.textContent = `🖥️ IP: ${ip}`;
            userBrowser.textContent = `🌐 ${getBrowserInfo()}`;
            userLocation.textContent = `🗺️ ${location}`;
            
            // Показываем информацию с анимацией
            userInfo.style.display = 'block';
            setTimeout(() => {
                userInfo.classList.add('show');
            }, 100);
            
        } catch (error) {
            console.log('Не удалось получить информацию:', error);
            userIp.textContent = '🖥️ IP: Недоступно';
            userBrowser.textContent = `🌐 ${getBrowserInfo()}`;
            userLocation.textContent = '🗺️ Локация: Недоступно';
            userInfo.style.display = 'block';
            userInfo.classList.add('show');
        }
    }

    // Функция для получения флагов стран
    function getCountryFlag(countryCode) {
        if (!countryCode) return '🌍';
        
        const flagEmojis = {
            'RU': '🇷🇺', 'US': '🇺🇸', 'DE': '🇩🇪', 'FR': '🇫🇷', 'GB': '🇬🇧',
            'JP': '🇯🇵', 'CN': '🇨🇳', 'KR': '🇰🇷', 'BR': '🇧🇷', 'IN': '🇮🇳',
            'CA': '🇨🇦', 'AU': '🇦🇺', 'UA': '🇺🇦', 'KZ': '🇰🇿', 'BY': '🇧🇾',
            'TR': '🇹🇷', 'IT': '🇮🇹', 'ES': '🇪🇸', 'NL': '🇳🇱', 'SE': '🇸🇪'
        };
        
        return flagEmojis[countryCode.toUpperCase()] || '🌍';
    }

    // Запускаем получение информации
    getUserInfo();

    // Добавляем мимимишный клик по информации
    userInfo.addEventListener('click', () => {
        userInfo.classList.add('clicked');
        setTimeout(() => {
            userInfo.classList.remove('clicked');
        }, 300);
        
        // Случайные мимимишные фразы при клике
        const phrases = [
            'Приветик! 👋',
            'Как дела? 😊',
            'Хорошего дня! 🌈',
            'У тебя красивый IP! 🌸',
            'Люблю твой браузер! 💖',
            'Классная локация! 🗺️',
            'Ты лучший! ⭐',
            'Мимими! 🐾',
            'Обнимашки! 🤗',
            'Твоя улыбка светит! ☀️'
        ];
        
        const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
        const temp = userLocation.textContent;
        userLocation.textContent = randomPhrase;
        
        setTimeout(() => {
            userLocation.textContent = temp;
        }, 1500);
    });
});