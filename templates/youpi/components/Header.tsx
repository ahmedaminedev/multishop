import React, { useState } from 'react';
import { Search, ShoppingCart, Heart, User, ChevronDown, Menu, X, Sun, Moon } from 'lucide-react';
import { Logo } from './Logo';
import { useCart } from './CartContext';
import { useFavorites } from './FavoritesContext';
import { useTheme } from './ThemeContext';

interface HeaderProps {
  onNavigate: (view: 'home' | 'catalog' | 'packs' | 'blog' | 'stores' | 'checkout') => void;
  currentView: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectCategory?: (category: string) => void;
  onOpenAuthModal?: () => void;
  currentUser?: any;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigate,
  currentView,
  searchQuery,
  onSearchChange,
  onSelectCategory,
  onOpenAuthModal,
  currentUser
}) => {
  const { totalItems, totalPrice, setIsCartOpen } = useCart();
  const { favorites } = useFavorites();
  const { theme, toggleTheme } = useTheme();
  const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const categories = [
    { label: '👶 Jouets 0-3 ans', category: '0-3' },
    { label: '🧸 Jouets 3-6 ans', category: '3-6' },
    { label: '🎮 Jouets 6-12 ans', category: '6-12' },
    { label: '🎲 Jeux de société', category: 'Jeux de société' },
    { label: '🧩 Puzzles', category: 'Puzzles' },
    { label: '💡 Éducatifs', category: 'Éducatifs' },
    { label: '🚲 Extérieurs', category: 'Extérieurs' },
    { label: '🧱 Briques & Lego', category: 'Construction' },
    { label: '🎨 Loisirs créatifs', category: 'Créatifs' }
  ];

  const handleCategoryClick = (cat: string) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
    }
    setIsCategoriesDropdownOpen(false);
    onNavigate('catalog');
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 transition-colors shadow-xs">
      
      {/* 1. TOP HEADER ROW: Logo, Big Search Bar, User Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        <div className="flex items-center justify-between gap-4 lg:gap-8">
          
          {/* Logo on Left */}
          <div className="shrink-0">
            <Logo onClick={() => onNavigate('home')} />
          </div>

          {/* Large Pill Search Bar in Center */}
          <div className="flex-1 max-w-2xl mx-auto hidden md:block">
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  if (currentView !== 'catalog') onNavigate('catalog');
                }}
                placeholder="Rechercher un jouet, une marque, ..."
                className="w-full bg-[#f1f5f9] dark:bg-slate-800/90 hover:bg-[#e2e8f0] dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm font-medium pl-6 pr-14 py-3 rounded-full border border-slate-200/80 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => onNavigate('catalog')}
                className="absolute right-1.5 w-10 h-10 rounded-full bg-[#facc15] hover:bg-[#eab308] text-slate-900 flex items-center justify-center shadow-sm cursor-pointer transition-transform active:scale-95"
                title="Rechercher"
              >
                <Search className="w-5 h-5 text-slate-900 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Right User Actions: Mon Compte, Favoris, Panier */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            
            {/* Mon Compte */}
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="flex items-center gap-2.5 text-left text-slate-700 dark:text-slate-200 hover:text-amber-500 dark:hover:text-amber-400 transition-colors cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-700 group-hover:border-amber-400 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:text-amber-500 transition-colors bg-slate-50 dark:bg-slate-800">
                <User className="w-5 h-5" />
              </div>
              <div className="hidden lg:flex flex-col">
                <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {currentUser ? (currentUser.name || 'Mon Profil') : 'Mon compte'}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                  {currentUser ? 'Espace membre' : 'Connexion / Inscription'}
                </span>
              </div>
            </button>

            {/* Mes Favoris */}
            <button
              type="button"
              onClick={() => onNavigate('catalog')}
              className="flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:text-rose-500 transition-colors cursor-pointer group relative"
              title="Mes favoris"
            >
              <div className="relative w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-700 group-hover:border-rose-400 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:text-rose-500 transition-colors bg-slate-50 dark:bg-slate-800">
                <Heart className="w-5 h-5" />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                  {favorites.length}
                </span>
              </div>
              <span className="hidden lg:inline text-xs font-bold text-slate-900 dark:text-white">
                Mes favoris
              </span>
            </button>

            {/* Panier */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:text-amber-600 transition-colors cursor-pointer group"
              title="Mon panier"
            >
              <div className="relative w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-700 group-hover:border-amber-400 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:text-amber-600 transition-colors bg-slate-50 dark:bg-slate-800">
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                  {totalItems}
                </span>
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  Panier
                </span>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  {totalPrice.toFixed(3)} DT
                </span>
              </div>
            </button>

            {/* Dark/Light toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
              title="Thème clair/sombre"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Mobile menu hamburger */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>

        </div>

        {/* Mobile Search Input */}
        <div className="mt-3 md:hidden">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (currentView !== 'catalog') onNavigate('catalog');
              }}
              placeholder="Rechercher un jouet, une marque, ..."
              className="w-full bg-[#f1f5f9] dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-xs font-medium pl-4 pr-12 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              type="button"
              onClick={() => onNavigate('catalog')}
              className="absolute right-1 w-8 h-8 rounded-full bg-[#facc15] text-slate-900 flex items-center justify-center cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. SUB-NAVIGATION BAR (Exact match to capture screenshot) */}
      <div className="border-t border-slate-100 dark:border-slate-800 bg-[#ffffff] dark:bg-slate-900/90 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-13 gap-3 overflow-x-auto no-scrollbar py-1">
            
            {/* Yellow Pill: "TOUTES LES CATÉGORIES ▾" */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setIsCategoriesDropdownOpen(!isCategoriesDropdownOpen)}
                className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-[#facc15] hover:bg-[#eab308] text-slate-950 font-black text-xs sm:text-[13px] tracking-wide shadow-xs active:scale-95 transition-all cursor-pointer select-none"
              >
                <Menu className="w-4 h-4 stroke-[2.5]" />
                <span>TOUTES LES CATÉGORIES</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCategoriesDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isCategoriesDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-fadeIn">
                  {categories.map((cat, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleCategoryClick(cat.category)}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-slate-700/60 hover:text-amber-600 transition-colors flex items-center justify-between"
                    >
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Nav Items from Capture */}
            <nav className="flex items-center gap-1 sm:gap-2 text-[12px] sm:text-[13px] font-bold text-slate-700 dark:text-slate-300 shrink-0">
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                  currentView === 'home' ? 'text-amber-600 dark:text-amber-400 font-extrabold bg-amber-50/80 dark:bg-amber-950/30' : ''
                }`}
              >
                <span>🏠</span>
                <span>Accueil</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryClick('0-3')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>👶</span>
                <span>Jouets 0-3 ans</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryClick('3-6')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>🧸</span>
                <span>Jouets 3-6 ans</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryClick('6-12')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>🎮</span>
                <span>Jouets 6-12 ans</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryClick('Jeux de société')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>🎲</span>
                <span>Jeux de société</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryClick('Puzzles')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>🧩</span>
                <span>Puzzles</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryClick('Éducatifs')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>💡</span>
                <span>Éducatifs</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryClick('Extérieurs')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>🚲</span>
                <span>Extérieurs</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryClick('Marques')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>🏷️</span>
                <span>Marques</span>
                <span className="text-rose-500">💖</span>
              </button>
            </nav>

          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
            <button onClick={() => { onNavigate('home'); setIsMobileMenuOpen(false); }} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-left">🏠 Accueil</button>
            <button onClick={() => { handleCategoryClick('0-3'); setIsMobileMenuOpen(false); }} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-left">👶 Jouets 0-3 ans</button>
            <button onClick={() => { handleCategoryClick('3-6'); setIsMobileMenuOpen(false); }} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-left">🧸 Jouets 3-6 ans</button>
            <button onClick={() => { handleCategoryClick('6-12'); setIsMobileMenuOpen(false); }} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-left">🎮 Jouets 6-12 ans</button>
            <button onClick={() => { handleCategoryClick('Jeux de société'); setIsMobileMenuOpen(false); }} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-left">🎲 Jeux de société</button>
            <button onClick={() => { handleCategoryClick('Puzzles'); setIsMobileMenuOpen(false); }} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-left">🧩 Puzzles</button>
            <button onClick={() => { handleCategoryClick('Éducatifs'); setIsMobileMenuOpen(false); }} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-left">💡 Éducatifs</button>
            <button onClick={() => { handleCategoryClick('Extérieurs'); setIsMobileMenuOpen(false); }} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-left">🚲 Extérieurs</button>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button onClick={() => { onOpenAuthModal?.(); setIsMobileMenuOpen(false); }} className="text-xs font-bold text-amber-600">
              {currentUser ? `Connecté : ${currentUser.name || currentUser.email}` : 'Se connecter / S\'inscrire'}
            </button>
          </div>
        </div>
      )}

    </header>
  );
};
