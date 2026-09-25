
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
    onNavigateToProductDetail: (productId: number | string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPreview, onNavigateToProductDetail }) => {
    const { addToCart } = useCart();
    const { toggleFavorite, isFavorite } = useFavorites();
    const { addToCompare, isComparing, removeFromCompare } = useCompare();
    const { addToast } = useToast();
    
    const isOutOfStock = product.quantity === 0;
    const isFav = isFavorite(product.id as number);
    const isComp = isComparing(product.id as number);

    // Use first image of gallery, fallback to imageUrl
    const displayImage = (product.images && product.images.length > 0) ? product.images[0] : product.imageUrl;

    const handleAddToCart = () => {
        if (isOutOfStock) return;
        addToCart(product);
        addToast("Produit ajouté au panier", "success");
    };
    
    const handleProductClick = (e: React.MouseEvent) => {
        e.preventDefault();
        onNavigateToProductDetail(product.id);
    };

    const handleToggleCompare = () => {
        if (isComp) {
            removeFromCompare(product.id as number);
            addToast("Retiré du comparateur", "info");
        } else {
            addToCompare(product);
        }
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg group overflow-hidden transition-all duration-300 flex flex-col h-full border border-gray-100 dark:border-gray-700">
            <div className="relative overflow-hidden">
                <a href="#" onClick={handleProductClick} className="block">
                    <img 
                        src={displayImage} 
                        alt={product.name} 
                        loading="lazy"
                        className={`w-full h-48 sm:h-56 object-cover transition-transform duration-500 ease-in-out group-hover:scale-110 ${isOutOfStock ? 'filter grayscale' : ''}`}
                    />
                </a>
                
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                        onClick={() => onPreview(product)} 
                        className="flex items-center gap-2 bg-white text-gray-800 font-semibold py-2 px-4 rounded-full transform scale-90 group-hover:scale-100 transition-transform duration-300 hover:bg-red-600 hover:text-white shadow-lg"
                    >
                        <EyeIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Aperçu</span>
                    </button>
                </div>

                {product.discount && (
                    <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-md z-10">
                        -{product.discount}%
                    </span>
                )}
                <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                    <button 
                        onClick={() => toggleFavorite(product.id as number)} 
                        className={`p-2 rounded-full transition-colors shadow-sm ${isFav ? 'bg-red-100 text-red-600' : 'bg-white/70 text-gray-600 hover:bg-white hover:text-red-500'}`} 
                        aria-label="Ajouter aux favoris"
                    >
                        <HeartIcon className="w-4 h-4 sm:w-5 sm:h-5" solid={isFav} />
                    </button>
                    <button 
                        onClick={handleToggleCompare} 
                        className={`p-2 rounded-full transition-colors shadow-sm ${isComp ? 'bg-blue-100 text-blue-600' : 'bg-white/70 text-gray-600 hover:bg-white hover:text-blue-500'}`} 
                        aria-label="Ajouter au comparateur"
                    >
                        <ScaleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                </div>

                 {isOutOfStock && (
                    <span className="absolute top-12 right-3 bg-gray-700 text-white text-xs font-bold px-3 py-1 rounded-md shadow-md z-10 transform -rotate-12">
                        ÉPUISÉ
                    </span>
                )}
            </div>

            <div className="p-3 sm:p-4 flex flex-col flex-grow">
                <p className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 tracking-wider">{product.brand.toUpperCase()}</p>
                <h3 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-200 flex-grow mb-2 sm:mb-3">
                    <a href="#" onClick={handleProductClick} className="line-clamp-2 hover:text-red-600 transition-colors duration-200">{product.name}</a>
                </h3>

                <div className="mt-auto pt-2">
                     {/* Stock Status */}
                    <div className="flex items-center mb-2 sm:mb-3">
                         {isOutOfStock ? (
                            <>
                                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                <span className="text-[10px] sm:text-xs font-semibold text-red-700 dark:text-red-400">Épuisé</span>
                            </>
                        ) : (
                            <>
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                <span className="text-[10px] sm:text-xs font-semibold text-green-700 dark:text-green-400">En stock</span>
                            </>
                        )}
                    </div>
                
                    <div className="mb-3 sm:mb-4">
                        <p className="text-xl sm:text-2xl font-bold text-red-600">{product.price.toFixed(3).replace('.',',')} DT</p>
                        {product.oldPrice && (
                            <p className="text-xs sm:text-sm text-gray-400 line-through -mt-1">{product.oldPrice.toFixed(3).replace('.',',')} DT</p>
                        )}
                    </div>

                    <button 
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        className="w-full font-semibold py-2 px-3 sm:px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:text-gray-500 bg-red-600 text-white hover:bg-red-700 focus:ring-red-300 text-sm sm:text-base"
                    >
                        <CartIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="truncate">{isOutOfStock ? 'Épuisé' : 'Ajouter'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
