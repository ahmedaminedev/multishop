import React from 'react';
import { ShoppingBag, Heart, Star, Sparkles, Eye } from 'lucide-react';
import { Product } from '../types';
import { useCart } from './CartContext';
import { useFavorites } from './FavoritesContext';

interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
  onSelectProduct?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect, onSelectProduct }) => {
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const fav = isFavorite(product.id);

  const handleSelect = () => {
    if (typeof onSelect === 'function') {
      onSelect(product);
    } else if (typeof onSelectProduct === 'function') {
      onSelectProduct(product);
    }
  };

  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl hover:border-amber-400/60 dark:hover:border-amber-500/60 transition-all duration-300 flex flex-col overflow-hidden">
      
      {/* Visual Image Slot (65-75% height) */}
      <div 
        onClick={handleSelect}
        className="relative h-56 sm:h-64 w-full bg-[#f8fafc] dark:bg-slate-800/50 p-4 flex items-center justify-center overflow-hidden cursor-pointer"
      >
        <img
          src={product.imageUrl || product.images?.[0]}
          alt={product.name}
          className="max-h-full max-w-full object-contain group-hover:scale-108 transition-transform duration-500"
        />

        {/* Favorite Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(product);
          }}
          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md shadow-xs transition-all cursor-pointer ${
            fav
              ? 'bg-rose-50 text-rose-500 dark:bg-rose-950/80'
              : 'bg-white/80 dark:bg-slate-800/80 text-slate-400 hover:text-rose-500'
          }`}
          title={fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Heart className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
        </button>

        {/* Age or Promo Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 pointer-events-none">
          {product.trancheAge && (
            <span className="px-2.5 py-0.5 rounded-lg bg-amber-500 text-white font-black text-[10px] uppercase tracking-wider shadow-xs">
              {product.trancheAge}
            </span>
          )}
          {product.discount ? (
            <span className="px-2 py-0.5 rounded-lg bg-rose-500 text-white font-black text-[10px] tracking-wider">
              -{product.discount}%
            </span>
          ) : null}
        </div>

        {/* Quick View Button on Hover */}
        <div className="absolute inset-x-0 bottom-3 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <span className="px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold shadow-lg flex items-center gap-1.5 pointer-events-auto hover:bg-slate-900 transition-colors">
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>Aperçu rapide</span>
          </span>
        </div>

      </div>

      {/* Info Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            <span>{product.brand}</span>
            <span>{product.category}</span>
          </div>

          {/* Product Title */}
          <h3 
            onClick={handleSelect}
            className="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-2 hover:text-amber-500 transition-colors cursor-pointer leading-snug"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-500">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <span className="text-[11px] text-slate-400 font-semibold">
              ({product.reviewsCount || 24})
            </span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-slate-900 dark:text-white tabular-nums">
                {product.price}
              </span>
              <span className="text-xs font-bold text-slate-500">DT</span>
              {product.oldPrice && (
                <span className="text-xs text-slate-400 line-through tabular-nums">
                  {product.oldPrice} DT
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              En stock ({product.quantity} disp.)
            </span>
          </div>

          <button
            type="button"
            onClick={() => addToCart(product, 1)}
            className="p-2.5 sm:px-3.5 sm:py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            title="Ajouter au panier"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Ajouter</span>
          </button>
        </div>

      </div>

    </div>
  );
};
