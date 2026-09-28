import React from 'react';
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
  X
} from 'lucide-react';
import { MultiShopLogo } from './MultiShopLogo';

export type SidebarMenuItem =
  | 'dashboard'
  | 'orders'
  | 'products'
  | 'promotions'
  | 'stores'
  | 'messages'
  | 'users'
  | 'reports'
  | 'settings';

interface SidebarNavProps {
  currentMenu: SidebarMenuItem;
  onSelectMenu: (menu: SidebarMenuItem) => void;
  ordersBadge?: number;
  messagesBadge?: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  currentMenu,
  onSelectMenu,
  ordersBadge = 0,
  messagesBadge = 0,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const menuItems = [
    { id: 'dashboard' as SidebarMenuItem, label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'orders' as SidebarMenuItem, label: 'Commandes', icon: ShoppingCart, badge: ordersBadge },
    { id: 'products' as SidebarMenuItem, label: 'Produits', icon: Package },
    { id: 'promotions' as SidebarMenuItem, label: 'Promotions', icon: Rocket },
    { id: 'stores' as SidebarMenuItem, label: 'Stores', icon: Store },
    { id: 'messages' as SidebarMenuItem, label: 'Messages', icon: Mail, badge: messagesBadge },
    { id: 'users' as SidebarMenuItem, label: 'Utilisateurs', icon: Users },
    { id: 'reports' as SidebarMenuItem, label: 'Rapports', icon: BarChart3 },
    { id: 'settings' as SidebarMenuItem, label: 'Paramètres', icon: Settings },
  ];

  const handleItemClick = (id: SidebarMenuItem) => {
    onSelectMenu(id);
    if (onCloseMobile) onCloseMobile();
  };

  const navContent = (
    <>
      <div className="p-5 flex flex-col gap-6">
        {/* Brand Logo */}
        <div className="px-2 py-1 flex items-center justify-between">
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

        {/* Navigation List */}
        <nav className="flex flex-col gap-1.5 mt-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentMenu === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item.id)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-colors text-left cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {Boolean(item.badge && item.badge > 0) && (
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section with Subtitle Logo */}
      <div className="p-5 border-t border-slate-100">
        <MultiShopLogo showSubtitle size="sm" />
      </div>
    </>
  );

  return (
    <>
      {/* 1. Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-100 flex-col justify-between h-screen sticky top-0 z-40 select-none shrink-0">
        {navContent}
      </aside>

      {/* 2. Mobile Responsive Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-fadeIn">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          {/* Drawer Panel */}
          <aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white z-50 shadow-2xl flex flex-col justify-between overflow-y-auto">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
};
