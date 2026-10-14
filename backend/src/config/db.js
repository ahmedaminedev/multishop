
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/multishop";
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 4000
    });
    console.log(`✅ MongoDB Connecté: ${conn.connection.host} / Base: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ Erreur MongoDB: ${error.message}`);
    console.warn('⚠️ Le serveur tourne sans MongoDB. Vérifiez que MongoDB tourne sur 127.0.0.1:27017.');
    return null;
  }
};

module.exports = connectDB;
