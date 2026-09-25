
const mongoose = require('mongoose');

const OffersConfigSchema = new mongoose.Schema({
  header: {
    title: { type: String, default: "Offres & Privilèges" },
    titleColor: { type: String, default: "#111827" },
    subtitle: { type: String, default: "Découvrez notre sélection de produits de luxe à des prix exceptionnels." },
    subtitleColor: { type: String, default: "#6B7280" }
  },
  glowRoutine: {
    title: { type: String, default: "GLOW ROUTINE" },
    titleColor: { type: String, default: "#111827" },
    subtitle: { type: String, default: "Your 3-Step Corrective" },
    subtitleColor: { type: String, default: "#6B7280" },
    buttonText: { type: String, default: "Shop Now" },
    buttonColor: { type: String, default: "#111827" },
    buttonTextColor: { type: String, default: "#FFFFFF" },
    image: { type: String, default: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop" }
  },
  essentials: {
    title: { type: String, default: "NEW TO IT?" },
    titleColor: { type: String, default: "#111827" },
    subtitle: { type: String, default: "Here are the essentials you need." },
    subtitleColor: { type: String, default: "#4B5563" },
    buttonText: { type: String, default: "Start Here" },
    buttonColor: { type: String, default: "#111827" },
    buttonTextColor: { type: String, default: "#FFFFFF" },
    image: { type: String, default: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=1000&auto=format&fit=crop" }
  },
  dealOfTheDay: {
    productId: { type: Number, default: 1 }, // Default to product ID 1
    titleColor: { type: String, default: "#111827" },
    subtitleColor: { type: String, default: "#4B5563" }
  },
  allOffersGrid: {
    title: { type: String, default: "Toutes les offres" },
    titleColor: { type: String, default: "#111827" },
    useManualSelection: { type: Boolean, default: false },
    manualProductIds: [{ type: Number }],
    limit: { type: Number, default: 12 }
  }
});

module.exports = mongoose.model('OffersConfig', OffersConfigSchema);