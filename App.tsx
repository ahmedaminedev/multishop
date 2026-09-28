import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { FilialeId } from './src/models/ProductFiliale';
import { MultiShopGlobalNav } from './src/components/MultiShopGlobalNav';
import { UnifiedAuthModal } from './src/components/UnifiedAuthModal';
import { GlobalMultiShopBackoffice } from './src/components/admin/GlobalMultiShopBackoffice';

// Lazy load each shop application
const ParaShopApp = React.lazy(() => import('./ParaShop-main/App'));
const NutritionShopApp = React.lazy(() => import('./NutritionShop-main/App'));
const CosmeticShopApp = React.lazy(() => import('./cosmeticshop-main/App'));
const ElectroShopApp = React.lazy(() => import('./electro_shop-main/App'));

export type AppMode = 'backoffice' | 'frontoffice';

export const App: React.FC = () => {
  // STARTUP REQUIREMENT: By default on boot, land directly in the General Backoffice!
  const [appMode, setAppMode] = useState<AppMode>(() => {
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get('mode') as AppMode;
    if (modeParam === 'frontoffice') return 'frontoffice';
    // Check hash for direct storefront navigation
    if (window.location.hash.startsWith('#/store/')) return 'frontoffice';
    return 'backoffice'; // Default on startup
  });

  const [currentShop, setCurrentShop] = useState<FilialeId>(() => {
    const params = new URLSearchParams(window.location.search);
    const shopParam = params.get('shop') as FilialeId;
    if (shopParam && ['para', 'nutrition', 'cosmetic', 'electro'].includes(shopParam)) {
      return shopParam;
    }
    const saved = localStorage.getItem('multishop_active_shop') as FilialeId;
    if (saved && ['para', 'nutrition', 'cosmetic', 'electro'].includes(saved)) {
      return saved;
    }
    return 'para';
  });

  // Single Unified User State (SSO across all 4 shops & backoffice)
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Initialize and load current user dynamically from backend API
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token && token !== 'null' && token !== 'undefined') {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch('/api/auth/me', { headers, credentials: 'include' });
      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      console.error('Failed to load user:', err);
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    fetchUser();

    const handleAuthChange = (e: any) => {
      if (e.detail?.user !== undefined) {
        setCurrentUser(e.detail.user);
      } else {
        fetchUser();
      }
    };

    window.addEventListener('auth-changed', handleAuthChange);
    window.addEventListener('storage', fetchUser);
    return () => {
      window.removeEventListener('auth-changed', handleAuthChange);
      window.removeEventListener('storage', fetchUser);
    };
  }, []);

  // Sync shop cookie and title
  useEffect(() => {
    document.cookie = `shop=${currentShop}; path=/; max-age=31536000; SameSite=Lax`;
    if (appMode === 'backoffice') {
      document.title = 'MultiShop | Backoffice Général Groupe';
    } else {
      const titles: Record<FilialeId, string> = {
        para: 'PharmaNature | Parapharmacie & Soins Bio',
        nutrition: 'IronFuel Nutrition | Elite Sport & Performance',
        cosmetic: 'Cosmetics Shop | Beauté, Soins & Luxe',
        electro: 'Electro Shop | High-Tech & Électroménager'
      };
      document.title = titles[currentShop] || 'MultiShop Network';
    }
  }, [currentShop, appMode]);

  const handleSwitchShop = async (newShopId: FilialeId) => {
    setCurrentShop(newShopId);
    localStorage.setItem('multishop_active_shop', newShopId);
    document.cookie = `shop=${newShopId}; path=/; max-age=31536000; SameSite=Lax`;

    try {
      await fetch('/api/set-shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop: newShopId })
      });
    } catch {
      // Backend handles fallback
    }

    // Reset hash to home page of that shop
    window.location.hash = '#/';
  };

  const handleGoToStorefront = (shopId?: FilialeId) => {
    if (shopId) {
      handleSwitchShop(shopId);
    }
    setAppMode('frontoffice');
    window.location.hash = '#/';
  };

  const handleGoToBackoffice = () => {
    setAppMode('backoffice');
    window.location.hash = '#/';
  };

  const handleLoginSuccess = (user: any, token: string) => {
    localStorage.setItem('token', token);
    setCurrentUser(user);
    window.dispatchEvent(new CustomEvent('auth-changed', { detail: { user, token } }));
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        credentials: 'include'
      });
    } catch {}
    localStorage.removeItem('token');
    setCurrentUser(null);
    window.dispatchEvent(new CustomEvent('auth-changed', { detail: { user: null, token: null } }));
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      
      {/* 1. BACKOFFICE MODE (Active by default on project startup) */}
      {appMode === 'backoffice' ? (
        <GlobalMultiShopBackoffice
          onGoToStorefront={handleGoToStorefront}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />
      ) : (
        /* 2. FRONTOFFICE MODE (Public storefronts) */
        <div className="flex-1 flex flex-col">
          {/* Universal MultiShop Mini Top Navigation Bar */}
          <MultiShopGlobalNav
            currentShop={currentShop}
            onSwitchShop={handleSwitchShop}
            onGoToBackoffice={handleGoToBackoffice}
            currentUser={currentUser}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />

          {/* Active Storefront */}
          <main className="flex-1 w-full relative">
            <Suspense
              fallback={
                <div className="flex flex-col items-center justify-center min-h-[70vh] bg-slate-50 dark:bg-slate-900 gap-4">
                  <div className="w-12 h-12 border-4 border-slate-300 border-t-indigo-600 rounded-full animate-spin"></div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                    Chargement de la boutique...
                  </p>
                </div>
              }
            >
              {currentShop === 'para' && <ParaShopApp key="para-app" />}
              {currentShop === 'nutrition' && <NutritionShopApp key="nutrition-app" />}
              {currentShop === 'cosmetic' && <CosmeticShopApp key="cosmetic-app" />}
              {currentShop === 'electro' && <ElectroShopApp key="electro-app" />}
            </Suspense>
          </main>
        </div>
      )}

      {/* Global SSO Authentication Modal (Shared for all 4 stores & Backoffice) */}
      <UnifiedAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
      />

    </div>
  );
};

export default App;
