import React, { useState, useEffect } from 'react';
import { X, Star, ShoppingBag, Heart, ShieldCheck, Sparkles, Check, Truck, Gift, ExternalLink, ArrowRight } from 'lucide-react';
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

  // Keyboard shortcut (Escape) and prevent background scrolling
  useEffect(() => {
    if (!product || !isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [product, isOpen, onClose]);

  // Reset quantity when opened for a new product
  useEffect(() => {
    if (product) {
      setQuantity(1);
    }
  }, [product?.id]);

  if (!product || !isOpen) return null;
  const fav = isFavorite(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    addToast(`${quantity} x "${product.name}" ajouté(s) au panier ! 🧸`, 'success');
    setIsCartOpen(true);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[250] overflow-y-auto bg-slate-950/75 backdrop-blur-sm p-4 sm:p-6 md:p-8 flex min-h-screen items-center justify-center animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Détails du produit ${product.name}`}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl my-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-h-[calc(100vh-3rem)] sm:max-h-[86vh] overflow-y-auto border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-6 sm:p-8 animate-scaleUp"
      >
        
        {/* Close Button - prominent, always accessible, high z-index */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-sm active:scale-95 ring-1 ring-slate-200 dark:ring-slate-700"
          title="Fermer la fenêtre (Échap)"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-2 sm:pt-0">
          
          {/* Product Image */}
          <div className="relative bg-slate-50 dark:bg-slate-800/60 rounded-3xl p-6 flex items-center justify-center h-64 sm:h-80 border border-slate-100 dark:border-slate-800/80">
            <img
              src={product.imageUrl || product.images?.[0]}
              alt={product.name}
              className="max-h-full max-w-full object-contain drop-shadow-sm transition-transform duration-300 hover:scale-105"
            />
            {product.trancheAge && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-xl bg-amber-500 text-white font-black text-xs uppercase tracking-wider shadow-sm">
                {product.trancheAge}
              </span>
            )}
            {product.discount ? (
              <span className="absolute bottom-4 left-4 px-2.5 py-1 rounded-xl bg-rose-500 text-white font-black text-xs shadow-sm">
                -{product.discount}%
              </span>
            ) : null}
          </div>

          {/* Details */}
          <div className="space-y-4">
            
            <div className="pr-8">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                {product.brand} • {product.category}
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-serif mt-1 text-slate-900 dark:text-white leading-tight">
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
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                (4.9 / 5 • {product.reviewsCount || 82} avis vérifiés)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2.5">
              <span className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">
                {product.price} DT
              </span>
              {product.oldPrice && (
                <span className="text-sm text-slate-400 line-through tabular-nums font-semibold">
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
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-4">
              {product.description}
            </p>

            {/* Specifications list */}
            {product.specifications && product.specifications.length > 0 && (
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                {product.specifications.slice(0, 3).map((spec, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-slate-500">{spec.name} :</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Guarantees */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Livraison 24/48h</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Emballage cadeau</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Norme EN-71</span>
              </div>
            </div>

            {/* Quantity Stepper & Add to cart */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 overflow-hidden shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold cursor-pointer transition-colors"
                >
                  -
                </button>
                <span className="px-3 py-2 text-xs font-black tabular-nums min-w-[24px] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold cursor-pointer transition-colors"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Ajouter • {(product.price * quantity).toFixed(0)} DT</span>
              </button>

              <button
                type="button"
                onClick={() => toggleFavorite(product)}
                className={`p-3 rounded-2xl border transition-colors cursor-pointer shrink-0 ${
                  fav
                    ? 'bg-rose-50 border-rose-200 text-rose-500'
                    : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500'
                }`}
                title={fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              >
                <Heart className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Optional Full Detail Link */}
            {onViewFullDetail && (
              <button
                type="button"
                onClick={() => {
                  onViewFullDetail(product);
                  onClose();
                }}
                className="w-full text-center text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors pt-2 flex items-center justify-center gap-1.5 cursor-pointer group"
              >
                <span>Voir la fiche produit complète avec tous les avis & photos</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

