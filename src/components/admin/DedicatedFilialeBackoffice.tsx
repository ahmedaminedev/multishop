import React, { useState, useEffect, Suspense } from 'react';
import { ArrowLeft, Store, Shield, LogOut, ChevronDown, Sparkles } from 'lucide-react';
import { FilialeId } from '../../models/ProductFiliale';

// Context providers for dedicated sub-backoffices
import { ThemeProvider as NutritionThemeProvider } from '@/templates/nutrition/components/ThemeContext';
import { ToastProvider as NutritionToastProvider } from '@/templates/nutrition/components/ToastContext';
import { CartProvider as NutritionCartProvider } from '@/templates/nutrition/components/CartContext';
import { FavoritesProvider as NutritionFavoritesProvider } from '@/templates/nutrition/components/FavoritesContext';
import { CompareProvider as NutritionCompareProvider } from '@/templates/nutrition/components/CompareContext';

import { ThemeProvider as YoupiThemeProvider } from '@/templates/youpi/components/ThemeContext';
import { ToastProvider as YoupiToastProvider } from '@/templates/youpi/components/ToastContext';
import { CartProvider as YoupiCartProvider } from '@/templates/youpi/components/CartContext';
import { FavoritesProvider as YoupiFavoritesProvider } from '@/templates/youpi/components/FavoritesContext';
import { CompareProvider as YoupiCompareProvider } from '@/templates/youpi/components/CompareContext';

// Lazy loaded sub-backoffices
const NutritionAdminPage = React.lazy(() => import('@/templates/nutrition/components/admin/AdminPage').then(m => ({ default: m.AdminPage })));
const YoupiAdminPage = React.lazy(() => import('@/templates/youpi/components/admin/AdminPage').then(m => ({ default: m.AdminPage })));

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
  nutrition: {
    id: 'nutrition',
    name: 'Fitness Shop',
    subtitle: 'Musculation & Fitness',
    tagline: 'Équipements de Musculation, Cardio & Fitness • produit_myshops_nutrition',
    icon: '🏋️‍♂️',
    colorName: 'lime',
    badgeClass: 'bg-lime-50 text-lime-800 border-lime-200',
    headerAccent: 'text-lime-700'
  },
  youpi: {
    id: 'youpi',
    name: 'YoupiShop',
    subtitle: "Jeux d'Enfants & Jouets",
    tagline: "Jeux d'éveil, Lego, Jeux de société & Plein air • produit_myshops_youpi",
    icon: '🧸',
    colorName: 'amber',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    headerAccent: 'text-amber-700'
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
  const safeShopId: FilialeId = (typeof filialeId === 'string' && ['nutrition', 'youpi'].includes(filialeId as FilialeId))
    ? (filialeId as FilialeId)
    : 'nutrition';
  const meta = FILIALES_CONFIG[safeShopId] || FILIALES_CONFIG.nutrition;

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

    const handleDataChanged = (e: any) => {
      const shopKey = e.detail?.shopKey || e.detail?.shopId;
      if (!shopKey || shopKey === safeShopId || shopKey === 'all') {
        loadFilialeData();
      }
    };

    const handleShopStats = (e: any) => {
      const shopKey = e.detail?.shopKey;
      if (!shopKey || shopKey === safeShopId || shopKey === 'all') {
        loadFilialeData();
      }
    };

    window.addEventListener('multishop_data_changed', handleDataChanged);
    window.addEventListener('stats_updated', loadFilialeData);
    window.addEventListener('shop_stats_updated', handleShopStats);

    return () => { 
      isCancelled = true; 
      window.removeEventListener('multishop_data_changed', handleDataChanged);
      window.removeEventListener('stats_updated', loadFilialeData);
      window.removeEventListener('shop_stats_updated', handleShopStats);
    };
  }, [safeShopId]);

  // Dynamic real-time metrics computed 100% from database
  const validOrders = (data.orders || []).filter((o: any) => o.status !== 'Annulée' && o.status !== 'annulé');
  const revenue = validOrders.reduce((sum: number, o: any) => sum + (Number(o.total || o.totalAmount) || 0), 0);
  const pendingOrders = (data.orders || []).filter((o: any) => ['En attente', 'en_attente', 'Expédiée', 'confirmé'].includes(o.status)).length;
  const lowStockCount = (data.products || []).filter((p: any) => (Number(p.quantité_enstock ?? p.quantity) || 0) <= 5).length;

  // Updaters passed to the AdminPage components
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

  const filialeKeys: FilialeId[] = ['nutrition', 'youpi'];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans w-full">
      {/* 1. ULTRA-LEAN WORKSPACE TOP BAR */}
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
            <span>QG Global</span>
          </button>

          {filialeKeys.map(fKey => {
            const fMeta = FILIALES_CONFIG[fKey];
            const isCurrent = fKey === safeShopId;
            return (
              <button
                key={fKey}
                type="button"
                onClick={() => onSelectFiliale(fKey)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isCurrent
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <span>{fMeta.icon}</span>
                <span>{fMeta.name}</span>
                {isCurrent && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Storefront View & Admin Profile */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onGoToStorefront(safeShopId)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            title={`Ouvrir la boutique ${meta.name}`}
          >
            <Store className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Vitrine {meta.name}</span>
            <span className="sm:hidden">Vitrine</span>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
            >
              <div className="w-7 h-7 rounded-lg bg-purple-600 text-white font-bold text-xs flex items-center justify-center uppercase shadow-xs">
                {currentUser?.firstName?.[0] || 'A'}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-fadeIn text-xs">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="font-bold text-slate-900 truncate">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                </div>
                <div className="p-1">
                  <button
                    type="button"
                    onClick={onBackToHq}
                    className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                  >
                    🏢 Revenir au QG Groupe
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 font-medium flex items-center gap-2 cursor-pointer mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Real-time Filiale Performance Strip */}
      <div className="bg-slate-900 text-white px-3 sm:px-6 py-2 text-xs border-b border-slate-800 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-3 sm:gap-6 whitespace-nowrap">
          <span className="flex items-center gap-1.5 font-bold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Ventes {meta.name} : {revenue.toLocaleString('fr-FR')} DT
          </span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="text-slate-300 font-medium">
            Commandes : <strong className="text-white">{data.orders.length}</strong> ({pendingOrders} en attente)
          </span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="text-slate-300 font-medium">
            Articles : <strong className="text-white">{data.products.length}</strong>
          </span>
          {lowStockCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
              ⚠️ {lowStockCount} stock faible
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 hidden md:inline">
          Sync Flux Base 100%
        </span>
      </div>

      {/* 2. MAIN BACKOFFICE CONTENT */}
      <main className="flex-1 w-full">
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

            {safeShopId === 'youpi' && (
              <YoupiThemeProvider>
                <YoupiToastProvider>
                  <YoupiCartProvider>
                    <YoupiFavoritesProvider>
                      <YoupiCompareProvider>
                        <YoupiAdminPage
                          onNavigateHome={() => onGoToStorefront('youpi')}
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
                      </YoupiCompareProvider>
                    </YoupiFavoritesProvider>
                  </YoupiCartProvider>
                </YoupiToastProvider>
              </YoupiThemeProvider>
            )}
          </Suspense>
        )}
      </main>
    </div>
  );
};
