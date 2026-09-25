// Shared multi-tenant constants and helpers
const STORES = [
  {
    id: 'parashop',
    slug: 'parashop',
    name: 'PharmaNature',
    subtitle: 'Parapharmacie Naturelle & Phytothérapie',
    themeColor: '#008b5e',
    secondaryColor: '#84cc16',
    path: '/parashop',
    description: 'Santé naturelle, dermo-cosmétique bio et micronutrition certifiée.',
    currency: 'TND',
    categoryTheme: 'Santé & Bien-être'
  },
  {
    id: 'nutritionshop',
    slug: 'nutritionshop',
    name: 'IronFuel Nutrition',
    subtitle: 'Elite Nutrition & Performance Sportive',
    themeColor: '#ccff00',
    secondaryColor: '#050505',
    path: '/nutritionshop',
    description: 'Protéines pures, créatine, boosters et suppléments pour athlètes exigeants.',
    currency: 'TND',
    categoryTheme: 'Nutrition Sportive'
  },
  {
    id: 'cosmeticshop',
    slug: 'cosmeticshop',
    name: 'Cosmetics Shop',
    subtitle: 'Haute Cosmétique & Soins d\'Exception',
    themeColor: '#e11d48',
    secondaryColor: '#f43f5e',
    path: '/cosmeticshop',
    description: 'Maquillage haut de gamme, parfums prestigieux et soins révélateurs d\'éclat.',
    currency: 'TND',
    categoryTheme: 'Beauté & Parfumerie'
  },
  {
    id: 'electroshop',
    slug: 'electroshop',
    name: 'Electro Shop',
    subtitle: 'Électroménager, Multimédia & High-Tech',
    themeColor: '#ef4444',
    secondaryColor: '#dc2626',
    path: '/electroshop',
    description: 'Téléviseurs, gros et petit électroménager, climatisation et équipement maison.',
    currency: 'TND',
    categoryTheme: 'Électronique & Maison'
  }
];

const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  STORE_ADMIN: 'STORE_ADMIN',
  USER: 'USER'
};

const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED'
};

module.exports = {
  STORES,
  ROLES,
  ORDER_STATUS
};
