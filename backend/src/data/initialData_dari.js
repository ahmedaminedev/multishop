const allProducts = [
    {
        id: 701,
        name: 'Canapé 3 Places Scandinave Velours Côtelé',
        brand: 'Maison Dari',
        price: 1890,
        oldPrice: 2200,
        imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800',
        images: [
            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800',
            'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=800'
        ],
        discount: 14,
        category: 'Mobilier & Salons',
        parentCategory: 'Mobilier',
        promo: true,
        description: 'Canapé élégant 3 places avec assise ultra-confortable en velours côtelé antitache. Structure en bois de hêtre massif et pieds en métal noir mat.',
        quantity: 12,
        rating: 5,
        reviewsCount: 34,
        pieceMaison: 'Salon & Séjour',
        materiauPrincipal: 'Velours côtelé & Hêtre massif',
        styleDeco: 'Scandinave & Cosy',
        dimensions: '220 x 95 x 82 cm',
        specifications: [
            { name: 'Dimensions', value: '220 x 95 x 82 cm' },
            { name: 'Assise', value: 'Mousse haute résilience 35 kg/m³' },
            { name: 'Entretien', value: 'Tissu déperlant nettoyable à sec' },
            { name: 'Garantie', value: '3 ans structure' }
        ]
    },
    {
        id: 702,
        name: 'Table Basse Ovale en Chêne Massif & Céramique',
        brand: 'Nordic Living',
        price: 580,
        oldPrice: 690,
        imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=800',
        images: ['https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=800'],
        discount: 16,
        category: 'Mobilier & Salons',
        parentCategory: 'Mobilier',
        promo: true,
        description: 'Table basse design organique aux courbes douces. Plateau en céramique effet marbre blanc résistant aux rayures et piétement en chêne naturel verni.',
        quantity: 18,
        rating: 5,
        reviewsCount: 29,
        pieceMaison: 'Salon & Séjour',
        materiauPrincipal: 'Chêne naturel & Céramique',
        styleDeco: 'Minimaliste Chic',
        dimensions: '110 x 60 x 42 cm',
        specifications: [
            { name: 'Dimensions', value: '110 x 60 x 42 cm' },
            { name: 'Plateau', value: 'Céramique 6mm anti-rayures' },
            { name: 'Poids', value: '18 kg' }
        ]
    },
    {
        id: 703,
        name: 'Lampadaire d\'Ambiance Laiton Doré & Globe Verre Fumé',
        brand: 'Lumina Studio',
        price: 340,
        oldPrice: 420,
        imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800',
        images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800'],
        discount: 19,
        category: 'Luminaires & Éclairage',
        parentCategory: 'Luminaires',
        promo: true,
        description: 'Lampadaire sur pied sculptural en laiton brossé or mat avec diffuseur globe en verre fumé soufflé à la bouche. Variateur d\'intensité tactile au pied.',
        quantity: 24,
        rating: 5,
        reviewsCount: 42,
        pieceMaison: 'Salon / Chambre',
        materiauPrincipal: 'Laiton brossé & Verre soufflé',
        styleDeco: 'Art Déco Contemporain',
        dimensions: 'Hauteur 155 cm, Base 30 cm',
        specifications: [
            { name: 'Hauteur', value: '155 cm' },
            { name: 'Ampoule', value: 'E27 LED blanc chaud incluse' },
            { name: 'Variateur', value: '3 niveaux d\'intensité' }
        ]
    },
    {
        id: 704,
        name: 'Miroir Arche Majestueux Métal Noir 180cm',
        brand: 'Design Lab',
        price: 490,
        oldPrice: 590,
        imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800',
        images: ['https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800'],
        discount: 17,
        category: 'Décoration & Miroirs',
        parentCategory: 'Décoration',
        promo: true,
        description: 'Grand miroir psyché en arche à poser au sol ou à suspendre. Cadre fin en aluminium thermolaqué noir, verre trempé haute définition anti-éclats.',
        quantity: 15,
        rating: 5,
        reviewsCount: 56,
        pieceMaison: 'Chambre, Entrée ou Dressing',
        materiauPrincipal: 'Aluminium noir & Verre trempé',
        styleDeco: 'Bohème & Haussmannien',
        dimensions: '180 x 80 cm',
        specifications: [
            { name: 'Dimensions', value: '180 x 80 x 3 cm' },
            { name: 'Installation', value: 'À poser au sol ou fixation murale' },
            { name: 'Sécurité', value: 'Film protecteur anti-éclats' }
        ]
    },
    {
        id: 705,
        name: 'Tapis Berbère Beni Ouarain Laine Vierge Tissé Main',
        brand: 'Atelier Berbère',
        price: 760,
        oldPrice: 890,
        imageUrl: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?q=80&w=800',
        images: ['https://images.unsplash.com/photo-1600121848594-d8644e57abab?q=80&w=800'],
        discount: 15,
        category: 'Linge de Maison & Tapis',
        parentCategory: 'Textile & Tapis',
        promo: false,
        description: 'Tapis authentique tissé à la main avec une laine vierge naturelle d\'une infinie douceur. Motifs géométriques traditionnels asymétriques.',
        quantity: 8,
        rating: 5,
        reviewsCount: 21,
        pieceMaison: 'Salon ou Chambre',
        materiauPrincipal: '100% Laine vierge naturelle',
        styleDeco: 'Berbère Moderne & Éthique',
        dimensions: '200 x 300 cm',
        specifications: [
            { name: 'Dimensions', value: '200 x 300 cm' },
            { name: 'Fabrication', value: 'Tissage artisanal nœud par nœud' },
            { name: 'Épaisseur', value: 'Moelleux 30 mm' }
        ]
    },
    {
        id: 706,
        name: 'Service de Vaisselle en Grès Émaillé 24 Pièces',
        brand: 'Artisanat Tunisien',
        price: 290,
        oldPrice: 350,
        imageUrl: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?q=80&w=800',
        images: ['https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?q=80&w=800'],
        discount: 17,
        category: 'Art de la Table & Cuisine',
        parentCategory: 'Art de la Table',
        promo: true,
        description: 'Service complet pour 6 personnes façonné en grès artisanal de Nabeul avec émaillage réactif aux nuances sable et terracotta. Compatible lave-vaisselle et micro-ondes.',
        quantity: 22,
        rating: 5,
        reviewsCount: 38,
        pieceMaison: 'Salle à manger & Cuisine',
        materiauPrincipal: 'Grès émaillé réactif',
        styleDeco: 'Méditerranéen & Naturel',
        dimensions: '6 grandes assiettes, 6 creuses, 6 dessert, 6 bols',
        specifications: [
            { name: 'Composition', value: '24 pièces pour 6 convives' },
            { name: 'Entretien', value: 'Lave-vaisselle & micro-ondes OK' },
            { name: 'Origine', value: 'Atelier d\'art Nabeul' }
        ]
    },
    {
        id: 707,
        name: 'Fauteuil Lounge Bouclette Écru & Bois Noyer',
        brand: 'Maison Dari',
        price: 820,
        oldPrice: 950,
        imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800',
        images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800'],
        discount: 14,
        category: 'Mobilier & Salons',
        parentCategory: 'Mobilier',
        promo: true,
        description: 'Fauteuil d\'appoint enveloppant au design iconique. Revêtement en tissu laine bouclée écru et structure ergonomique en noyer massif teinté.',
        quantity: 14,
        rating: 5,
        reviewsCount: 27,
        pieceMaison: 'Salon, Bureau ou Coin Lecture',
        materiauPrincipal: 'Laine bouclée & Noyer massif',
        styleDeco: 'Mid-Century Modern',
        dimensions: '82 x 78 x 76 cm',
        specifications: [
            { name: 'Dimensions', value: '82 x 78 x 76 cm' },
            { name: 'Garnissage', value: 'Mousse haute résilience' },
            { name: 'Charge maximale', value: '150 kg' }
        ]
    },
    {
        id: 708,
        name: 'Suspension Luminaire Rotin Tressé XXL Ø65cm',
        brand: 'Lumina Studio',
        price: 210,
        oldPrice: 260,
        imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800',
        images: ['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800'],
        discount: 19,
        category: 'Luminaires & Éclairage',
        parentCategory: 'Luminaires',
        promo: true,
        description: 'Lustre suspension aérien en rotin naturel tressé artisanalement. Crée de superbes jeux d\'ombre et de lumière chaleureuse au plafond et sur les murs.',
        quantity: 30,
        rating: 5,
        reviewsCount: 45,
        pieceMaison: 'Salle à manger, Salon ou Véranda',
        materiauPrincipal: 'Rotin naturel & Câble textile',
        styleDeco: 'Bohème & Naturel',
        dimensions: 'Diamètre 65 cm, Câble 150 cm réglable',
        specifications: [
            { name: 'Diamètre', value: '65 cm' },
            { name: 'Culot', value: 'E27 (LED recommandée)' },
            { name: 'Câble', value: 'Textile lin naturel réglable' }
        ]
    }
];

const categories = [
    {
        id: 1,
        name: 'Mobilier & Salons',
        description: 'Canapés velours, fauteuils lounge, tables basses et consoles contemporaines',
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600',
        count: 14,
        slug: 'mobilier-salons'
    },
    {
        id: 2,
        name: 'Luminaires & Éclairage',
        description: 'Lampadaires design, suspensions en rotin et lampes à poser tamisées',
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=600',
        count: 12,
        slug: 'luminaires-eclairage'
    },
    {
        id: 3,
        name: 'Décoration & Miroirs',
        description: 'Miroirs en arche, vases en céramique, horloges murales et statuettes',
        image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=600',
        count: 20,
        slug: 'decoration-miroirs'
    },
    {
        id: 4,
        name: 'Linge de Maison & Tapis',
        description: 'Tapis berbères, coussins velours, plaids en lin et parures de lit percale',
        image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?q=80&w=600',
        count: 18,
        slug: 'linge-tapis'
    },
    {
        id: 5,
        name: 'Art de la Table & Cuisine',
        description: 'Vaisselle en grès émaillé, couverts dorés, verres en cristal et plateaux bois',
        image: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?q=80&w=600',
        count: 16,
        slug: 'art-de-la-table'
    },
    {
        id: 6,
        name: 'Rangement & Dressings',
        description: 'Bibliothèques asymétriques, commodes cannelées et portants épurés',
        image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=600',
        count: 9,
        slug: 'rangement-dressings'
    }
];

const brands = [
    { id: 1, name: 'Maison Dari' },
    { id: 2, name: 'Nordic Living' },
    { id: 3, name: 'Atelier Berbère' },
    { id: 4, name: 'Design Lab' },
    { id: 5, name: 'Lumina Studio' },
    { id: 6, name: 'Artisanat Tunisien' }
];

const packs = [
    {
        id: 701,
        name: 'Pack Salon Contemporain Cosy',
        price: 2690,
        originalPrice: 3220,
        discount: 16,
        imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800',
        images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800'],
        description: 'L\'ensemble harmonieux complet pour transformer votre séjour : Canapé 3 places velours côtelé + Table basse chêne & céramique + Lampadaire laiton globe verre.',
        itemsIncluded: [
            'Canapé 3 Places Scandinave Velours Côtelé',
            'Table Basse Ovale en Chêne Massif & Céramique',
            'Lampadaire d\'Ambiance Laiton Doré & Globe Verre Fumé'
        ],
        badge: 'MEILLEURE VENTE'
    },
    {
        id: 702,
        name: 'Pack Suite Parentale Sérénité',
        price: 1390,
        originalPrice: 1730,
        discount: 20,
        imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800',
        images: ['https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800'],
        description: 'Sublimez votre chambre à coucher : Grand Miroir Arche métal noir 180cm + Fauteuil lounge bouclette + Parure de lit lin lavé.',
        itemsIncluded: [
            'Miroir Arche Majestueux Métal Noir 180cm',
            'Fauteuil Lounge Bouclette Écru & Bois Noyer',
            'Parure de Lit 240x260 Lin Lavé Naturel'
        ],
        badge: 'COUP DE CŒUR'
    }
];

const stores = [
    {
        id: 'dari-store-1',
        name: 'Showroom DariShop Les Berges du Lac 2',
        address: 'Rue de la Feuille d\'Érable, Les Berges du Lac 2, Tunis',
        phone: '+216 71 860 110',
        hours: 'Lun - Sam : 09h30 - 19h30',
        city: 'Tunis',
        image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=600'
    },
    {
        id: 'dari-store-2',
        name: 'Boutique Concept DariShop La Marsa',
        address: 'Avenue Habib Bourguiba, La Marsa Plage',
        phone: '+216 71 740 220',
        hours: 'Mar - Dim : 10h00 - 20h00',
        city: 'La Marsa',
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600'
    },
    {
        id: 'dari-store-3',
        name: 'Showroom DariShop Sousse Sahloul',
        address: 'Boulevard Yasser Arafat, Sahloul 3, Sousse',
        phone: '+216 73 380 450',
        hours: 'Lun - Sam : 09h00 - 19h00',
        city: 'Sousse',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=600'
    }
];

const initialAdvertisements = {
    logoConfig: {
        logoUrl: '',
        navbarHeight: 44,
        footerHeight: 50,
        textPrimary: 'Dari',
        textSecondary: 'Shop',
        tagline: 'Maison & Décoration'
    },
    dariHome: {
        hero: {
            badge: 'Votre maison, notre inspiration',
            title: 'Aménagez votre intérieur',
            titleHighlight: 'avec style',
            description: 'Mobilier, décoration, rangements et plus encore...\npour une maison qui vous ressemble.',
            buttonText: 'Découvrir la collection',
            buttonCategory: 'all',
            bgImage: '/uploads/darishop_hero_livingroom.jpg'
        },
        promoBanner: {
            tag: 'OFFRE SPÉCIALE DÉCO',
            title: "JUSQU'À",
            discountHighlight: '-30%',
            description: 'SUR LES CANAPÉS, FAUTEUILS DESIGN ET LUMINAIRES D\'AMBIANCE',
            buttonText: 'Voir les offres déco',
            categoryTarget: 'Mobilier & Salons',
            bgImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1200'
        },
        bestsellersTitle: 'Nos Incontournables Coups de Cœur',
        bestsellersKicker: 'LES PIÈCES LES PLUS PLÉBISCITÉES',
        trustBadges: [
            { id: 1, title: 'Produits de qualité', subtitle: 'Sélectionnés avec soin', icon: 'shield' },
            { id: 2, title: 'Service client', subtitle: 'À votre écoute 7j/7', icon: 'headphones' },
            { id: 3, title: 'Paiement à la livraison', subtitle: 'Plus de sécurité', icon: 'credit-card' },
            { id: 4, title: 'Une maison plus belle', subtitle: 'à petit prix', icon: 'sprout' }
        ]
    }
};

const promotions = [
    {
        id: 'promo-dari-1',
        code: 'DARI15',
        title: 'Offre Bienvenue DariShop',
        discount: 15,
        type: 'percentage',
        expirationDate: '2026-12-31',
        description: '-15% sur votre première commande mobilier avec le code DARI15'
    },
    {
        id: 'promo-dari-2',
        code: 'DECOVIP',
        title: 'Offre VIP Luminaires & Déco',
        discount: 50,
        type: 'fixed',
        expirationDate: '2026-06-30',
        description: '50 DT de remise immédiate dès 300 DT d\'achats déco'
    }
];

const sampleOrders = [
    {
        id: 'CMD-DARI-101',
        date: '2026-03-28T14:20:00.000Z',
        total: 1890,
        totalAmount: 1890,
        status: 'Livrée',
        customer: {
            firstName: 'Nadia',
            lastName: 'Cherif',
            email: 'nadia.cherif@gmail.com',
            phone: '+216 98 222 333',
            address: 'Résidence Les Pins, Les Berges du Lac 2',
            city: 'Tunis'
        },
        items: [
            { id: 701, name: 'Canapé 3 Places Scandinave Velours Côtelé', price: 1890, quantity: 1 }
        ]
    },
    {
        id: 'CMD-DARI-102',
        date: '2026-04-01T10:15:00.000Z',
        total: 830,
        totalAmount: 830,
        status: 'En attente',
        customer: {
            firstName: 'Tarak',
            lastName: 'Ben Amor',
            email: 'tarak.benamor@topnet.tn',
            phone: '+216 22 555 777',
            address: 'Villa 14, Rue des Jasmins, Kantaoui',
            city: 'Sousse'
        },
        items: [
            { id: 703, name: 'Lampadaire d\'Ambiance Laiton Doré & Globe Verre Fumé', price: 340, quantity: 1 },
            { id: 704, name: 'Miroir Arche Majestueux Métal Noir 180cm', price: 490, quantity: 1 }
        ]
    }
];

const blogPosts = [
    {
        id: 1,
        title: '5 conseils d\'architecte d\'intérieur pour agrandir visuellement son salon',
        date: '10 Mars 2026',
        summary: 'Jouer avec les miroirs en arche, opter pour des luminaires à hauteur variable et choisir des matières lumineuses.',
        image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=600'
    },
    {
        id: 2,
        title: 'La tendance velours côtelé & teintes terreuses dans la déco 2026',
        date: '24 Mars 2026',
        summary: 'Terracotta, vert sauge et écru : comment harmoniser votre mobilier contemporain avec chaleur et naturel.',
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600'
    }
];

const contactMessages = [
    {
        id: 'msg-dari-1',
        name: 'Inès Marzouki',
        email: 'ines.marzouki@yahoo.fr',
        phone: '+216 20 123 456',
        subject: 'Demande échantillon velours pour canapé',
        message: 'Bonjour, est-il possible de recevoir un échantillon de tissu velours côtelé vert forêt ou de passer au showroom du Lac 2 ?',
        date: '2026-04-02',
        read: false
    },
    {
        id: 'msg-dari-2',
        name: 'Wassim Belhadj',
        email: 'wassim.b@gmail.com',
        phone: '+216 99 876 543',
        subject: 'Délai livraison meuble sur Sfax',
        message: 'Bonjour, quel est le délai pour la livraison et le montage d\'un canapé 3 places sur Sfax ? Merci.',
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
