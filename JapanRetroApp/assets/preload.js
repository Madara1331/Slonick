// Preload скрипт для Electron

// Все API Node.js доступны в preload процессе
const { contextBridge, ipcRenderer } = require('electron');

// Предоставляем доступ к некоторым функциям Electron из рендер процесса
contextBridge.exposeInMainWorld('electronAPI', {
    // Получение информации о приложении
    getAppInfo: () => {
        return {
            name: "NeoCyberTokyo",
            version: "1.0.0",
            description: "Приложение в стиле Японии 90-х годов с анимацией и эффектами"
        };
    },
    
    // Система обновлений
    onUpdateAvailable: (callback) => {
        ipcRenderer.on('update-available', (event, info) => callback(info));
        return () => ipcRenderer.removeListener('update-available', callback);
    },
    
    onUpdateDownloaded: (callback) => {
        ipcRenderer.on('update-downloaded', (event, info) => callback(info));
        return () => ipcRenderer.removeListener('update-downloaded', callback);
    },
    
    onDownloadProgress: (callback) => {
        ipcRenderer.on('download-progress', (event, percent) => callback(percent));
        return () => ipcRenderer.removeListener('download-progress', callback);
    },
    
    onUpdaterMessage: (callback) => {
        ipcRenderer.on('updater-message', (event, message) => callback(message));
        return () => ipcRenderer.removeListener('updater-message', callback);
    },
    
    installUpdate: () => ipcRenderer.send('install-update'),
    
    // Медиа-файлы
    onMissingMediaFiles: (callback) => {
        ipcRenderer.on('missing-media-files', (event, files) => callback(files));
        return () => ipcRenderer.removeListener('missing-media-files', callback);
    },
    
    // Система
    openExternalLink: (url) => {
        // Безопасно открывать внешние ссылки
        ipcRenderer.send('open-external-link', url);
    }
});

// Инициализация DOM эффектов при загрузке
window.addEventListener('DOMContentLoaded', () => {
    // Проверяем темную тему ОС
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Добавляем класс, если пользователь предпочитает темную тему
    if (prefersDark) {
        document.body.classList.add('dark-mode');
    }
    
    // Обнаруживаем и устанавливаем предпочтительную платформу
    const platform = process.platform;
    document.body.setAttribute('data-platform', platform);
    
    // Инициализируем поддержку жестов для трекпада (если доступно)
    if (platform === 'darwin') {
        // Функции для macOS
    }
    
    // Регистрируем сочетания клавиш
    document.addEventListener('keydown', (event) => {
        // Ctrl/Cmd + , для открытия настроек
        if ((event.ctrlKey || event.metaKey) && event.key === ',') {
            // Открыть настройки
        }
        
        // Ctrl/Cmd + Q для выхода из приложения
        if ((event.ctrlKey || event.metaKey) && event.key === 'q') {
            ipcRenderer.send('quit-app');
        }
    });
    
    // Дополнительные эффекты, которые должны быть запущены из процесса preload
    
    // Эффект "сломанного экрана" случайно
    setTimeout(() => {
        if (Math.random() > 0.7) {
            const glitchEl = document.createElement('div');
            glitchEl.style.position = 'fixed';
            glitchEl.style.top = '0';
            glitchEl.style.left = '0';
            glitchEl.style.width = '100%';
            glitchEl.style.height = '100%';
            glitchEl.style.pointerEvents = 'none';
            glitchEl.style.backgroundColor = 'transparent';
            glitchEl.style.backgroundImage = 'linear-gradient(to bottom, rgba(255, 0, 255, 0.1) 0%, transparent 1%, transparent 50%, rgba(0, 255, 255, 0.1) 51%, transparent 52%, transparent 100%)';
            glitchEl.style.backgroundSize = '100% 4px';
            glitchEl.style.zIndex = '9999';
            glitchEl.style.opacity = '0';
            glitchEl.style.animation = 'glitchScreen 0.3s ease-in-out';
            
            const styleEl = document.createElement('style');
            styleEl.innerHTML = `
                @keyframes glitchScreen {
                    0% { opacity: 0; transform: translateX(0); }
                    20% { opacity: 0.8; transform: translateX(20px); }
                    40% { opacity: 0.4; transform: translateX(-20px); }
                    60% { opacity: 0.8; transform: translateX(10px); }
                    80% { opacity: 0.5; transform: translateX(-10px); }
                    100% { opacity: 0; transform: translateX(0); }
                }
            `;
            
            document.head.appendChild(styleEl);
            document.body.appendChild(glitchEl);
            
            setTimeout(() => {
                glitchEl.remove();
                styleEl.remove();
            }, 300);
        }
    }, 2000);
    
    // Добавление старых пиксельных эффектов по всему сайту
    const pixelEffect = () => {
        const siteContainer = document.createElement('div');
        siteContainer.style.position = 'fixed';
        siteContainer.style.top = '0';
        siteContainer.style.left = '0';
        siteContainer.style.width = '100%';
        siteContainer.style.height = '100%';
        siteContainer.style.pointerEvents = 'none';
        siteContainer.style.zIndex = '9998';
        siteContainer.style.backgroundImage = 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABtJREFUeNpiZGBgaGAgAjAxEAlGFVgYQIABAFHgAg0QBnzUAAAAAElFTkSuQmCC")';
        siteContainer.style.opacity = '0.03';
        
        document.body.appendChild(siteContainer);
    };
    
    // Запускаем пиксельный эффект
    pixelEffect();
});

// Настройки анимаций
console.log('Preload script загружен, настройка интерфейса...');

// Настраиваем переменные CSS для анимаций
document.addEventListener('DOMContentLoaded', () => {
    // Добавляем поддержку обнаружения бездействия
    let inactivityTimer;
    
    const resetInactivityTimer = () => {
        clearTimeout(inactivityTimer);
        document.body.classList.remove('inactive');
        
        // Установить таймер бездействия на 60 секунд
        inactivityTimer = setTimeout(() => {
            document.body.classList.add('inactive');
        }, 60000);
    };
    
    // Сброс таймера при взаимодействии пользователя
    window.addEventListener('mousemove', resetInactivityTimer);
    window.addEventListener('keydown', resetInactivityTimer);
    window.addEventListener('click', resetInactivityTimer);
    
    // Инициализация таймера
    resetInactivityTimer();
}); 