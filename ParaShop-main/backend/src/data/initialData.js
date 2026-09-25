
const allProducts = [
    { 
        id: 1, 
        name: 'Sérum Éclat Vitamine C Liposomale - 15%', 
        brand: 'L-DERMA LAB', 
        price: 89.000, 
        oldPrice: 115.000, 
        imageUrl: 'https://images.unsplash.com/photo-1570172619383-2ef40176191a?q=80&w=600&auto=format&fit=crop', 
        images: ['https://images.unsplash.com/photo-1570172619383-2ef40176191a?q=80&w=600&auto=format&fit=crop'], 
        discount: 22, 
        category: 'Dermo-cosmétique', 
        promo: true, 
        description: 'Solution antioxydante haute performance pour un teint rayonnant.', 
        quantity: 85, 
        specifications: [{ name: 'Volume', value: '30ml' }, { name: 'Usage', value: 'Quotidien' }] 
    },
    { 
        id: 2, 
        name: 'Baume Réparateur Intense - Peaux Sensibles', 
        brand: 'BIO-BOTANIC', 
        price: 45.500, 
        imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop', 
        category: 'Dermo-cosmétique', 
        description: 'Soin apaisant immédiat pour les irritations cutanées.', 
        quantity: 120 
    }
];

const categories = [
    { name: 'Micronutrition', subCategories: ['Vitamines', 'Sommeil', 'Énergie'] },
    { name: 'Dermo-cosmétique', subCategories: ['Visage', 'Corps', 'Cheveux'] },
    { name: 'Solaire', subCategories: ['SPF 50+', 'Après-Soleil'] },
    { name: 'Bébé & Maman', subCategories: ['Hygiène', 'Lait Maternisé'] },
    { name: 'Bio & Naturel', subCategories: ['Huiles Essentielles', 'Tisanes'] }
];

const initialAdvertisements = {
    heroSlides: [
        {
            id: 1,
            bgImage: "https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?q=80&w=1600&auto=format&fit=crop",
            title: "L'EXPERTISE <br/><span class='text-brand-primary italic'>PHARMACEUTIQUE</span>",
            subtitle: "Sélection rigoureuse des meilleurs laboratoires internationaux pour votre bien-être au quotidien.",
            buttonText: "DÉCOUVRIR LE CATALOGUE"
        }
    ],
    trustBadges: [
        { id: 1, title: 'Laboratoires Certifiés', subtitle: 'Produits 100% authentiques' },
        { id: 2, title: 'Conseils Experts', subtitle: 'Pharmaciens à votre écoute' },
        { id: 3, title: 'Livraison Express', subtitle: 'Sous 48h partout en Tunisie' },
        { id: 4, title: 'Paiement Sécurisé', subtitle: 'En ligne ou à la livraison' }
    ],
    promoBanners: [
        {
            id: 101,
            title: "Routine <br/>Éclat Pur",
            subtitle: "Redonnez vie à votre teint avec nos cures de Vitamine C concentrée.",
            buttonText: "VOIR LE RITUEL",
            image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?q=80&w=1000&auto=format&fit=crop",
            linkType: 'category',
            linkTarget: 'Dermo-cosmétique'
        },
        {
            id: 102,
            title: "Douceur <br/>Bébé Bio",
            subtitle: "Parce que leur peau mérite le meilleur de la nature et de la science.",
            buttonText: "PROTÉGER BÉBÉ",
            image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=1000&auto=format&fit=crop",
            linkType: 'category',
            linkTarget: 'Bébé & Maman'
        }
    ],
    virtualTryOn: {
        title: "VOTRE DIAGNOSTIC",
        description: "PharmaNature vous accompagne pour trouver la cure idéale.",
        buttonText: "LANCER LE TEST",
        link: "#"
    },
    featuredGrid: {
        title: "Les <span class='text-brand-primary'>Incontournables</span> Santé",
        productIds: [1, 2],
        buttonText: "VOIR TOUTE LA BOUTIQUE",
        buttonLink: "#/product-list"
    }
};

module.exports = {
    allProducts,
    categories,
    packs: [],
    stores: [],
    initialAdvertisements,
    promotions: [],
    sampleOrders: [],
    blogPosts: [],
    contactMessages: []
};
