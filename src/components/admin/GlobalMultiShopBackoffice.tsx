import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { FilialeId } from '../../models/ProductFiliale';
import { SidebarNav, SidebarMenuItem } from './SidebarNav';
import { TopHeader, BackofficeTab } from './TopHeader';
import { ConsolidatedDashboardView } from './ConsolidatedDashboardView';
import { GlobalOrdersView } from './GlobalOrdersView';
import { GlobalProductsView } from './GlobalProductsView';
import { GlobalOtherViews } from './GlobalOtherViews';

// Context providers for sub-backoffices
import { ThemeProvider as ParaThemeProvider } from '../../../ParaShop-main/components/ThemeContext';
import { ToastProvider as ParaToastProvider } from '../../../ParaShop-main/components/ToastContext';
import { CartProvider as ParaCartProvider } from '../../../ParaShop-main/components/CartContext';
import { FavoritesProvider as ParaFavoritesProvider } from '../../../ParaShop-main/components/FavoritesContext';
import { CompareProvider as ParaCompareProvider } from '../../../ParaShop-main/components/CompareContext';

import { ThemeProvider as NutritionThemeProvider } from '../../../NutritionShop-main/components/ThemeContext';
import { ToastProvider as NutritionToastProvider } from '../../../NutritionShop-main/components/ToastContext';
import { CartProvider as NutritionCartProvider } from '../../../NutritionShop-main/components/CartContext';
import { FavoritesProvider as NutritionFavoritesProvider } from '../../../NutritionShop-main/components/FavoritesContext';
import { CompareProvider as NutritionCompareProvider } from '../../../NutritionShop-main/components/CompareContext';

import { ThemeProvider as CosmeticThemeProvider } from '../../../cosmeticshop-main/components/ThemeContext';
import { ToastProvider as CosmeticToastProvider } from '../../../cosmeticshop-main/components/ToastContext';
import { CartProvider as CosmeticCartProvider } from '../../../cosmeticshop-main/components/CartContext';
import { FavoritesProvider as CosmeticFavoritesProvider } from '../../../cosmeticshop-main/components/FavoritesContext';
import { CompareProvider as CosmeticCompareProvider } from '../../../cosmeticshop-main/components/CompareContext';

import { ThemeProvider as ElectroThemeProvider } from '../../../electro_shop-main/components/ThemeContext';
import { ToastProvider as ElectroToastProvider } from '../../../electro_shop-main/components/ToastContext';
import { CartProvider as ElectroCartProvider } from '../../../electro_shop-main/components/CartContext';
import { FavoritesProvider as ElectroFavoritesProvider } from '../../../electro_shop-main/components/FavoritesContext';
import { CompareProvider as ElectroCompareProvider } from '../../../electro_shop-main/components/CompareContext';

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
        <div className="p-8 text-center bg-white border border-red-200 rounded-2xl space-y-4 shadow-sm m-6">
          <span className="text-3xl">⚠️</span>
          <h3 className="text-base font-bold text-slate-900">
            Impossible de charger le sous-backoffice {this.props.filialeName}
          </h3>
          <p className="text-xs text-slate-500">{this.state.error?.message || "Erreur interne"}</p>
          <button
            onClick={this.props.onBackToHq}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer"
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

export const GlobalMultiShopBackoffice: React.FC<GlobalBackofficeProps> = ({
  onGoToStorefront,
  currentUser,
  onLogout,
  onOpenAuthModal
}) => {
  const [activeTab, setActiveTab] = useState<BackofficeTab>('hq');
  const [currentMenu, setCurrentMenu] = useState<SidebarMenuItem>('dashboard');

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

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex font-sans">
      
      {/* 1. Exact Left Sidebar (Matching Screenshot) */}
      <SidebarNav
        currentMenu={currentMenu}
        onSelectMenu={(menu) => {
          setCurrentMenu(menu);
          setActiveTab('hq'); // When selecting from sidebar, ensure we are in HQ view
        }}
        ordersBadge={allOrders.length}
      />

      {/* 2. Main Right Section */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <TopHeader
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          onGoToStorefront={onGoToStorefront}
          currentUser={currentUser}
          onLogout={onLogout}
          onOpenAuthModal={onOpenAuthModal}
        />

        {/* Content Area */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          
          {/* TAB 1: GROUP HQ CONSOLIDATED VIEWS */}
          {activeTab === 'hq' && (
            <>
              {currentMenu === 'dashboard' && (
                <ConsolidatedDashboardView
                  stats={stats}
                  onRefresh={fetchGlobalData}
                  onSelectFilialeTab={(tab) => setActiveTab(tab)}
                  allProducts={allProducts}
                  allOrders={allOrders}
                  onNavigateToMenu={(menu) => setCurrentMenu(menu)}
                />
              )}

              {currentMenu === 'orders' && (
                <GlobalOrdersView
                  orders={allOrders}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                />
              )}

              {currentMenu === 'products' && (
                <GlobalProductsView
                  products={allProducts}
                  onSaveProduct={handleSaveProduct}
                />
              )}

              {['promotions', 'stores', 'messages', 'users', 'reports', 'settings'].includes(currentMenu) && (
                <GlobalOtherViews
                  currentMenu={currentMenu}
                  stats={stats}
                />
              )}
            </>
          )}

          {/* TAB 2: PHARMANATURE SUB-BACKOFFICE */}
          {activeTab === 'para' && (
            <SubAdminErrorBoundary filialeName="PharmaNature" onBackToHq={() => setActiveTab('hq')}>
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🌿</span>
                    <div>
                      <h2 className="font-extrabold text-sm text-emerald-900">
                        Sous-Backoffice Dédié : PharmaNature
                      </h2>
                      <p className="text-xs text-emerald-700">Parapharmacie, Phytothérapie & Soins Bio • produit_myshops_para</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('hq')}
                    type="button"
                    className="text-xs font-bold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-xs cursor-pointer"
                  >
                    ⬅ Revenir au Tableau de Bord HQ
                  </button>
                </div>
                
                <div className="bg-white rounded-2xl overflow-hidden shadow-xs border border-slate-100">
                  <ParaThemeProvider>
                    <ParaToastProvider>
                      <ParaCartProvider>
                        <ParaFavoritesProvider>
                          <ParaCompareProvider>
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
                          </ParaCompareProvider>
                        </ParaFavoritesProvider>
                      </ParaCartProvider>
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
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <h2 className="font-extrabold text-sm text-amber-900">
                        Sous-Backoffice Dédié : IronFuel Nutrition
                      </h2>
                      <p className="text-xs text-amber-700">Performance Sportive Elite & Protéines • produit_myshops_nutrition</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('hq')}
                    type="button"
                    className="text-xs font-bold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-xs cursor-pointer"
                  >
                    ⬅ Revenir au Tableau de Bord HQ
                  </button>
                </div>

                <div className="bg-white rounded-2xl overflow-hidden shadow-xs border border-slate-100">
                  <NutritionThemeProvider>
                    <NutritionToastProvider>
                      <NutritionCartProvider>
                        <NutritionFavoritesProvider>
                          <NutritionCompareProvider>
                            <Suspense fallback={<div className="p-12 text-center text-slate-400">Chargement du backoffice IronFuel...</div>}>
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
                          </NutritionCompareProvider>
                        </NutritionFavoritesProvider>
                      </NutritionCartProvider>
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
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">💄</span>
                    <div>
                      <h2 className="font-extrabold text-sm text-rose-900">
                        Sous-Backoffice Dédié : Cosmetics Shop
                      </h2>
                      <p className="text-xs text-rose-700">Soins, Beauté & Parfumerie de Luxe • produit_myshops_cosmetique</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('hq')}
                    type="button"
                    className="text-xs font-bold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-xs cursor-pointer"
                  >
                    ⬅ Revenir au Tableau de Bord HQ
                  </button>
                </div>

                <div className="bg-white rounded-2xl overflow-hidden shadow-xs border border-slate-100">
                  <CosmeticThemeProvider>
                    <CosmeticToastProvider>
                      <CosmeticCartProvider>
                        <CosmeticFavoritesProvider>
                          <CosmeticCompareProvider>
                            <Suspense fallback={<div className="p-12 text-center text-slate-400">Chargement du backoffice Cosmetics Shop...</div>}>
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
                          </CosmeticCompareProvider>
                        </CosmeticFavoritesProvider>
                      </CosmeticCartProvider>
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
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🔌</span>
                    <div>
                      <h2 className="font-extrabold text-sm text-blue-900">
                        Sous-Backoffice Dédié : Electro Shop
                      </h2>
                      <p className="text-xs text-blue-700">High-Tech, Électroménager & Maison • produit_myshops_electro</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('hq')}
                    type="button"
                    className="text-xs font-bold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-xs cursor-pointer"
                  >
                    ⬅ Revenir au Tableau de Bord HQ
                  </button>
                </div>

                <div className="bg-white rounded-2xl overflow-hidden shadow-xs border border-slate-100">
                  <ElectroThemeProvider>
                    <ElectroToastProvider>
                      <ElectroCartProvider>
                        <ElectroFavoritesProvider>
                          <ElectroCompareProvider>
                            <Suspense fallback={<div className="p-12 text-center text-slate-400">Chargement du backoffice Electro Shop...</div>}>
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
                </div>
              </div>
            </SubAdminErrorBoundary>
          )}

        </main>
      </div>

    </div>
  );
};
