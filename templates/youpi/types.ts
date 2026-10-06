export interface Product {
    id: number;
    name: string;
    brand: string;
    price: number;
    oldPrice?: number;
    imageUrl: string;
    images?: string[];
    discount?: number;
    category: string;
    parentCategory?: string;
    promo?: boolean;
    description?: string;
    quantity: number;
    rating?: number;
    reviewsCount?: number;
    trancheAge?: string;
    materiauPrincipal?: string;
    normeSecurite?: string;
    nbJoueurs?: string;
    pilesRequises?: boolean;
    specifications?: { name: string; value: string }[];
    fournisseurId?: string;
    fournisseurNom?: string;
}

export interface SubCategoryItem {
    name: string;
}

export interface SubCategoryGroup {
    title: string;
    items: SubCategoryItem[];
}

export interface Category {
    id?: number;
    name: string;
    slug?: string;
    image?: string;
    subCategories?: string[];
    megaMenu?: SubCategoryGroup[];
    ageRange?: string;
    icon?: string;
    color?: string;
    description?: string;
}

export interface Brand {
    id: number;
    name: string;
    logo?: string;
    logoUrl?: string;
}

export interface Pack {
    id: number;
    name: string;
    title?: string;
    price: number;
    oldPrice?: number;
    originalPrice?: number;
    discount?: number;
    imageUrl: string;
    description: string;
    includedItems?: string[];
    includedProductIds?: number[];
    includedPackIds?: number[];
    products?: Product[];
}

export interface User {
    id: string | number;
    firstName: string;
    lastName?: string;
    email: string;
    phone?: string;
    role?: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';
}

export interface LogoConfig {
    logoUrl?: string;
    navbarHeight?: number;
    footerHeight?: number;
    textPrimary?: string;
    textSecondary?: string;
    tagline?: string;
}

export interface YoupiHomeConfig {
    hero: {
        badge: string;
        title: string;
        titleHighlight: string;
        description: string;
        buttonText: string;
        buttonCategory: string;
        bgImage: string;
        stickerLeft?: string;
        stickerRight?: string;
    };
    promoBanner: {
        tag: string;
        title: string;
        discountHighlight: string;
        description: string;
        buttonText: string;
        categoryTarget: string;
        bgImage: string;
    };
    bestsellersTitle: string;
    bestsellersKicker: string;
    ageCategoriesTitle: string;
    ageCategoriesKicker: string;
    trustBadges: Array<{
        id: number;
        title: string;
        subtitle: string;
        icon?: string;
    }>;
}

export interface Advertisements {
    heroSlides?: any[];
    promoBanners?: any[];
    smallPromoBanners?: any[];
    trustBadges?: any[];
    logoConfig?: LogoConfig;
    youpiHome?: YoupiHomeConfig;
    [key: string]: any;
}

export interface OrderItem {
    id: number;
    name: string;
    quantity: number;
    price: number;
    imageUrl?: string;
}

export interface Order {
    id: string;
    orderNumber: string;
    customer: {
        name: string;
        email: string;
        phone: string;
        address: string;
    };
    items: OrderItem[];
    totalAmount: number;
    paymentMethod: string;
    status: 'en_attente' | 'confirmé' | 'expédié' | 'livré' | 'annulé';
    date: string;
    notes?: string;
}

export interface ContactMessage {
    id: string;
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    date: string;
    read: boolean;
    reply?: string;
}

export interface Promotion {
    id: string;
    title: string;
    code: string;
    discountPercentage: number;
    validUntil: string;
}

export interface Store {
    id: number;
    name: string;
    address: string;
    phone: string;
    hours: string;
}

export interface BlogPost {
    id: number;
    title: string;
    date: string;
    summary: string;
    image: string;
    content?: string;
}
