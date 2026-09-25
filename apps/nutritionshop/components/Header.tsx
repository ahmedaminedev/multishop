import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon, UserIcon, CartIcon, HeartIcon, ScaleIcon, ClockIcon, ArrowLeftOnRectangleIcon } from './IconComponents';
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
        ? 'py-2 bg-white/95 dark:bg-brand-black/95 shadow-md backdrop-blur-md' 
        : 'py-6 bg-white dark:bg-brand-black';

    const handleUserIconClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (isLoggedIn) {
            setIsProfileMenuOpen(!isProfileMenuOpen);
        } else {
            onNavigateToLogin();
        }
    };

    return (
        <header className={`sticky top-0 z-[60] transition-all duration-500 ease-in-out border-b border-gray-100 dark:border-gray-800 ${headerClass}`}>
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
                            <button onClick={openCart} className="relative p-2 text-gray-800 dark:text-white hover:text-brand-neon transition-colors">
                                <CartIcon className="w-6 h-6" />
                                {itemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-brand-neon text-black text-[10px] font-bold rounded-none h-4 w-4 flex items-center justify-center border border-black">
                                        {itemCount}
                                    </span>
                                )}
                            </button>
                            <div className="relative">
                                <button onClick={handleUserIconClick} className="p-2 text-gray-800 dark:text-white hover:text-brand-neon transition-colors">
                                    <UserIcon className="w-6 h-6" />
                                </button>
                                {isLoggedIn && isProfileMenuOpen && (
                                    <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-[#0b0c10] border border-gray-200 dark:border-gray-700 shadow-xl z-50 animate-fadeIn rounded-sm">
                                        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#15161a]">
                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-black mb-1">Compte</p>
                                            <p className="font-serif font-bold text-gray-900 dark:text-white text-base truncate">{user?.firstName}</p>
                                        </div>
                                        <div className="py-2">
                                            <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToProfile(); setIsProfileMenuOpen(false); }} className="flex items-center gap-3 px-5 py-3 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white transition-colors uppercase tracking-wider">
                                                <UserIcon className="w-4 h-4" /> Mon Profil
                                            </a>
                                            {user?.role !== 'ADMIN' && (
                                                <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToOrderHistory(); setIsProfileMenuOpen(false); }} className="flex items-center gap-3 px-5 py-3 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white transition-colors uppercase tracking-wider">
                                                    <ClockIcon className="w-4 h-4" /> Commandes
                                                </a>
                                            )}
                                        </div>
                                        <div className="border-t border-gray-100 dark:border-gray-800 p-2">
                                            <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); setIsProfileMenuOpen(false); }} className="block w-full text-center px-4 py-3 text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-black hover:text-white dark:hover:bg-brand-neon dark:hover:text-black transition-colors uppercase tracking-widest rounded-sm">
                                                Déconnexion
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Search Bar - Technical Style */}
                    <div className="flex-1 w-full md:max-w-2xl md:mx-auto order-last md:order-none" ref={searchRef}>
                        <div className="relative group">
                            <input
                                type="search"
                                placeholder="RECHERCHER UN PRODUIT, UNE MARQUE..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-100 dark:bg-brand-dark border-2 border-transparent focus:border-brand-neon rounded-none transform skew-x-[-12deg] py-3 pl-14 pr-6 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none transition-all font-serif text-sm font-bold tracking-wider uppercase"
                            />
                            {/* Un-skew text inside input */}
                            <div className="absolute top-0 left-0 flex items-center h-full pl-6 pointer-events-none">
                                <SearchIcon className="w-5 h-5 text-gray-400 group-hover:text-brand-neon transition-colors" />
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

                    {/* Desktop Icons - Industrial Look */}
                    <div className="hidden md:flex items-center space-x-2 lg:space-x-4 shrink-0">
                        <ThemeToggle />
                        
                        {isLoggedIn && (
                            <button onClick={onNavigateToCompare} className="relative group p-3 text-gray-600 dark:text-gray-300 hover:text-brand-neon transition-all hover:-translate-y-0.5" title="Comparer">
                                <ScaleIcon className="w-6 h-6" />
                                {compareList.length > 0 && (
                                    <span className="absolute top-1 right-1 bg-black text-brand-neon border border-brand-neon text-[10px] font-bold rounded-none h-4 w-4 flex items-center justify-center">
                                        {compareList.length}
                                    </span>
                                )}
                            </button>
                        )}

                        {isLoggedIn && (
                             <button onClick={onNavigateToFavorites} className="relative group p-3 text-gray-600 dark:text-gray-300 hover:text-white transition-all hover:-translate-y-0.5" title="Favoris">
                                <HeartIcon className="w-6 h-6 group-hover:text-white" />
                                {favoritesCount > 0 && (
                                    <span className="absolute top-1 right-1 bg-white text-black text-[10px] font-bold rounded-none h-4 w-4 flex items-center justify-center animate-pulse">
                                        {favoritesCount}
                                    </span>
                                )}
                            </button>
                        )}

                        <div className="relative">
                            <button 
                                onMouseEnter={() => isLoggedIn && setIsProfileMenuOpen(true)} 
                                onClick={handleUserIconClick} 
                                className="group p-3 flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-brand-neon transition-all hover:-translate-y-0.5"
                            >
                                <UserIcon className="w-6 h-6" />
                                {!isLoggedIn && <span className="hidden xl:block font-serif font-bold text-sm tracking-widest uppercase">CONNEXION</span>}
                            </button>
                            
                             {isLoggedIn && isProfileMenuOpen && (
                                 <div 
                                    className="absolute right-0 top-[120%] w-72 bg-white dark:bg-[#0b0c10] rounded-sm shadow-[0_15px_40px_rgba(0,0,0,0.4)] py-0 z-[70] border border-gray-200 dark:border-gray-800 overflow-hidden animate-fadeIn origin-top-right ring-1 ring-black/5"
                                    onMouseLeave={() => setIsProfileMenuOpen(false)}
                                >
                                    {/* Menu Header */}
                                    <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#15161a]">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-black">Athlète</p>
                                            {user?.role === 'ADMIN' && <span className="bg-brand-neon text-black text-[9px] font-bold px-1.5 py-0.5 rounded-sm">ADMIN</span>}
                                        </div>
                                        <p className="text-lg font-serif font-bold text-gray-900 dark:text-white truncate">{user?.firstName} {user?.lastName}</p>
                                        <p className="text-[10px] text-gray-500 font-mono truncate">{user?.email}</p>
                                    </div>

                                    {/* Menu Links */}
                                    <div className="py-2">
                                        <a 
                                            href="#" 
                                            onClick={(e) => { e.preventDefault(); onNavigateToProfile(); setIsProfileMenuOpen(false); }} 
                                            className="group flex items-center gap-4 px-6 py-3.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1f2833] hover:text-black dark:hover:text-white transition-all uppercase tracking-wider"
                                        >
                                            <span className="text-gray-400 group-hover:text-brand-neon transition-colors"><UserIcon className="w-4 h-4" /></span>
                                            Mon Profil
                                        </a>
                                        
                                        {user?.role !== 'ADMIN' && (
                                            <a 
                                                href="#" 
                                                onClick={(e) => { e.preventDefault(); onNavigateToOrderHistory(); setIsProfileMenuOpen(false); }} 
                                                className="group flex items-center gap-4 px-6 py-3.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1f2833] hover:text-black dark:hover:text-white transition-all uppercase tracking-wider"
                                            >
                                                <span className="text-gray-400 group-hover:text-brand-neon transition-colors"><ClockIcon className="w-4 h-4" /></span>
                                                Mes Commandes
                                            </a>
                                        )}
                                        
                                        <a 
                                            href="#" 
                                            onClick={(e) => { e.preventDefault(); onNavigateToFavorites(); setIsProfileMenuOpen(false); }} 
                                            className="group flex items-center gap-4 px-6 py-3.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1f2833] hover:text-black dark:hover:text-white transition-all uppercase tracking-wider"
                                        >
                                            <span className="text-gray-400 group-hover:text-brand-neon transition-colors"><HeartIcon className="w-4 h-4" /></span>
                                            Mes Favoris
                                        </a>
                                    </div>

                                    {/* Menu Footer */}
                                    <div className="border-t border-gray-100 dark:border-gray-800 p-3 bg-white dark:bg-[#0b0c10]">
                                        <a 
                                            href="#" 
                                            onClick={(e) => { e.preventDefault(); onLogout(); setIsProfileMenuOpen(false); }} 
                                            className="flex items-center justify-center gap-2 w-full px-4 py-3 text-xs font-black text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 hover:bg-black hover:text-white dark:hover:bg-brand-neon dark:hover:text-black transition-colors uppercase tracking-[0.1em] rounded-sm skew-x-[-6deg]"
                                        >
                                            <span className="skew-x-[6deg] block flex items-center gap-2">
                                                <ArrowLeftOnRectangleIcon className="w-3 h-3" /> Déconnexion
                                            </span>
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button onClick={openCart} className="relative group p-3 text-gray-600 dark:text-gray-300 hover:text-brand-neon transition-all hover:-translate-y-0.5">
                            <CartIcon className="w-6 h-6" />
                            {itemCount > 0 && (
                                <span className="absolute top-1 right-1 bg-brand-neon text-black text-[10px] font-bold rounded-none h-4 w-4 flex items-center justify-center shadow-sm">
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