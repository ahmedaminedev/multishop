
try {
  require('dotenv').config();
} catch (e) {
  try {
    if (typeof process.loadEnvFile === 'function') {
      process.loadEnvFile();
    }
  } catch {}
}

const app = require('./app');
const connectDB = require('./config/db');
const seedData = require('./utils/seeder');
const http = require('http');
const { Server } = require('socket.io');
const Chat = require('./models/Chat');

// Database connection is awaited in startServer() below

const PORT = process.env.BACKEND_PORT || (process.env.PORT && process.env.PORT !== '8080' && process.env.PORT !== '3000' ? process.env.PORT : 5000);

const server = http.createServer(app);

// Configuration Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*", 
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Global Admin Status
let isAdminOnline = false;

io.on('connection', (socket) => {
  // Client joins their own room based on User ID
  socket.on('join_room', (userId) => {
    socket.join(userId);
  });

  // Admin joins the admin room
  socket.on('admin_join', () => {
    socket.join('admin_room');
    isAdminOnline = true;
    io.emit('admin_status', { online: true });
  });

  socket.on('admin_leave', () => {
    isAdminOnline = false;
    io.emit('admin_status', { online: false });
  });

  // Check admin status
  socket.on('check_admin_status', () => {
    socket.emit('admin_status', { online: isAdminOnline });
  });

  // Handle Message Sending
  socket.on('send_message', async (data) => {
    const { userId, sender, content, type, userEmail, userName } = data;
    
    try {
      // 1. Save to MongoDB
      let chat = await Chat.findOne({ userId });
      
      if (!chat) {
        chat = new Chat({ userId, userEmail, userName, messages: [] });
      } else {
        // Update user info if changed
        if(userEmail) chat.userEmail = userEmail;
        if(userName) chat.userName = userName;
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

      // 2. Emit to Client Room (Active Client + Admin)
      io.to(userId).emit('receive_message', newMessage);
      
      // 3. Notify Admin Dashboard (to update list/notifications)
      io.to('admin_room').emit('refresh_chats', { userId, lastMessage: newMessage });

    } catch (error) {
      console.error('Socket Message Error:', error);
    }
  });

  socket.on('disconnect', () => {
    // Optional: Handle specific disconnect logic
  });
});

async function startServer() {
  server.listen(PORT, async () => {
    console.log(`📡 [Backend Express] Serveur démarré en mode ${process.env.NODE_ENV || 'development'} sur le port ${PORT}`);
    try {
      await connectDB();
      await seedData();
      console.log('✅ [Backend Express] Données initiales chargées dans MongoDB.');
    } catch (error) {
      console.error('❌ Erreur initialisation DB / seeding:', error.message);
    }
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ Port ${PORT} déjà actif, réutilisation du serveur backend en cours.`);
    } else {
      console.error('Erreur serveur Express:', err);
    }
  });
}

startServer();
