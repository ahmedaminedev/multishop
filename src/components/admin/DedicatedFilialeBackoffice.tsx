import React, { useState, useEffect, Suspense } from 'react';
import { ArrowLeft, Store, Shield, LogOut, ChevronDown, Sparkles } from 'lucide-react';
import { FilialeId } from '../../models/ProductFiliale';

// Context providers for dedicated sub-backoffices
import { ThemeProvider as ParaThemeProvider } from '@/templates/para/components/ThemeContext';
import { ToastProvider as ParaToastProvider } from '@/templates/para/components/ToastContext';
import { CartProvider as ParaCartProvider } from '@/templates/para/components/CartContext';
import { FavoritesProvider as ParaFavoritesProvider } from '@/templates/para/components/FavoritesContext';
import { CompareProvider as ParaCompareProvider } from '@/templates/para/components/CompareContext';

import { ThemeProvider as NutritionThemeProvider } from '@/templates/nutrition/components/ThemeContext';
import { ToastProvider as NutritionToastProvider } from '@/templates/nutrition/components/ToastContext';
import { CartProvider as NutritionCartProvider } from '@/templates/nutrition/components/CartContext';
import { FavoritesProvider as NutritionFavoritesProvider } from '@/templates/nutrition/components/FavoritesContext';
import { CompareProvider as NutritionCompareProvider } from '@/templates/nutrition/components/CompareContext';

import { ThemeProvider as CosmeticThemeProvider } from '@/templates/cosmetic/components/ThemeContext';
import { ToastProvider as CosmeticToastProvider } from '@/templates/cosmetic/components/ToastContext';
import { CartProvider as CosmeticCartProvider } from '@/templates/cosmetic/components/CartContext';
import { FavoritesProvider as CosmeticFavoritesProvider } from '@/templates/cosmetic/components/FavoritesContext';
import { CompareProvider as CosmeticCompareProvider } from '@/templates/cosmetic/components/CompareContext';

import { ThemeProvider as ElectroThemeProvider } from '@/templates/electro/components/ThemeContext';
import { ToastProvider as ElectroToastProvider } from '@/templates/electro/components/ToastContext';
import { CartProvider as ElectroCartProvider } from '@/templates/electro/components/CartContext';
import { FavoritesProvider as ElectroFavoritesProvider } from '@/templates/electro/components/FavoritesContext';
import { CompareProvider as ElectroCompareProvider } from '@/templates/electro/components/CompareContext';

// Lazy loaded sub-backoffices
const ParaAdminPage = React.lazy(() => import('@/templates/para/components/admin/AdminPage').then(m => ({ default: m.AdminPage })));
const NutritionAdminPage = React.lazy(() => import('@/templates/nutrition/components/admin/AdminPage').then(m => ({ default: m.AdminPage })));
const CosmeticAdminPage = React.lazy(() => import('@/templates/cosmetic/components/admin/AdminPage').then(m => ({ default: m.AdminPage })));
const ElectroAdminPage = React.lazy(() => import('@/templates/electro/components/admin/AdminPage').then(m => ({ default: m.AdminPage })));

export interface FilialeMeta {
  id: FilialeId;
  name: string;
  subtitle: string;
  tagline: string;
  icon: string;
  colorName: string;
  badgeClass: string;
  headerAccent: string;
}

export const FILIALES_CONFIG: Record<FilialeId, FilialeMeta> = {
  para: {
    id: 'para',
    name: 'PharmaShop',
    subtitle: 'Parapharmacie & Bio',
    tagline: 'Santé, Phytothérapie & Soins Bio • produit_myshops_para',
    icon: '🌿',
    colorName: 'emerald',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    headerAccent: 'text-emerald-700'
  },
  nutrition: {
    id: 'nutrition',
    name: 'IronFuel Nutrition',
    subtitle: 'Nutrition Sportive Elite',
    tagline: 'Performance Sportive Elite & Protéines • produit_myshops_nutrition',
    icon: '⚡',
    colorName: 'amber',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    headerAccent: 'text-amber-700'
  },
  cosmetic: {
    id: 'cosmetic',
    name: 'Cosmetics Shop',
    subtitle: 'Beauté, Soins & Luxe',
    tagline: 'Soins, Beauté & Parfumerie de Luxe • produit_myshops_cosmetique',
    icon: '💄',
    colorName: 'rose',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
    headerAccent: 'text-rose-700'
  },
  electro: {
    id: 'electro',
    name: 'Electro Shop',
    subtitle: 'High-Tech & Électroménager',
    tagline: 'High-Tech, Informatique & Électroménager • produit_myshops_electro',
    icon: '🔌',
    colorName: 'blue',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
    headerAccent: 'text-blue-700'
  }
};

interface DedicatedFilialeBackofficeProps {
  filialeId: FilialeId;
  onBackToHq: () => void;
  onSelectFiliale: (filialeId: FilialeId) => void;
  onGoToStorefront: (shopId?: FilialeId) => void;
  currentUser: any;
  onLogout: () => void;
}

export const DedicatedFilialeBackoffice: React.FC<DedicatedFilialeBackofficeProps> = ({
  filialeId,
  onBackToHq,
  onSelectFiliale,
  onGoToStorefront,
  currentUser,
  onLogout
}) => {
  const safeShopId: FilialeId = (typeof filialeId === 'string' && ['para', 'nutrition', 'cosmetic', 'electro'].includes(filialeId as FilialeId))
    ? (filialeId as FilialeId)
    : 'para';
  const meta = FILIALES_CONFIG[safeShopId] || FILIALES_CONFIG.para;

  // Lightweight state dedicated ONLY to this filiale
  const [data, setData] = useState<any>({
    products: [],
    categories: [],
    packs: [],
    orders: [],
    messages: [],
    ads: {},
    promos: [],
    stores: [],
    brands: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    const loadFilialeData = async () => {
      setIsLoading(true);
      try {
        // Synchronize active shop in cookie and backend
        document.cookie = `shop=${safeShopId}; path=/; max-age=31536000; SameSite=Lax`;
        await fetch('/api/set-shop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shop: safeShopId })
        }).catch(() => {});

        const headers = { 'x-shop-id': safeShopId };
        const [
          prodsRes, catsRes, packsRes, ordersRes, msgsRes, adsRes, promosRes, storesRes, brandsRes
        ] = await Promise.all([
          fetch(`/api/products?shop=${safeShopId}`, { headers }).then(r => r.ok ? r.json() : []).catch(() => []),
          fetch(`/api/categories?shop=${safeShopId}`, { headers }).then(r => r.ok ? r.json() : []).catch(() => []),
          fetch(`/api/packs?shop=${safeShopId}`, { headers }).then(r => r.ok ? r.json() : []).catch(() => []),
          fetch(`/api/orders?shop=${safeShopId}`, { headers }).then(r => r.ok ? r.json() : []).catch(() => []),
          fetch(`/api/contact?shop=${safeShopId}`, { headers }).then(r => r.ok ? r.json() : []).catch(() => []),
          fetch(`/api/advertisements?shop=${safeShopId}`, { headers }).then(r => r.ok ? r.json() : {}).catch(() => ({})),
          fetch(`/api/promotions?shop=${safeShopId}`, { headers }).then(r => r.ok ? r.json() : []).catch(() => []),
          fetch(`/api/stores?shop=${safeShopId}`, { headers }).then(r => r.ok ? r.json() : []).catch(() => []),
          fetch(`/api/brands?shop=${safeShopId}`, { headers }).then(r => r.ok ? r.json() : []).catch(() => [])
        ]);

        if (!isCancelled) {
          setData({
            products: Array.isArray(prodsRes) ? prodsRes : [],
            categories: Array.isArray(catsRes) ? catsRes : [],
            packs: Array.isArray(packsRes) ? packsRes : [],
            orders: Array.isArray(ordersRes) ? ordersRes : [],
            messages: Array.isArray(msgsRes) ? msgsRes : [],
            ads: adsRes || {},
            promos: Array.isArray(promosRes) ? promosRes : [],
            stores: Array.isArray(storesRes) ? storesRes : [],
            brands: Array.isArray(brandsRes) ? brandsRes : []
          });
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error loading filiale backoffice data:', err);
        if (!isCancelled) setIsLoading(false);
      }
    };

    loadFilialeData();
    return () => { isCancelled = true; };
  }, [safeShopId]);

  // Updaters passed to the original AdminPage components
  const setProductsData = (action: any) => {
    setData((prev: any) => ({
      ...prev,
      products: typeof action === 'function' ? action(prev.products) : action
    }));
  };
  const setCategoriesData = (action: any) => {
    setData((prev: any) => ({
      ...prev,
      categories: typeof action === 'function' ? action(prev.categories) : action
    }));
  };
  const setPacksData = (action: any) => {
    setData((prev: any) => ({
      ...prev,
      packs: typeof action === 'function' ? action(prev.packs) : action
    }));
  };
  const setOrdersData = (action: any) => {
    setData((prev: any) => ({
      ...prev,
      orders: typeof action === 'function' ? action(prev.orders) : action
    }));
  };
  const setMessagesData = (action: any) => {
    setData((prev: any) => ({
      ...prev,
      messages: typeof action === 'function' ? action(prev.messages) : action
    }));
  };
  const setAdvertisementsData = (action: any) => {
    setData((prev: any) => ({
      ...prev,
      ads: typeof action === 'function' ? action(prev.ads) : action
    }));
  };
  const setPromotionsData = (action: any) => {
    setData((prev: any) => ({
      ...prev,
      promos: typeof action === 'function' ? action(prev.promos) : action
    }));
  };
  const setStoresData = (action: any) => {
    setData((prev: any) => ({
      ...prev,
      stores: typeof action === 'function' ? action(prev.stores) : action
    }));
  };
  const setBrandsData = (action: any) => {
    setData((prev: any) => ({
      ...prev,
      brands: typeof action === 'function' ? action(prev.brands) : action
    }));
  };

  const filialeKeys: FilialeId[] = ['para', 'nutrition', 'cosmetic', 'electro'];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans w-full">
      
      {/* 1. ULTRA-LEAN WORKSPACE TOP BAR (Decoupled, zero nesting) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 shadow-xs">
        
        {/* Left: Return to HQ & Filiale Identity */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToHq}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer group"
            title="Revenir au Tableau de Bord Consolidé du Groupe"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">QG MultiShop</span>
            <span className="sm:hidden">QG</span>
          </button>

          <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>

          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl">{meta.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                  {meta.name}
                </h1>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.badgeClass} hidden md:inline`}>
                  Backoffice Dédié
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-normal hidden lg:block">
                {meta.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Fast Workspace Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 overflow-x-auto no-scrollbar max-w-[200px] sm:max-w-md lg:max-w-none">
          <button
            type="button"
            onClick={onBackToHq}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white transition-all cursor-pointer whitespace-nowrap"
          >
            <span>🏢</span>
            <span className="hidden xl:inline">QG Consolidé</span>
          </button>
          
          {filialeKeys.map((key) => {
            const f = FILIALES_CONFIG[key];
            const isActive = safeShopId === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onSelectFiliale(key)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <span>{f.icon}</span>
                <span className="hidden md:inline">{f.name}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Storefront View & User Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => onGoToStorefront(safeShopId)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition-all cursor-pointer whitespace-nowrap"
          >
            <Store className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Voir la boutique</span>
          </button>

          {/* User profile button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-1.5 p-1 pl-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center uppercase shadow-xs">
                {currentUser?.firstName?.[0] || currentUser?.email?.[0] || 'A'}
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim() : 'Super Admin'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">{currentUser?.email || 'admin@multishop.com'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onBackToHq();
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2 mt-1 cursor-pointer"
                >
                  <span>🏢 Revenir au QG</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onLogout();
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Déconnexion</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. DEDICATED FULL-SCREEN WORKSPACE CONTENT */}
      <main className="flex-1 w-full relative">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-xs font-semibold text-slate-500">
              Chargement du backoffice {meta.name}...
            </p>
          </div>
        ) : (
          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-xs font-semibold text-slate-500">Initialisation de l'espace de gestion...</p>
              </div>
            }
          >
            {safeShopId === 'para' && (
              <ParaThemeProvider>
                <ParaToastProvider>
                  <ParaCartProvider>
                    <ParaFavoritesProvider>
                      <ParaCompareProvider>
                        <ParaAdminPage
                          onNavigateHome={() => onGoToStorefront('para')}
                          onLogout={onLogout}
                          productsData={data.products}
                          setProductsData={setProductsData}
                          categoriesData={data.categories}
                          setCategoriesData={setCategoriesData}
                          packsData={data.packs}
                          setPacksData={setPacksData}
                          ordersData={data.orders}
                          setOrdersData={setOrdersData}
                          messagesData={data.messages}
                          setMessagesData={setMessagesData}
                          advertisementsData={data.ads}
                          setAdvertisementsData={setAdvertisementsData}
                          promotionsData={data.promos}
                          setPromotionsData={setPromotionsData}
                          storesData={data.stores}
                          setStoresData={setStoresData}
                          brandsData={data.brands}
                          setBrandsData={setBrandsData}
                        />
                      </ParaCompareProvider>
                    </ParaFavoritesProvider>
                  </ParaCartProvider>
                </ParaToastProvider>
              </ParaThemeProvider>
            )}

            {safeShopId === 'nutrition' && (
              <NutritionThemeProvider>
                <NutritionToastProvider>
                  <NutritionCartProvider>
                    <NutritionFavoritesProvider>
                      <NutritionCompareProvider>
                        <NutritionAdminPage
                          onNavigateHome={() => onGoToStorefront('nutrition')}
                          onLogout={onLogout}
                          productsData={data.products}
                          setProductsData={setProductsData}
                          categoriesData={data.categories}
                          setCategoriesData={setCategoriesData}
                          packsData={data.packs}
                          setPacksData={setPacksData}
                          ordersData={data.orders}
                          setOrdersData={setOrdersData}
                          messagesData={data.messages}
                          setMessagesData={setMessagesData}
                          advertisementsData={data.ads}
                          setAdvertisementsData={setAdvertisementsData}
                          promotionsData={data.promos}
                          setPromotionsData={setPromotionsData}
                          storesData={data.stores}
                          setStoresData={setStoresData}
                          brandsData={data.brands}
                          setBrandsData={setBrandsData}
                        />
                      </NutritionCompareProvider>
                    </NutritionFavoritesProvider>
                  </NutritionCartProvider>
                </NutritionToastProvider>
              </NutritionThemeProvider>
            )}

            {safeShopId === 'cosmetic' && (
              <CosmeticThemeProvider>
                <CosmeticToastProvider>
                  <CosmeticCartProvider>
                    <CosmeticFavoritesProvider>
                      <CosmeticCompareProvider>
                        <CosmeticAdminPage
                          onNavigateHome={() => onGoToStorefront('cosmetic')}
                          onLogout={onLogout}
                          productsData={data.products}
                          setProductsData={setProductsData}
                          categoriesData={data.categories}
                          setCategoriesData={setCategoriesData}
                          packsData={data.packs}
                          setPacksData={setPacksData}
                          ordersData={data.orders}
                          setOrdersData={setOrdersData}
                          messagesData={data.messages}
                          setMessagesData={setMessagesData}
                          advertisementsData={data.ads}
                          setAdvertisementsData={setAdvertisementsData}
                          promotionsData={data.promos}
                          setPromotionsData={setPromotionsData}
                          storesData={data.stores}
                          setStoresData={setStoresData}
                          brandsData={data.brands}
                          setBrandsData={setBrandsData}
                        />
                      </CosmeticCompareProvider>
                    </CosmeticFavoritesProvider>
                  </CosmeticCartProvider>
                </CosmeticToastProvider>
              </CosmeticThemeProvider>
            )}

            {safeShopId === 'electro' && (
              <ElectroThemeProvider>
                <ElectroToastProvider>
                  <ElectroCartProvider>
                    <ElectroFavoritesProvider>
                      <ElectroCompareProvider>
                        <ElectroAdminPage
                          onNavigateHome={() => onGoToStorefront('electro')}
                          onLogout={onLogout}
                          productsData={data.products}
                          setProductsData={setProductsData}
                          categoriesData={data.categories}
                          setCategoriesData={setCategoriesData}
                          packsData={data.packs}
                          setPacksData={setPacksData}
                          ordersData={data.orders}
                          setOrdersData={setOrdersData}
                          messagesData={data.messages}
                          setMessagesData={setMessagesData}
                          advertisementsData={data.ads}
                          setAdvertisementsData={setAdvertisementsData}
                          promotionsData={data.promos}
                          setPromotionsData={setPromotionsData}
                          storesData={data.stores}
                          setStoresData={setStoresData}
                        />
                      </ElectroCompareProvider>
                    </ElectroFavoritesProvider>
                  </ElectroCartProvider>
                </ElectroToastProvider>
              </ElectroThemeProvider>
            )}
          </Suspense>
        )}
      </main>
    </div>
  );
};
