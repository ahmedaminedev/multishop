const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
  nom: { type: String, required: true, trim: true },
  localisation: { type: String, trim: true },
  lien: { type: String, trim: true },
  image: { type: String, trim: true },
  telephone: { type: String, trim: true },
  notes: { type: String },
  historique_achats: [{
    id: { type: String },
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['produit_existant', 'future_produit'], required: true },
    items: [{
      productId: Number,
      futureProductId: String,
      nom: String,
      quantite: { type: Number, required: true, min: 1 },
      prixAchat: Number,
      site: String,
      siteName: String,
      image: String,
      notes: String
    }],
    montantTotal: Number,
    notes: String
  }],
  dateCreation: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Supplier', SupplierSchema);
