// Дождемся загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем, был ли уже выбран язык
    const selectedLang = localStorage.getItem('selectedLanguage');
    const languageModal = document.getElementById('language-modal');

    // Если язык не выбран, показываем модальное окно
    if (!selectedLang) {
        languageModal.style.display = 'flex';
    } else {
        languageModal.style.display = 'none';
        applyLanguage(selectedLang);
    }

    // Обработчики выбора языка
    const languageButtons = document.querySelectorAll('.language-btn');
    languageButtons.forEach(button => {
        button.addEventListener('click', () => {
            const lang = button.dataset.lang;
            localStorage.setItem('selectedLanguage', lang);
            languageModal.style.display = 'none';
            applyLanguage(lang);
        });
    });

    // Функция применения выбранного языка
    function applyLanguage(lang) {
        const translations = {
            ja: {
                home: 'ホーム',
                about: '概要',
                download: 'ダウンロード',
                developers: '開発者',
                heroTitle: 'スロニック',
                heroText: '90年代の東京の雰囲気に浸ってください',
                downloadButton: 'アプリをダウンロード',
                aboutTitle: 'アプリケーションについて',
                aboutText: 'スロニックは、90年代の日本の雰囲気にあなたを連れて行くユニークなアプリケーションです。',
                features: [
                    'アニメスタイルの未来派インターフェース',
                    'レトロなサウンドエフェクトとアニメーション',
                    'すべてのデバイスに対応',
                    'シンセウェーブスタイルのオリジナルサウンドトラック'
                ],
                downloadTitle: 'アプリをダウンロード',
                downloads: 'ダウンロード数：',
                appTitle: 'スロニック v2.0',
                appDescription: '90年代の日本の雰囲気に浸ってください。Windows、macOS、Linuxで利用可能。',
                systemRequirements: 'システム要件：',
                developersTitle: '開発チーム',
                copyright: '© 2025 スロニック. 全権利所有。'
            },
            ru: {
                home: 'Главная',
                about: 'О нас',
                download: 'Скачать',
                developers: 'Разработчики',
                heroTitle: 'SloNick',
                heroText: 'Погрузитесь в атмосферу киберпанка и неоновых улиц Токио 90-х',
                downloadButton: 'Скачать приложение',
                aboutTitle: 'О приложении',
                aboutText: 'SloNick - это уникальное приложение, которое перенесет вас в атмосферу Японии 90-х годов.',
                features: [
                    'Футуристический интерфейс в стиле аниме',
                    'Ретро-звуковые эффекты и анимации',
                    'Полная адаптивность для всех устройств',
                    'Оригинальный саундтрек в стиле синтвейв'
                ],
                downloadTitle: 'Скачать приложение',
                downloads: 'Скачиваний:',
                appTitle: 'SloNick v2.0',
                appDescription: 'Окунитесь в атмосферу Японии 90-х годов с нашим приложением. Доступно для Windows, macOS и Linux.',
                systemRequirements: 'Системные требования:',
                developersTitle: 'Команда разработчиков',
                copyright: '© 2025 SloNick. Все права защищены.'
            }
        };

        // Применяем переводы
        const elements = {
            'home': document.querySelector('a[href="#home"]'),
            'about': document.querySelector('a[href="#about"]'),
            'download': document.querySelector('a[href="#download"]'),
            'developers': document.querySelector('a[href="#developers"]'),
            'heroTitle': document.querySelector('.hero-content h1'),
            'heroText': document.querySelector('.hero-content p'),
            'downloadButton': document.querySelector('.cta-container .neon-button'),
            'aboutTitle': document.querySelector('#about .section-title'),
            'aboutText': document.querySelector('.about-text p'),
            'features': document.querySelectorAll('.cyber-list li'),
            'downloadTitle': document.querySelector('#download .section-title'),
            'downloads': document.querySelector('.counter-text'),
            'appTitle': document.querySelector('.app-title'),
            'appDescription': document.querySelector('.app-description'),
            'systemRequirements': document.querySelector('.system-requirements h4'),
            'developersTitle': document.querySelector('#developers .section-title'),
            'copyright': document.querySelector('.footer-copyright')
        };

        for (const [key, element] of Object.entries(elements)) {
            if (element) {
                if (Array.isArray(element)) {
                    // Для списка особенностей
                    element.forEach((item, index) => {
                        item.textContent = translations[lang].features[index];
                    });
                } else {
                    // Для остальных элементов
                    element.textContent = translations[lang][key];
                }
            }
        }
    }

    // Функция для работы со счетчиком загрузок
    function setupDownloadCounter() {
        const downloadCount = document.getElementById('download-count');
        let ws = null;

        // Функция для получения текущего количества загрузок через HTTP
        async function getDownloadCount() {
            try {
                const response = await fetch('/api/downloads/count');
                const data = await response.json();
                updateDownloadCounter(data.count);
            } catch (error) {
                console.error('Ошибка при получении количества загрузок:', error);
            }
        }

        // Функция для увеличения счетчика загрузок через HTTP
        async function incrementDownloadCount() {
            try {
                const response = await fetch('/api/downloads/increment', {
                    method: 'POST'
                });
                const data = await response.json();
                updateDownloadCounter(data.count);
            } catch (error) {
                console.error('Ошибка при обновлении счетчика:', error);
            }
        }

        // Функция обновления отображения счетчика
        function updateDownloadCounter(newCount) {
            const currentCount = parseInt(downloadCount.textContent);
            if (newCount > currentCount) {
                downloadCount.textContent = newCount;
                downloadCount.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    downloadCount.style.transform = 'scale(1)';
                }, 200);
            }
        }

        // Пытаемся установить WebSocket соединение
        function connectWebSocket() {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const host = window.location.host;
            ws = new WebSocket(`${protocol}//${host}/ws`);

            ws.onopen = () => {
                console.log('WebSocket соединение установлено');
                ws.send(JSON.stringify({ type: 'get_downloads' }));
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'download_count') {
                    updateDownloadCounter(data.count);
                }
            };

            ws.onclose = () => {
                console.log('WebSocket соединение закрыто, переключаемся на HTTP');
                ws = null;
                // Если WebSocket недоступен, получаем данные через HTTP
                getDownloadCount();
            };

            ws.onerror = () => {
                console.log('Ошибка WebSocket, переключаемся на HTTP');
                ws = null;
                getDownloadCount();
            };
        }

        // Обработчик клика по кнопке скачивания
        const downloadButtons = document.querySelectorAll('.download-btn');
        downloadButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: 'increment_download' }));
                } else {
                    incrementDownloadCount();
                }
            });
        });

        // Пробуем сначала установить WebSocket соединение
        connectWebSocket();
    }

    // Управление фоновой музыкой
    const toggleMusicBtn = document.getElementById('toggle-music');
    const bgMusic = document.getElementById('bg-music');
    const musicIcon = toggleMusicBtn.querySelector('i');
    let isMusicPlaying = false;
    const audioPlayer = document.querySelector('.audio-player');

    toggleMusicBtn.addEventListener('click', () => {
        if (isMusicPlaying) {
            bgMusic.pause();
            musicIcon.classList.remove('fa-pause');
            musicIcon.classList.add('fa-play');
            audioPlayer.classList.remove('playing');
        } else {
            bgMusic.play().catch(e => {
                console.warn('Autoplay prevented:', e);
            });
            musicIcon.classList.remove('fa-play');
            musicIcon.classList.add('fa-pause');
            audioPlayer.classList.add('playing');
        }
        isMusicPlaying = !isMusicPlaying;
    });

    // Пытаемся автоматически воспроизвести музыку с пониженной громкостью
    bgMusic.volume = 0.5;
    bgMusic.play().then(() => {
        isMusicPlaying = true;
        musicIcon.classList.remove('fa-play');
        musicIcon.classList.add('fa-pause');
        audioPlayer.classList.add('playing');
    }).catch(e => {
        // Автоматическое воспроизведение, вероятно, заблокировано
        console.warn('Autoplay prevented:', e);
    });

    // Настройка обработчика обновлений для электронного приложения
    setupUpdateHandlers();

    // Добавляем эффект глитча при скролле
    const glitchOnScroll = () => {
        const glitchElements = document.querySelectorAll('.glitch-text');
        const scrollPosition = window.scrollY;
        
        glitchElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                if (Math.random() > 0.95) {
                    element.style.animation = 'glitch 0.3s linear';
                    setTimeout(() => {
                        element.style.animation = '';
                    }, 300);
                }
            }
        });
    };
    
    // Добавляем эффект для VHS фильтра
    const vhsDistortionEffect = () => {
        const vhsFilter = document.querySelector('.vhs-filter');
        if (vhsFilter) {
            const distort = () => {
                if (Math.random() > 0.97) {
                    vhsFilter.style.transform = `translateX(${Math.random() * 10 - 5}px)`;
                    setTimeout(() => {
                        vhsFilter.style.transform = 'translateX(0)';
                    }, 100);
                }
            };
            
            setInterval(distort, 500);
        }
    };
    
    // Эффект СRT экрана
    const crtEffect = () => {
        const body = document.body;
        
        const handleMouseMove = (e) => {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            
            const crtOverlay = document.querySelector('.crt-effect');
            if (crtOverlay) {
                crtOverlay.style.background = `radial-gradient(
                    circle at ${x * 100}% ${y * 100}%,
                    transparent 10%,
                    rgba(0, 0, 0, 0.2) 60%,
                    rgba(0, 0, 0, 0.6) 100%
                )`;
            }
        };
        
        body.addEventListener('mousemove', handleMouseMove);
    };
    
    // Эффект параллакса для заднего фона
    const parallaxEffect = () => {
        const cityscape = document.querySelector('.cityscape-bg');
        
        if (cityscape) {
            window.addEventListener('scroll', () => {
                const scrollPosition = window.scrollY;
                cityscape.style.transform = `translateY(${scrollPosition * 0.3}px)`;
            });
        }
    };
    
    // Анимация случайных помех на экране
    const randomNoiseAnimation = () => {
        const createNoisePixel = () => {
            const pixel = document.createElement('div');
            pixel.className = 'noise-pixel';
            pixel.style.width = `${Math.random() * 3 + 1}px`;
            pixel.style.height = `${Math.random() * 3 + 1}px`;
            pixel.style.position = 'fixed';
            pixel.style.backgroundColor = Math.random() > 0.5 ? '#00ffff' : '#ff00ff';
            pixel.style.opacity = Math.random() * 0.7 + 0.3;
            pixel.style.top = `${Math.random() * 100}%`;
            pixel.style.left = `${Math.random() * 100}%`;
            pixel.style.zIndex = '1000';
            pixel.style.pointerEvents = 'none';
            
            document.body.appendChild(pixel);
            
            setTimeout(() => {
                pixel.remove();
            }, Math.random() * 1000 + 200);
        };
        
        setInterval(() => {
            if (Math.random() > 0.7) {
                createNoisePixel();
            }
        }, 300);
    };
    
    // Анимация пульсации для кнопок
    const buttonPulseEffect = () => {
        const buttons = document.querySelectorAll('.neon-button');
        
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.classList.add('pulse');
            });
            
            button.addEventListener('mouseleave', () => {
                setTimeout(() => {
                    button.classList.remove('pulse');
                }, 500);
            });
        });
    };
    
    // Эффект свечения для карточек разработчиков
    const developersCardEffect = () => {
        const cards = document.querySelectorAll('.developer-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.boxShadow = `0 0 20px var(--neon-green), 0 0 30px var(--neon-green)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.boxShadow = `0 0 10px rgba(0, 255, 102, 0.2)`;
            });
        });
    };
    
    // Эффект плавной прокрутки для якорных ссылок
    const smoothScrolling = () => {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = link.getAttribute('href');
                
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            });
        });
    };
    
    // Анимация загрузки
    const loadingAnimation = () => {
        const body = document.body;
        body.style.opacity = '0';
        
        setTimeout(() => {
            body.style.transition = 'opacity 0.5s ease';
            body.style.opacity = '1';
        }, 300);
    };
    
    // Инициализация функций эффектов
    const initEffects = () => {
        window.addEventListener('scroll', glitchOnScroll);
        vhsDistortionEffect();
        crtEffect();
        parallaxEffect();
        randomNoiseAnimation();
        buttonPulseEffect();
        developersCardEffect();
        smoothScrolling();
        loadingAnimation();
    };
    
    // Замедление анимации при наведении на элемент для эффекта остановки времени
    const slowMotionEffect = () => {
        const elements = document.querySelectorAll('.dev-avatar, .app-icon, .neon-logo');
        
        elements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                document.body.style.setProperty('--animation-speed', '0.5');
                document.documentElement.style.setProperty('--animation-speed', '0.5');
            });
            
            element.addEventListener('mouseleave', () => {
                document.body.style.setProperty('--animation-speed', '1');
                document.documentElement.style.setProperty('--animation-speed', '1');
            });
        });
    };
    
    // Эффект искажения при клике
    const clickDistortionEffect = () => {
        document.addEventListener('click', (e) => {
            const distortion = document.createElement('div');
            distortion.className = 'click-distortion';
            distortion.style.position = 'fixed';
            distortion.style.top = `${e.clientY}px`;
            distortion.style.left = `${e.clientX}px`;
            distortion.style.width = '10px';
            distortion.style.height = '10px';
            distortion.style.backgroundColor = 'transparent';
            distortion.style.borderRadius = '50%';
            distortion.style.boxShadow = `0 0 40px 20px rgba(255, 0, 255, 0.3)`;
            distortion.style.zIndex = '999';
            distortion.style.pointerEvents = 'none';
            distortion.style.transform = 'translate(-50%, -50%)';
            distortion.style.animation = 'clickRipple 0.6s linear forwards';
            
            document.body.appendChild(distortion);
            
            setTimeout(() => {
                distortion.remove();
            }, 600);
        });
        
        // Добавляем анимацию ripple эффекта
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes clickRipple {
                0% {
                    transform: translate(-50%, -50%) scale(0.3);
                    opacity: 1;
                }
                100% {
                    transform: translate(-50%, -50%) scale(2);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    };
    
    // Инициализируем все эффекты
    initEffects();
    slowMotionEffect();
    clickDistortionEffect();

    // Обработка уведомлений о недостающих медиа-файлах
    if (window.electronAPI && window.electronAPI.onMissingMediaFiles) {
        window.electronAPI.onMissingMediaFiles((missingFiles) => {
            // Создаем элемент уведомления
            const notification = document.createElement('div');
            notification.className = 'missing-files-notification';
            
            // Создаем заголовок уведомления
            const title = document.createElement('h3');
            title.textContent = 'Внимание: отсутствуют некоторые медиа-файлы';
            notification.appendChild(title);
            
            // Создаем список отсутствующих файлов
            const list = document.createElement('ul');
            missingFiles.forEach(file => {
                const item = document.createElement('li');
                item.textContent = `${file.name}`;
                list.appendChild(item);
            });
            notification.appendChild(list);
            
            // Добавляем кнопку закрытия
            const closeButton = document.createElement('button');
            closeButton.textContent = 'Понятно';
            closeButton.addEventListener('click', () => {
                notification.classList.add('fade-out');
                setTimeout(() => {
                    notification.remove();
                }, 500);
            });
            notification.appendChild(closeButton);
            
            // Добавляем стили для уведомления
            const style = document.createElement('style');
            style.innerHTML = `
                .missing-files-notification {
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background-color: rgba(10, 12, 25, 0.9);
                    border: 2px solid #ff00c8;
                    border-radius: 10px;
                    padding: 20px;
                    color: white;
                    font-family: 'VT323', monospace;
                    z-index: 9999;
                    max-width: 500px;
                    text-align: center;
                    box-shadow: 0 0 20px rgba(255, 0, 200, 0.5);
                    animation: glitchIn 0.5s;
                }
                
                .missing-files-notification h3 {
                    margin-top: 0;
                    color: #ff00c8;
                    text-shadow: 0 0 5px #ff00c8;
                }
                
                .missing-files-notification ul {
                    text-align: left;
                    margin: 15px 0;
                    padding-left: 20px;
                }
                
                .missing-files-notification button {
                    background-color: #ff00c8;
                    color: white;
                    border: none;
                    padding: 8px 20px;
                    border-radius: 30px;
                    cursor: pointer;
                    font-family: 'VT323', monospace;
                    font-size: 16px;
                    margin-top: 10px;
                    transition: all 0.3s ease;
                }
                
                .missing-files-notification button:hover {
                    background-color: #00eeff;
                    transform: scale(1.05);
                }
                
                .fade-out {
                    animation: fadeOut 0.5s forwards;
                }
                
                @keyframes glitchIn {
                    0% {
                        clip-path: inset(100% 0 0 0);
                        transform: translateX(-50%) scale(0.9);
                    }
                    20% {
                        clip-path: inset(20% 0 0 0);
                        transform: translateX(-50%) scale(1.1);
                    }
                    40% {
                        clip-path: inset(40% 0 0 0);
                        transform: translateX(-50%) scale(1);
                    }
                    60% {
                        clip-path: inset(80% 0 0 0);
                        transform: translateX(-50%) scale(1.05);
                    }
                    80% {
                        clip-path: inset(50% 0 0 0);
                        transform: translateX(-50%) scale(0.95);
                    }
                    100% {
                        clip-path: inset(0 0 0 0);
                        transform: translateX(-50%) scale(1);
                    }
                }
                
                @keyframes fadeOut {
                    0% {
                        opacity: 1;
                        transform: translateX(-50%) scale(1);
                    }
                    100% {
                        opacity: 0;
                        transform: translateX(-50%) scale(0.9);
                    }
                }
            `;
            document.head.appendChild(style);
            
            // Добавляем уведомление на страницу
            document.body.appendChild(notification);
        });
    }

    // Инициализация при загрузке страницы
    setupDownloadCounter();
});

// Функция для обработки обновлений приложения
function setupUpdateHandlers() {
    // Проверяем, доступно ли Electron API
    if (window.electronAPI) {
        console.log('Electron API доступен, настройка обработчиков обновлений...');
        
        // Обработка события доступного обновления
        window.electronAPI.onUpdateAvailable((info) => {
            console.log('Доступно обновление:', info);
            showUpdateNotification('Доступна новая версия приложения', false);
        });
        
        // Обработка события завершения загрузки обновления
        window.electronAPI.onUpdateDownloaded((info) => {
            console.log('Обновление загружено:', info);
            showUpdateNotification('Обновление загружено и готово к установке', true);
        });
        
        // Обработка прогресса загрузки
        window.electronAPI.onDownloadProgress((percent) => {
            console.log(`Загрузка обновления: ${percent}%`);
            updateDownloadProgress(percent);
        });
        
        // Обработка сообщений от обновления
        window.electronAPI.onUpdaterMessage((message) => {
            console.log('Сообщение от системы обновления:', message);
        });
    } else {
        console.log('Electron API не доступен (возможно страница открыта в браузере)');
    }
}

// Показать уведомление об обновлении
function showUpdateNotification(message, showInstallButton = false) {
    // Удаляем существующее уведомление (если есть)
    const existingNotification = document.getElementById('update-notification');
    if (existingNotification) {
        document.body.removeChild(existingNotification);
    }
    
    // Создаем контейнер для уведомления
    const notificationContainer = document.createElement('div');
    notificationContainer.id = 'update-notification';
    notificationContainer.className = 'cyber-notification';
    
    // Добавляем контент уведомления
    let notificationContent = `
        <div class="notification-header">
            <span class="notification-title">SYSTEM UPDATE</span>
            <button id="close-notification" class="close-btn">&times;</button>
        </div>
        <div class="notification-body">
            <div class="notification-icon">
                <i class="fas fa-sync-alt"></i>
            </div>
            <div class="notification-message">${message}</div>
            ${showInstallButton ? 
                `<div class="progress-container">
                    <div id="update-progress-bar" class="progress-bar"></div>
                </div>` : ''}
        </div>
        <div class="notification-footer">
            ${showInstallButton ? 
                `<button id="install-update-btn" class="cyber-button install-btn">
                    <span>Установить</span>
                </button>` : 
                `<button id="close-notification-btn" class="cyber-button">
                    <span>Закрыть</span>
                </button>`}
        </div>
    `;
    
    notificationContainer.innerHTML = notificationContent;
    
    // Добавляем на страницу
    document.body.appendChild(notificationContainer);
    
    // Добавляем класс для анимации появления
    setTimeout(() => {
        notificationContainer.classList.add('visible');
    }, 10);
    
    // Обработчики событий
    const closeBtn = document.getElementById('close-notification');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            notificationContainer.classList.remove('visible');
            setTimeout(() => {
                if (notificationContainer.parentNode) {
                    notificationContainer.parentNode.removeChild(notificationContainer);
                }
            }, 300); // Время анимации исчезновения
        });
    }
    
    const closeNotificationBtn = document.getElementById('close-notification-btn');
    if (closeNotificationBtn) {
        closeNotificationBtn.addEventListener('click', () => {
            notificationContainer.classList.remove('visible');
            setTimeout(() => {
                if (notificationContainer.parentNode) {
                    notificationContainer.parentNode.removeChild(notificationContainer);
                }
            }, 300);
        });
    }
    
    const installUpdateBtn = document.getElementById('install-update-btn');
    if (installUpdateBtn) {
        installUpdateBtn.addEventListener('click', () => {
            // Вызываем установку обновления через Electron API
            if (window.electronAPI) {
                window.electronAPI.installUpdate();
            }
        });
    }
}

// Обновляет прогресс-бар загрузки обновления
function updateDownloadProgress(percent) {
    const progressBar = document.getElementById('update-progress-bar');
    if (progressBar) {
        progressBar.style.width = `${percent}%`;
    }
} 