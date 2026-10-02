import React from 'react';
import type { Product } from '../types';
import { ShoppingCart, Star } from 'lucide-react';
import { useCart } from './CartContext';
import { useToast } from './ToastContext';

interface ProductCardProps {
    product: Product;
    onPreview?: (product: Product) => void;
    onNavigateToProductDetail: (productId: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onNavigateToProductDetail }) => {
    const { addToCart, openCart } = useCart();
    const { addToast } = useToast();
    
    const isOutOfStock = product.quantity === 0;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (isOutOfStock) return;
        addToCart(product);
        addToast("Produit ajouté au panier !", "success");
        openCart();
    };

    const handleProductClick = (e: React.MouseEvent) => {
        e.preventDefault();
        onNavigateToProductDetail(product.id);
    };

    const discountPercentage = product.discount || (product.oldPrice && product.price ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0);

    // Reviews count fallback or calculated
    const reviewCount = product.reviewsCount || (80 + ((product.id * 17) % 50));

    return (
        <div 
            onClick={handleProductClick}
            className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between p-3.5 sm:p-4 cursor-pointer"
        >
            <div>
                {/* Top Badge: Lime Green Pill Discount */}
                <div className="flex items-center justify-between mb-2">
                    {discountPercentage > 0 ? (
                        <span className="bg-[#84cc16] text-black font-extrabold text-[11px] px-2 py-0.5 rounded-full">
                            -{discountPercentage}%
                        </span>
                    ) : (
                        <span />
                    )}
                </div>

                {/* Product Image on Pure White Background */}
                <div className="relative aspect-square w-full flex items-center justify-center p-2 mb-3 overflow-hidden rounded-xl bg-slate-50/60 dark:bg-slate-800/40">
                    <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        loading="lazy"
                        className={`w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-300 ${isOutOfStock ? 'opacity-40 grayscale' : ''}`}
                    />
                </div>

                {/* Product Name */}
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1 leading-snug group-hover:text-[#84cc16] transition-colors">
                    {product.name}
                </h3>

                {/* Star Rating with Review Count */}
                <div className="flex items-center gap-1 mt-1 text-amber-400">
                    <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current text-amber-400" />
                        ))}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 ml-1">
                        ({reviewCount})
                    </span>
                </div>
            </div>

            {/* Bottom Row: Price and Add to Cart Button */}
            <div className="flex items-end justify-between mt-3 pt-2">
                <div className="flex flex-col leading-tight">
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                        {product.price?.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} DT
                    </span>
                    {product.oldPrice && product.oldPrice > product.price && (
                        <span className="text-[11px] text-slate-400 line-through">
                            {product.oldPrice.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} DT
                        </span>
                    )}
                </div>

                {/* Round Lime Green Shopping Cart Button */}
                <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className="w-8 h-8 rounded-full bg-[#84cc16] hover:bg-[#72b012] text-black flex items-center justify-center shadow-xs transition-transform active:scale-95 cursor-pointer shrink-0"
                    title="Ajouter au panier"
                >
                    <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
                </button>
            </div>
        </div>
    );
};
