import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './components/ThemeContext';
import { ToastProvider } from './components/ToastContext';
import { CartProvider } from './components/CartContext';
import { FavoritesProvider } from './components/FavoritesContext';
import { CompareProvider } from './components/CompareContext';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CategoryShowcase } from './components/CategoryShowcase';
import { ProductGridSection } from './components/ProductGridSection';
import { ProductPreviewModal } from './components/ProductPreviewModal';
import { CartSidebar } from './components/CartSidebar';
import { CheckoutPage } from './components/CheckoutPage';
import { SupportWidget } from './components/SupportWidget';
import { Footer } from './components/Footer';
import { PacksPage } from './components/PacksPage';
import { BlogPage } from './components/BlogPage';
import { StoresPage } from './components/StoresPage';
import { Product, Pack, Store, BlogPost } from './types';

// Default initial data for YoupiShop
import initialData from './data/initialData';

export const YoupiShopApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'catalog' | 'packs' | 'blog' | 'stores' | 'checkout'>('home');
  const [products, setProducts] = useState<Product[]>(initialData.allProducts as any);
  const [packs] = useState<Pack[]>(initialData.packs as any);
  const [stores] = useState<Store[]>(initialData.stores as any);
  const [blogPosts] = useState<BlogPost[]>(initialData.blogPosts as any);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Sync products from server if available
  useEffect(() => {
    fetch('/api/products', {
      headers: { 'x-shop-id': 'youpi' }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleNavigate = (view: 'home' | 'catalog' | 'packs' | 'blog' | 'stores' | 'checkout') => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExploreCategory = (categorySlug?: string) => {
    if (categorySlug) {
      const match = products.find(p => p.category.toLowerCase().includes(categorySlug.replace('-', ' ')));
      if (match) {
        setSelectedCategory(match.category);
      } else {
        setSelectedCategory('all');
      }
    } else {
      setSelectedCategory('all');
    }
    setCurrentView('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ThemeProvider>
      <ToastProvider>
        <CartProvider>
          <FavoritesProvider>
            <CompareProvider>
              <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-amber-500 selection:text-white">
                
                {/* 1. Header (Top Bar Contract) */}
                <Header
                  onNavigate={handleNavigate}
                  currentView={currentView}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />

                {/* 2. Main View Routing */}
                <main className="flex-1">
                  
                  {/* HOME VIEW */}
                  {currentView === 'home' && (
                    <>
                      <HeroSection onExplore={handleExploreCategory} />
                      <CategoryShowcase
                        onSelectCategory={(cat) => {
                          setSelectedCategory(cat);
                          setCurrentView('catalog');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        selectedCategory={selectedCategory}
                      />
                      <ProductGridSection
                        products={products}
                        selectedCategory={selectedCategory}
                        onSelectCategory={setSelectedCategory}
                        onSelectProduct={setSelectedProduct}
                        searchQuery={searchQuery}
                      />
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
                  onProceedToCheckout={() => setCurrentView('checkout')}
                />

                {/* 5. Support Messaging Chatbox ("Boîte messagerie qui convient") */}
                <SupportWidget />

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
