
// ... keep products array as is ...
const allProducts = [
    { id: 1, name: 'Iso-Whey Zero Native 2.2kg', brand: 'BIOTECH USA', price: 289, oldPrice: 320, imageUrl: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?q=80&w=400&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?q=80&w=400&auto=format&fit=crop'], discount: 10, category: 'Protéines', promo: true, description: 'Isolat de whey protéine premium sans sucre, sans lactose et sans gluten. Idéal pour la prise de muscle sec.', quantity: 50, specifications: [{ name: 'Protéines', value: '25g/dose' }, { name: 'Poids', value: '2.27kg' }] },
    { id: 2, name: 'Creatine Monohydrate 500g', brand: 'OPTIMUM NUTRITION', price: 85, oldPrice: 110, imageUrl: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?q=80&w=400&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1593095948071-474c5cc2989d?q=80&w=400&auto=format&fit=crop'], discount: 22, category: 'Performance', promo: true, description: 'Créatine micronisée pure pour augmenter la force explosive et la performance musculaire lors d\'efforts courts et intenses.', quantity: 100 },
    // ... keep other products ...
    { id: 3, name: 'Gold Standard 100% Whey', brand: 'OPTIMUM NUTRITION', price: 245, oldPrice: 270, imageUrl: 'https://images.unsplash.com/photo-1622484214029-0de9320b9247?q=80&w=400&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1622484214029-0de9320b9247?q=80&w=400&auto=format&fit=crop'], discount: 9, category: 'Protéines', description: 'La référence mondiale des protéines whey. Mélange d\'isolat et de concentré pour une récupération optimale.', quantity: 80 },
    { id: 4, name: 'C4 Original Pre-Workout', brand: 'CELLUCOR', price: 95, imageUrl: 'https://images.unsplash.com/photo-1626968474239-2a900994cb9d?q=80&w=400&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1626968474239-2a900994cb9d?q=80&w=400&auto=format&fit=crop'], category: 'Pre-Workout', description: 'Énergie explosive, endurance accrue et congestion musculaire. Le booster n°1 aux USA.', quantity: 45 },
    { id: 5, name: 'BCAA Xplode Powder', brand: 'OLIMP', price: 120, oldPrice: 140, imageUrl: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?q=80&w=400&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1546483875-ad9014c88eba?q=80&w=400&auto=format&fit=crop'], discount: 14, category: 'Acides Aminés', description: 'BCAA ratio 2:1:1 enrichi en glutamine et vitamine B6 pour une récupération anti-catabolique.', quantity: 60 },
    { id: 6, name: 'Mass Tech Extreme 2000', brand: 'MUSCLETECH', price: 340, imageUrl: 'https://images.unsplash.com/photo-1622484214532-6b99015c7427?q=80&w=400&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1622484214532-6b99015c7427?q=80&w=400&auto=format&fit=crop'], category: 'Prise de Masse', description: 'Gainer hypercalorique pour les profils ectomorphes. Apport massif en glucides et protéines.', quantity: 20, specifications: [{ name: 'Calories', value: '2000+' },{ name: 'Poids', value: '3kg' }] },
    { id: 7, name: 'Multivitamin for Men', brand: 'BIOTECH USA', price: 45, oldPrice: 60, imageUrl: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?q=80&w=400&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1550572017-edd951aa8f72?q=80&w=400&auto=format&fit=crop'], discount: 25, category: 'Santé & Bien-être', description: 'Complexe complet de vitamines et minéraux formulé spécifiquement pour les hommes actifs.', quantity: 150 },
    { id: 8, name: 'Shaker Pro Metal 700ml', brand: 'IRONFUEL', price: 35, imageUrl: 'https://images.unsplash.com/photo-1575459372270-36a8779b7c3c?q=80&w=400&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1575459372270-36a8779b7c3c?q=80&w=400&auto=format&fit=crop'], category: 'Accessoires', description: 'Shaker en acier inoxydable, robuste et sans odeur. Design ergonomique.', quantity: 200 },
    { id: 9, name: 'Peanut Butter 1kg', brand: 'PROZIS', price: 28, imageUrl: 'https://images.unsplash.com/photo-1527663327663-128c94982a39?q=80&w=400&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1527663327663-128c94982a39?q=80&w=400&auto=format&fit=crop'], category: 'Nutrition', description: 'Beurre de cacahuète 100% naturel, riche en protéines et bonnes graisses. Sans huile de palme.', quantity: 100 },
    { id: 10, name: 'Omega 3 Gold', brand: 'MAXLER', price: 55, oldPrice: 70, imageUrl: 'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?q=80&w=400&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?q=80&w=400&auto=format&fit=crop'], discount: 21, category: 'Santé & Bien-être', description: 'Huile de poisson haute concentration en EPA et DHA pour la santé cardiovasculaire.', quantity: 90 },
    { id: 11, name: 'Ceinture de Musculation Cuir', brand: 'GORILLA WEAR', price: 110, imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400&auto=format&fit=crop'], category: 'Accessoires', description: 'Ceinture lombaire en cuir véritable pour un soutien maximal lors des squats et soulevés de terre.', quantity: 30 },
    { id: 12, name: 'ZMA Night Recovery', brand: 'SCITEC', price: 49, imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=400&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=400&auto=format&fit=crop'], category: 'Récupération', description: 'Zinc, Magnésium et B6 pour optimiser le sommeil et la récupération nerveuse.', quantity: 60 },
    { id: 13, name: 'Barre Protéinée Carb Killa (Boite de 12)', brand: 'GRENADE', price: 85, oldPrice: 95, imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400&auto=format&fit=crop'], discount: 10, category: 'Snacks', promo: true, description: 'Barre faible en sucre avec 23g de protéines. Goût incroyable.', quantity: 40 },
    { id: 14, name: 'Bandages Poignets (Paire)', brand: 'IRONFUEL', price: 25, imageUrl: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=400&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=400&auto=format&fit=crop'], category: 'Accessoires', description: 'Soutien renforcé pour les exercices de poussée lourds.', quantity: 150 },
    { id: 15, name: 'L-Carnitine 3000 Shot', brand: 'BIOTECH USA', price: 4, oldPrice: 6, imageUrl: 'https://images.unsplash.com/photo-1579722822553-73775073cb43?q=80&w=400&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1579722822553-73775073cb43?q=80&w=400&auto=format&fit=crop'], discount: 33, category: 'Perte de Poids', promo: true, description: 'Ampoule liquide pour mobiliser les graisses pendant l\'effort. Action rapide.', quantity: 500 }
];

// ... categories, packs, stores, promotions, orders, blogPosts, contactMessages ...
const categories = [
    { name: 'Packs Promo' },
    { 
        name: 'Protéines', 
        megaMenu: [
            { 
                title: 'Types', 
                items: [
                    { name: 'Whey Isolate' },
                    { name: 'Whey Concentrate' },
                    { name: 'Caséine' },
                    { name: 'Protéine Végétale' },
                    { name: 'Hydrolysée' },
                ]
            },
            { 
                title: 'Objectifs', 
                items: [
                    { name: 'Prise de masse' },
                    { name: 'Maintien musculaire' },
                    { name: 'Sèche' },
                ]
            }
        ]
    },
    { 
        name: 'Performance', 
        megaMenu: [
            {
                title: 'Boosters',
                items: [
                    { name: 'Pre-Workout' },
                    { name: 'Pump (Sans Caféine)' },
                    { name: 'Énergie & Caféine' },
                ]
            },
            {
                title: 'Endurance',
                items: [
                    { name: 'Créatine' },
                    { name: 'Beta Alanine' },
                    { name: 'Électrolytes' },
                ]
            }
        ]
    },
    { name: 'Acides Aminés', subCategories: ['BCAA', 'EAA', 'Glutamine', 'Arginine'] },
    { name: 'Prise de Masse', subCategories: ['Gainers', 'Mass Gainers', 'Glucides en poudre'] },
    { name: 'Perte de Poids', subCategories: ['Brûleurs de graisse', 'L-Carnitine', 'Diurétiques', 'CLA'] },
    { name: 'Santé & Bien-être', subCategories: ['Multivitamines', 'Oméga 3', 'Articulations', 'Sommeil (ZMA)'] },
    { name: 'Accessoires', subCategories: ['Shakers', 'Ceintures', 'Gants', 'Sangles', 'Vêtements'] },
    { name: 'Snacks', subCategories: ['Barres Protéinées', 'Beurres de Cacahuète', 'Boissons'] }
];

const packs = [
    { 
        id: 1, 
        name: 'Pack Prise de Masse Ultime', 
        description: 'Le combo gagnant pour exploser votre volume. Gainer, Créatine et Shaker offert.',
        price: 399,
        oldPrice: 460,
        discount: 13,
        imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop',
        includedItems: ['Mass Tech 3kg', 'Creatine 500g', 'Shaker Pro'],
        includedProductIds: [6, 2, 8]
    },
    { 
        id: 2, 
        name: 'Pack Sèche & Définition', 
        description: 'Brûlez les graisses tout en maintenant votre muscle. Isolat, Brûleur et Carnitine.',
        price: 350,
        oldPrice: 420,
        discount: 16,
        imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400&auto=format&fit=crop',
        includedItems: ['Iso-Whey Zero', 'L-Carnitine', 'Omega 3'],
        includedProductIds: [1, 15, 10]
    },
    { 
        id: 3, 
        name: 'Starter Pack Débutant', 
        description: 'Tout ce qu\'il faut pour bien démarrer la musculation.',
        price: 199,
        oldPrice: 245,
        discount: 19,
        imageUrl: 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?q=80&w=400&auto=format&fit=crop',
        includedItems: ['Whey Gold Standard', 'Shaker', 'Multivitamines'],
        includedProductIds: [3, 8, 7]
    }
];

const stores = [
    {
        id: 1,
        name: "IronFuel Gym Store - Lac 1",
        address: "Rue du Lac Windermere",
        city: "Tunis",
        postalCode: "1053",
        phone: "+216 71 000 111",
        email: "lac@ironfuel.tn",
        openingHours: "Lun - Sam: 09h00 - 21h00",
        imageUrl: "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=600&auto=format&fit=crop",
        isPickupPoint: true,
        mapUrl: ""
    },
    {
        id: 2,
        name: "IronFuel Sousse",
        address: "Avenue Khezama",
        city: "Sousse",
        postalCode: "4000",
        phone: "+216 73 222 333",
        email: "sousse@ironfuel.tn",
        openingHours: "Lun - Dim: 10h00 - 22h00",
        imageUrl: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=600&auto=format&fit=crop",
        isPickupPoint: true,
        mapUrl: ""
    }
];

const promotions = [
    {
        id: 1,
        name: "Summer Shredding",
        discountPercentage: 15,
        startDate: "2024-05-01",
        endDate: "2024-06-30",
        productIds: [1, 15, 13],
        packIds: [2],
    }
];

const blogPosts = [
    {
        id: 1,
        slug: 'creatine-guide-complet',
        title: 'Tout savoir sur la Créatine : Mythes et Réalités',
        excerpt: 'Faut-il faire une phase de charge ? Est-ce dangereux pour les reins ? On démêle le vrai du faux.',
        content: 'La créatine est le supplément le plus étudié au monde. Elle améliore la force, la puissance et la masse musculaire...',
        imageUrl: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?q=80&w=800',
        author: 'Coach Mehdi',
        authorImageUrl: 'https://i.pravatar.cc/150?u=mehdi',
        date: '2023-11-15',
        category: 'Nutrition',
        featured: true,
    },
    {
        id: 2,
        slug: 'programme-prise-masse',
        title: 'Programme Prise de Masse : Nutrition et Entraînement',
        excerpt: 'Comment manger pour grossir sans prendre trop de gras ? Les secrets de l\'hypertrophie.',
        content: 'Pour prendre de la masse, vous devez être en surplus calorique. Mais attention, pas n\'importe quelles calories...',
        imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800',
        author: 'Ahmed Fit',
        authorImageUrl: 'https://i.pravatar.cc/150?u=ahmed',
        date: '2023-11-10',
        category: 'Entraînement',
    }
];

const contactMessages = [
    { id: 1, name: 'Karim Ben', email: 'karim@email.com', subject: 'Conseil Gainer', message: 'Je suis très maigre, quel gainer me conseillez-vous ?', date: '2023-11-20', read: false },
];

const sampleOrders = [
    { 
        id: 'IF-9901', 
        customerName: 'Sami Tounsi', 
        date: '2023-11-12', 
        total: 289, 
        status: 'Livrée', 
        itemCount: 1,
        items: [{ ...allProducts[0], productId: 1, quantity: 1, price: 289 }],
        shippingAddress: { id: 1, type: 'Domicile', street: 'Av Bourguiba', city: 'Sfax', postalCode: '3000', isDefault: true },
        paymentMethod: 'Paiement à la livraison'
    }
];

const initialAdvertisements = {
    heroSlides: [
        {
            id: 1,
            bgImage: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop",
            title: "FORGEZ VOTRE <span class='text-neon-400'>LÉGENDE</span>",
            subtitle: "La nutrition de l'élite. Performances pures, résultats garantis.",
            buttonText: "ACHETER MAINTENANT"
        },
        {
            id: 2,
            bgImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop",
            videoUrl: "", // Optional video
            title: "NOUVELLE GAMME <span class='text-red-600'>HARDCORE</span>",
            subtitle: "Boosters pré-entraînement interdits aux faibles.",
            buttonText: "DÉCOUVRIR"
        },
        {
            id: 3,
            bgImage: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=1200&auto=format&fit=crop",
            title: "RÉCUPÉRATION <span class='text-blue-500'>MAXIMALE</span>",
            subtitle: "Dormez mieux, grandissez plus. Nos formules ZMA et Caséine.",
            buttonText: "VOIR LES PRODUITS"
        }
    ],
    trustBadges: [
        { id: 1, title: 'Livraison Express', subtitle: '24/48H Partout' },
        { id: 2, title: 'Authenticité 100%', subtitle: 'Produits Certifiés' },
        { id: 3, title: 'Expertise Pro', subtitle: 'Conseils de Coachs' },
        { id: 4, title: 'Meilleur Prix', subtitle: 'Garanti sur le marché' }
    ],
    audioPromo: [
        {
            id: 1,
            title: "CREATINE GRATUITE",
            subtitle1: "OFFRE SPÉCIALE",
            subtitle2: "Pour tout achat > 200 DT ce mois-ci",
            image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?q=80&w=600&auto=format&fit=crop",
            background: "from-gray-900 to-gray-800",
            duration: 8,
        }
    ],
    promoBanners: [
        {
            id: 1,
            title: "WHEY ISOLATE",
            subtitle: "La pureté ultime pour vos muscles",
            buttonText: "COMMANDER",
            image: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?q=80&w=600&auto=format&fit=crop",
            linkType: 'category',
            linkTarget: 'Protéines',
        },
        {
            id: 2,
            title: "PACKS MASSE",
            subtitle: "Gagnez du volume rapidement",
            buttonText: "VOIR LES PACKS",
            image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop",
            linkType: 'category',
            linkTarget: 'Prise de Masse',
        }
    ],
    smallPromoBanners: [], 
    editorialCollage: [
        {
            id: 1,
            imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop",
            title: "WORKOUT GEAR",
            subtitle: "Accessoires Pro",
            link: "#",
            size: "large"
        },
        {
            id: 2,
            imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=400&auto=format&fit=crop",
            title: "CARDIO",
            subtitle: "Brûleurs",
            link: "#",
            size: "small"
        },
        {
            id: 3,
            imageUrl: "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=400&auto=format&fit=crop",
            title: "LIFT HEAVY",
            subtitle: "Straps & Ceintures",
            link: "#",
            size: "small"
        },
        {
            id: 4,
            imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=600&auto=format&fit=crop",
            title: "NUTRITION",
            subtitle: "Healthy Snacks",
            link: "#",
            size: "tall"
        },
        {
            id: 5,
            imageUrl: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=400&auto=format&fit=crop",
            title: "GYM LIFE",
            link: "#",
            size: "small"
        }
    ],
    shoppableVideos: [
        {
            id: 1,
            thumbnailUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop",
            videoUrl: "", 
            username: "@iron_mike",
            description: "Ma stack pre-workout explosive 💥",
            productIds: [4, 2]
        },
        {
            id: 2,
            thumbnailUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop",
            videoUrl: "",
            username: "@sarah_fit",
            description: "Protéine parfaite pour la récup 🥤",
            productIds: [1]
        }
    ],
    newArrivals: {
        title: "NOUVEAUTÉS",
        productIds: [1, 4, 13, 2],
        limit: 8
    },
    summerSelection: {
        title: "SPÉCIAL SÈCHE",
        productIds: [15, 10, 1, 12],
        limit: 8
    },
    virtualTryOn: {
        title: "VOTRE OBJECTIF ?",
        description: "Découvrez les compléments adaptés à votre morphologie et vos buts.",
        buttonText: "FAIRE LE QUIZ",
        imageLeft: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=800&auto=format&fit=crop",
        imageRight: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop",
        link: "#"
    },
    featuredGrid: {
        title: "BEST SELLERS",
        productIds: [3, 2, 6, 4],
        buttonText: "VOIR LE CLASSEMENT",
        buttonLink: "#"
    }
};

module.exports = {
    allProducts,
    categories,
    packs,
    stores,
    initialAdvertisements,
    promotions,
    sampleOrders,
    blogPosts,
    contactMessages
};
