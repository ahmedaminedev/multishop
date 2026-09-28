import React, { useState } from 'react';
import { Store, Bell, ChevronDown, Sparkles, LogOut, Check, Menu } from 'lucide-react';
import { FilialeId } from '../../models/ProductFiliale';

export type BackofficeTab = 'hq' | 'para' | 'nutrition' | 'cosmetic' | 'electro';

interface TopHeaderProps {
  activeTab: BackofficeTab;
  onSelectTab: (tab: BackofficeTab) => void;
  onGoToStorefront: (shopId?: FilialeId) => void;
  currentUser: any;
  onLogout: () => void;
  onOpenAuthModal: () => void;
  onShowLogin?: () => void;
  onToggleMobileSidebar?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  onSelectTab,
  onGoToStorefront,
  currentUser,
  onLogout,
  onOpenAuthModal,
  onShowLogin,
  onToggleMobileSidebar
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const tabs: { id: BackofficeTab; label: string; icon: string }[] = [
    { id: 'hq', label: 'Vue Groupe HQ', icon: '🏢' },
    { id: 'para', label: 'Para Shop', icon: '🌿' },
    { id: 'nutrition', label: 'Nutrition Shop', icon: '⚡' },
    { id: 'cosmetic', label: 'Cosmetics Shop', icon: '💄' },
    { id: 'electro', label: 'Electro Shop', icon: '🔌' },
  ];

  return (
    <header className="bg-white border-b border-slate-100 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 sm:gap-4 sticky top-0 z-30">
      
      {/* Left Badges & Mobile Hamburger */}
      <div className="flex items-center gap-3">
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

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="bg-blue-100 text-blue-700 font-extrabold text-[10px] sm:text-[11px] px-2.5 sm:px-3 py-0.5 rounded-full uppercase tracking-wider">
              BACKOFFICE GÉNÉRAL
            </span>
            <span className="bg-purple-100 text-purple-700 font-extrabold text-[10px] sm:text-[11px] px-2.5 sm:px-3 py-0.5 rounded-full uppercase tracking-wider">
              SUPER ADMIN
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 font-normal hidden sm:block">
            Gestion centralisée et sous-backoffices des 4 filiales
          </p>
          
          {/* Buttons Row */}
          <div className="flex items-center gap-2 mt-0.5">
            <button
              type="button"
              onClick={() => onGoToStorefront(activeTab === 'hq' ? 'para' : (activeTab as FilialeId))}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full shadow-sm flex items-center gap-1.5 transition-all cursor-pointer hover:shadow whitespace-nowrap"
            >
              <Store className="w-3.5 h-3.5" />
              <span>VOIR LA BOUTIQUE</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Subsidiaries Tabs & User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Filiale Tabs (Responsive with horizontal scrolling on mobile/tablet) */}
        <div className="flex items-center gap-1 bg-slate-50/90 p-1 rounded-xl border border-slate-100 overflow-x-auto no-scrollbar max-w-[200px] sm:max-w-md lg:max-w-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Notification Bell */}
        <button
          type="button"
          className="p-2 text-slate-500 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors relative"
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
              className="flex items-center gap-2 p-1 pl-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs uppercase">
                {currentUser?.firstName?.[0] || currentUser?.email?.[0] || 'U'}
              </div>
              <span className="text-xs font-semibold text-slate-800 hidden sm:inline max-w-[120px] truncate">
                {currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim() : (currentUser?.email?.split('@')[0] || 'Utilisateur')}
              </span>
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
            <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-100 rounded-xl shadow-lg py-2 z-50 animate-fadeIn">
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
                  className="w-full text-left px-4 py-2 text-xs text-blue-600 hover:bg-blue-50 flex items-center gap-2 font-medium"
                >
                  <span>🔐 Page de Connexion</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  onOpenAuthModal();
                }}
                className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <span>Détails du compte</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  onLogout();
                }}
                className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Déconnexion</span>
              </button>
            </div>
          )}
        </div>
      </div>

    </header>
  );
};
