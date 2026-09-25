import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import { StoreSwitcher } from './components/layout/StoreSwitcher';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { StoresPage } from './pages/StoresPage';
import { ProductsPage } from './pages/ProductsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { PacksPage } from './pages/PacksPage';
import { OrdersPage } from './pages/OrdersPage';
import { MessagesPage } from './pages/MessagesPage';
import { OffersPage } from './pages/OffersPage';
import { BrandsPage } from './pages/BrandsPage';
import { CustomersPage } from './pages/CustomersPage';
import { MarketingPage } from './pages/MarketingPage';

const navItems = [
  { id: 'dashboard', label: 'Tableau de bord', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'stores', label: 'Boutiques (Tenants)', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { id: 'products', label: 'Catalogue Produits', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { id: 'categories', label: 'Catégories & Sous-Catégories', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
  { id: 'packs', label: 'Packs & Coffrets', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
  { id: 'orders', label: 'Commandes', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
  { id: 'messages', label: 'Messages Clients', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
  { id: 'offers', label: 'Offres & Promotions', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
  { id: 'brands', label: 'Marques Partenaires', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
  { id: 'customers', label: 'Utilisateurs & Rôles', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { id: 'marketing', label: 'Marketing & Pixels', icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z' },
];

const AdminDashboardLayout: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout, sessionExpired } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-semibold tracking-wide text-slate-400">Vérification de la session administrateur...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <StoreProvider>
      <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          {/* Logo & Brand */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-base shadow-sm">
                M
              </div>
              <div>
                <span className="font-bold text-white text-base tracking-tight">MultiShop</span>
                <span className="block text-[10px] text-indigo-400 font-mono font-semibold uppercase tracking-wider">Backoffice Unifié</span>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const active = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} />
                  </svg>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Admin User Mini Card & Hub quick link */}
          <div className="p-3 border-t border-slate-800 space-y-2 bg-slate-950/40">
            <div className="flex items-center justify-between px-2 py-1">
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{user?.name || 'Administrateur'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                user?.role === 'SUPER_ADMIN' ? 'bg-purple-900/60 text-purple-300 border border-purple-700/50' : 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
              }`}>
                {user?.role === 'SUPER_ADMIN' ? 'SUPER' : 'STORE'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <a
                href="/"
                className="flex items-center justify-center py-1.5 px-2 text-[11px] font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700/60 text-center"
              >
                Portail Hub
              </a>
              <button
                onClick={() => logout()}
                className="flex items-center justify-center py-1.5 px-2 text-[11px] font-semibold text-rose-400 bg-rose-950/30 hover:bg-rose-900/40 rounded-lg transition-colors border border-rose-800/40 text-center"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </aside>

        {/* Backdrop for mobile sidebar */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Header */}
          <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-slate-500 hover:text-slate-700"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <StoreSwitcher />
            </div>

            <div className="flex items-center gap-4">
              {/* Session status banner */}
              {sessionExpired && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs font-semibold animate-pulse">
                  <span>Session expirée</span>
                  <button onClick={() => logout()} className="underline text-amber-900">Se reconnecter</button>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="hidden sm:inline font-medium">Multi-Tenant Sécurisé</span>
              </div>

              {/* Admin profile & logout button */}
              <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-800">{user?.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {user?.role === 'SUPER_ADMIN' ? 'Super Administrateur' : `Admin (${user?.storeSlug || 'Store'})`}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
                </div>
                <button
                  onClick={() => logout()}
                  title="Déconnexion sécurisée"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </header>

          {/* Page Body */}
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
              {currentPage === 'dashboard' && <Dashboard />}
              {currentPage === 'stores' && <StoresPage />}
              {currentPage === 'products' && <ProductsPage />}
              {currentPage === 'categories' && <CategoriesPage />}
              {currentPage === 'packs' && <PacksPage />}
              {currentPage === 'orders' && <OrdersPage />}
              {currentPage === 'messages' && <MessagesPage />}
              {currentPage === 'offers' && <OffersPage />}
              {currentPage === 'brands' && <BrandsPage />}
              {currentPage === 'customers' && <CustomersPage />}
              {currentPage === 'marketing' && <MarketingPage />}
            </div>
          </main>
        </div>
      </div>
    </StoreProvider>
  );
};

export const AdminApp: React.FC = () => {
  return (
    <AuthProvider>
      <AdminDashboardLayout />
    </AuthProvider>
  );
};

export default AdminApp;
