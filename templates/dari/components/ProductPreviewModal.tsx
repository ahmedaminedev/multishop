import React, { useState, useEffect } from 'react';
import { X, Star, ShoppingBag, Heart, ShieldCheck, Sparkles, Check, Truck, CreditCard, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { useCart } from './CartContext';
import { useFavorites } from './FavoritesContext';
import { useToast } from './ToastContext';

interface ProductPreviewModalProps {
  product: Product | null;
  isOpen?: boolean;
  onClose: () => void;
  onViewFullDetail?: (product: Product) => void;
}

export const ProductPreviewModal: React.FC<ProductPreviewModalProps> = ({ 
  product, 
  isOpen = true,
  onClose,
  onViewFullDetail 
}) => {
  const { addToCart, setIsCartOpen } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { addToast } = useToast();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!product || !isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [product, isOpen, onClose]);

  useEffect(() => {
    if (product) setQuantity(1);
  }, [product?.id]);

  if (!product || !isOpen) return null;
  const fav = isFavorite(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    addToast(`${quantity} x "${product.name}" ajouté au panier ! 🏠`, 'success');
    setIsCartOpen(true);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[250] overflow-y-auto bg-slate-950/75 backdrop-blur-sm p-4 sm:p-6 md:p-8 flex min-h-screen items-center justify-center animate-fadeIn"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl my-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-6 sm:p-8 animate-scaleUp"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Image */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800/40 p-4 flex items-center justify-center h-72 sm:h-80">
            <img
              src={product.imageUrl || product.images?.[0]}
              alt={product.name}
              className="max-h-full max-w-full object-cover rounded-xl shadow-xs"
            />
            {product.discount && (
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-black text-xs">
                -{product.discount}%
              </span>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                <span>{product.brand}</span>
                <span>•</span>
                <span className="text-indigo-600 dark:text-indigo-400">{product.pieceMaison || product.category}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-serif leading-tight">
                {product.name}
              </h2>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {product.price.toLocaleString('fr-FR')} <span className="text-sm font-bold text-indigo-600">DT</span>
              </span>
              {product.oldPrice && (
                <span className="text-sm text-slate-400 line-through">
                  {product.oldPrice} DT
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
              {product.description}
            </p>

            {product.materiauPrincipal && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1">
                <span className="font-bold text-slate-500 block uppercase text-[10px]">Matière & Dimensions</span>
                <p className="font-medium text-slate-700 dark:text-slate-200">
                  ✨ {product.materiauPrincipal} {product.dimensions ? `(${product.dimensions})` : ''}
                </p>
              </div>
            )}

            {/* Quantity and Actions */}
            <div className="pt-2 flex items-center gap-3">
              <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer font-bold text-sm"
                >
                  -
                </button>
                <span className="px-3 py-2 text-xs font-bold text-slate-900 dark:text-white">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => q + 1)}
                  className="px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer font-bold text-sm"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Ajouter au panier</span>
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
