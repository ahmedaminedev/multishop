import React from 'react';
import type { AdminPageName } from './AdminPage';
import {
  LayoutDashboard,
  MessageSquare,
  Package,
  FolderTree,
  Boxes,
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
    { id: 'products', label: 'Catalogue Mobilier', icon: <Package className="w-4 h-4" /> },
    { id: 'categories', label: 'Rayons Déco', icon: <FolderTree className="w-4 h-4" /> },
    { id: 'packs', label: 'Packs Pièces & Salons', icon: <Boxes className="w-4 h-4" /> },
    { id: 'orders', label: 'Commandes Meubles', icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'messages', label: 'Messages Clients', icon: <Mail className="w-4 h-4" /> },
    { id: 'promotions', label: 'Codes Promotionnels', icon: <Tag className="w-4 h-4" /> },
    { id: 'home', label: 'Accueil & Vitrine', icon: <Home className="w-4 h-4" />, badge: 'Live' },
    { id: 'stores', label: 'Nos Showrooms', icon: <Store className="w-4 h-4" /> }
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 select-none z-20">
      
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md">
            🏠
          </div>
          <div>
            <h3 className="font-black text-sm text-slate-900 dark:text-white font-serif">
              DariShop
            </h3>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
              Administration Dédiée
            </span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActivePage(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-700'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Controls */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <button
          type="button"
          onClick={onNavigateHome}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voir la Vitrine DariShop</span>
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Déconnexion</span>
        </button>
      </div>

    </aside>
  );
};
