import React, { useEffect, useMemo } from 'react';
import type { Product } from '../types';
import { useFavorites } from './FavoritesContext';
import { useCart } from './CartContext';
import { Breadcrumb } from './Breadcrumb';
import { ProductCard } from './ProductCard';
import { HeartIcon, CartIcon, InformationCircleIcon } from './IconComponents';

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
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md sticky top-24">
                <h2 className="text-2xl font-bold mb-6 border-b dark:border-gray-700 pb-4">Résumé des favoris</h2>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Valeur totale</span>
                        <span className="font-semibold text-gray-500 dark:text-gray-400 line-through">{totalOriginalPrice.toFixed(3).replace('.', ',')} DT</span>
                    </div>
                    {totalSavings > 0 && (
                        <div className="flex justify-between text-green-600 dark:text-green-400">
                            <span className="font-semibold">Vos économies</span>
                            <span className="font-semibold">-{totalSavings.toFixed(3).replace('.', ',')} DT</span>
                        </div>
                    )}
                    <div className="flex justify-between text-lg font-bold pt-2 border-t dark:border-gray-700 mt-2">
                        <span>Prix actuel total</span>
                        <span className="text-red-600">{totalCurrentPrice.toFixed(3).replace('.', ',')} DT</span>
                    </div>
                </div>

                <div className="mt-8">
                    <button
                        onClick={onAddAllToCart}
                        disabled={isAnyItemOutOfStock || favoriteProducts.length === 0}
                        className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        <CartIcon className="w-5 h-5" />
                        <span>Ajouter tout au panier</span>
                    </button>
                    {isAnyItemOutOfStock && (
                        <div className="flex items-center gap-2 mt-3 text-xs text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 p-2 rounded-md">
                            <InformationCircleIcon className="w-5 h-5 flex-shrink-0" />
                            <span>Certains articles sont en rupture de stock et ne seront pas ajoutés.</span>
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
        document.title = `Mes Favoris - Electro Shop`;
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
        <div className="bg-gray-100 dark:bg-gray-950 min-h-screen">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <Breadcrumb items={[{ name: 'Accueil', onClick: onNavigateHome }, { name: 'Mes Favoris' }]} />
                </div>
                
                <header className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">Ma Liste de Favoris</h1>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Vous avez {favoriteProducts.length} article{favoriteProducts.length !== 1 ? 's' : ''} dans vos favoris.</p>
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
                    <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                        <HeartIcon className="w-24 h-24 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Votre liste de favoris est vide.</h2>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">Cliquez sur le cœur sur un produit pour l'ajouter ici.</p>
                        <button onClick={onNavigateHome} className="mt-6 bg-red-600 text-white font-bold py-3 px-8 rounded-full hover:bg-red-700 transition-colors duration-300">
                            Découvrir les produits
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};