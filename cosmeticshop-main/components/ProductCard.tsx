
import React, { useState } from 'react';
import type { Product } from '../types';
import { ShoppingBagIcon, EyeIcon, HeartIcon, StarIcon } from './IconComponents';
import { useCart } from './CartContext';
import { useFavorites } from './FavoritesContext';
import { useToast } from './ToastContext';

interface ProductCardProps {
    product: Product;
    onPreview: (product: Product) => void;
    onNavigateToProductDetail: (productId: number | string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPreview, onNavigateToProductDetail }) => {
    const { addToCart } = useCart();
    const { toggleFavorite, isFavorite } = useFavorites();
    const { addToast } = useToast();
    const [isHovered, setIsHovered] = useState(false);
    
    const isOutOfStock = product.quantity === 0;
    const isFav = isFavorite(product.id as number);

    // Gestion de l'image (si une 2ème image existe, on l'affiche au survol pour un effet premium)
    const firstImage = (product.images && product.images.length > 0) ? product.images[0] : product.imageUrl;
    const secondImage = (product.images && product.images.length > 1) ? product.images[1] : firstImage;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (isOutOfStock) return;
        addToCart(product);
        addToast("Ajouté au sac avec succès", "success");
    };
    
    const handlePreview = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onPreview(product);
    }

    const handleToggleFavorite = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        toggleFavorite(product.id as number);
    }
    
    const handleProductClick = (e: React.MouseEvent) => {
        e.preventDefault();
        onNavigateToProductDetail(product.id);
    };

    const discountPercentage = product.discount || (product.oldPrice && product.price ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0);
    const isNew = product.name.toLowerCase().includes('nouveau') || (!product.discount && !product.oldPrice && Math.random() > 0.8);

    return (
        <div 
            className="group relative w-full h-full flex flex-col bg-white dark:bg-gray-900 rounded-[1.5rem] transition-all duration-500 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border border-transparent hover:border-rose-100 dark:hover:border-gray-700 overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            
            {/* Zone Image - Aspect Ratio Portrait (Luxe standard) */}
            <div className="relative aspect-[3/4] overflow-hidden bg-[#F9F9F9] dark:bg-gray-800 rounded-t-[1.5rem]">
                <a href="#" onClick={handleProductClick} className="block w-full h-full relative">
                    {/* Image Principale */}
                    <img 
                        src={firstImage} 
                        alt={product.name} 
                        loading="lazy"
                        className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-in-out ${isHovered && firstImage !== secondImage ? 'opacity-0 scale-105' : 'opacity-100 scale-100 group-hover:scale-110'} ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
                    />
                    
                    {/* Seconde Image au survol (si existe) */}
                    {firstImage !== secondImage && (
                        <img 
                            src={secondImage} 
                            alt={`${product.name} view 2`} 
                            loading="lazy"
                            className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-in-out ${isHovered ? 'opacity-100 scale-110' : 'opacity-0 scale-100'}`}
                        />
                    )}
                </a>

                {/* Badges Élégants */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                    {discountPercentage > 0 && (
                        <span className="bg-rose-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                            -{discountPercentage}%
                        </span>
                    )}
                    {isNew && (
                        <span className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm border border-gray-100 dark:border-gray-700">
                            Nouveau
                        </span>
                    )}
                </div>

                {/* Bouton Favoris Flottant */}
                <button 
                    onClick={handleToggleFavorite}
                    className={`absolute top-4 right-4 p-2.5 rounded-full transition-all duration-300 z-20 shadow-sm ${isFav ? 'bg-rose-50 text-rose-500' : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md text-gray-400 hover:text-rose-500 hover:bg-white'}`}
                    title="Ajouter aux favoris"
                >
                    <HeartIcon className={`w-4 h-4 transition-transform ${isFav ? 'scale-110' : 'group-hover:scale-110'}`} solid={isFav} />
                </button>

                {/* Action Bar (Glassmorphism Slide-up) */}
                <div className={`absolute bottom-4 left-4 right-4 z-20 transition-all duration-500 ease-out transform ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <div className="flex gap-2">
                        <button 
                            onClick={handleAddToCart}
                            disabled={isOutOfStock}
                            className="flex-1 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md text-gray-900 dark:text-white font-bold text-[10px] uppercase tracking-widest py-3.5 rounded-full shadow-lg border border-white/20 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <ShoppingBagIcon className="w-4 h-4" />
                            {isOutOfStock ? 'Épuisé' : 'Ajouter'}
                        </button>
                        <button 
                            onClick={handlePreview}
                            className="w-10 h-10 flex items-center justify-center bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-full shadow-lg border border-white/20 text-gray-600 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                            title="Aperçu rapide"
                        >
                            <EyeIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Info Produit */}
            <div className="p-5 flex flex-col flex-grow text-center relative z-10">
                <a href="#" onClick={(e) => { e.preventDefault(); }} className="inline-block mx-auto mb-2">
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] hover:text-rose-500 transition-colors">
                        {product.brand}
                    </p>
                </a>
                
                <h3 className="text-base font-serif font-medium text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight group-hover:text-rose-600 transition-colors duration-300">
                    <a href="#" onClick={handleProductClick}>
                        {product.name}
                    </a>
                </h3>

                {/* Rating fictif + Color Indicator */}
                <div className="flex flex-col items-center gap-1.5 mb-3">
                    <div className="flex justify-center items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        {[1,2,3,4,5].map(i => (
                            <StarIcon key={i} className="w-3 h-3 text-gold-400 fill-current" />
                        ))}
                    </div>
                    {/* Indicateur de couleurs disponibles */}
                    {product.colors && product.colors.length > 0 && (
                        <div className="flex justify-center items-center gap-1 h-3">
                            {product.colors.slice(0, 3).map((c, i) => (
                                <div 
                                    key={i} 
                                    className="w-2.5 h-2.5 rounded-full border border-gray-200 shadow-sm"
                                    style={{ backgroundColor: c.hex }}
                                    title={c.name}
                                ></div>
                            ))}
                            {product.colors.length > 3 && (
                                <span className="text-[9px] text-gray-400">+{product.colors.length - 3}</span>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-auto flex items-center justify-center gap-3">
                    {product.oldPrice && (
                        <span className="text-sm text-gray-400 line-through font-light decoration-rose-300">
                            {product.oldPrice.toFixed(3)}
                        </span>
                    )}
                    <span className="text-lg font-serif font-bold text-gray-900 dark:text-white">
                        {product.price.toFixed(3)} <span className="text-xs font-sans font-light text-gray-500">TND</span>
                    </span>
                </div>
            </div>
        </div>
    );
};
