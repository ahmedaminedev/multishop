import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { handleApiRequest, initStores } from './serverApi.js';
import { Server as SocketIOServer } from 'socket.io';

function mockApiPlugin() {
  return {
    name: 'multishop-api-plugin',
    async configureServer(server) {
      await initStores();

      // Attach Socket.IO to dev server http instance
      if (server.httpServer) {
        const io = new SocketIOServer(server.httpServer, {
          cors: { origin: '*', methods: ['GET', 'POST'] }
        });

        io.on('connection', (socket) => {
          socket.on('join_room', (userId) => socket.join(userId));
          socket.on('admin_join', () => socket.join('admin_room'));
          socket.on('check_admin_status', () => socket.emit('admin_status', { online: true }));
          socket.on('send_message', (data) => {
            const newMessage = {
              sender: data.sender,
              content: data.content,
              timestamp: new Date(),
              read: false
            };
            io.to(data.userId).emit('receive_message', newMessage);
            io.to('admin_room').emit('refresh_chats', { userId: data.userId, lastMessage: newMessage });
          });
        });
      }

      // Mount API middleware
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/api')) {
          handleApiRequest(req, res, next);
        } else {
          next();
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), mockApiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true
  }
});
