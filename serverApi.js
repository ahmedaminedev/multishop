import url from 'url';
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// In-memory data store per shop
export const storesData = {
  nutrition: null,
  youpi: null,
};

// Global in-memory chat sessions store per shop
export const chatSessionsStore = {
  nutrition: new Map(),
  youpi: new Map()
};

// Seed realistic client chat sessions for YoupiShop
chatSessionsStore.youpi.set('client_youpi_1', {
  _id: 'chat-youpi-1',
  userId: 'client_youpi_1',
  userName: 'Amira Ben Salem',
  userEmail: 'amira.bensalem@gmail.com',
  lastUpdated: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  messages: [
    { sender: 'client', content: 'Bonjour ! Auriez-vous un conseil pour un cadeau d\'anniversaire d\'une petite fille de 4 ans ?', type: 'text', timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), read: true },
    { sender: 'admin', content: 'Bonjour Amira ! 🧸 Pour 4 ans, nous vous recommandons vivement notre "Pack Éveil & Découverte" en bois ou la boîte de briques créatives. Les enfants adorent manipuler et inventer des histoires.', type: 'text', timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(), read: true },
    { sender: 'client', content: 'Super merci beaucoup ! Est-ce que l\'emballage cadeau est inclus ?', type: 'text', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), read: false }
  ]
});

chatSessionsStore.youpi.set('client_youpi_2', {
  _id: 'chat-youpi-2',
  userId: 'client_youpi_2',
  userName: 'Mehdi Trabelsi',
  userEmail: 'mehdi.trabelsi@yahoo.fr',
  lastUpdated: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  messages: [
    { sender: 'client', content: 'Bonjour, avez-vous en stock le pack briques de construction 850 pièces pour livraison à Sousse ?', type: 'text', timestamp: new Date(Date.now() - 1000 * 60 * 75).toISOString(), read: true },
    { sender: 'admin', content: 'Bonjour Mehdi ! Oui, tout à fait, nous en avons 25 unités en stock au dépôt central. Livraison express sous 24 à 48 heures ouvrées.', type: 'text', timestamp: new Date(Date.now() - 1000 * 60 * 65).toISOString(), read: true },
    { sender: 'client', content: 'Parfait, je passe commande de suite sur le site. Merci pour votre réactivité !', type: 'text', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), read: true }
  ]
});

export function recordChatMessage(shopKey, data) {
  const targetKey = chatSessionsStore[shopKey] ? shopKey : 'youpi';
  const sessions = chatSessionsStore[targetKey];
  const userId = String(data.userId || 'client_web');
  let session = sessions.get(userId);
  if (!session) {
    session = {
      _id: `chat-${userId}`,
      userId,
      userName: data.userName || (data.sender === 'admin' ? 'Support YoupiShop' : 'Client YoupiShop'),
      userEmail: data.userEmail || `${userId}@youpishop.tn`,
      lastUpdated: new Date().toISOString(),
      messages: []
    };
    sessions.set(userId, session);
  }
  const msg = {
    sender: data.sender === 'admin' ? 'admin' : 'client',
    content: String(data.content || ''),
    type: data.type || 'text',
    timestamp: new Date().toISOString(),
    read: data.sender === 'admin'
  };
  session.messages.push(msg);
  session.lastUpdated = new Date().toISOString();
  return { session, message: msg };
}

// Visibilité et disponibilité des boutiques (Gestion avancée Front-office / Back-office / Maintenance)
export let siteVisibilityData = {
  nutrition: { siteId: 'nutrition', is_hidden: false, scope: 'frontoffice', mode: 'cacher_tout', maintenance_message: '🏋️‍♂️ Fitness Shop est temporairement en maintenance technique pour réapprovisionnement.' },
  youpi: { siteId: 'youpi', is_hidden: false, scope: 'frontoffice', mode: 'cacher_tout', maintenance_message: '🧸 YoupiShop est en maintenance pour préparer de nouveaux jeux et jouets d\'éveil.' }
};

// Global Socket.IO instance for real-time live events across all shops
let ioInstance = null;
export function attachSocketIO(io) {
  ioInstance = io;
}

export function broadcastDataChanged(actionType, shopKey = 'all') {
  if (ioInstance) {
    try {
      const gStats = calculateGlobalStats();
      ioInstance.emit('multishop_data_changed', { type: actionType, shopKey, timestamp: Date.now() });
      ioInstance.emit('stats_updated', gStats);
      ioInstance.emit('site_visibility_changed', siteVisibilityData);
      // Emit real-time individual shop stats for each connected filial dashboard
      for (const k of Object.keys(storesData)) {
        const sStat = calculateShopStats(k);
        if (sStat) {
          ioInstance.emit(`shop_stats_updated_${k}`, sStat);
        }
      }
    } catch (err) {
      console.warn('Socket broadcast warning:', err);
    }
  }
}

export function calculateShopStats(shopKey) {
  const s = storesData[shopKey];
  if (!s) return null;

  const validOrders = (s.orders || []).filter(o => o.status !== 'Annulée' && o.status !== 'annulé');
  const revenue = validOrders.reduce((sum, o) => sum + (Number(o.total || o.totalAmount) || 0), 0);
  const ordersCount = (s.orders || []).length;
  const pendingOrdersCount = (s.orders || []).filter(o => ['En attente', 'en_attente', 'Expédiée', 'confirmé', 'Processing'].includes(o.status)).length;
  const deliveredOrdersCount = (s.orders || []).filter(o => ['Livrée', 'livré', 'Delivered'].includes(o.status)).length;
  const cancelledOrdersCount = (s.orders || []).filter(o => ['Annulée', 'annulé', 'Cancelled'].includes(o.status)).length;

  const products = s.products || [];
  const productsCount = products.length;
  const inShopCount = products.filter(p => p.existe_dans_boutique !== false).length;
  const outOfShopCount = productsCount - inShopCount;
  const lowStockCount = products.filter(p => (Number(p.quantité_enstock ?? p.quantity) || 0) <= 5).length;
  const outOfStockCount = products.filter(p => (Number(p.quantité_enstock ?? p.quantity) || 0) <= 0).length;
  const totalStockUnits = products.reduce((sum, p) => sum + (Number(p.quantité_enstock ?? p.quantity) || 0), 0);
  const catalogValue = products.reduce((sum, p) => sum + ((Number(p.price) || 0) * (Number(p.quantité_enstock ?? p.quantity) || 0)), 0);
  const averageOrderValue = validOrders.length > 0 ? Math.round((revenue / validOrders.length) * 10) / 10 : 0;

  const categoriesCount = (s.categories || []).length;
  const packsCount = (s.packs || []).length;
  const brandsCount = (s.brands || []).length;
  const messagesCount = (s.contactMessages || []).length;
  const unreadMessagesCount = (s.contactMessages || []).filter(m => !m.read).length;
  const storesCount = (s.stores || []).length;

  const isHidden = Boolean(siteVisibilityData[shopKey]?.is_hidden);
  const visibilityConfig = siteVisibilityData[shopKey] || { siteId: shopKey, is_hidden: false, scope: 'frontoffice', mode: 'cacher_tout' };

  return {
    key: shopKey,
    name: s.name,
    filialeType: s.filialeType,
    revenue,
    ordersCount,
    pendingOrdersCount,
    deliveredOrdersCount,
    cancelledOrdersCount,
    productsCount,
    inShopCount,
    outOfShopCount,
    lowStockCount,
    outOfStockCount,
    totalStockUnits,
    catalogValue,
    averageOrderValue,
    categoriesCount,
    packsCount,
    brandsCount,
    messagesCount,
    unreadMessagesCount,
    storesCount,
    isHidden,
    visibilityConfig
  };
}

export function calculateGlobalStats(options = {}) {
  const { includeHidden = false } = options;
  const filiales = {};

  let totalRevenueAll = 0;
  let totalOrdersAll = 0;
  let totalProductsAll = 0;
  let pendingOrdersAll = 0;
  let deliveredOrdersAll = 0;
  let totalCatalogValueAll = 0;
  let lowStockAll = 0;

  let totalRevenueVisible = 0;
  let totalOrdersVisible = 0;
  let totalProductsVisible = 0;
  let pendingOrdersVisible = 0;
  let deliveredOrdersVisible = 0;
  let totalCatalogValueVisible = 0;
  let lowStockVisible = 0;

  let visibleCount = 0;
  let hiddenCount = 0;

  for (const key of Object.keys(storesData)) {
    const fStats = calculateShopStats(key);
    if (!fStats) continue;
    filiales[key] = fStats;

    totalRevenueAll += fStats.revenue;
    totalOrdersAll += fStats.ordersCount;
    totalProductsAll += fStats.productsCount;
    pendingOrdersAll += fStats.pendingOrdersCount;
    deliveredOrdersAll += fStats.deliveredOrdersCount;
    totalCatalogValueAll += fStats.catalogValue;
    lowStockAll += fStats.lowStockCount;

    if (!fStats.isHidden) {
      visibleCount++;
      totalRevenueVisible += fStats.revenue;
      totalOrdersVisible += fStats.ordersCount;
      totalProductsVisible += fStats.productsCount;
      pendingOrdersVisible += fStats.pendingOrdersCount;
      deliveredOrdersVisible += fStats.deliveredOrdersCount;
      totalCatalogValueVisible += fStats.catalogValue;
      lowStockVisible += fStats.lowStockCount;
    } else {
      hiddenCount++;
    }
  }

  // Dynamic behavior: when sub-site is hidden, global totals reflect active sites
  const useVisible = !includeHidden;

  return {
    totalRevenue: useVisible ? totalRevenueVisible : totalRevenueAll,
    totalOrders: useVisible ? totalOrdersVisible : totalOrdersAll,
    totalProducts: useVisible ? totalProductsVisible : totalProductsAll,
    pendingOrders: useVisible ? pendingOrdersVisible : pendingOrdersAll,
    deliveredOrders: useVisible ? deliveredOrdersVisible : deliveredOrdersAll,
    catalogValue: useVisible ? totalCatalogValueVisible : totalCatalogValueAll,
    lowStock: useVisible ? lowStockVisible : lowStockAll,

    allTotals: {
      revenue: totalRevenueAll,
      orders: totalOrdersAll,
      products: totalProductsAll,
      pendingOrders: pendingOrdersAll,
      deliveredOrders: deliveredOrdersAll,
      catalogValue: totalCatalogValueAll,
      lowStock: lowStockAll
    },
    visibleTotals: {
      revenue: totalRevenueVisible,
      orders: totalOrdersVisible,
      products: totalProductsVisible,
      pendingOrders: pendingOrdersVisible,
      deliveredOrders: deliveredOrdersVisible,
      catalogValue: totalCatalogValueVisible,
      lowStock: lowStockVisible
    },
    sitesCount: Object.keys(filiales).length,
    activeSitesCount: visibleCount,
    hiddenSitesCount: hiddenCount,
    isAnySiteHidden: hiddenCount > 0,
    filiales,
    siteVisibility: siteVisibilityData,
    lastUpdated: new Date().toISOString()
  };
}

// Sourcing: Sources de prospection (Instagram, TikTok, Facebook, grossistes, etc.)
export let sourcesData = [
  {
    id: 'src-1',
    nom: 'Page Instagram @fitgear_tunisia',
    lien: 'https://instagram.com/fitgear_tunisia',
    numero: '+216 29 450 120',
    localisation: 'Sousse, Tunisie',
    type_vente: 'les_deux',
    notes: 'Importateur officiel accessoires haltérophilie et crossfit. Réponse rapide via Instagram DM ou WhatsApp.',
    dateCreation: '2026-01-10T10:00:00.000Z'
  },
  {
    id: 'src-2',
    nom: 'Fournisseur TikTok Trend @beauty_glow_paris',
    lien: 'https://tiktok.com/@beauty_glow_paris',
    numero: '+33 6 12 34 56 78',
    localisation: 'Paris / Rungis, France',
    type_vente: 'engros',
    notes: 'Grossiste soins exfoliants et sérums viraux peptides coréens. Vente par cartons de 50 pièces.',
    dateCreation: '2026-01-15T14:30:00.000Z'
  },
  {
    id: 'src-3',
    nom: 'Grossiste HighTech Rue d\'Athènes',
    lien: 'https://facebook.com/hightech.tunis',
    numero: '+216 71 330 890',
    localisation: 'Tunis Centre, Tunisie',
    type_vente: 'engros',
    notes: 'Distributeur direct accessoires smartphones, chargeurs GaN et petit électroménager connecté.',
    dateCreation: '2026-02-01T09:15:00.000Z'
  },
  {
    id: 'src-4',
    nom: 'Laboratoire Bio Santé Méditerranée',
    lien: 'https://biosante-maghreb.com',
    numero: '+216 73 550 200',
    localisation: 'Monastir, Tunisie',
    type_vente: 'detail',
    notes: 'Producteur huiles de nigelle, gels d\'aloe vera purs et compléments zinc & magnésium.',
    dateCreation: '2026-02-10T11:00:00.000Z'
  }
];

// Sourcing: Futurs Produits en cours de prospection
export let futureProductsData = [
  {
    id: 'fut-1',
    nom: 'Ceinture Haltérophilie Cuir Renforcé Pro 10mm',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600',
    lien: 'https://instagram.com/p/fitgear-belt',
    prix_source: 65,
    quantite: 20,
    quantite_enstock: 20,
    sourceId: 'src-1',
    sourceNom: 'Page Instagram @fitgear_tunisia',
    site: 'fitnessshop',
    is_futur_site: false,
    futur_site: '',
    categorie: 'Équipements & Accessoires',
    statut: 'en_prospection',
    notes: 'Très forte demande en salle de sport. Finition coutures doublées.',
    dateCreation: '2026-02-12T10:00:00.000Z'
  },
  {
    id: 'fut-2',
    nom: 'Jeu de Construction Circuit Billes en Bois Écologique',
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=600',
    lien: 'https://youpi-toys-maghreb.tn/circuit-billes',
    prix_source: 42,
    quantite: 20,
    quantite_enstock: 20,
    sourceId: 'src-1',
    sourceNom: 'Youpi Toys & Games Maghreb Import',
    site: 'youpi',
    is_futur_site: false,
    futur_site: '',
    categorie: 'Éveil & Bébé',
    statut: 'en_prospection',
    notes: 'Jouet éducatif d\'éveil en bois certifié FSC. Norme CE EN-71.',
    dateCreation: '2026-02-18T16:20:00.000Z'
  },
  {
    id: 'fut-5',
    nom: 'Monture Optique Titane Anti-Lumière Bleue Élite',
    image: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?q=80&w=600',
    lien: 'https://instagram.com/optic_trend_italy',
    prix_source: 55,
    quantite: 25,
    quantite_enstock: 25,
    sourceId: 'src-1',
    sourceNom: 'Page Instagram @fitgear_tunisia',
    site: 'autre',
    is_futur_site: true,
    futur_site: 'OpticShop',
    categorie: 'Lunettes & Montures',
    statut: 'en_prospection',
    notes: 'Produit dédié au futur projet de boutique OpticShop (pas encore déployée dans le réseau MultiShop).',
    dateCreation: '2026-02-26T14:00:00.000Z'
  }
];

// Fournisseurs pour historique d'achat et approvisionnement
export let suppliersData = [
  {
    id: 'frn-1',
    nom: 'Tunisie Fitness & Sport Distribution',
    localisation: 'Zone Industrielle Charguia 2, Tunis',
    lien: 'https://tunisie-fitness-distrib.com',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=300',
    telephone: '+216 71 800 900',
    notes: 'Fournisseur principal pour bancs de musculation, disques de fonte et charges lourdes.',
    dateCreation: '2026-01-05T08:00:00.000Z',
    historique_achats: [
      {
        id: 'ach-101',
        date: '2026-02-15',
        type: 'produit_existant',
        items: [
          { productId: 1, nom: 'Haltères Hexagonaux Pro - Paire 10kg', quantite: 20, prixAchat: 90, site: 'nutrition', siteName: 'Fitness Shop' }
        ],
        montantTotal: 1800,
        notes: 'Livraison express par camionnette palettes au dépôt central.'
      }
    ]
  },
  {
    id: 'frn-4',
    nom: 'Youpi Toys & Games Maghreb Import',
    localisation: 'Zone Portuaire Radès, Ben Arous',
    lien: 'https://youpi-toys-maghreb.tn',
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=300',
    telephone: '+216 71 444 777',
    notes: 'Importateur officiel de jouets éducatifs en bois, jeux de société et briques de construction avec certification normes européennes EN-71.',
    dateCreation: '2026-02-10T11:00:00.000Z',
    historique_achats: [
      {
        id: 'ach-104',
        date: '2026-03-01',
        type: 'produit_existant',
        items: [
          { productId: 401, nom: 'Pack Éveil Montessori en Bois Naturel', quantite: 30, prixAchat: 55, site: 'youpi', siteName: 'YoupiShop' },
          { productId: 402, nom: 'Boîte de Construction Briques Créatives 850 pcs', quantite: 25, prixAchat: 85, site: 'youpi', siteName: 'YoupiShop' }
        ],
        montantTotal: 3775,
        notes: 'Arrivage conteneur dédouané, emballage soigné conforme CE.'
      }
    ]
  }
];

let activeShop = 'nutrition';

export const FILIALE_MAP = {
  nutrition: {
    key: 'nutrition',
    folder: 'templates/nutrition',
    legacyFolder: 'NutritionShop-main',
    name: 'Fitness Shop',
    filialeType: 'produit_myshops_nutrition',
    accentColor: '#84cc16',
    badge: 'Fitness & Muscu'
  },
  youpi: {
    key: 'youpi',
    folder: 'templates/youpi',
    legacyFolder: 'youpi_shop-main',
    name: 'YoupiShop',
    filialeType: 'produit_myshops_youpi',
    accentColor: '#f59e0b',
    badge: 'Jeux & Jouets d\'enfant'
  }
};

function enrichProductWithFiliale(product, filialeKey) {
  const p = { ...product };
  const filiale = FILIALE_MAP[filialeKey] || FILIALE_MAP.nutrition;
  p.filialeType = filiale.filialeType;
  p.filialeName = filiale.name;
  p.filialeKey = filialeKey;
  p.codeArticleFiliale = p.codeArticleFiliale || `${filiale.filialeType.toUpperCase()}-${p.id}`;
  if (product.fournisseurId) p.fournisseurId = product.fournisseurId;
  if (product.fournisseurNom) p.fournisseurNom = product.fournisseurNom;

  if (filialeKey === 'nutrition') {
    p.poidsKg = p.poidsKg || (p.name.includes('2x10kg') ? 20 : p.name.includes('50kg') ? 50 : p.name.includes('2.2') ? 2.2 : 1.0);
    p.garantieMois = p.garantieMois || (p.price > 500 ? 36 : p.price > 150 ? 24 : 12);
    p.chargeMaxKg = p.chargeMaxKg || (p.name.includes('Rack') ? 600 : p.name.includes('Banc') ? 450 : undefined);
    p.matiere = p.matiere || (p.name.includes('Haltère') ? 'Caoutchouc & Fonte' : p.name.includes('Rack') ? 'Acier Carbone 75x75mm' : undefined);
    p.goutSaveur = p.goutSaveur || (p.name.includes('Whey') ? 'Chocolat Belge' : p.name.includes('Créatine') ? 'Neutre' : undefined);
    p.objectifSportif = p.objectifSportif || (p.name.includes('Tapis') ? 'Endurance Cardio & Brûle-graisses' : 'Force & Hypertrophie Musculaire');
  } else if (filialeKey === 'youpi') {
    p.trancheAge = p.trancheAge || '3 - 8 ans';
    p.materiauPrincipal = p.materiauPrincipal || 'Bois naturel certifié FSC & Plastique sans BPA';
    p.normeSecurite = p.normeSecurite || 'Conforme normes CE & EN-71';
    p.nbJoueurs = p.nbJoueurs || '1 à 4 joueurs';
    p.pilesRequises = p.pilesRequises !== undefined ? p.pilesRequises : false;
  }

  p.existe_dans_boutique = product.existe_dans_boutique !== undefined ? Boolean(product.existe_dans_boutique) : true;
  p.quantité_enstock = product.quantité_enstock !== undefined ? Number(product.quantité_enstock) : (Number(product.quantity) || 15);
  p.quantity = p.quantité_enstock;

  return p;
}

export async function initStores() {
  for (const [key, cfg] of Object.entries(FILIALE_MAP)) {
    try {
      // The authoritative database is strictly located in backend/src/data/
      const p = path.resolve(process.cwd(), 'backend/src/data', `initialData_${key}.js`);
      const data = require(p);
      const rawProducts = Array.isArray(data.allProducts) ? JSON.parse(JSON.stringify(data.allProducts)) : [];
      const defaultSupplier = key === 'nutrition' 
        ? { id: 'frn-1', nom: 'Tunisie Fitness & Sport Distribution' }
        : { id: 'frn-4', nom: 'Youpi Toys & Games Maghreb Import' };

      const products = rawProducts.map((prod, i) => {
        const withSupplier = {
          ...prod,
          fournisseurId: prod.fournisseurId || (i % 3 !== 2 ? defaultSupplier.id : undefined),
          fournisseurNom: prod.fournisseurNom || (i % 3 !== 2 ? defaultSupplier.nom : undefined)
        };
        return enrichProductWithFiliale(withSupplier, key);
      });
      const categories = Array.isArray(data.categories) ? JSON.parse(JSON.stringify(data.categories)) : [];
      const packs = Array.isArray(data.packs) ? JSON.parse(JSON.stringify(data.packs)) : [];
      const stores = Array.isArray(data.stores) ? JSON.parse(JSON.stringify(data.stores)) : [];
      const advertisements = data.initialAdvertisements ? JSON.parse(JSON.stringify(data.initialAdvertisements)) : {};
      const promotions = Array.isArray(data.promotions) ? JSON.parse(JSON.stringify(data.promotions)) : [];
      const rawOrders = Array.isArray(data.sampleOrders) ? JSON.parse(JSON.stringify(data.sampleOrders)) : [];
      const orders = rawOrders.map(o => ({ ...o, filialeKey: key, filialeName: cfg.name }));
      const blogPosts = Array.isArray(data.blogPosts) ? JSON.parse(JSON.stringify(data.blogPosts)) : [];
      const contactMessages = Array.isArray(data.contactMessages) ? JSON.parse(JSON.stringify(data.contactMessages)) : [];
      const brands = [...new Set(products.map(pr => pr.brand).filter(Boolean))].map((name, i) => ({ id: i + 1, name }));

      if (key === 'nutrition' && !advertisements.logoConfig) {
        advertisements.logoConfig = {
          logoUrl: '',
          navbarHeight: 42,
          footerHeight: 48,
          textPrimary: 'FITNESS',
          textSecondary: 'SHOP',
          tagline: 'ELITE FITNESS EQUIPMENT'
        };
      }

      storesData[key] = {
        key,
        name: cfg.name,
        filialeType: cfg.filialeType,
        products,
        categories,
        packs,
        stores,
        advertisements,
        promotions,
        orders,
        blogPosts,
        contactMessages,
        brands,
        offersConfig: {
          header: {
            title: `Offres Spéciales <span class="text-brand-primary">${cfg.name}</span>`,
            subtitle: `Découvrez toutes nos offres privilèges et promotions exclusives chez ${cfg.name}.`
          },
          performanceSection: {
            title: `Sélection <span class="text-brand-primary">Excellence</span>`,
            subtitle: "Une formule ciblée pour des résultats performants et immédiats.",
            buttonText: "DÉCOUVRIR L'OFFRE",
            image: products[0]?.imageUrl || "https://images.unsplash.com/photo-1570172619383-2ef40176191a?q=80&w=1200&auto=format&fit=crop",
            link: "#"
          },
          muscleBuilders: {
            title: `Cures & <span class="text-brand-primary">Packs Essentiels</span>`,
            subtitle: "Équilibrez vos besoins au quotidien avec notre sélection best-seller.",
            buttonText: "VOIR LE PACK",
            image: products[1]?.imageUrl || "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200&auto=format&fit=crop",
            link: "#"
          },
          glowRoutine: {
            title: `Routine <span class="text-rose-600">Éclat</span>`,
            subtitle: "L'harmonie parfaite pour sublimer votre beauté.",
            buttonText: "DÉCOUVRIR LE RITUEL",
            image: products[0]?.imageUrl || "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1200&auto=format&fit=crop",
            link: "#"
          },
          essentials: {
            title: `Les <span class="text-rose-600">Indispensables</span>`,
            subtitle: "Nos coups de cœur plébiscités par nos clients.",
            buttonText: "VOIR LA SÉLECTION",
            image: products[1]?.imageUrl || "https://images.unsplash.com/photo-1596462502278-27bfdd403cc2?q=80&w=1200&auto=format&fit=crop",
            link: "#"
          },
          dealOfTheDay: {
            productId: products[0]?.id || 1,
            titleColor: "#000000",
            subtitleColor: "#64748b"
          },
          allOffersGrid: {
            title: "Toutes les Promotions",
            useManualSelection: false,
            manualProductIds: [],
            limit: 12
          },
          bannerText: `Offre Spéciale ${cfg.name} : Livraison offerte dès 100 DT d'achats !`,
          promoDiscount: 10,
          isActive: true
        },
        reviews: [
          { _id: `rev-${key}-1`, userId: 'usr-1', userName: 'Yasmine B.', targetId: products[0]?.id || 1, targetType: 'product', rating: 5, comment: `Excellent produit ${cfg.name}, qualité au top !`, date: '2024-03-15' },
          { _id: `rev-${key}-2`, userId: 'usr-2', userName: 'Karim M.', targetId: products[1]?.id || 2, targetType: 'product', rating: 4, comment: 'Livraison express et service client très réactif.', date: '2024-03-18' }
        ]
      };
    } catch (err) {
      console.error(`Error loading store ${key}:`, err);
    }
  }
}

// In-memory users - Global SSO for MultiShop (MongoDB compatible user model)
const users = [
  {
    _id: 'usr-admin-1',
    id: 1,
    firstName: 'Super',
    lastName: 'Admin',
    email: 'admin@multishop.com',
    role: 'ADMIN',
    phone: '+216 71 000 000',
    addresses: [{ type: 'Siège MultiShop', street: 'Les Berges du Lac 2', city: 'Tunis', postalCode: '1053', isDefault: true }]
  },
  {
    _id: 'usr-client-1',
    id: 2,
    firstName: 'Ahmed',
    lastName: 'Ben Ali',
    email: 'client@multishop.com',
    role: 'CUSTOMER',
    phone: '+216 98 123 456',
    addresses: [{ type: 'Domicile', street: '12 Avenue Habib Bourguiba', city: 'Tunis', postalCode: '1001', isDefault: true }]
  }
];

// Active sessions mapping: token -> user
const sessions = new Map();
// Pre-register standard dev tokens for convenience
sessions.set('jwt-admin-token-super', users[0]);
sessions.set('jwt-client-token-default', users[1]);

function parseCookies(cookieHeader) {
  const list = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach(cookie => {
    let [name, ...rest] = cookie.split('=');
    name = name?.trim();
    if (!name) return;
    const value = rest.join('=').trim();
    list[name] = decodeURIComponent(value);
  });
  return list;
}

// Dynamically extracts the authenticated user from the Authorization header or cookies
function getAuthenticatedUser(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const cookies = parseCookies(req.headers.cookie);
  let token = null;

  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (cookies.token) {
    token = cookies.token;
  } else if (cookies.accessToken) {
    token = cookies.accessToken;
  }

  if (!token || token === 'null' || token === 'undefined') {
    return null;
  }

  if (sessions.has(token)) {
    return sessions.get(token);
  }

  // Check if token indicates a known user
  if (token.includes('admin')) {
    const adminUser = users.find(u => u.role === 'ADMIN') || users[0];
    sessions.set(token, adminUser);
    return adminUser;
  }
  if (token.includes('client')) {
    const clientUser = users.find(u => u.role === 'CUSTOMER') || users[1];
    sessions.set(token, clientUser);
    return clientUser;
  }

  return null;
}

export function handleApiRequest(req, res, next) {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname || '';

  if (!pathname.startsWith('/api')) {
    return next();
  }

  const endpoint = pathname.replace(/^\/api/, '');
  const cookies = parseCookies(req.headers.cookie);
  const shopKey = req.headers['x-shop-id'] || parsedUrl.query.shop || cookies.shop || activeShop || 'nutrition';
  const shop = storesData[shopKey] || storesData.nutrition || storesData.youpi;

  // Set permissive CORS headers for iframe & preview environments
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Shop-Id, x-shop-id, Accept');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  const sendJson = (statusCode, data) => {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };

  const getBody = () => new Promise((resolve) => {
    if (req.body) return resolve(req.body);
    let raw = '';
    req.on('data', chunk => { raw += chunk; });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
  });

  (async () => {
    try {
      // --- GESTION DE VISIBILITÉ DES SITES & MAINTENANCE ---
      if ((endpoint === '/site-visibility' || endpoint === '/global/site-visibility') && req.method === 'GET') {
        return sendJson(200, siteVisibilityData);
      }
      if ((endpoint === '/site-visibility' || endpoint === '/global/site-visibility') && req.method === 'POST') {
        const body = await getBody();
        if (body && typeof body === 'object') {
          siteVisibilityData = { ...siteVisibilityData, ...body };
          broadcastDataChanged('visibility_changed', 'all');
        }
        return sendJson(200, siteVisibilityData);
      }
      if ((endpoint.startsWith('/site-visibility/') || endpoint.startsWith('/global/site-visibility/')) && req.method === 'PUT') {
        const siteKey = endpoint.split('/').pop();
        const body = await getBody();
        if (siteVisibilityData[siteKey]) {
          siteVisibilityData[siteKey] = { ...siteVisibilityData[siteKey], ...body };
          broadcastDataChanged('visibility_changed', siteKey);
          return sendJson(200, siteVisibilityData[siteKey]);
        }
        return sendJson(404, { message: 'Site introuvable' });
      }

      // --- STATISTIQUES EN TEMPS RÉEL (100% ISSUES DE LA BASE DE DONNÉES) ---
      if (endpoint === '/global/stats' && req.method === 'GET') {
        const includeHidden = parsedUrl.query.includeHidden === 'true';
        const stats = calculateGlobalStats({ includeHidden });
        return sendJson(200, stats);
      }

      if ((endpoint === '/stats' || endpoint === '/admin/stats') && req.method === 'GET') {
        const targetShopKey = parsedUrl.query.shop || shopKey || 'nutrition';
        const sStats = calculateShopStats(targetShopKey);
        if (sStats) return sendJson(200, sStats);
        return sendJson(404, { message: 'Boutique introuvable' });
      }

      if (endpoint === '/global/products' && req.method === 'GET') {
        let allProds = [];
        for (const [k, s] of Object.entries(storesData)) {
          if (s && s.products) {
            allProds.push(...s.products);
          }
        }

        const filialeFilter = parsedUrl.query.filiale;
        const typeFilter = parsedUrl.query.type;
        const searchFilter = parsedUrl.query.search?.toLowerCase();

        if (filialeFilter && filialeFilter !== 'all') {
          allProds = allProds.filter(p => p.filialeKey === filialeFilter);
        }
        if (typeFilter && typeFilter !== 'all') {
          allProds = allProds.filter(p => p.filialeType === typeFilter);
        }
        if (searchFilter) {
          allProds = allProds.filter(p => 
            p.name?.toLowerCase().includes(searchFilter) ||
            p.brand?.toLowerCase().includes(searchFilter) ||
            p.category?.toLowerCase().includes(searchFilter)
          );
        }

        return sendJson(200, allProds);
      }

      if (endpoint === '/global/products' && req.method === 'POST') {
        const body = await getBody();
        const filialeKey = body.filialeKey || 'nutrition';
        const targetStore = storesData[filialeKey] || storesData.nutrition;
        const newId = body.id || (Date.now() + Math.floor(Math.random() * 1000));
        const newProduct = enrichProductWithFiliale({
          id: newId,
          ...body,
          quantité_enstock: body.quantité_enstock !== undefined ? Number(body.quantité_enstock) : (Number(body.quantity) || 10),
          quantity: body.quantité_enstock !== undefined ? Number(body.quantité_enstock) : (Number(body.quantity) || 10),
          existe_dans_boutique: body.existe_dans_boutique !== undefined ? Boolean(body.existe_dans_boutique) : true,
          fournisseurId: body.fournisseurId || '',
          fournisseurNom: body.fournisseurNom || '',
          images: body.images?.length ? body.images : [body.imageUrl || 'https://picsum.photos/400/400'],
          filialeKey
        }, filialeKey);
        targetStore.products.unshift(newProduct);
        broadcastDataChanged('product_created', filialeKey);
        return sendJson(201, newProduct);
      }

      if (endpoint.startsWith('/global/products/') && req.method === 'PUT') {
        const prodId = parseInt(endpoint.replace('/global/products/', ''), 10);
        const body = await getBody();
        for (const s of Object.values(storesData)) {
          if (!s || !s.products) continue;
          const idx = s.products.findIndex(p => p.id === prodId);
          if (idx !== -1) {
            if (body.quantité_enstock !== undefined) {
              body.quantity = Number(body.quantité_enstock);
            } else if (body.quantity !== undefined) {
              body.quantité_enstock = Number(body.quantity);
            }
            if (body.existe_dans_boutique !== undefined) {
              body.existe_dans_boutique = Boolean(body.existe_dans_boutique);
            }
            if (body.fournisseurId !== undefined) {
              body.fournisseurId = body.fournisseurId;
            }
            if (body.fournisseurNom !== undefined) {
              body.fournisseurNom = body.fournisseurNom;
            }
            s.products[idx] = enrichProductWithFiliale({ ...s.products[idx], ...body }, s.key);
            broadcastDataChanged('product_updated', s.key);
            return sendJson(200, s.products[idx]);
          }
        }
        return sendJson(404, { message: 'Produit introuvable' });
      }

      if (endpoint.startsWith('/global/products/') && req.method === 'DELETE') {
        const prodId = parseInt(endpoint.replace('/global/products/', ''), 10);
        for (const s of Object.values(storesData)) {
          if (!s || !s.products) continue;
          const idx = s.products.findIndex(p => p.id === prodId);
          if (idx !== -1) {
            s.products.splice(idx, 1);
            broadcastDataChanged('product_deleted', s.key);
            return sendJson(200, { success: true, message: 'Produit supprimé avec succès' });
          }
        }
        return sendJson(404, { message: 'Produit introuvable' });
      }

      // --- SOURCING: SOURCES DE VEILLE (Instagram, TikTok, Grossiste, etc.) ---
      if (endpoint === '/sources' && req.method === 'GET') {
        return sendJson(200, sourcesData);
      }
      if (endpoint === '/sources' && req.method === 'POST') {
        const body = await getBody();
        if (!body.nom || !body.lien) {
          return sendJson(400, { error: 'Validation Error', message: 'Nom et lien de la source requis.' });
        }
        const newSource = {
          id: `src-${Date.now()}`,
          nom: String(body.nom).trim(),
          lien: String(body.lien).trim(),
          numero: body.numero ? String(body.numero).trim() : '',
          localisation: body.localisation ? String(body.localisation).trim() : '',
          type_vente: ['engros', 'detail', 'les_deux'].includes(body.type_vente) ? body.type_vente : 'les_deux',
          notes: body.notes ? String(body.notes).trim() : '',
          dateCreation: new Date().toISOString()
        };
        sourcesData.unshift(newSource);
        broadcastDataChanged('source_created', 'all');
        return sendJson(201, newSource);
      }
      if (endpoint.startsWith('/sources/') && req.method === 'PUT') {
        const sId = endpoint.replace('/sources/', '');
        const body = await getBody();
        const idx = sourcesData.findIndex(s => s.id === sId);
        if (idx !== -1) {
          sourcesData[idx] = { ...sourcesData[idx], ...body };
          broadcastDataChanged('source_updated', 'all');
          return sendJson(200, sourcesData[idx]);
        }
        return sendJson(404, { message: 'Source introuvable' });
      }
      if (endpoint.startsWith('/sources/') && req.method === 'DELETE') {
        const sId = endpoint.replace('/sources/', '');
        sourcesData = sourcesData.filter(s => s.id !== sId);
        broadcastDataChanged('source_deleted', 'all');
        return sendJson(200, { success: true, message: 'Source supprimée' });
      }

      // --- SOURCING: FUTURS PRODUITS (PROSPECTION) ---
      if (endpoint === '/future-products' && req.method === 'GET') {
        return sendJson(200, futureProductsData);
      }
      if (endpoint === '/future-products' && req.method === 'POST') {
        const body = await getBody();
        if (!body.nom) {
          return sendJson(400, { error: 'Validation Error', message: 'Nom du futur produit requis.' });
        }
        if (!body.sourceId) {
          return sendJson(400, { error: 'Validation Error', message: 'Une source existante doit obligatoirement être affectée.' });
        }
        const matchedSource = sourcesData.find(s => s.id === body.sourceId);
        const sourceNom = body.sourceNom || matchedSource?.nom || 'Source Partenaire';
        const targetQty = Number(body.quantite) || Number(body.quantite_enstock) || 10;
        const newFutureProd = {
          id: `fut-${Date.now()}`,
          nom: String(body.nom).trim(),
          image: body.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600',
          lien: body.lien || matchedSource?.lien || '',
          prix_source: Number(body.prix_source) || 0,
          quantite: targetQty,
          quantite_enstock: targetQty,
          sourceId: body.sourceId,
          sourceNom,
          site: body.site || 'fitnessshop',
          is_futur_site: Boolean(body.is_futur_site),
          futur_site: body.futur_site ? String(body.futur_site).trim() : '',
          categorie: body.categorie ? String(body.categorie).trim() : 'Général',
          statut: 'en_prospection',
          notes: body.notes || '',
          dateCreation: new Date().toISOString()
        };
        futureProductsData.unshift(newFutureProd);
        broadcastDataChanged('future_product_created', 'all');
        return sendJson(201, newFutureProd);
      }
      if (endpoint.startsWith('/future-products/') && req.method === 'PUT') {
        const fId = endpoint.replace('/future-products/', '');
        const body = await getBody();
        const idx = futureProductsData.findIndex(f => f.id === fId);
        if (idx !== -1) {
          futureProductsData[idx] = { ...futureProductsData[idx], ...body };
          broadcastDataChanged('future_product_updated', 'all');
          return sendJson(200, futureProductsData[idx]);
        }
        return sendJson(404, { message: 'Futur produit introuvable' });
      }
      if (endpoint.startsWith('/future-products/') && req.method === 'DELETE') {
        const fId = endpoint.replace('/future-products/', '');
        futureProductsData = futureProductsData.filter(f => f.id !== fId);
        broadcastDataChanged('future_product_deleted', 'all');
        return sendJson(200, { success: true, message: 'Futur produit supprimé' });
      }

      // --- FOURNISSEURS & APPROVISIONNEMENT ---
      const processRestockPayload = (supplier, payload) => {
        const type = payload.type; // 'produit_existant' | 'future_produit'
        const items = Array.isArray(payload.items) ? payload.items : [];

        if (items.length === 0) {
          return { error: 'Validation Error', message: 'Veuillez sélectionner au moins un article avec sa quantité.' };
        }

        const validFilialeKeys = ['nutrition', 'youpi'];
        const mapToFilialeKey = (siteStr) => {
          if (!siteStr) return null;
          const s = String(siteStr).toLowerCase();
          if (s === 'nutrition' || s === 'fitnessshop') return 'nutrition';
          if (s === 'youpi' || s === 'youpishop') return 'youpi';
          return null;
        };

        if (type === 'produit_existant') {
          const recordedItems = [];
          let totalMontant = 0;

          for (const itm of items) {
            const qty = Number(itm.quantite) || 0;
            if (qty <= 0) continue;
            let foundProd = null;
            let targetShopKey = null;

            for (const [k, s] of Object.entries(storesData)) {
              if (!s || !s.products) continue;
              const p = s.products.find(prod => prod.id === Number(itm.id || itm.productId));
              if (p) {
                foundProd = p;
                targetShopKey = k;
                break;
              }
            }

            if (foundProd) {
              foundProd.quantité_enstock = (Number(foundProd.quantité_enstock) || 0) + qty;
              foundProd.quantity = foundProd.quantité_enstock;
              const prixAchat = Number(itm.prixAchat) || Math.round((foundProd.price || 50) * 0.6);
              totalMontant += prixAchat * qty;

              recordedItems.push({
                productId: foundProd.id,
                nom: foundProd.name,
                quantite: qty,
                prixAchat,
                site: targetShopKey,
                siteName: storesData[targetShopKey]?.name || targetShopKey,
                image: foundProd.imageUrl
              });
            }
          }

          const receptionRecord = {
            id: `ach-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            type: 'produit_existant',
            items: recordedItems,
            montantTotal: totalMontant,
            notes: payload.notes || 'Réapprovisionnement de produits existants en stock'
          };
          supplier.historique_achats.unshift(receptionRecord);
          broadcastDataChanged('stock_restocked', 'all');

          return {
            success: true,
            message: `Réapprovisionnement enregistré avec succès ! ${recordedItems.length} référence(s) augmentée(s) en stock.`,
            reception: receptionRecord
          };
        } else if (type === 'future_produit') {
          // VÉRIFICATION DU SITE INEXISTANT DEMANDÉE PAR L'UTILISATEUR:
          const invalidItems = [];
          for (const itm of items) {
            const fp = futureProductsData.find(f => f.id === String(itm.id || itm.futureProductId));
            if (!fp) continue;
            const mappedKey = mapToFilialeKey(fp.site);
            if (fp.is_futur_site || fp.futur_site || !mappedKey || !validFilialeKeys.includes(mappedKey)) {
              invalidItems.push(fp.futur_site || fp.site || 'Site Inconnu');
            }
          }

          if (invalidItems.length > 0) {
            const uniqueBadSites = [...new Set(invalidItems)].join(', ');
            return {
              error: 'Site inexistant',
              message: `Le site "${uniqueBadSites}" n'existe pas dans le réseau actuel (PharmaShop, FitnessShop, CosmeticsShop, ElectroShop). Vous ne pouvez pas affecter ces produits en stock tant que le site n'existe pas.`
            };
          }

          // Tous les futurs produits sont sur des sites existants et déployés !
          const recordedItems = [];
          let totalMontant = 0;

          for (const itm of items) {
            const qty = Number(itm.quantite) || 0;
            if (qty <= 0) continue;
            const fp = futureProductsData.find(f => f.id === String(itm.id || itm.futureProductId));
            if (!fp) continue;
            const mappedKey = mapToFilialeKey(fp.site);
            const targetStore = storesData[mappedKey];
            if (!targetStore) continue;

            const prixAchat = Number(itm.prixAchat) || Number(fp.prix_source) || 50;
            const prixVenteSuggere = Math.round(prixAchat * 1.4);
            const oldPriceSuggere = Math.round(prixAchat * 1.7);

            const newProdId = Date.now() + Math.floor(Math.random() * 1000);
            const newProduct = enrichProductWithFiliale({
              id: newProdId,
              name: fp.nom,
              brand: fp.sourceNom || supplier.nom || 'Sourcing Import',
              price: prixVenteSuggere,
              oldPrice: oldPriceSuggere,
              imageUrl: fp.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600',
              images: [fp.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600'],
              category: fp.categorie || 'Nouveautés',
              description: `Produit approvisionné via ${supplier.nom}. Provenance de veille : ${fp.sourceNom}. Prix d'achat source : ${prixAchat} DT. Lien : ${fp.lien || 'N/A'}.`,
              quantité_enstock: qty,
              quantity: qty,
              existe_dans_boutique: false, // PAR DÉFAUT : HORS BOUTIQUE (en stock uniquement) !
              filialeKey: mappedKey
            }, mappedKey);

            targetStore.products.unshift(newProduct);
            fp.statut = 'converti_en_stock';

            totalMontant += prixAchat * qty;
            recordedItems.push({
              productId: newProdId,
              futureProductId: fp.id,
              nom: fp.nom,
              quantite: qty,
              prixAchat,
              site: mappedKey,
              siteName: targetStore.name,
              image: fp.image
            });
          }

          const receptionRecord = {
            id: `ach-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            type: 'future_produit',
            items: recordedItems,
            montantTotal: totalMontant,
            notes: payload.notes || 'Entrée en stock de futurs produits prospectés (statut Hors Boutique par défaut)'
          };
          supplier.historique_achats.unshift(receptionRecord);
          broadcastDataChanged('stock_restocked', 'all');

          return {
            success: true,
            message: `${recordedItems.length} futur(s) produit(s) intégré(s) en stock avec succès ! Ils sont enregistrés 'Hors boutique' par défaut afin que vous puissiez réviser leurs fiches et cocher 'En boutique' pour les publier.`,
            reception: receptionRecord
          };
        }

        return { error: 'Type invalide', message: 'Le type d\'affectation doit être "produit_existant" ou "future_produit".' };
      };

      if (endpoint === '/suppliers' && req.method === 'GET') {
        return sendJson(200, suppliersData);
      }
      if (endpoint === '/suppliers' && req.method === 'POST') {
        const body = await getBody();
        if (!body.nom) {
          return sendJson(400, { error: 'Validation Error', message: 'Nom du fournisseur requis.' });
        }
        const newSupplier = {
          id: `frn-${Date.now()}`,
          nom: String(body.nom).trim(),
          localisation: body.localisation ? String(body.localisation).trim() : '',
          lien: body.lien ? String(body.lien).trim() : '',
          image: body.image || 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=300',
          telephone: body.telephone ? String(body.telephone).trim() : '',
          notes: body.notes || '',
          historique_achats: [],
          dateCreation: new Date().toISOString()
        };

        // Si une affectation immédiate de stock est fournie lors de l'ajout fournisseur:
        if (body.reception && Array.isArray(body.reception.items) && body.reception.items.length > 0) {
          const restockRes = processRestockPayload(newSupplier, body.reception);
          if (restockRes.error) {
            return sendJson(400, restockRes);
          }
          suppliersData.unshift(newSupplier);
          broadcastDataChanged('supplier_created', 'all');
          return sendJson(201, { ...newSupplier, receptionMessage: restockRes.message });
        }

        suppliersData.unshift(newSupplier);
        broadcastDataChanged('supplier_created', 'all');
        return sendJson(201, newSupplier);
      }
      if (endpoint.startsWith('/suppliers/') && endpoint.endsWith('/receptions') && req.method === 'POST') {
        const supplierId = endpoint.split('/')[2];
        const supplier = suppliersData.find(s => s.id === supplierId);
        if (!supplier) {
          return sendJson(404, { message: 'Fournisseur introuvable' });
        }
        const body = await getBody();
        const result = processRestockPayload(supplier, body);
        if (result.error) {
          return sendJson(400, result);
        }
        return sendJson(200, result);
      }
      if (endpoint.startsWith('/suppliers/') && req.method === 'PUT') {
        const sId = endpoint.replace('/suppliers/', '');
        const body = await getBody();
        const idx = suppliersData.findIndex(s => s.id === sId);
        if (idx !== -1) {
          suppliersData[idx] = { ...suppliersData[idx], ...body };
          broadcastDataChanged('supplier_updated', 'all');
          return sendJson(200, suppliersData[idx]);
        }
        return sendJson(404, { message: 'Fournisseur introuvable' });
      }
      if (endpoint.startsWith('/suppliers/') && req.method === 'DELETE') {
        const sId = endpoint.replace('/suppliers/', '');
        suppliersData = suppliersData.filter(s => s.id !== sId);
        broadcastDataChanged('supplier_deleted', 'all');
        return sendJson(200, { success: true, message: 'Fournisseur supprimé' });
      }


      if (endpoint === '/global/orders' && req.method === 'GET') {
        const authUser = getAuthenticatedUser(req);
        if (!authUser || (authUser.role !== 'ADMIN' && authUser.role !== 'SUPER_ADMIN')) {
          return sendJson(403, { error: 'Forbidden', message: 'Accès interdit. Droits administrateur requis pour consulter les commandes du groupe.' });
        }

        let allOrders = [];
        for (const [k, s] of Object.entries(storesData)) {
          if (s && s.orders) {
            allOrders.push(...s.orders);
          }
        }
        allOrders.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
        return sendJson(200, allOrders);
      }

      if (endpoint.startsWith('/global/orders/') && req.method === 'PUT') {
        const orderId = endpoint.replace('/global/orders/', '');
        const body = await getBody();
        for (const s of Object.values(storesData)) {
          if (!s || !s.orders) continue;
          const idx = s.orders.findIndex(o => o.id === orderId);
          if (idx !== -1) {
            s.orders[idx] = { ...s.orders[idx], ...body };
            broadcastDataChanged('order_updated', s.key);
            return sendJson(200, s.orders[idx]);
          }
        }
        return sendJson(404, { message: 'Commande introuvable' });
      }

      if (endpoint.startsWith('/global/orders/') && req.method === 'DELETE') {
        const orderId = endpoint.replace('/global/orders/', '');
        for (const s of Object.values(storesData)) {
          if (!s || !s.orders) continue;
          const idx = s.orders.findIndex(o => o.id === orderId);
          if (idx !== -1) {
            s.orders.splice(idx, 1);
            broadcastDataChanged('order_deleted', s.key);
            return sendJson(200, { success: true, message: 'Commande supprimée avec succès' });
          }
        }
        return sendJson(404, { message: 'Commande introuvable' });
      }

      // --- SITE VISIBILITY & AVAILABILITY ---
      if (endpoint === '/site-visibility' && req.method === 'GET') {
        return sendJson(200, siteVisibilityData);
      }
      if (endpoint === '/site-visibility' && (req.method === 'POST' || req.method === 'PUT')) {
        const body = await getBody();
        if (body && typeof body === 'object') {
          siteVisibilityData = { ...siteVisibilityData, ...body };
          broadcastDataChanged('visibility_changed', 'all');
        }
        return sendJson(200, siteVisibilityData);
      }

      // --- FILIALE SWITCHING & CONFIG ---
      if (endpoint === '/set-shop' && req.method === 'POST') {
        const body = await getBody();
        if (body.shop && storesData[body.shop]) {
          activeShop = body.shop;
          res.setHeader('Set-Cookie', `shop=${activeShop}; Path=/; Max-Age=31536000; SameSite=Lax`);
          return sendJson(200, { success: true, activeShop });
        }
        return sendJson(400, { error: 'Invalid shop' });
      }

      // --- FILE & LOGO UPLOAD (Saved directly to backend disk in public/uploads) ---
      if ((endpoint === '/upload' || endpoint === '/upload/logo') && req.method === 'POST') {
        const body = await getBody();
        const targetShopKey = body.shop || shopKey || 'nutrition';
        const targetStore = storesData[targetShopKey] || shop;

        let fileBuffer = null;
        let ext = 'png';

        if (body.image && typeof body.image === 'string') {
          // Format base64 data URL: data:image/png;base64,...
          const matches = body.image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            const mime = matches[1];
            if (mime.includes('jpeg') || mime.includes('jpg')) ext = 'jpg';
            else if (mime.includes('svg')) ext = 'svg';
            else if (mime.includes('webp')) ext = 'webp';
            else if (mime.includes('png')) ext = 'png';
            fileBuffer = Buffer.from(matches[2], 'base64');
          } else {
            fileBuffer = Buffer.from(body.image, 'base64');
          }
        }

        if (!fileBuffer && body.fileBuffer) {
          fileBuffer = Buffer.from(body.fileBuffer);
        }

        if (!fileBuffer) {
          return sendJson(400, { error: 'No image provided. Base64 payload required in image field.' });
        }

        const uploadsDir = path.resolve(process.cwd(), 'public/uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const safePrefix = body.isLogo || endpoint.includes('logo') ? 'logo' : 'img';
        const fileName = `${safePrefix}_${targetShopKey}_${Date.now()}.${ext}`;
        const filePath = path.join(uploadsDir, fileName);
        fs.writeFileSync(filePath, fileBuffer);

        const publicUrl = `/uploads/${fileName}`;

        // If it's a logo upload, immediately update the backend store
        if (body.isLogo || endpoint.includes('logo') || body.type === 'logo') {
          if (!targetStore.advertisements) {
            targetStore.advertisements = {};
          }
          if (!targetStore.advertisements.logoConfig) {
            targetStore.advertisements.logoConfig = {};
          }
          targetStore.advertisements.logoConfig.logoUrl = publicUrl;
          if (body.navbarHeight) targetStore.advertisements.logoConfig.navbarHeight = body.navbarHeight;
          if (body.footerHeight) targetStore.advertisements.logoConfig.footerHeight = body.footerHeight;
        }

        return sendJson(200, {
          success: true,
          url: publicUrl,
          fileName,
          logoConfig: targetStore.advertisements?.logoConfig || null
        });
      }

      if ((endpoint === '/upload/logo' || endpoint === '/logo') && req.method === 'DELETE') {
        const targetShopKey = parsedUrl.query.shop || shopKey || 'nutrition';
        const targetStore = storesData[targetShopKey] || shop;
        if (targetStore?.advertisements?.logoConfig) {
          targetStore.advertisements.logoConfig.logoUrl = '';
        }
        return sendJson(200, { success: true, message: 'Logo réinitialisé', logoConfig: targetStore?.advertisements?.logoConfig });
      }

      // --- UNIFIED AUTH ROUTES (100% Dynamic with MongoDB schema) ---
      if (endpoint === '/auth/me' && req.method === 'GET') {
        const authUser = getAuthenticatedUser(req);
        if (!authUser) {
          return sendJson(401, { message: 'Non authentifié. Aucun utilisateur connecté.' });
        }
        return sendJson(200, authUser);
      }

      if ((endpoint === '/auth/profile' || endpoint === '/auth/me') && (req.method === 'PUT' || req.method === 'PATCH')) {
        const authUser = getAuthenticatedUser(req);
        if (!authUser) {
          return sendJson(401, { message: 'Non authentifié' });
        }
        const body = await getBody();
        if (body.firstName) authUser.firstName = body.firstName;
        if (body.lastName) authUser.lastName = body.lastName;
        if (body.phone) authUser.phone = body.phone;
        if (body.addresses) authUser.addresses = body.addresses;
        return sendJson(200, authUser);
      }

      if (endpoint === '/auth/login' && req.method === 'POST') {
        const body = await getBody();
        const email = (body.email || '').trim().toLowerCase();
        let found = users.find(u => u.email?.toLowerCase() === email);
        if (!found) {
          const isAdmin = email.includes('admin') || body.role === 'ADMIN';
          found = {
            _id: `usr-${Date.now()}`,
            id: Date.now(),
            firstName: body.firstName || email.split('@')[0] || 'Client',
            lastName: body.lastName || '',
            email: body.email,
            role: isAdmin ? 'ADMIN' : 'CUSTOMER',
            phone: body.phone || '+216 -- --- ---',
            addresses: [{ type: 'Domicile', street: 'Avenue Habib Bourguiba', city: 'Tunis', postalCode: '1000', isDefault: true }]
          };
          users.push(found);
        }
        
        const token = 'jwt_' + Date.now() + '_' + Math.random().toString(36).substring(2);
        sessions.set(token, found);
        
        res.setHeader('Set-Cookie', [
          `token=${token}; Path=/; Max-Age=604800; SameSite=Lax`,
          `accessToken=${token}; Path=/; Max-Age=604800; SameSite=Lax`
        ]);

        return sendJson(200, {
          accessToken: token,
          user: found
        });
      }

      if (endpoint === '/auth/register' && req.method === 'POST') {
        const body = await getBody();
        const email = (body.email || '').trim().toLowerCase();
        let existing = users.find(u => u.email?.toLowerCase() === email);
        if (existing) {
          return sendJson(400, { message: 'Cet email est déjà enregistré.' });
        }
        const isAdmin = email.includes('admin') || body.role === 'ADMIN';
        const newUser = {
          _id: `usr-${Date.now()}`,
          id: Date.now(),
          firstName: body.firstName || 'Client',
          lastName: body.lastName || '',
          email: body.email,
          role: isAdmin ? 'ADMIN' : 'CUSTOMER',
          phone: body.phone || '+216 -- --- ---',
          addresses: body.address ? [{ type: 'Domicile', street: body.address, city: body.city || 'Tunis', postalCode: '1000', isDefault: true }] : []
        };
        users.push(newUser);

        const token = 'jwt_' + Date.now() + '_' + Math.random().toString(36).substring(2);
        sessions.set(token, newUser);

        res.setHeader('Set-Cookie', [
          `token=${token}; Path=/; Max-Age=604800; SameSite=Lax`,
          `accessToken=${token}; Path=/; Max-Age=604800; SameSite=Lax`
        ]);

        return sendJson(201, {
          accessToken: token,
          user: newUser
        });
      }

      if (endpoint === '/auth/refresh' && req.method === 'POST') {
        const authUser = getAuthenticatedUser(req);
        if (!authUser) {
          return sendJson(401, { message: 'Session invalide' });
        }
        const newToken = 'jwt_' + Date.now() + '_' + Math.random().toString(36).substring(2);
        sessions.set(newToken, authUser);
        return sendJson(200, { accessToken: newToken });
      }

      if (endpoint === '/auth/logout') {
        const authHeader = req.headers['authorization'] || req.headers['Authorization'];
        const cookies = parseCookies(req.headers.cookie);
        const token = (authHeader && authHeader.startsWith('Bearer ')) ? authHeader.slice(7).trim() : (cookies.token || cookies.accessToken);
        if (token) {
          sessions.delete(token);
        }
        res.setHeader('Set-Cookie', [
          'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax',
          'accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax'
        ]);
        return sendJson(200, { message: 'Déconnecté avec succès' });
      }

      // --- STORE-SPECIFIC PRODUCTS ---
      if (endpoint === '/products' && req.method === 'GET') {
        let result = shop.products || [];
        const includeHidden = parsedUrl.query.include_hidden === 'true';
        if (!includeHidden) {
          // Frontoffice ne voit que les produits validés et publiés en boutique
          result = result.filter(p => p.existe_dans_boutique !== false);
        }
        const cat = parsedUrl.query.category;
        if (cat && cat !== 'product-list' && cat !== 'all') {
          result = result.filter(p => p.category?.toLowerCase() === cat.toLowerCase());
        }
        return sendJson(200, result);
      }

      if (endpoint.startsWith('/products/') && req.method === 'GET') {
        const id = parseInt(endpoint.replace('/products/', ''), 10);
        const prod = shop.products?.find(p => p.id === id);
        if (prod) return sendJson(200, prod);
        return sendJson(404, { message: 'Produit non trouvé' });
      }

      if (endpoint === '/products' && req.method === 'POST') {
        const body = await getBody();
        const newProduct = enrichProductWithFiliale({
          id: Date.now(),
          ...body,
          quantité_enstock: body.quantité_enstock !== undefined ? Number(body.quantité_enstock) : (Number(body.quantity) || 10),
          quantity: body.quantité_enstock !== undefined ? Number(body.quantité_enstock) : (Number(body.quantity) || 10),
          existe_dans_boutique: body.existe_dans_boutique !== undefined ? Boolean(body.existe_dans_boutique) : true,
          fournisseurId: body.fournisseurId || '',
          fournisseurNom: body.fournisseurNom || '',
          images: body.images?.length ? body.images : [body.imageUrl || 'https://picsum.photos/400/400']
        }, shop.key);
        shop.products.unshift(newProduct);
        broadcastDataChanged('product_created', shop.key);
        return sendJson(201, newProduct);
      }

      if (endpoint.startsWith('/products/') && req.method === 'PUT') {
        const id = parseInt(endpoint.replace('/products/', ''), 10);
        const body = await getBody();
        const index = shop.products.findIndex(p => p.id === id);
        if (index !== -1) {
          if (body.quantité_enstock !== undefined) {
            body.quantity = Number(body.quantité_enstock);
          } else if (body.quantity !== undefined) {
            body.quantité_enstock = Number(body.quantity);
          }
          if (body.existe_dans_boutique !== undefined) {
            body.existe_dans_boutique = Boolean(body.existe_dans_boutique);
          }
          if (body.fournisseurId !== undefined) {
            shop.products[index].fournisseurId = body.fournisseurId;
          }
          if (body.fournisseurNom !== undefined) {
            shop.products[index].fournisseurNom = body.fournisseurNom;
          }
          shop.products[index] = enrichProductWithFiliale({ ...shop.products[index], ...body }, shop.key);
          broadcastDataChanged('product_updated', shop.key);
          return sendJson(200, shop.products[index]);
        }
        return sendJson(404, { message: 'Produit non trouvé' });
      }

      if (endpoint.startsWith('/products/') && req.method === 'DELETE') {
        const id = parseInt(endpoint.replace('/products/', ''), 10);
        shop.products = shop.products.filter(p => p.id !== id);
        broadcastDataChanged('product_deleted', shop.key);
        return sendJson(200, { message: 'Produit supprimé' });
      }

      // --- CATEGORIES ---
      if (endpoint === '/categories' && req.method === 'GET') {
        return sendJson(200, shop.categories || []);
      }
      if (endpoint === '/categories' && req.method === 'POST') {
        const body = await getBody();
        if (!shop.categories) shop.categories = [];
        const newCategory = { id: Date.now(), ...body };
        shop.categories.push(newCategory);
        broadcastDataChanged('category_created', shop.key);
        return sendJson(201, newCategory);
      }
      if (endpoint.startsWith('/categories/') && (req.method === 'PUT' || req.method === 'PATCH')) {
        const catIdentifier = decodeURIComponent(endpoint.replace('/categories/', ''));
        const body = await getBody();
        if (!shop.categories) shop.categories = [];
        const index = shop.categories.findIndex(c => c.name === catIdentifier || String(c.id) === catIdentifier || c.slug === catIdentifier);
        if (index !== -1) {
          shop.categories[index] = { ...shop.categories[index], ...body };
          broadcastDataChanged('category_updated', shop.key);
          return sendJson(200, shop.categories[index]);
        } else {
          const created = { id: Date.now(), name: catIdentifier, ...body };
          shop.categories.push(created);
          broadcastDataChanged('category_created', shop.key);
          return sendJson(200, created);
        }
      }
      if (endpoint.startsWith('/categories/') && req.method === 'DELETE') {
        const catIdentifier = decodeURIComponent(endpoint.replace('/categories/', ''));
        if (!shop.categories) shop.categories = [];
        shop.categories = shop.categories.filter(c => c.name !== catIdentifier && String(c.id) !== catIdentifier && c.slug !== catIdentifier);
        broadcastDataChanged('category_deleted', shop.key);
        return sendJson(200, { message: 'Catégorie supprimée avec succès' });
      }

      // --- PACKS ---
      if (endpoint === '/packs' && req.method === 'GET') {
        return sendJson(200, shop.packs || []);
      }
      if (endpoint.startsWith('/packs/') && req.method === 'GET') {
        const id = parseInt(endpoint.replace('/packs/', ''), 10);
        const pack = (shop.packs || []).find(p => p.id === id);
        if (pack) return sendJson(200, pack);
        return sendJson(404, { message: 'Pack non trouvé' });
      }
      if (endpoint === '/packs' && req.method === 'POST') {
        const body = await getBody();
        if (!shop.packs) shop.packs = [];
        const newPack = { id: Date.now(), ...body };
        shop.packs.push(newPack);
        broadcastDataChanged('pack_created', shop.key);
        return sendJson(201, newPack);
      }
      if (endpoint.startsWith('/packs/') && (req.method === 'PUT' || req.method === 'PATCH')) {
        const id = parseInt(endpoint.replace('/packs/', ''), 10);
        const body = await getBody();
        if (!shop.packs) shop.packs = [];
        const index = shop.packs.findIndex(p => p.id === id);
        if (index !== -1) {
          shop.packs[index] = { ...shop.packs[index], ...body, id };
          broadcastDataChanged('pack_updated', shop.key);
          return sendJson(200, shop.packs[index]);
        }
        return sendJson(404, { message: 'Pack non trouvé' });
      }
      if (endpoint.startsWith('/packs/') && req.method === 'DELETE') {
        const id = parseInt(endpoint.replace('/packs/', ''), 10);
        if (!shop.packs) shop.packs = [];
        shop.packs = shop.packs.filter(p => p.id !== id);
        broadcastDataChanged('pack_deleted', shop.key);
        return sendJson(200, { message: 'Pack supprimé avec succès' });
      }

      // --- BRANDS ---
      if (endpoint === '/brands' && req.method === 'GET') {
        return sendJson(200, shop.brands || []);
      }
      if (endpoint === '/brands' && req.method === 'POST') {
        const body = await getBody();
        const newBrand = { id: Date.now(), ...body };
        shop.brands.push(newBrand);
        broadcastDataChanged('brand_created', shop.key);
        return sendJson(201, newBrand);
      }

      // --- STORES ---
      if (endpoint === '/stores' && req.method === 'GET') {
        return sendJson(200, shop.stores || []);
      }
      if (endpoint === '/stores' && req.method === 'POST') {
        const body = await getBody();
        if (!shop.stores) shop.stores = [];
        const newStore = { id: Date.now(), ...body };
        shop.stores.push(newStore);
        broadcastDataChanged('store_created', shop.key);
        return sendJson(201, newStore);
      }
      if (endpoint.startsWith('/stores/') && (req.method === 'PUT' || req.method === 'PATCH')) {
        const id = parseInt(endpoint.replace('/stores/', ''), 10);
        const body = await getBody();
        if (!shop.stores) shop.stores = [];
        const idx = shop.stores.findIndex(s => s.id === id);
        if (idx !== -1) {
          shop.stores[idx] = { ...shop.stores[idx], ...body, id };
          broadcastDataChanged('store_updated', shop.key);
          return sendJson(200, shop.stores[idx]);
        }
        return sendJson(404, { message: 'Boutique physique introuvable' });
      }
      if (endpoint.startsWith('/stores/') && req.method === 'DELETE') {
        const id = parseInt(endpoint.replace('/stores/', ''), 10);
        if (!shop.stores) shop.stores = [];
        shop.stores = shop.stores.filter(s => s.id !== id);
        broadcastDataChanged('store_deleted', shop.key);
        return sendJson(200, { success: true, message: 'Boutique physique supprimée' });
      }

      // --- ADVERTISEMENTS ---
      if (endpoint === '/advertisements' && req.method === 'GET') {
        return sendJson(200, shop.advertisements || {});
      }
      if (endpoint === '/advertisements' && (req.method === 'POST' || req.method === 'PUT')) {
        const body = await getBody();
        shop.advertisements = { 
          ...shop.advertisements, 
          ...body,
          logoConfig: { ...(shop.advertisements?.logoConfig || {}), ...(body?.logoConfig || {}) },
          fitnessHome: { ...(shop.advertisements?.fitnessHome || {}), ...(body?.fitnessHome || {}) },
          youpiHome: { ...(shop.advertisements?.youpiHome || {}), ...(body?.youpiHome || {}) }
        };
        broadcastDataChanged('advertisement_updated', shop.key);
        return sendJson(200, shop.advertisements);
      }

      // --- OFFERS CONFIG ---
      if (endpoint === '/offers-config' && req.method === 'GET') {
        return sendJson(200, shop.offersConfig || {});
      }
      if (endpoint === '/offers-config' && req.method === 'POST') {
        const body = await getBody();
        shop.offersConfig = { ...shop.offersConfig, ...body };
        broadcastDataChanged('offers_config_updated', shop.key);
        return sendJson(200, shop.offersConfig);
      }

      // --- PROMOTIONS ---
      if (endpoint === '/promotions' && req.method === 'GET') {
        return sendJson(200, shop.promotions || []);
      }
      if (endpoint === '/promotions' && req.method === 'POST') {
        const body = await getBody();
        if (!shop.promotions) shop.promotions = [];
        const newPromo = { id: Date.now(), ...body };
        shop.promotions.push(newPromo);
        broadcastDataChanged('promotion_created', shop.key);
        return sendJson(201, newPromo);
      }
      if (endpoint.startsWith('/promotions/') && (req.method === 'PUT' || req.method === 'PATCH')) {
        const id = parseInt(endpoint.replace('/promotions/', ''), 10);
        const body = await getBody();
        if (!shop.promotions) shop.promotions = [];
        const idx = shop.promotions.findIndex(p => p.id === id);
        if (idx !== -1) {
          shop.promotions[idx] = { ...shop.promotions[idx], ...body, id };
          broadcastDataChanged('promotion_updated', shop.key);
          return sendJson(200, shop.promotions[idx]);
        }
        return sendJson(404, { message: 'Promotion introuvable' });
      }
      if (endpoint.startsWith('/promotions/') && req.method === 'DELETE') {
        const id = parseInt(endpoint.replace('/promotions/', ''), 10);
        if (!shop.promotions) shop.promotions = [];
        shop.promotions = shop.promotions.filter(p => p.id !== id);
        broadcastDataChanged('promotion_deleted', shop.key);
        return sendJson(200, { success: true, message: 'Promotion supprimée' });
      }

      // --- ORDERS ---
      if (endpoint === '/orders/myorders' && req.method === 'GET') {
        return sendJson(200, shop.orders || []);
      }
      if (endpoint === '/orders' && req.method === 'GET') {
        return sendJson(200, shop.orders || []);
      }
      if (endpoint === '/orders' && req.method === 'POST') {
        const body = await getBody();
        const authUser = getAuthenticatedUser(req);
        const customerName = authUser 
          ? `${authUser.firstName} ${authUser.lastName}`.trim() 
          : (body.customerInfo?.firstName ? `${body.customerInfo.firstName} ${body.customerInfo.lastName || ''}`.trim() : (body.customer?.name || body.customerName || 'Client Invité'));
        const orderId = body.orderNumber || body.id || `ORD-${shop.key.toUpperCase()}-${Date.now().toString().slice(-5)}`;
        const totalAmount = Number(body.totalAmount ?? body.total ?? 0);
        const newOrder = {
          ...body,
          id: orderId,
          orderNumber: orderId,
          customerName,
          date: body.date || new Date().toISOString().split('T')[0],
          status: body.status || 'En attente',
          total: totalAmount,
          totalAmount: totalAmount,
          filialeKey: shop.key,
          filialeName: shop.name,
          userId: authUser?._id || 'guest'
        };
        shop.orders.unshift(newOrder);
        broadcastDataChanged('order_created', shop.key);
        return sendJson(201, newOrder);
      }

      if (endpoint.startsWith('/orders/') && (req.method === 'PUT' || req.method === 'PATCH')) {
        const orderId = endpoint.replace('/orders/', '');
        const body = await getBody();
        for (const s of Object.values(storesData)) {
          if (!s || !s.orders) continue;
          const idx = s.orders.findIndex(o => o.id === orderId);
          if (idx !== -1) {
            s.orders[idx] = { ...s.orders[idx], ...body };
            broadcastDataChanged('order_updated', s.key);
            return sendJson(200, s.orders[idx]);
          }
        }
        return sendJson(404, { message: 'Commande introuvable' });
      }

      if (endpoint.startsWith('/orders/') && req.method === 'DELETE') {
        const orderId = endpoint.replace('/orders/', '');
        for (const s of Object.values(storesData)) {
          if (!s || !s.orders) continue;
          const idx = s.orders.findIndex(o => o.id === orderId);
          if (idx !== -1) {
            s.orders.splice(idx, 1);
            broadcastDataChanged('order_deleted', s.key);
            return sendJson(200, { success: true, message: 'Commande supprimée' });
          }
        }
        return sendJson(404, { message: 'Commande introuvable' });
      }

      // --- PAYMENT ---
      if (endpoint === '/payment/create' && req.method === 'POST') {
        const body = await getBody();
        return sendJson(200, {
          success: true,
          paymentUrl: `#/order-history?payment=success&orderId=${body.orderId || 'ORD-NEW'}`
        });
      }

      // --- BLOG ---
      if (endpoint === '/blog' && req.method === 'GET') {
        return sendJson(200, shop.blogPosts || []);
      }
      if (endpoint.startsWith('/blog/') && req.method === 'GET') {
        const slug = endpoint.replace('/blog/', '');
        const post = (shop.blogPosts || []).find(b => b.slug === slug);
        if (post) return sendJson(200, post);
        return sendJson(404, { message: 'Article non trouvé' });
      }
      if (endpoint === '/blog' && req.method === 'POST') {
        const body = await getBody();
        const newPost = { id: Date.now(), ...body, date: new Date().toISOString().split('T')[0] };
        shop.blogPosts.unshift(newPost);
        return sendJson(201, newPost);
      }

      // --- CONTACT ---
      if (endpoint === '/contact' && req.method === 'POST') {
        const body = await getBody();
        const msg = { id: Date.now(), ...body, date: new Date().toISOString().split('T')[0], read: false };
        shop.contactMessages.unshift(msg);
        broadcastDataChanged('message_received', shop.key);
        return sendJson(201, { success: true, message: 'Message envoyé avec succès.' });
      }
      if (endpoint === '/contact' && req.method === 'GET') {
        return sendJson(200, shop.contactMessages || []);
      }
      if (endpoint.startsWith('/contact/') && (req.method === 'PUT' || req.method === 'PATCH')) {
        const msgId = parseInt(endpoint.replace('/contact/', ''), 10);
        const body = await getBody();
        const msg = (shop.contactMessages || []).find(m => m.id === msgId);
        if (msg) {
          Object.assign(msg, body);
          broadcastDataChanged('message_updated', shop.key);
          return sendJson(200, msg);
        }
        return sendJson(404, { message: 'Message introuvable' });
      }

      // --- REVIEWS ---
      if (endpoint.startsWith('/reviews/') && req.method === 'GET') {
        const parts = endpoint.split('/').filter(Boolean);
        const targetType = parts[1];
        const targetId = parseInt(parts[2], 10);
        const revs = (shop.reviews || []).filter(r => r.targetType === targetType && r.targetId === targetId);
        return sendJson(200, revs);
      }
      if (endpoint === '/reviews' && req.method === 'POST') {
        const body = await getBody();
        const authUser = getAuthenticatedUser(req);
        const rev = {
          _id: `rev-${Date.now()}`,
          userId: authUser ? authUser._id : 'guest',
          userName: authUser ? `${authUser.firstName} ${authUser.lastName}`.trim() : (body.userName || 'Client'),
          date: new Date().toISOString().split('T')[0],
          ...body
        };
        shop.reviews.unshift(rev);
        broadcastDataChanged('review_added', shop.key);
        return sendJson(201, rev);
      }

      // --- CHAT ---
      if (endpoint === '/chat/all' && req.method === 'GET') {
        const sessions = chatSessionsStore[shopKey] || chatSessionsStore.youpi;
        return sendJson(200, Array.from(sessions.values()));
      }
      if (endpoint.startsWith('/chat/') && req.method === 'GET') {
        const targetUserId = endpoint.replace('/chat/', '');
        if (targetUserId === 'all') {
          const sessions = chatSessionsStore[shopKey] || chatSessionsStore.youpi;
          return sendJson(200, Array.from(sessions.values()));
        }
        const sessions = chatSessionsStore[shopKey] || chatSessionsStore.youpi;
        const session = sessions.get(targetUserId) || { userId: targetUserId, messages: [] };
        return sendJson(200, session);
      }
      if (endpoint === '/chat/send' && req.method === 'POST') {
        const body = await getBody();
        const record = recordChatMessage(shopKey, body);
        return sendJson(200, { success: true, ...record });
      }
      if (endpoint === '/chat/reply' && req.method === 'POST') {
        const body = await getBody();
        const record = recordChatMessage(shopKey, { ...body, sender: 'admin' });
        return sendJson(200, { success: true, ...record });
      }

      if (req.method === 'GET') {
        return sendJson(200, []);
      }
      return sendJson(200, { success: true });

    } catch (err) {
      console.error('API Error:', err);
      return sendJson(500, { error: 'Internal Server Error', message: err.message });
    }
  })();
}
