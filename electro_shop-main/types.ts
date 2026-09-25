
export interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  oldPrice?: number;
  imageUrl: string; // Gardé pour rétrocompatibilité (sera l'image principale)
  images: string[]; // Nouveau champ pour la galerie
  discount?: number;
  category: string;
  promo?: boolean;
  material?: string;
  description?: string;
  quantity: number;
  specifications?: { name: string; value: string; }[];
}

export interface SubCategoryItem {
    name: string;
}

export interface SubCategoryGroup {
    title: string;
    items: SubCategoryItem[];
}

export interface Category {
  name: string;
  subCategories?: string[];
  megaMenu?: SubCategoryGroup[];
}

export interface Brand {
    name: string;
    productCount: number;
    logoUrl: string;
}

export interface Pack {
  id: number;
  name: string;
  description: string;
  price: number;
  oldPrice: number;
  imageUrl: string;
  includedItems: string[];
  includedProductIds: number[];
  includedPackIds?: number[];
  discount?: number;
}

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  author: string;
  authorImageUrl: string;
  date: string;
  category: string;
  featured?: boolean;
}

export type Cartable = Product | Pack;

export interface CartItem {
  id: string; // e.g., 'product-1' or 'pack-2'
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  originalItem: Cartable;
}

export interface OrderItem {
  productId: number;
  name: string;
  imageUrl: string;
  quantity: number;
  price: number;
}


export interface Order {
  id: string;
  customerName: string;
  date: string;
  total: number;
  status: 'En attente' | 'Expédiée' | 'Livrée' | 'Annulée';
  itemCount: number;
  items: (OrderItem & Product)[]; // Merging for convenience to have product details readily available
  shippingAddress: Address;
  paymentMethod: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  read: boolean;
}

export interface Address {
  id: number;
  type: 'Domicile' | 'Travail';
  street: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role?: 'CUSTOMER' | 'ADMIN';
  age?: number;
  addresses: Address[];
}

// Advertisement Types
export interface HeroSlide {
  id: number;
  bgImage: string;
  title: string;
  subtitle: string;
  buttonText: string;
}

export interface DestockageAd {
  id: number;
  mainTitle: string;
  subTitle: string;
  price: string;
  oldPrice: string;
  images: { src: string; alt: string }[];
  chefImage: string;
  duration: number; // Duration in seconds
}

export interface AudioPromoAd {
  id: number;
  title: string;
  subtitle1: string;
  subtitle2: string;
  image: string;
  background: string;
  duration: number;
}

export interface MediumPromoAd {
  id: number;
  title: string;
  subtitle: string;
  buttonText: string;
  image: string;
  linkType: 'category' | 'pack';
  linkTarget: string; // Category name or Pack ID as a string
}

export interface ImagePromoAd {
  id: number;
  imageUrl: string;
  altText: string;
  link: string;
}

// FIX: Export specific types for SmallPromoBanner
export interface BaseSmallPromoAd {
  id: number;
  bgGradient: string;
  image: string;
}

export interface DiscountPromoAd extends BaseSmallPromoAd {
  type: 'discount';
  promoText: string;
  title: string;
  discount: string;
}

export interface PriceStartPromoAd extends BaseSmallPromoAd {
  type: 'price_start';
  title: string;
  features: string[];
  priceStartText: string;
  price: string;
  priceUnit: string;
}

export interface FlashSalePromoAd extends BaseSmallPromoAd {
  type: 'flash_sale';
  flashTitle: string;
  title?: string;
  discountText?: string;
  flashSubtitle: string;
  notice: string;
}

export type SmallPromoAd = DiscountPromoAd | PriceStartPromoAd | FlashSalePromoAd;

export interface Advertisements {
  heroSlides: HeroSlide[];
  destockage: DestockageAd[];
  audioPromo: AudioPromoAd[];
  promoBanners: [MediumPromoAd, MediumPromoAd];
  smallPromoBanners: ImagePromoAd[];
}

export interface Promotion {
  id: number;
  name: string;
  discountPercentage: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  productIds: number[];
  packIds: number[];
}

export interface SearchResultItem {
  item: Product;
  context: string; // e.g., 'In category: ...', 'In pack: ...'
}

export interface SearchResult {
  products: SearchResultItem[];
  categories: { name: string }[];
}

export interface CustomerInfo {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  address2: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
}

export interface Store {
    id: number;
    name: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
    email: string;
    openingHours: string;
    mapUrl?: string;
    imageUrl: string;
    isPickupPoint: boolean;
}
