import React, { useState, useEffect } from 'react';
import { Store, Bell, ChevronDown, Check, Menu, Globe, EyeOff, Wrench } from 'lucide-react';
import { FilialeId } from '../../models/ProductFiliale';
import { ShopContextId } from './SidebarNav';
import {
  getCachedSiteVisibility,
  isSiteHiddenInBackOffice,
  isSiteInMaintenanceInBackOffice,
  isSiteHiddenInFrontOffice,
  isSiteInMaintenanceInFrontOffice,
  SiteVisibilityMap
} from '../../utils/siteVisibility';

interface TopHeaderProps {
  activeShop: ShopContextId;
  onSelectShop: (shop: ShopContextId) => void;
  onGoToStorefront: (shopId?: FilialeId) => void;
  currentUser: any;
  onLogout: () => void;
  onOpenAuthModal: () => void;
  onShowLogin?: () => void;
  onToggleMobileSidebar?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeShop,
  onSelectShop,
  onGoToStorefront,
  currentUser,
  onLogout,
  onOpenAuthModal,
  onShowLogin,
  onToggleMobileSidebar
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [siteVisibility, setSiteVisibility] = useState<SiteVisibilityMap>(getCachedSiteVisibility);

  useEffect(() => {
    const handleVis = (e: any) => {
      if (e.detail) setSiteVisibility(e.detail);
    };
    window.addEventListener('site-visibility-changed', handleVis);
    return () => window.removeEventListener('site-visibility-changed', handleVis);
  }, []);

  const allShopOptions: { id: ShopContextId; label: string; icon: string; badge: string; color: string }[] = [
    { id: 'all', label: 'Toutes les boutiques (Consolidé)', icon: '🌐', badge: 'GROUPE HQ', color: 'text-blue-600' },
    { id: 'para', label: 'PharmaShop (Parapharmacie)', icon: '🌿', badge: 'FILIALE 1', color: 'text-emerald-600' },
    { id: 'nutrition', label: 'Fitness Shop (Équipements & Muscu)', icon: '🏋️‍♂️', badge: 'FILIALE 2', color: 'text-lime-600' },
    { id: 'cosmetic', label: 'Cosmetics Shop (Beauté & Soins)', icon: '💄', badge: 'FILIALE 3', color: 'text-rose-600' },
    { id: 'electro', label: 'Electro Shop (Tech & Maison)', icon: '🔌', badge: 'FILIALE 4', color: 'text-blue-600' },
    { id: 'youpi', label: 'YoupiShop (Jeux & Jouets d\'enfant)', icon: '🧸', badge: 'FILIALE 5', color: 'text-amber-600' },
  ];

  // User Requirement 2: Filter out sites that are hidden in Backoffice (Disparition de la console d'administration)
  const visibleShopOptions = allShopOptions.filter(opt => {
    if (opt.id === 'all') return true;
    return !isSiteHiddenInBackOffice(opt.id, siteVisibility);
  });

  // If current active shop was hidden from Backoffice, fall back to 'all'
  useEffect(() => {
    if (activeShop !== 'all' && isSiteHiddenInBackOffice(activeShop, siteVisibility)) {
      onSelectShop('all');
    }
  }, [activeShop, siteVisibility, onSelectShop]);

  const currentShop = visibleShopOptions.find(s => s.id === activeShop) || visibleShopOptions[0] || allShopOptions[0];

  return (
    <header className="bg-white border-b border-slate-100 px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3 sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      
      {/* 1. Left Badges & Mobile Hamburger */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {onToggleMobileSidebar && (
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            title="Menu navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="bg-blue-600 text-white font-extrabold text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
              MULTISHOP CONSOLE
            </span>
            <span className="bg-purple-100 text-purple-700 font-extrabold text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline">
              SUPER ADMIN
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-normal hidden md:block">
            Console d'administration unique & synchronisée
          </p>
        </div>
      </div>

      {/* 2. Center: Boutique Active Context Selector */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 hidden xl:inline">
            Boutique active :
          </span>

          <button
            type="button"
            onClick={() => setIsShopDropdownOpen(!isShopDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs sm:text-sm font-bold text-slate-800 transition-all cursor-pointer shadow-xs hover:border-slate-300"
          >
            <span className="text-base sm:text-lg">{currentShop.icon}</span>
            <span className="max-w-[130px] sm:max-w-[200px] truncate">{currentShop.label}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isShopDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Dropdown Menu */}
        {isShopDropdownOpen && (
          <div className="absolute left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 mt-2 w-72 sm:w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-fadeIn">
            <div className="px-3 py-2 border-b border-slate-100 mb-1">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Changer de Contexte Boutique
              </p>
              <p className="text-[11px] text-slate-500">
                Filtre automatiquement les données sans quitter la console
              </p>
            </div>

            <div className="space-y-1">
              {visibleShopOptions.map((opt) => {
                const isSelected = activeShop === opt.id;
                const inMaintenance = opt.id !== 'all' && isSiteInMaintenanceInBackOffice(opt.id, siteVisibility);
                const hiddenInFront = opt.id !== 'all' && isSiteHiddenInFrontOffice(opt.id, siteVisibility);

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onSelectShop(opt.id);
                      setIsShopDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/60'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{opt.icon}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="leading-tight">{opt.label}</p>
                          {inMaintenance && (
                            <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                              <Wrench className="w-2.5 h-2.5" /> Maint.
                            </span>
                          )}
                          {hiddenInFront && (
                            <span className="text-[9px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                              <EyeOff className="w-2.5 h-2.5" /> Masqué Front
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] font-mono text-slate-400 font-normal uppercase">
                          {opt.badge}
                        </span>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. Right: Storefront View, Notifications & User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Open Storefront */}
        <button
          type="button"
          onClick={() => {
            let target: FilialeId = activeShop === 'all' ? 'para' : (activeShop as FilialeId);
            if (isSiteHiddenInFrontOffice(target, siteVisibility)) {
              const firstVisible = (['para', 'nutrition', 'cosmetic', 'electro'] as FilialeId[]).find(
                id => !isSiteHiddenInFrontOffice(id, siteVisibility)
              );
              if (firstVisible) target = firstVisible;
            }
            onGoToStorefront(target);
          }}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer hover:shadow whitespace-nowrap"
          title="Ouvrir la vitrine publique"
        >
          <Store className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Boutique</span>
        </button>

        {/* Notifications */}
        <button
          type="button"
          className="p-2 text-slate-500 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-2 right-2 ring-2 ring-white"></span>
        </button>

        {/* Dynamic User Profile or Login */}
        <div className="relative">
          {currentUser ? (
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-1.5 p-1 pl-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs uppercase">
                {currentUser?.firstName?.[0] || currentUser?.email?.[0] || 'U'}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs"
            >
              <span>Connexion</span>
            </button>
          )}

          {isProfileOpen && currentUser && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 animate-fadeIn">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{currentUser.email}</p>
                <p className="text-[11px] text-blue-600 font-semibold mt-0.5">
                  {currentUser.role === 'ADMIN' ? 'Super Administrateur' : 'Compte Client'}
                </p>
              </div>
              {onShowLogin && (
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onShowLogin();
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-blue-600 hover:bg-blue-50 flex items-center gap-2 font-medium cursor-pointer"
                >
                  <span>🔐 Page de Connexion</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  onLogout();
                }}
                className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium cursor-pointer"
              >
                <span>Déconnexion</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
