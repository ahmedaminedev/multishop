
// Copie des données de constants.ts pour initialiser la BDD
const allProducts = [
    { id: 1, name: 'Pack encastrable de 2 Pièces de la marque AUXSTAR', brand: 'AUXSTAR', price: 899, oldPrice: 1299, imageUrl: 'https://picsum.photos/id/10/400/400', images: ['https://picsum.photos/id/10/400/400'], discount: 30, category: 'Pack encastrable', promo: true, description: 'Un pack complet pour équiper votre cuisine avec style et efficacité. Profitez de la qualité AUXSTAR pour des résultats de cuisson parfaits.', quantity: 10 },
    { id: 2, name: 'Pack encastrable de 2 pièces de la marque STARONE', brand: 'STARONE', price: 999, oldPrice: 1399, imageUrl: 'https://picsum.photos/id/11/400/400', images: ['https://picsum.photos/id/11/400/400'], discount: 28, category: 'Pack encastrable', promo: true, description: 'Optimisez votre espace avec ce pack encastrable STARONE. Design moderne et performances fiables pour une cuisine fonctionnelle.', quantity: 5 },
    { id: 3, name: 'Pack encastrable de 2 pièces de la marque AUXSTAR', brand: 'AUXSTAR', price: 1099, oldPrice: 1429, imageUrl: 'https://picsum.photos/id/12/400/400', images: ['https://picsum.photos/id/12/400/400'], discount: 23, category: 'Pack encastrable', description: 'Le meilleur de la technologie AUXSTAR dans un pack encastrable pratique. Idéal pour les cuisines modernes et exigeantes.', quantity: 8 },
    { id: 4, name: 'Lave vaisselle Pose libre WHIRLPOOL 14 Couverts Inox', brand: 'WHIRLPOOL', price: 2389, oldPrice: 2599, imageUrl: 'https://picsum.photos/id/13/400/400', images: ['https://picsum.photos/id/13/400/400'], discount: 8, category: 'Lave vaisselle pose libre', description: 'Une vaisselle impeccable à chaque lavage grâce à la technologie 6ème Sens de Whirlpool. Grande capacité et faible consommation d\'énergie.', quantity: 12, specifications: [{ name: 'Nombre de couverts', value: '14' },{ name: 'Classe énergétique', value: 'A++' },{ name: 'Niveau sonore', value: '46 dB' },{ name: 'Couleur', value: 'Inox' },{ name: 'Type de pose', value: 'Pose libre' }] },
    { id: 5, name: 'Lave vaisselle Pose libre LG 14 Couverts Inox', brand: 'LG', price: 2349, oldPrice: 2599, imageUrl: 'https://picsum.photos/id/14/400/400', images: ['https://picsum.photos/id/14/400/400'], discount: 10, category: 'Lave vaisselle pose libre', description: 'Technologie QuadWash pour un nettoyage optimal sous tous les angles. Silencieux, efficace et élégant, il s\'intègre parfaitement dans votre cuisine.', quantity: 7 },
    { id: 6, name: 'Lave vaisselle Pose libre TELEFUNKEN 13 couverts Silver', brand: 'TELEFUNKEN', price: 989, oldPrice: 1359, imageUrl: 'https://picsum.photos/id/15/400/400', images: ['https://picsum.photos/id/15/400/400'], discount: 27, category: 'Lave vaisselle pose libre', description: 'Alliez performance et économie avec ce lave-vaisselle Telefunken. Plusieurs programmes pour s\'adapter à tous vos besoins.', quantity: 15 },
    { id: 7, name: 'Lave vaisselle Pose libre ARISTON 14 Couverts Inox', brand: 'ARISTON', price: 1765, oldPrice: 1999, imageUrl: 'https://picsum.photos/id/16/400/400', images: ['https://picsum.photos/id/16/400/400'], discount: 11, category: 'Lave vaisselle pose libre', description: 'La technologie 3D Zone Wash offre une puissance de lavage ciblée pour éliminer les saletés les plus tenaces. Flexibilité et performance au rendez-vous.', quantity: 0 },
    { id: 8, name: 'Lave vaisselle Pose libre BRANDT 14 Couverts noir', brand: 'BRANDT', price: 1689, oldPrice: 1799, imageUrl: 'https://picsum.photos/id/17/400/400', images: ['https://picsum.photos/id/17/400/400'], discount: 6, category: 'Lave vaisselle pose libre', description: 'Design élégant noir et performance de lavage supérieure. Optimisez votre temps avec ses programmes rapides et efficaces.', quantity: 4 },
    { id: 9, name: 'Climatiseur NEWSTAR 12000 BTU Inverter Chaud & froid', brand: 'NEWSTAR', price: 1239, oldPrice: 1599, imageUrl: 'https://picsum.photos/id/18/400/400', images: ['https://picsum.photos/id/18/400/400'], discount: 23, category: 'Climatiseur', description: 'Confort thermique toute l\'année avec la technologie Inverter. Économies d\'énergie et silence de fonctionnement assurés.', quantity: 20, specifications: [{ name: 'Puissance', value: '12000 BTU' },{ name: 'Mode', value: 'Chaud & Froid' },{ name: 'Technologie', value: 'Inverter' },{ name: 'Gaz réfrigérant', value: 'R410A' },{ name: 'Classe énergétique', value: 'A' }] },
    { id: 10, name: 'Climatiseur BIOLUX 12000 BTU Tropical smart chaud & froid', brand: 'BIOLUX', price: 1435, oldPrice: 1559, imageUrl: 'https://picsum.photos/id/19/400/400', images: ['https://picsum.photos/id/19/400/400'], discount: 8, category: 'Climatiseur', description: 'Conçu pour les climats exigeants, ce climatiseur tropicalisé offre une performance fiable même par fortes chaleurs. Contrôlez-le à distance grâce à ses fonctions smart.', quantity: 18 },
    { id: 11, name: 'Climatiseur GREE 24000 BTU Tropicalisé Chaud & froid', brand: 'GREE', price: 2959, oldPrice: 3299, imageUrl: 'https://picsum.photos/id/20/400/400', images: ['https://picsum.photos/id/20/400/400'], discount: 10, category: 'Climatiseur', description: 'Puissance et robustesse pour les grands espaces. Le climatiseur GREE 24000 BTU assure un confort optimal en toutes saisons.', quantity: 6 },
    { id: 12, name: 'Climatiseur MIDEA 18000 BTU Inverter Chaud & froid', brand: 'MIDEA', price: 1999, oldPrice: 2299, imageUrl: 'https://picsum.photos/id/21/400/400', images: ['https://picsum.photos/id/21/400/400'], discount: 13, category: 'Climatiseur', description: 'La performance Inverter de Midea pour un refroidissement rapide et des économies d\'énergie substantielles. Un choix intelligent pour votre confort.', quantity: 9 },
    { id: 13, name: 'ARISTON Product', brand: 'ARISTON', price: 1500, imageUrl: 'https://picsum.photos/id/22/400/400', images: ['https://picsum.photos/id/22/400/400'], category: 'Cafetières & Expresso', description: 'Un appareil de petit électroménager fiable et performant de la marque ARISTON pour faciliter votre quotidien en cuisine.', quantity: 25 },
    { id: 14, name: 'Candy Product', brand: 'Candy', price: 750, imageUrl: 'https://picsum.photos/id/23/400/400', images: ['https://picsum.photos/id/23/400/400'], category: 'TV LED', description: 'Découvrez l\'univers Tv-son-photos avec ce produit de la marque Candy, alliant design et technologie.', quantity: 30 },
    { id: 15, name: 'Appareil à raclette TECHWOOD 6 Poêlons 800 W (TRA-64)', brand: 'Techwood', price: 145, oldPrice: 199, imageUrl: 'https://picsum.photos/seed/raclette1/400/400', images: ['https://picsum.photos/seed/raclette1/400/400'], discount: 27, category: 'Appareil à raclette', description: 'Pour des soirées conviviales, cet appareil à raclette Techwood pour 6 personnes est l\'allié idéal. Simple d\'utilisation et efficace.', quantity: 40 },
    { id: 16, name: 'Appareil à raclette PRINCESS Gril Party 6 800W noir (162725)', brand: 'Princess', price: 149, oldPrice: 195, imageUrl: 'https://picsum.photos/seed/raclette2/400/400', images: ['https://picsum.photos/seed/raclette2/400/400'], discount: 24, category: 'Appareil à raclette', description: 'Profitez de moments chaleureux avec cet appareil à raclette et gril Princess. Parfait pour 6 convives.', quantity: 35 },
    { id: 17, name: 'Appareil à raclette LIVOVO 800W noir (DOC207)', brand: 'livoo', price: 157, oldPrice: 199, imageUrl: 'https://picsum.photos/seed/raclette3/400/400', images: ['https://picsum.photos/seed/raclette3/400/400'], discount: 21, category: 'Appareil à raclette', material: 'Inox', description: 'Un design moderne en inox pour cet appareil à raclette Livoo. Robuste et facile à nettoyer pour des repas réussis.', quantity: 0 },
    { id: 18, name: 'Appareil à raclette PRINCESS 4 Stone Grill Party 1600 Watts Noir', brand: 'Princess', price: 161, oldPrice: 196, imageUrl: 'https://picsum.photos/seed/raclette4/400/400', images: ['https://picsum.photos/seed/raclette4/400/400'], discount: 18, category: 'Appareil à raclette', description: 'Double fonction avec sa pierre de grill, cet appareil Princess est parfait pour varier les plaisirs lors de vos repas.', quantity: 22 },
    { id: 19, name: 'Livoo - Appareil à raclette 6 personnes - 800W, plateau grill amovible', brand: 'livoo', price: 140, oldPrice: 182, imageUrl: 'https://picsum.photos/seed/raclette5/400/400', images: ['https://picsum.photos/seed/raclette5/400/400'], discount: 23, category: 'Appareil à raclette', description: 'Compact et pratique avec son plateau grill amovible, cet appareil Livoo est idéal pour des raclettes en famille ou entre amis.', quantity: 17 },
    { id: 20, name: 'Appareil à Raclette LIVOVO 1200W Noir (DOC242)', brand: 'livoo', price: 170, oldPrice: 200, imageUrl: 'https://picsum.photos/seed/raclette6/400/400', images: ['https://picsum.photos/seed/raclette6/400/400'], discount: 15, category: 'Appareil à raclette', material: 'Inox', description: 'Plus de puissance pour une chauffe rapide. L\'appareil à raclette Livoo 1200W en inox est parfait pour les grandes tablées.', quantity: 14 },
    { id: 21, name: 'Appareil à raclette multifonction SEVERIN 1300W Noir (RG2371)', brand: 'severin', price: 180, oldPrice: 277, imageUrl: 'https://picsum.photos/seed/raclette7/400/400', images: ['https://picsum.photos/seed/raclette7/400/400'], discount: 35, category: 'Appareil à raclette', material: 'bois clair', description: 'Un appareil polyvalent avec une pierre naturelle et un gril. La finition en bois clair apporte une touche d\'élégance à votre table.', quantity: 11 },
    { id: 22, name: 'Appareil à Fondue électrique SEVERIN 1500W inox (FO2470)', brand: 'severin', price: 120, oldPrice: 240, imageUrl: 'https://picsum.photos/seed/fondue1/400/400', images: ['https://picsum.photos/seed/fondue1/400/400'], discount: 50, category: 'Appareil à raclette', description: 'Variez les plaisirs avec cet appareil à fondue électrique Severin. Parfait pour les fondues savoyardes, bourguignonnes ou au chocolat.', quantity: 19 },
    { id: 23, name: 'Plaque de cuisson à gaz STARONE', brand: 'STARONE', price: 550, category: 'Plaque à gaz', material: 'Inox', imageUrl: 'https://picsum.photos/seed/plaque_pack/400/400', images: ['https://picsum.photos/seed/plaque_pack/400/400'], quantity: 15, specifications: [{ name: 'Nombre de feux', value: '4' },{ name: 'Type de gaz', value: 'Gaz Bouteille' },{ name: 'Sécurité thermocouple', value: 'Oui' },{ name: 'Dimensions', value: '60 cm' }] },
    { id: 24, name: 'Four encastrable électrique WHIRLPOOL', brand: 'WHIRLPOOL', price: 950, category: 'Four encastrable', material: 'Inox', imageUrl: 'https://picsum.photos/seed/four_pack/400/400', images: ['https://picsum.photos/seed/four_pack/400/400'], quantity: 12, specifications: [{ name: 'Volume', value: '71 L' },{ name: 'Classe énergétique', value: 'A+' },{ name: 'Type de nettoyage', value: 'Catalyse' },{ name: 'Fonctions', value: '6' },{ name: 'Chaleur tournante', value: 'Oui' }] },
    { id: 25, name: 'Hotte décorative 60cm BRANDT', brand: 'BRANDT', price: 850, category: 'Hotte inox', material: 'Noir', imageUrl: 'https://picsum.photos/seed/hotte_pack/400/400', images: ['https://picsum.photos/seed/hotte_pack/400/400'], quantity: 18, specifications: [{ name: 'Débit d\'air max', value: '620 m³/h' },{ name: 'Niveau sonore max', value: '65 dB' },{ name: 'Largeur', value: '60 cm' },{ name: 'Filtre', value: 'Aluminium lavable' },{ name: 'Éclairage', value: 'LED' }] },
    { id: 26, name: 'Lave-linge frontal 9kg LG', brand: 'LG', price: 1800, category: 'Lave-linge frontal', imageUrl: 'https://picsum.photos/seed/lavelinge_pack/400/400', images: ['https://picsum.photos/seed/lavelinge_pack/400/400'], quantity: 9, specifications: [{ name: 'Capacité De Lavage (kg)', value: '9' },{ name: 'Couleur', value: 'Blanc' },{ name: 'Inverter', value: 'Oui' },{ name: 'Vitesse d\'essorage', value: '1400 tr/min' },{ name: 'Moteur', value: 'Direct Drive' }] },
    { id: 27, name: 'Sèche-linge à condensation CANDY', brand: 'CANDY', price: 1300, category: 'Sèche Linge', imageUrl: 'https://picsum.photos/seed/sechelinge_pack/400/400', images: ['https://picsum.photos/seed/sechelinge_pack/400/400'], quantity: 7 },
    { id: 28, name: 'Cafetière à filtre programmable MIDEA', brand: 'MIDEA', price: 250, category: 'Cafetières & Expresso', imageUrl: 'https://picsum.photos/seed/cafetiere_pack/400/400', images: ['https://picsum.photos/seed/cafetiere_pack/400/400'], quantity: 25 },
    { id: 29, name: 'Grille-pain 2 fentes TELEFUNKEN', brand: 'TELEFUNKEN', price: 180, category: 'Grille-pain & Gaufriers', imageUrl: 'https://picsum.photos/seed/grillepain_pack/400/400', images: ['https://picsum.photos/seed/grillepain_pack/400/400'], quantity: 30 },
    { id: 30, name: 'Bouilloire électrique 1.7L BIOLUX', brand: 'BIOLUX', price: 220, category: 'Petit électroménagers cuisine', imageUrl: 'https://picsum.photos/seed/bouilloire_pack/400/400', images: ['https://picsum.photos/seed/bouilloire_pack/400/400'], quantity: 35 },
    { id: 31, name: 'Réfrigérateur combiné 350L ARISTON', brand: 'ARISTON', price: 2450, category: 'Réfrigérateur combiné', material: 'Silver', imageUrl: 'https://picsum.photos/seed/frigo_pack/400/400', images: ['https://picsum.photos/seed/frigo_pack/400/400'], quantity: 6, specifications: [{ name: 'Volume total (L)', value: '350' },{ name: 'Type de froid', value: 'No Frost' },{ name: 'Classe énergétique', value: 'A+' },{ name: 'Couleur', value: 'Silver' },{ name: 'Porte réversible', value: 'Oui' }] }
];

const categories = [
    { name: 'Pack électroménager' },
    { 
        name: 'Gros électroménagers', 
        megaMenu: [
            { 
                title: 'Lave-linge', 
                items: [
                    { name: 'Lave-linge frontal' },
                    { name: 'Lave-linge top' },
                    { name: 'Lave-linge encastrable' },
                    { name: 'Lave-linge semi-automatique' },
                    { name: 'Machine lavante séchante' },
                    { name: 'Sèche Linge' },
                    { name: 'Support' },
                ]
            },
            { 
                title: 'Réfrigérateur', 
                items: [
                    { name: 'réfrigérateur double porters' },
                    { name: 'Réfrigérateur combiné' },
                    { name: 'Réfrigérateur 1porte' },
                    { name: 'Réfrigérateur américain' },
                    { name: 'Réfrigérateur encastrable' },
                    { name: 'Réfrigérateur mini-bar' },
                ]
            },
            { 
                title: 'Four', 
                items: [
                    { name: 'Four encastrable' },
                    { name: 'Four posable' },
                    { name: 'Four à gaz' },
                    { name: 'Four à Pizza' },
                ]
            },
             { 
                title: 'Air conditionné, climatisation', 
                items: [
                    { name: 'Climatiseur' },
                    { name: 'Chauffage' },
                    { name: 'Climeur et ventilateur' },
                    { name: 'Fontaine d\'eau' },
                ]
            },
            { 
                title: 'Plaque de cuisson', 
                items: [
                    { name: 'Plaque à gaz' },
                    { name: 'Plaque à induction' },
                    { name: 'Plaque électrique' },
                ]
            },
            { 
                title: 'Congélateur', 
                items: [
                    { name: 'Congélateur vertical' },
                    { name: 'Congélateur horizontal' },
                ]
            },
            { 
                title: 'Cuisinière', 
                items: [
                    { name: 'Cuisinière 4 feux' },
                    { name: 'Cuisinière 5 feux' },
                ]
            },
            { 
                title: 'Hotte', 
                items: [
                    { name: 'Hotte inox' },
                    { name: 'Hotte noir' },
                ]
            },
            { 
                title: 'Lave vaisselle', 
                items: [
                    { name: 'Lave vaisselle encastrable' },
                    { name: 'Lave vaisselle pose libre' },
                ]
            },
            { 
                title: 'Micro-onde', 
                items: [
                    { name: 'Micro onde encastrable' },
                    { name: 'Micro onde Pose libre' },
                ]
            },
            { 
                title: 'Chaudière et Chauffe bain', 
                items: [
                    { name: 'Chaudière' },
                    { name: 'Chauffe bain' },
                ]
            },
        ]
    },
    { name: 'Petit électroménagers cuisine', subCategories: ['Appareil à raclette', 'Cafetières & Expresso', 'Blenders & Mixeurs', 'Robots de cuisine', 'Grille-pain & Gaufriers', 'Friteuses', 'Hachoirs', 'Batteurs'] },
    { 
        name: 'Tv-son-photos',
        megaMenu: [
            {
                title: 'Téléviseurs',
                items: [
                    { name: 'TV LED' },
                    { name: 'TV QLED & OLED' },
                    { name: 'Smart TV' },
                    { name: 'TV 4K UHD' },
                    { name: 'Accessoires TV' },
                ]
            },
            {
                title: 'Son',
                items: [
                    { name: 'Home Cinéma' },
                    { name: 'Barres de son' },
                    { name: 'Enceintes Bluetooth' },
                    { name: 'Chaînes Hifi' },
                ]
            },
            {
                title: 'Photo & Caméscopes',
                items: [
                    { name: 'Appareils photo numériques' },
                    { name: 'Caméras sportives' },
                    { name: 'Accessoires photo' },
                ]
            }
        ]
    },
    { name: 'Audio, casque', subCategories: ['Casques audio', 'Écouteurs', 'Enceintes portables', 'Radios & Réveils'] },
    { name: 'Entretien et soin de la maison' },
    { name: 'Matériel de cuisine' },
    { 
        name: 'Téléphonie et objets connectés',
        megaMenu: [
            {
                title: 'Smartphones & Tablettes',
                items: [
                    { name: 'Smartphones' },
                    { name: 'Tablettes tactiles' },
                    { name: 'Accessoires téléphonie' },
                ]
            },
            {
                title: 'Objets Connectés',
                items: [
                    { name: 'Montres connectées' },
                    { name: 'Bracelets connectés' },
                    { name: 'Maison connectée' },
                ]
            }
        ]
    },
    { name: 'Santé et réseaux' },
    { name: 'Bricolage, Literie' },
    { name: 'Sport et loisir' },
    { name: 'Compléments Alimentaires' },
    { name: 'Informatique', subCategories: ['Ordinateurs portables', 'PC de bureau', 'Écrans', 'Imprimantes & Scanners', 'Stockage', 'Accessoires & Périphériques'] },
    { name: 'Hygiène et soin' },
];

const packs = [
    { 
        id: 1, 
        name: 'Pack Cuisine Essentiel', 
        description: 'Le trio parfait pour débuter : plaque de cuisson, four et hotte assortis pour une cuisine moderne et fonctionnelle.',
        price: 1880,
        oldPrice: 2350,
        discount: 20,
        imageUrl: 'https://picsum.photos/seed/pack1/400/300',
        includedItems: ['Plaque de cuisson à gaz STARONE', 'Four encastrable électrique WHIRLPOOL', 'Hotte décorative 60cm BRANDT'],
        includedProductIds: [23, 24, 25]
    },
    { 
        id: 2, 
        name: 'Pack Buanderie Performant', 
        description: 'Optimisez votre espace buanderie avec ce duo lave-linge et sèche-linge efficace et économique.',
        price: 2945,
        oldPrice: 3100,
        discount: 5,
        imageUrl: 'https://picsum.photos/seed/pack2/400/300',
        includedItems: ['Lave-linge frontal 9kg LG', 'Sèche-linge à condensation CANDY'],
        includedProductIds: [26, 27]
    },
    { 
        id: 3, 
        name: 'Pack Petit Déjeuner Complet', 
        description: 'Commencez la journée du bon pied avec notre sélection d\'appareils pour un petit déjeuner parfait.',
        price: 585,
        oldPrice: 650,
        discount: 10,
        imageUrl: 'https://picsum.photos/seed/pack3/400/300',
        includedItems: ['Cafetière à filtre programmable MIDEA', 'Grille-pain 2 fentes TELEFUNKEN', 'Bouilloire électrique 1.7L BIOLUX'],
        includedProductIds: [28, 29, 30]
    },
    { 
        id: 4, 
        name: 'Pack Cuisine Premium', 
        description: 'Le pack Essentiel plus un réfrigérateur pour une cuisine quasi-complète et harmonieuse.',
        price: 4200,
        oldPrice: 4800,
        discount: 12.5,
        imageUrl: 'https://picsum.photos/seed/pack4/400/300',
        includedItems: ['Pack Cuisine Essentiel', 'Réfrigérateur combiné 350L ARISTON'],
        includedProductIds: [31],
        includedPackIds: [1]
    }
];

const stores = [
    {
        id: 1,
        name: "Electro Shop Tunis",
        address: "10 Rue Saint Augustin",
        city: "Tunis",
        postalCode: "1002",
        phone: "+216 71 123 456",
        email: "tunis@electroshop.tn",
        openingHours: "Lun - Sam: 08h30 - 19h00",
        imageUrl: "https://picsum.photos/seed/store1/600/400",
        isPickupPoint: true,
        mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3194.327286327346!2d10.181531315272312!3d36.80649487994732!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12fd34730e3703d3%3A0x6b8f703080e8230!2sTunis!5e0!3m2!1sen!2stn!4v1634567890123!5m2!1sen!2stn"
    },
    {
        id: 2,
        name: "Electro Shop Sfax",
        address: "Poudrière 1, Rue 18 Août (en face de Stoufa)",
        city: "Sfax",
        postalCode: "3000",
        phone: "+216 74 987 654",
        email: "sfax@electroshop.tn",
        openingHours: "Lun - Sam: 08h00 - 19h30",
        imageUrl: "https://picsum.photos/seed/store2/600/400",
        isPickupPoint: true,
        mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3278.123456789012!2d10.76012345678901!3d34.74012345678901!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x13002c1234567890%3A0x1234567890abcdef!2sSfax!5e0!3m2!1sen!2stn!4v1634567890123!5m2!1sen!2stn"
    },
    {
        id: 3,
        name: "Electro Shop Sousse",
        address: "Avenue Habib Bourguiba",
        city: "Sousse",
        postalCode: "4000",
        phone: "+216 73 456 789",
        email: "sousse@electroshop.tn",
        openingHours: "Lun - Sam: 09h00 - 20h00",
        imageUrl: "https://picsum.photos/seed/store3/600/400",
        isPickupPoint: true,
        mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3235.123456789012!2d10.64012345678901!3d35.82512345678901!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1302751234567890%3A0xabcdef1234567890!2sSousse!5e0!3m2!1sen!2stn!4v1634567890123!5m2!1sen!2stn"
    }
];

const initialAdvertisements = {
    heroSlides: [
        {
            id: 1,
            bgImage: "https://picsum.photos/id/1/1200/400",
            title: "La meilleure technologie, au meilleur prix.",
            subtitle: "Explorez nos offres exclusives sur l'électronique et l'électroménager.",
            buttonText: "Découvrir"
        },
        {
            id: 2,
            bgImage: "https://picsum.photos/id/102/1200/400",
            title: "Collection Été: Fraîcheur Garantie !",
            subtitle: "Découvrez nos nouveaux climatiseurs et ventilateurs en promotion.",
            buttonText: "Voir les offres"
        },
        {
            id: 3,
            bgImage: "https://picsum.photos/id/104/1200/400",
            title: "Cuisine de Chef, Prix Malin.",
            subtitle: "Équipez votre cuisine avec nos packs encastrables.",
            buttonText: "Explorer"
        }
    ],
    destockage: [
        {
            id: 1,
            mainTitle: "Destockage",
            subTitle: "Pack encastrable de 3 Pièces",
            price: "765 DT",
            oldPrice: "900 DT",
            images: [
                { src: "https://picsum.photos/seed/hotte/200/100", alt: "Hotte" },
                { src: "https://picsum.photos/seed/plaque/200/200", alt: "Plaque de cuisson" },
                { src: "https://picsum.photos/seed/four/250/300", alt: "Four" }
            ],
            chefImage: "https://picsum.photos/seed/chef/250/320",
            duration: 10,
        },
        {
            id: 2,
            mainTitle: "Vente Flash",
            subTitle: "Lave-Linge & Sèche-Linge",
            price: "1250 DT",
            oldPrice: "1500 DT",
            images: [
                { src: "https://picsum.photos/seed/lavelinge_promo/200/200", alt: "Lave-linge" },
                { src: "https://picsum.photos/seed/sechelinge_promo/200/200", alt: "Sèche-linge" },
                { src: "https://picsum.photos/seed/buandrie/250/300", alt: "Buandrie" }
            ],
            chefImage: "https://picsum.photos/seed/femme/250/320",
            duration: 8,
        }
    ],
    audioPromo: [
        {
            id: 1,
            title: "jusqu'à -40%",
            subtitle1: "SUR NOTRE SÉLECTION",
            subtitle2: "Écouteurs, Casque, Enceinte",
            image: "https://picsum.photos/seed/audio/800/400",
            background: "from-teal-400 to-cyan-600",
            duration: 8,
        },
        {
            id: 2,
            title: "Son Immersif",
            subtitle1: "NOUVELLES BARRES DE SON",
            subtitle2: "Vivez le cinéma à la maison",
            image: "https://picsum.photos/seed/soundbar/800/400",
            background: "from-indigo-500 to-purple-700",
            duration: 7,
        }
    ],
    promoBanners: [
        {
            id: 1,
            title: "Climatiseurs",
            subtitle: "Restez au frais tout l'été",
            buttonText: "Choisir un modèle",
            image: "https://picsum.photos/id/101/600/300",
            linkType: 'category',
            linkTarget: 'Climatiseur',
        },
        {
            id: 2,
            title: "Pack Buanderie",
            subtitle: "Lavage et séchage performants",
            buttonText: "Voir les produits",
            image: "https://picsum.photos/seed/pack2/600/300",
            linkType: 'pack',
            linkTarget: '2', // Pack ID for 'Pack Buanderie Performant'
        }
    ],
    smallPromoBanners: [
        {
            id: 1,
            imageUrl: "https://picsum.photos/seed/aircon/400/400",
            altText: "Promotion sur les climatiseurs",
            link: "#"
        },
        {
            id: 2,
            imageUrl: "https://picsum.photos/seed/freezer/400/400",
            altText: "Congélateurs à partir de 850 DT",
            link: "#"
        },
        {
            id: 3,
            imageUrl: "https://picsum.photos/seed/watch/400/400",
            altText: "Vente flash sur les smartwatches",
            link: "#"
        },
        {
            id: 4,
            imageUrl: "https://picsum.photos/seed/kitchen/400/400",
            altText: "Promotions sur le petit électroménager",
            link: "#"
        },
        {
            id: 5,
            imageUrl: "https://picsum.photos/seed/tv/400/400",
            altText: "Offres TV 4K",
            link: "#"
        }
    ]
};

const promotions = [
    {
        id: 1,
        name: "Vente Flash Lave-vaisselle",
        discountPercentage: 15,
        startDate: "2024-07-01",
        endDate: "2024-07-10",
        productIds: [4, 5, 6, 7, 8],
        packIds: [],
    },
    {
        id: 2,
        name: "Promo Cuisine d'été",
        discountPercentage: 20,
        startDate: "2024-06-15",
        endDate: "2025-08-15",
        productIds: [],
        packIds: [1],
    }
];

const sampleOrders = [
    { 
        id: 'ES-1024', 
        customerName: 'Karim Gharbi', 
        date: '2023-10-26', 
        total: 1099, 
        status: 'Livrée', 
        itemCount: 1,
        items: [{ ...allProducts.find(p => p.id === 3), productId: 3, quantity: 1, price: 1099 }],
        shippingAddress: { id: 1, type: 'Domicile', street: '123 Rue de la Liberté', city: 'Tunis', postalCode: '1002', isDefault: true },
        paymentMethod: 'Paiement par carte'
    },
    { 
        id: 'ES-1023', 
        customerName: 'Amina Ben Salah', 
        date: '2023-10-25', 
        total: 2389, 
        status: 'Expédiée', 
        itemCount: 1,
        items: [{ ...allProducts.find(p => p.id === 4), productId: 4, quantity: 1, price: 2389 }],
        shippingAddress: { id: 2, type: 'Travail', street: '456 Avenue Habib Bourguiba', city: 'Tunis', postalCode: '1001', isDefault: false },
        paymentMethod: 'Paiement par carte'
    },
    { 
        id: 'ES-1022', 
        customerName: 'Mehdi Trabelsi', 
        date: '2023-10-25', 
        total: 443, 
        status: 'En attente', 
        itemCount: 3,
        items: [
            { ...allProducts.find(p => p.id === 15), productId: 15, quantity: 1, price: 145 },
            { ...allProducts.find(p => p.id === 16), productId: 16, quantity: 2, price: 149 }
        ],
        shippingAddress: { id: 1, type: 'Domicile', street: '123 Rue de la Liberté', city: 'Tunis', postalCode: '1002', isDefault: true },
        paymentMethod: 'Paiement à la livraison'
    },
];

const blogPosts = [
    {
        id: 1,
        slug: 'comment-choisir-son-refrigerateur',
        title: 'Comment choisir le réfrigérateur parfait pour votre cuisine ?',
        excerpt: 'Le réfrigérateur est un élément central de votre cuisine. Entre les différents types, tailles et technologies, il peut être difficile de s\'y retrouver. Suivez notre guide complet pour faire le bon choix.',
        content: 'Choisir un réfrigérateur n\'est pas une mince affaire. Il doit répondre à vos besoins en termes de capacité, s\'intégrer parfaitement à votre cuisine et être économe en énergie. \n\nPremièrement, évaluez la taille de votre foyer. Pour une personne seule, un volume de 150 litres est suffisant, tandis qu\'une famille de quatre personnes aura besoin d\'au moins 300 litres. Pensez également à l\'espace disponible dans votre cuisine. \n\nEnsuite, considérez le type de froid. Le froid statique est le plus simple, mais nécessite un dégivrage manuel régulier. Le froid brassé (ou dynamique) assure une température homogène, tandis que le froid ventilé (No Frost) empêche la formation de givre, simplifiant l\'entretien. \n\nEnfin, n\'oubliez pas les fonctionnalités additionnelles comme le distributeur d\'eau, la machine à glaçons, ou les zones de conservation spécifiques pour les viandes et légumes. Ces options peuvent grandement améliorer votre confort au quotidien.',
        imageUrl: 'https://picsum.photos/seed/blog1/800/400',
        author: 'Alice Martin',
        authorImageUrl: 'https://i.pravatar.cc/150?u=alice',
        date: '2023-10-26',
        category: 'Guides d\'achat',
        featured: true,
    },
    {
        id: 2,
        slug: 'entretien-lave-linge',
        title: '5 astuces pour entretenir votre lave-linge et prolonger sa durée de vie',
        excerpt: 'Un lave-linge bien entretenu est plus performant et dure plus longtemps. Découvrez nos conseils simples et efficaces pour prendre soin de votre appareil.',
        content: 'Votre lave-linge travaille dur pour garder vos vêtements propres. Pour le remercier, un peu d\'entretien régulier est nécessaire. \n\n1. Nettoyez le filtre de vidange tous les deux ou trois mois pour enlever les résidus qui pourraient l\'obstruer. \n\n2. Lancez un cycle à vide à haute température (90°C) une fois par mois avec du vinaigre blanc pour éliminer les bactéries et le calcaire. \n\n3. Nettoyez le bac à lessive régulièrement pour éviter les moisissures et les mauvaises odeurs. \n\n4. Laissez la porte et le bac ouverts après chaque lavage pour permettre à l\'intérieur de sécher. \n\n5. Vérifiez l\'état des tuyaux d\'arrivée et de sortie d\'eau une fois par an pour prévenir les fuites.',
        imageUrl: 'https://picsum.photos/seed/blog2/800/400',
        author: 'Julien Dubois',
        authorImageUrl: 'https://i.pravatar.cc/150?u=julien',
        date: '2023-10-15',
        category: 'Conseils & Astuces',
    },
    {
        id: 3,
        slug: 'economiser-energie-climatiseur',
        title: 'Comment utiliser votre climatiseur sans faire exploser votre facture d\'électricité ?',
        excerpt: 'La climatisation est un confort appréciable en été, mais elle peut être énergivore. Apprenez à l\'utiliser de manière intelligente pour rester au frais tout en maîtrisant votre budget.',
        content: 'L\'été approche et avec lui, l\'utilisation intensive du climatiseur. Pour éviter les mauvaises surprises sur votre facture, adoptez quelques bons réflexes. \n\nTout d\'abord, ne réglez pas la température trop bas. Une différence de 7 à 8°C avec l\'extérieur est suffisante pour un bon confort. Chaque degré en moins augmente la consommation de 7%. \n\nUtilisez la fonction "nuit" ou "sleep" qui ajuste progressivement la température pendant votre sommeil. Pensez également à fermer les volets et rideaux pendant la journée pour limiter l\'entrée de chaleur. \n\nEnfin, un entretien régulier est primordial. Nettoyez les filtres toutes les deux semaines pour garantir un flux d\'air optimal et une meilleure efficacité énergétique.',
        imageUrl: 'https://picsum.photos/seed/blog3/800/400',
        author: 'Chloé Girard',
        authorImageUrl: 'https://i.pravatar.cc/150?u=chloe',
        date: '2023-09-28',
        category: 'Économie d\'énergie',
    },
    {
        id: 4,
        slug: 'nouveautes-smart-tv-2023',
        title: 'Les dernières innovations en matière de Smart TV',
        excerpt: 'Mini-LED, QD-OLED, nouvelles interfaces... Le monde des téléviseurs est en constante évolution. Faisons le point sur les technologies à surveiller cette année.',
        content: 'Le marché des téléviseurs est plus dynamique que jamais. Les constructeurs rivalisent d\'ingéniosité pour offrir des images toujours plus spectaculaires et des expériences utilisateur plus fluides. \n\nLa technologie Mini-LED se démocratise, offrant un meilleur contrôle du rétroéclairage pour des contrastes plus profonds, se rapprochant de l\'OLED. \n\nLes écrans QD-OLED, combinant les avantages de l\'OLED et des Quantum Dots, promettent des couleurs plus vives et une luminosité accrue. \n\nCôté interfaces, Google TV et Tizen continuent de s\'améliorer avec des recommandations plus pertinentes et une intégration plus poussée des services de streaming. Le gaming n\'est pas en reste, avec la généralisation du HDMI 2.1, du VRR et de l\'ALLM pour une expérience de jeu optimale sur consoles de nouvelle génération.',
        imageUrl: 'https://picsum.photos/seed/blog4/800/400',
        author: 'Alice Martin',
        authorImageUrl: 'https://i.pravatar.cc/150?u=alice',
        date: '2023-09-10',
        category: 'Nouveautés',
    }
];

const contactMessages = [
    { id: 1, name: 'Linda Jouini', email: 'linda.j@email.com', subject: 'Question sur un produit', message: 'Bonjour, je voudrais savoir si le Lave vaisselle Pose libre WHIRLPOOL est disponible en blanc. Merci.', date: '2023-10-27', read: false },
    { id: 2, name: 'Sami Khelifi', email: 'sami.k@email.com', subject: 'Suivi de commande', message: 'Pouvez-vous me donner des nouvelles de ma commande ES-1023 ?', date: '2023-10-26', read: false },
    { id: 3, name: 'Nour Hammami', email: 'nour.h@email.com', subject: 'Service après-vente', message: 'Mon climatiseur NEWSTAR ne refroidit plus correctement, que dois-je faire ? Il est encore sous garantie.', date: '2023-10-26', read: true },
];

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
