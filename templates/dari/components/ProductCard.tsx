import React from 'react';
import { ShoppingBag, Heart, Star, Sparkles, Eye, Check } from 'lucide-react';
import { Product } from '../types';
import { useCart } from './CartContext';
import { useFavorites } from './FavoritesContext';

interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
  onSelectProduct?: (product: Product) => void;
  onNavigateToProductDetail?: (productId: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onSelect, 
  onSelectProduct,
  onNavigateToProductDetail
}) => {
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const fav = isFavorite(product.id);

  const handleSelect = () => {
    if (typeof onSelect === 'function') {
      onSelect(product);
    } else if (typeof onSelectProduct === 'function') {
      onSelectProduct(product);
    } else if (typeof onNavigateToProductDetail === 'function') {
      onNavigateToProductDetail(product.id);
    }
  };

  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-xl hover:border-indigo-400/60 dark:hover:border-indigo-500/60 transition-all duration-300 flex flex-col overflow-hidden">
      
      {/* Visual Image Slot */}
      <div 
        onClick={handleSelect}
        className="relative h-56 sm:h-64 w-full bg-[#f8fafc] dark:bg-slate-800/40 p-4 flex items-center justify-center overflow-hidden cursor-pointer"
      >
        <img
          src={product.imageUrl || product.images?.[0]}
          alt={product.name}
          className="max-h-full max-w-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500 shadow-xs"
        />

        {/* Favorite Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(product);
          }}
          className={`absolute top-3 right-3 p-2.5 rounded-xl backdrop-blur-md shadow-xs transition-all cursor-pointer ${
            fav
              ? 'bg-rose-50 text-rose-500 dark:bg-rose-950/80'
              : 'bg-white/80 dark:bg-slate-800/80 text-slate-400 hover:text-rose-500'
          }`}
          title={fav ? 'Retirer des favoris' : 'Ajouter aux coups de cœur'}
        >
          <Heart className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
        </button>

        {/* Room or Promo Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 pointer-events-none">
          {product.pieceMaison && (
            <span className="px-2.5 py-0.5 rounded-lg bg-[#0f3e37] text-white font-black text-[9px] uppercase tracking-wider shadow-xs">
              {product.pieceMaison}
            </span>
          )}
          {product.discount ? (
            <span className="px-2.5 py-0.5 rounded-lg bg-[#b87333] text-white font-black text-[9px] tracking-wider">
              -{product.discount}%
            </span>
          ) : null}
        </div>

        {/* Quick View Button on Hover */}
        <div className="absolute inset-x-0 bottom-3 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <span className="px-4 py-1.5 rounded-full bg-[#0f3e37]/90 backdrop-blur-md text-white text-xs font-bold shadow-lg flex items-center gap-1.5 pointer-events-auto hover:bg-[#0f3e37] transition-colors">
            <Eye className="w-3.5 h-3.5 text-[#b87333]" />
            <span>Aperçu rapide</span>
          </span>
        </div>

      </div>

      {/* Info Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        
        <div>
          {/* Brand & Decor Style */}
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            <span>{product.brand}</span>
            <span className="text-[#b87333] font-semibold">{product.styleDeco || product.category}</span>
          </div>

          {/* Product Title */}
          <h3 
            onClick={handleSelect}
            className="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-2 hover:text-[#0f3e37] transition-colors cursor-pointer leading-snug"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Key Material */}
          {product.materiauPrincipal && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-1">
              ✨ {product.materiauPrincipal}
            </p>
          )}
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {product.price.toLocaleString('fr-FR')} <span className="text-xs font-bold text-[#b87333]">DT</span>
              </span>
              {product.oldPrice && (
                <span className="text-xs text-slate-400 line-through">
                  {product.oldPrice} DT
                </span>
              )}
            </div>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block">
              En stock • Livraison soignée
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product, 1);
            }}
            className="p-2.5 sm:px-3 sm:py-2 rounded-xl bg-[#0f3e37] hover:bg-[#0b2f29] text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shrink-0"
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
