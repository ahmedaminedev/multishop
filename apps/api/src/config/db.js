const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (process.env.MONGODB_URI) {
    try {
      mongoose.set('bufferCommands', false); // Fail fast, don't hang
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 3000
      });
      isConnected = true;
      console.log(`[MultiShop API] MongoDB connecté: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.warn(`[MultiShop API] MongoDB non joignable (${error.message}). Utilisation du magasin de données mémoire ultra-rapide.`);
      isConnected = false;
    }
  } else {
    console.log('[MultiShop API] MONGODB_URI non configuré. Mode autonome en mémoire actif.');
  }
};

module.exports = {
  connectDB,
  isDbConnected: () => isConnected
};
