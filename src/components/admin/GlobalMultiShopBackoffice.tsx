import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { FilialeId, SourceProduit, FutureProduit, Fournisseur } from '../../models/ProductFiliale';
import { SidebarNav, SidebarMenuItem, ShopContextId } from './SidebarNav';
import { TopHeader } from './TopHeader';
import { ConsolidatedDashboardView } from './ConsolidatedDashboardView';
import { GlobalOrdersView } from './GlobalOrdersView';
import { GlobalProductsView } from './GlobalProductsView';
import { GlobalOtherViews } from './GlobalOtherViews';
import { SourcesView } from './SourcesView';
import { FutureProductsView } from './FutureProductsView';
import { SuppliersView } from './SuppliersView';
import { MultiShopBackofficeLogin } from './MultiShopBackofficeLogin';
import { ArrowLeft, ExternalLink, Plus, RefreshCw, ShoppingCart, Package, Layers, Sparkles } from 'lucide-react';
import {
  getCachedSiteVisibility,
  isSiteHiddenInBackOffice,
  SiteVisibilityMap
} from '../../utils/siteVisibility';
import { getRealtimeSocket } from '../../utils/realtimeClient';

// Context providers for sub-backoffices
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

// Lazy loaded sub-backoffices (used with hideSidebar=true for contextual pages)
const NutritionAdminPage = React.lazy(() => import('@/templates/nutrition/components/admin/AdminPage').then(m => ({ default: m.AdminPage })));
const YoupiAdminPage = React.lazy(() => import('@/templates/youpi/components/admin/AdminPage').then(m => ({ default: m.AdminPage })));

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
  nutrition: { name: 'Fitness Shop', icon: '🏋️‍♂️', subtitle: 'Équipements de Musculation, Cardio & Fitness', color: 'text-lime-700', bg: 'bg-lime-50 border-lime-200' },
  youpi: { name: 'YoupiShop', icon: '🧸', subtitle: "Jeux d'Enfants, Jouets & Éveil", color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' }
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
      if (['nutrition', 'youpi'].includes(s)) return s as ShopContextId;
    }
    return 'all';
  });

  // Current active navigation menu item in sidebar
  const [currentMenu, setCurrentMenu] = useState<SidebarMenuItem>('dashboard');
  const [contextualShopOverride, setContextualShopOverride] = useState<FilialeId>('nutrition');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [siteVisibility, setSiteVisibility] = useState<SiteVisibilityMap>(getCachedSiteVisibility);

  useEffect(() => {
    const handleVis = (e: any) => {
      if (e.detail) setSiteVisibility(e.detail);
    };
    window.addEventListener('site-visibility-changed', handleVis);
    return () => window.removeEventListener('site-visibility-changed', handleVis);
  }, []);

  // If current contextual shop was hidden from Backoffice, switch to first visible
  useEffect(() => {
    if (activeShop === 'all' && isSiteHiddenInBackOffice(contextualShopOverride, siteVisibility)) {
      const firstAvailable = (['nutrition', 'youpi'] as FilialeId[]).find(
        fKey => !isSiteHiddenInBackOffice(fKey, siteVisibility)
      );
      if (firstAvailable) {
        setContextualShopOverride(firstAvailable);
      }
    }
  }, [contextualShopOverride, siteVisibility, activeShop]);

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
  const [sources, setSources] = useState<SourceProduit[]>([]);
  const [futureProducts, setFutureProducts] = useState<FutureProduit[]>([]);
  const [suppliers, setSuppliers] = useState<Fournisseur[]>([]);
  const [targetFutureProductForRestock, setTargetFutureProductForRestock] = useState<FutureProduit | null>(null);
  const [loading, setLoading] = useState(true);

  // Filiale data cache for sub-admin pages
  const [filialeData, setFilialeData] = useState<Record<string, any>>({
    nutrition: { products: [], categories: [], packs: [], orders: [], messages: [], ads: {}, promos: [], stores: [], brands: [] },
    youpi: { products: [], categories: [], packs: [], orders: [], messages: [], ads: {}, promos: [], stores: [], brands: [] },
  });

  const fetchGlobalData = async () => {
    setLoading(true);
    try {
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = { 'Accept': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const [statsRes, productsRes, ordersRes, sourcesRes, futureRes, suppliersRes] = await Promise.all([
        fetch('/api/global/stats', { headers }).then(r => r.json()).catch(() => null),
        fetch('/api/global/products', { headers }).then(r => r.json()).catch(() => []),
        fetch('/api/global/orders', { headers }).then(r => r.json()).catch(() => []),
        fetch('/api/sources', { headers }).then(r => r.json()).catch(() => []),
        fetch('/api/future-products', { headers }).then(r => r.json()).catch(() => []),
        fetch('/api/suppliers', { headers }).then(r => r.json()).catch(() => [])
      ]);

      if (statsRes) setStats(statsRes);
      if (Array.isArray(productsRes)) setAllProducts(productsRes);
      if (Array.isArray(ordersRes)) setAllOrders(ordersRes);
      if (Array.isArray(sourcesRes)) setSources(sourcesRes);
      if (Array.isArray(futureRes)) setFutureProducts(futureRes);
      if (Array.isArray(suppliersRes)) setSuppliers(suppliersRes);
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
    ['nutrition', 'youpi'].forEach(loadFilialeData);

    // Initialize Socket.IO connection for real-time background sync
    getRealtimeSocket();

    const handleRealtimeStats = (e: any) => {
      if (e.detail && typeof e.detail === 'object' && ('totalRevenue' in e.detail || 'filiales' in e.detail)) {
        setStats(e.detail);
      } else {
        fetchGlobalData();
      }
    };

    const handleVisibilityChanged = (e: any) => {
      if (e.detail && typeof e.detail === 'object') {
        setSiteVisibility(e.detail);
      }
      fetchGlobalData();
    };

    const handleDataChanged = (e: any) => {
      fetchGlobalData();
      const shopKey = e.detail?.shopKey || e.detail?.shopId;
      if (shopKey && shopKey !== 'all') {
        loadFilialeData(shopKey);
      } else {
        ['nutrition', 'youpi'].forEach(loadFilialeData);
      }
    };

    window.addEventListener('stats_updated', handleRealtimeStats);
    window.addEventListener('multishop_data_changed', handleDataChanged);
    window.addEventListener('site-visibility-changed', handleVisibilityChanged);

    return () => {
      window.removeEventListener('stats_updated', handleRealtimeStats);
      window.removeEventListener('multishop_data_changed', handleDataChanged);
      window.removeEventListener('site-visibility-changed', handleVisibilityChanged);
    };
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
      const isExisting = allProducts.some(p => p.id === product.id);
      let res;
      if (isExisting) {
        res = await fetch(`/api/global/products/${product.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-shop-id': product.filialeKey || 'nutrition'
          },
          body: JSON.stringify(product)
        });
      } else {
        res = await fetch('/api/global/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-shop-id': product.filialeKey || 'nutrition'
          },
          body: JSON.stringify(product)
        });
      }
      if (res.ok) {
        const saved = await res.json();
        setAllProducts(prev => {
          const idx = prev.findIndex(p => p.id === saved.id);
          if (idx !== -1) {
            const next = [...prev];
            next[idx] = { ...next[idx], ...saved };
            return next;
          }
          return [saved, ...prev];
        });
        return saved;
      }
    } catch (err) {
      console.error('Error saving product:', err);
      throw err;
    }
  };

  const handleSaveSource = async (source: SourceProduit) => {
    try {
      const isEdit = sources.some(s => s.id === source.id);
      const url = isEdit ? `/api/sources/${source.id}` : '/api/sources';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(source)
      });
      if (res.ok) {
        const saved = await res.json();
        setSources(prev => isEdit ? prev.map(s => s.id === saved.id ? saved : s) : [saved, ...prev]);
      }
    } catch (err) {
      console.error('Error saving source:', err);
    }
  };

  const handleDeleteSource = async (id: string) => {
    try {
      const res = await fetch(`/api/sources/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSources(prev => prev.filter(s => s.id !== id));
      }
    } catch (err) {
      console.error('Error deleting source:', err);
    }
  };

  const handleQuickAddSource = async (source: SourceProduit): Promise<SourceProduit> => {
    const res = await fetch('/api/sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(source)
    });
    const saved = await res.json();
    setSources(prev => [saved, ...prev]);
    return saved;
  };

  const handleSaveFutureProduct = async (fp: FutureProduit) => {
    try {
      const isEdit = futureProducts.some(f => f.id === fp.id);
      const url = isEdit ? `/api/future-products/${fp.id}` : '/api/future-products';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fp)
      });
      if (res.ok) {
        const saved = await res.json();
        setFutureProducts(prev => isEdit ? prev.map(f => f.id === saved.id ? saved : f) : [saved, ...prev]);
      }
    } catch (err) {
      console.error('Error saving future product:', err);
    }
  };

  const handleDeleteFutureProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/future-products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setFutureProducts(prev => prev.filter(f => f.id !== id));
      }
    } catch (err) {
      console.error('Error deleting future product:', err);
    }
  };

  const handleSaveSupplier = async (supplier: any): Promise<any> => {
    try {
      const isEdit = suppliers.some(s => s.id === supplier.id);
      const url = isEdit ? `/api/suppliers/${supplier.id}` : '/api/suppliers';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplier)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Erreur lors de l\'enregistrement du fournisseur.');
      }
      setSuppliers(prev => isEdit ? prev.map(s => s.id === data.id ? data : s) : [data, ...prev]);
      if (supplier.reception || data.receptionMessage) {
        await fetchGlobalData();
      }
      return data;
    } catch (err: any) {
      console.error('Error saving supplier:', err);
      throw err;
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    try {
      const res = await fetch(`/api/suppliers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSuppliers(prev => prev.filter(s => s.id !== id));
      }
    } catch (err) {
      console.error('Error deleting supplier:', err);
    }
  };

  const handleExecuteRestock = async (supplierId: string, payload: any) => {
    const res = await fetch(`/api/suppliers/${supplierId}/receptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Erreur lors de la réception');
    }
    await fetchGlobalData();
    return data;
  };

  const handleOpenRestockWithFuture = (fp: FutureProduit) => {
    setTargetFutureProductForRestock(fp);
    setCurrentMenu('suppliers');
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
        onGoToStorefront={() => onGoToStorefront('nutrition')}
      />
    );
  }

  // Check if current menu is contextual to a store
  const isContextualMenu = ['categories', 'brands', 'packs', 'home', 'chat'].includes(currentMenu);
  const targetBoutiqueKey: FilialeId = activeShop === 'all' ? contextualShopOverride : (activeShop as FilialeId);
  const targetBoutiqueMeta = BOUTIQUES_META[targetBoutiqueKey] || BOUTIQUES_META.nutrition;

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
                siteVisibility={siteVisibility}
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

                {/* 4 Metric Cards for this store - 100% Database Derived */}
                {(() => {
                  const fStats = stats?.filiales?.[activeShop];
                  const liveOrders = filialeData[activeShop]?.orders || allOrders.filter(o => o.filialeKey === activeShop);
                  const validLiveOrders = liveOrders.filter((o: any) => o.status !== 'Annulée' && o.status !== 'annulé');
                  const liveRevenue = fStats?.revenue !== undefined ? fStats.revenue : validLiveOrders.reduce((sum: number, o: any) => sum + (Number(o.total || o.totalAmount) || 0), 0);
                  const liveOrdersCount = fStats?.ordersCount !== undefined ? fStats.ordersCount : liveOrders.length;
                  const liveProductsCount = fStats?.productsCount !== undefined ? fStats.productsCount : (filialeData[activeShop]?.products?.length || allProducts.filter(p => p.filialeKey === activeShop).length);
                  const livePendingCount = fStats?.pendingOrdersCount !== undefined ? fStats.pendingOrdersCount : liveOrders.filter((o: any) => ['En attente', 'en_attente', 'Expédiée', 'confirmé'].includes(o.status)).length;

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
                        <span className="text-xs font-bold text-slate-400 uppercase">Chiffre d'Affaires</span>
                        <p className="text-2xl font-black text-slate-900 mt-1">
                          {liveRevenue.toLocaleString('fr-FR')} DT
                        </p>
                        <span className="text-[10px] text-emerald-600 font-bold mt-2 block">Flux direct base de données</span>
                      </div>

                      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
                        <span className="text-xs font-bold text-slate-400 uppercase">Commandes Totales</span>
                        <p className="text-2xl font-black text-slate-900 mt-1">
                          {liveOrdersCount}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-2 block">Dont {livePendingCount} en attente</span>
                      </div>

                      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
                        <span className="text-xs font-bold text-slate-400 uppercase">Articles Catalogue</span>
                        <p className="text-2xl font-black text-slate-900 mt-1">
                          {liveProductsCount}
                        </p>
                        <span className="text-[10px] text-blue-600 font-bold mt-2 block">Typage filiale actif</span>
                      </div>

                      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
                        <span className="text-xs font-bold text-slate-400 uppercase">Statut Console</span>
                        <p className="text-2xl font-black text-emerald-600 mt-1">Synchronisé</p>
                        <span className="text-[10px] text-slate-400 mt-2 block">Mise à jour en temps réel</span>
                      </div>
                    </div>
                  );
                })()}

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
              suppliers={suppliers}
              onSaveSupplier={handleSaveSupplier}
              activeShop={activeShop}
              onSelectShop={handleSelectShop}
            />
          )}

          {/* CASE 3.1: SOURCES DE VEILLE */}
          {currentMenu === 'sources' && (
            <SourcesView
              sources={sources}
              onSaveSource={handleSaveSource}
              onDeleteSource={handleDeleteSource}
              onCreateFutureProductForSource={() => {
                setCurrentMenu('future-products');
              }}
              futureProductsCountBySource={
                futureProducts.reduce((acc, fp) => {
                  acc[fp.sourceId] = (acc[fp.sourceId] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              }
            />
          )}

          {/* CASE 3.2: FUTURS PRODUITS */}
          {currentMenu === 'future-products' && (
            <FutureProductsView
              futureProducts={futureProducts}
              sources={sources}
              onSaveFutureProduct={handleSaveFutureProduct}
              onDeleteFutureProduct={handleDeleteFutureProduct}
              onQuickAddSource={handleQuickAddSource}
              onOpenRestockWithFuture={handleOpenRestockWithFuture}
            />
          )}

          {/* CASE 3.3: FOURNISSEURS & APPROVISIONNEMENT */}
          {currentMenu === 'suppliers' && (
            <SuppliersView
              suppliers={suppliers}
              products={allProducts}
              futureProducts={futureProducts}
              onSaveSupplier={handleSaveSupplier}
              onDeleteSupplier={handleDeleteSupplier}
              onExecuteRestock={handleExecuteRestock}
              initialTargetFutureProduct={targetFutureProductForRestock}
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
                    {((['nutrition', 'youpi'] as FilialeId[])
                      .filter(fKey => !isSiteHiddenInBackOffice(fKey, siteVisibility)))
                      .map((fKey) => {
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
                          <span>{fMeta?.icon}</span>
                          <span>{fMeta?.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Render the contextual module cleanly without any secondary sidebar */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
                {/* 1. Fitness Shop Sub-Pages */}
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

                {/* 2. YoupiShop Sub-Pages */}
                {targetBoutiqueKey === 'youpi' && (
                  <SubAdminErrorBoundary filialeName="YoupiShop" onBackToHq={() => setCurrentMenu('dashboard')}>
                    <YoupiThemeProvider>
                      <YoupiToastProvider>
                        <YoupiCartProvider>
                          <YoupiFavoritesProvider>
                            <YoupiCompareProvider>
                              <Suspense fallback={<div className="p-8 text-center text-slate-400 text-xs">Chargement du module YoupiShop...</div>}>
                                <YoupiAdminPage
                                  hideSidebar={true}
                                  forcedPage={currentMenu as any}
                                  onNavigateHome={() => onGoToStorefront('youpi')}
                                  onLogout={onLogout}
                                  productsData={filialeData.youpi.products}
                                  setProductsData={(data) => setFilialeData(prev => ({ ...prev, youpi: { ...prev.youpi, products: typeof data === 'function' ? data(prev.youpi.products) : data } }))}
                                  categoriesData={filialeData.youpi.categories}
                                  setCategoriesData={(data) => setFilialeData(prev => ({ ...prev, youpi: { ...prev.youpi, categories: typeof data === 'function' ? data(prev.youpi.categories) : data } }))}
                                  packsData={filialeData.youpi.packs}
                                  setPacksData={(data) => setFilialeData(prev => ({ ...prev, youpi: { ...prev.youpi, packs: typeof data === 'function' ? data(prev.youpi.packs) : data } }))}
                                  ordersData={filialeData.youpi.orders}
                                  setOrdersData={(data) => setFilialeData(prev => ({ ...prev, youpi: { ...prev.youpi, orders: typeof data === 'function' ? data(prev.youpi.orders) : data } }))}
                                  messagesData={filialeData.youpi.messages}
                                  setMessagesData={(data) => setFilialeData(prev => ({ ...prev, youpi: { ...prev.youpi, messages: typeof data === 'function' ? data(prev.youpi.messages) : data } }))}
                                  advertisementsData={filialeData.youpi.ads}
                                  setAdvertisementsData={(data) => setFilialeData(prev => ({ ...prev, youpi: { ...prev.youpi, ads: typeof data === 'function' ? data(prev.youpi.ads) : data } }))}
                                  promotionsData={filialeData.youpi.promos}
                                  setPromotionsData={(data) => setFilialeData(prev => ({ ...prev, youpi: { ...prev.youpi, promos: typeof data === 'function' ? data(prev.youpi.promos) : data } }))}
                                  storesData={filialeData.youpi.stores}
                                  setStoresData={(data) => setFilialeData(prev => ({ ...prev, youpi: { ...prev.youpi, stores: typeof data === 'function' ? data(prev.youpi.stores) : data } }))}
                                  brandsData={filialeData.youpi.brands}
                                  setBrandsData={(data) => setFilialeData(prev => ({ ...prev, youpi: { ...prev.youpi, brands: typeof data === 'function' ? data(prev.youpi.brands) : data } }))}
                                />
                              </Suspense>
                            </YoupiCompareProvider>
                          </YoupiFavoritesProvider>
                        </YoupiCartProvider>
                      </YoupiToastProvider>
                    </YoupiThemeProvider>
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
