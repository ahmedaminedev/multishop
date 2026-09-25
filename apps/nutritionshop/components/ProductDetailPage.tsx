
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
                className="w-full flex justify-between items-center py-6 text-left group bg-transparent hover:bg-gray-50 dark:hover:bg-gray-900 px-2 transition-colors"
            >
                <span className="font-serif text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider group-hover:text-brand-neon transition-colors">{title}</span>
                <span className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-neon' : 'text-gray-400'}`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 9L12 15L18 9" />
                    </svg>
                </span>
            </button>
            <div 
                className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 opacity-100 pb-6 px-2' : 'max-h-0 opacity-0'}`}
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
        <div className="min-h-screen bg-white dark:bg-brand-black text-gray-900 dark:text-gray-100 font-sans selection:bg-brand-neon selection:text-black overflow-x-hidden">
            
            <SEO 
                title={product.name}
                description={product.description || `Achetez ${product.name} chez IronFuel.`}
                image={product.imageUrl}
                type="product"
            />

            <div className="relative z-10">
                <div className="pt-24 pb-6 px-6 md:px-12 max-w-[1800px] mx-auto border-b border-gray-100 dark:border-gray-800">
                    <Breadcrumb items={[{ name: 'Accueil', onClick: onNavigateHome }, { name: product.category }, { name: product.name }]} />
                </div>

                <div className="max-w-[1800px] mx-auto px-6 md:px-12 pb-20 mt-8">
                    <div className="flex flex-col lg:flex-row gap-12 xl:gap-24">
                        
                        {/* --- GAUCHE : GALERIE --- */}
                        <div className="w-full lg:w-1/2 relative">
                            <div className="lg:sticky lg:top-32 h-auto border border-gray-100 dark:border-gray-800 p-2 bg-white dark:bg-gray-900">
                                <ProductGallery 
                                    images={product.images && product.images.length > 0 ? product.images : [product.imageUrl]} 
                                    productName={product.name} 
                                />
                            </div>
                        </div>

                        {/* --- DROITE : TECH SPECS & ACHAT --- */}
                        <div className="w-full lg:w-1/2 flex flex-col pt-4 lg:pt-0">
                            
                            {/* Header */}
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                                        {product.brand}
                                    </span>
                                    {product.promo && <span className="bg-brand-neon text-black text-[10px] font-black px-2 py-0.5 uppercase tracking-wide skew-x-[-12deg]">Promo</span>}
                                </div>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black uppercase italic leading-[0.9] mb-6 text-gray-900 dark:text-white">
                                    {product.name}
                                </h1>
                                <div className="flex items-baseline gap-4 mb-6">
                                    <p className="text-4xl font-black text-brand-black dark:text-white">{product.price.toFixed(3)} <span className="text-lg font-bold text-gray-500">TND</span></p>
                                    {product.oldPrice && <p className="text-xl text-gray-400 line-through font-mono decoration-red-500">{product.oldPrice.toFixed(3)}</p>}
                                </div>
                            </div>

                            {/* Description Technique */}
                            <div className="bg-gray-50 dark:bg-[#1f2833] p-6 border-l-4 border-brand-neon mb-10">
                                <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed font-mono text-sm">
                                    {product.description || "Optimisez vos performances avec ce produit de haute qualité. Formulé pour les athlètes exigeants."}
                                </p>
                            </div>

                            {/* Sélecteur Variante */}
                            {product.colors && product.colors.length > 0 && (
                                <div className="mb-10">
                                    <div className="flex justify-between items-end mb-3">
                                        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Goût / Variante</span>
                                        <span className="font-bold text-brand-neon">{selectedColor?.name}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {product.colors.map((color, idx) => {
                                            const isSelected = selectedColor?.name === color.name;
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => setSelectedColor(color)}
                                                    className={`px-4 py-2 text-xs font-bold uppercase border-2 transition-all ${isSelected ? 'border-brand-neon bg-brand-neon text-black' : 'border-gray-300 dark:border-gray-700 text-gray-500 hover:border-white hover:text-white'}`}
                                                >
                                                    {color.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-12">
                                {/* Quantity */}
                                <div className="flex items-center bg-gray-100 dark:bg-gray-800 h-14 border border-gray-300 dark:border-gray-600 w-full sm:w-auto">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-full flex items-center justify-center hover:bg-black hover:text-white transition-colors"><MinusIcon className="w-4 h-4"/></button>
                                    <span className="w-12 text-center font-bold font-mono text-lg">{quantity}</span>
                                    <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-full flex items-center justify-center hover:bg-black hover:text-white transition-colors"><PlusIcon className="w-4 h-4"/></button>
                                </div>

                                {/* Add To Cart */}
                                <button 
                                    onClick={handleAddToCart}
                                    disabled={isOutOfStock}
                                    className="flex-1 relative overflow-hidden group bg-brand-black dark:bg-white text-white dark:text-black h-14 font-black uppercase tracking-[0.15em] text-sm hover:bg-brand-neon hover:text-black transition-all skew-x-[-12deg] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-3 skew-x-[12deg]">
                                        {isOutOfStock ? 'RUPTURE DE STOCK' : 'AJOUTER AU PANIER'}
                                    </span>
                                </button>

                                {/* Wishlist */}
                                <button 
                                    onClick={() => toggleFavorite(product.id as number)}
                                    className={`h-14 w-14 flex items-center justify-center border-2 transition-all ${isFav ? 'border-brand-alert bg-brand-alert text-white' : 'border-gray-300 dark:border-gray-600 text-gray-400 hover:border-white hover:text-white'}`}
                                >
                                    <HeartIcon className="w-6 h-6" solid={isFav} />
                                </button>
                            </div>

                            {/* Specs Accordions */}
                            <div className="border-t-2 border-gray-100 dark:border-gray-800">
                                <DetailAccordion title="Fiche Technique" isOpen={activeTab === 'details'} onClick={() => setActiveTab(activeTab === 'details' ? '' : 'details')}>
                                    <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm text-gray-400 font-mono mt-4">
                                        {product.specifications && product.specifications.map((spec, i) => (
                                            <div key={i} className="flex flex-col border-b border-gray-800 pb-2">
                                                <span className="uppercase text-xs text-gray-600 dark:text-gray-500 font-bold mb-1">{spec.name}</span>
                                                <span className="text-gray-900 dark:text-white font-bold">{spec.value}</span>
                                            </div>
                                        ))}
                                        {!product.specifications && <p>Aucune spécification disponible.</p>}
                                    </div>
                                </DetailAccordion>
                                
                                <DetailAccordion title="Mode d'emploi" isOpen={activeTab === 'usage'} onClick={() => setActiveTab(activeTab === 'usage' ? '' : 'usage')}>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 font-medium leading-relaxed mt-4 bg-gray-50 dark:bg-gray-800 p-4 border-l-4 border-brand-neon">
                                        Mélanger 1 dose avec 250ml d'eau ou de lait écrémé. Consommer après l'entraînement ou en collation.
                                    </p>
                                </DetailAccordion>
                            </div>

                        </div>
                    </div>

                    <div className="mt-24 border-t border-gray-100 dark:border-gray-800 pt-16">
                        <ReviewsSection targetId={product.id as number} targetType="product" />
                    </div>

                    <div className="mt-24">
                        <h2 className="text-3xl font-serif font-black uppercase italic mb-8 text-center text-gray-900 dark:text-white">Produits Similaires</h2>
                        {similarProducts.length > 0 && (
                            <ProductCarousel title="" products={similarProducts} onPreview={onPreview} onNavigateToProductDetail={onNavigateToProductDetail} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
