const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

// Глобальная переменная для главного окна
let mainWindow;

// Создаем окно приложения
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        icon: path.join(__dirname, 'img/app-icon.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, 'preload.js')
        },
        frame: true,
        backgroundColor: '#0a0a16',
        show: false // Скрываем окно до полной загрузки контента
    });

    // Загружаем HTML
    mainWindow.loadFile('index.html');

    // Убираем стандартное меню
    mainWindow.setMenu(null);

    // Проверка наличия необходимых медиа-файлов
    checkRequiredMediaFiles(mainWindow);

    // Эффект плавного появления окна
    mainWindow.once('ready-to-show', () => {
        setTimeout(() => {
            mainWindow.show();
            // Добавляем анимацию при запуске
            mainWindow.webContents.executeJavaScript(`
                document.body.style.opacity = '0';
                setTimeout(() => {
                    document.body.style.transition = 'opacity 0.8s ease';
                    document.body.style.opacity = '1';
                }, 100);
            `);
        }, 500);
    });

    // Открываем DevTools только в режиме разработки
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }
}

/**
 * Проверяет наличие необходимых медиа-файлов
 * @param {BrowserWindow} mainWindow - Главное окно приложения
 */
function checkRequiredMediaFiles(mainWindow) {
    const mediaFiles = [
        { path: path.join(__dirname, 'img', 'backgrounds', 'tokyo-night.jpg'), name: 'Фоновое изображение' },
        { path: path.join(__dirname, 'img', 'dev1.jpg'), name: 'Аватар разработчика 1' },
        { path: path.join(__dirname, 'img', 'dev2.jpg'), name: 'Аватар разработчика 2' },
        { path: path.join(__dirname, 'img', 'dev3.jpg'), name: 'Аватар разработчика 3' },
        { path: path.join(__dirname, 'img', 'app-screenshot.jpg'), name: 'Скриншот приложения' },
        { path: path.join(__dirname, 'img', 'app-icon.png'), name: 'Иконка приложения' },
        { path: path.join(__dirname, 'assets', 'music', 'synthwave-track.mp3'), name: 'Фоновая музыка' }
    ];
    
    const missingFiles = mediaFiles.filter(file => !fs.existsSync(file.path));
    
    if (missingFiles.length > 0) {
        console.warn('Отсутствуют следующие медиа-файлы:');
        missingFiles.forEach(file => {
            console.warn(`- ${file.name} (${file.path})`);
        });
        
        // Отправляем событие в рендер-процесс для отображения предупреждения
        mainWindow.webContents.on('did-finish-load', () => {
            mainWindow.webContents.send('missing-media-files', missingFiles);
        });
    }
}

// Настройка автообновления
function setupAutoUpdater() {
    // Проверяем обновления при запуске приложения
    autoUpdater.checkForUpdatesAndNotify();

    // Отправка сообщений из main процесса в renderer процесс
    autoUpdater.on('checking-for-update', () => {
        sendStatusToWindow('Проверка наличия обновлений...');
    });

    autoUpdater.on('update-available', (info) => {
        mainWindow.webContents.send('update-available', info);
    });

    autoUpdater.on('update-not-available', (info) => {
        sendStatusToWindow('Приложение обновлено до последней версии.');
    });

    autoUpdater.on('error', (err) => {
        sendStatusToWindow('Ошибка при проверке обновлений: ' + err);
    });

    autoUpdater.on('download-progress', (progressObj) => {
        let logMessage = `Скорость загрузки: ${progressObj.bytesPerSecond}`;
        logMessage = `${logMessage} - Загружено ${progressObj.percent}%`;
        logMessage = `${logMessage} (${progressObj.transferred}/${progressObj.total})`;
        sendStatusToWindow(logMessage);
        mainWindow.webContents.send('download-progress', progressObj.percent);
    });

    autoUpdater.on('update-downloaded', (info) => {
        mainWindow.webContents.send('update-downloaded', info);
    });

    // Обработчик события для установки обновления
    ipcMain.on('install-update', () => {
        autoUpdater.quitAndInstall();
    });
}

function sendStatusToWindow(text) {
    console.log(text);
    if (mainWindow) {
        mainWindow.webContents.send('updater-message', text);
    }
}

window.onload = function() {
    document.getElementById("bg-music").play();
}

// Когда Electron завершил инициализацию, создаем окно
app.whenReady().then(() => {
    createWindow();
    setupAutoUpdater();

    // На macOS обычно повторно создают окно в приложении, 
    // когда на его иконку щелкнули в доке и нет других открытых окон
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Выход из приложения, когда все окна закрыты
app.on('window-all-closed', function () {
    // В macOS это обычно для приложений и их строки меню, 
    // чтобы оставаться активными, пока пользователь явно не завершит их с помощью Cmd + Q
    if (process.platform !== 'darwin') app.quit();
});

// Обработка события перед закрытием
app.on('before-quit', () => {
    // Можно добавить логику сохранения данных перед выходом
    console.log('Приложение закрывается...');
}); 