
import React from 'react';
import type { Product } from '../types';
import { EyeIcon, PlusIcon, HeartIcon, SparklesIcon } from './IconComponents';
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

    return (
        <div 
            className="group relative flex flex-col md:flex-row items-stretch bg-white dark:bg-gray-800 rounded-[2.5rem] border border-slate-100 dark:border-white/5 hover:border-brand-primary/20 transition-all duration-700 cursor-pointer overflow-hidden shadow-sm hover:shadow-2xl"
            onClick={() => onNavigateToProductDetail(product.id)}
        >
            {/* Image Section */}
            <div className="w-full md:w-80 h-72 md:h-auto flex-shrink-0 relative overflow-hidden bg-slate-50 dark:bg-gray-900/50 p-12">
                <img
                    src={product.imageUrl}
                    alt={product.name}
                    className={`w-full h-full object-contain transition-transform duration-1000 group-hover:scale-110 ${isOutOfStock ? 'opacity-30 grayscale' : ''}`}
                />
                
                {/* Status Badges */}
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                    {product.discount && (
                        <span className="bg-brand-accent text-white text-[9px] font-black px-3 py-1.5 rounded-full shadow-lg uppercase tracking-wider">
                            -{product.discount}%
                        </span>
                    )}
                </div>
            </div>

            {/* Content Section */}
            <div className="flex-grow p-10 flex flex-col justify-between">
                
                <button 
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
                    className={`absolute top-8 right-8 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border ${isFav ? 'bg-rose-50 border-rose-100 text-rose-500' : 'bg-white/50 border-slate-100 text-slate-300 hover:text-rose-500'}`}
                >
                    <HeartIcon className="w-6 h-6" solid={isFav} />
                </button>

                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-[9px] font-black text-brand-primary uppercase tracking-[0.3em]">{product.brand}</span>
                        <div className="h-px flex-grow bg-slate-50 dark:bg-white/5"></div>
                    </div>
                    
                    <h3 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-6 leading-tight group-hover:text-brand-primary transition-colors">
                        {product.name}
                    </h3>
                    
                    <p className="text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-2 mb-8 max-w-2xl italic">
                        {product.description}
                    </p>

                    <div className="flex flex-wrap gap-3">
                        <div className="bg-brand-light dark:bg-white/5 px-4 py-1.5 rounded-full border border-brand-primary/10 flex items-center gap-2">
                            <SparklesIcon className="w-3 h-3 text-brand-primary" />
                            <span className="text-[9px] font-black text-brand-primary uppercase tracking-widest">Actif Certifié</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 pt-8 border-t border-slate-50 dark:border-white/5 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8">
                    <div>
                        <span className="block text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Prix de la cure</span>
                        <div className="flex items-baseline gap-4">
                            <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                                {product.price.toFixed(3)} <span className="text-sm font-bold text-brand-primary">DT</span>
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onPreview(product); }}
                            className="w-14 h-14 bg-slate-50 dark:bg-white/5 rounded-2xl text-slate-400 hover:text-brand-primary transition-all flex items-center justify-center shadow-sm"
                            title="Aperçu rapide"
                        >
                            <EyeIcon className="w-6 h-6" />
                        </button>
                        
                        <button 
                            onClick={handleAddToCart}
                            disabled={isOutOfStock}
                            className="flex-1 sm:flex-none h-14 bg-brand-primary text-white font-black uppercase tracking-widest text-xs px-10 rounded-2xl hover:bg-brand-primaryHover transition-all shadow-xl shadow-brand-primary/20 disabled:bg-slate-200"
                        >
                            <span className="flex items-center justify-center gap-3">
                                {isOutOfStock ? 'RUPTURE DE STOCK' : 'AJOUTER AU RITUEL'}
                                {!isOutOfStock && <PlusIcon className="w-5 h-5" />}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
