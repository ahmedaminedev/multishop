import React, { useState } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  User, 
  ChevronDown, 
  Menu, 
  X,
  Sofa,
  Bed,
  Utensils,
  Coffee,
  Lamp,
  Package,
  Sprout,
  Tag
} from 'lucide-react';
import { Logo } from './Logo';
import { useCart } from './CartContext';
import { useFavorites } from './FavoritesContext';
import type { Category, LogoConfig } from '../types';

interface HeaderProps {
  onNavigate: (view: 'home' | 'catalog' | 'packs' | 'blog' | 'stores' | 'checkout') => void;
  currentView: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectCategory?: (category: string) => void;
  onOpenAuthModal?: () => void;
  currentUser?: any;
  categories?: Category[];
  logoConfig?: LogoConfig;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigate,
  currentView,
  searchQuery,
  onSearchChange,
  onSelectCategory,
  onOpenAuthModal,
  currentUser,
  categories: propCategories = [],
  logoConfig
}) => {
  const { totalItems, setIsCartOpen } = useCart();
  const { favorites } = useFavorites();
  const [isAllCategoriesOpen, setIsAllCategoriesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Nav categories matching exact capture
  const navCategories = [
    { id: 'salon', name: 'Salon', icon: Sofa },
    { id: 'chambre', name: 'Chambre', icon: Bed },
    { id: 'salle-a-manger', name: 'Salle à manger', icon: Utensils },
    { id: 'cuisine', name: 'Cuisine', icon: Coffee },
    { id: 'decoration', name: 'Décoration', icon: Lamp },
    { id: 'rangement', name: 'Rangement', icon: Package },
    { id: 'jardin-exterieur', name: 'Jardin & Extérieur', icon: Sprout },
    { id: 'bons-plans', name: 'Bons plans', icon: Tag }
  ];

  const handleCategoryClick = (catName: string) => {
    if (onSelectCategory) {
      onSelectCategory(catName);
    }
    setIsAllCategoriesOpen(false);
    setIsMobileMenuOpen(false);
    onNavigate('catalog');
  };

  return (
    <header 
      style={{ top: 'var(--multishop-globalnav-height, 0px)' }}
      className="sticky z-40 bg-white border-b border-slate-100 shadow-2xs select-none"
    >
      {/* 1. TOP ROW: Logo, Centered Pill Search, Right 3 Actions */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4 lg:gap-8">
          
          {/* Logo on Left */}
          <div className="shrink-0">
            <Logo logoConfig={logoConfig} onClick={() => onNavigate('home')} />
          </div>

          {/* Centered Wide Search Pill */}
          <div className="flex-1 max-w-2xl mx-auto hidden md:block">
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  if (currentView !== 'catalog') onNavigate('catalog');
                }}
                placeholder="Rechercher un produit, une catégorie..."
                className="w-full bg-white text-slate-800 placeholder-slate-400 text-sm font-normal pl-6 pr-14 py-2.5 rounded-full border border-slate-300 focus:outline-none focus:border-[#0f3e37] transition-all shadow-2xs"
              />
              <button
                type="button"
                onClick={() => onNavigate('catalog')}
                className="absolute right-1.5 w-9 h-9 rounded-full bg-[#0f3e37] hover:bg-[#0b2f29] text-white flex items-center justify-center cursor-pointer transition-transform active:scale-95 shadow-xs"
                title="Rechercher"
              >
                <Search className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Right Action Icons: Mon compte, Ma liste, Panier */}
          <div className="flex items-center gap-6 sm:gap-8">
            
            {/* 1. Mon compte */}
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="flex flex-col items-center justify-center text-slate-800 hover:text-[#0f3e37] cursor-pointer group transition-colors"
            >
              <User className="w-5 h-5 stroke-[1.8] text-slate-800 group-hover:text-[#0f3e37] transition-colors" />
              <span className="text-[11px] font-medium text-slate-700 mt-1 whitespace-nowrap">
                {currentUser ? (currentUser.firstName || 'Mon compte') : 'Mon compte'}
              </span>
            </button>

            {/* 2. Ma liste */}
            <button
              type="button"
              onClick={() => onNavigate('catalog')}
              className="relative flex flex-col items-center justify-center text-slate-800 hover:text-[#0f3e37] cursor-pointer group transition-colors"
            >
              <div className="relative">
                <Heart className="w-5 h-5 stroke-[1.8] text-slate-800 group-hover:text-[#0f3e37] transition-colors" />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-black text-white text-[9px] font-bold flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium text-slate-700 mt-1 whitespace-nowrap">
                Ma liste
              </span>
            </button>

            {/* 3. Panier with Badge */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative flex flex-col items-center justify-center text-slate-800 hover:text-[#0f3e37] cursor-pointer group transition-colors"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 stroke-[1.8] text-slate-800 group-hover:text-[#0f3e37] transition-colors" />
                <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
                  {totalItems}
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-700 mt-1 whitespace-nowrap">
                Panier
              </span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-700 hover:text-[#0f3e37] rounded-lg cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="mt-2.5 md:hidden">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (currentView !== 'catalog') onNavigate('catalog');
              }}
              placeholder="Rechercher un produit, une catégorie..."
              className="w-full bg-white text-slate-800 placeholder-slate-400 text-xs pl-4 pr-11 py-2 rounded-full border border-slate-300 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => onNavigate('catalog')}
              className="absolute right-1 w-7 h-7 rounded-full bg-[#0f3e37] text-white flex items-center justify-center"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. SECONDARY CATEGORY BAR (Matches exact capture) */}
      <div className="border-t border-slate-100 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto no-scrollbar">
            
            {/* Toutes les catégories pill button */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setIsAllCategoriesOpen(!isAllCategoriesOpen)}
                className="flex items-center gap-2.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#0f3e37] hover:bg-[#0b2f29] text-white font-medium text-xs sm:text-sm cursor-pointer whitespace-nowrap shadow-xs transition-colors"
              >
                <Menu className="w-4 h-4" />
                <span>Toutes les catégories</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isAllCategoriesOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* All categories dropdown */}
              {isAllCategoriesOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-fadeIn">
                  {navCategories.map(cat => {
                    const IconComp = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategoryClick(cat.name)}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-[#f4efe8] hover:text-[#0f3e37] font-medium text-xs flex items-center gap-3 cursor-pointer transition-colors"
                      >
                        <IconComp className="w-4 h-4 text-[#0f3e37]" />
                        <span>{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Horizontal Category Items */}
            <div className="flex items-center gap-5 sm:gap-7 text-xs sm:text-sm font-normal text-slate-800 whitespace-nowrap overflow-x-auto no-scrollbar">
              {navCategories.map(cat => {
                const IconComp = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryClick(cat.name)}
                    className="flex items-center gap-2 hover:text-[#0f3e37] transition-colors cursor-pointer py-1 group"
                  >
                    <IconComp className="w-4 h-4 text-slate-700 group-hover:text-[#0f3e37] transition-colors stroke-[1.8]" />
                    <span className="font-normal text-slate-800 group-hover:text-[#0f3e37] group-hover:font-medium">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2 animate-fadeIn shadow-lg">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-2">Rayons & Pièces</p>
          {navCategories.map(cat => {
            const IconComp = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.name)}
                className="w-full text-left px-3 py-2 rounded-xl text-slate-800 hover:bg-[#f4efe8] font-medium text-xs flex items-center gap-3"
              >
                <IconComp className="w-4 h-4 text-[#0f3e37]" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
