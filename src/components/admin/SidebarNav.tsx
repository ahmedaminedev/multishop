import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Rocket,
  Store,
  Mail,
  Users,
  BarChart3,
  Settings,
  FolderTree,
  Tag,
  Boxes,
  Palette,
  MessageSquare,
  Globe,
  ChevronRight,
  ChevronDown,
  X,
  Sparkles,
  Building2,
  Compass,
  EyeOff,
  Wrench
} from 'lucide-react';
import { MultiShopLogo } from './MultiShopLogo';
import { 
  getCachedSiteVisibility, 
  isSiteHiddenInBackOffice, 
  isSiteInMaintenanceInBackOffice,
  SiteVisibilityMap 
} from '../../utils/siteVisibility';

export type SidebarMenuItem =
  | 'dashboard'
  | 'orders'
  | 'products'
  | 'sources'
  | 'future-products'
  | 'suppliers'
  | 'promotions'
  | 'stores'
  | 'messages'
  | 'users'
  | 'reports'
  | 'settings'
  | 'categories'
  | 'brands'
  | 'packs'
  | 'home'
  | 'chat';

export type ShopContextId = 'all' | 'para' | 'nutrition' | 'cosmetic' | 'electro';

interface SidebarNavProps {
  currentMenu: SidebarMenuItem;
  onSelectMenu: (menu: SidebarMenuItem) => void;
  activeShop?: ShopContextId;
  onSelectShop?: (shop: ShopContextId) => void;
  ordersBadge?: number;
  messagesBadge?: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const SHOP_CONFIGS: Record<string, { name: string; icon: string; color: string; bg: string }> = {
  all: { name: 'Toutes les boutiques', icon: '🌐', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  para: { name: 'PharmaShop', icon: '🌿', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  nutrition: { name: 'Fitness Shop', icon: '🏋️‍♂️', color: 'text-lime-700', bg: 'bg-lime-50 border-lime-200' },
  cosmetic: { name: 'Cosmetics Shop', icon: '💄', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
  electro: { name: 'Electro Shop', icon: '🔌', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' }
};

export const SidebarNav: React.FC<SidebarNavProps> = ({
  currentMenu,
  onSelectMenu,
  activeShop = 'all',
  onSelectShop,
  ordersBadge = 0,
  messagesBadge = 0,
  isMobileOpen = false,
  onCloseMobile
}) => {
  // Listen to site visibility changes
  const [siteVisibility, setSiteVisibility] = useState<SiteVisibilityMap>(getCachedSiteVisibility);
  useEffect(() => {
    const handleVis = (e: any) => {
      if (e.detail) setSiteVisibility(e.detail);
    };
    window.addEventListener('site-visibility-changed', handleVis);
    return () => window.removeEventListener('site-visibility-changed', handleVis);
  }, []);

  // User Requirement 1: Hide "Modules par boutique" content by default, only reveal upon click!
  const isContextualActive = ['categories', 'brands', 'packs', 'home', 'chat'].includes(currentMenu);
  const [isModulesOpen, setIsModulesOpen] = useState(isContextualActive);

  // Automatically expand if user switches into a contextual menu
  useEffect(() => {
    if (isContextualActive) {
      setIsModulesOpen(true);
    }
  }, [currentMenu, isContextualActive]);

  // 1. Group-wide transversal navigation items
  const globalMenuItems = [
    { id: 'dashboard' as SidebarMenuItem, label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'orders' as SidebarMenuItem, label: 'Commandes', icon: ShoppingCart, badge: ordersBadge },
    { id: 'products' as SidebarMenuItem, label: 'Catalogue & Stock', icon: Package },
    { id: 'sources' as SidebarMenuItem, label: 'Sources de Veille', icon: Compass },
    { id: 'future-products' as SidebarMenuItem, label: 'Futurs Produits', icon: Sparkles },
    { id: 'suppliers' as SidebarMenuItem, label: 'Fournisseurs & Stock', icon: Building2 },
    { id: 'promotions' as SidebarMenuItem, label: 'Promotions', icon: Rocket },
    { id: 'stores' as SidebarMenuItem, label: 'Stores', icon: Store },
    { id: 'messages' as SidebarMenuItem, label: 'Messages', icon: Mail, badge: messagesBadge },
    { id: 'users' as SidebarMenuItem, label: 'Utilisateurs', icon: Users },
    { id: 'reports' as SidebarMenuItem, label: 'Rapports', icon: BarChart3 },
    { id: 'settings' as SidebarMenuItem, label: 'Paramètres', icon: Settings },
  ];

  // 2. Contextual items specific to a store
  const contextualMenuItems = [
    { id: 'categories' as SidebarMenuItem, label: 'Catégories', icon: FolderTree },
    ...(activeShop !== 'electro' ? [{ id: 'brands' as SidebarMenuItem, label: 'Marques', icon: Tag }] : []),
    { id: 'packs' as SidebarMenuItem, label: 'Packs & Bundles', icon: Boxes },
    { id: 'home' as SidebarMenuItem, label: "Page d'accueil & Ads", icon: Palette },
    { id: 'chat' as SidebarMenuItem, label: 'Live Chat Support', icon: MessageSquare },
  ];

  const handleItemClick = (id: SidebarMenuItem) => {
    onSelectMenu(id);
    if (onCloseMobile) onCloseMobile();
  };

  const currentShopInfo = SHOP_CONFIGS[activeShop] || SHOP_CONFIGS.all;
  const isCurrentShopHidden = activeShop !== 'all' && isSiteHiddenInBackOffice(activeShop, siteVisibility);
  const isCurrentShopMaintenance = activeShop !== 'all' && isSiteInMaintenanceInBackOffice(activeShop, siteVisibility);

  const navContent = (
    <div className="flex flex-col h-full justify-between">
      <div className="p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto">
        {/* Brand Logo & Mobile Close */}
        <div className="px-1 py-1 flex items-center justify-between">
          <MultiShopLogo />
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Active Store Context Indicator in Sidebar */}
        <div className={`p-3 rounded-2xl border ${currentShopInfo.bg} flex items-center justify-between`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xl shrink-0">{currentShopInfo.icon}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-tight">
                  {activeShop === 'all' ? 'Contexte Actif' : 'Boutique Active'}
                </p>
                {isCurrentShopHidden && (
                  <span className="text-[9px] bg-red-100 text-red-700 px-1 rounded font-bold flex items-center gap-0.5">
                    <EyeOff className="w-2.5 h-2.5" /> Masqué
                  </span>
                )}
                {isCurrentShopMaintenance && (
                  <span className="text-[9px] bg-amber-100 text-amber-800 px-1 rounded font-bold flex items-center gap-0.5">
                    <Wrench className="w-2.5 h-2.5" /> Maint.
                  </span>
                )}
              </div>
              <p className={`text-xs font-black truncate ${currentShopInfo.color}`}>
                {currentShopInfo.name}
              </p>
            </div>
          </div>
          {activeShop !== 'all' && onSelectShop && (
            <button
              type="button"
              onClick={() => onSelectShop('all')}
              title="Revenir à la vue consolidée"
              className="text-[10px] text-blue-600 hover:text-blue-800 bg-white/80 hover:bg-white px-2 py-1 rounded-lg border border-blue-200 font-semibold cursor-pointer shrink-0 transition-colors"
            >
              Tous
            </button>
          )}
        </div>

        {/* SECTION 1: GLOBAL MULTISHOP (Fonctionnalités transversales) */}
        <div>
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Gestion Globale Groupe
          </p>
          <nav className="flex flex-col gap-1">
            {globalMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentMenu === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item.id)}
                  className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {Boolean(item.badge && item.badge > 0) && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* SECTION 2: CONTEXTUAL STORE MODULES (COLLAPSIBLE ON CLICK - USER REQUIREMENT 1) */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setIsModulesOpen(prev => !prev)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer group ${
              isModulesOpen
                ? 'bg-slate-100/90 text-slate-900 shadow-2xs'
                : 'hover:bg-slate-50 text-slate-600'
            }`}
            title="Cliquer pour afficher ou masquer les modules spécifiques à la boutique"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className={`p-1 rounded-md transition-colors ${
                isModulesOpen ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400 group-hover:text-slate-700'
              }`}>
                {isModulesOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </span>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider truncate">
                  {activeShop === 'all' ? 'Modules par Boutique' : `Modules ${currentShopInfo.name}`}
                </p>
                <p className="text-[9px] text-slate-400 font-normal">
                  {isModulesOpen ? '5 modules affichés' : 'Masqué (Cliquer pour voir)'}
                </p>
              </div>
            </div>

            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md transition-colors shrink-0 ${
              isModulesOpen
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200/70 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-700'
            }`}>
              {isModulesOpen ? 'Fermer' : 'Afficher'}
            </span>
          </button>

          {/* Collapsible Content: ONLY rendered when clicked */}
          {isModulesOpen && (
            <nav className="flex flex-col gap-1 mt-1 pl-1 animate-fadeIn">
              {contextualMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentMenu === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleItemClick(item.id)}
                    className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white/80' : 'text-slate-300'}`} />
                  </button>
                );
              })}
            </nav>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-slate-100">
        <MultiShopLogo showSubtitle size="sm" />
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-100 flex-col justify-between h-screen sticky top-0 z-40 select-none shrink-0 shadow-[1px_0_4px_rgba(0,0,0,0.02)]">
        {navContent}
      </aside>

      {/* 2. Mobile Responsive Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-fadeIn">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white z-50 shadow-2xl flex flex-col justify-between overflow-y-auto">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
};
