

import React from 'react';
import type { Product } from '../types';
import { EyeIcon, CartIcon } from './IconComponents';
import { useCart } from './CartContext';

interface ProductListItemProps {
    product: Product;
    onPreview: (product: Product) => void;
    onNavigateToProductDetail: (productId: number) => void;
}

export const ProductListItem: React.FC<ProductListItemProps> = ({ product, onPreview, onNavigateToProductDetail }) => {
    const { addToCart, openCart } = useCart();

    const handleAddToCart = () => {
        addToCart(product);
        openCart();
    };
    
    const handleProductClick = (e: React.MouseEvent) => {
        e.preventDefault();
        onNavigateToProductDetail(product.id);
    }

    // Calculate the percentage for the discount badge
    const discountPercentage = product.oldPrice && product.price 
        ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
        : product.discount;

    return (
        <div className="flex flex-col md:flex-row items-center p-4 gap-6">
            {/* Image Section */}
            <div className="relative flex-shrink-0 w-full md:w-56">
                <a href="#" onClick={handleProductClick}>
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-auto object-contain rounded-lg"
                    />
                </a>
                {discountPercentage && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-md shadow-md">
                        -{discountPercentage}%
                    </div>
                )}
            </div>

            {/* Middle Section: Product Details */}
            <div className="flex-grow text-center md:text-left">
                <a href="#" onClick={handleProductClick} className="text-lg text-gray-800 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-500 transition-colors font-semibold">
                    {product.name}
                </a>
                {/* Could add more details here if needed, e.g., description snippets */}
            </div>

            {/* Right Section: Price and Actions */}
            <div className="flex-shrink-0 w-full md:w-64 flex flex-col items-center md:items-end gap-3">
                <div className="flex items-baseline gap-2">
                    {product.oldPrice && (
                         <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                            {product.oldPrice.toFixed(0)} DT
                        </span>
                    )}
                    <span className="text-2xl font-bold text-red-600 dark:text-red-500">
                        {product.price.toFixed(0)} DT
                    </span>
                </div>
                <button 
                    onClick={handleAddToCart}
                    className="w-full md:w-auto bg-red-600 text-white font-semibold py-3 px-8 rounded-lg flex items-center justify-center space-x-2 hover:bg-red-700 transition-colors duration-200 shadow-sm"
                >
                    <CartIcon className="w-5 h-5" />
                    <span>Ajouter au panier</span>
                </button>
                <button onClick={() => onPreview(product)} className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-red-600 transition-colors">
                    <EyeIcon className="w-5 h-5" />
                    <span>Aperçu rapide</span>
                </button>
            </div>
        </div>
    );
};