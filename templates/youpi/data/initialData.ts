import { Product, Category, Pack, Store, BlogPost, Brand, ContactMessage, Promotion } from '../types';

export const allProducts: Product[] = [
  {
    id: 401,
    name: 'Pack Éveil Montessori en Bois Naturel',
    brand: 'Janod',
    price: 89,
    oldPrice: 110,
    imageUrl: '/src/assets/images/category_youpi_eveil_1791240046354.jpg',
    images: ['/src/assets/images/category_youpi_eveil_1791240046354.jpg'],
    discount: 19,
    category: 'Éveil & Bébé',
    parentCategory: "Jouets d'Éveil",
    promo: true,
    description: 'Ensemble de jouets sensoriels en bois certifié FSC. Anneaux empilables, labyrinthe de perles et cubes de motricité pour bébés de 12 à 36 mois.',
    quantity: 35,
    rating: 5,
    reviewsCount: 48,
    trancheAge: '12 - 36 mois',
    specifications: [
      { name: 'Âge conseillé', value: '1 à 3 ans' },
      { name: 'Matière', value: 'Bois de hêtre & peintures à l\'eau' },
      { name: 'Norme', value: 'CE / EN-71' }
    ]
  },
  {
    id: 402,
    name: 'Boîte de Construction Briques Créatives 850 pcs',
    brand: 'Lego',
    price: 139,
    oldPrice: 165,
    imageUrl: '/src/assets/images/category_youpi_lego_1791240056376.jpg',
    images: ['/src/assets/images/category_youpi_lego_1791240056376.jpg'],
    discount: 15,
    category: 'Construction & Lego',
    parentCategory: 'Jeux de Construction',
    promo: true,
    description: 'Boîte géante comprenant 850 briques de couleurs vives, roues, portes, fenêtres et livret d\'idées de construction pour stimuler l\'imagination.',
    quantity: 28,
    rating: 5,
    reviewsCount: 92,
    trancheAge: '4 ans et +',
    specifications: [
      { name: 'Nombre de pièces', value: '850 pièces' },
      { name: 'Compatibilité', value: 'Standard Lego' },
      { name: 'Boîte de rangement', value: 'Incluse' }
    ]
  },
  {
    id: 403,
    name: 'Jeu de Société Stratégie & Aventure "L\'Île aux Trésors"',
    brand: 'Djeco',
    price: 54,
    oldPrice: 65,
    imageUrl: '/src/assets/images/category_youpi_societe_1791240065789.jpg',
    images: ['/src/assets/images/category_youpi_societe_1791240065789.jpg'],
    discount: 17,
    category: 'Jeux de Société',
    parentCategory: 'Jeux de Réflexion',
    promo: true,
    description: 'Un jeu de plateau familial passionnant et coopératif. Trouver les clés du trésor avant que la marée haute ne submerge l\'île.',
    quantity: 42,
    rating: 4.9,
    reviewsCount: 65,
    trancheAge: '6 ans et +',
    specifications: [
      { name: 'Joueurs', value: '2 à 5 joueurs' },
      { name: 'Durée moyenne', value: '25 à 40 min' },
      { name: 'Fabrication', value: 'Carton recyclé FSC' }
    ]
  },
  {
    id: 404,
    name: 'Draisienne Évolutive en Bois Réglable',
    brand: 'YoupiPlay',
    price: 189,
    oldPrice: 220,
    imageUrl: '/src/assets/images/hero_youpishop_toys_1791240036994.jpg',
    images: ['/src/assets/images/hero_youpishop_toys_1791240036994.jpg'],
    discount: 14,
    category: 'Plein Air & Véhicules',
    parentCategory: 'Vélos & Mobilité',
    promo: true,
    description: 'Draisienne légère sans pédales pour apprendre l\'équilibre dès 2 ans. Selle et guidon réglables, pneus anti-crevaison.',
    quantity: 18,
    rating: 5,
    reviewsCount: 37,
    trancheAge: '2 - 5 ans',
    specifications: [
      { name: 'Poids draisienne', value: '3.4 kg' },
      { name: 'Hauteur selle', value: '32 à 42 cm' },
      { name: 'Roues', value: '12 pouces increvables' }
    ]
  },
  {
    id: 405,
    name: 'Mallette d\'Artiste Peinture & Dessin 120 pièces',
    brand: 'Djeco',
    price: 49,
    oldPrice: 59,
    imageUrl: '/src/assets/images/category_youpi_eveil_1791240046354.jpg',
    images: ['/src/assets/images/category_youpi_eveil_1791240046354.jpg'],
    discount: 17,
    category: 'Arts Créatifs',
    parentCategory: 'Dessin & Peinture',
    promo: false,
    description: 'Coffret en bois naturel verni contenant feutres lavables, pastels à l\'huile, crayons de couleur aquarellables et godets de gouache.',
    quantity: 50,
    rating: 4.8,
    reviewsCount: 54,
    trancheAge: '3 ans et +',
    specifications: [
      { name: 'Contenu', value: '120 accessoires d\'art' },
      { name: 'Lavabilité', value: 'Encres ultra-lavables à l\'eau' },
      { name: 'Mallette', value: 'Bois avec fermoirs métalliques' }
    ]
  },
  {
    id: 406,
    name: 'Maison de Poupées 3 Étages Meublée en Bois',
    brand: 'Janod',
    price: 219,
    oldPrice: 260,
    imageUrl: '/src/assets/images/category_youpi_eveil_1791240046354.jpg',
    images: ['/src/assets/images/category_youpi_eveil_1791240046354.jpg'],
    discount: 15,
    category: 'Éveil & Bébé',
    parentCategory: 'Jeux d\'Imitation',
    promo: true,
    description: 'Grande maison de poupées contemporaine avec 4 pièces meublées, escalier, terrasse et 2 figurines articulées incluses.',
    quantity: 12,
    rating: 5,
    reviewsCount: 29,
    trancheAge: '3 - 8 ans',
    specifications: [
      { name: 'Dimensions', value: '75 x 60 x 30 cm' },
      { name: 'Meubles inclus', value: '18 pièces de mobilier' },
      { name: 'Matière', value: 'Bois massif peint' }
    ]
  },
  {
    id: 407,
    name: 'Station Spatiale & Fusée Modulaire Lego City',
    brand: 'Lego',
    price: 175,
    oldPrice: 199,
    imageUrl: '/src/assets/images/category_youpi_lego_1791240056376.jpg',
    images: ['/src/assets/images/category_youpi_lego_1791240056376.jpg'],
    discount: 12,
    category: 'Construction & Lego',
    parentCategory: 'Jeux de Construction',
    promo: true,
    description: 'Ensemble spatial comprenant la fusée de lancement, tour de contrôle, rover lunaire, satellite et 5 mini-figurines cosmonautes.',
    quantity: 16,
    rating: 4.9,
    reviewsCount: 81,
    trancheAge: '7 ans et +',
    specifications: [
      { name: 'Nombre de pièces', value: '620 pièces' },
      { name: 'Figurines', value: '5 astronautes & 1 droïde' }
    ]
  },
  {
    id: 408,
    name: 'Circuit de Train Géant en Bois 70 Pièces',
    brand: 'YoupiPlay',
    price: 119,
    oldPrice: 149,
    imageUrl: '/src/assets/images/category_youpi_eveil_1791240046354.jpg',
    images: ['/src/assets/images/category_youpi_eveil_1791240046354.jpg'],
    discount: 20,
    category: 'Éveil & Bébé',
    parentCategory: 'Circuits & Véhicules',
    promo: true,
    description: 'Circuit complet de rails en bois de hêtre massif, locomotive magnétique, wagons de marchandises, gare avec cloche et pont à bascule.',
    quantity: 24,
    rating: 5,
    reviewsCount: 78,
    trancheAge: '2 - 6 ans',
    specifications: [
      { name: 'Compatibilité', value: 'Compatible avec tous les circuits bois' },
      { name: 'Nombre de pièces', value: '70 éléments' },
      { name: 'Matériaux', value: 'Bois naturel & aimants sécurisés' }
    ]
  }
];

export const categories: Category[] = [
  { id: 1, name: 'Éveil & Bébé', slug: 'eveil-bebe', image: '/src/assets/images/category_youpi_eveil_1791240046354.jpg' },
  { id: 2, name: 'Construction & Lego', slug: 'construction-lego', image: '/src/assets/images/category_youpi_lego_1791240056376.jpg' },
  { id: 3, name: 'Jeux de Société', slug: 'jeux-de-societe', image: '/src/assets/images/category_youpi_societe_1791240065789.jpg' },
  { id: 4, name: 'Plein Air & Véhicules', slug: 'plein-air-vehicules', image: '/src/assets/images/hero_youpishop_toys_1791240036994.jpg' },
  { id: 5, name: 'Arts Créatifs', slug: 'arts-creatifs', image: '/src/assets/images/category_youpi_eveil_1791240046354.jpg' }
];

export const brands: Brand[] = [
  { id: 1, name: 'YoupiPlay', logo: '' },
  { id: 2, name: 'Lego', logo: '' },
  { id: 3, name: 'Janod', logo: '' },
  { id: 4, name: 'Djeco', logo: '' },
  { id: 5, name: 'Playmobil', logo: '' },
  { id: 6, name: 'Asmodee', logo: '' }
];

export const packs: Pack[] = [
  {
    id: 4001,
    title: 'Pack Éveil Naissance Montessori',
    price: 129,
    originalPrice: 169,
    discount: 23,
    imageUrl: '/src/assets/images/category_youpi_eveil_1791240046354.jpg',
    description: 'Le trio incontournable pour développer les sens et la motricité : anneaux en bois, boîte à formes et doudou lange bio.',
    products: [allProducts[0], allProducts[3]]
  },
  {
    id: 4002,
    title: 'Pack Grand Architecte Créatif',
    price: 249,
    originalPrice: 314,
    discount: 20,
    imageUrl: '/src/assets/images/category_youpi_lego_1791240056376.jpg',
    description: 'La méga boîte de briques 850 pcs combinée avec la station spatiale pour des heures de construction infinies.',
    products: [allProducts[1], allProducts[6]]
  }
];

export const stores: Store[] = [
  {
    id: 1,
    name: 'YoupiShop Tunis City Géant',
    address: 'Centre Commercial Tunis City, Cebalat Ben Ammar',
    phone: '+216 71 888 123',
    hours: '7j/7 : 09h00 - 21h00'
  },
  {
    id: 2,
    name: 'YoupiShop Sousse Mall',
    address: 'Mall of Sousse, Kalâa Kebira',
    phone: '+216 73 222 456',
    hours: '7j/7 : 10h00 - 22h00'
  },
  {
    id: 3,
    name: 'YoupiShop Sfax Route de Téniour',
    address: 'Route de Téniour Km 2, Sfax',
    phone: '+216 74 666 789',
    hours: 'Lun - Sam : 08h30 - 20h00'
  }
];

export const initialAdvertisements = {
  hero: {
    badge: 'UNIVERS DES ENFANTS & JEUX',
    title: 'LE ROYAUME DE',
    titleHighlight: 'L\'IMAGINATION',
    description: 'Découvrez notre sélection de jouets d\'éveil, de briques de construction et de jeux familiaux pour apprendre en s\'amusant.',
    buttonText: 'Découvrir la boutique',
    buttonCategory: 'all',
    bgImage: '/src/assets/images/hero_youpishop_toys_1791240036994.jpg'
  },
  promoBanner: {
    tag: 'FÊTES & ANNIVERSAIRES',
    title: 'JUSQU\'À',
    discountHighlight: '-25%',
    description: 'SUR UNE SÉLECTION DE JEUX DE SOCIÉTÉ ET DE PACKS CRÉATIFS',
    buttonText: 'Voir les offres',
    categoryTarget: 'Jeux de Société',
    bgImage: '/src/assets/images/hero_youpishop_toys_1791240036994.jpg'
  }
};

export const promotions: Promotion[] = [
  {
    id: 'promo-youpi-1',
    title: 'Offre Spéciale Anniversaire',
    code: 'YOUPI20',
    discountPercent: 20,
    active: true,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    description: '-20% sur tout le rayon Éveil et Jeux de Société dès 100 DT d\'achat.'
  }
];

export const sampleOrders: any[] = [
  {
    id: 'YUP-9481',
    orderNumber: 'YUP-9481',
    customer: {
      name: 'Sarra Ben Youssef',
      email: 'sarra.by@gmail.com',
      phone: '+216 22 345 678',
      address: '28 Rue des Orangers, Ariana'
    },
    items: [
      {
        product: allProducts[0],
        quantity: 1,
        price: 89,
        selectedSpecs: {}
      }
    ],
    total: 89,
    status: 'delivered',
    createdAt: '2026-03-28T10:14:00Z',
    shippingMethod: 'Express Domicile',
    paymentMethod: 'Paiement à la livraison'
  },
  {
    id: 'YUP-9482',
    orderNumber: 'YUP-9482',
    customer: {
      name: 'Mohamed Cherif',
      email: 'm.cherif@gmail.com',
      phone: '+216 98 123 456',
      address: 'Avenue Habib Bourguiba, Sousse'
    },
    items: [
      {
        product: allProducts[1],
        quantity: 1,
        price: 139,
        selectedSpecs: {}
      }
    ],
    total: 139,
    status: 'processing',
    createdAt: '2026-04-01T15:30:00Z',
    shippingMethod: 'Point Relais',
    paymentMethod: 'Carte Bancaire'
  }
];

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: 'Comment choisir les bons jouets Montessori selon l\'âge de votre enfant ?',
    summary: 'La méthode Montessori privilégie les matériaux naturels et les activités sensorielles qui encouragent l\'autonomie.',
    content: 'Développer la confiance et l\'esprit critique commence dès le plus jeune âge. Découvrez les étapes d\'éveil clés entre 1 et 5 ans.',
    author: 'Équipe Pédagogique YoupiShop',
    date: '15 Mars 2026',
    category: 'Guide Parental',
    image: '/src/assets/images/category_youpi_eveil_1791240046354.jpg'
  },
  {
    id: 2,
    title: 'Top 5 des jeux de société pour réunir toute la famille un dimanche après-midi',
    summary: 'Rires et réflexion garantis : notre sélection de jeux coopératifs et dynamiques pour petits et grands.',
    content: 'Les jeux de société permettent de renforcer les liens familiaux tout en stimulant le sens stratégique et le fair-play.',
    author: 'Animateur Ludothécaire',
    date: '28 Février 2026',
    category: 'Jeux de Société',
    image: '/src/assets/images/category_youpi_societe_1791240065789.jpg'
  }
];

export const contactMessages: ContactMessage[] = [
  {
    id: 'msg-youpi-1',
    name: 'Nadia Trabelsi',
    email: 'nadia.trabelsi@yahoo.fr',
    phone: '+216 20 456 789',
    subject: 'Disponibilité Station Spatiale Lego',
    message: 'Bonjour, je souhaite savoir si le set Station Spatiale Lego sera disponible en boutique au magasin de Tunis City cette semaine ? Merci d\'avance.',
    date: '2026-04-02',
    read: false
  },
  {
    id: 'msg-youpi-2',
    name: 'Karim Jaziri',
    email: 'karim.j@gmail.com',
    phone: '+216 55 890 234',
    subject: 'Emballage cadeau offert',
    message: 'Est-il possible d\'ajouter un paquet cadeau avec un petit mot personnalisé pour une livraison directe à Bizerte ?',
    date: '2026-04-03',
    read: true
  }
];

const initialData = {
  allProducts,
  categories,
  brands,
  packs,
  stores,
  initialAdvertisements,
  promotions,
  sampleOrders,
  blogPosts,
  contactMessages
};

export default initialData;
