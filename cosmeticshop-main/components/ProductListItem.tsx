
import React from 'react';
import type { Product } from '../types';
import { EyeIcon, ShoppingBagIcon, HeartIcon } from './IconComponents';
import { useCart } from './CartContext';
import { useFavorites } from './FavoritesContext';

interface ProductListItemProps {
    product: Product;
    onPreview: (product: Product) => void;
    onNavigateToProductDetail: (productId: number) => void;
}

export const ProductListItem: React.FC<ProductListItemProps> = ({ product, onPreview, onNavigateToProductDetail }) => {
    const { addToCart, openCart } = useCart();
    const { toggleFavorite, isFavorite } = useFavorites();
    const isFav = isFavorite(product.id);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        addToCart(product);
        openCart();
    };
    
    const handleProductClick = (e: React.MouseEvent) => {
        e.preventDefault();
        onNavigateToProductDetail(product.id);
    }

    const discountPercentage = product.oldPrice && product.price 
        ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
        : product.discount;

    // Use primary or secondary image for hover effect logic if implemented in list
    const displayImage = product.imageUrl;

    return (
        <div 
            className="group relative flex flex-col md:flex-row items-stretch bg-white dark:bg-gray-800 rounded-3xl p-4 md:p-0 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 border border-gray-100 dark:border-gray-700 cursor-pointer overflow-hidden transform hover:-translate-y-1"
            onClick={handleProductClick}
        >
            {/* Image Section */}
            <div className="w-full md:w-64 lg:w-72 h-64 md:h-auto flex-shrink-0 relative overflow-hidden rounded-2xl bg-[#F9F9F9] dark:bg-gray-700/50 md:rounded-r-none md:rounded-l-3xl">
                <img
                    src={displayImage}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110 mix-blend-multiply dark:mix-blend-normal"
                />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                    {discountPercentage && (
                        <span className="bg-rose-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm backdrop-blur-sm">
                            -{discountPercentage}%
                        </span>
                    )}
                </div>

                {/* Quick Action Overlay (Mobile visible only on click context, Desktop on hover) */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Content Section */}
            <div className="flex-grow p-6 md:p-8 flex flex-col justify-between relative">
                
                {/* Favorite Button (Absolute Top Right) */}
                <button 
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
                    className={`absolute top-6 right-6 p-2 rounded-full transition-all duration-300 z-20 ${isFav ? 'bg-rose-50 text-rose-500' : 'bg-gray-50 dark:bg-gray-700 text-gray-400 hover:text-rose-500 hover:bg-white'}`}
                >
                    <HeartIcon className="w-5 h-5" solid={isFav} />
                </button>

                <div>
                    <div className="mb-2">
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{product.brand}</span>
                    </div>
                    
                    <h3 className="text-xl lg:text-2xl font-serif font-bold text-gray-900 dark:text-white mb-3 group-hover:text-rose-600 transition-colors leading-tight">
                        {product.name}
                    </h3>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 md:line-clamp-3 leading-relaxed max-w-2xl font-light">
                        {product.description || "Découvrez ce produit exceptionnel de notre collection."}
                    </p>

                    {/* Specs Tags */}
                    {product.specifications && product.specifications.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {product.specifications.slice(0, 3).map((spec, i) => (
                                <span key={i} className="text-[10px] bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded border border-gray-100 dark:border-gray-600">
                                    {spec.name}: {spec.value}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer: Price & Actions */}
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                    <div className="flex items-baseline gap-3">
                        <span className="text-2xl lg:text-3xl font-serif font-bold text-gray-900 dark:text-white">
                            {product.price.toFixed(3)} <span className="text-sm font-sans font-light text-gray-500">DT</span>
                        </span>
                        {product.oldPrice && (
                            <span className="text-sm text-gray-400 line-through decoration-rose-300 decoration-1">
                                {product.oldPrice.toFixed(3)} DT
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onPreview(product); }}
                            className="p-3.5 rounded-full border border-gray-200 dark:border-gray-600 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 transition-all bg-white dark:bg-gray-800"
                            title="Aperçu rapide"
                        >
                            <EyeIcon className="w-5 h-5" />
                        </button>
                        
                        <button 
                            onClick={handleAddToCart}
                            disabled={product.quantity === 0}
                            className="flex-1 sm:flex-none bg-gray-900 dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-xs px-8 py-4 rounded-full hover:bg-rose-600 dark:hover:bg-rose-500 dark:hover:text-white transition-all shadow-lg hover:shadow-rose-200 dark:hover:shadow-none flex items-center justify-center gap-2 group/btn"
                        >
                            <ShoppingBagIcon className="w-4 h-4 transition-transform group-hover/btn:-translate-y-0.5" />
                            <span>{product.quantity === 0 ? 'Épuisé' : 'Ajouter'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
