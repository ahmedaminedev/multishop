
const mongoose = require('mongoose');

const OffersConfigSchema = new mongoose.Schema({
  header: {
    title: { type: String, default: "Offres & Performance" },
    titleColor: { type: String, default: "#FFFFFF" },
    subtitle: { type: String, default: "Équipez-vous avec le meilleur matériel et la meilleure nutrition." },
    subtitleColor: { type: String, default: "#9ca3af" }
  },
  // Renamed from glowRoutine logically, but keeping key for data compatibility if preferred, or changing it for clarity. 
  // Let's change it for clarity as user allowed backend changes.
  performanceSection: {
    title: { type: String, default: "PERFORMANCE PACK" },
    titleColor: { type: String, default: "#FFFFFF" },
    subtitle: { type: String, default: "Level Up Your Game" },
    subtitleColor: { type: String, default: "#ccff00" }, // Neon
    buttonText: { type: String, default: "ACHETER LE PACK" },
    buttonColor: { type: String, default: "#ccff00" },
    buttonTextColor: { type: String, default: "#000000" },
    image: { type: String, default: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop" }
  },
  muscleBuilders: { // Was essentials
    title: { type: String, default: "MASS GAINERS" },
    titleColor: { type: String, default: "#FFFFFF" },
    subtitle: { type: String, default: "Les essentiels pour la prise de masse." },
    subtitleColor: { type: String, default: "#9ca3af" },
    buttonText: { type: String, default: "VOIR LA GAMME" },
    buttonColor: { type: String, default: "#FFFFFF" },
    buttonTextColor: { type: String, default: "#000000" },
    image: { type: String, default: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=1000&auto=format&fit=crop" }
  },
  dealOfTheDay: {
    productId: { type: Number, default: 1 }, 
    titleColor: { type: String, default: "#ccff00" },
    subtitleColor: { type: String, default: "#d1d5db" }
  },
  allOffersGrid: {
    title: { type: String, default: "Toutes les offres" },
    titleColor: { type: String, default: "#FFFFFF" },
    useManualSelection: { type: Boolean, default: false },
    manualProductIds: [{ type: Number }],
    limit: { type: Number, default: 12 }
  }
});

module.exports = mongoose.model('OffersConfig', OffersConfigSchema);
