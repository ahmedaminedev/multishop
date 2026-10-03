import React, { useState, useEffect, useRef } from 'react';
import { User, ShoppingCart, Search, Heart, Scale } from 'lucide-react';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { useCart } from './CartContext';
import { useFavorites } from './FavoritesContext';
import { useCompare } from './CompareContext';
import type { Product, Pack, Category, SearchResult, SearchResultItem, User as UserType, Advertisements, LogoConfig } from '../types';
import { SearchResultsDropdown } from './SearchResultsDropdown';

interface HeaderProps {
    user: UserType | null;
    onNavigateToLogin: () => void;
    isLoggedIn: boolean;
    onLogout: () => void;
    onNavigateToFavorites: () => void;
    onNavigateToProfile: () => void;
    onNavigateToOrderHistory: () => void;
    allProducts: Product[];
    allPacks: Pack[];
    allCategories: Category[];
    onNavigateToCategory: (categoryName: string) => void;
    onNavigateToProductDetail: (productId: number) => void;
    onNavigateToCompare: () => void;
    advertisements?: Advertisements;
    logoConfig?: LogoConfig;
}

export const Header: React.FC<HeaderProps> = ({ 
    user,
    onNavigateToLogin, 
    isLoggedIn, 
    onLogout, 
    onNavigateToFavorites, 
    onNavigateToProfile,
    onNavigateToOrderHistory,
    allProducts,
    allCategories,
    onNavigateToCategory,
    onNavigateToProductDetail,
    onNavigateToCompare,
    advertisements,
    logoConfig
}) => {
    const { itemCount, openCart, cartTotal } = useCart();
    const { favoritesCount } = useFavorites();
    const { compareList } = useCompare();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<SearchResult | null>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    const activeLogoConfig = logoConfig || advertisements?.logoConfig;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setResults(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setResults(null);
            return;
        }

        const handler = setTimeout(() => {
            const query = searchQuery.toLowerCase().trim();
            const productResults: SearchResultItem[] = [];
            const categoryResults: { name: string }[] = [];
            const foundProductIds = new Set<number>();

            allCategories.forEach(cat => {
                if (cat.name && cat.name.toLowerCase().includes(query)) {
                    categoryResults.push({ name: cat.name });
                }
            });

            allProducts.forEach(product => {
                if (
                    product.name.toLowerCase().includes(query) ||
                    (product.brand && product.brand.toLowerCase().includes(query)) ||
                    (product.category && product.category.toLowerCase().includes(query))
                ) {
                    if (!foundProductIds.has(product.id)) {
                        foundProductIds.add(product.id);
                        productResults.push({ item: product, context: `Catégorie: ${product.category}` });
                    }
                }
            });

            setResults({
                products: productResults.slice(0, 5),
                categories: categoryResults.slice(0, 3)
            });
        }, 200);

        return () => clearTimeout(handler);
    }, [searchQuery, allProducts, allCategories]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            onNavigateToCategory(searchQuery.trim());
            setResults(null);
        }
    };

    return (
        <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
                <div className="flex items-center justify-between gap-4 lg:gap-8">
                    
                    {/* Logo with Dynamic Positioning and Drag Offset */}
                    <div 
                        className="shrink-0 flex items-center transition-transform duration-100"
                        style={{
                            transform: activeLogoConfig?.navbarOffset ? `translateX(${activeLogoConfig.navbarOffset}px)` : undefined
                        }}
                    >
                        <a href="#/" className="block">
                            <Logo logoConfig={activeLogoConfig} variant="navbar" />
                        </a>
                    </div>

                    {/* Centered Search Bar with Square Green Button */}
                    <div className="flex-1 max-w-2xl mx-auto hidden md:block" ref={searchRef}>
                        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                            <input
                                type="search"
                                placeholder="Rechercher un produit, une marque..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full py-2.5 pl-6 pr-14 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#84cc16] transition-all"
                            />
                            {/* Square Lime Green Button matching screenshot */}
                            <button
                                type="submit"
                                className="absolute right-1 w-9 h-9 rounded-full sm:rounded-r-full sm:rounded-l-none bg-[#84cc16] hover:bg-[#72b012] text-black flex items-center justify-center transition-colors cursor-pointer"
                                title="Rechercher"
                            >
                                <Search className="w-4 h-4 text-black font-bold stroke-[2.5]" />
                            </button>

                            {results && searchQuery.length >= 2 && (
                                <SearchResultsDropdown
                                    results={results}
                                    onNavigateToProductDetail={onNavigateToProductDetail}
                                    onNavigateToCategory={onNavigateToCategory}
                                    clearSearch={() => {
                                        setSearchQuery('');
                                        setResults(null);
                                    }}
                                />
                            )}
                        </form>
                    </div>

                    {/* Right Account & Cart Actions */}
                    <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                        <ThemeToggle />

                        {/* Compare and Favorites if logged in */}
                        {isLoggedIn && (
                            <>
                                <button 
                                    onClick={onNavigateToFavorites} 
                                    className="relative p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors hidden sm:block" 
                                    title="Favoris"
                                >
                                    <Heart className="w-5 h-5" />
                                    {favoritesCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-[#84cc16] text-black text-[10px] font-black rounded-full h-4 w-4 flex items-center justify-center">
                                            {favoritesCount}
                                        </span>
                                    )}
                                </button>
                                <button 
                                    onClick={onNavigateToCompare} 
                                    className="relative p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors hidden sm:block" 
                                    title="Comparer"
                                >
                                    <Scale className="w-5 h-5" />
                                    {compareList.length > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-[#84cc16] text-black text-[10px] font-black rounded-full h-4 w-4 flex items-center justify-center">
                                            {compareList.length}
                                        </span>
                                    )}
                                </button>
                            </>
                        )}

                        {/* Account Lockup */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => {
                                    if (isLoggedIn) {
                                        setIsProfileMenuOpen(!isProfileMenuOpen);
                                    } else {
                                        onNavigateToLogin();
                                    }
                                }}
                                className="flex items-center gap-2.5 text-left group cursor-pointer"
                            >
                                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:bg-[#84cc16]/20 transition-colors">
                                    <User className="w-5 h-5 stroke-[2]" />
                                </div>
                                <div className="hidden sm:flex flex-col leading-tight">
                                    <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#84cc16] transition-colors">
                                        Mon compte
                                    </span>
                                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                        {isLoggedIn ? (user?.firstName || 'Connecté') : 'Connexion / Inscription'}
                                    </span>
                                </div>
                            </button>

                            {/* Dropdown if logged in */}
                            {isLoggedIn && isProfileMenuOpen && (
                                <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-2 z-50 animate-fadeIn">
                                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                                        <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                                            {user?.firstName} {user?.lastName || ''}
                                        </p>
                                        <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                                    </div>
                                    <button
                                        onClick={() => { setIsProfileMenuOpen(false); onNavigateToProfile(); }}
                                        className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        Mon Profil
                                    </button>
                                    <button
                                        onClick={() => { setIsProfileMenuOpen(false); onNavigateToOrderHistory(); }}
                                        className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        Mes Commandes
                                    </button>
                                    <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                                    <button
                                        onClick={() => { setIsProfileMenuOpen(false); onLogout(); }}
                                        className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                                    >
                                        Déconnexion
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Cart Lockup with Lime Green Badge & Price */}
                        <button
                            type="button"
                            onClick={openCart}
                            className="flex items-center gap-2.5 text-left group cursor-pointer"
                        >
                            <div className="relative w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:bg-[#84cc16]/20 transition-colors">
                                <ShoppingCart className="w-5 h-5 stroke-[2]" />
                                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#84cc16] text-black font-extrabold text-[10px] flex items-center justify-center shadow-xs">
                                    {itemCount}
                                </span>
                            </div>
                            <div className="hidden sm:flex flex-col leading-tight">
                                <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#84cc16] transition-colors">
                                    Panier
                                </span>
                                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                    {cartTotal.toFixed(3)} DT
                                </span>
                            </div>
                        </button>

                    </div>

                </div>

                {/* Mobile search input */}
                <div className="mt-3 md:hidden">
                    <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                        <input
                            type="search"
                            placeholder="Rechercher un produit, une marque..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full py-2 pl-4 pr-12 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400"
                        />
                        <button
                            type="submit"
                            className="absolute right-1 w-7 h-7 rounded-full bg-[#84cc16] text-black flex items-center justify-center"
                        >
                            <Search className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                        </button>
                    </form>
                </div>
            </div>
        </header>
    );
};
