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
import { ProductDetailPage } from './components/ProductDetailPage';
import { Product, Pack, Store, BlogPost, Category, Advertisements } from './types';
import { api } from './utils/api';
import initialData from './data/initialData';

export const DariShopApp: React.FC<{
  onOpenAuthModal?: () => void;
  currentUser?: any;
}> = ({ onOpenAuthModal, currentUser }) => {
  const [currentView, setCurrentView] = useState<'home' | 'catalog' | 'packs' | 'blog' | 'stores' | 'checkout' | 'product-detail'>('home');
  const [products, setProducts] = useState<Product[]>(initialData.allProducts as any);
  const [categories, setCategories] = useState<Category[]>(initialData.categories as any);
  const [packs, setPacks] = useState<Pack[]>(initialData.packs as any);
  const [stores, setStores] = useState<Store[]>(initialData.stores as any);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(initialData.blogPosts as any);
  const [advertisements, setAdvertisements] = useState<Advertisements>(initialData.initialAdvertisements as Advertisements);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);

  // Sync data dynamically from backend API
  const loadData = async () => {
    try {
      const [prodsData, catsData, packsData, adsData, storesData, blogData] = await Promise.all([
        api.getProducts().catch(() => initialData.allProducts),
        api.getCategories().catch(() => initialData.categories),
        api.getPacks().catch(() => initialData.packs),
        api.getAdvertisements().catch(() => initialData.initialAdvertisements),
        api.getStores().catch(() => initialData.stores),
        api.getBlogPosts().catch(() => initialData.blogPosts)
      ]);

      if (Array.isArray(prodsData) && prodsData.length > 0) setProducts(prodsData);
      if (Array.isArray(catsData) && catsData.length > 0) setCategories(catsData);
      if (Array.isArray(packsData) && packsData.length > 0) setPacks(packsData);
      if (adsData && typeof adsData === 'object') {
        setAdvertisements(prev => ({
          ...prev,
          ...adsData,
          logoConfig: adsData.logoConfig || prev?.logoConfig,
          dariHome: adsData.dariHome || prev?.dariHome
        }));
      }
      if (Array.isArray(storesData) && storesData.length > 0) setStores(storesData);
      if (Array.isArray(blogData) && blogData.length > 0) setBlogPosts(blogData);
    } catch (e) {
      console.warn('DariShop data loading fallback:', e);
    }
  };

  useEffect(() => {
    loadData();

    // Listen to live backoffice updates
    const handleAdsUpdated = (e: any) => {
      if (e.detail) {
        setAdvertisements(e.detail);
      }
    };
    window.addEventListener('dari-ads-updated', handleAdsUpdated);
    return () => window.removeEventListener('dari-ads-updated', handleAdsUpdated);
  }, []);

  const handleNavigate = (view: 'home' | 'catalog' | 'packs' | 'blog' | 'stores' | 'checkout' | 'product-detail') => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setCurrentView('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProductSelect = (product: Product) => {
    setPreviewProduct(product);
  };

  const handleViewFullDetail = (product: Product) => {
    setSelectedProduct(product);
    setPreviewProduct(null);
    setCurrentView('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const dariHome = advertisements?.dariHome;
  const logoConfig = advertisements?.logoConfig;

  return (
    <ThemeProvider>
      <ToastProvider>
        <CartProvider>
          <FavoritesProvider>
            <CompareProvider>
              <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-600 selection:text-white">
                
                {/* 1. Header with dynamic logoConfig from Backoffice */}
                <Header
                  onNavigate={handleNavigate}
                  currentView={currentView}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onSelectCategory={handleCategorySelect}
                  onOpenAuthModal={onOpenAuthModal}
                  currentUser={currentUser}
                  categories={categories}
                  logoConfig={logoConfig}
                />

                {/* 2. Main View Routing */}
                <main className="flex-1">
                  
                  {/* HOME VIEW: Hero Banner + Trust Badges + Architectural Room Highlights + Bestsellers + Promo Banner */}
                  {currentView === 'home' && (
                    <>
                      <HeroSection
                        onExplore={() => handleNavigate('catalog')}
                        onSelectCategory={handleCategorySelect}
                        customHero={dariHome?.hero}
                        customBadges={dariHome?.trustBadges}
                      />

                      {/* Configured Bestsellers Header matching Backoffice */}
                      <div className="pt-10 pb-2 text-center max-w-7xl mx-auto px-4">
                        <span className="text-xs font-black uppercase tracking-widest text-[#b87333] block mb-1">
                          {dariHome?.bestsellersKicker || 'LES PIÈCES LES PLUS PLÉBISCITÉES'}
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black text-[#0f3e37] dark:text-white">
                          {dariHome?.bestsellersTitle || 'Nos Incontournables Coups de Cœur'}
                        </h2>
                      </div>

                      <ProductGridSection
                        products={products}
                        selectedCategory={selectedCategory}
                        onSelectCategory={setSelectedCategory}
                        onSelectProduct={handleProductSelect}
                        searchQuery={searchQuery}
                      />

                      {/* Promo Banner from Backoffice */}
                      {dariHome?.promoBanner && (
                        <section className="py-10 bg-slate-50 dark:bg-slate-900/60">
                          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border border-indigo-500/20">
                              <div className="relative z-10 max-w-xl space-y-3">
                                <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-300 font-bold text-xs uppercase tracking-wider border border-indigo-400/20">
                                  {dariHome.promoBanner.tag || 'OFFRE SPÉCIALE DÉCO'}
                                </span>
                                <h3 className="text-2xl sm:text-4xl font-black leading-tight font-serif">
                                  {dariHome.promoBanner.title}{' '}
                                  <span className="text-amber-400 italic">
                                    {dariHome.promoBanner.discountHighlight || '-30%'}
                                  </span>
                                </h3>
                                <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
                                  {dariHome.promoBanner.description}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => handleCategorySelect(dariHome.promoBanner?.categoryTarget || 'all')}
                                  className="mt-4 px-7 py-3 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all cursor-pointer"
                                >
                                  {dariHome.promoBanner.buttonText || 'Voir les offres déco'}
                                </button>
                              </div>

                              {dariHome.promoBanner.bgImage && (
                                <div className="w-full md:w-80 h-52 rounded-2xl overflow-hidden shadow-lg border border-white/10 shrink-0">
                                  <img
                                    src={dariHome.promoBanner.bgImage}
                                    alt="Promotion DariShop"
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
                      onSelectProduct={handleProductSelect}
                      searchQuery={searchQuery}
                    />
                  )}

                  {/* PRODUCT DETAIL VIEW */}
                  {currentView === 'product-detail' && selectedProduct && (
                    <ProductDetailPage
                      product={selectedProduct}
                      allProducts={products}
                      onNavigateHome={() => handleNavigate('home')}
                      onNavigateCatalog={(cat) => {
                        if (cat) setSelectedCategory(cat);
                        handleNavigate('catalog');
                      }}
                      onSelectProduct={handleViewFullDetail}
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
                  product={previewProduct}
                  onClose={() => setPreviewProduct(null)}
                  onViewFullDetail={handleViewFullDetail}
                />

                {/* 4. Sliding Cart Drawer */}
                <CartSidebar
                  onProceedToCheckout={() => handleNavigate('checkout')}
                />

                {/* 5. Support Messaging Chatbox */}
                <SupportWidget currentUser={currentUser} />

                {/* 6. Complete Footer with dynamic logoConfig */}
                <Footer onNavigate={handleNavigate} logoConfig={logoConfig} />

              </div>
            </CompareProvider>
          </FavoritesProvider>
        </CartProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default DariShopApp;
