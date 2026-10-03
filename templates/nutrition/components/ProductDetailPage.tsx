
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
import { Fitness3DStudio } from './Fitness3DStudio';
import { HeavyDeliveryCalculator } from './HeavyDeliveryCalculator';
import { CrossShopSynergy } from './CrossShopSynergy';
import { Box, Layers, ShieldCheck, Scale, Dumbbell } from 'lucide-react';

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
    const [selectedWeight, setSelectedWeight] = useState<number>(20);
    const [activeTab, setActiveTab] = useState<'details' | 'usage' | ''>('details');
    const [show3DStudio, setShow3DStudio] = useState(false);
    
    const { addToCart, openCart } = useCart();
    const { toggleFavorite, isFavorite } = useFavorites();
    
    const isFav = isFavorite(product.id as number);
    const isOutOfStock = product.quantity === 0;

    const isWeightEquipment = useMemo(() => {
        const cat = (product.category || '').toLowerCase();
        const nm = (product.name || '').toLowerCase();
        return cat.includes('haltère') || cat.includes('poids') || cat.includes('rack') || cat.includes('muscu') || nm.includes('halt') || nm.includes('disque');
    }, [product]);

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
        const variantLabel = selectedColor ? selectedColor.name : (isWeightEquipment ? `Disque Olympique ${selectedWeight} KG` : undefined);
        addToCart({ ...product }, quantity, variantLabel);
        openCart();
    };

    const similarProducts = useMemo(() => 
        allProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 10),
    [allProducts, product]);

    return (
        <div className="min-h-screen bg-white dark:bg-brand-black text-gray-900 dark:text-gray-100 font-sans selection:bg-brand-neon selection:text-black overflow-x-hidden">
            
            <SEO 
                title={product.name}
                description={product.description || `Achetez ${product.name} chez FitnessShop.`}
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
                            <div className="lg:sticky lg:top-32 h-auto border border-gray-100 dark:border-gray-800 p-2 bg-white dark:bg-gray-900 rounded-2xl shadow-sm">
                                <ProductGallery 
                                    images={product.images && product.images.length > 0 ? product.images : [product.imageUrl]} 
                                    productName={product.name} 
                                />

                                {/* Interactive 3D Equipment Studio Trigger */}
                                <button
                                    type="button"
                                    onClick={() => setShow3DStudio(true)}
                                    className="w-full mt-3 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl border border-slate-700/80 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-md group cursor-pointer"
                                >
                                    <Box className="w-4 h-4 text-[#84cc16] group-hover:rotate-12 transition-transform" />
                                    <span>Visualiser en Studio 3D 360° & Vue Éclatée</span>
                                    <span className="w-2 h-2 rounded-full bg-[#84cc16] animate-pulse ml-1"></span>
                                </button>
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
                            <div className="bg-gray-50 dark:bg-[#1f2833] p-6 border-l-4 border-brand-neon mb-8 rounded-r-xl">
                                <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed font-mono text-sm">
                                    {product.description || "Optimisez vos performances avec ce produit de haute qualité. Formulé pour les athlètes exigeants."}
                                </p>
                            </div>

                            {/* Olympic Weight Selector for weight gear */}
                            {isWeightEquipment && (
                                <div className="mb-8 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                            <Dumbbell className="w-4 h-4 text-[#84cc16]" />
                                            <span>Déclinaison Charge Olympique (Norme IWF)</span>
                                        </span>
                                        <span className="text-xs font-mono font-bold text-[#84cc16]">{selectedWeight} KG</span>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[
                                            { wt: 10, color: '#16a34a', label: '10 KG' },
                                            { wt: 15, color: '#eab308', label: '15 KG' },
                                            { wt: 20, color: '#2563eb', label: '20 KG' },
                                            { wt: 25, color: '#dc2626', label: '25 KG' }
                                        ].map(p => (
                                            <button
                                                key={p.wt}
                                                type="button"
                                                onClick={() => setSelectedWeight(p.wt)}
                                                className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                                                    selectedWeight === p.wt 
                                                        ? 'border-[#84cc16] bg-white dark:bg-slate-800 shadow-sm' 
                                                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 bg-transparent'
                                                }`}
                                            >
                                                <span className="w-3 h-3 rounded-full mx-auto block mb-1" style={{ backgroundColor: p.color }}></span>
                                                <span className="text-xs font-mono font-black text-slate-900 dark:text-white block">{p.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Sélecteur Variante */}
                            {product.colors && product.colors.length > 0 && (
                                <div className="mb-8">
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
                            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                {/* Quantity */}
                                <div className="flex items-center bg-slate-100 dark:bg-slate-800 h-13 border border-slate-200 dark:border-slate-700 rounded-xl w-full sm:w-auto overflow-hidden">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"><MinusIcon className="w-4 h-4"/></button>
                                    <span className="w-12 text-center font-extrabold text-base">{quantity}</span>
                                    <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"><PlusIcon className="w-4 h-4"/></button>
                                </div>

                                {/* Add To Cart */}
                                <button 
                                    onClick={handleAddToCart}
                                    disabled={isOutOfStock}
                                    className="flex-1 bg-[#84cc16] hover:bg-[#72b012] text-black h-13 font-black uppercase tracking-wider text-sm rounded-xl shadow-md transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <span>{isOutOfStock ? 'RUPTURE DE STOCK' : 'AJOUTER AU PANIER'}</span>
                                </button>

                                {/* Wishlist */}
                                <button 
                                    onClick={() => toggleFavorite(product.id as number)}
                                    className={`h-13 w-13 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 transition-all ${isFav ? 'bg-rose-500 border-rose-500 text-white' : 'text-slate-400 hover:text-rose-500 hover:border-rose-300'}`}
                                >
                                    <HeartIcon className="w-5 h-5" solid={isFav} />
                                </button>
                            </div>

                            {/* Tunisia Heavy Equipment Delivery Calculator */}
                            <HeavyDeliveryCalculator 
                                productWeightKg={product.poidsKg || (isWeightEquipment ? 45 : 10)} 
                                productPrice={product.price}
                                className="mb-8"
                            />

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

                    <div className="mt-20 border-t border-gray-100 dark:border-gray-800 pt-10">
                        <CrossShopSynergy />
                    </div>

                    <div className="mt-16 border-t border-gray-100 dark:border-gray-800 pt-16">
                        <ReviewsSection targetId={product.id as number} targetType="product" />
                    </div>

                    <div className="mt-20">
                        <h2 className="text-3xl font-serif font-black uppercase italic mb-8 text-center text-gray-900 dark:text-white">Produits Similaires</h2>
                        {similarProducts.length > 0 && (
                            <ProductCarousel title="" products={similarProducts} onPreview={onPreview} onNavigateToProductDetail={onNavigateToProductDetail} />
                        )}
                    </div>
                </div>
            </div>

            {/* Interactive 3D Studio Modal */}
            {show3DStudio && (
                <Fitness3DStudio
                    isModal={true}
                    onClose={() => setShow3DStudio(false)}
                    initialMode={isWeightEquipment ? 'barbell' : 'gym'}
                />
            )}
        </div>
    );
};
