import React from 'react';
import type { Product } from '../types';
import { CartIcon, EyeIcon, HeartIcon, ScaleIcon } from './IconComponents';
import { useCart } from './CartContext';
import { useFavorites } from './FavoritesContext';
import { useCompare } from './CompareContext';
import { useToast } from './ToastContext';

interface ProductCardProps {
    product: Product;
    onPreview: (product: Product) => void;
    onNavigateToProductDetail: (productId: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPreview, onNavigateToProductDetail }) => {
    const { addToCart, openCart } = useCart();
    const { toggleFavorite, isFavorite } = useFavorites();
    const { addToCompare, isComparing, removeFromCompare } = useCompare();
    const { addToast } = useToast();
    
    const isOutOfStock = product.quantity === 0;
    const isFav = isFavorite(product.id);
    const comparing = isComparing(product.id);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (isOutOfStock) return;
        addToCart(product);
        addToast("UNITÉ DÉPLOYÉE AU SET", "success");
        openCart();
    };

    const handleCompare = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (comparing) {
            removeFromCompare(product.id);
        } else {
            addToCompare(product);
        }
    };
    
    const handleProductClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onNavigateToProductDetail(product.id);
    };

    const discountPercentage = product.discount || (product.oldPrice && product.price ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0);

    return (
        <div 
            className="group relative bg-white dark:bg-[#0f0f0f] border-2 border-gray-100 dark:border-gray-800 hover:border-brand-neon transition-all duration-500 flex flex-col h-full overflow-hidden shadow-sm hover:shadow-[0_0_30px_rgba(204,255,0,0.15)] cursor-pointer"
            onClick={handleProductClick}
        >
            <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none"></div>

            <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 dark:bg-black/40">
                <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    loading="lazy"
                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isOutOfStock ? 'opacity-30 grayscale' : ''}`}
                />

                <div className="absolute inset-0 bg-gradient-to-b from-brand-neon/20 to-transparent h-1 w-full -top-1 group-hover:animate-marquee opacity-0 group-hover:opacity-100 pointer-events-none z-10"></div>

                <div className="absolute top-4 left-0 flex flex-col gap-1.5 z-10">
                    {discountPercentage > 0 && (
                        <div className="bg-brand-neon text-black text-[10px] font-black px-3 py-1 slant shadow-lg">
                            <span className="slant-reverse block">-{discountPercentage}% IMPACT</span>
                        </div>
                    )}
                </div>

                {/* Quick Actions Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20 backdrop-blur-[2px]">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onPreview(product); }}
                        className="w-10 h-10 bg-white text-black flex items-center justify-center hover:bg-brand-neon transition-all transform -translate-y-2 group-hover:translate-y-0 duration-300"
                        title="Aperçu"
                    >
                        <EyeIcon className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={handleCompare}
                        className={`w-10 h-10 flex items-center justify-center transition-all transform translate-y-2 group-hover:translate-y-0 duration-300 ${comparing ? 'bg-brand-neon text-black' : 'bg-black text-white border border-white/20 hover:text-brand-neon'}`}
                        title="Comparer"
                    >
                        <ScaleIcon className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
                        className={`w-10 h-10 bg-black text-white border border-white/20 flex items-center justify-center hover:text-brand-neon transition-all transform translate-y-2 group-hover:translate-y-0 duration-300 ${isFav ? 'text-brand-neon border-brand-neon' : ''}`}
                        title="Favoris"
                    >
                        <HeartIcon className="w-4 h-4" solid={isFav} />
                    </button>
                </div>

                {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
                        <span className="border-2 border-brand-alert text-brand-alert px-6 py-2 font-black uppercase tracking-tighter slant">
                            <span className="slant-reverse block italic text-sm">Signal Perdu</span>
                        </span>
                    </div>
                )}
            </div>

            <div className="p-5 flex flex-col flex-grow relative z-10">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] font-mono">{product.brand}</span>
                </div>

                <h3 className="font-serif font-black text-lg leading-tight mb-4 text-gray-900 dark:text-white group-hover:text-brand-neon transition-colors line-clamp-2 uppercase italic tracking-tighter">
                    {product.name}
                </h3>

                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-xl font-black text-gray-900 dark:text-white font-mono tracking-tighter">
                            {product.price.toFixed(3)} <span className="text-[9px] font-bold text-brand-neon">TND</span>
                        </span>
                    </div>

                    <button 
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        className="w-full bg-black dark:bg-white text-white dark:text-black font-black uppercase text-[9px] tracking-[0.2em] py-3.5 flex items-center justify-center gap-2 hover:bg-brand-neon hover:text-black dark:hover:bg-brand-neon dark:hover:text-black transition-all slant shadow-xl"
                    >
                        <span className="slant-reverse block flex items-center gap-2">
                            {isOutOfStock ? 'INDISPONIBLE' : 'DÉPLOYER'}
                            {!isOutOfStock && <CartIcon className="w-3 h-3" />}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};
