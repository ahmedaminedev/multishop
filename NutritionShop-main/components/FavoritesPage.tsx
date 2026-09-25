import React, { useEffect, useMemo } from 'react';
import type { Product } from '../types';
import { useFavorites } from './FavoritesContext';
import { useCart } from './CartContext';
import { Breadcrumb } from './Breadcrumb';
import { ProductCard } from './ProductCard';
import { HeartIcon, CartIcon, InformationCircleIcon, SparklesIcon } from './IconComponents';

interface FavoritesPageProps {
    onNavigateHome: () => void;
    onPreview: (product: Product) => void;
    allProducts: Product[];
    onNavigateToProductDetail: (productId: number) => void;
}

const FavoritesSummary: React.FC<{
    favoriteProducts: Product[];
    onAddAllToCart: () => void;
}> = ({ favoriteProducts, onAddAllToCart }) => {
    const { totalOriginalPrice, totalCurrentPrice, totalSavings, isAnyItemOutOfStock } = useMemo(() => {
        const initial = {
            totalOriginalPrice: 0,
            totalCurrentPrice: 0,
            isAnyItemOutOfStock: false,
        };

        const totals = favoriteProducts.reduce((acc, product) => {
            acc.totalOriginalPrice += product.oldPrice || product.price;
            acc.totalCurrentPrice += product.price;
            if (product.quantity === 0) {
                acc.isAnyItemOutOfStock = true;
            }
            return acc;
        }, initial);

        return {
            ...totals,
            totalSavings: totals.totalOriginalPrice - totals.totalCurrentPrice,
        };
    }, [favoriteProducts]);

    return (
        <aside className="w-full lg:w-1/3 xl:w-1/4">
            <div className="bg-white dark:bg-[#0a0a0a] p-8 border border-gray-200 dark:border-gray-800 sticky top-24 shadow-2xl overflow-hidden rounded-sm">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <SparklesIcon className="w-24 h-24 text-black dark:text-white" />
                </div>
                <div className="absolute top-0 left-0 w-1 h-full bg-brand-neon"></div>

                <h2 className="text-2xl font-serif font-black italic text-gray-900 dark:text-white uppercase tracking-tighter mb-8 border-b border-gray-100 dark:border-gray-900 pb-4">
                    Statistiques <span className="text-brand-neon">Tactiques</span>
                </h2>

                <div className="space-y-6 font-mono">
                    <div className="flex justify-between items-end text-gray-400 dark:text-gray-500">
                        <span className="text-[10px] uppercase font-bold tracking-widest">Valeur Brut</span>
                        <span className="text-sm font-bold">{totalOriginalPrice.toFixed(3)} DT</span>
                    </div>
                    
                    {totalSavings > 0 && (
                        <div className="flex justify-between items-end text-brand-neon">
                            <span className="text-[10px] uppercase font-bold tracking-widest">Gain Performance</span>
                            <span className="text-sm font-black">-{totalSavings.toFixed(3)} DT</span>
                        </div>
                    )}

                    <div className="pt-6 border-t border-gray-100 dark:border-gray-900 mt-6">
                        <div className="flex justify-between items-end">
                            <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">Investissement</span>
                            <div className="text-right">
                                <span className="block text-3xl font-black text-gray-900 dark:text-white leading-none">{totalCurrentPrice.toFixed(3)}</span>
                                <span className="text-[10px] text-brand-neon font-black">DT TTC</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-10 space-y-4">
                    <button
                        onClick={onAddAllToCart}
                        disabled={isAnyItemOutOfStock || favoriteProducts.length === 0}
                        className="group relative w-full bg-black dark:bg-brand-neon text-white dark:text-black font-black uppercase tracking-[0.2em] text-xs py-5 px-4 overflow-hidden transition-all hover:bg-brand-neon dark:hover:bg-white hover:text-black disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed shadow-xl"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-3">
                            <CartIcon className="w-4 h-4" />
                            DÉPLOYER LA STACK
                        </span>
                    </button>
                    
                    {isAnyItemOutOfStock && (
                        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30">
                            <InformationCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <p className="text-[10px] text-red-600 dark:text-red-400 font-mono leading-relaxed uppercase">Attention: Certaines unités sont en rupture et ne seront pas transférées.</p>
                        </div>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-900">
                    <p className="text-[9px] text-gray-400 dark:text-gray-600 font-mono uppercase tracking-[0.3em] text-center italic">Système IronFuel v2.4 Actif</p>
                </div>
            </div>
        </aside>
    );
};

export const FavoritesPage: React.FC<FavoritesPageProps> = ({ onNavigateHome, onPreview, allProducts, onNavigateToProductDetail }) => {
    const { favoriteIds } = useFavorites();
    const { addToCart, openCart } = useCart();

    useEffect(() => {
        document.title = `L'ARMURERIE - Mes Favoris IronFuel`;
        window.scrollTo(0,0);
    }, []);

    const favoriteProducts = useMemo(() => {
        return allProducts.filter(p => favoriteIds.includes(p.id));
    }, [allProducts, favoriteIds]);

    const handleAddAllToCart = () => {
        let itemsAdded = false;
        favoriteProducts.forEach(product => {
            if (product.quantity > 0) {
                addToCart(product);
                itemsAdded = true;
            }
        });
        if (itemsAdded) {
            openCart();
        }
    };

    return (
        <div className="bg-white dark:bg-[#050505] min-h-screen relative overflow-hidden selection:bg-brand-neon selection:text-black font-sans transition-colors duration-300">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 dark:opacity-10 pointer-events-none"></div>

            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
                <div className="mb-12">
                    <Breadcrumb items={[{ name: 'Accueil', onClick: onNavigateHome }, { name: 'L\'Armurerie' }]} />
                </div>
                
                <header className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8 animate-fadeIn">
                    <div className="relative">
                        <span className="text-brand-neon font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">Équipement de Combat</span>
                        <h1 className="text-6xl md:text-8xl font-serif font-black italic text-gray-900 dark:text-white uppercase leading-none tracking-tighter">
                            THE <span className="text-brand-neon">ARMORY</span>
                        </h1>
                        <p className="mt-6 text-gray-500 dark:text-gray-500 font-mono text-sm uppercase tracking-widest max-w-xl border-l-2 border-brand-neon pl-6">
                            Préparez votre prochain déploiement. Vos ressources indispensables centralisées au QG.
                        </p>
                    </div>
                    {favoriteProducts.length > 0 && (
                        <div className="flex items-center gap-6 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 px-8 py-4 transform -skew-x-12 shadow-sm">
                            <div className="skew-x-12 text-center">
                                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase">Unités</p>
                                <p className="text-3xl font-black text-gray-900 dark:text-white">{favoriteProducts.length}</p>
                            </div>
                        </div>
                    )}
                </header>

                {favoriteProducts.length > 0 ? (
                    <div className="flex flex-col lg:flex-row gap-12 items-start">
                        <main className="flex-grow order-2 lg:order-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                                {favoriteProducts.map((product, index) => (
                                    <div key={product.id} className="animate-fadeInUp" style={{ animationDelay: `${index * 100}ms` }}>
                                        <ProductCard product={product} onPreview={onPreview} onNavigateToProductDetail={onNavigateToProductDetail} />
                                    </div>
                                ))}
                            </div>
                        </main>
                        <div className="w-full lg:w-auto order-1 lg:order-2">
                             <FavoritesSummary favoriteProducts={favoriteProducts} onAddAllToCart={handleAddAllToCart} />
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-40 border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#080808]/50 animate-fadeIn">
                        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-300 dark:text-gray-700">
                            <HeartIcon className="w-12 h-12" />
                        </div>
                        <h2 className="text-3xl font-serif font-black italic text-gray-900 dark:text-white uppercase mb-4 tracking-tight">VOTRE ARMURERIE EST VIDE</h2>
                        <p className="text-gray-400 dark:text-gray-500 font-mono text-xs uppercase tracking-[0.2em] mb-12 max-w-sm mx-auto">Identifiez vos ressources pour optimiser vos performances lors de vos prochaines sessions.</p>
                        <button 
                            onClick={onNavigateHome} 
                            className="bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.3em] text-xs py-5 px-12 hover:bg-brand-neon transition-all transform -skew-x-12 shadow-2xl"
                        >
                            <span className="skew-x-12 inline-block">EXPLORER LE CATALOGUE</span>
                        </button>
                    </div>
                )}
            </div>
            
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(40px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeInUp { animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
            `}</style>
        </div>
    );
};