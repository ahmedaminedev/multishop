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
    pieceMaison?: string;
    materiauPrincipal?: string;
    styleDeco?: string;
    dimensions?: string;
    finition?: string;
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
    icon?: string;
    color?: string;
    description?: string;
    count?: number;
}

export interface Brand {
    id: number;
    name: string;
    logo?: string;
    logoUrl?: string;
}

export interface Pack {
    id: number;
    name?: string;
    title?: string;
    price: number;
    oldPrice?: number;
    originalPrice?: number;
    discount?: number;
    imageUrl: string;
    images?: string[];
    description: string;
    includedItems?: string[];
    includedProductIds?: number[];
    badge?: string;
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
    navbarPosition?: 'left' | 'center' | 'custom';
    navbarOffset?: number;
}

export interface DariHomeConfig {
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
    dariHome?: DariHomeConfig;
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
    orderNumber?: string;
    total?: number;
    totalAmount?: number;
    status: string;
    customer: {
        name?: string;
        firstName?: string;
        lastName?: string;
        email: string;
        phone: string;
        address: string;
        city?: string;
    };
    items: OrderItem[];
    date: string;
    notes?: string;
    paymentMethod?: string;
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
}

export interface Store {
    id: string;
    name: string;
    address: string;
    phone: string;
    hours: string;
    city: string;
    image?: string;
}

export interface BlogPost {
    id: number;
    title: string;
    date: string;
    summary: string;
    image: string;
    slug?: string;
    content?: string;
}

export interface Promotion {
    id: string;
    code: string;
    title: string;
    discount: number;
    type: 'percentage' | 'fixed';
    expirationDate: string;
    description?: string;
}
