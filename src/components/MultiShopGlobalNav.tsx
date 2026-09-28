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
    name: 'PharmaNature',
    tabLabel: 'Para Shop',
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
    <div className="sticky top-0 z-[120] font-sans shadow-xs select-none">
      
      {/* 1. Top Informational Bar (Matching Backoffice clean aesthetic + Expert Advice contact) */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1.5 px-4 sm:px-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          
          {/* Contact Expert mention exactly as requested */}
          <div className="flex items-center gap-4 text-[11px] flex-wrap">
            <a
              href="tel:+21655263522"
              className="flex items-center gap-1.5 font-bold text-white hover:text-blue-400 transition-colors"
            >
              <Phone className="w-3 h-3 text-blue-400" />
              <span>CONSEIL EXPERT : +216 55 263 522</span>
            </a>

            <span className="hidden sm:inline text-slate-600">|</span>

            <a
              href="mailto:contact@multishop.tn"
              className="hidden sm:flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
            >
              <Mail className="w-3 h-3 text-slate-400" />
              <span>contact@multishop.tn</span>
            </a>

            <span className="hidden md:inline text-slate-600">|</span>

            <span className="hidden md:inline text-slate-400">
              Réseau officiel de 4 filiales en Tunisie
            </span>
          </div>

          {/* Right Group Perks */}
          <div className="flex items-center gap-3 text-[11px] ml-auto">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Paiement sécurisé & livraison express</span>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Main Navigation Bar (Clean White, Dashboard Design Language) */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-slate-100 py-2.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          
          {/* Left: Brand Identity & Active Shop Label */}
          <div className="flex items-center gap-3">
            <MultiShopLogo />

            <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-slate-200">
              <span className="bg-blue-50 text-blue-700 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-blue-100">
                GROUPE
              </span>
              <span className="text-xs font-semibold text-slate-600">
                Boutique active : <strong className="text-slate-900">{currentStore.name}</strong>
              </span>
            </div>
          </div>

          {/* Center: Tabs to switch between the 4 shops (styled identically to Backoffice TopHeader tabs) */}
          <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-100 overflow-x-auto no-scrollbar">
            {MULTISHOP_STORES.map((shop) => {
              const isCurrent = shop.id === currentShop;
              return (
                <button
                  key={shop.id}
                  type="button"
                  onClick={() => onSwitchShop(shop.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                  title={`${shop.name} : ${shop.tagline}`}
                >
                  <span className="text-sm">{shop.icon}</span>
                  <span>{shop.tabLabel}</span>
                  {isCurrent && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white ml-0.5"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right: SSO Account & Admin Access (only if connected as admin) */}
          <div className="flex items-center gap-2.5 ml-auto sm:ml-0">
            {/* Administration button ONLY visible if user is logged in as ADMIN */}
            {currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN') && onGoToBackoffice && (
              <button
                type="button"
                onClick={onGoToBackoffice}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer hover:shadow"
                title="Accéder au Backoffice Administrateur"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Administration</span>
                <span className="md:hidden">Admin</span>
              </button>
            )}

            {/* SSO Account Profile */}
            {currentUser ? (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="flex items-center gap-2 p-1 pl-1.5 rounded-full hover:bg-slate-100 transition-colors border border-slate-200/80 cursor-pointer"
                title={`Connecté: ${currentUser.email} (${currentUser.role === 'ADMIN' ? 'Administrateur' : 'Client'})`}
              >
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs uppercase">
                  {currentUser.firstName?.[0] || currentUser.email?.[0] || 'U'}
                </div>
                <span className="text-xs font-semibold text-slate-800 hidden lg:inline pr-1 max-w-[100px] truncate">
                  {currentUser.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim() : (currentUser.email?.split('@')[0] || 'Utilisateur')}
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    if (onGoToLogin) onGoToLogin();
                    else onOpenAuthModal();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-all shadow-xs cursor-pointer"
                  title="Se connecter à votre compte client MultiShop"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Connexion</span>
                  <span className="sm:hidden">Connexion</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onGoToRegister) onGoToRegister();
                    else onOpenAuthModal();
                  }}
                  className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
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
