import React, { useState } from 'react';
import type { AdminPageName } from './AdminPage';
import {
  LayoutDashboard,
  MessageSquare,
  Package,
  FolderTree,
  Gift,
  ShoppingCart,
  Mail,
  Tag,
  Home,
  Store,
  ArrowLeft,
  LogOut,
  Sparkles
} from 'lucide-react';

interface AdminSidebarProps {
  activePage: AdminPageName;
  setActivePage: (page: AdminPageName) => void;
  onNavigateHome: () => void;
  onLogout: () => void;
  onOpenSubsiteModal?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activePage,
  setActivePage,
  onNavigateHome,
  onLogout,
  onOpenSubsiteModal,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const navItems: Array<{ id: AdminPageName; label: string; icon: React.ReactNode; badge?: string }> = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'chat', label: 'Live Chat Support', icon: <MessageSquare className="w-4 h-4" />, badge: 'Direct' },
    { id: 'products', label: 'Catalogue Jouets', icon: <Package className="w-4 h-4" /> },
    { id: 'categories', label: 'Structure Catégories', icon: <FolderTree className="w-4 h-4" /> },
    { id: 'packs', label: 'Packs & Coffrets', icon: <Gift className="w-4 h-4" /> },
    { id: 'orders', label: 'Commandes Clients', icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'messages', label: 'Messages Contact', icon: <Mail className="w-4 h-4" /> },
    { id: 'promotions', label: 'Codes Promo & Réductions', icon: <Tag className="w-4 h-4" /> },
    { id: 'home', label: 'Accueil & Publicités', icon: <Home className="w-4 h-4" />, badge: 'Live' },
    { id: 'stores', label: 'Magasins Physiques', icon: <Store className="w-4 h-4" /> }
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 select-none z-20">
      
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center font-black text-xl shadow-md">
            🧸
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base tracking-tight text-slate-900 dark:text-white">
                YOUPI<span className="text-amber-500">SHOP</span>
              </span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
              Backoffice Dédié
            </span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 translate-x-1'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-amber-500'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-wider ${
                  isActive ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
        {onOpenSubsiteModal && (
          <button
            type="button"
            onClick={onOpenSubsiteModal}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20 hover:from-amber-600 hover:to-orange-600 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Sous-Site en Direct</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/20 uppercase tracking-widest">
              Live
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={onNavigateHome}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voir la Boutique YoupiShop</span>
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Déconnexion</span>
        </button>
      </div>

    </aside>
  );
};
