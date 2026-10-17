import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { Server as SocketIOServer } from 'socket.io';
import { createServer as createViteServer } from 'vite';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  require('dotenv').config();
} catch (e) {
  try {
    if (typeof (process as any).loadEnvFile === 'function') {
      (process as any).loadEnvFile();
    }
  } catch {}
}

const app = require('./backend/src/app.js');
const connectDB = require('./backend/src/config/db.js');
const seedData = require('./backend/src/utils/seeder.js');
const Chat = require('./backend/src/models/Chat.js');
const mongoose = require('mongoose');

const PORT = 3000;
const HOST = '0.0.0.0';

const server = http.createServer(app);

// Configuration Socket.io sur le serveur HTTP principal (port 3000)
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

let isAdminOnline = false;

io.on('connection', (socket) => {
  socket.on('join_room', (userId) => {
    socket.join(userId);
  });

  socket.on('admin_join', () => {
    socket.join('admin_room');
    isAdminOnline = true;
    io.emit('admin_status', { online: true });
  });

  socket.on('admin_leave', () => {
    isAdminOnline = false;
    io.emit('admin_status', { online: false });
  });

  socket.on('check_admin_status', () => {
    socket.emit('admin_status', { online: isAdminOnline });
  });

  socket.on('send_message', async (data) => {
    const { userId, sender, content, type, userEmail, userName } = data || {};
    try {
      if (mongoose.connection && mongoose.connection.readyState === 1 && userId) {
        let chat = await Chat.findOne({ userId });
        if (!chat) {
          chat = new Chat({ userId, userEmail, userName, messages: [] });
        } else {
          if (userEmail) chat.userEmail = userEmail;
          if (userName) chat.userName = userName;
        }

        const newMessage = {
          sender,
          content,
          type: type || 'text',
          timestamp: new Date(),
          read: false
        };

        chat.messages.push(newMessage);
        chat.lastUpdated = new Date();
        await chat.save();
      }

      const outgoingMessage = {
        sender,
        content,
        type: type || 'text',
        timestamp: new Date(),
        read: false
      };

      if (userId) {
        io.to(userId).emit('receive_message', outgoingMessage);
      }
      io.to('admin_room').emit('refresh_chats', { userId, lastMessage: outgoingMessage });
    } catch (error: any) {
      console.error('[Socket.io] Erreur message chat:', error?.message);
    }
  });

  socket.on('request_global_stats', () => {
    io.emit('stats_updated', { timestamp: Date.now() });
    io.emit('multishop_data_changed', { type: 'REFRESH_STATS', timestamp: Date.now() });
  });

  socket.on('disconnect', () => {});
});

async function start() {
  // Tentative de connexion MongoDB avec résilience complète
  try {
    await connectDB();
    await seedData();
    console.log('✅ [MultiShop] Base de données prête.');
  } catch (err: any) {
    console.warn('⚠️ [MultiShop] MongoDB non connecté, fallback mémoire actif:', err?.message);
  }

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Montage des middlewares Vite pour le développement
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: HOST,
        port: PORT
      },
      appType: 'spa'
    });

    app.use(vite.middlewares);
    console.log('⚡ [MultiShop] Vite middleware monté en mode développement');
  } else {
    // Mode Production : service des fichiers compilés de dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: any, res: any) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log('🚀 [MultiShop] Mode production actif avec dist/ statique');
  }

  server.listen(PORT, HOST, () => {
    console.log(`🌐 [MultiShop] Application complète active sur http://${HOST}:${PORT}`);
  });
}

start().catch((err) => {
  console.error('❌ [MultiShop] Erreur démarrage serveur:', err);
  process.exit(1);
});
