
import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon, UserIcon, ShoppingBagIcon, HeartIcon, ScaleIcon } from './IconComponents';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { useCart } from './CartContext';
import { useFavorites } from './FavoritesContext';
import { useCompare } from './CompareContext';
import type { Product, Pack, Category, SearchResult, SearchResultItem, User } from '../types';
import { SearchResultsDropdown } from './SearchResultsDropdown';

interface HeaderProps {
    user: User | null;
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
    allPacks,
    allCategories,
    onNavigateToCategory,
    onNavigateToProductDetail,
    onNavigateToCompare
}) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const { itemCount, openCart } = useCart();
    const { favoritesCount } = useFavorites();
    const { compareList } = useCompare();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<SearchResult | null>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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

            const allCategoryNames = new Set<string>();
            allCategories.forEach(cat => {
                if (cat.name) allCategoryNames.add(cat.name);
                if (cat.subCategories) cat.subCategories.forEach(sub => allCategoryNames.add(sub));
                if (cat.megaMenu) cat.megaMenu.forEach(group => group.items.forEach(item => allCategoryNames.add(item.name)));
            });
            allCategoryNames.forEach(catName => {
                if (catName.toLowerCase().includes(query)) {
                    categoryResults.push({ name: catName });
                }
            });

            allProducts.forEach(product => {
                let match = false;
                let context = `Catégorie: ${product.category}`;
                
                if (product.name.toLowerCase().includes(query) || product.brand.toLowerCase().includes(query) || product.category.toLowerCase().includes(query)) {
                    match = true;
                }

                if (match && !foundProductIds.has(product.id)) {
                    productResults.push({ item: product, context });
                    foundProductIds.add(product.id);
                }
            });

            setResults({
                products: productResults.slice(0, 5),
                categories: categoryResults.slice(0, 3)
            });

        }, 300);

        return () => clearTimeout(handler);
    }, [searchQuery, allProducts, allPacks, allCategories]);

    const headerClass = isScrolled 
        ? 'py-2 bg-white/95 dark:bg-gray-900/95 shadow-md backdrop-blur-md' 
        : 'py-6 bg-white dark:bg-gray-900';

    const handleUserIconClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (isLoggedIn) {
            setIsProfileMenuOpen(!isProfileMenuOpen);
        } else {
            onNavigateToLogin();
        }
    };

    return (
        <header className={`sticky top-0 z-40 transition-all duration-500 ease-in-out border-b border-gray-100 dark:border-gray-800 ${headerClass}`}>
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    
                    {/* Logo Area */}
                    <div className="flex items-center justify-between w-full md:w-auto shrink-0">
                        <a href="#" onClick={(e) => { e.preventDefault(); window.location.reload(); }} className="block transform hover:scale-105 transition-transform duration-300">
                            <Logo />
                        </a>

                        {/* Mobile Icons */}
                        <div className="flex items-center space-x-4 md:hidden">
                            <ThemeToggle />
                            <button onClick={openCart} className="relative p-2 text-gray-800 dark:text-white hover:text-rose-600 transition-colors">
                                <ShoppingBagIcon className="w-6 h-6" />
                                {itemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center ring-2 ring-white dark:ring-gray-900">
                                        {itemCount}
                                    </span>
                                )}
                            </button>
                            <div className="relative">
                                <button onClick={handleUserIconClick} className="p-2 text-gray-800 dark:text-white hover:text-rose-600 transition-colors">
                                    <UserIcon className="w-6 h-6" />
                                </button>
                                {isLoggedIn && isProfileMenuOpen && (
                                    <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl py-2 z-50 border border-gray-100 dark:border-gray-700 overflow-hidden animate-fadeIn">
                                        <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToProfile(); setIsProfileMenuOpen(false); }} className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-rose-50 dark:hover:bg-gray-700 hover:text-rose-600 transition-colors">Mon Profil</a>
                                        <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); setIsProfileMenuOpen(false); }} className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-rose-50 dark:hover:bg-gray-700 hover:text-rose-600 transition-colors">Déconnexion</a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Modern Centered Search Bar */}
                    <div className="flex-1 w-full md:max-w-2xl md:mx-auto order-last md:order-none" ref={searchRef}>
                        <div className="relative group">
                            <input
                                type="search"
                                placeholder="Rechercher un soin, une marque..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full py-3.5 pl-14 pr-6 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900 focus:border-rose-300 transition-all font-sans text-sm shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] hover:shadow-lg"
                            />
                            <div className="absolute top-0 left-0 flex items-center h-full pl-5">
                                <SearchIcon className="w-5 h-5 text-gray-400 group-hover:text-rose-500 transition-colors" />
                            </div>
                             {results && searchQuery.length > 0 && (
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
                        </div>
                    </div>

                    {/* Desktop Icons - Minimalist & Elegant */}
                    <div className="hidden md:flex items-center space-x-2 lg:space-x-4 shrink-0">
                        <ThemeToggle />
                        
                        {isLoggedIn && (
                            <button onClick={onNavigateToCompare} className="relative group p-3 text-gray-600 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 transition-all hover:-translate-y-0.5" title="Comparer">
                                <ScaleIcon className="w-6 h-6" />
                                {compareList.length > 0 && (
                                    <span className="absolute top-1 right-1 bg-gray-900 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center ring-2 ring-white dark:ring-gray-900">
                                        {compareList.length}
                                    </span>
                                )}
                            </button>
                        )}

                        {isLoggedIn && (
                             <button onClick={onNavigateToFavorites} className="relative group p-3 text-gray-600 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 transition-all hover:-translate-y-0.5" title="Favoris">
                                <HeartIcon className="w-6 h-6" />
                                {favoritesCount > 0 && (
                                    <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center ring-2 ring-white dark:ring-gray-900 animate-pulse">
                                        {favoritesCount}
                                    </span>
                                )}
                            </button>
                        )}

                        <div className="relative">
                            <button 
                                onMouseEnter={() => isLoggedIn && setIsProfileMenuOpen(true)} 
                                onClick={handleUserIconClick} 
                                className="group p-3 flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 transition-all hover:-translate-y-0.5"
                            >
                                <UserIcon className="w-6 h-6" />
                                {!isLoggedIn && <span className="hidden xl:block font-serif text-sm tracking-wide">CONNEXION</span>}
                            </button>
                            
                             {isLoggedIn && isProfileMenuOpen && (
                                 <div 
                                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] py-2 z-50 border border-gray-100 dark:border-gray-700 overflow-hidden animate-fadeIn"
                                    onMouseLeave={() => setIsProfileMenuOpen(false)}
                                >
                                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold">Bonjour</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.firstName}</p>
                                    </div>
                                    <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToProfile(); setIsProfileMenuOpen(false); }} className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-rose-50 dark:hover:bg-gray-700 hover:text-rose-600 transition-colors">Mon Profil</a>
                                    {user?.role !== 'ADMIN' && (
                                        <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToOrderHistory(); setIsProfileMenuOpen(false); }} className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-rose-50 dark:hover:bg-gray-700 hover:text-rose-600 transition-colors">Mes Commandes</a>
                                    )}
                                    <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); setIsProfileMenuOpen(false); }} className="block px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium">Déconnexion</a>
                                </div>
                            )}
                        </div>

                        <button onClick={openCart} className="relative group p-3 text-gray-600 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 transition-all hover:-translate-y-0.5">
                            <ShoppingBagIcon className="w-6 h-6" />
                            {itemCount > 0 && (
                                <span className="absolute top-1 right-1 bg-rose-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-sm ring-2 ring-white dark:ring-gray-900">
                                    {itemCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};
