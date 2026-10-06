import React, { useState, useMemo, useEffect } from 'react';
import type { Product } from '../types';
import { useCart } from './CartContext';
import { useFavorites } from './FavoritesContext';
import { useToast } from './ToastContext';
import {
  Star,
  Heart,
  ShoppingBag,
  Sparkles,
  Baby,
  ShieldCheck,
  Truck,
  RefreshCw,
  Phone,
  Gift,
  Check,
  ArrowLeft,
  Share2,
  Package,
  Award,
  ChevronRight,
  Smile,
  Plus,
  Minus,
  MessageCircle,
  Clock
} from 'lucide-react';
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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'safety' | 'reviews'>('description');
  const [isGiftWrapSelected, setIsGiftWrapSelected] = useState(false);
  const [giftNote, setGiftNote] = useState('');
  
  // Reviews state
  const [reviewsList, setReviewsList] = useState([
    {
      id: 1,
      author: 'Amira Ben Salem',
      rating: 5,
      date: '15 Février 2026',
      title: 'Mon fils de 4 ans ne le quitte plus !',
      comment: 'Qualité impeccable, les finitions sont soignées et sans danger. La livraison à Tunis a pris moins de 24 heures.',
      verified: true,
      avatar: '👩'
    },
    {
      id: 2,
      author: 'Walid Mansour',
      rating: 5,
      date: '28 Janvier 2026',
      title: 'Cadeau idéal pour anniversaire',
      comment: 'Emballage cadeau parfait avec le petit mot. Très content de cet achat, je recommande YoupiShop les yeux fermés.',
      verified: true,
      avatar: '👨'
    },
    {
      id: 3,
      author: 'Sonia Khemir',
      rating: 4,
      date: '10 Janvier 2026',
      title: 'Très éducatif et captivant',
      comment: 'Super jouet d\'éveil, très solide et couleurs magnifiques. Mes jumelles passent des heures à jouer ensemble.',
      verified: true,
      avatar: '👩'
    }
  ]);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);

  const fav = isFavorite(product.id);
  const isOutOfStock = product.quantity === 0;

  // Image list (fallback to product.imageUrl)
  const productImages = useMemo(() => {
    if (product.images && product.images.length > 0) {
      return product.images;
    }
    return [
      product.imageUrl || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=800',
      'https://images.unsplash.com/photo-1587654780291-39c9404d746b?q=80&w=800',
      'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?q=80&w=800'
    ];
  }, [product]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedImageIndex(0);
    setQuantity(1);
    setIsGiftWrapSelected(false);
    setGiftNote('');
  }, [product.id]);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    addToast(`${quantity} x "${product.name}" ajouté(s) au panier ! 🧸`, 'success');
    setIsCartOpen(true);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim()) return;

    const newRev = {
      id: Date.now(),
      author: newReviewAuthor.trim(),
      rating: newReviewRating,
      date: 'Aujourd\'hui',
      title: 'Avis parent vérifié',
      comment: newReviewComment.trim(),
      verified: true,
      avatar: '🌟'
    };

    setReviewsList([newRev, ...reviewsList]);
    setNewReviewAuthor('');
    setNewReviewComment('');
    setNewReviewRating(5);
    addToast('Merci pour votre avis ! Votre retour aide d\'autres parents.', 'success');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Découvrez "${product.name}" sur YoupiShop Tunisie !`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast('Lien du jouet copié dans le presse-papier !', 'info');
    }
  };

  // Similar toys from same category or general catalog
  const similarProducts = useMemo(() => {
    return allProducts
      .filter(p => p.id !== product.id && (p.category === product.category || p.trancheAge === product.trancheAge))
      .slice(0, 4);
  }, [allProducts, product]);

  const discountValue = product.oldPrice && product.oldPrice > product.price
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : product.discount || 0;

  const savingsAmount = product.oldPrice && product.oldPrice > product.price
    ? (product.oldPrice - product.price).toFixed(3)
    : null;

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-amber-500 selection:text-white pb-20">
      
      {/* 1. BREADCRUMB & TOP NAVIGATOR */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            
            {/* Breadcrumb Links */}
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <button
                type="button"
                onClick={onNavigateHome}
                className="hover:text-amber-600 transition-colors cursor-pointer flex items-center gap-1 font-bold"
              >
                <span>Accueil</span>
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />

              <button
                type="button"
                onClick={() => onNavigateCatalog(product.category)}
                className="hover:text-amber-600 transition-colors cursor-pointer font-bold"
              >
                <span>{product.category || 'Jouets'}</span>
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />

              <span className="font-extrabold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">
                {product.name}
              </span>
            </div>

            {/* Back Button */}
            <button
              type="button"
              onClick={() => onNavigateCatalog(product.category)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950/40 text-slate-700 dark:text-slate-300 hover:text-amber-700 font-bold text-xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Retour au catalogue</span>
            </button>

          </div>
        </div>
      </div>

      {/* 2. MAIN PRODUCT OVERVIEW SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT COLUMN: INTERACTIVE VISUAL GALLERY (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Main Stage Image Frame */}
            <div className="relative aspect-4/3 sm:aspect-square w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-10 flex items-center justify-center overflow-hidden shadow-xl shadow-amber-500/5 group">
              
              {/* Playful Floating Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
                {product.trancheAge && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black text-xs uppercase tracking-wider shadow-md">
                    <Baby className="w-3.5 h-3.5" />
                    <span>{product.trancheAge}</span>
                  </span>
                )}
                {discountValue > 0 && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500 text-white font-black text-xs tracking-wider shadow-md">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>PROMO -{discountValue}%</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500 text-white font-black text-[11px] shadow-md">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Norme CE & EN-71</span>
                </span>
              </div>

              {/* Top-Right Favorite & Share Buttons */}
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="p-2.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-amber-500 hover:scale-105 transition-all shadow-sm cursor-pointer"
                  title="Partager ce jouet"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleFavorite(product)}
                  className={`p-2.5 rounded-2xl backdrop-blur-md border transition-all shadow-sm cursor-pointer hover:scale-105 ${
                    fav
                      ? 'bg-rose-500 border-rose-500 text-white'
                      : 'bg-white/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-500'
                  }`}
                  title={fav ? 'Retirer des favoris' : 'Ajouter à la liste d\'envies'}
                >
                  <Heart className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Main Featured Photo */}
              <img
                src={productImages[selectedImageIndex] || product.imageUrl}
                alt={product.name}
                className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-md select-none"
              />

              {/* Mascot Floating Bubble */}
              <div className="absolute bottom-4 right-4 bg-amber-50/90 dark:bg-slate-800/90 backdrop-blur-sm border border-amber-200/80 dark:border-amber-900/60 px-3 py-1.5 rounded-2xl flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200 shadow-sm pointer-events-none">
                <span className="text-lg">🧸</span>
                <span>Qualité Testée & Approuvée</span>
              </div>

            </div>

            {/* Thumbnail Carousel Slider */}
            {productImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 p-2 border-2 transition-all shrink-0 cursor-pointer overflow-hidden ${
                      selectedImageIndex === idx
                        ? 'border-amber-500 shadow-md ring-2 ring-amber-500/20 scale-105'
                        : 'border-slate-200 dark:border-slate-800 hover:border-amber-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} vue ${idx + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Safety & Pedagogy Highlights Box (Designed specifically for parents) */}
            <div className="p-5 rounded-3xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-black text-xs uppercase tracking-wider">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Pourquoi les parents adorent ce jouet :</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-2xl border border-amber-100 dark:border-amber-950/60 flex items-center gap-2.5">
                  <span className="text-xl">🌿</span>
                  <div>
                    <p className="font-black text-xs text-slate-800 dark:text-slate-100">Matériaux Sains</p>
                    <p className="text-[10px] text-slate-500">Sans BPA ni phtalates</p>
                  </div>
                </div>
                <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-2xl border border-amber-100 dark:border-amber-950/60 flex items-center gap-2.5">
                  <span className="text-xl">🧠</span>
                  <div>
                    <p className="font-black text-xs text-slate-800 dark:text-slate-100">Éveil Sensoriel</p>
                    <p className="text-[10px] text-slate-500">Stimule la créativité</p>
                  </div>
                </div>
                <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-2xl border border-amber-100 dark:border-amber-950/60 flex items-center gap-2.5">
                  <span className="text-xl">💪</span>
                  <div>
                    <p className="font-black text-xs text-slate-800 dark:text-slate-100">Très Robuste</p>
                    <p className="text-[10px] text-slate-500">Résiste aux chutes</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: PRODUCT PURCHASING & DECISION (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-6">
              
              {/* Brand & Category header */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-extrabold text-[11px] uppercase tracking-wider">
                    {product.brand || 'YoupiPlay'}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">•</span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {product.category || 'Jeux & Jouets'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                  <Star className="w-4 h-4 fill-current text-amber-400" />
                  <span className="text-slate-800 dark:text-white font-extrabold">{product.rating || 4.9}</span>
                  <span className="text-slate-400">({product.reviewsCount || 28} avis)</span>
                </div>
              </div>

              {/* Title & Short Catchphrase */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                  {product.name}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium leading-relaxed">
                  {product.description?.slice(0, 140) || 'Un jouet captivant pensé pour émerveiller votre enfant et partager d\'inoubliables moments de jeu.'}...
                </p>
              </div>

              {/* Price Banner & Stock Status */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                      {product.price.toFixed(3)}
                    </span>
                    <span className="text-sm font-extrabold text-amber-600">DT</span>
                    {product.oldPrice && product.oldPrice > product.price && (
                      <span className="text-sm text-slate-400 line-through font-medium ml-1">
                        {product.oldPrice.toFixed(3)} DT
                      </span>
                    )}
                  </div>
                  {savingsAmount && (
                    <p className="text-[11px] font-bold text-rose-500 mt-0.5">
                      Économisez {savingsAmount} DT sur ce jouet !
                    </p>
                  )}
                </div>

                <div className="text-right">
                  {isOutOfStock ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 font-bold text-xs">
                      Rupture temporaire
                    </span>
                  ) : (
                    <div className="space-y-0.5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        En Stock ({product.quantity || 15} ex.)
                      </span>
                      <p className="text-[10px] text-slate-400 font-medium">Expédié sous 24h</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Age Range Visual Bar */}
              {product.trancheAge && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Baby className="w-4 h-4 text-amber-500" />
                      <span>Tranche d'âge recommandée :</span>
                    </span>
                    <span className="font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-900">
                      {product.trancheAge}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                    <div className="bg-amber-400 h-full w-full rounded-full animate-pulse"></div>
                  </div>
                </div>
              )}

              {/* FREE GIFT WRAP OPTION (Loved by Parents & Grandparents!) */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-amber-50 dark:from-rose-950/30 dark:to-amber-950/30 border border-rose-200/80 dark:border-rose-900/40 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isGiftWrapSelected}
                    onChange={(e) => setIsGiftWrapSelected(e.target.checked)}
                    className="w-5 h-5 rounded-lg text-amber-500 focus:ring-amber-400 mt-0.5 cursor-pointer accent-amber-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 font-black text-xs text-rose-900 dark:text-rose-200 uppercase tracking-wide">
                      <Gift className="w-4 h-4 text-rose-500" />
                      <span>Option Emballage Cadeau Offert (Gratuit)</span>
                    </div>
                    <p className="text-[11px] text-rose-700/80 dark:text-rose-300 mt-0.5">
                      Papier cadeau festif YoupiShop + ruban satin préparé avec amour par nos équipes.
                    </p>
                  </div>
                </label>

                {isGiftWrapSelected && (
                  <div className="pt-2 animate-fadeIn">
                    <input
                      type="text"
                      value={giftNote}
                      onChange={(e) => setGiftNote(e.target.value)}
                      placeholder="Ex: Joyeux anniversaire mon petit champion ! De la part de Mamie..."
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 text-xs text-slate-800 dark:text-slate-100 placeholder-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
                    />
                  </div>
                )}
              </div>

              {/* Quantity Picker & Add To Cart Button */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  
                  {/* Quantity Counter */}
                  <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 p-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1 || isOutOfStock}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-black text-sm text-slate-900 dark:text-white">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(product.quantity || 10, quantity + 1))}
                      disabled={isOutOfStock || quantity >= (product.quantity || 10)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Big Yellow / Amber CTA Button */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 active:scale-98 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none"
                  >
                    <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
                    <span>Ajouter au Panier</span>
                  </button>

                </div>

                <p className="text-[11px] text-center text-slate-400 font-medium">
                  🔒 Paiement 100% sécurisé par carte bancaire ou en espèces à la livraison
                </p>
              </div>

              {/* Express Trust Guarantees List */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-3 text-xs">
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-white">Livraison 24h à 48h</span>
                    <span className="text-[11px] text-slate-400 block">Partout en Tunisie avec suivi SMS</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center shrink-0">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-white">Échange garanti sous 14 jours</span>
                    <span className="text-[11px] text-slate-400 block">Si le jouet ne plaît pas à l'enfant</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-white">Service Client & Conseils : 71 444 777</span>
                    <span className="text-[11px] text-slate-400 block">Nos conseillers vous guident par téléphone</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* 3. TABS: DESCRIPTION, CARACTÉRISTIQUES, SÉCURITÉ, AVIS CLIENTS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-lg overflow-hidden">
          
          {/* Tab Headers */}
          <div className="flex items-center border-b border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar bg-slate-50/60 dark:bg-slate-800/40 p-2 gap-2">
            {[
              { id: 'description', label: 'Description & Pédagogie', icon: <Sparkles className="w-4 h-4" /> },
              { id: 'specs', label: 'Fiche Technique', icon: <Package className="w-4 h-4" /> },
              { id: 'safety', label: 'Normes & Sécurité Enfant', icon: <ShieldCheck className="w-4 h-4" /> },
              { id: 'reviews', label: `Avis Parents (${reviewsList.length})`, icon: <Star className="w-4 h-4" /> }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content Panes */}
          <div className="p-6 sm:p-10 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            
            {/* TAB 1: DESCRIPTION */}
            {activeTab === 'description' && (
              <div className="space-y-6 max-w-4xl animate-fadeIn">
                <div className="prose dark:prose-invert max-w-none">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">
                    À propos de ce jouet
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">
                    {product.description || 'Conçu pour favoriser l\'imagination et la motricité des tout-petits comme des plus grands, ce jouet allie robustesse, sécurité et plaisir de jeu immédiat.'}
                  </p>
                  <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed">
                    Les équipes pédagogiques de YoupiShop sélectionnent chaque référence avec une grande rigueur : matériaux sans substances nocives, angles adoucis et prise en main facile pour les petites mains. Ce jeu constitue également une merveilleuse occasion de partager des moments complices en famille.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 flex items-start gap-3">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                        Apprentissage Autonome
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Encourage l'enfant à explorer, expérimenter et développer sa concentration en toute confiance.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/30 flex items-start gap-3">
                    <span className="text-2xl">🌈</span>
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                        Design Coloré & Chaleureux
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Couleurs douces et chaleureuses qui apaisent le regard et s'intègrent joliment dans la chambre.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SPECS */}
            {activeTab === 'specs' && (
              <div className="space-y-4 max-w-3xl animate-fadeIn">
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">
                  Caractéristiques Détaillées
                </h3>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                  <div className="flex justify-between p-3.5 bg-slate-50/60 dark:bg-slate-800/40">
                    <span className="font-bold text-slate-500">Marque / Éditeur</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{product.brand || 'YoupiPlay'}</span>
                  </div>
                  <div className="flex justify-between p-3.5">
                    <span className="font-bold text-slate-500">Catégorie</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{product.category}</span>
                  </div>
                  <div className="flex justify-between p-3.5 bg-slate-50/60 dark:bg-slate-800/40">
                    <span className="font-bold text-slate-500">Tranche d'Âge Conseillée</span>
                    <span className="font-extrabold text-amber-600 dark:text-amber-400">{product.trancheAge || 'Tous âges'}</span>
                  </div>
                  <div className="flex justify-between p-3.5">
                    <span className="font-bold text-slate-500">Matériaux Principaux</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">Bois certifié FSC & Peintures à l'eau non-toxiques</span>
                  </div>
                  <div className="flex justify-between p-3.5 bg-slate-50/60 dark:bg-slate-800/40">
                    <span className="font-bold text-slate-500">Référence Produit</span>
                    <span className="font-mono text-xs text-slate-600 dark:text-slate-400">YPI-{product.id}-TN</span>
                  </div>
                  <div className="flex justify-between p-3.5">
                    <span className="font-bold text-slate-500">Origine & Certification</span>
                    <span className="font-extrabold text-emerald-600">Norme Européenne EN-71 (CE)</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SAFETY */}
            {activeTab === 'safety' && (
              <div className="space-y-6 max-w-4xl animate-fadeIn">
                <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-2xl shrink-0 shadow-md">
                    🛡️
                  </div>
                  <div>
                    <h3 className="font-black text-emerald-900 dark:text-emerald-200 text-base">
                      La Sécurité de vos Enfants est notre Priorité Absolue
                    </h3>
                    <p className="text-xs text-emerald-700/90 dark:text-emerald-300 mt-1">
                      Tous les articles commercialisés sur YoupiShop font l'objet de tests stricts en laboratoire agréé avant leur mise en rayon.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>Test d'Inflammabilité & Toxicité</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                      Colorants naturels testés sans métaux lourds (plomb, cadmium, mercure) respectant la directive européenne 2009/48/CE.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>Bords Adoucis & Anti-Pincement</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                      Aucune arête tranchante. Les petites pièces sont sécurisées et scellées pour prévenir tout risque d'ingestion.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: REVIEWS */}
            {activeTab === 'reviews' && (
              <div className="space-y-8 animate-fadeIn">
                
                {/* Reviews Header & Score */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                      4.9
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-current" />
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">
                        Basé sur {reviewsList.length} avis de parents vérifiés
                      </p>
                    </div>
                  </div>

                  <div className="text-xs font-bold text-amber-700 dark:text-amber-300">
                    100% des parents recommandent ce jouet
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  {reviewsList.map(rev => (
                    <div
                      key={rev.id}
                      className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{rev.avatar}</span>
                          <div>
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white block">
                              {rev.author}
                            </span>
                            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                              <Check className="w-3 h-3" /> Achat Vérifié YoupiShop
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-amber-400">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                      </div>

                      <h4 className="font-black text-xs text-slate-800 dark:text-slate-200 pt-1">
                        "{rev.title}"
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Add a Review Form */}
                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-amber-500" />
                    <span>Votre avis compte : Partagez votre expérience de parent</span>
                  </h3>

                  <form onSubmit={handleAddReview} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Votre Prénom / Nom *
                        </label>
                        <input
                          type="text"
                          value={newReviewAuthor}
                          onChange={(e) => setNewReviewAuthor(e.target.value)}
                          placeholder="Ex: Yasmine M."
                          required
                          className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Votre Note
                        </label>
                        <div className="flex items-center gap-2 h-10">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewReviewRating(star)}
                              className="cursor-pointer transition-transform hover:scale-120"
                            >
                              <Star
                                className={`w-6 h-6 ${
                                  star <= newReviewRating
                                    ? 'text-amber-400 fill-current'
                                    : 'text-slate-300 dark:text-slate-600'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Votre Commentaire *
                      </label>
                      <textarea
                        rows={3}
                        value={newReviewComment}
                        onChange={(e) => setNewReviewComment(e.target.value)}
                        placeholder="Racontez comment votre enfant joue avec ce jouet, la qualité, la solidité..."
                        required
                        className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
                    >
                      Publier mon Avis
                    </button>
                  </form>
                </div>

              </div>
            )}

          </div>

        </div>
      </div>

      {/* 4. SIMILAR TOYS RECOMMENDATIONS CAROUSEL */}
      {similarProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-amber-500 block mb-1">
                DANS LE MÊME RAYON
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-serif">
                Les Enfants Adorent Aussi
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigateCatalog(product.category)}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Voir toute la collection</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {similarProducts.map((simProd) => (
              <ProductCard
                key={simProd.id}
                product={simProd}
                onSelect={(p) => {
                  onSelectProduct(p);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onSelectProduct={(p) => {
                  onSelectProduct(p);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
