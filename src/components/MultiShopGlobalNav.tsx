import React from 'react';
import { FilialeId } from '../models/ProductFiliale';

export interface MultiShopStoreConfig {
  id: FilialeId;
  name: string;
  shortName: string;
  tagline: string;
  badge: string;
  accentColor: string;
  bgColor: string;
  textColor: string;
  icon: string;
}

export const MULTISHOP_STORES: MultiShopStoreConfig[] = [
  {
    id: 'para',
    name: 'PharmaNature',
    shortName: 'Parapharmacie',
    tagline: 'Santé, Bio & Micronutrition',
    badge: 'Santé Naturelle',
    accentColor: '#008b5e',
    bgColor: 'bg-emerald-700',
    textColor: 'text-emerald-100',
    icon: '🌿'
  },
  {
    id: 'nutrition',
    name: 'IronFuel Nutrition',
    shortName: 'Nutrition Sport',
    tagline: 'Performance & Musculation Elite',
    badge: 'Elite Performance',
    accentColor: '#ccff00',
    bgColor: 'bg-zinc-900',
    textColor: 'text-lime-400',
    icon: '⚡'
  },
  {
    id: 'cosmetic',
    name: 'Cosmetics Shop',
    shortName: 'Cosmétiques',
    tagline: 'Soins, Beauté & Parfumerie Luxe',
    badge: 'Luxe & Élégance',
    accentColor: '#e11d48',
    bgColor: 'bg-rose-700',
    textColor: 'text-rose-100',
    icon: '💄'
  },
  {
    id: 'electro',
    name: 'Electro Shop',
    shortName: 'Électroménager',
    tagline: 'High-Tech, Maison & Cuisine',
    badge: 'Technologie',
    accentColor: '#2563eb',
    bgColor: 'bg-blue-700',
    textColor: 'text-blue-100',
    icon: '🔌'
  }
];

interface MultiShopGlobalNavProps {
  currentShop: FilialeId;
  onSwitchShop: (shopId: FilialeId) => void;
  onGoToBackoffice: () => void;
  currentUser: any;
  onOpenAuthModal: () => void;
}

export const MultiShopGlobalNav: React.FC<MultiShopGlobalNavProps> = ({
  currentShop,
  onSwitchShop,
  onGoToBackoffice,
  currentUser,
  onOpenAuthModal
}) => {
  const currentStore = MULTISHOP_STORES.find(s => s.id === currentShop) || MULTISHOP_STORES[0];

  return (
    <nav className="bg-slate-950 text-slate-200 border-b border-slate-800 text-xs py-1.5 px-3 sm:px-6 sticky top-0 z-[120] shadow-md select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 flex-wrap">
        
        {/* Left: Group Brand */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gradient-to-r from-indigo-900 to-purple-900 border border-indigo-700/50">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-extrabold uppercase tracking-wider text-[11px] text-white">
              MultiShop <span className="text-indigo-300 font-normal">Groupe</span>
            </span>
          </div>
          <span className="text-[11px] text-slate-400 hidden xl:inline">
            Plateforme e-commerce multi-filiales
          </span>
        </div>

        {/* Center: Switcher between subsidiaries */}
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
          <span className="text-[11px] font-semibold text-slate-400 hidden md:inline mr-1">
            Boutiques :
          </span>
          {MULTISHOP_STORES.map((shop) => {
            const isCurrent = shop.id === currentShop;
            return (
              <button
                key={shop.id}
                onClick={() => onSwitchShop(shop.id)}
                type="button"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all duration-150 cursor-pointer ${
                  isCurrent
                    ? `${shop.bgColor} ${shop.textColor} shadow-md ring-1 ring-white/30 scale-105`
                    : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
                title={`Aller sur ${shop.name} - ${shop.tagline}`}
              >
                <span>{shop.icon}</span>
                <span className="whitespace-nowrap">{shop.shortName}</span>
                {isCurrent && (
                  <span className="text-[9px] px-1 py-0.2 rounded-full bg-white/20 text-white font-extrabold hidden sm:inline">
                    Actuel
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right: SSO User & Backoffice CTA */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Backoffice Button */}
          <button
            onClick={onGoToBackoffice}
            type="button"
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wide bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 shadow-sm transition-all transform hover:scale-105 cursor-pointer"
            title="Accéder au panneau d'administration général du groupe et des filiales"
          >
            <span>⚙️</span>
            <span>Backoffice Général</span>
          </button>

          {/* User Button (SSO) */}
          <button
            onClick={onOpenAuthModal}
            type="button"
            className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] text-slate-200 transition-colors cursor-pointer"
          >
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
              {currentUser?.firstName?.[0] || '👤'}
            </span>
            <span className="hidden sm:inline font-medium">
              {currentUser ? currentUser.firstName : 'Connexion'}
            </span>
          </button>
        </div>

      </div>
    </nav>
  );
};
