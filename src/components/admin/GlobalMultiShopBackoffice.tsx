import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { FilialeId, FilialeType, FILIALE_CONFIG } from '../../models/ProductFiliale';

// Context providers
import { ThemeProvider as ParaThemeProvider } from '../../../ParaShop-main/components/ThemeContext';
import { ToastProvider as ParaToastProvider } from '../../../ParaShop-main/components/ToastContext';
import { ThemeProvider as NutritionThemeProvider } from '../../../NutritionShop-main/components/ThemeContext';
import { ToastProvider as NutritionToastProvider } from '../../../NutritionShop-main/components/ToastContext';
import { ThemeProvider as CosmeticThemeProvider } from '../../../cosmeticshop-main/components/ThemeContext';
import { ToastProvider as CosmeticToastProvider } from '../../../cosmeticshop-main/components/ToastContext';
import { ThemeProvider as ElectroThemeProvider } from '../../../electro_shop-main/components/ThemeContext';
import { ToastProvider as ElectroToastProvider } from '../../../electro_shop-main/components/ToastContext';

// Lazy loaded sub-backoffices
const ParaAdminPage = React.lazy(() => import('../../../ParaShop-main/components/admin/AdminPage').then(m => ({ default: m.AdminPage })));
const NutritionAdminPage = React.lazy(() => import('../../../NutritionShop-main/components/admin/AdminPage').then(m => ({ default: m.AdminPage })));
const CosmeticAdminPage = React.lazy(() => import('../../../cosmeticshop-main/components/admin/AdminPage').then(m => ({ default: m.AdminPage })));
const ElectroAdminPage = React.lazy(() => import('../../../electro_shop-main/components/admin/AdminPage').then(m => ({ default: m.AdminPage })));

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
        <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <span className="text-3xl">⚠️</span>
          <h3 className="text-lg font-bold text-white">Impossible de charger le sous-backoffice {this.props.filialeName}</h3>
          <p className="text-xs text-slate-400">{this.state.error?.message || "Erreur interne"}</p>
          <button
            onClick={this.props.onBackToHq}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold text-white"
          >
            Revenir au Tableau de Bord HQ
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
}

export type BackofficeTab = 'hq' | 'para' | 'nutrition' | 'cosmetic' | 'electro';

export const GlobalMultiShopBackoffice: React.FC<GlobalBackofficeProps> = ({
  onGoToStorefront,
  currentUser,
  onLogout,
  onOpenAuthModal
}) => {
  const [activeTab, setActiveTab] = useState<BackofficeTab>('hq');
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

  // Filter & Search states for HQ product table
  const [productFilialeFilter, setProductFilialeFilter] = useState<string>('all');
  const [productTypeFilter, setProductTypeFilter] = useState<string>('all');
  const [productSearch, setProductSearch] = useState<string>('');

  // Order status filter
  const [orderFilialeFilter, setOrderFilialeFilter] = useState<string>('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Product edit modal state
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // Fetch consolidated data
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

  // Load individual filiale data for sub-backoffices
  const loadFilialeData = async (fKey: string) => {
    try {
      const headers = { 'x-shop-id': fKey };
      const [prods, cats, pks, ords, msgs, ads, prms, strs, brnds] = await Promise.all([
        fetch('/api/products', { headers }).then(r => r.json()).catch(() => []),
        fetch('/api/categories', { headers }).then(r => r.json()).catch(() => []),
        fetch('/api/packs', { headers }).then(r => r.json()).catch(() => []),
        fetch('/api/orders', { headers }).then(r => r.json()).catch(() => []),
        fetch('/api/contact', { headers }).then(r => r.json()).catch(() => []),
        fetch('/api/advertisements', { headers }).then(r => r.json()).catch(() => ({})),
        fetch('/api/promotions', { headers }).then(r => r.json()).catch(() => []),
        fetch('/api/stores', { headers }).then(r => r.json()).catch(() => []),
        fetch('/api/brands', { headers }).then(r => r.json()).catch(() => []),
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
    ['para', 'nutrition', 'cosmetic', 'electro'].forEach(loadFilialeData);
  }, []);

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
    } catch (e) {
      console.error('Error updating order:', e);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSavingProduct(true);
    try {
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-shop-id': editingProduct.filialeKey || 'para'
        },
        body: JSON.stringify(editingProduct)
      });
      if (res.ok) {
        const updated = await res.json();
        setAllProducts(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p));
        setEditingProduct(null);
      }
    } catch (err) {
      console.error('Error saving product:', err);
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Filtered products for HQ
  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => {
      const matchFiliale = productFilialeFilter === 'all' || p.filialeKey === productFilialeFilter;
      const matchType = productTypeFilter === 'all' || p.filialeType === productTypeFilter;
      const matchSearch = !productSearch || 
        p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.brand?.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.category?.toLowerCase().includes(productSearch.toLowerCase());
      return matchFiliale && matchType && matchSearch;
    });
  }, [allProducts, productFilialeFilter, productTypeFilter, productSearch]);

  // Filtered orders for HQ
  const filteredOrders = useMemo(() => {
    return allOrders.filter(o => {
      const matchFiliale = orderFilialeFilter === 'all' || o.filialeKey === orderFilialeFilter;
      const matchStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
      return matchFiliale && matchStatus;
    });
  }, [allOrders, orderFilialeFilter, orderStatusFilter]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top MultiShop Backoffice Master Navigation Bar */}
      <header className="sticky top-0 z-[150] bg-slate-900 border-b border-slate-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap">
          
          {/* Logo / Group Title */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 font-black text-sm text-white shadow-lg">
              HQ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm sm:text-base uppercase tracking-tight text-white">
                  MultiShop <span className="text-indigo-400 font-bold">Backoffice Général</span>
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-900/60 text-purple-300 border border-purple-700">
                  Super Admin
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                Gestion centralisée et sous-backoffices des 4 filiales
              </p>
            </div>
          </div>

          {/* Sub-backoffice Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
            
            {/* Global HQ Tab */}
            <button
              onClick={() => setActiveTab('hq')}
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'hq'
                  ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400/40'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span>🏢</span>
              <span>Vue Groupe HQ</span>
            </button>

            {/* Sub-backoffices */}
            <button
              onClick={() => setActiveTab('para')}
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'para'
                  ? 'bg-emerald-700 text-white shadow-md ring-2 ring-emerald-400/40'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span>🌿</span>
              <span>Para Shop</span>
            </button>

            <button
              onClick={() => setActiveTab('nutrition')}
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'nutrition'
                  ? 'bg-zinc-800 text-lime-400 shadow-md ring-2 ring-lime-400/40 border border-lime-400/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span>⚡</span>
              <span>Nutrition Shop</span>
            </button>

            <button
              onClick={() => setActiveTab('cosmetic')}
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'cosmetic'
                  ? 'bg-rose-700 text-white shadow-md ring-2 ring-rose-400/40'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span>💄</span>
              <span>Cosmetics Shop</span>
            </button>

            <button
              onClick={() => setActiveTab('electro')}
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'electro'
                  ? 'bg-blue-700 text-white shadow-md ring-2 ring-blue-400/40'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span>🔌</span>
              <span>Electro Shop</span>
            </button>

          </div>

          {/* Right Action: Go to Public Storefront & Admin Profile */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onGoToStorefront(activeTab === 'hq' ? 'para' : (activeTab as FilialeId))}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md cursor-pointer hover:scale-105"
              title="Voir la boutique publique telle que la voient vos clients"
            >
              <span>🛍️</span>
              <span className="hidden sm:inline">Voir la Boutique</span>
              <span className="sm:hidden">Boutique</span>
            </button>

            <button
              onClick={onOpenAuthModal}
              type="button"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 cursor-pointer"
            >
              <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-[10px]">
                {currentUser?.firstName?.[0] || 'A'}
              </span>
              <span className="hidden md:inline">{currentUser?.firstName || 'Admin'}</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        
        {/* TAB 1: GROUP HQ CONSOLIDATED DASHBOARD */}
        {activeTab === 'hq' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Header / Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight uppercase">
                  Tableau de Bord Consolidé <span className="text-indigo-400">Groupe MultiShop</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Surveillance des performances, ventes consolidées et catalogue multi-filiales
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchGlobalData}
                  type="button"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                >
                  <span>🔄</span> Actualiser les données
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-center text-emerald-400 text-lg">
                    💰
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-2 py-0.5 rounded-full">
                    +18.5%
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">CA Consolidé Groupe</p>
                <p className="text-2xl sm:text-3xl font-black text-white mt-1">
                  {stats ? `${stats.totalRevenue?.toLocaleString('fr-FR')} DT` : '...'}
                </p>
                <p className="text-[10px] text-slate-500 mt-2">Chiffre d'affaires cumulé des 4 sites</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-800/50 flex items-center justify-center text-blue-400 text-lg">
                    📦
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 bg-blue-950/50 border border-blue-800/50 px-2 py-0.5 rounded-full">
                    Toutes filiales
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Commandes Totales</p>
                <p className="text-2xl sm:text-3xl font-black text-white mt-1">
                  {stats ? stats.totalOrders : '...'}
                </p>
                <p className="text-[10px] text-slate-500 mt-2">Volume global des commandes clients</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-800/50 flex items-center justify-center text-purple-400 text-lg">
                    🏷️
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 bg-purple-950/50 border border-purple-800/50 px-2 py-0.5 rounded-full">
                    Actif
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Catalogue Global</p>
                <p className="text-2xl sm:text-3xl font-black text-white mt-1">
                  {stats ? stats.totalProducts : '...'}
                </p>
                <p className="text-[10px] text-slate-500 mt-2">Articles avec typage filiale hérité</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-800/50 flex items-center justify-center text-amber-400 text-lg">
                    ⏳
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-950/50 border border-amber-800/50 px-2 py-0.5 rounded-full">
                    À Traiter
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Commandes en Cours</p>
                <p className="text-2xl sm:text-3xl font-black text-white mt-1">
                  {stats ? stats.pendingOrders : '...'}
                </p>
                <p className="text-[10px] text-slate-500 mt-2">En attente d'expédition ou livraison</p>
              </div>

            </div>

            {/* 4 Filiales Comparison Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span>🏢</span> État et Performance des 4 Filiales
                </h3>
                <span className="text-xs text-slate-400">Cliquez pour accéder au sous-backoffice direct</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* PharmaNature */}
                <div className="bg-slate-900 border border-emerald-800/50 hover:border-emerald-600 rounded-2xl p-5 transition-all shadow-md group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">🌿</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-bold border border-emerald-800/50">
                      produit_myshops_para
                    </span>
                  </div>
                  <h4 className="font-extrabold text-base text-white">PharmaNature</h4>
                  <p className="text-[11px] text-slate-400">Santé, Phytothérapie & Bio</p>

                  <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Ventes :</span>
                      <strong className="text-white">{stats?.filiales?.para?.revenue?.toLocaleString('fr-FR') || 0} DT</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Commandes :</span>
                      <strong className="text-white">{stats?.filiales?.para?.ordersCount || 0}</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Articles :</span>
                      <strong className="text-white">{stats?.filiales?.para?.productsCount || 0}</strong>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 flex gap-2">
                    <button
                      onClick={() => setActiveTab('para')}
                      type="button"
                      className="flex-1 py-1.5 text-xs font-bold rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white transition-colors cursor-pointer text-center"
                    >
                      Gérer Backoffice
                    </button>
                    <button
                      onClick={() => onGoToStorefront('para')}
                      type="button"
                      className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
                      title="Voir le site public PharmaNature"
                    >
                      🌐
                    </button>
                  </div>
                </div>

                {/* IronFuel Nutrition */}
                <div className="bg-slate-900 border border-lime-800/50 hover:border-lime-500 rounded-2xl p-5 transition-all shadow-md group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">⚡</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-lime-400 font-bold border border-lime-800/50">
                      produit_myshops_nutrition
                    </span>
                  </div>
                  <h4 className="font-extrabold text-base text-white">IronFuel Nutrition</h4>
                  <p className="text-[11px] text-slate-400">Performance Sportive Elite</p>

                  <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Ventes :</span>
                      <strong className="text-lime-400">{stats?.filiales?.nutrition?.revenue?.toLocaleString('fr-FR') || 0} DT</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Commandes :</span>
                      <strong className="text-white">{stats?.filiales?.nutrition?.ordersCount || 0}</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Articles :</span>
                      <strong className="text-white">{stats?.filiales?.nutrition?.productsCount || 0}</strong>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 flex gap-2">
                    <button
                      onClick={() => setActiveTab('nutrition')}
                      type="button"
                      className="flex-1 py-1.5 text-xs font-bold rounded-lg bg-zinc-800 text-lime-400 border border-lime-500/50 hover:bg-lime-400 hover:text-black transition-colors cursor-pointer text-center"
                    >
                      Gérer Backoffice
                    </button>
                    <button
                      onClick={() => onGoToStorefront('nutrition')}
                      type="button"
                      className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
                      title="Voir le site public IronFuel"
                    >
                      🌐
                    </button>
                  </div>
                </div>

                {/* Cosmetics Shop */}
                <div className="bg-slate-900 border border-rose-800/50 hover:border-rose-600 rounded-2xl p-5 transition-all shadow-md group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">💄</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 font-bold border border-rose-800/50">
                      produit_myshops_cosmetique
                    </span>
                  </div>
                  <h4 className="font-extrabold text-base text-white">Cosmetics Shop</h4>
                  <p className="text-[11px] text-slate-400">Soins, Beauté & Luxe</p>

                  <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Ventes :</span>
                      <strong className="text-rose-400">{stats?.filiales?.cosmetic?.revenue?.toLocaleString('fr-FR') || 0} DT</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Commandes :</span>
                      <strong className="text-white">{stats?.filiales?.cosmetic?.ordersCount || 0}</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Articles :</span>
                      <strong className="text-white">{stats?.filiales?.cosmetic?.productsCount || 0}</strong>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 flex gap-2">
                    <button
                      onClick={() => setActiveTab('cosmetic')}
                      type="button"
                      className="flex-1 py-1.5 text-xs font-bold rounded-lg bg-rose-700 hover:bg-rose-600 text-white transition-colors cursor-pointer text-center"
                    >
                      Gérer Backoffice
                    </button>
                    <button
                      onClick={() => onGoToStorefront('cosmetic')}
                      type="button"
                      className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
                      title="Voir le site public Cosmetics Shop"
                    >
                      🌐
                    </button>
                  </div>
                </div>

                {/* Electro Shop */}
                <div className="bg-slate-900 border border-blue-800/50 hover:border-blue-600 rounded-2xl p-5 transition-all shadow-md group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">🔌</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 font-bold border border-blue-800/50">
                      produit_myshops_electro
                    </span>
                  </div>
                  <h4 className="font-extrabold text-base text-white">Electro Shop</h4>
                  <p className="text-[11px] text-slate-400">High-Tech & Électroménager</p>

                  <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Ventes :</span>
                      <strong className="text-blue-400">{stats?.filiales?.electro?.revenue?.toLocaleString('fr-FR') || 0} DT</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Commandes :</span>
                      <strong className="text-white">{stats?.filiales?.electro?.ordersCount || 0}</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Articles :</span>
                      <strong className="text-white">{stats?.filiales?.electro?.productsCount || 0}</strong>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 flex gap-2">
                    <button
                      onClick={() => setActiveTab('electro')}
                      type="button"
                      className="flex-1 py-1.5 text-xs font-bold rounded-lg bg-blue-700 hover:bg-blue-600 text-white transition-colors cursor-pointer text-center"
                    >
                      Gérer Backoffice
                    </button>
                    <button
                      onClick={() => onGoToStorefront('electro')}
                      type="button"
                      className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
                      title="Voir le site public Electro Shop"
                    >
                      🌐
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* SECTION: CONSOLIDATED PRODUCTS EXPLORER (With Filiale Inheritance & Specific Fields) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <span>📦</span> Catalogue Centralisé Multi-Filiales
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Modélisation en classes <code className="text-indigo-400">ProduitFiliale</code> avec héritage et champs spécifiques
                  </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {/* Filiale Filter */}
                  <select
                    value={productFilialeFilter}
                    onChange={(e) => setProductFilialeFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">Toutes les Filiales</option>
                    <option value="para">🌿 PharmaNature</option>
                    <option value="nutrition">⚡ IronFuel Nutrition</option>
                    <option value="cosmetic">💄 Cosmetics Shop</option>
                    <option value="electro">🔌 Electro Shop</option>
                  </select>

                  {/* FilialeType Enum Filter */}
                  <select
                    value={productTypeFilter}
                    onChange={(e) => setProductTypeFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">Tous les Types Enum</option>
                    <option value={FilialeType.PRODUIT_MYSHOPS_PARA}>produit_myshops_para</option>
                    <option value={FilialeType.PRODUIT_MYSHOPS_NUTRITION}>produit_myshops_nutrition</option>
                    <option value={FilialeType.PRODUIT_MYSHOPS_COSMETIQUE}>produit_myshops_cosmetique</option>
                    <option value={FilialeType.PRODUIT_MYSHOPS_ELECTRO}>produit_myshops_electro</option>
                  </select>

                  {/* Search Bar */}
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Rechercher produit, marque..."
                    className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 w-44 sm:w-56"
                  />
                </div>
              </div>

              {/* Products Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-3">Produit</th>
                      <th className="py-3 px-3">Filiale & Type Enum</th>
                      <th className="py-3 px-3">Catégorie</th>
                      <th className="py-3 px-3">Prix</th>
                      <th className="py-3 px-3">Stock</th>
                      <th className="py-3 px-3">Attributs Spécifiques Filiale</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredProducts.slice(0, 30).map((prod) => {
                      const cfg = FILIALE_CONFIG[prod.filialeType as FilialeType] || FILIALE_CONFIG[FilialeType.PRODUIT_MYSHOPS_PARA];
                      return (
                        <tr key={`${prod.filialeKey}-${prod.id}`} className="hover:bg-slate-800/50 transition-colors">
                          
                          {/* Product Image & Title */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={prod.imageUrl}
                                alt={prod.name}
                                className="w-10 h-10 rounded-lg object-cover bg-slate-800 border border-slate-700"
                              />
                              <div>
                                <p className="font-bold text-white line-clamp-1 max-w-xs">{prod.name}</p>
                                <p className="text-[10px] text-slate-400 font-medium">{prod.brand}</p>
                              </div>
                            </div>
                          </td>

                          {/* Filiale Badge & Enum */}
                          <td className="py-3 px-3">
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 font-bold text-white text-[11px]">
                                <span>{cfg.icon}</span>
                                <span>{prod.filialeName || cfg.name}</span>
                              </span>
                              <div>
                                <span className={`inline-block text-[9px] font-mono px-2 py-0.5 rounded-full border ${cfg.badgeColor}`}>
                                  {prod.filialeType}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3 px-3">
                            <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 font-medium text-[11px]">
                              {prod.category}
                            </span>
                          </td>

                          {/* Price */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="font-extrabold text-white text-sm">{prod.price} DT</span>
                            {prod.oldPrice && (
                              <span className="text-[10px] text-slate-500 line-through ml-1.5">
                                {prod.oldPrice} DT
                              </span>
                            )}
                          </td>

                          {/* Stock */}
                          <td className="py-3 px-3">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black ${
                              prod.quantity > 5 
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' 
                                : 'bg-red-950 text-red-400 border border-red-800/40'
                            }`}>
                              {prod.quantity} en stock
                            </span>
                          </td>

                          {/* Filiale-Specific Fields */}
                          <td className="py-3 px-3">
                            <div className="space-y-1 text-[11px] max-w-xs">
                              {prod.filialeType === FilialeType.PRODUIT_MYSHOPS_ELECTRO && (
                                <>
                                  <p><span className="text-slate-400">Garantie :</span> <strong className="text-blue-300">{prod.garantieMois} mois</strong></p>
                                  <p><span className="text-slate-400">Puissance / Classe :</span> <span className="text-slate-200">{prod.puissanceWatts} • {prod.classeEnergetique}</span></p>
                                </>
                              )}

                              {prod.filialeType === FilialeType.PRODUIT_MYSHOPS_NUTRITION && (
                                <>
                                  <p><span className="text-slate-400">Saveur :</span> <strong className="text-lime-400">{prod.goutSaveur}</strong> ({prod.poidsKg} kg)</p>
                                  <p><span className="text-slate-400">Protéines / Cible :</span> <span className="text-slate-200">{prod.proteinesParPortion} • {prod.objectifSportif}</span></p>
                                </>
                              )}

                              {prod.filialeType === FilialeType.PRODUIT_MYSHOPS_COSMETIQUE && (
                                <>
                                  <p><span className="text-slate-400">Teinte / Volume :</span> <strong className="text-rose-300">{prod.teinte}</strong> ({prod.volumeMl} ml)</p>
                                  <p><span className="text-slate-400">Effet :</span> <span className="text-slate-200">{prod.effetSoin}</span></p>
                                </>
                              )}

                              {prod.filialeType === FilialeType.PRODUIT_MYSHOPS_PARA && (
                                <>
                                  <p><span className="text-slate-400">Posologie :</span> <strong className="text-emerald-300">{prod.posologie}</strong></p>
                                  <p><span className="text-slate-400">Certif :</span> <span className="text-slate-200">{prod.certification}</span></p>
                                </>
                              )}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => setEditingProduct({ ...prod })}
                              type="button"
                              className="px-2.5 py-1 text-xs font-bold rounded bg-indigo-600/80 hover:bg-indigo-600 text-white transition-colors cursor-pointer"
                            >
                              Éditer
                            </button>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="pt-2 text-xs text-slate-500 flex justify-between items-center">
                <span>Affichage de {filteredProducts.length} référence(s) multi-filiales</span>
                <span className="italic">Classes concrètes dérivées de ProduitFiliale avec polymorphisme de rendu</span>
              </div>
            </div>

            {/* SECTION: CONSOLIDATED ORDERS (All subsidiaries) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <span>📑</span> Flux Centralisé des Commandes Groupe
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Commandes passées par les clients sur l'ensemble des 4 sites marchands
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={orderFilialeFilter}
                    onChange={(e) => setOrderFilialeFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold"
                  >
                    <option value="all">Toutes les Boutiques</option>
                    <option value="para">🌿 PharmaNature</option>
                    <option value="nutrition">⚡ IronFuel</option>
                    <option value="cosmetic">💄 Cosmetics Shop</option>
                    <option value="electro">🔌 Electro Shop</option>
                  </select>

                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold"
                  >
                    <option value="all">Tous les Statuts</option>
                    <option value="En attente">En attente</option>
                    <option value="Expédiée">Expédiée</option>
                    <option value="Livrée">Livrée</option>
                    <option value="Annulée">Annulée</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-3">Réf Commande</th>
                      <th className="py-3 px-3">Filiale</th>
                      <th className="py-3 px-3">Client</th>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Total</th>
                      <th className="py-3 px-3">Statut</th>
                      <th className="py-3 px-3 text-right">Changer Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredOrders.slice(0, 15).map((order) => (
                      <tr key={order.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-white">{order.id}</td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-xs">
                            {order.filialeKey === 'para' && '🌿 PharmaNature'}
                            {order.filialeKey === 'nutrition' && '⚡ IronFuel'}
                            {order.filialeKey === 'cosmetic' && '💄 Cosmetics'}
                            {order.filialeKey === 'electro' && '🔌 Electro Shop'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-semibold text-white">{order.customerName}</p>
                          <p className="text-[10px] text-slate-400">{order.customerEmail || order.phone || 'Client MultiShop'}</p>
                        </td>
                        <td className="py-3 px-3 text-slate-400">{order.date}</td>
                        <td className="py-3 px-3 font-black text-white">{order.total} DT</td>
                        <td className="py-3 px-3">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black ${
                            order.status === 'Livrée' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' :
                            order.status === 'Expédiée' ? 'bg-blue-950 text-blue-400 border border-blue-800/40' :
                            order.status === 'Annulée' ? 'bg-red-950 text-red-400 border border-red-800/40' :
                            'bg-amber-950 text-amber-400 border border-amber-800/40'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200"
                          >
                            <option value="En attente">En attente</option>
                            <option value="Expédiée">Expédiée</option>
                            <option value="Livrée">Livrée</option>
                            <option value="Annulée">Annulée</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: PHARMANATURE SUB-BACKOFFICE */}
        {activeTab === 'para' && (
          <SubAdminErrorBoundary filialeName="PharmaNature" onBackToHq={() => setActiveTab('hq')}>
            <div className="space-y-4">
              <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌿</span>
                  <span className="font-extrabold text-sm text-emerald-300">
                    Sous-Backoffice : PharmaNature (Parapharmacie)
                  </span>
                  <span className="text-xs text-slate-400 hidden md:inline">• filialeType: produit_myshops_para</span>
                </div>
                <button
                  onClick={() => setActiveTab('hq')}
                  type="button"
                  className="text-xs font-bold text-slate-300 hover:text-white px-2.5 py-1 rounded bg-slate-800 border border-slate-700 cursor-pointer"
                >
                  ⬅ Retour Vue Groupe HQ
                </button>
              </div>
              
              <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-xl text-slate-900 dark:text-slate-100">
                <ParaThemeProvider>
                  <ParaToastProvider>
                    <Suspense fallback={<div className="p-12 text-center text-slate-400">Chargement du backoffice PharmaNature...</div>}>
                      <ParaAdminPage
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
                  </ParaToastProvider>
                </ParaThemeProvider>
              </div>
            </div>
          </SubAdminErrorBoundary>
        )}

        {/* TAB 3: IRONFUEL NUTRITION SUB-BACKOFFICE */}
        {activeTab === 'nutrition' && (
          <SubAdminErrorBoundary filialeName="IronFuel Nutrition" onBackToHq={() => setActiveTab('hq')}>
            <div className="space-y-4">
              <div className="bg-zinc-900 border border-lime-500/50 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⚡</span>
                  <span className="font-extrabold text-sm text-lime-400">
                    Sous-Backoffice : IronFuel Nutrition (Sport & Performance)
                  </span>
                  <span className="text-xs text-zinc-400 hidden md:inline">• filialeType: produit_myshops_nutrition</span>
                </div>
                <button
                  onClick={() => setActiveTab('hq')}
                  type="button"
                  className="text-xs font-bold text-zinc-300 hover:text-white px-2.5 py-1 rounded bg-zinc-800 border border-zinc-700 cursor-pointer"
                >
                  ⬅ Retour Vue Groupe HQ
                </button>
              </div>

              <div className="bg-zinc-950 text-white rounded-2xl overflow-hidden shadow-xl">
                <NutritionThemeProvider>
                  <NutritionToastProvider>
                    <Suspense fallback={<div className="p-12 text-center text-zinc-400">Chargement du backoffice IronFuel...</div>}>
                      <NutritionAdminPage
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
                  </NutritionToastProvider>
                </NutritionThemeProvider>
              </div>
            </div>
          </SubAdminErrorBoundary>
        )}

        {/* TAB 4: COSMETICS SHOP SUB-BACKOFFICE */}
        {activeTab === 'cosmetic' && (
          <SubAdminErrorBoundary filialeName="Cosmetics Shop" onBackToHq={() => setActiveTab('hq')}>
            <div className="space-y-4">
              <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">💄</span>
                  <span className="font-extrabold text-sm text-rose-300">
                    Sous-Backoffice : Cosmetics Shop (Luxe & Beauté)
                  </span>
                  <span className="text-xs text-slate-400 hidden md:inline">• filialeType: produit_myshops_cosmetique</span>
                </div>
                <button
                  onClick={() => setActiveTab('hq')}
                  type="button"
                  className="text-xs font-bold text-slate-300 hover:text-white px-2.5 py-1 rounded bg-slate-800 border border-slate-700 cursor-pointer"
                >
                  ⬅ Retour Vue Groupe HQ
                </button>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-xl text-slate-900 dark:text-slate-100">
                <CosmeticThemeProvider>
                  <CosmeticToastProvider>
                    <Suspense fallback={<div className="p-12 text-center text-rose-400">Chargement du backoffice Cosmetics Shop...</div>}>
                      <CosmeticAdminPage
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
                  </CosmeticToastProvider>
                </CosmeticThemeProvider>
              </div>
            </div>
          </SubAdminErrorBoundary>
        )}

        {/* TAB 5: ELECTRO SHOP SUB-BACKOFFICE */}
        {activeTab === 'electro' && (
          <SubAdminErrorBoundary filialeName="Electro Shop" onBackToHq={() => setActiveTab('hq')}>
            <div className="space-y-4">
              <div className="bg-blue-950/40 border border-blue-800/60 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔌</span>
                  <span className="font-extrabold text-sm text-blue-300">
                    Sous-Backoffice : Electro Shop (High-Tech & Maison)
                  </span>
                  <span className="text-xs text-slate-400 hidden md:inline">• filialeType: produit_myshops_electro</span>
                </div>
                <button
                  onClick={() => setActiveTab('hq')}
                  type="button"
                  className="text-xs font-bold text-slate-300 hover:text-white px-2.5 py-1 rounded bg-slate-800 border border-slate-700 cursor-pointer"
                >
                  ⬅ Retour Vue Groupe HQ
                </button>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-xl text-slate-900 dark:text-slate-100">
                <ElectroThemeProvider>
                  <ElectroToastProvider>
                    <Suspense fallback={<div className="p-12 text-center text-blue-400">Chargement du backoffice Electro Shop...</div>}>
                      <ElectroAdminPage
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
                        advertisementsData={filialeData.electro.ads}
                        setAdvertisementsData={(data) => setFilialeData(prev => ({ ...prev, electro: { ...prev.electro, ads: typeof data === 'function' ? data(prev.electro.ads) : data } }))}
                        promotionsData={filialeData.electro.promos}
                        setPromotionsData={(data) => setFilialeData(prev => ({ ...prev, electro: { ...prev.electro, promos: typeof data === 'function' ? data(prev.electro.promos) : data } }))}
                        storesData={filialeData.electro.stores}
                        setStoresData={(data) => setFilialeData(prev => ({ ...prev, electro: { ...prev.electro, stores: typeof data === 'function' ? data(prev.electro.stores) : data } }))}
                      />
                    </Suspense>
                  </ElectroToastProvider>
                </ElectroThemeProvider>
              </div>
            </div>
          </SubAdminErrorBoundary>
        )}

      </main>

      {/* PRODUCT EDIT MODAL WITH FILIALE SPECIFIC FIELDS */}
      {editingProduct && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Modifier la Référence Filiale</h3>
                <p className="text-xs text-slate-400">
                  {editingProduct.filialeName} • <span className="font-mono text-indigo-400">{editingProduct.filialeType}</span>
                </p>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              
              {/* Common Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-bold mb-1">Nom du Produit</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Marque</label>
                  <input
                    type="text"
                    value={editingProduct.brand}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Catégorie</label>
                  <input
                    type="text"
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Prix (DT)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Stock Quantité</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.quantity}
                    onChange={(e) => setEditingProduct({ ...editingProduct, quantity: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* FILIALE-SPECIFIC EXTRA FIELDS ACCORDING TO ENUM */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
                <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-wider text-[11px]">
                  <span>⚡</span> Attributs Spécifiques Filiale ({editingProduct.filialeName})
                </div>

                {/* Electro specific */}
                {editingProduct.filialeType === FilialeType.PRODUIT_MYSHOPS_ELECTRO && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Garantie (mois)</label>
                      <input
                        type="number"
                        value={editingProduct.garantieMois || 24}
                        onChange={(e) => setEditingProduct({ ...editingProduct, garantieMois: parseInt(e.target.value, 10) })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Puissance (Watts)</label>
                      <input
                        type="text"
                        value={editingProduct.puissanceWatts || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, puissanceWatts: e.target.value })}
                        placeholder="Ex: 2200W"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Classe Énergétique</label>
                      <input
                        type="text"
                        value={editingProduct.classeEnergetique || 'A++'}
                        onChange={(e) => setEditingProduct({ ...editingProduct, classeEnergetique: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Réf Technique</label>
                      <input
                        type="text"
                        value={editingProduct.referenceTechnique || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, referenceTechnique: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Nutrition specific */}
                {editingProduct.filialeType === FilialeType.PRODUIT_MYSHOPS_NUTRITION && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Saveur / Goût</label>
                      <input
                        type="text"
                        value={editingProduct.goutSaveur || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, goutSaveur: e.target.value })}
                        placeholder="Ex: Chocolat Belge"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Poids Net (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={editingProduct.poidsKg || 1}
                        onChange={(e) => setEditingProduct({ ...editingProduct, poidsKg: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Protéines / Portion</label>
                      <input
                        type="text"
                        value={editingProduct.proteinesParPortion || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, proteinesParPortion: e.target.value })}
                        placeholder="Ex: 24g / portion"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Objectif Sportif</label>
                      <input
                        type="text"
                        value={editingProduct.objectifSportif || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, objectifSportif: e.target.value })}
                        placeholder="Ex: Prise de masse sèche"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Cosmetic specific */}
                {editingProduct.filialeType === FilialeType.PRODUIT_MYSHOPS_COSMETIQUE && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Teinte / Nuance</label>
                      <input
                        type="text"
                        value={editingProduct.teinte || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, teinte: e.target.value })}
                        placeholder="Ex: 02 Beige Doré"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Contenance (ml)</label>
                      <input
                        type="number"
                        value={editingProduct.volumeMl || 50}
                        onChange={(e) => setEditingProduct({ ...editingProduct, volumeMl: parseInt(e.target.value, 10) })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Effet Soin</label>
                      <input
                        type="text"
                        value={editingProduct.effetSoin || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, effetSoin: e.target.value })}
                        placeholder="Ex: Anti-Âge & Éclat"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-5">
                      <input
                        type="checkbox"
                        id="hypoall"
                        checked={!!editingProduct.hypoallergenique}
                        onChange={(e) => setEditingProduct({ ...editingProduct, hypoallergenique: e.target.checked })}
                        className="rounded bg-slate-900 border-slate-700 text-rose-600 w-4 h-4"
                      />
                      <label htmlFor="hypoall" className="text-slate-300 font-bold">
                        Formule Hypoallergénique
                      </label>
                    </div>
                  </div>
                )}

                {/* Para specific */}
                {editingProduct.filialeType === FilialeType.PRODUIT_MYSHOPS_PARA && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-slate-300 font-bold mb-1">Posologie Conseillée</label>
                      <input
                        type="text"
                        value={editingProduct.posologie || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, posologie: e.target.value })}
                        placeholder="Ex: 2 gélules par jour au cours des repas"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Certification</label>
                      <input
                        type="text"
                        value={editingProduct.certification || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, certification: e.target.value })}
                        placeholder="Ex: Certifié Bio ECOCERT"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Forme Galénique</label>
                      <input
                        type="text"
                        value={editingProduct.formeGalenique || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, formeGalenique: e.target.value })}
                        placeholder="Ex: Gélules végétales, Huile..."
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white outline-none"
                      />
                    </div>
                  </div>
                )}

              </div>

              {/* Submit / Cancel Buttons */}
              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold disabled:opacity-50"
                >
                  {isSavingProduct ? 'Enregistrement...' : 'Valider les Modifications'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
