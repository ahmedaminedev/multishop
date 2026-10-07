import React, { useState, useEffect } from 'react';
import type { Advertisements, Product, Pack, Category, Store, BlogPost } from '../../types';
import { Header } from '../Header';
import { HeroSection } from '../HeroSection';
import { ProductGridSection } from '../ProductGridSection';
import { ProductPreviewModal } from '../ProductPreviewModal';
import { PacksPage } from '../PacksPage';
import { BlogPage } from '../BlogPage';
import { StoresPage } from '../StoresPage';
import { Footer } from '../Footer';
import { CartSidebar } from '../CartSidebar';
import { ProductDetailPage } from '../ProductDetailPage';
import {
  Maximize2,
  Minimize2,
  Monitor,
  Tablet,
  Smartphone,
  CheckCircle2,
  Home,
  ShoppingBag,
  Layers,
  Store as StoreIcon,
  Phone,
  X,
  ExternalLink,
  Sparkles,
  BookOpen,
  MessageSquare
} from 'lucide-react';

export type YoupiSubsitePreviewPage = 'home' | 'catalog' | 'packs' | 'blog' | 'stores' | 'product-detail';

interface SubsiteLiveFullscreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPage?: YoupiSubsitePreviewPage;
  products: Product[];
  categories: Category[];
  packs?: Pack[];
  stores?: Store[];
  blogPosts?: BlogPost[];
  advertisements?: Advertisements;
  onNavigateToStorefront?: () => void;
}

export const SubsiteLiveFullscreenModal: React.FC<SubsiteLiveFullscreenModalProps> = ({
  isOpen,
  onClose,
  initialPage = 'home',
  products = [],
  categories = [],
  packs = [],
  stores = [],
  blogPosts = [],
  advertisements,
  onNavigateToStorefront
}) => {
  const [currentPage, setCurrentPage] = useState<YoupiSubsitePreviewPage>(initialPage);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (isOpen && initialPage) {
      setCurrentPage(initialPage);
    }
  }, [isOpen, initialPage]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleProductSelect = (p: Product) => {
    setSelectedProduct(p);
    setCurrentPage('product-detail');
  };

  if (!isOpen) return null;

  const youpiHome = advertisements?.youpiHome;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col overflow-hidden animate-in fade-in duration-200 font-sans">
      
      {/* 1. TOP DOCK BAR CONTROLS */}
      <div className="h-16 px-4 sm:px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0 shadow-xl z-20">
        
        {/* Left: Brand & Live Badge */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center font-black text-lg shadow-md shadow-amber-500/20">
            🧸
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-white">
                Sous-Site YoupiShop <span className="text-amber-400">En Direct</span>
              </h2>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase border border-amber-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                Vitrine Temps Réel
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Visualisez le sous-site exactement comme les clients avant validation
            </p>
          </div>
        </div>

        {/* Center: Sub-site Page Navigation Switcher */}
        <div className="flex items-center bg-slate-800/90 border border-slate-700/80 p-1 rounded-2xl overflow-x-auto max-w-full no-scrollbar">
          <button
            type="button"
            onClick={() => setCurrentPage('home')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              currentPage === 'home'
                ? 'bg-amber-500 text-white shadow-xs font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Accueil</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentPage('catalog')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              currentPage === 'catalog'
                ? 'bg-amber-500 text-white shadow-xs font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Catalogue ({products.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentPage('packs')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              currentPage === 'packs'
                ? 'bg-amber-500 text-white shadow-xs font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Packs & Coffrets ({packs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentPage('blog')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              currentPage === 'blog'
                ? 'bg-amber-500 text-white shadow-xs font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Conseils Jouets</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentPage('stores')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              currentPage === 'stores'
                ? 'bg-amber-500 text-white shadow-xs font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <StoreIcon className="w-3.5 h-3.5" />
            <span>Magasins ({stores.length})</span>
          </button>
        </div>

        {/* Right: Viewport Mode Switcher & Exit */}
        <div className="flex items-center gap-2">
          {/* Viewport Modes */}
          <div className="hidden sm:flex items-center bg-slate-800 border border-slate-700 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewportMode('desktop')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewportMode === 'desktop' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Bureau 100%"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Bureau</span>
            </button>
            <button
              type="button"
              onClick={() => setViewportMode('tablet')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewportMode === 'tablet' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Tablette 768px"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Tablette</span>
            </button>
            <button
              type="button"
              onClick={() => setViewportMode('mobile')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewportMode === 'mobile' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Mobile 375px"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Mobile</span>
            </button>
          </div>

          {onNavigateToStorefront && (
            <button
              type="button"
              onClick={onNavigateToStorefront}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              title="Basculer vers la vitrine frontoffice complète"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Ouvrir dans le Front</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-300 flex items-center justify-center transition-colors cursor-pointer border border-slate-700"
            title="Fermer la prévisualisation (Échap)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* 2. PREVIEW VIEWPORT AREA */}
      <div className="flex-1 bg-slate-900/60 overflow-y-auto flex items-start justify-center p-3 sm:p-6 custom-scrollbar">
        <div
          className={`bg-white dark:bg-slate-950 rounded-2xl shadow-2xl overflow-hidden border border-slate-700/80 flex flex-col transition-all duration-300 ${
            viewportMode === 'desktop'
              ? 'w-full max-w-7xl min-h-[900px]'
              : viewportMode === 'tablet'
              ? 'w-[768px] min-h-[850px]'
              : 'w-[375px] min-h-[750px]'
          }`}
        >
          
          {/* Virtual Browser Top Strip */}
          <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
            </div>
            <div className="flex-1 max-w-md mx-auto bg-white dark:bg-slate-900 rounded-md py-0.5 px-3 text-[10px] font-mono text-slate-400 text-center truncate">
              https://multishop.tn/#/store/youpi/{currentPage}
            </div>
          </div>

          {/* Rendered YoupiShop Frontoffice Component */}
          <div className="flex-1 flex flex-col">
            
            {/* Header with dynamic categories from backoffice */}
            <Header
              onNavigate={(v: any) => setCurrentPage(v)}
              currentView={currentPage}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                setCurrentPage('catalog');
              }}
              currentUser={null}
              categories={categories}
            />

            {/* Page Content */}
            <main className="flex-1">
              
              {/* 1. HOME VIEW */}
              {currentPage === 'home' && (
                <>
                  <HeroSection
                    onExplore={() => setCurrentPage('catalog')}
                    onSelectCategory={(cat) => {
                      setSelectedCategory(cat);
                      setCurrentPage('catalog');
                    }}
                    customHero={youpiHome?.hero}
                    customBadges={youpiHome?.trustBadges}
                  />

                  {/* Section Title */}
                  <div className="pt-8 text-center max-w-7xl mx-auto px-4">
                    <span className="text-xs font-black uppercase tracking-widest text-amber-500 block mb-1">
                      {youpiHome?.bestsellersKicker || 'COUPS DE CŒUR ENFANTS'}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-serif">
                      {youpiHome?.bestsellersTitle || 'Nos Bestsellers Coups de Cœur'}
                    </h2>
                  </div>

                  <ProductGridSection
                    products={products}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                    onSelectProduct={handleProductSelect}
                    searchQuery={searchQuery}
                  />

                  {/* Promotional Banner */}
                  {youpiHome?.promoBanner && (
                    <section className="py-8 bg-slate-50 dark:bg-slate-900/60">
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white p-8 sm:p-12 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                          <div className="relative z-10 max-w-xl space-y-3">
                            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white font-black text-xs uppercase tracking-wider">
                              {youpiHome.promoBanner.tag || 'PROMOTION'}
                            </span>
                            <h3 className="text-2xl sm:text-4xl font-black leading-tight">
                              {youpiHome.promoBanner.title}{' '}
                              <span className="text-amber-200 underline">
                                {youpiHome.promoBanner.discountHighlight}
                              </span>
                            </h3>
                            <p className="text-white/90 text-sm sm:text-base">
                              {youpiHome.promoBanner.description}
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                if (youpiHome?.promoBanner?.categoryTarget) {
                                  setSelectedCategory(youpiHome.promoBanner.categoryTarget);
                                }
                                setCurrentPage('catalog');
                              }}
                              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg hover:bg-amber-50 transition-all cursor-pointer"
                            >
                              <span>{youpiHome.promoBanner.buttonText || 'Découvrir la sélection'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </section>
                  )}
                </>
              )}

              {/* 2. CATALOG VIEW */}
              {currentPage === 'catalog' && (
                <div className="py-6">
                  <div className="max-w-7xl mx-auto px-4 mb-4 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black uppercase text-amber-500">Catalogue Complet</span>
                      <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                        Tous nos Jouets & Jeux Éducatifs
                      </h1>
                    </div>
                  </div>
                  <ProductGridSection
                    products={products}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                    onSelectProduct={handleProductSelect}
                    searchQuery={searchQuery}
                  />
                </div>
              )}

              {/* PRODUCT DETAIL VIEW */}
              {currentPage === 'product-detail' && selectedProduct && (
                <ProductDetailPage
                  product={selectedProduct}
                  allProducts={products}
                  onNavigateHome={() => setCurrentPage('home')}
                  onNavigateCatalog={(cat) => {
                    if (cat) setSelectedCategory(cat);
                    setCurrentPage('catalog');
                  }}
                  onSelectProduct={handleProductSelect}
                />
              )}

              {/* 3. PACKS VIEW */}
              {currentPage === 'packs' && (
                <PacksPage
                  packs={packs}
                />
              )}

              {/* 4. BLOG VIEW */}
              {currentPage === 'blog' && (
                <BlogPage
                  posts={blogPosts}
                />
              )}

              {/* 5. STORES VIEW */}
              {currentPage === 'stores' && (
                <StoresPage stores={stores} />
              )}

            </main>

            {/* Footer */}
            <Footer onNavigate={(v: any) => setCurrentPage(v)} />

            {/* Product Preview Modal */}
            {selectedProduct && (
              <ProductPreviewModal
                product={selectedProduct}
                isOpen={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
              />
            )}

            {/* Cart Sidebar */}
            <CartSidebar onProceedToCheckout={() => {}} />

          </div>

        </div>
      </div>

    </div>
  );
};
