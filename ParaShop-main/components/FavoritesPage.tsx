
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
    const { totalCurrentPrice, totalSavings, isAnyItemOutOfStock } = useMemo(() => {
        const initial = { totalOriginalPrice: 0, totalCurrentPrice: 0, isAnyItemOutOfStock: false };
        const totals = favoriteProducts.reduce((acc, product) => {
            acc.totalOriginalPrice += product.oldPrice || product.price;
            acc.totalCurrentPrice += product.price;
            if (product.quantity === 0) acc.isAnyItemOutOfStock = true;
            return acc;
        }, initial);
        return { ...totals, totalSavings: totals.totalOriginalPrice - totals.totalCurrentPrice };
    }, [favoriteProducts]);

    return (
        <aside className="w-full lg:w-1/3 xl:w-1/4">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[3rem] border border-gray-100 dark:border-white/5 sticky top-32 shadow-xl overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <SparklesIcon className="w-24 h-24 text-brand-primary" />
                </div>
                <h2 className="text-2xl font-serif font-black text-gray-900 dark:text-white mb-8 border-b border-gray-50 dark:border-white/5 pb-4">
                    Bilan <span className="text-brand-primary">Vitalité</span>
                </h2>
                <div className="space-y-6">
                    <div className="flex justify-between items-center text-gray-500">
                        <span className="text-[10px] font-black uppercase tracking-widest">Valeur de la cure</span>
                        <span className="text-sm font-bold">{(totalCurrentPrice + totalSavings).toFixed(3)} DT</span>
                    </div>
                    {totalSavings > 0 && (
                        <div className="flex justify-between items-center text-brand-primary">
                            <span className="text-[10px] font-black uppercase tracking-widest">Avantage Fidélité</span>
                            <span className="text-sm font-black">-{totalSavings.toFixed(3)} DT</span>
                        </div>
                    )}
                    <div className="pt-6 border-t border-gray-50 dark:border-white/5">
                        <div className="flex justify-between items-end">
                            <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">Total</span>
                            <div className="text-right">
                                <span className="block text-3xl font-black text-brand-primary leading-none">{totalCurrentPrice.toFixed(3)}</span>
                                <span className="text-[10px] text-gray-400 font-bold uppercase">DT TTC</span>
                            </div>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onAddAllToCart}
                    disabled={isAnyItemOutOfStock || favoriteProducts.length === 0}
                    className="w-full bg-brand-primary text-white font-black uppercase tracking-widest text-xs py-5 rounded-2xl mt-10 hover:bg-brand-primaryHover transition-all shadow-xl shadow-brand-primary/20 disabled:bg-gray-100 disabled:text-gray-300"
                >
                    Commander ma routine
                </button>
            </div>
        </aside>
    );
};

export const FavoritesPage: React.FC<FavoritesPageProps> = ({ onNavigateHome, onPreview, allProducts, onNavigateToProductDetail }) => {
    const { favoriteIds } = useFavorites();
    const { addToCart, openCart } = useCart();

    useEffect(() => {
        document.title = "Mes Essentiels Santé - PharmaNature";
        window.scrollTo(0,0);
    }, []);

    const favoriteProducts = useMemo(() => allProducts.filter(p => favoriteIds.includes(p.id)), [allProducts, favoriteIds]);

    const handleAddAllToCart = () => {
        favoriteProducts.forEach(p => p.quantity > 0 && addToCart(p));
        openCart();
    };

    return (
        <div className="bg-brand-bg dark:bg-brand-dark min-h-screen pb-32">
            <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-12">
                <div className="mb-12">
                    <Breadcrumb items={[{ name: 'Accueil', onClick: onNavigateHome }, { name: 'Mes Essentiels' }]} />
                </div>
                <header className="mb-20">
                    <span className="text-brand-primary font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">Votre Sélection</span>
                    <h1 className="text-5xl md:text-7xl font-serif font-black text-gray-900 dark:text-white tracking-tighter">
                        Ma <span className="text-brand-primary italic">Routine</span> Bien-être
                    </h1>
                    <p className="mt-6 text-gray-500 max-w-xl text-lg leading-relaxed font-medium">
                        Retrouvez ici les solutions de santé naturelle que vous avez sélectionnées avec nos experts.
                    </p>
                </header>

                {favoriteProducts.length > 0 ? (
                    <div className="flex flex-col lg:flex-row gap-16 items-start">
                        <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">
                            {favoriteProducts.map(product => (
                                <ProductCard key={product.id} product={product} onPreview={onPreview} onNavigateToProductDetail={onNavigateToProductDetail} />
                            ))}
                        </div>
                        <FavoritesSummary favoriteProducts={favoriteProducts} onAddAllToCart={handleAddAllToCart} />
                    </div>
                ) : (
                    <div className="text-center py-40 bg-white dark:bg-gray-800 rounded-[4rem] border border-dashed border-gray-200 dark:border-white/5">
                        <HeartIcon className="w-16 h-16 mx-auto mb-8 text-gray-200" />
                        <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-4">Votre sélection est vide</h2>
                        <button onClick={onNavigateHome} className="bg-brand-primary text-white font-black py-4 px-10 rounded-2xl hover:bg-brand-primaryHover transition-all uppercase text-xs tracking-widest">Découvrir l'officine</button>
                    </div>
                )}
            </div>
        </div>
    );
};
