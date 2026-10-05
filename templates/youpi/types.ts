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

export interface Category {
    id: number;
    name: string;
    slug: string;
    image?: string;
}

export interface Brand {
    id: number;
    name: string;
    logo?: string;
}

export interface Pack {
    id: number;
    title: string;
    price: number;
    originalPrice: number;
    discount: number;
    imageUrl: string;
    description: string;
    products: Product[];
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
