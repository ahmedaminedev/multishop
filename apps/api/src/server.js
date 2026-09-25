const dotenv = require('dotenv');
dotenv.config();

const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 8080;

const server = http.createServer(app);

// Socket.io configuration
const io = new Server(server, {
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
    const { userId, sender, content, type } = data;
    const newMessage = {
      sender,
      content,
      type: type || 'text',
      timestamp: new Date(),
      read: false
    };
    io.to(userId).emit('receive_message', newMessage);
    io.to('admin_room').emit('refresh_chats', { userId, lastMessage: newMessage });
  });
});

async function start() {
  await connectDB();
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[MultiShop API] Serveur démarré sur http://0.0.0.0:${PORT}`);
  });
}

if (require.main === module) {
  start();
}

module.exports = { app, server, io };
