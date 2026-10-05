const mongoose = require('mongoose');

const ProductSourceSchema = new mongoose.Schema({
  nom: { type: String, required: true, trim: true },
  lien: { type: String, required: true, trim: true },
  numero: { type: String, trim: true },
  localisation: { type: String, trim: true }, // Optionnel
  type_vente: { 
    type: String, 
    enum: ['engros', 'detail', 'les_deux'], 
    default: 'les_deux' 
  },
  notes: { type: String },
  dateCreation: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ProductSource', ProductSourceSchema);
