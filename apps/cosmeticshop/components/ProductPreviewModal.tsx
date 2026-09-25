
import React, { useState, useEffect } from 'react';
import type { Product } from '../types';
import { XMarkIcon, ShoppingBagIcon, PlusIcon, MinusIcon, HeartIcon } from './IconComponents';
import { useCart } from './CartContext';
import { useFavorites } from './FavoritesContext';

interface ProductPreviewModalProps {
    product: Product | null;
    onClose: () => void;
}

export const ProductPreviewModal: React.FC<ProductPreviewModalProps> = ({ product, onClose }) => {
    const { addToCart, openCart } = useCart();
    const { toggleFavorite, isFavorite } = useFavorites();
    const [quantity, setQuantity] = useState(1);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (product) {
            setIsVisible(true);
            setQuantity(1); // Reset quantity when a new product is opened
        } else {
            setIsVisible(false);
        }
    }, [product]);
    
    // Add keyboard support for closing the modal
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    if (!product) {
        return null;
    }
    
    const isFav = isFavorite(product.id);
    const displayImage = (product.images && product.images.length > 0) ? product.images[0] : product.imageUrl;

    const handleIncrement = () => setQuantity(q => q + 1);
    const handleDecrement = () => setQuantity(q => (q > 1 ? q - 1 : 1));

    const handleAddToCart = () => {
        if (product) {
            addToCart(product, quantity);
            onClose(); // Close modal
            openCart(); // Open cart sidebar
        }
    };

    return (
        <div 
            className={`fixed inset-0 z-[60] flex items-center justify-center p-4 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
        >
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

            {/* Modal content */}
            <div className={`relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col md:flex-row max-h-[90vh] overflow-hidden transition-transform duration-300 ${isVisible ? 'scale-100' : 'scale-95'}`}>
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors z-20 p-2 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-md"
                    aria-label="Fermer"
                >
                    <XMarkIcon className="w-5 h-5" />
                </button>

                {/* Left: Image */}
                <div className="w-full md:w-1/2 bg-gray-50 dark:bg-gray-800 flex items-center justify-center p-8">
                    <img 
                        src={displayImage} 
                        alt={product.name} 
                        className="w-full h-full object-contain max-h-[400px] mix-blend-multiply dark:mix-blend-normal" 
                    />
                </div>

                {/* Right: Product Details */}
                <div className="w-full md:w-1/2 p-8 lg:p-10 flex flex-col overflow-y-auto">
                    <div>
                        <p className="text-xs font-bold text-rose-500 dark:text-rose-400 uppercase tracking-widest mb-2">{product.brand}</p>
                        <h2 className="text-2xl lg:text-3xl font-serif font-bold text-gray-900 dark:text-white mb-4 leading-tight">{product.name}</h2>
                        
                        <div className="flex items-baseline gap-3 mb-6">
                            <p className="text-3xl font-light text-gray-900 dark:text-white">{product.price.toFixed(3)} DT</p>
                            {product.oldPrice && (
                                <p className="text-lg text-gray-400 line-through font-light">{product.oldPrice.toFixed(3)} DT</p>
                            )}
                        </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-light mb-8 flex-grow">
                        {product.description || "Aucune description disponible pour ce produit."}
                    </p>

                    <div className="space-y-6 mt-auto">
                        {/* Quantity Selector */}
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-bold uppercase tracking-wide text-gray-500">Quantité</span>
                            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-full h-10 px-1">
                                <button onClick={handleDecrement} className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"><MinusIcon className="w-3 h-3" /></button>
                                <span className="w-8 text-center font-bold text-sm">{quantity}</span>
                                <button onClick={handleIncrement} className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"><PlusIcon className="w-3 h-3" /></button>
                            </div>
                        </div>
                        
                        <div className="flex gap-4">
                            <button 
                                onClick={handleAddToCart}
                                disabled={product.quantity === 0}
                                className="flex-1 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-xs py-4 rounded-full hover:bg-rose-600 dark:hover:bg-rose-500 dark:hover:text-white transition-all shadow-lg flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                <ShoppingBagIcon className="w-4 h-4" />
                                <span>{product.quantity === 0 ? 'Épuisé' : 'Ajouter au sac'}</span>
                            </button>
                            <button onClick={() => toggleFavorite(product.id)} className={`p-4 rounded-full border transition-all ${isFav ? 'border-rose-200 bg-rose-50 text-rose-500' : 'border-gray-200 text-gray-400 hover:border-gray-400'}`}>
                                <HeartIcon className="w-5 h-5" solid={isFav} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
