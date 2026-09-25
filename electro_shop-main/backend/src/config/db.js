
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/electroshop");
    console.log(`MongoDB Connecté: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Erreur MongoDB: ${error.message}`);
    console.warn('Le serveur continue de tourner sans base de données. Certaines fonctionnalités échoueront.');
    // process.exit(1); // Do not exit to allow debugging of server connectivity
  }
};

module.exports = connectDB;
