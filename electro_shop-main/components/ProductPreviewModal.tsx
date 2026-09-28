
import React, { useState, useEffect } from 'react';
import type { Product } from '../types';
import { XMarkIcon, CartIcon, PlusIcon, MinusIcon, HeartIcon } from './IconComponents';
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
    // Use first image of gallery, fallback to imageUrl
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
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
        >
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

            {/* Modal content */}
            <div className={`relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col max-h-[90vh] transition-transform duration-300 ${isVisible ? 'scale-100' : 'scale-95'}`}>
                <button 
                    onClick={onClose} 
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors z-20 p-1 rounded-full bg-white/50 dark:bg-black/50"
                    aria-label="Fermer"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>

                <div className="grid md:grid-cols-2 gap-6 p-6 overflow-y-auto">
                    {/* Image Gallery */}
                    <div className="flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                        <img 
                            src={displayImage} 
                            alt={product.name} 
                            className="w-full max-w-sm max-h-96 object-contain" 
                        />
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-col space-y-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 tracking-wider">{product.brand.toUpperCase()}</p>
                            <h1 id="modal-title" className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">{product.name}</h1>
                        </div>
                        
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <span className="w-2.5 h-2.5 bg-green-500 rounded-full mr-2"></span>
                                <span className="text-sm font-semibold text-green-700 dark:text-green-400">En stock</span>
                            </div>
                             <button onClick={() => toggleFavorite(product.id)} className={`p-2 rounded-full transition-colors ${isFav ? 'bg-red-100 text-red-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-red-100 hover:text-red-500'}`}>
                                <HeartIcon className="w-6 h-6" solid={isFav} />
                                <span className="sr-only">Ajouter aux favoris</span>
                            </button>
                        </div>

                        <div className="flex items-baseline gap-3">
                            <p className="text-3xl font-bold text-red-600">{product.price.toFixed(3).replace('.',',')} DT</p>
                            {product.oldPrice && (
                                <p className="text-xl text-gray-400 line-through">{product.oldPrice.toFixed(3).replace('.',',')} DT</p>
                            )}
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            {product.description || "Aucune description disponible pour ce produit."}
                        </p>

                        <div className="pt-4 space-y-4">
                            {/* Quantity Selector */}
                            <div className="flex items-center gap-4">
                                <label htmlFor="quantity" className="font-semibold">Quantité:</label>
                                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                                    <button onClick={handleDecrement} className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-md" aria-label="Diminuer la quantité">
                                        <MinusIcon className="w-4 h-4" />
                                    </button>
                                    <input 
                                        type="text" 
                                        id="quantity"
                                        value={quantity}
                                        readOnly
                                        className="w-12 text-center border-x border-gray-300 dark:border-gray-600 bg-transparent"
                                    />
                                    <button onClick={handleIncrement} className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-md" aria-label="Augmenter la quantité">
                                        <PlusIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            
                            {/* Add to Cart Button */}
                            <button 
                                onClick={handleAddToCart}
                                className="w-full bg-red-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 text-lg"
                            >
                                <CartIcon className="w-6 h-6" />
                                <span>Ajouter au panier</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
