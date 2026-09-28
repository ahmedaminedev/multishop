
import React, { useEffect, useMemo } from 'react';
import type { Product } from '../types';
import { useFavorites } from './FavoritesContext';
import { useCart } from './CartContext';
import { Breadcrumb } from './Breadcrumb';
import { ProductCard } from './ProductCard';
import { HeartIcon, ShoppingBagIcon, InformationCircleIcon } from './IconComponents';

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
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 sticky top-24">
                <h2 className="text-xl font-serif font-bold mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">Résumé des favoris</h2>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Valeur totale</span>
                        <span className="font-semibold text-gray-400 line-through">{totalOriginalPrice.toFixed(3)} DT</span>
                    </div>
                    {totalSavings > 0 && (
                        <div className="flex justify-between text-green-600 dark:text-green-400">
                            <span className="font-semibold">Vos économies</span>
                            <span className="font-semibold">-{totalSavings.toFixed(3)} DT</span>
                        </div>
                    )}
                    <div className="flex justify-between text-lg font-bold pt-4 border-t border-gray-100 dark:border-gray-700 mt-2">
                        <span>Prix actuel total</span>
                        <span className="text-gray-900 dark:text-white">{totalCurrentPrice.toFixed(3)} DT</span>
                    </div>
                </div>

                <div className="mt-8">
                    <button
                        onClick={onAddAllToCart}
                        disabled={isAnyItemOutOfStock || favoriteProducts.length === 0}
                        className="w-full bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-xs py-3.5 px-4 rounded-full flex items-center justify-center space-x-2 transition-all duration-300 hover:bg-rose-600 dark:hover:bg-rose-500 dark:hover:text-white disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg"
                    >
                        <ShoppingBagIcon className="w-4 h-4" />
                        <span>Tout ajouter au sac</span>
                    </button>
                    {isAnyItemOutOfStock && (
                        <div className="flex items-center gap-2 mt-4 text-xs text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg border border-yellow-100 dark:border-yellow-800">
                            <InformationCircleIcon className="w-4 h-4 flex-shrink-0" />
                            <span>Certains articles sont épuisés et ne seront pas ajoutés.</span>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};


export const FavoritesPage: React.FC<FavoritesPageProps> = ({ onNavigateHome, onPreview, allProducts, onNavigateToProductDetail }) => {
    const { favoriteIds } = useFavorites();
    const { addToCart, openCart } = useCart();

    useEffect(() => {
        document.title = `Mes Favoris - Cosmetics Shop`;
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
        <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <Breadcrumb items={[{ name: 'Accueil', onClick: onNavigateHome }, { name: 'Mes Favoris' }]} />
                </div>
                
                <header className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white">Ma Liste de Souhaits</h1>
                    <p className="mt-2 text-gray-500 font-light">Retrouvez ici vos produits coups de cœur ({favoriteProducts.length}).</p>
                </header>

                {favoriteProducts.length > 0 ? (
                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        <main className="flex-grow">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {favoriteProducts.map(product => (
                                    <ProductCard key={product.id} product={product} onPreview={onPreview} onNavigateToProductDetail={onNavigateToProductDetail} />
                                ))}
                            </div>
                        </main>
                        <FavoritesSummary favoriteProducts={favoriteProducts} onAddAllToCart={handleAddAllToCart} />
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="w-24 h-24 bg-rose-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <HeartIcon className="w-10 h-10 text-rose-300" />
                        </div>
                        <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Votre liste de souhaits est vide.</h2>
                        <p className="mt-2 text-gray-500 font-light max-w-sm mx-auto">Explorez notre catalogue et ajoutez vos produits préférés ici pour les retrouver plus tard.</p>
                        <button onClick={onNavigateHome} className="mt-8 bg-black dark:bg-white text-white dark:text-black font-bold uppercase text-xs py-3.5 px-10 rounded-full hover:bg-rose-600 transition-colors shadow-lg">
                            Découvrir la collection
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
