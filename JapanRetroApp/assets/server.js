const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 5500 });

let downloadCount = 0;
const clients = new Set();

server.on('connection', (ws) => {
    clients.add(ws);
    console.log('Новое подключение');

    // Отправляем текущее количество скачиваний новому клиенту
    ws.send(JSON.stringify({
        type: 'download_count',
        count: downloadCount
    }));

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        
        if (data.type === 'get_downloads') {
            ws.send(JSON.stringify({
                type: 'download_count',
                count: downloadCount
            }));
        } else if (data.type === 'increment_download') {
            incrementDownloadCount();
        }
    });

    ws.on('close', () => {
        clients.delete(ws);
        console.log('Клиент отключился');
    });
});

// Функция для увеличения счетчика
function incrementDownloadCount() {
    downloadCount++;
    // Отправляем обновленное значение всем подключенным клиентам
    const message = JSON.stringify({
        type: 'download_count',
        count: downloadCount
    });
    
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

console.log('WebSocket сервер запущен на порту 5500');

// Экспортируем функцию для использования в других частях приложения
module.exports = {
    incrementDownloadCount
}; 