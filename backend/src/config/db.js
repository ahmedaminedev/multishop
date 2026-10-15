
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    mongoose.set('bufferCommands', false); // Fail fast if offline, don't hang requests
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/multishop";
    const timeout = process.env.MONGO_TIMEOUT ? Number(process.env.MONGO_TIMEOUT) : 2500;
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: timeout
    });
    console.log(`✅ [MongoDB] Connecté avec succès: ${conn.connection.host} / Base: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ [MongoDB] Erreur de connexion: ${error.message}`);
    console.warn('⚠️ [MongoDB] Assurez-vous que MongoDB est bien lancé sur votre machine locale (127.0.0.1:27017).');
    return null;
  }
};

module.exports = connectDB;
