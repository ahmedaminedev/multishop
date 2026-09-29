import React from 'react';
import { Phone, Mail, Store, LayoutDashboard, ChevronRight, User, ShieldCheck } from 'lucide-react';
import { FilialeId } from '../models/ProductFiliale';
import { MultiShopLogo } from './admin/MultiShopLogo';

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
    id: 'para',
    name: 'PharmaShop',
    tabLabel: 'Pharma Shop',
    tagline: 'Santé, Phytothérapie & Soins Bio',
    badge: 'Santé & Bio',
    icon: '🌿',
    enumType: 'produit_myshops_para'
  },
  {
    id: 'nutrition',
    name: 'IronFuel Nutrition',
    tabLabel: 'Nutrition Shop',
    tagline: 'Performance Sportive Elite',
    badge: 'Pro Performance',
    icon: '⚡',
    enumType: 'produit_myshops_nutrition'
  },
  {
    id: 'cosmetic',
    name: 'Cosmetics Shop',
    tabLabel: 'Cosmetics Shop',
    tagline: 'Soins, Beauté & Parfumerie Luxe',
    badge: 'Luxe & Beauté',
    icon: '💄',
    enumType: 'produit_myshops_cosmetique'
  },
  {
    id: 'electro',
    name: 'Electro Shop',
    tabLabel: 'Electro Shop',
    tagline: 'High-Tech & Électroménager',
    badge: 'High-Tech',
    icon: '🔌',
    enumType: 'produit_myshops_electro'
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
  const currentStore = MULTISHOP_STORES.find(s => s.id === currentShop) || MULTISHOP_STORES[0];

  return (
    <div className="sticky top-0 z-[120] font-sans shadow-md select-none">
      {/* Main MultiShop Group Navigation Bar (Enlarged, Prestigious, Superior Hierarchy) */}
      <nav className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b-2 border-slate-200/80 dark:border-slate-800 py-4 sm:py-5 px-5 sm:px-10 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-5 flex-wrap">
          
          {/* Left: Brand Identity & Active Shop Label */}
          <div className="flex items-center gap-4">
            <MultiShopLogo />

            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-slate-800">
              <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 font-black text-[11px] px-3 py-1 rounded-full uppercase tracking-wider border border-blue-200 dark:border-blue-800">
                GROUPE
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                Boutique : <strong className="text-slate-900 dark:text-white font-extrabold">{currentStore.name}</strong>
              </span>
            </div>
          </div>

          {/* Center: Tabs to switch between the 4 shops (Enlarged, Clear & Prominent) */}
          <div className="flex items-center gap-2 sm:gap-2.5 bg-slate-100/90 dark:bg-slate-800/90 p-2 rounded-2xl border border-slate-200 dark:border-slate-700/80 overflow-x-auto no-scrollbar shadow-inner">
            {MULTISHOP_STORES.map((shop) => {
              const isCurrent = shop.id === currentShop;
              return (
                <button
                  key={shop.id}
                  type="button"
                  onClick={() => onSwitchShop(shop.id)}
                  className={`flex items-center gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-[1.03]'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700/80'
                  }`}
                  title={`${shop.name} : ${shop.tagline}`}
                >
                  <span className="text-lg sm:text-xl">{shop.icon}</span>
                  <span>{shop.tabLabel}</span>
                  {isCurrent && (
                    <span className="w-2.5 h-2.5 rounded-full bg-white ml-0.5 animate-pulse"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right: SSO Account & Admin Access */}
          <div className="flex items-center gap-3.5 ml-auto sm:ml-0">
            {/* Administration button ONLY visible if user is logged in as ADMIN */}
            {currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN') && onGoToBackoffice && (
              <button
                type="button"
                onClick={onGoToBackoffice}
                className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-xl shadow-sm flex items-center gap-2 transition-all cursor-pointer hover:shadow-md"
                title="Accéder au Backoffice Administrateur"
              >
                <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden md:inline">Administration</span>
                <span className="md:hidden">Admin</span>
              </button>
            )}

            {/* SSO Account Profile */}
            {currentUser ? (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="flex items-center gap-2.5 p-1.5 pl-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200/80 dark:border-slate-700 cursor-pointer"
                title={`Connecté: ${currentUser.email} (${currentUser.role === 'ADMIN' ? 'Administrateur' : 'Client'})`}
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-xs uppercase">
                  {currentUser.firstName?.[0] || currentUser.email?.[0] || 'U'}
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 hidden lg:inline pr-1.5 max-w-[120px] truncate">
                  {currentUser.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim() : (currentUser.email?.split('@')[0] || 'Utilisateur')}
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onGoToLogin) onGoToLogin();
                    else onOpenAuthModal();
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs sm:text-sm font-black transition-all shadow-xs cursor-pointer"
                  title="Se connecter à votre compte client MultiShop"
                >
                  <User className="w-4 h-4" />
                  <span>Connexion</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onGoToRegister) onGoToRegister();
                    else onOpenAuthModal();
                  }}
                  className="hidden md:flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-95 text-white text-xs sm:text-sm font-black transition-all shadow-sm cursor-pointer"
                  title="Créer un compte client MultiShop"
                >
                  <span>S'inscrire</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </nav>
    </div>
  );
};
