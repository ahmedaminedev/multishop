
// ... existing types ...

// New imports or types needed
export interface ProductColor {
    name: string;
    hex: string;
}

export interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  oldPrice?: number;
  imageUrl: string; 
  images: string[]; 
  discount?: number;
  category: string; 
  parentCategory?: string; 
  promo?: boolean;
  material?: string;
  description?: string;
  quantity: number;
  specifications?: { name: string; value: string; }[];
  colors?: ProductColor[]; 
  highlights?: {
    title: string;
    imageUrl: string;
    sections: {
      subtitle: string;
      features: {
        title: string;
        description: string;
      }[];
    }[];
  };
}

export interface Review {
    _id: string;
    userId: string | number;
    userName: string;
    targetId: number;
    targetType: 'product' | 'pack';
    rating: number;
    comment: string;
    date: string;
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

export interface BrandCategoryLink {
    parentCategory: string;
    subCategory: string;
}

export interface Brand {
    id: number;
    name: string;
    logoUrl: string;
    productCount?: number; 
    associatedCategories?: BrandCategoryLink[];
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
  id: string; 
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  originalItem: Cartable;
  selectedColor?: string; 
}

export interface OrderItem {
  productId: number;
  name: string;
  imageUrl: string;
  quantity: number;
  price: number;
  selectedColor?: string;
}


export interface Order {
  id: string;
  customerName: string;
  date: string;
  total: number;
  status: 'En attente' | 'Expédiée' | 'Livrée' | 'Annulée';
  itemCount: number;
  items: (OrderItem & Product)[]; 
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
  id: number | string; 
  type: 'Domicile' | 'Travail';
  street: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
}

export interface User {
  id: string | number; 
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role?: 'CUSTOMER' | 'ADMIN';
  age?: number;
  addresses: Address[];
  photo_profil?: string;
}

// Advertisement Types
export interface HeroSlide {
  id: number;
  bgImage: string; 
  videoUrl?: string; 
  title: string;
  subtitle: string;
  buttonText: string;
  link?: string; 
}

export interface DestockageAd {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  coverImage: string;
  buttonText: string;
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
  link?: string; 
  linkType?: 'category' | 'pack'; 
  linkTarget?: string; 
}

export interface ImagePromoAd {
  id: number;
  imageUrl: string;
  altText: string;
  link: string;
}

export interface CollageItem {
  id: number;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  link: string;
  size: 'large' | 'tall' | 'wide' | 'small'; 
}

export interface ShoppableVideo {
  id: number;
  thumbnailUrl: string;
  videoUrl: string;
  username: string; 
  description: string; 
  productIds?: number[]; 
}

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

export interface TrustBadgeConfig {
    id: number;
    title: string;
    subtitle: string;
    iconUrl?: string; 
}

export interface ProductCarouselConfig {
    title: string;
    productIds: number[];
    limit?: number;
}

export interface VirtualTryOnImage {
    url: string;
    scale?: number; 
    top?: number; 
    rotation?: number; 
}

export interface VirtualTryOnConfig {
    title: string;
    description: string;
    buttonText: string;
    link?: string;
    backgroundType?: 'color' | 'image';
    backgroundColor?: string; 
    backgroundImage?: string; 
    backgroundGallery?: string[]; 
    textColor?: string; 
    imageLeft?: VirtualTryOnImage | string; 
    imageRight?: VirtualTryOnImage | string;
}

export interface FeaturedGridConfig {
    title: string;
    productIds: number[];
    buttonText: string;
    buttonLink: string;
}

export interface Advertisements {
  heroSlides: HeroSlide[];
  trustBadges?: TrustBadgeConfig[]; 
  audioPromo: AudioPromoAd[];
  promoBanners: [MediumPromoAd, MediumPromoAd];
  smallPromoBanners: ImagePromoAd[];
  editorialCollage: CollageItem[];
  shoppableVideos: ShoppableVideo[];
  newArrivals?: ProductCarouselConfig; 
  summerSelection?: ProductCarouselConfig;
  virtualTryOn?: VirtualTryOnConfig; 
  featuredGrid?: FeaturedGridConfig; 
}

export interface PromoSectionConfig {
    title: string;
    titleColor?: string;
    subtitle: string;
    subtitleColor?: string;
    buttonText: string;
    buttonColor?: string;
    buttonTextColor?: string;
    image: string;
    link?: string;
}

export interface OffersPageConfig {
    header: {
        title: string;
        titleColor?: string;
        subtitle: string;
        subtitleColor?: string;
    };
    performanceSection: PromoSectionConfig; // WAS glowRoutine
    muscleBuilders: PromoSectionConfig; // WAS essentials
    dealOfTheDay: {
        productId: number;
        titleColor?: string;
        subtitleColor?: string;
    };
    allOffersGrid: {
        title: string;
        titleColor?: string;
        useManualSelection: boolean;
        manualProductIds: number[];
        limit: number;
    };
}

export interface Promotion {
  id: number;
  name: string;
  discountPercentage: number;
  startDate: string; 
  endDate: string; 
  productIds: number[];
  packIds: number[];
}

export interface SearchResultItem {
  item: Product;
  context: string; 
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
