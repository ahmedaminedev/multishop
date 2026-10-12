const mongoose = require('mongoose');

const workScheduleIntervalSchema = new mongoose.Schema({
  jourDebut: {
    type: String,
    required: [true, 'Le jour de début est obligatoire'],
    enum: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
  },
  jourFin: {
    type: String,
    required: [true, 'Le jour de fin est obligatoire'],
    enum: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
  },
  heureDebut: {
    type: String,
    required: [true, "L'heure de début est obligatoire pour cet intervalle de jours"]
  },
  heureFin: {
    type: String,
    required: [true, "L'heure de fin est obligatoire pour cet intervalle de jours"]
  }
}, { _id: false });

const deliveryCompanySchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom de la société de livraison est requis'],
    trim: true
  },
  telephone: {
    type: String,
    trim: true,
    default: '+216 -- --- ---'
  },
  contact: {
    type: String,
    trim: true,
    default: 'Service Logistique'
  },
  zones: {
    type: String,
    trim: true,
    default: '24 Gouvernorats'
  },
  delaiMoyen: {
    type: String,
    trim: true,
    default: '24-48h'
  },
  tarifDefaut: {
    type: Number,
    default: 7
  },
  actif: {
    type: Boolean,
    default: true
  },
  horairesTravail: {
    type: [workScheduleIntervalSchema],
    default: []
  },
  joursTravailTexte: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DeliveryCompany', deliveryCompanySchema);
