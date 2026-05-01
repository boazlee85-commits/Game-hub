import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';

const port = process.env.PORT || 3001;
const server = http.createServer();
const wss = new WebSocketServer({ server });

wss.on('connection', (socket) => {
  socket.on('message', (message) => {
    try {
      wss.clients.forEach((client) => {
        if (client !== socket && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    } catch (error) {
      console.error('Failed to broadcast message:', error);
    }
  });

  socket.on('close', () => {
    // connection closed
  });
});

server.listen(port, () => {
  console.log(`Realtime server is running on ws://localhost:${port}`);
});
