
import React from 'react';
import type { Product } from '../types';
import { PlusIcon, SparklesIcon, HeartIcon } from './IconComponents';
import { useCart } from './CartContext';
import { useFavorites } from './FavoritesContext';
import { useToast } from './ToastContext';

interface ProductCardProps {
    product: Product;
    onPreview: (product: Product) => void;
    onNavigateToProductDetail: (productId: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onNavigateToProductDetail }) => {
    const { addToCart, openCart } = useCart();
    const { toggleFavorite, isFavorite } = useFavorites();
    const { addToast } = useToast();
    
    const isOutOfStock = product.quantity === 0;
    const isFav = isFavorite(product.id);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isOutOfStock) return;
        addToCart(product);
        addToast("Produit ajouté au panier", "success");
        openCart();
    };

    return (
        <div 
            className="group relative bg-white dark:bg-gray-800 rounded-[2.5rem] border border-slate-100 dark:border-white/5 hover:border-brand-primary/30 transition-all duration-500 flex flex-col h-full overflow-hidden shadow-sm hover:shadow-xl cursor-pointer"
            onClick={() => onNavigateToProductDetail(product.id)}
        >
            {/* CADRE IMAGE FIXE - object-cover garantit l'uniformité */}
            <div className="relative aspect-square w-full overflow-hidden bg-slate-50 dark:bg-gray-900/50 p-6">
                <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className={`w-full h-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-105 ${isOutOfStock ? 'opacity-40 grayscale' : ''}`}
                />

                <div className="absolute top-4 left-4">
                    {product.promo && (
                        <div className="bg-brand-primary text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg uppercase tracking-widest flex items-center gap-1">
                            <SparklesIcon className="w-2.5 h-2.5" /> PROMO
                        </div>
                    )}
                </div>

                <button 
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
                    className={`absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-md flex items-center justify-center transition-all ${isFav ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
                >
                    <HeartIcon className="w-5 h-5" solid={isFav} />
                </button>
            </div>

            <div className="p-6 flex flex-col flex-grow">
                <p className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em] mb-1">{product.brand}</p>
                <h3 className="font-serif font-bold text-slate-900 dark:text-white text-lg leading-snug line-clamp-2 h-12 mb-4 group-hover:text-brand-primary transition-colors">
                    {product.name}
                </h3>

                <div className="flex flex-wrap gap-1.5 mb-6">
                    <span className="text-[8px] font-bold uppercase px-2 py-1 bg-slate-50 dark:bg-white/5 text-slate-400 rounded border border-slate-100">Actif Certifié</span>
                    <span className="text-[8px] font-bold uppercase px-2 py-1 bg-slate-50 dark:bg-white/5 text-slate-400 rounded border border-slate-100">Expertise Pharma</span>
                </div>

                <div className="mt-auto flex items-center justify-between pt-5 border-t border-slate-50">
                    <div className="flex flex-col">
                         <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                            {product.price.toFixed(3)} <span className="text-xs font-bold text-slate-400">DT</span>
                        </span>
                    </div>
                    <button 
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        className="h-12 px-6 bg-brand-primary text-white rounded-2xl flex items-center justify-center gap-2 hover:bg-brand-primaryHover transition-all shadow-xl shadow-brand-primary/10 disabled:bg-slate-100"
                    >
                        <PlusIcon className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Acheter</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
