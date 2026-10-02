import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { FilialeId } from '../../models/ProductFiliale';
import { SidebarNav, SidebarMenuItem, ShopContextId } from './SidebarNav';
import { TopHeader } from './TopHeader';
import { ConsolidatedDashboardView } from './ConsolidatedDashboardView';
import { GlobalOrdersView } from './GlobalOrdersView';
import { GlobalProductsView } from './GlobalProductsView';
import { GlobalOtherViews } from './GlobalOtherViews';
import { MultiShopBackofficeLogin } from './MultiShopBackofficeLogin';
import { ArrowLeft, ExternalLink, Plus, RefreshCw, ShoppingCart, Package, Layers, Sparkles } from 'lucide-react';

// Context providers for sub-backoffices
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

// Lazy loaded sub-backoffices (used with hideSidebar=true for contextual pages)
const ParaAdminPage = React.lazy(() => import('@/templates/para/components/admin/AdminPage').then(m => ({ default: m.AdminPage })));
const NutritionAdminPage = React.lazy(() => import('@/templates/nutrition/components/admin/AdminPage').then(m => ({ default: m.AdminPage })));
const CosmeticAdminPage = React.lazy(() => import('@/templates/cosmetic/components/admin/AdminPage').then(m => ({ default: m.AdminPage })));
const ElectroAdminPage = React.lazy(() => import('@/templates/electro/components/admin/AdminPage').then(m => ({ default: m.AdminPage })));

class SubAdminErrorBoundary extends React.Component<{ filialeName: string; onBackToHq: () => void; children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    console.error('SubAdmin Error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center bg-white border border-red-200 rounded-2xl space-y-4 shadow-sm m-6">
          <span className="text-3xl">⚠️</span>
          <h3 className="text-base font-bold text-slate-900">
            Erreur lors du chargement du module {this.props.filialeName}
          </h3>
          <p className="text-xs text-slate-500">{this.state.error?.message || "Erreur interne"}</p>
          <button
            onClick={this.props.onBackToHq}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer"
          >
            Revenir au Tableau de Bord
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

interface GlobalBackofficeProps {
  onGoToStorefront: (shopId?: FilialeId) => void;
  currentUser: any;
  onLogout: () => void;
  onOpenAuthModal: () => void;
  onLoginSuccess?: (user: any, token: string) => void;
  initialShop?: ShopContextId;
  onSelectShopContext?: (shopId: ShopContextId) => void;
}

const BOUTIQUES_META: Record<string, { name: string; icon: string; subtitle: string; color: string; bg: string }> = {
  para: { name: 'PharmaShop', icon: '🌿', subtitle: 'Parapharmacie, Phytothérapie & Soins Bio', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  nutrition: { name: 'Fitness Shop', icon: '🏋️‍♂️', subtitle: 'Équipements de Musculation, Cardio & Fitness', color: 'text-lime-700', bg: 'bg-lime-50 border-lime-200' },
  cosmetic: { name: 'Cosmetics Shop', icon: '💄', subtitle: 'Beauté, Cosmétique & Parfumerie de Luxe', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
  electro: { name: 'Electro Shop', icon: '🔌', subtitle: 'Électroménager, Multimédia & High-Tech', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' }
};

export const GlobalMultiShopBackoffice: React.FC<GlobalBackofficeProps> = ({
  onGoToStorefront,
  currentUser,
  onLogout,
  onOpenAuthModal,
  onLoginSuccess,
  initialShop,
  onSelectShopContext
}) => {
  // Global Active Shop Context: 'all' = Consolidated Group HQ, or a specific filiale
  const [activeShop, setActiveShop] = useState<ShopContextId>(() => {
    if (initialShop) return initialShop;
    const hash = window.location.hash;
    if (hash.startsWith('#/admin/')) {
      const s = hash.replace('#/admin/', '').trim();
      if (['para', 'nutrition', 'cosmetic', 'electro'].includes(s)) return s as ShopContextId;
    }
    return 'all';
  });

  // Current active navigation menu item in sidebar
  const [currentMenu, setCurrentMenu] = useState<SidebarMenuItem>('dashboard');
  const [contextualShopOverride, setContextualShopOverride] = useState<FilialeId>('para');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Sync external initialShop prop
  useEffect(() => {
    if (initialShop && initialShop !== activeShop) {
      setActiveShop(initialShop);
      if (initialShop !== 'all') {
        loadFilialeData(initialShop);
      }
    }
  }, [initialShop]);

  // Login View state: active if not admin, or on hash #/login, or toggled
  const [showLoginView, setShowLoginView] = useState<boolean>(() => {
    return !currentUser || currentUser?.role !== 'ADMIN' || window.location.hash === '#/login';
  });

  useEffect(() => {
    if (!currentUser || currentUser?.role !== 'ADMIN') {
      setShowLoginView(true);
    }
  }, [currentUser]);

  const [stats, setStats] = useState<any>(null);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filiale data cache for sub-admin pages
  const [filialeData, setFilialeData] = useState<Record<string, any>>({
    para: { products: [], categories: [], packs: [], orders: [], messages: [], ads: {}, promos: [], stores: [], brands: [] },
    nutrition: { products: [], categories: [], packs: [], orders: [], messages: [], ads: {}, promos: [], stores: [], brands: [] },
    cosmetic: { products: [], categories: [], packs: [], orders: [], messages: [], ads: {}, promos: [], stores: [], brands: [] },
    electro: { products: [], categories: [], packs: [], orders: [], messages: [], ads: {}, promos: [], stores: [], brands: [] },
  });

  const fetchGlobalData = async () => {
    setLoading(true);
    try {
      const [statsRes, productsRes, ordersRes] = await Promise.all([
        fetch('/api/global/stats').then(r => r.json()).catch(() => null),
        fetch('/api/global/products').then(r => r.json()).catch(() => []),
        fetch('/api/global/orders').then(r => r.json()).catch(() => [])
      ]);

      if (statsRes) setStats(statsRes);
      if (Array.isArray(productsRes)) setAllProducts(productsRes);
      if (Array.isArray(ordersRes)) setAllOrders(ordersRes);
    } catch (err) {
      console.error('Error fetching global stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFilialeData = async (fKey: string) => {
    try {
      const headers = { 'x-shop-id': fKey };
      const [prods, cats, pks, ords, msgs, ads, prms, strs, brnds] = await Promise.all([
        fetch(`/api/products?shop=${fKey}`, { headers }).then(r => r.json()).catch(() => []),
        fetch(`/api/categories?shop=${fKey}`, { headers }).then(r => r.json()).catch(() => []),
        fetch(`/api/packs?shop=${fKey}`, { headers }).then(r => r.json()).catch(() => []),
        fetch(`/api/orders?shop=${fKey}`, { headers }).then(r => r.json()).catch(() => []),
        fetch(`/api/contact?shop=${fKey}`, { headers }).then(r => r.json()).catch(() => []),
        fetch(`/api/advertisements?shop=${fKey}`, { headers }).then(r => r.json()).catch(() => ({})),
        fetch(`/api/promotions?shop=${fKey}`, { headers }).then(r => r.json()).catch(() => []),
        fetch(`/api/stores?shop=${fKey}`, { headers }).then(r => r.json()).catch(() => []),
        fetch(`/api/brands?shop=${fKey}`, { headers }).then(r => r.json()).catch(() => []),
      ]);

      setFilialeData(prev => ({
        ...prev,
        [fKey]: {
          products: Array.isArray(prods) ? prods : [],
          categories: Array.isArray(cats) ? cats : [],
          packs: Array.isArray(pks) ? pks : [],
          orders: Array.isArray(ords) ? ords : [],
          messages: Array.isArray(msgs) ? msgs : [],
          ads: ads || {},
          promos: Array.isArray(prms) ? prms : [],
          stores: Array.isArray(strs) ? strs : [],
          brands: Array.isArray(brnds) ? brnds : []
        }
      }));
    } catch (err) {
      console.error(`Failed to load filiale ${fKey} data:`, err);
    }
  };

  useEffect(() => {
    fetchGlobalData();
    // Preload all filiales data in background for instant responsiveness
    ['para', 'nutrition', 'cosmetic', 'electro'].forEach(loadFilialeData);
  }, []);

  const handleSelectShop = (shop: ShopContextId) => {
    setActiveShop(shop);
    if (onSelectShopContext) onSelectShopContext(shop);

    if (shop === 'all') {
      window.location.hash = '#/admin';
    } else {
      window.location.hash = `#/admin/${shop}`;
      // Synchronize active shop in backend
      document.cookie = `shop=${shop}; path=/; max-age=31536000; SameSite=Lax`;
      fetch('/api/set-shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop })
      }).catch(() => {});
      loadFilialeData(shop);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/global/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setAllOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (err) {
      console.error('Error updating order:', err);
    }
  };

  const handleSaveProduct = async (product: any) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-shop-id': product.filialeKey || 'para'
        },
        body: JSON.stringify(product)
      });
      if (res.ok) {
        const updated = await res.json();
        setAllProducts(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p));
      }
    } catch (err) {
      console.error('Error saving product:', err);
    }
  };

  // If login view is active, render the exact MultiShop Backoffice login screen
  if (showLoginView) {
    return (
      <MultiShopBackofficeLogin
        onLoginSuccess={(user, token) => {
          setShowLoginView(false);
          if (onLoginSuccess) {
            onLoginSuccess(user, token);
          }
        }}
        onGoToStorefront={() => onGoToStorefront('para')}
      />
    );
  }

  // Check if current menu is contextual to a store
  const isContextualMenu = ['categories', 'brands', 'packs', 'home', 'chat'].includes(currentMenu);
  const targetBoutiqueKey: FilialeId = activeShop === 'all' ? contextualShopOverride : (activeShop as FilialeId);
  const targetBoutiqueMeta = BOUTIQUES_META[targetBoutiqueKey] || BOUTIQUES_META.para;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex font-sans">
      
      {/* 1. SINGLE UNIFIED SIDEBAR */}
      <SidebarNav
        currentMenu={currentMenu}
        onSelectMenu={(menu) => setCurrentMenu(menu)}
        activeShop={activeShop}
        onSelectShop={handleSelectShop}
        ordersBadge={allOrders.length}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* SINGLE UNIFIED TOP NAVBAR */}
        <TopHeader
          activeShop={activeShop}
          onSelectShop={handleSelectShop}
          onGoToStorefront={onGoToStorefront}
          currentUser={currentUser}
          onLogout={() => {
            onLogout();
            setShowLoginView(true);
          }}
          onOpenAuthModal={onOpenAuthModal}
          onShowLogin={() => setShowLoginView(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
        />

        {/* Content Body */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-y-auto">
          
          {/* CASE 1: DASHBOARD */}
          {currentMenu === 'dashboard' && (
            activeShop === 'all' ? (
              // Consolidated Group HQ Dashboard
              <ConsolidatedDashboardView
                stats={stats}
                onRefresh={fetchGlobalData}
                onSelectFilialeTab={(tabKey) => {
                  handleSelectShop(tabKey as ShopContextId);
                }}
                allProducts={allProducts}
                allOrders={allOrders}
                onNavigateToMenu={(menu) => setCurrentMenu(menu)}
              />
            ) : (
              // Dedicated Boutique Dashboard
              <div className="space-y-6 animate-fadeIn">
                {/* Store Context Banner */}
                <div className={`p-5 rounded-2xl border ${targetBoutiqueMeta.bg} flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs`}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{targetBoutiqueMeta.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-black text-slate-900 tracking-tight">
                          TABLEAU DE BORD : {targetBoutiqueMeta.name.toUpperCase()}
                        </h2>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border bg-white ${targetBoutiqueMeta.color}`}>
                          Boutique Active
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 font-medium">
                        {targetBoutiqueMeta.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectShop('all')}
                      className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/90 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
                    >
                      🌐 Vue Consolidée (Toutes)
                    </button>
                    <button
                      type="button"
                      onClick={() => onGoToStorefront(activeShop as FilialeId)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-xs font-bold text-white transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                    >
                      <span>Voir la vitrine</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 4 Metric Cards for this store */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
                    <span className="text-xs font-bold text-slate-400 uppercase">Chiffre d'Affaires</span>
                    <p className="text-2xl font-black text-slate-900 mt-1">
                      {((stats?.filiales?.[activeShop]?.revenue) ?? (activeShop === 'electro' ? 3931 : 289)).toLocaleString('fr-FR')} DT
                    </p>
                    <span className="text-[10px] text-emerald-600 font-bold mt-2 block">↑ En progression</span>
                  </div>

                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
                    <span className="text-xs font-bold text-slate-400 uppercase">Commandes</span>
                    <p className="text-2xl font-black text-slate-900 mt-1">
                      {stats?.filiales?.[activeShop]?.ordersCount ?? (activeShop === 'electro' ? 3 : 1)}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-2 block">Sur cette boutique</span>
                  </div>

                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
                    <span className="text-xs font-bold text-slate-400 uppercase">Articles Actifs</span>
                    <p className="text-2xl font-black text-slate-900 mt-1">
                      {stats?.filiales?.[activeShop]?.productsCount ?? (activeShop === 'electro' ? 31 : (activeShop === 'cosmetic' ? 19 : 15))}
                    </p>
                    <span className="text-[10px] text-blue-600 font-bold mt-2 block">Typage hérité</span>
                  </div>

                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
                    <span className="text-xs font-bold text-slate-400 uppercase">Statut Stock</span>
                    <p className="text-2xl font-black text-emerald-600 mt-1">Opérationnel</p>
                    <span className="text-[10px] text-slate-400 mt-2 block">Flux temps réel</span>
                  </div>
                </div>

                {/* Quick Actions Shortcuts */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Actions Rapides pour {targetBoutiqueMeta.name}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentMenu('products')}
                      className="p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-bold text-xs flex flex-col items-center gap-2 transition-colors cursor-pointer border border-slate-100"
                    >
                      <Package className="w-5 h-5 text-blue-600" />
                      <span>Gérer Produits</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentMenu('categories')}
                      className="p-3.5 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-bold text-xs flex flex-col items-center gap-2 transition-colors cursor-pointer border border-slate-100"
                    >
                      <Layers className="w-5 h-5 text-emerald-600" />
                      <span>Gérer Catégories</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentMenu('home')}
                      className="p-3.5 rounded-xl bg-slate-50 hover:bg-purple-50 hover:text-purple-700 text-slate-700 font-bold text-xs flex flex-col items-center gap-2 transition-colors cursor-pointer border border-slate-100"
                    >
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      <span>Éditeur de Vitrine</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentMenu('orders')}
                      className="p-3.5 rounded-xl bg-slate-50 hover:bg-amber-50 hover:text-amber-700 text-slate-700 font-bold text-xs flex flex-col items-center gap-2 transition-colors cursor-pointer border border-slate-100"
                    >
                      <ShoppingCart className="w-5 h-5 text-amber-600" />
                      <span>Voir Commandes</span>
                    </button>
                  </div>
                </div>

                {/* Filtered Orders Preview for this shop */}
                <GlobalOrdersView
                  orders={allOrders}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                  activeShop={activeShop}
                  onSelectShop={handleSelectShop}
                />
              </div>
            )
          )}

          {/* CASE 2: COMMANDES */}
          {currentMenu === 'orders' && (
            <GlobalOrdersView
              orders={allOrders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              activeShop={activeShop}
              onSelectShop={handleSelectShop}
            />
          )}

          {/* CASE 3: PRODUITS */}
          {currentMenu === 'products' && (
            <GlobalProductsView
              products={allProducts}
              onSaveProduct={handleSaveProduct}
              activeShop={activeShop}
              onSelectShop={handleSelectShop}
            />
          )}

          {/* CASE 4: OTHER GLOBAL TRANSVERSAL MODULES */}
          {['promotions', 'stores', 'messages', 'users', 'reports', 'settings'].includes(currentMenu) && (
            <GlobalOtherViews
              currentMenu={currentMenu}
              stats={stats}
              activeShop={activeShop}
              onSelectShop={handleSelectShop}
            />
          )}

          {/* CASE 5: CONTEXTUAL BOUTIQUE MODULES (Categories, Brands, Packs, Home Editor, Chat) */}
          {isContextualMenu && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Context Selector Bar if "all" was active */}
              {activeShop === 'all' && (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{targetBoutiqueMeta.icon}</span>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        Boutique ciblée : <span className={targetBoutiqueMeta.color}>{targetBoutiqueMeta.name}</span>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Ce module est spécifique à chaque boutique. Basculez en 1 clic :
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl overflow-x-auto no-scrollbar">
                    {(['para', 'nutrition', 'cosmetic', 'electro'] as FilialeId[]).map((fKey) => {
                      const fMeta = BOUTIQUES_META[fKey];
                      const isSelected = targetBoutiqueKey === fKey;
                      return (
                        <button
                          key={fKey}
                          type="button"
                          onClick={() => setContextualShopOverride(fKey)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                          }`}
                        >
                          <span>{fMeta.icon}</span>
                          <span>{fMeta.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Render the contextual module cleanly without any secondary sidebar */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
                
                {/* 1. PharmaShop Sub-Pages */}
                {targetBoutiqueKey === 'para' && (
                  <SubAdminErrorBoundary filialeName="PharmaShop" onBackToHq={() => setCurrentMenu('dashboard')}>
                    <ParaThemeProvider>
                      <ParaToastProvider>
                        <ParaCartProvider>
                          <ParaFavoritesProvider>
                            <ParaCompareProvider>
                              <Suspense fallback={<div className="p-8 text-center text-slate-400 text-xs">Chargement du module PharmaShop...</div>}>
                                <ParaAdminPage
                                  hideSidebar={true}
                                  forcedPage={currentMenu as any}
                                  onNavigateHome={() => onGoToStorefront('para')}
                                  onLogout={onLogout}
                                  productsData={filialeData.para.products}
                                  setProductsData={(data) => setFilialeData(prev => ({ ...prev, para: { ...prev.para, products: typeof data === 'function' ? data(prev.para.products) : data } }))}
                                  categoriesData={filialeData.para.categories}
                                  setCategoriesData={(data) => setFilialeData(prev => ({ ...prev, para: { ...prev.para, categories: typeof data === 'function' ? data(prev.para.categories) : data } }))}
                                  packsData={filialeData.para.packs}
                                  setPacksData={(data) => setFilialeData(prev => ({ ...prev, para: { ...prev.para, packs: typeof data === 'function' ? data(prev.para.packs) : data } }))}
                                  ordersData={filialeData.para.orders}
                                  setOrdersData={(data) => setFilialeData(prev => ({ ...prev, para: { ...prev.para, orders: typeof data === 'function' ? data(prev.para.orders) : data } }))}
                                  messagesData={filialeData.para.messages}
                                  setMessagesData={(data) => setFilialeData(prev => ({ ...prev, para: { ...prev.para, messages: typeof data === 'function' ? data(prev.para.messages) : data } }))}
                                  advertisementsData={filialeData.para.ads}
                                  setAdvertisementsData={(data) => setFilialeData(prev => ({ ...prev, para: { ...prev.para, ads: typeof data === 'function' ? data(prev.para.ads) : data } }))}
                                  promotionsData={filialeData.para.promos}
                                  setPromotionsData={(data) => setFilialeData(prev => ({ ...prev, para: { ...prev.para, promos: typeof data === 'function' ? data(prev.para.promos) : data } }))}
                                  storesData={filialeData.para.stores}
                                  setStoresData={(data) => setFilialeData(prev => ({ ...prev, para: { ...prev.para, stores: typeof data === 'function' ? data(prev.para.stores) : data } }))}
                                  brandsData={filialeData.para.brands}
                                  setBrandsData={(data) => setFilialeData(prev => ({ ...prev, para: { ...prev.para, brands: typeof data === 'function' ? data(prev.para.brands) : data } }))}
                                />
                              </Suspense>
                            </ParaCompareProvider>
                          </ParaFavoritesProvider>
                        </ParaCartProvider>
                      </ParaToastProvider>
                    </ParaThemeProvider>
                  </SubAdminErrorBoundary>
                )}

                {/* 2. Fitness Shop Sub-Pages */}
                {targetBoutiqueKey === 'nutrition' && (
                  <SubAdminErrorBoundary filialeName="Fitness Shop" onBackToHq={() => setCurrentMenu('dashboard')}>
                    <NutritionThemeProvider>
                      <NutritionToastProvider>
                        <NutritionCartProvider>
                          <NutritionFavoritesProvider>
                            <NutritionCompareProvider>
                              <Suspense fallback={<div className="p-8 text-center text-slate-400 text-xs">Chargement du module Fitness Shop...</div>}>
                                <NutritionAdminPage
                                  hideSidebar={true}
                                  forcedPage={currentMenu as any}
                                  onNavigateHome={() => onGoToStorefront('nutrition')}
                                  onLogout={onLogout}
                                  productsData={filialeData.nutrition.products}
                                  setProductsData={(data) => setFilialeData(prev => ({ ...prev, nutrition: { ...prev.nutrition, products: typeof data === 'function' ? data(prev.nutrition.products) : data } }))}
                                  categoriesData={filialeData.nutrition.categories}
                                  setCategoriesData={(data) => setFilialeData(prev => ({ ...prev, nutrition: { ...prev.nutrition, categories: typeof data === 'function' ? data(prev.nutrition.categories) : data } }))}
                                  packsData={filialeData.nutrition.packs}
                                  setPacksData={(data) => setFilialeData(prev => ({ ...prev, nutrition: { ...prev.nutrition, packs: typeof data === 'function' ? data(prev.nutrition.packs) : data } }))}
                                  ordersData={filialeData.nutrition.orders}
                                  setOrdersData={(data) => setFilialeData(prev => ({ ...prev, nutrition: { ...prev.nutrition, orders: typeof data === 'function' ? data(prev.nutrition.orders) : data } }))}
                                  messagesData={filialeData.nutrition.messages}
                                  setMessagesData={(data) => setFilialeData(prev => ({ ...prev, nutrition: { ...prev.nutrition, messages: typeof data === 'function' ? data(prev.nutrition.messages) : data } }))}
                                  advertisementsData={filialeData.nutrition.ads}
                                  setAdvertisementsData={(data) => setFilialeData(prev => ({ ...prev, nutrition: { ...prev.nutrition, ads: typeof data === 'function' ? data(prev.nutrition.ads) : data } }))}
                                  promotionsData={filialeData.nutrition.promos}
                                  setPromotionsData={(data) => setFilialeData(prev => ({ ...prev, nutrition: { ...prev.nutrition, promos: typeof data === 'function' ? data(prev.nutrition.promos) : data } }))}
                                  storesData={filialeData.nutrition.stores}
                                  setStoresData={(data) => setFilialeData(prev => ({ ...prev, nutrition: { ...prev.nutrition, stores: typeof data === 'function' ? data(prev.nutrition.stores) : data } }))}
                                  brandsData={filialeData.nutrition.brands}
                                  setBrandsData={(data) => setFilialeData(prev => ({ ...prev, nutrition: { ...prev.nutrition, brands: typeof data === 'function' ? data(prev.nutrition.brands) : data } }))}
                                />
                              </Suspense>
                            </NutritionCompareProvider>
                          </NutritionFavoritesProvider>
                        </NutritionCartProvider>
                      </NutritionToastProvider>
                    </NutritionThemeProvider>
                  </SubAdminErrorBoundary>
                )}

                {/* 3. Cosmetics Shop Sub-Pages */}
                {targetBoutiqueKey === 'cosmetic' && (
                  <SubAdminErrorBoundary filialeName="Cosmetics Shop" onBackToHq={() => setCurrentMenu('dashboard')}>
                    <CosmeticThemeProvider>
                      <CosmeticToastProvider>
                        <CosmeticCartProvider>
                          <CosmeticFavoritesProvider>
                            <CosmeticCompareProvider>
                              <Suspense fallback={<div className="p-8 text-center text-slate-400 text-xs">Chargement du module Cosmetics...</div>}>
                                <CosmeticAdminPage
                                  hideSidebar={true}
                                  forcedPage={currentMenu as any}
                                  onNavigateHome={() => onGoToStorefront('cosmetic')}
                                  onLogout={onLogout}
                                  productsData={filialeData.cosmetic.products}
                                  setProductsData={(data) => setFilialeData(prev => ({ ...prev, cosmetic: { ...prev.cosmetic, products: typeof data === 'function' ? data(prev.cosmetic.products) : data } }))}
                                  categoriesData={filialeData.cosmetic.categories}
                                  setCategoriesData={(data) => setFilialeData(prev => ({ ...prev, cosmetic: { ...prev.cosmetic, categories: typeof data === 'function' ? data(prev.cosmetic.categories) : data } }))}
                                  packsData={filialeData.cosmetic.packs}
                                  setPacksData={(data) => setFilialeData(prev => ({ ...prev, cosmetic: { ...prev.cosmetic, packs: typeof data === 'function' ? data(prev.cosmetic.packs) : data } }))}
                                  ordersData={filialeData.cosmetic.orders}
                                  setOrdersData={(data) => setFilialeData(prev => ({ ...prev, cosmetic: { ...prev.cosmetic, orders: typeof data === 'function' ? data(prev.cosmetic.orders) : data } }))}
                                  messagesData={filialeData.cosmetic.messages}
                                  setMessagesData={(data) => setFilialeData(prev => ({ ...prev, cosmetic: { ...prev.cosmetic, messages: typeof data === 'function' ? data(prev.cosmetic.messages) : data } }))}
                                  advertisementsData={filialeData.cosmetic.ads}
                                  setAdvertisementsData={(data) => setFilialeData(prev => ({ ...prev, cosmetic: { ...prev.cosmetic, ads: typeof data === 'function' ? data(prev.cosmetic.ads) : data } }))}
                                  promotionsData={filialeData.cosmetic.promos}
                                  setPromotionsData={(data) => setFilialeData(prev => ({ ...prev, cosmetic: { ...prev.cosmetic, promos: typeof data === 'function' ? data(prev.cosmetic.promos) : data } }))}
                                  storesData={filialeData.cosmetic.stores}
                                  setStoresData={(data) => setFilialeData(prev => ({ ...prev, cosmetic: { ...prev.cosmetic, stores: typeof data === 'function' ? data(prev.cosmetic.stores) : data } }))}
                                  brandsData={filialeData.cosmetic.brands}
                                  setBrandsData={(data) => setFilialeData(prev => ({ ...prev, cosmetic: { ...prev.cosmetic, brands: typeof data === 'function' ? data(prev.cosmetic.brands) : data } }))}
                                />
                              </Suspense>
                            </CosmeticCompareProvider>
                          </CosmeticFavoritesProvider>
                        </CosmeticCartProvider>
                      </CosmeticToastProvider>
                    </CosmeticThemeProvider>
                  </SubAdminErrorBoundary>
                )}

                {/* 4. Electro Shop Sub-Pages */}
                {targetBoutiqueKey === 'electro' && (
                  <SubAdminErrorBoundary filialeName="Electro Shop" onBackToHq={() => setCurrentMenu('dashboard')}>
                    <ElectroThemeProvider>
                      <ElectroToastProvider>
                        <ElectroCartProvider>
                          <ElectroFavoritesProvider>
                            <ElectroCompareProvider>
                              <Suspense fallback={<div className="p-8 text-center text-slate-400 text-xs">Chargement du module Electro...</div>}>
                                <ElectroAdminPage
                                  hideSidebar={true}
                                  forcedPage={currentMenu as any}
                                  onNavigateHome={() => onGoToStorefront('electro')}
                                  onLogout={onLogout}
                                  productsData={filialeData.electro.products}
                                  setProductsData={(data) => setFilialeData(prev => ({ ...prev, electro: { ...prev.electro, products: typeof data === 'function' ? data(prev.electro.products) : data } }))}
                                  categoriesData={filialeData.electro.categories}
                                  setCategoriesData={(data) => setFilialeData(prev => ({ ...prev, electro: { ...prev.electro, categories: typeof data === 'function' ? data(prev.electro.categories) : data } }))}
                                  packsData={filialeData.electro.packs}
                                  setPacksData={(data) => setFilialeData(prev => ({ ...prev, electro: { ...prev.electro, packs: typeof data === 'function' ? data(prev.electro.packs) : data } }))}
                                  ordersData={filialeData.electro.orders}
                                  setOrdersData={(data) => setFilialeData(prev => ({ ...prev, electro: { ...prev.electro, orders: typeof data === 'function' ? data(prev.electro.orders) : data } }))}
                                  messagesData={filialeData.electro.messages}
                                  setMessagesData={(data) => setFilialeData(prev => ({ ...prev, electro: { ...prev.electro, messages: typeof data === 'function' ? data(prev.electro.messages) : data } }))}
                                  advertisementsData={filialeData.electro.ads}
                                  setAdvertisementsData={(data) => setFilialeData(prev => ({ ...prev, electro: { ...prev.electro, ads: typeof data === 'function' ? data(prev.electro.ads) : data } }))}
                                  promotionsData={filialeData.electro.promos}
                                  setPromotionsData={(data) => setFilialeData(prev => ({ ...prev, electro: { ...prev.electro, promos: typeof data === 'function' ? data(prev.electro.promos) : data } }))}
                                  storesData={filialeData.electro.stores}
                                  setStoresData={(data) => setFilialeData(prev => ({ ...prev, electro: { ...prev.electro, stores: typeof data === 'function' ? data(prev.electro.stores) : data } }))}
                                />
                              </Suspense>
                            </ElectroCompareProvider>
                          </ElectroFavoritesProvider>
                        </ElectroCartProvider>
                      </ElectroToastProvider>
                    </ElectroThemeProvider>
                  </SubAdminErrorBoundary>
                )}

              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};
