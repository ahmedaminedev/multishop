const allProducts = [
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
        parentCategory: 'Jouets d\'Éveil',
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
        trancheAge: '4 - 12 ans',
        specifications: [
            { name: 'Nombre de pièces', value: '850 pièces' },
            { name: 'Âge', value: '4 ans et plus' },
            { name: 'Développement', value: 'Créativité & Motricité fine' }
        ]
    },
    {
        id: 403,
        name: 'Jeu de Société Aventure & Stratégie Famille',
        brand: 'Asmodee',
        price: 74,
        oldPrice: 89,
        imageUrl: '/src/assets/images/category_youpi_societe_1791240065789.jpg',
        images: ['/src/assets/images/category_youpi_societe_1791240065789.jpg'],
        discount: 16,
        category: 'Jeux de Société',
        parentCategory: 'Jeux de Société & Cartes',
        promo: true,
        description: 'Jeu captivant de plateau pour toute la famille. Règles simples, parties dynamiques de 30 minutes favorisant la coopération et la réflexion tactique.',
        quantity: 42,
        rating: 5,
        reviewsCount: 64,
        trancheAge: '6 ans et +',
        specifications: [
            { name: 'Nombre de joueurs', value: '2 à 5 joueurs' },
            { name: 'Durée moyenne', value: '30 minutes' },
            { name: 'Langue', value: 'Français / Arabe' }
        ]
    },
    {
        id: 404,
        name: 'Peluche Doudou Ourson Géant Ultra-Doux 60cm',
        brand: 'YoupiPlay',
        price: 59,
        oldPrice: 75,
        imageUrl: '/src/assets/images/hero_youpishop_toys_1791240036994.jpg',
        images: ['/src/assets/images/hero_youpishop_toys_1791240036994.jpg'],
        discount: 21,
        category: 'Éveil & Bébé',
        parentCategory: 'Peluches & Doudous',
        promo: true,
        description: 'Grand ours en peluche hypoallergénique d\'une douceur incomparable. Lavable en machine à 30°C, idéal comme cadeau de naissance ou d\'anniversaire.',
        quantity: 50,
        rating: 5,
        reviewsCount: 115,
        trancheAge: 'Dès la naissance',
        specifications: [
            { name: 'Hauteur', value: '60 cm' },
            { name: 'Entretien', value: 'Lavable en machine' },
            { name: 'Hypoallergénique', value: 'Oui certifié Oeko-Tex' }
        ]
    },
    {
        id: 405,
        name: 'Trottinette 3 Roues Évolutive avec Roues LED',
        brand: 'YoupiPlay',
        price: 119,
        oldPrice: 149,
        imageUrl: '/src/assets/images/hero_youpishop_toys_1791240036994.jpg',
        images: ['/src/assets/images/hero_youpishop_toys_1791240036994.jpg'],
        discount: 20,
        category: 'Plein Air & Véhicules',
        parentCategory: 'Plein Air & Mobilité',
        promo: true,
        description: 'Trottinette ultra-stable à 3 roues lumineuses sans pile (effet dynamo). Guidon réglable sur 4 hauteurs avec frein arrière sécurisé.',
        quantity: 20,
        rating: 5,
        reviewsCount: 37,
        trancheAge: '3 - 8 ans',
        specifications: [
            { name: 'Poids max supporté', value: '50 kg' },
            { name: 'Roues', value: 'Lumineuses LED intégrées' },
            { name: 'Guidon', value: 'Réglable en hauteur & pliable' }
        ]
    },
    {
        id: 406,
        name: 'Coffret Artiste Peinture & Pâte à Modeler Sans Danger',
        brand: 'Djeco',
        price: 49,
        oldPrice: 59,
        imageUrl: '/src/assets/images/category_youpi_eveil_1791240046354.jpg',
        images: ['/src/assets/images/category_youpi_eveil_1791240046354.jpg'],
        discount: 17,
        category: 'Arts Créatifs',
        parentCategory: 'Loisirs Créatifs',
        promo: false,
        description: 'Superbe valisette en bois contenant 12 pots de pâte à modeler végétale, 18 gouaches lavables, pinceaux ergonomiques et tablier enfant anti-tâche.',
        quantity: 30,
        rating: 4.8,
        reviewsCount: 42,
        trancheAge: '3 - 10 ans',
        specifications: [
            { name: 'Ingrédients', value: '100% végétal non toxique' },
            { name: 'Lavable', value: 'Nettoyage facile à l\'eau' },
            { name: 'Contenu', value: '35 accessoires de création' }
        ]
    },
    {
        id: 407,
        name: 'Fusée Spatiale & Station Lunaire avec Astronautes',
        brand: 'Playmobil',
        price: 159,
        oldPrice: 189,
        imageUrl: '/src/assets/images/category_youpi_lego_1791240056376.jpg',
        images: ['/src/assets/images/category_youpi_lego_1791240056376.jpg'],
        discount: 15,
        category: 'Construction & Lego',
        parentCategory: 'Figurines & Mondes Imaginaires',
        promo: true,
        description: 'Grande fusée avec effets sonores de décollage et rampes lumineuses. Livrée avec 3 figurines d\'astronautes, rover tout-terrain et satellite.',
        quantity: 18,
        rating: 4.9,
        reviewsCount: 56,
        trancheAge: '4 - 10 ans',
        specifications: [
            { name: 'Hauteur', value: '52 cm' },
            { name: 'Effets', value: 'Son & Lumière réalistes' },
            { name: 'Piles', value: '2x AA incluses' }
        ]
    },
    {
        id: 408,
        name: 'Circuit Train en Bois avec Pont Suspendu 70 pièces',
        brand: 'Haba',
        price: 99,
        oldPrice: 125,
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

const categories = [
    {
        id: 1,
        name: 'Éveil & Bébé',
        slug: 'eveil-bebe',
        ageRange: '0-3 ans (Éveil & Petite Enfance)',
        icon: '🧸',
        color: 'rose',
        image: '/src/assets/images/category_youpi_eveil_1791240046354.jpg',
        subCategories: ['Hochets & Doudous', 'Tapis d\'Éveil & Portiques', 'Puzzles Premier Âge', 'Jouets en Bois Montessori'],
        description: 'Développe la motricité fine et la curiosité sensorielle des tout-petits.'
    },
    {
        id: 2,
        name: 'Construction & Lego',
        slug: 'construction-lego',
        ageRange: '4-12 ans (École & Créativité)',
        icon: '🧱',
        color: 'amber',
        image: '/src/assets/images/category_youpi_lego_1791240056376.jpg',
        megaMenu: [
            {
                title: 'Briques & Boîtes Géantes',
                items: [{ name: 'Boîte Classic 850 pcs' }, { name: 'Plaques de base' }, { name: 'Accessoires & Roues' }]
            },
            {
                title: 'Univers & Thématiques',
                items: [{ name: 'Villes & Métiers' }, { name: 'Exploration Spatiale' }, { name: 'Châteaux & Royaumes' }]
            }
        ],
        description: 'Stimule l\'imagination spatiale et la patience par la construction.'
    },
    {
        id: 3,
        name: 'Jeux de Société',
        slug: 'jeux-de-societe',
        ageRange: '6-12 ans (École & Créativité)',
        icon: '🎲',
        color: 'blue',
        image: '/src/assets/images/category_youpi_societe_1791240065789.jpg',
        subCategories: ['Jeux de Coopération', 'Jeux d\'Ambiance & Fêtes', 'Stratégie & Réflexion', 'Jeux de Cartes Rapides'],
        description: 'Des moments de rire et de partage inoubliables en famille.'
    },
    {
        id: 4,
        name: 'Plein Air & Véhicules',
        slug: 'plein-air-vehicules',
        ageRange: '3-6 ans (Maternelle & Imagination)',
        icon: '🚗',
        color: 'emerald',
        image: '/src/assets/images/hero_youpishop_toys_1791240036994.jpg',
        subCategories: ['Trottinettes & Draisiennes', 'Voitures & Circuits', 'Jeux d\'Eau & Piscine', 'Cabanes & Tentes'],
        description: 'Pour bouger, explorer et profiter du grand air en toute sécurité.'
    },
    {
        id: 5,
        name: 'Arts Créatifs & Dessin',
        slug: 'arts-creatifs',
        ageRange: 'Tous âges',
        icon: '🎨',
        color: 'purple',
        image: '/src/assets/images/category_youpi_eveil_1791240046354.jpg',
        subCategories: ['Pâte à modeler', 'Peinture aux doigts', 'Coloriages géants', 'Perles & Bijoux'],
        description: 'Libérez le talent artistique et l\'expression personnelle de vos enfants.'
    }
];

const brands = [
    { id: 1, name: 'YoupiPlay', logo: '' },
    { id: 2, name: 'Lego', logo: '' },
    { id: 3, name: 'Janod', logo: '' },
    { id: 4, name: 'Djeco', logo: '' },
    { id: 5, name: 'Playmobil', logo: '' },
    { id: 6, name: 'Asmodee', logo: '' }
];

const packs = [
    {
        id: 4001,
        name: 'Pack Éveil Naissance Montessori',
        title: 'Pack Éveil Naissance Montessori',
        price: 129,
        oldPrice: 169,
        originalPrice: 169,
        discount: 23,
        imageUrl: '/src/assets/images/category_youpi_eveil_1791240046354.jpg',
        description: 'Le trio incontournable pour développer les sens et la motricité : anneaux en bois, boîte à formes et doudou lange bio.',
        includedProductIds: [401, 404],
        includedItems: ['Pack Éveil Montessori en Bois Naturel', 'Peluche Doudou Ourson Géant Ultra-Doux 60cm'],
        products: [allProducts[0], allProducts[3]]
    },
    {
        id: 4002,
        name: 'Pack Grand Architecte Créatif',
        title: 'Pack Grand Architecte Créatif',
        price: 249,
        oldPrice: 314,
        originalPrice: 314,
        discount: 20,
        imageUrl: '/src/assets/images/category_youpi_lego_1791240056376.jpg',
        description: 'La méga boîte de briques 850 pcs combinée avec la station spatiale pour des heures de construction infinies.',
        includedProductIds: [402, 407],
        includedItems: ['Boîte de Construction Briques Créatives 850 pcs', 'Station Spatiale & Fusée Décollage Lumineuse'],
        products: [allProducts[1], allProducts[6]]
    }
];

const stores = [
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
    }
];

const initialAdvertisements = {
    hero: {
        badge: 'LE ROYAUME DES JOUETS & DU SOURIRE',
        title: 'FAIRE BRILLER LES YEUX',
        titleHighlight: 'DE VOS ENFANTS',
        subtitle: 'Des jouets éducatifs, créatifs et durables pour émerveiller petits et grands.',
        cta: 'Voir les Nouveautés',
        bgImage: '/src/assets/images/hero_youpishop_toys_1791240036994.jpg'
    },
    promoBanner: {
        tag: 'OFFRE ANNIVERSAIRE & FÊTES',
        title: 'JUSQU\'À',
        discountHighlight: '-20%',
        description: 'Sur tous les jeux d\'éveil en bois naturel et constructions Lego',
        buttonText: 'Découvrir les offres',
        categoryTarget: 'Construction & Lego',
        bgImage: '/src/assets/images/category_youpi_lego_1791240056376.jpg'
    },
    youpiHome: {
        hero: {
            badge: 'LE ROYAUME DES JOUETS & DU SOURIRE',
            title: 'FAIRE BRILLER LES YEUX',
            titleHighlight: 'DE VOS ENFANTS',
            description: 'Des milliers de jouets d\'éveil, jeux de société et briques de construction livrés rapidement chez vous partout en Tunisie.',
            buttonText: 'Explorer le catalogue',
            buttonCategory: 'all',
            bgImage: '/src/assets/images/hero_youpishop_toys_1791240036994.jpg',
            stickerLeft: '🧸 Éveil Montessori',
            stickerRight: '🎁 Emballage Cadeau Offert'
        },
        promoBanner: {
            tag: 'OFFRE ANNIVERSAIRE & FÊTES',
            title: 'JUSQU\'À',
            discountHighlight: '-20%',
            description: 'Sur tous les jeux d\'éveil en bois naturel et constructions Lego',
            buttonText: 'Découvrir les offres',
            categoryTarget: 'Construction & Lego',
            bgImage: '/src/assets/images/category_youpi_lego_1791240056376.jpg'
        },
        bestsellersTitle: 'Nos Bestsellers Coups de Cœur',
        bestsellersKicker: 'LES JOUETS LES PLUS DEMANDÉS',
        ageCategoriesTitle: 'Trouver le Jouet Idéal selon l\'Âge',
        ageCategoriesKicker: 'PAR TRANCHE D\'ÂGE',
        trustBadges: [
            { id: 1, title: 'Livraison rapide ✨', subtitle: '24/48h partout en Tunisie', icon: 'truck' },
            { id: 2, title: 'Paiement sécurisé ✨', subtitle: '100% fiable à la livraison', icon: 'shield' },
            { id: 3, title: 'Service client ✨', subtitle: 'À votre écoute 7j/7', icon: 'headphones' },
            { id: 4, title: 'Retour facile ✨', subtitle: 'Sous 14 jours', icon: 'refresh' }
        ]
    }
};

const promotions = [
    {
        id: 'promo-youpi-1',
        title: 'Remise Spéciale Anniversaire',
        code: 'ANNIV15',
        discountPercentage: 15,
        validUntil: '2026-12-31'
    }
];

const sampleOrders = [
    {
        id: 'CMD-YOUPI-101',
        orderNumber: 'CMD-YOUPI-101',
        customerName: 'Ines Ben Salem',
        customerEmail: 'ines.bensalem@gmail.com',
        customer: {
            name: 'Ines Ben Salem',
            email: 'ines.bensalem@gmail.com',
            phone: '+216 98 123 456',
            address: '14 Rue des Orangers, La Marsa, Tunis'
        },
        items: [
            {
                id: 401,
                name: 'Pack Éveil Montessori en Bois Naturel',
                quantity: 1,
                price: 89,
                imageUrl: '/src/assets/images/category_youpi_eveil_1791240046354.jpg'
            }
        ],
        total: 89,
        totalAmount: 89,
        paymentMethod: 'Paiement à la livraison (Espèces)',
        status: 'Livrée',
        date: '2026-03-28'
    },
    {
        id: 'CMD-YOUPI-102',
        orderNumber: 'CMD-YOUPI-102',
        customerName: 'Mehdi Trabelsi',
        customerEmail: 'mehdi.trabelsi@yahoo.fr',
        customer: {
            name: 'Mehdi Trabelsi',
            email: 'mehdi.trabelsi@yahoo.fr',
            phone: '+216 24 555 888',
            address: 'Avenue Habib Bourguiba, Sousse'
        },
        items: [
            {
                id: 402,
                name: 'Boîte de Construction Briques Créatives 850 pcs',
                quantity: 1,
                price: 139,
                imageUrl: '/src/assets/images/category_youpi_lego_1791240056376.jpg'
            }
        ],
        total: 139,
        totalAmount: 139,
        paymentMethod: 'Paiement à la livraison (Espèces)',
        status: 'Expédiée',
        date: '2026-04-01'
    }
];

const blogPosts = [
    {
        id: 1,
        title: 'Comment choisir les meilleurs jouets d\'éveil pour bébé (0 à 2 ans) ?',
        date: '15 Mars 2026',
        summary: 'Découvrez les bienfaits de la pédagogie Montessori pour encourager l\'autonomie et la créativité dès les premiers mois.',
        image: '/src/assets/images/category_youpi_eveil_1791240046354.jpg'
    },
    {
        id: 2,
        title: 'Les 5 meilleurs jeux de société familiaux pour des soirées mémorables',
        date: '22 Mars 2026',
        summary: 'Partager un moment convivial loin des écrans : notre sélection de jeux accessibles dès 6 ans.',
        image: '/src/assets/images/category_youpi_societe_1791240065789.jpg'
    }
];

const contactMessages = [
    {
        id: 'msg-youpi-1',
        name: 'Sonia Dridi',
        email: 'sonia.dridi@gmail.com',
        phone: '+216 97 456 123',
        subject: 'Conseil cadeau fille 4 ans',
        message: 'Bonjour, je cherche un jeu créatif pour l\'anniversaire de ma nièce de 4 ans. Pouvez-vous me conseiller entre la boîte de briques et le coffret de peinture ?',
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

module.exports = {
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
