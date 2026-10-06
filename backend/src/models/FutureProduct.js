const mongoose = require('mongoose');

const FutureProductSchema = new mongoose.Schema({
  nom: { type: String, required: true, trim: true },
  image: { type: String, trim: true },
  lien: { type: String, trim: true },
  prix_source: { type: Number, default: 0 },
  quantite_enstock: { type: Number, default: 0 },
  sourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductSource', required: true },
  sourceNom: { type: String, trim: true },
  site: { type: String, trim: true }, // 'fitnessshop' / 'youpi' / 'autre'
  is_futur_site: { type: Boolean, default: false },
  futur_site: { type: String, trim: true }, // Rempli si "site non existant" est coché
  categorie: { type: String, trim: true },
  statut: { 
    type: String, 
    enum: ['en_prospection', 'converti_en_stock', 'abandonne'], 
    default: 'en_prospection' 
  },
  notes: { type: String },
  dateCreation: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('FutureProduct', FutureProductSchema);
