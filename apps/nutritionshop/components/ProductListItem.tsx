import React from 'react';
import type { Product } from '../types';
import { EyeIcon, CartIcon, HeartIcon } from './IconComponents';
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
    const isOutOfStock = product.quantity === 0;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isOutOfStock) return;
        addToCart(product);
        openCart();
    };
    
    const handleProductClick = (e: React.MouseEvent) => {
        e.preventDefault();
        onNavigateToProductDetail(product.id);
    }

    return (
        <div 
            className="group relative flex flex-col md:flex-row items-stretch bg-white dark:bg-[#0f0f0f] border-2 border-gray-100 dark:border-gray-800 hover:border-brand-neon transition-all duration-500 cursor-pointer overflow-hidden shadow-sm hover:shadow-2xl"
            onClick={handleProductClick}
        >
            {/* Image Section */}
            <div className="w-full md:w-80 h-72 md:h-auto flex-shrink-0 relative overflow-hidden bg-gray-50 dark:bg-black/40 border-r border-gray-100 dark:border-gray-800">
                <img
                    src={product.imageUrl}
                    alt={product.name}
                    className={`absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 ${isOutOfStock ? 'opacity-30 grayscale' : ''}`}
                />
                
                {/* Badges */}
                <div className="absolute top-4 left-0 flex flex-col gap-2 z-10">
                    {product.promo && (
                        <span className="bg-brand-neon text-black text-[9px] font-black px-3 py-1 uppercase tracking-widest slant">
                            <span className="slant-reverse block">ELITE OPS</span>
                        </span>
                    )}
                </div>
            </div>

            {/* Content Section */}
            <div className="flex-grow p-6 md:p-10 flex flex-col justify-between relative bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-repeat opacity-[0.98]">
                
                <button 
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
                    className={`absolute top-6 right-6 w-12 h-12 flex items-center justify-center transition-all duration-300 border-2 ${isFav ? 'bg-brand-alert border-brand-alert text-white' : 'bg-transparent border-gray-100 dark:border-gray-700 text-gray-400 hover:text-brand-neon hover:border-brand-neon'}`}
                >
                    <HeartIcon className="w-5 h-5" solid={isFav} />
                </button>

                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.4em] font-mono">{product.brand}</span>
                        <div className={`h-1 w-10 ${isOutOfStock ? 'bg-brand-alert' : 'bg-brand-neon'}`}></div>
                    </div>
                    
                    <h3 className="text-2xl lg:text-3xl font-serif font-black italic text-gray-900 dark:text-white mb-6 uppercase tracking-tighter leading-tight group-hover:text-brand-neon transition-colors">
                        {product.name}
                    </h3>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-mono leading-relaxed line-clamp-2 mb-8 max-w-3xl">
                        {product.description}
                    </p>

                    {/* Specs Tags */}
                    {product.specifications && (
                        <div className="flex flex-wrap gap-3 mt-6">
                            {product.specifications.slice(0, 4).map((spec, i) => (
                                <div key={i} className="bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-gray-700 px-3 py-1.5 slant">
                                    <p className="slant-reverse text-[8px] font-black text-gray-400 uppercase tracking-tighter">{spec.name}</p>
                                    <p className="slant-reverse text-[10px] font-bold text-gray-900 dark:text-white uppercase">{spec.value}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer: Price & Actions */}
                <div className="mt-10 pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
                    <div className="flex items-baseline gap-4">
                        <span className="text-4xl font-black text-gray-900 dark:text-white font-mono tracking-tighter leading-none">
                            {product.price.toFixed(3)} <span className="text-sm text-brand-neon font-bold">DT</span>
                        </span>
                        {product.oldPrice && (
                            <span className="text-sm text-gray-400 line-through font-mono">
                                {product.oldPrice.toFixed(3)}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onPreview(product); }}
                            className="w-14 h-14 bg-white dark:bg-brand-gray border-2 border-gray-100 dark:border-gray-700 text-gray-400 hover:text-brand-neon hover:border-brand-neon transition-all flex items-center justify-center slant shadow-sm"
                            title="Aperçu rapide"
                        >
                            <EyeIcon className="w-6 h-6 slant-reverse" />
                        </button>
                        
                        <button 
                            onClick={handleAddToCart}
                            disabled={isOutOfStock}
                            className="flex-1 sm:flex-none h-14 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.2em] text-[10px] px-10 hover:bg-brand-neon hover:text-black transition-all slant disabled:opacity-30 disabled:cursor-not-allowed shadow-xl group/btn"
                        >
                            <span className="slant-reverse block flex items-center gap-3">
                                {isOutOfStock ? 'SIGNAL PERDU' : 'DÉPLOYER'}
                                {!isOutOfStock && <CartIcon className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
