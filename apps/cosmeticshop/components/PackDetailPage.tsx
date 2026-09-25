
import React, { useState, useMemo, useEffect } from 'react';
import type { Product, Pack } from '../types';
import { Breadcrumb } from './Breadcrumb';
import { useCart } from './CartContext';
import { PlusIcon, MinusIcon, StarIcon, CheckCircleIcon, HeartIcon } from './IconComponents';
import { ReviewsSection } from './ReviewsSection';
import { useFavorites } from './FavoritesContext';

interface PackDetailPageProps {
    pack: Pack;
    allProducts: Product[];
    allPacks: Pack[];
    onNavigateHome: () => void;
    onNavigateToProductDetail: (productId: number | string) => void;
    onNavigateToPackDetail: (packId: number | string) => void;
    onNavigateToPacks: () => void;
}

// Recursive function to get all products
const getPackContents = (pack: Pack, allProducts: Product[], allPacks: Pack[]): Product[] => {
    let contents: Product[] = [];
    
    pack.includedProductIds.forEach(productId => {
        const product = allProducts.find(p => p.id === productId);
        if (product) contents.push(product);
    });

    if (pack.includedPackIds) {
        pack.includedPackIds.forEach(subPackId => {
            const subPack = allPacks.find(p => p.id === subPackId);
            if (subPack) {
                const subPackContents = getPackContents(subPack, allProducts, allPacks);
                contents = [...contents, ...subPackContents];
            }
        });
    }
    return contents;
};

export const PackDetailPage: React.FC<PackDetailPageProps> = ({ pack, allProducts, allPacks, onNavigateHome, onNavigateToProductDetail, onNavigateToPacks }) => {
    const [quantity, setQuantity] = useState(1);
    const { addToCart, openCart } = useCart();
    const { toggleFavorite, isFavorite } = useFavorites();
    const isFav = isFavorite(pack.id);
    
    const savings = pack.oldPrice - pack.price;
    const savingsPercent = Math.round((savings / pack.oldPrice) * 100);
    const packContents = useMemo(() => getPackContents(pack, allProducts, allPacks), [pack, allProducts, allPacks]);

    const isAvailable = useMemo(() => {
        for (const product of packContents) {
            if (product.quantity === 0) return false;
        }
        return true;
    }, [packContents]);

    useEffect(() => {
        document.title = `${pack.name} | Coffret Luxe - Cosmetics Shop`;
        window.scrollTo(0, 0);
    }, [pack]);

    const handleAddToCart = () => {
        if (!isAvailable) return;
        addToCart(pack, quantity);
        openCart();
    };

    return (
        <div className="bg-white dark:bg-gray-950 min-h-screen font-sans pb-20 lg:pb-0">
            {/* Header */}
            <div className="border-b border-gray-50 dark:border-gray-900 bg-white/80 backdrop-blur-sm sticky top-0 z-30 transition-all duration-300">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Breadcrumb items={[{ name: 'Accueil', onClick: onNavigateHome }, { name: 'Coffrets', onClick: onNavigateToPacks }, { name: pack.name }]} />
                </div>
            </div>

            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
                <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
                    
                    {/* Visual Section (Left) */}
                    <div className="w-full lg:w-1/2">
                        <div className="sticky top-32 space-y-8">
                            <div className="relative aspect-[4/5] md:aspect-square rounded-[2rem] overflow-hidden bg-[#FDF2F8] dark:bg-gray-900 group shadow-2xl shadow-rose-100/50 dark:shadow-none">
                                <img 
                                    src={pack.imageUrl} 
                                    alt={pack.name} 
                                    className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105" 
                                />
                                <div className="absolute top-6 left-6 bg-white/90 dark:bg-black/80 backdrop-blur px-5 py-2 rounded-full shadow-sm border border-white/20">
                                    <span className="font-serif font-bold text-rose-600 dark:text-rose-400 tracking-wide">- {savingsPercent}%</span>
                                </div>
                                <button onClick={() => toggleFavorite(pack.id)} className={`absolute top-6 right-6 p-3 rounded-full backdrop-blur-md transition-all ${isFav ? 'bg-rose-50 text-rose-500' : 'bg-white/60 text-gray-600 hover:bg-white'}`}>
                                    <HeartIcon className="w-6 h-6" solid={isFav} />
                                </button>
                            </div>
                            
                            {/* Visual Guarantee */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl flex items-center gap-3">
                                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Expédition 24h</span>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl flex items-center gap-3">
                                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Authentique</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Section (Right) */}
                    <div className="w-full lg:w-1/2 flex flex-col">
                        <span className="text-rose-500 font-bold tracking-[0.25em] text-xs uppercase mb-4">Collection Exclusive</span>
                        <h1 className="text-4xl lg:text-6xl font-serif font-medium text-gray-900 dark:text-white leading-tight mb-6">
                            {pack.name}
                        </h1>

                        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex text-yellow-400">
                                {[1,2,3,4,5].map(i => <StarIcon key={i} className="w-5 h-5 fill-current" />)}
                            </div>
                            <span className="text-sm font-medium text-gray-500">Avis clients</span>
                        </div>

                        <div className="prose dark:prose-invert prose-lg text-gray-600 dark:text-gray-300 font-light leading-relaxed mb-10">
                            <p>{pack.description}</p>
                        </div>

                        {/* Included Products - Visual Grid */}
                        <div className="mb-12">
                            <h3 className="font-serif text-2xl text-gray-900 dark:text-white mb-6">Ce que contient ce coffret</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {packContents.map((product) => (
                                    <div 
                                        key={product.id} 
                                        onClick={() => onNavigateToProductDetail(product.id)}
                                        className="group cursor-pointer flex items-center gap-4 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-rose-200 dark:hover:border-rose-900 hover:shadow-lg hover:shadow-rose-100/30 dark:hover:shadow-none transition-all bg-white dark:bg-gray-900"
                                    >
                                        <div className="w-20 h-20 rounded-lg bg-gray-50 dark:bg-gray-800 flex-shrink-0 overflow-hidden">
                                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{product.brand}</p>
                                            <p className="font-serif text-sm font-bold text-gray-900 dark:text-white leading-tight group-hover:text-rose-600 transition-colors">{product.name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pricing & CTA */}
                        <div className="mt-auto bg-gray-50 dark:bg-gray-900 p-8 rounded-3xl space-y-6">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Prix du coffret</p>
                                    <p className="text-4xl font-serif font-medium text-gray-900 dark:text-white">{pack.price.toFixed(3)} <span className="text-lg font-sans text-gray-500">DT</span></p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500 mb-1">Valeur réelle</p>
                                    <p className="text-xl text-gray-400 line-through decoration-rose-500">{pack.oldPrice.toFixed(3)} DT</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex items-center bg-white dark:bg-gray-800 rounded-full px-4 border border-gray-200 dark:border-gray-700 h-14 w-32 justify-between">
                                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-gray-500 hover:text-black" disabled={quantity <= 1}><MinusIcon className="w-4 h-4" /></button>
                                    <span className="font-bold text-lg">{quantity}</span>
                                    <button onClick={() => setQuantity(q => q + 1)} className="text-gray-500 hover:text-black"><PlusIcon className="w-4 h-4" /></button>
                                </div>
                                <button 
                                    onClick={handleAddToCart}
                                    disabled={!isAvailable}
                                    className="flex-1 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-[0.15em] text-xs h-14 rounded-full hover:bg-rose-600 dark:hover:bg-rose-400 dark:hover:text-white transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
                                >
                                    {isAvailable ? 'Ajouter au panier' : 'Rupture de stock'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews */}
                <ReviewsSection targetId={pack.id} targetType="pack" />
            </div>
        </div>
    );
};
