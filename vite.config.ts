import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { handleApiRequest, initStores } from './serverApi.js';
import { Server as SocketIOServer } from 'socket.io';

function multishopProductionPlugin() {
  return {
    name: 'multishop-production-plugin',
    async configureServer(server) {
      await initStores();

      // Attach Socket.IO to dev server http instance with buffer protection
      if (server.httpServer) {
        const io = new SocketIOServer(server.httpServer, {
          cors: { origin: '*', methods: ['GET', 'POST'] },
          pingTimeout: 30000,
          pingInterval: 25000,
          maxHttpBufferSize: 1e6
        });

        io.on('connection', (socket) => {
          socket.on('join_room', (userId) => {
            if (typeof userId === 'string' && userId.length < 100) {
              socket.join(userId);
            }
          });
          socket.on('admin_join', () => socket.join('admin_room'));
          socket.on('check_admin_status', () => socket.emit('admin_status', { online: true }));
          socket.on('send_message', (data) => {
            if (!data || typeof data !== 'object') return;
            const newMessage = {
              sender: String(data.sender || 'Client').slice(0, 50),
              content: String(data.content || '').slice(0, 1000),
              timestamp: new Date(),
              read: false
            };
            if (data.userId) {
              io.to(data.userId).emit('receive_message', newMessage);
              io.to('admin_room').emit('refresh_chats', { userId: data.userId, lastMessage: newMessage });
            }
          });
        });
      }

      // High-performance security & API middleware
      server.middlewares.use((req, res, next) => {
        // Enforce safe headers compatible with iframe embedding
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

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
  plugins: [react(), multishopProductionPlugin()],
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
