import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { FilialeId } from './src/models/ProductFiliale';
import { MultiShopGlobalNav } from './src/components/MultiShopGlobalNav';
import { UnifiedAuthModal } from './src/components/UnifiedAuthModal';
import { SessionExpiryModal } from './src/components/SessionExpiryModal';
import { MultiShopClientAuth } from './src/components/MultiShopClientAuth';
import { GlobalMultiShopBackoffice } from './src/components/admin/GlobalMultiShopBackoffice';
import { DedicatedFilialeBackoffice } from './src/components/admin/DedicatedFilialeBackoffice';
import { ShopMaintenanceScreen } from './src/components/ShopMaintenanceScreen';
import {
  getCachedSiteVisibility,
  isSiteInMaintenanceInFrontOffice,
  isSiteHiddenInFrontOffice,
  SiteVisibilityMap
} from './src/utils/siteVisibility';
import { getRealtimeSocket } from './src/utils/realtimeClient';

// Lazy load each shop application template
const NutritionShopApp = React.lazy(() => import('./templates/nutrition/App'));
const YoupiShopApp = React.lazy(() => import('./templates/youpi/App'));
const DariShopApp = React.lazy(() => import('./templates/dari/App'));

export type AppMode = 'backoffice' | 'frontoffice';
export type BackofficeScope = 'hq' | FilialeId;

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

  const [backofficeScope, setBackofficeScope] = useState<BackofficeScope>(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#/admin/nutrition')) return 'nutrition';
    if (hash.startsWith('#/admin/youpi')) return 'youpi';
    if (hash.startsWith('#/admin/dari')) return 'dari';
    return 'hq';
  });

  const [currentShop, setCurrentShop] = useState<FilialeId>(() => {
    const params = new URLSearchParams(window.location.search);
    const shopParam = params.get('shop') as FilialeId;
    if (shopParam && ['nutrition', 'youpi', 'dari'].includes(shopParam)) {
      return shopParam;
    }
    const saved = localStorage.getItem('multishop_active_shop') as FilialeId;
    if (saved && ['nutrition', 'youpi', 'dari'].includes(saved)) {
      return saved;
    }
    return 'nutrition';
  });

  // Single Unified User State (SSO across all 5 shops & backoffice)
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [siteVisibility, setSiteVisibility] = useState<SiteVisibilityMap>(getCachedSiteVisibility);
  const [isClientAuthRoute, setIsClientAuthRoute] = useState<boolean>(() => {
    return window.location.hash.startsWith('#/login') || window.location.hash.startsWith('#/register');
  });

  useEffect(() => {
    getRealtimeSocket();
    const handleVis = (e: any) => {
      if (e.detail) setSiteVisibility(e.detail);
    };
    window.addEventListener('site-visibility-changed', handleVis);
    return () => window.removeEventListener('site-visibility-changed', handleVis);
  }, []);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      setIsClientAuthRoute(hash.startsWith('#/login') || hash.startsWith('#/register'));
      if (hash.startsWith('#/admin/nutrition')) {
        setAppMode('backoffice');
        setBackofficeScope('nutrition');
      } else if (hash.startsWith('#/admin/youpi')) {
        setAppMode('backoffice');
        setBackofficeScope('youpi');
      } else if (hash.startsWith('#/admin/dari')) {
        setAppMode('backoffice');
        setBackofficeScope('dari');
      } else if (hash === '#/admin' || hash === '#/admin/hq') {
        setAppMode('backoffice');
        setBackofficeScope('hq');
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Initialize and load current user dynamically from backend API via HTTPOnly cookies
  const fetchUser = async () => {
    const wasManualLogout = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('multishop_logged_out') === 'true';

    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Accept': 'application/json' },
        credentials: 'include'
      });
      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.removeItem('multishop_logged_out');
        }
        return;
      }

      // Initial bootstrap fallback if opening directly in backoffice and not manually logged out
      if (appMode === 'backoffice' && !wasManualLogout) {
        const resAdmin = await fetch('/api/auth/me', {
          headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer jwt-admin-token-super'
          },
          credentials: 'include'
        });
        if (resAdmin.ok) {
          const adminUser = await resAdmin.json();
          setCurrentUser(adminUser);
          return;
        }
      }
      setCurrentUser(null);
    } catch {
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
      if (backofficeScope === 'hq') {
        document.title = 'MultiShop | Backoffice Général Groupe';
      } else {
        const titles: Record<FilialeId, string> = {
          nutrition: 'Fitness Shop | Administration Dédiée',
          youpi: 'YoupiShop | Administration Dédiée',
          dari: 'DariShop | Administration Dédiée'
        };
        document.title = titles[backofficeScope] || 'MultiShop Backoffice';
      }
    } else {
      const titles: Record<FilialeId, string> = {
        nutrition: 'Fitness Shop | Équipements de Musculation & Fitness Pro',
        youpi: "YoupiShop | Jouets d'Éveil & Jeux d'Enfants",
        dari: 'DariShop | Maison, Décoration & Mobilier Contemporain'
      };
      document.title = titles[currentShop] || 'MultiShop Network';
    }

    // Dynamic Canonical URL synchronization
    try {
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = window.location.href;
    } catch {}
  }, [currentShop, appMode, backofficeScope]);

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

  const VALID_FILIALES: FilialeId[] = ['nutrition', 'youpi', 'dari'];

  const handleGoToStorefront = (shopId?: any) => {
    if (typeof shopId === 'string' && VALID_FILIALES.includes(shopId as FilialeId)) {
      handleSwitchShop(shopId as FilialeId);
    }
    setAppMode('frontoffice');
    window.location.hash = '#/';
  };

  const handleGoToBackoffice = (filialeId?: any) => {
    setAppMode('backoffice');
    if (typeof filialeId === 'string' && VALID_FILIALES.includes(filialeId as FilialeId)) {
      setBackofficeScope(filialeId as FilialeId);
      window.location.hash = `#/admin/${filialeId}`;
    } else {
      setBackofficeScope('hq');
      window.location.hash = '#/admin';
    }
  };

  const handleLoginSuccess = (user: any) => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('multishop_logged_out');
    }
    setCurrentUser(user);
    window.dispatchEvent(new CustomEvent('auth-changed', { detail: { user } }));
  };

  const handleLogout = async () => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('multishop_logged_out', 'true');
    }
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    window.dispatchEvent(new CustomEvent('auth-changed', { detail: { user: null } }));
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      
      {/* 1. BACKOFFICE MODE (Single unified backoffice console) */}
      {appMode === 'backoffice' ? (
        <GlobalMultiShopBackoffice
          initialShop={backofficeScope === 'hq' ? 'all' : backofficeScope}
          onSelectShopContext={(newShopId) => {
            if (newShopId === 'all') {
              setBackofficeScope('hq');
              window.location.hash = '#/admin';
            } else {
              setBackofficeScope(newShopId as FilialeId);
              window.location.hash = `#/admin/${newShopId}`;
            }
          }}
          onGoToStorefront={handleGoToStorefront}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onLoginSuccess={handleLoginSuccess}
        />
      ) : (
        /* 2. FRONTOFFICE MODE (Public storefronts) */
        <div className="flex-1 flex flex-col">
          {isClientAuthRoute ? (
            <MultiShopClientAuth
              isOpen={true}
              initialMode={window.location.hash.startsWith('#/register') ? 'register' : 'login'}
              onClose={() => {
                window.location.hash = '#/';
              }}
              onNavigateHome={() => {
                window.location.hash = '#/';
              }}
              currentUser={currentUser}
              onLoginSuccess={(user, token) => {
                handleLoginSuccess(user, token);
                window.location.hash = '#/';
              }}
              onLogout={handleLogout}
              currentShop={currentShop}
              onSwitchShop={handleSwitchShop}
            />
          ) : (
            <>
              {/* Universal MultiShop Mini Top Navigation Bar */}
              {!isAuthModalOpen && (
                <MultiShopGlobalNav
                  currentShop={currentShop}
                  onSwitchShop={handleSwitchShop}
                  onGoToBackoffice={handleGoToBackoffice}
                  currentUser={currentUser}
                  onOpenAuthModal={() => setIsAuthModalOpen(true)}
                  onGoToLogin={() => { window.location.hash = '#/login'; }}
                  onGoToRegister={() => { window.location.hash = '#/register'; }}
                />
              )}

              {/* Active Storefront or Maintenance Screen */}
              <main className="flex-1 w-full relative">
                {isSiteInMaintenanceInFrontOffice(currentShop, siteVisibility) ? (
                  <ShopMaintenanceScreen
                    currentShop={currentShop}
                    onSwitchShop={handleSwitchShop}
                    siteVisibility={siteVisibility}
                  />
                ) : (
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
                    {currentShop === 'nutrition' && (
                      <NutritionShopApp
                        key="nutrition-app"
                        currentUser={currentUser}
                        onOpenAuthModal={() => setIsAuthModalOpen(true)}
                      />
                    )}
                    {currentShop === 'youpi' && (
                      <YoupiShopApp
                        key="youpi-app"
                        currentUser={currentUser}
                        onOpenAuthModal={() => setIsAuthModalOpen(true)}
                      />
                    )}
                    {currentShop === 'dari' && (
                      <DariShopApp
                        key="dari-app"
                        currentUser={currentUser}
                        onOpenAuthModal={() => setIsAuthModalOpen(true)}
                      />
                    )}
                  </Suspense>
                )}
              </main>
            </>
          )}
        </div>
      )}

      {/* Global SSO Session Expiry Management & Auto-Prolongation Modal */}
      <SessionExpiryModal
        currentUser={currentUser}
        onLogout={handleLogout}
        onGoToLogin={() => {
          setCurrentUser(null);
          if (appMode === 'backoffice') {
            window.location.hash = '#/login';
          } else {
            setAppMode('frontoffice');
            window.location.hash = '#/login';
          }
        }}
      />

      {/* Global SSO Authentication Modal (Shared for all 4 stores & Backoffice) */}
      <UnifiedAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        currentShop={currentShop}
        onSwitchShop={handleSwitchShop}
      />

    </div>
  );
};

export default App;
