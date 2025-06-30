// server.js
const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8090 });

const clients = new Set();
let currentTurnIndex = 0;

server.on('connection', socket => {
    clients.add(socket);
    console.log('Client connected. Total:', clients.size);

    // Send current turn info
    socket.send(JSON.stringify({ type: 'turn', turnIndex: currentTurnIndex }));

    socket.on('message', message => {
        const data = JSON.parse(message);

        switch (data.type) {
            case 'move':
                broadcastExceptSender(data, socket);
                break;

            case 'turn':
                currentTurnIndex = data.turnIndex;
                broadcast({ type: 'turn', turnIndex: currentTurnIndex });
                break;

            case 'dice':
                broadcast({ type: 'dice', value: data.value, color: data.color });
                break;
        }
    });

    socket.on('close', () => {
        clients.delete(socket);
        console.log('Client disconnected');
    });

    socket.on('error', err => {
        console.error('WebSocket error:', err.message);
    });
});

function broadcast(data) {
    const msg = JSON.stringify(data);
    for (const client of clients) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(msg);
        }
    }
}

function broadcastExceptSender(data, sender) {
    const msg = JSON.stringify(data);
    for (const client of clients) {
        if (client !== sender && client.readyState === WebSocket.OPEN) {
            client.send(msg);
        }
    }
}

console.log('✅ WebSocket server is running on ws://localhost:8090');
