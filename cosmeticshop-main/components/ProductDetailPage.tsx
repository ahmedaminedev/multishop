
import React, { useState, useMemo, useEffect } from 'react';
import type { Product, ProductColor } from '../types';
import { Breadcrumb } from './Breadcrumb';
import { useCart } from './CartContext';
import { useFavorites } from './FavoritesContext';
import { PlusIcon, MinusIcon, HeartIcon, SparklesIcon, CheckCircleIcon } from './IconComponents';
import { ReviewsSection } from './ReviewsSection';
import { ProductGallery } from './ProductGallery';
import { SEO } from './SEO';
import { ProductCarousel } from './ProductCarousel';

const DetailAccordion: React.FC<{ title: string; isOpen: boolean; onClick: () => void; children: React.ReactNode }> = ({ title, isOpen, onClick, children }) => {
    return (
        <div className="border-b border-gray-200 dark:border-gray-800">
            <button 
                onClick={onClick}
                className="w-full flex justify-between items-center py-6 text-left group"
            >
                <span className="font-serif text-lg text-gray-900 dark:text-white group-hover:text-rose-600 transition-colors">{title}</span>
                <span className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-rose-600' : 'text-gray-400'}`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M6 9L12 15L18 9" />
                    </svg>
                </span>
            </button>
            <div 
                className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0'}`}
            >
                {children}
            </div>
        </div>
    );
};

export const ProductDetailPage: React.FC<{
    product: Product;
    allProducts: Product[];
    onNavigateHome: () => void;
    onNavigateToProductDetail: (productId: number | string) => void;
    onPreview: (product: Product) => void;
}> = ({ product, allProducts, onNavigateHome, onNavigateToProductDetail, onPreview }) => {
    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null);
    const [activeTab, setActiveTab] = useState<'details' | 'usage' | ''>('details');
    
    const { addToCart, openCart } = useCart();
    const { toggleFavorite, isFavorite } = useFavorites();
    
    const isFav = isFavorite(product.id as number);
    const isOutOfStock = product.quantity === 0;

    useEffect(() => {
        window.scrollTo(0,0);
        if (product.colors && product.colors.length > 0) {
            setSelectedColor(product.colors[0]);
        } else {
            setSelectedColor(null);
        }
    }, [product]);

    const handleAddToCart = () => {
        if (isOutOfStock) return;
        addToCart({ ...product }, quantity, selectedColor?.name);
        openCart();
    };

    const similarProducts = useMemo(() => 
        allProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 10),
    [allProducts, product]);

    return (
        <div className="min-h-screen bg-[#FDFBF9] dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 font-sans selection:bg-rose-200 dark:selection:bg-rose-900 overflow-x-hidden">
            
            <SEO 
                title={product.name}
                description={product.description || `Découvrez ${product.name} de la marque ${product.brand}.`}
                image={product.imageUrl}
                type="product"
            />

            {/* --- BACKGROUND ATMOSPHERIQUE (Blob animés) --- */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-rose-200/40 dark:bg-rose-900/20 rounded-full blur-[120px] animate-blob"></div>
                <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-purple-200/40 dark:bg-purple-900/20 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
            </div>

            <div className="relative z-10">
                {/* Navbar Spacer + Breadcrumb (Correction Espacement) */}
                <div className="pt-32 pb-6 px-6 md:px-12 max-w-[1800px] mx-auto">
                    <Breadcrumb items={[{ name: 'Accueil', onClick: onNavigateHome }, { name: product.category }, { name: product.name }]} />
                </div>

                <div className="max-w-[1800px] mx-auto px-6 md:px-12 pb-20">
                    <div className="flex flex-col lg:flex-row gap-12 xl:gap-24">
                        
                        {/* --- GAUCHE : GALERIE IMAGE (Sticky) --- */}
                        <div className="w-full lg:w-1/2 relative">
                            {/* Utilisation de ProductGallery qui contient le zoom */}
                            <div className="lg:sticky lg:top-32 h-auto">
                                <ProductGallery 
                                    images={product.images && product.images.length > 0 ? product.images : [product.imageUrl]} 
                                    productName={product.name} 
                                />
                            </div>
                        </div>

                        {/* --- DROITE : CONTENU ÉDITORIAL & ACHAT --- */}
                        <div className="w-full lg:w-1/2 flex flex-col pt-4 lg:pt-0">
                            
                            {/* Brand & Title */}
                            <div className="mb-8 animate-fadeInUp">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="px-3 py-1 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase tracking-[0.2em] rounded-full">
                                        {product.brand}
                                    </span>
                                    {product.promo && <span className="text-rose-600 font-bold text-xs uppercase tracking-widest animate-pulse">Offre Limitée</span>}
                                </div>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium leading-[1.1] tracking-tight mb-6 text-gray-900 dark:text-white">
                                    {product.name}
                                </h1>
                                <div className="flex items-baseline gap-6">
                                    <p className="text-3xl font-light">{product.price.toFixed(3)} <span className="text-lg text-gray-500 font-normal">TND</span></p>
                                    {product.oldPrice && <p className="text-xl text-gray-400 line-through decoration-rose-400 decoration-1">{product.oldPrice.toFixed(3)} TND</p>}
                                </div>
                            </div>

                            {/* Description Poétique */}
                            <div className="prose dark:prose-invert prose-lg text-gray-600 dark:text-gray-300 font-light leading-relaxed mb-10 border-l-2 border-rose-200 dark:border-rose-900 pl-6">
                                <p>{product.description || "Un élixir de beauté conçu pour sublimer votre naturel. Texture aérienne, fini impeccable et tenue longue durée."}</p>
                            </div>

                            {/* --- SÉLECTEUR DE COULEURS ARTISTIQUE --- */}
                            {product.colors && product.colors.length > 0 && (
                                <div className="mb-12 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                                    <div className="flex justify-between items-end mb-4">
                                        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Nuance Sélectionnée</span>
                                        <span className="font-serif italic text-lg text-rose-600 dark:text-rose-400">{selectedColor?.name}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-4">
                                        {product.colors.map((color, idx) => {
                                            const isSelected = selectedColor?.name === color.name;
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => setSelectedColor(color)}
                                                    className={`relative group transition-all duration-500 ease-out ${isSelected ? 'scale-110' : 'hover:scale-105'}`}
                                                >
                                                    <div 
                                                        className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 border-2 ${isSelected ? 'border-gray-900 dark:border-white ring-2 ring-rose-200 dark:ring-rose-900' : 'border-transparent'}`}
                                                        style={{ backgroundColor: color.hex }}
                                                    >
                                                        {isSelected && <CheckCircleIcon className="w-5 h-5 text-white drop-shadow-md mix-blend-difference" />}
                                                    </div>
                                                    {/* Tooltip Artistique */}
                                                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                                                        {color.name}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* --- ACTION BAR --- */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-12">
                                {/* Quantity Stepper */}
                                <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-2 h-14 border border-gray-200 dark:border-gray-700 w-full sm:w-auto justify-between sm:justify-start">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-full flex items-center justify-center hover:text-rose-500 transition-colors"><MinusIcon className="w-4 h-4"/></button>
                                    <span className="w-8 text-center font-bold">{quantity}</span>
                                    <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-full flex items-center justify-center hover:text-rose-500 transition-colors"><PlusIcon className="w-4 h-4"/></button>
                                </div>

                                {/* Add To Cart Button */}
                                <button 
                                    onClick={handleAddToCart}
                                    disabled={isOutOfStock}
                                    className="flex-1 relative overflow-hidden group bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full h-14 font-bold uppercase tracking-widest text-xs transition-all hover:shadow-2xl hover:shadow-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-3 group-hover:gap-6 transition-all duration-300">
                                        {isOutOfStock ? 'Épuisé' : 'Ajouter au Panier'}
                                        {!isOutOfStock && <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>}
                                        {!isOutOfStock && <span>{(product.price * quantity).toFixed(3)} TND</span>}
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-black dark:from-gray-100 dark:to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </button>

                                {/* Wishlist */}
                                <button 
                                    onClick={() => toggleFavorite(product.id as number)}
                                    className={`h-14 w-14 rounded-full flex items-center justify-center border transition-all duration-300 ${isFav ? 'border-rose-500 bg-rose-50 text-rose-500' : 'border-gray-300 hover:border-gray-900 text-gray-400 hover:text-gray-900'}`}
                                >
                                    <HeartIcon className="w-6 h-6" solid={isFav} />
                                </button>
                            </div>

                            {/* --- ACCORDIONS ÉLÉGANTS --- */}
                            <div className="border-t border-gray-200 dark:border-gray-800 mt-2">
                                <DetailAccordion title="Détails du produit" isOpen={activeTab === 'details'} onClick={() => setActiveTab(activeTab === 'details' ? '' : 'details')}>
                                    <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400 font-light">
                                        <p>{product.description}</p>
                                        {product.specifications && (
                                            <ul className="grid grid-cols-2 gap-4 mt-4">
                                                {product.specifications.map((spec, i) => (
                                                    <li key={i} className="flex flex-col">
                                                        <span className="font-bold text-gray-900 dark:text-white text-xs uppercase mb-1">{spec.name}</span>
                                                        <span>{spec.value}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </DetailAccordion>
                                
                                <DetailAccordion title="Conseils d'utilisation" isOpen={activeTab === 'usage'} onClick={() => setActiveTab(activeTab === 'usage' ? '' : 'usage')}>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                                        Appliquez une petite quantité sur une peau propre et sèche. Massez doucement jusqu'à absorption complète. Pour un résultat optimal, utilisez matin et soir.
                                    </p>
                                </DetailAccordion>

                                <DetailAccordion title="Livraison & Retours" isOpen={false} onClick={() => {}}>
                                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                        <span className="flex items-center gap-2"><CheckCircleIcon className="w-4 h-4 text-green-500"/> Expédition 24h</span>
                                        <span className="flex items-center gap-2"><CheckCircleIcon className="w-4 h-4 text-green-500"/> Retour gratuit 14j</span>
                                    </div>
                                </DetailAccordion>
                            </div>

                            {/* "Why We Love It" Section (Editorial Block) */}
                            {product.highlights && (
                                <div className="mt-16 bg-white dark:bg-gray-800 rounded-3xl p-8 lg:p-12 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-100 dark:bg-rose-900/30 rounded-bl-full -mr-16 -mt-16 z-0"></div>
                                    <div className="relative z-10 flex gap-6 items-start">
                                        <div className="p-3 bg-black dark:bg-white text-white dark:text-black rounded-full flex-shrink-0">
                                            <SparklesIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-serif font-bold mb-4">{product.highlights.title || "Le mot de l'experte"}</h3>
                                            <div className="space-y-6">
                                                {product.highlights.sections.map((section, idx) => (
                                                    <div key={idx}>
                                                        <h4 className="font-bold text-rose-500 text-sm uppercase tracking-wider mb-2">{section.subtitle}</h4>
                                                        <ul className="space-y-2">
                                                            {section.features.map((feature, fIdx) => (
                                                                <li key={fIdx} className="text-gray-600 dark:text-gray-300 font-light text-sm">
                                                                    • <span className="font-medium text-gray-900 dark:text-white">{feature.title}</span> : {feature.description}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* --- REVIEWS & RECOMMENDATIONS --- */}
                    <div className="mt-32">
                        <ReviewsSection targetId={product.id as number} targetType="product" />
                    </div>

                    <div className="mt-24">
                        <div className="text-center mb-12">
                            <span className="text-xs font-bold text-rose-500 uppercase tracking-[0.2em]">Complétez votre routine</span>
                            <h2 className="text-3xl md:text-4xl font-serif font-medium mt-3">Vous aimerez aussi</h2>
                        </div>
                        {similarProducts.length > 0 && (
                            <ProductCarousel title="" products={similarProducts} onPreview={onPreview} onNavigateToProductDetail={onNavigateToProductDetail} />
                        )}
                    </div>
                </div>
            </div>
            
            <style>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};
