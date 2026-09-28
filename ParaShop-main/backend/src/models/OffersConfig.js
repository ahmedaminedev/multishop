
const mongoose = require('mongoose');

const OffersConfigSchema = new mongoose.Schema({
  header: {
    title: { type: String, default: "VOS CURES <span class='text-brand-primary italic'>PRIVILÈGES</span>" },
    titleColor: { type: String, default: "#111827" },
    subtitle: { type: String, default: "L'excellence de la phytothérapie et de la dermo-cosmétique au service de votre capital santé." },
    subtitleColor: { type: String, default: "#6b7280" }
  },
  performanceSection: {
    title: { type: String, default: "RITUEL <span class='text-brand-primary italic'>ÉCLAT BIO</span>" },
    titleColor: { type: String, default: "#111827" },
    subtitle: { type: String, default: "Une synergie d'actifs botaniques pour raviver la lumière de votre teint." },
    subtitleColor: { type: String, default: "#008b5e" },
    buttonText: { type: String, default: "DÉCOUVRIR LE RITUEL" },
    buttonColor: { type: String, default: "#008b5e" },
    buttonTextColor: { type: String, default: "#FFFFFF" },
    image: { type: String, default: "https://images.unsplash.com/photo-1570172619383-2ef40176191a?q=80&w=800&auto=format&fit=crop" }
  },
  muscleBuilders: {
    title: { type: String, default: "VITALITÉ <span class='text-brand-primary italic'>QUOTIDIENNE</span>" },
    titleColor: { type: String, default: "#111827" },
    subtitle: { type: String, default: "Renforcez vos défenses naturelles avec nos complexes de micronutrition certifiés." },
    subtitleColor: { type: String, default: "#6b7280" },
    buttonText: { type: String, default: "VOIR LES CURES" },
    buttonColor: { type: String, default: "#FFFFFF" },
    buttonTextColor: { type: String, default: "#111827" },
    image: { type: String, default: "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1000&auto=format&fit=crop" }
  },
  dealOfTheDay: {
    productId: { type: Number, default: 1 }, 
    titleColor: { type: String, default: "#008b5e" },
    subtitleColor: { type: String, default: "#9ca3af" }
  },
  allOffersGrid: {
    title: { type: String, default: "SÉLECTION <span class='text-brand-primary'>LABORATOIRE</span>" },
    titleColor: { type: String, default: "#111827" },
    useManualSelection: { type: Boolean, default: false },
    manualProductIds: [{ type: Number }],
    limit: { type: Number, default: 12 }
  }
});

module.exports = mongoose.model('OffersConfig', OffersConfigSchema);
