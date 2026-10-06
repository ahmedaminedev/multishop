import React from 'react';
import { Phone, Store, LayoutDashboard, ChevronRight, User, ShieldCheck, Wrench } from 'lucide-react';
import { FilialeId } from '../models/ProductFiliale';
import { MultiShopLogo } from './admin/MultiShopLogo';
import { 
  getCachedSiteVisibility, 
  fetchSiteVisibility, 
  isSiteHiddenInFrontOffice, 
  isSiteInMaintenanceInFrontOffice, 
  SiteVisibilityMap 
} from '../utils/siteVisibility';

export interface MultiShopStoreConfig {
  id: FilialeId;
  name: string;
  tabLabel: string;
  tagline: string;
  badge: string;
  icon: string;
  enumType: string;
}

export const MULTISHOP_STORES: MultiShopStoreConfig[] = [
  {
    id: 'nutrition',
    name: 'Fitness Shop',
    tabLabel: 'Fitness Shop',
    tagline: 'Équipements de Musculation & Fitness',
    badge: 'Fitness & Muscu',
    icon: '🏋️‍♂️',
    enumType: 'produit_myshops_nutrition'
  },
  {
    id: 'youpi',
    name: 'YoupiShop',
    tabLabel: 'YoupiShop',
    tagline: 'Jeux d\'Éveil & Jouets d\'Enfant',
    badge: 'Jeux & Jouets',
    icon: '🧸',
    enumType: 'produit_myshops_youpi'
  }
];

interface MultiShopGlobalNavProps {
  currentShop: FilialeId;
  onSwitchShop: (shopId: FilialeId) => void;
  onGoToBackoffice?: () => void;
  currentUser: any;
  onOpenAuthModal: () => void;
  onGoToLogin?: () => void;
  onGoToRegister?: () => void;
}

export const MultiShopGlobalNav: React.FC<MultiShopGlobalNavProps> = ({
  currentShop,
  onSwitchShop,
  onGoToBackoffice,
  currentUser,
  onOpenAuthModal,
  onGoToLogin,
  onGoToRegister
}) => {
  // Listen to real-time site visibility changes
  const [siteVisibility, setSiteVisibility] = React.useState<SiteVisibilityMap>(getCachedSiteVisibility);

  React.useEffect(() => {
    fetchSiteVisibility().then(setSiteVisibility);
    const handleVis = (e: any) => {
      if (e.detail) setSiteVisibility(e.detail);
    };
    window.addEventListener('site-visibility-changed', handleVis);
    return () => window.removeEventListener('site-visibility-changed', handleVis);
  }, []);

  // If current shop is hidden from front-office, automatically switch to first visible shop
  React.useEffect(() => {
    if (isSiteHiddenInFrontOffice(currentShop, siteVisibility)) {
      const firstVisible = MULTISHOP_STORES.find(s => !isSiteHiddenInFrontOffice(s.id, siteVisibility));
      if (firstVisible) {
        onSwitchShop(firstVisible.id);
      }
    }
  }, [currentShop, siteVisibility, onSwitchShop]);

  const currentStore = MULTISHOP_STORES.find(s => s.id === currentShop) || MULTISHOP_STORES[0];
  const navContainerRef = React.useRef<HTMLDivElement>(null);

  // Dynamically synchronize MultiShop navbar height into CSS variable so the sub-navbar underneath sticks right below it without gap or overlap
  React.useEffect(() => {
    const updateNavHeight = () => {
      if (navContainerRef.current) {
        const height = navContainerRef.current.offsetHeight;
        document.documentElement.style.setProperty('--multishop-globalnav-height', `${height}px`);
      }
    };

    updateNavHeight();
    window.addEventListener('resize', updateNavHeight);
    return () => window.removeEventListener('resize', updateNavHeight);
  }, [currentUser]);

  return (
    <div 
      ref={navContainerRef}
      className="sticky top-0 z-[120] w-full font-sans shadow-md select-none bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800"
    >
      <nav className="w-full">
        {/* Top Micro-Bar: Network status and customer service info */}
        <div className="w-full bg-slate-900 text-white px-3 sm:px-6 py-1 text-[11px] border-b border-white/10 hidden sm:block">
          <div className="w-full flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center gap-1.5 font-bold tracking-wider text-blue-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                GROUPE MULTISHOP TUNISIE
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-300 font-medium truncate">
                Réseau Centralisé : Fitness & Musculation Pro, Jouets d'Éveil YoupiShop
              </span>
            </div>

            <div className="flex items-center gap-4 text-slate-300 font-medium shrink-0">
              <span className="flex items-center gap-1.5 text-blue-300">
                <Phone className="w-3 h-3 text-blue-400" />
                <span>Assistance : <strong>+216 55 263 522</strong></span>
              </span>
              <span className="text-slate-600 hidden md:inline">•</span>
              <span className="text-slate-400 hidden md:inline">Livraison Express 24/48h</span>
            </div>
          </div>
        </div>

        {/* Main Bar: Fluid 100% width container */}
        <div className="w-full px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
          <div className="w-full flex items-center justify-between gap-2 sm:gap-4 flex-nowrap">
            
            {/* Left: MultiShop Corporate Logo & Active Shop Indicator */}
            <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
              <div className="hidden sm:block">
                <MultiShopLogo size="md" showSubtitle={false} />
              </div>
              <div className="sm:hidden">
                <MultiShopLogo size="sm" showSubtitle={false} />
              </div>

              <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800">
                <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Boutique
                </span>
                <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
                  <span>{currentStore.icon}</span>
                  <span className="truncate max-w-[130px]">{currentStore.name}</span>
                </span>
              </div>
            </div>

            {/* Center: Switcher between the sub-shops */}
            <div className="flex items-center justify-center flex-1 max-w-md mx-1 sm:mx-2 min-w-0">
              <div className="w-full flex items-center justify-center gap-1 sm:gap-2 bg-slate-100 dark:bg-slate-900/90 p-1 sm:p-1.5 rounded-xl border border-slate-200/90 dark:border-slate-800">
                {(() => {
                  const visibleStores = MULTISHOP_STORES.filter(s => !isSiteHiddenInFrontOffice(s.id, siteVisibility));
                  const storesToRender = visibleStores.length > 0 ? visibleStores : MULTISHOP_STORES;

                  return storesToRender.map((shop) => {
                    const isCurrent = shop.id === currentShop;
                    const inMaintenance = isSiteInMaintenanceInFrontOffice(shop.id, siteVisibility);

                    return (
                      <button
                        key={shop.id}
                        type="button"
                        onClick={() => onSwitchShop(shop.id)}
                        aria-label={`Accéder à la boutique ${shop.name}`}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-w-0 ${
                          isCurrent
                            ? inMaintenance
                              ? 'bg-amber-600 text-white shadow-sm shadow-amber-500/30'
                              : 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
                        }`}
                        title={`${shop.name} : ${inMaintenance ? '⚠️ Boutique en maintenance' : shop.tagline}`}
                      >
                        <span className="text-base shrink-0">{shop.icon}</span>
                        <span className="truncate text-xs font-extrabold">{shop.tabLabel}</span>
                        {inMaintenance ? (
                          <span className="text-[9px] bg-amber-400 text-amber-950 font-black px-1 rounded uppercase tracking-wider shrink-0 hidden md:inline">
                            Maint.
                          </span>
                        ) : isCurrent ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-white ml-0.5 animate-pulse hidden md:inline-block shrink-0"></span>
                        ) : null}
                      </button>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Right: Master Control (SSO Unified Login & Admin backoffice link) */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN') && onGoToBackoffice && (
                <button
                  type="button"
                  onClick={onGoToBackoffice}
                  aria-label="Accéder au backoffice d'administration du groupe"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs px-2.5 sm:px-3.5 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer hover:shadow-md"
                  title="Accéder au Backoffice Administrateur Général"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden lg:inline">Backoffice Groupe</span>
                  <span className="lg:hidden">Admin</span>
                </button>
              )}

              {/* SSO Account Profile */}
              {currentUser ? (
                <button
                  type="button"
                  onClick={onOpenAuthModal}
                  aria-label="Gérer mon compte client MultiShop"
                  className="flex items-center gap-2 p-1 sm:p-1.5 pl-2 sm:pl-2.5 pr-2 sm:pr-3 rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800 cursor-pointer shadow-xs"
                  title={`Connecté: ${currentUser.email} (${currentUser.role === 'ADMIN' ? 'Administrateur' : 'Client'})`}
                >
                  <div className="w-7 h-7 rounded-md bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs uppercase">
                    {currentUser.firstName?.[0] || currentUser.email?.[0] || 'U'}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-[9px] uppercase font-black text-blue-600 dark:text-blue-400 leading-tight">
                      Groupe
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[100px] truncate leading-tight">
                      {currentUser.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim() : (currentUser.email?.split('@')[0] || 'Compte')}
                    </span>
                  </div>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (onGoToLogin) onGoToLogin();
                      else onOpenAuthModal();
                    }}
                    aria-label="Se connecter à votre compte MultiShop"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold transition-all shadow-xs cursor-pointer"
                    title="Se connecter au compte unique MultiShop"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Connexion</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onGoToRegister) onGoToRegister();
                      else onOpenAuthModal();
                    }}
                    aria-label="Créer un nouveau compte client MultiShop"
                    className="hidden md:flex items-center gap-1 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-extrabold transition-all shadow-sm cursor-pointer"
                    title="Créer un compte client MultiShop"
                  >
                    <span>S'inscrire</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </nav>
    </div>
  );
};
