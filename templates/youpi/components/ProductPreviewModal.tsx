import React, { useState } from 'react';
import { X, Star, ShoppingBag, Heart, ShieldCheck, Sparkles, Check, Truck, Gift } from 'lucide-react';
import { Product } from '../types';
import { useCart } from './CartContext';
import { useFavorites } from './FavoritesContext';

interface ProductPreviewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductPreviewModal: React.FC<ProductPreviewModalProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;
  const fav = isFavorite(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-3xl w-full p-6 sm:p-8 text-slate-900 dark:text-white max-h-[92vh] overflow-y-auto relative border border-slate-200 dark:border-slate-800">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          {/* Product Image */}
          <div className="relative bg-slate-50 dark:bg-slate-800/60 rounded-3xl p-6 flex items-center justify-center h-72 sm:h-84">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="max-h-full max-w-full object-contain"
            />
            {product.trancheAge && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-xl bg-amber-500 text-white font-black text-xs uppercase tracking-wider">
                {product.trancheAge}
              </span>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4">
            
            <div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                {product.brand} • {product.category}
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-serif mt-1">
                {product.name}
              </h2>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-xs text-slate-400 font-semibold">
                (4.9 / 5 • 82 avis vérifiés)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">
                {product.price} DT
              </span>
              {product.oldPrice && (
                <span className="text-sm text-slate-400 line-through tabular-nums">
                  {product.oldPrice} DT
                </span>
              )}
              {product.discount && (
                <span className="text-xs font-black text-rose-500 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-lg">
                  Économisez {product.discount}%
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {product.description}
            </p>

            {/* Specifications list */}
            {product.specifications && (
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                {product.specifications.map((spec, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-slate-500">{spec.name} :</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Guarantees */}
            <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-amber-500" />
                <span>Livraison 24/48h</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-amber-500" />
                <span>Emballage cadeau offert</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Norme EN-71</span>
              </div>
            </div>

            {/* Quantity Stepper & Add to cart */}
            <div className="flex items-center gap-3 pt-3">
              <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold cursor-pointer"
                >
                  -
                </button>
                <span className="px-3 py-2 text-xs font-black tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold cursor-pointer"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Ajouter au panier • {(product.price * quantity).toFixed(0)} DT</span>
              </button>

              <button
                type="button"
                onClick={() => toggleFavorite(product)}
                className={`p-3 rounded-2xl border transition-colors cursor-pointer ${
                  fav
                    ? 'bg-rose-50 border-rose-200 text-rose-500'
                    : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
