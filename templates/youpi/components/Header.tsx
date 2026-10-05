import React, { useState } from 'react';
import { Search, ShoppingBag, Heart, Layers, User, Menu, X, Sun, Moon } from 'lucide-react';
import { Logo } from './Logo';
import { useCart } from './CartContext';
import { useFavorites } from './FavoritesContext';
import { useCompare } from './CompareContext';
import { useTheme } from './ThemeContext';

interface HeaderProps {
  onNavigate: (view: 'home' | 'catalog' | 'packs' | 'blog' | 'stores') => void;
  currentView: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAuthModal?: () => void;
  currentUser?: any;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigate,
  currentView,
  searchQuery,
  onSearchChange,
  onOpenAuthModal,
  currentUser
}) => {
  const { totalItems, setIsCartOpen } = useCart();
  const { favorites } = useFavorites();
  const { compareList } = useCompare();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Accueil' },
    { id: 'catalog', label: 'Tous les Jouets' },
    { id: 'packs', label: 'Coffrets & Packs' },
    { id: 'blog', label: 'Guide des Âges' },
    { id: 'stores', label: 'Nos Magasins' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      
      {/* Top Banner Reassurance Strip */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white text-[11px] font-bold py-1.5 px-4 text-center flex items-center justify-center gap-4">
        <span>🎈 Livraison Express 24/48h partout en Tunisie</span>
        <span className="hidden sm:inline" aria-hidden="true">•</span>
        <span className="hidden sm:inline">🎁 Emballage cadeau soigné offert sur demande</span>
        <span className="hidden md:inline" aria-hidden="true">•</span>
        <span className="hidden md:inline">💵 Paiement à la livraison</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Zone 1: Brand Zone */}
          <div onClick={() => onNavigate('home')} className="shrink-0">
            <Logo />
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {navLinks.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id as any)}
                  className={`hover:text-amber-500 transition-colors cursor-pointer py-1 relative ${
                    isActive ? 'text-amber-600 dark:text-amber-400 font-black' : ''
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full animate-fadeIn" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Interactive Actions (Search, Theme, Favorites, Cart, Account) */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Search Input */}
            <div className="relative hidden md:block w-48 xl:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  if (currentView !== 'catalog') onNavigate('catalog');
                }}
                placeholder="Chercher un jouet, Lego..."
                className="w-full pl-8 pr-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border-none text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Dark/Light toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Changer de thème"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Favorites */}
            <button
              type="button"
              onClick={() => onNavigate('catalog')}
              className="p-2 rounded-xl text-slate-500 hover:text-rose-500 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer relative"
              title="Mes favoris"
            >
              <Heart className="w-4 h-4" />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Panier</span>
              <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black">
                {totalItems}
              </span>
            </button>

            {/* User Account / Auth */}
            {onOpenAuthModal && (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={currentUser ? `Connecté : ${currentUser.name || currentUser.email}` : "Se connecter"}
              >
                <User className="w-4 h-4" />
              </button>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-100 dark:border-slate-800 animate-fadeIn space-y-3">
            <div className="px-1 pb-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  if (currentView !== 'catalog') onNavigate('catalog');
                }}
                placeholder="Chercher un jouet, Lego..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              {navLinks.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id as any);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`text-left px-3 py-2 rounded-xl text-xs font-bold uppercase ${
                    currentView === item.id
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </header>
  );
};
