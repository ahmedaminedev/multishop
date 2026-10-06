import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './components/ThemeContext';
import { ToastProvider } from './components/ToastContext';
import { CartProvider } from './components/CartContext';
import { FavoritesProvider } from './components/FavoritesContext';
import { CompareProvider } from './components/CompareContext';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { ProductGridSection } from './components/ProductGridSection';
import { ProductPreviewModal } from './components/ProductPreviewModal';
import { CartSidebar } from './components/CartSidebar';
import { CheckoutPage } from './components/CheckoutPage';
import { SupportWidget } from './components/SupportWidget';
import { Footer } from './components/Footer';
import { PacksPage } from './components/PacksPage';
import { BlogPage } from './components/BlogPage';
import { StoresPage } from './components/StoresPage';
import { Product, Pack, Store, BlogPost, Category, Advertisements } from './types';
import { api } from './utils/api';

// Default initial data fallback for YoupiShop
import initialData from './data/initialData';

export const YoupiShopApp: React.FC<{
  onOpenAuthModal?: () => void;
  currentUser?: any;
}> = ({ onOpenAuthModal, currentUser }) => {
  const [currentView, setCurrentView] = useState<'home' | 'catalog' | 'packs' | 'blog' | 'stores' | 'checkout'>('home');
  const [products, setProducts] = useState<Product[]>(initialData.allProducts as any);
  const [categories, setCategories] = useState<Category[]>(initialData.categories as any);
  const [packs, setPacks] = useState<Pack[]>(initialData.packs as any);
  const [stores, setStores] = useState<Store[]>(initialData.stores as any);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(initialData.blogPosts as any);
  const [advertisements, setAdvertisements] = useState<Advertisements | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Sync data dynamically from backend API
  const loadData = async () => {
    try {
      const [prodsData, catsData, packsData, adsData, storesData, blogData] = await Promise.all([
        api.getProducts().catch(() => initialData.allProducts),
        api.getCategories().catch(() => initialData.categories),
        api.getPacks().catch(() => initialData.packs),
        api.getAdvertisements().catch(() => null),
        api.getStores().catch(() => initialData.stores),
        api.getBlogPosts().catch(() => initialData.blogPosts)
      ]);

      if (Array.isArray(prodsData) && prodsData.length > 0) setProducts(prodsData);
      if (Array.isArray(catsData) && catsData.length > 0) setCategories(catsData);
      if (Array.isArray(packsData) && packsData.length > 0) setPacks(packsData);
      if (adsData) setAdvertisements(adsData);
      if (Array.isArray(storesData) && storesData.length > 0) setStores(storesData);
      if (Array.isArray(blogData) && blogData.length > 0) setBlogPosts(blogData);
    } catch (e) {
      console.warn('YoupiShop data loading fallback:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleNavigate = (view: 'home' | 'catalog' | 'packs' | 'blog' | 'stores' | 'checkout') => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setCurrentView('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const youpiHome = advertisements?.youpiHome;

  return (
    <ThemeProvider>
      <ToastProvider>
        <CartProvider>
          <FavoritesProvider>
            <CompareProvider>
              <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-amber-500 selection:text-white">
                
                {/* 1. Header (Exact Match to Capture Screenshot) */}
                <Header
                  onNavigate={handleNavigate}
                  currentView={currentView}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onSelectCategory={handleCategorySelect}
                  onOpenAuthModal={onOpenAuthModal}
                  currentUser={currentUser}
                  categories={categories}
                />

                {/* 2. Main View Routing */}
                <main className="flex-1">
                  
                  {/* HOME VIEW: Hero Banner + Trust Badges + 8 Pastel Category Cards + Playful Ribbon + Catalog */}
                  {currentView === 'home' && (
                    <>
                      <HeroSection
                        onExplore={() => handleNavigate('catalog')}
                        onSelectCategory={handleCategorySelect}
                        customHero={youpiHome?.hero}
                        customBadges={youpiHome?.trustBadges}
                      />

                      {/* Configured Bestsellers Header */}
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
                        onSelectProduct={setSelectedProduct}
                        searchQuery={searchQuery}
                      />

                      {/* Promo Banner from Admin */}
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
                                  <span className="text-amber-200 underline decoration-wavy">
                                    {youpiHome.promoBanner.discountHighlight || '-25%'}
                                  </span>
                                </h3>
                                <p className="text-white/95 text-xs sm:text-sm font-medium leading-relaxed">
                                  {youpiHome.promoBanner.description}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => handleCategorySelect(youpiHome.promoBanner.categoryTarget || 'all')}
                                  className="mt-4 px-7 py-3 rounded-2xl bg-white text-slate-900 hover:bg-slate-50 font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all cursor-pointer"
                                >
                                  {youpiHome.promoBanner.buttonText || 'Découvrir la sélection'}
                                </button>
                              </div>

                              {youpiHome.promoBanner.bgImage && (
                                <div className="w-full md:w-80 h-52 rounded-2xl overflow-hidden shadow-lg border-2 border-white/40 shrink-0">
                                  <img
                                    src={youpiHome.promoBanner.bgImage}
                                    alt="Promotion YoupiShop"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </section>
                      )}
                    </>
                  )}

                  {/* CATALOG VIEW */}
                  {currentView === 'catalog' && (
                    <ProductGridSection
                      products={products}
                      selectedCategory={selectedCategory}
                      onSelectCategory={setSelectedCategory}
                      onSelectProduct={setSelectedProduct}
                      searchQuery={searchQuery}
                    />
                  )}

                  {/* PACKS & BUNDLES VIEW */}
                  {currentView === 'packs' && <PacksPage packs={packs} />}

                  {/* BLOG & GUIDES VIEW */}
                  {currentView === 'blog' && <BlogPage posts={blogPosts} />}

                  {/* STORES VIEW */}
                  {currentView === 'stores' && <StoresPage stores={stores} />}

                  {/* CHECKOUT VIEW */}
                  {currentView === 'checkout' && (
                    <CheckoutPage
                      onBackToShopping={() => setCurrentView('home')}
                      onOrderSuccess={() => {}}
                    />
                  )}

                </main>

                {/* 3. Product Quick Detail Modal */}
                <ProductPreviewModal
                  product={selectedProduct}
                  onClose={() => setSelectedProduct(null)}
                />

                {/* 4. Sliding Cart Drawer */}
                <CartSidebar
                  onProceedToCheckout={() => handleNavigate('checkout')}
                />

                {/* 5. Support Messaging Chatbox (Real-time Socket.IO + WhatsApp) */}
                <SupportWidget currentUser={currentUser} />

                {/* 6. Complete Modern Footer */}
                <Footer onNavigate={handleNavigate} />

              </div>
            </CompareProvider>
          </FavoritesProvider>
        </CartProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default YoupiShopApp;
