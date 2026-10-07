import React, { useState } from 'react';
import type { Product } from '../types';
import { useCart } from './CartContext';
import { useFavorites } from './FavoritesContext';
import { useToast } from './ToastContext';
import { Star, Heart, ShoppingBag, ShieldCheck, Truck, ArrowLeft, Share2, Check, Sparkles } from 'lucide-react';
import { ProductCard } from './ProductCard';

interface ProductDetailPageProps {
  product: Product;
  allProducts: Product[];
  onNavigateHome: () => void;
  onNavigateCatalog: (category?: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts = [],
  onNavigateHome,
  onNavigateCatalog,
  onSelectProduct
}) => {
  const { addToCart, setIsCartOpen } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { addToast } = useToast();

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'delivery'>('desc');
  const fav = isFavorite(product.id);

  const images = product.images && product.images.length > 0 ? product.images : [product.imageUrl];
  const [selectedImg, setSelectedImg] = useState(images[0]);

  const similarProducts = allProducts.filter(p => p.id !== product.id && p.category === product.category).slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    addToast(`${quantity} x "${product.name}" ajouté au panier ! 🏠`, 'success');
    setIsCartOpen(true);
  };

  return (
    <div className="py-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <button onClick={onNavigateHome} className="hover:text-slate-900 dark:hover:text-white cursor-pointer">Accueil</button>
          <span>/</span>
          <button onClick={() => onNavigateCatalog(product.category)} className="hover:text-slate-900 dark:hover:text-white cursor-pointer">{product.category}</button>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-200 truncate">{product.name}</span>
        </div>

        {/* Product Showcase Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm items-start">
          
          {/* Left: Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800/40 p-4 h-96 sm:h-[480px] flex items-center justify-center border border-slate-100 dark:border-slate-800">
              <img
                src={selectedImg}
                alt={product.name}
                className="max-h-full max-w-full object-cover rounded-xl shadow-md"
              />
            </div>

            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImg(img)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                      selectedImg === img ? 'border-indigo-600 scale-105' : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info & Purchase Box */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">
                <span>{product.brand}</span>
                <span>•</span>
                <span>{product.pieceMaison || product.category}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white font-serif leading-tight">
                {product.name}
              </h1>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {product.price.toLocaleString('fr-FR')} <span className="text-lg font-bold text-indigo-600">DT</span>
              </span>
              {product.oldPrice && (
                <span className="text-base text-slate-400 line-through">
                  {product.oldPrice} DT
                </span>
              )}
              {product.discount && (
                <span className="px-2.5 py-0.5 rounded-lg bg-amber-500 text-slate-950 font-black text-xs">
                  Économisez {product.discount}%
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {product.description}
            </p>

            {/* Key Specs Card */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-bold block">Matériau</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{product.materiauPrincipal || 'Bois massif & Tissus nobles'}</span>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-bold block">Style Déco</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{product.styleDeco || 'Contemporain Chic'}</span>
              </div>
              {product.dimensions && (
                <div className="col-span-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 uppercase text-[10px] font-bold block">Dimensions</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{product.dimensions}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-4 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-3 text-xs font-bold text-slate-900 dark:text-white">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(q => q + 1)}
                    className="px-4 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer font-bold"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Ajouter au panier</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleFavorite(product)}
                  className={`p-4 rounded-2xl border transition-colors cursor-pointer ${
                    fav ? 'bg-rose-50 border-rose-200 text-rose-500' : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500'
                  }`}
                  title={fav ? 'Retirer' : 'Favoris'}
                >
                  <Heart className={`w-5 h-5 ${fav ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Livraison & montage avec soin</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Garantie 2 ans constructeur</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="space-y-6 pt-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-serif">
              Dans la même collection
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map(p => (
                <ProductCard key={p.id} product={p} onSelectProduct={onSelectProduct} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
