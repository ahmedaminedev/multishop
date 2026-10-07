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
import {
  Monitor,
  Tablet,
  Smartphone,
  X,
  ExternalLink,
  Sparkles
} from 'lucide-react';

export type DariSubsitePreviewPage = 'home' | 'catalog' | 'packs' | 'blog' | 'stores';

interface SubsiteLiveFullscreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPage?: DariSubsitePreviewPage;
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
  const [currentPage, setCurrentPage] = useState<DariSubsitePreviewPage>(initialPage);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentHome = advertisements?.dariHome;
  const logoConfig = advertisements?.logoConfig;

  return (
    <div className="fixed inset-0 z-[300] bg-slate-950/90 backdrop-blur-md flex flex-col animate-fadeIn">
      
      {/* Top Controller Strip */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between text-white text-xs">
        <div className="flex items-center gap-3">
          <span className="text-xl">🏠</span>
          <div>
            <span className="font-bold">Aperçu Plein Écran de DariShop</span>
            <span className="text-[10px] text-slate-400 block">Testez la vitrine responsive en direct</span>
          </div>
        </div>

        {/* Viewport switchers */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-2xl border border-slate-700">
          <button
            type="button"
            onClick={() => setViewportMode('desktop')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer ${
              viewportMode === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Bureau (100%)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewportMode('tablet')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer ${
              viewportMode === 'tablet' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tablet className="w-4 h-4" />
            <span>Tablette (768px)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewportMode('mobile')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer ${
              viewportMode === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Mobile (390px)</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {onNavigateToStorefront && (
            <button
              type="button"
              onClick={onNavigateToStorefront}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <span>Ouvrir en Réel</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
            title="Fermer (Échap)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Viewport Frame */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex items-start justify-center bg-slate-900/60">
        <div
          className={`w-full bg-white dark:bg-slate-950 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 border border-slate-700 ${
            viewportMode === 'mobile'
              ? 'max-w-[390px]'
              : viewportMode === 'tablet'
              ? 'max-w-[768px]'
              : 'max-w-7xl'
          }`}
        >
          <Header
            onNavigate={(v) => setCurrentPage(v as any)}
            currentView={currentPage}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectCategory={(c) => {
              setSelectedCategory(c);
              setCurrentPage('catalog');
            }}
            categories={categories}
            logoConfig={logoConfig}
          />

          <main>
            {currentPage === 'home' && (
              <>
                <HeroSection
                  onExplore={() => setCurrentPage('catalog')}
                  onSelectCategory={(c) => {
                    setSelectedCategory(c);
                    setCurrentPage('catalog');
                  }}
                  customHero={currentHome?.hero}
                  customBadges={currentHome?.trustBadges}
                />

                <div className="pt-8 text-center max-w-7xl mx-auto px-4">
                  <span className="text-xs font-black uppercase tracking-widest text-[#b87333] block mb-1">
                    {currentHome?.bestsellersKicker || 'LES PIÈCES LES PLUS PLÉBISCITÉES'}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#0f3e37] dark:text-white">
                    {currentHome?.bestsellersTitle || 'Nos Incontournables Coups de Cœur'}
                  </h2>
                </div>

                <ProductGridSection
                  products={products}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  onSelectProduct={(p) => setPreviewProduct(p)}
                  searchQuery={searchQuery}
                />
              </>
            )}

            {currentPage === 'catalog' && (
              <ProductGridSection
                products={products}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                onSelectProduct={(p) => setPreviewProduct(p)}
                searchQuery={searchQuery}
              />
            )}

            {currentPage === 'packs' && (
              <PacksPage packs={packs} />
            )}

            {currentPage === 'stores' && (
              <StoresPage stores={stores} />
            )}

            {currentPage === 'blog' && (
              <BlogPage blogPosts={blogPosts} />
            )}
          </main>

          <Footer onNavigate={(v) => setCurrentPage(v as any)} logoConfig={logoConfig} />

          {previewProduct && (
            <ProductPreviewModal
              product={previewProduct}
              onClose={() => setPreviewProduct(null)}
            />
          )}
        </div>
      </div>

    </div>
  );
};
