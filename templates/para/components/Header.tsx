
import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon, UserIcon, CartIcon, HeartIcon, ClockIcon, ArrowLeftOnRectangleIcon, ChevronDownIcon } from './IconComponents';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { useCart } from './CartContext';
import { useFavorites } from './FavoritesContext';
import type { Product, Pack, Category, User } from '../types';

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
    onNavigateToCategory,
    onNavigateToProductDetail,
}) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const { itemCount, openCart } = useCart();
    const { favoritesCount } = useFavorites();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const headerClass = isScrolled 
        ? 'py-1.5 bg-white/95 dark:bg-brand-dark/95 shadow-md backdrop-blur-xl' 
        : 'py-2 bg-white dark:bg-brand-dark border-b border-slate-100 dark:border-white/5';

    return (
        <header className={`sticky top-0 z-[60] transition-all duration-300 ${headerClass}`}>
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between gap-3 lg:gap-6">
                    
                    <a href="#" className="shrink-0">
                        <Logo />
                    </a>

                    <div className="hidden md:flex flex-1 max-w-md relative">
                        <div className="relative w-full group">
                            <input
                                type="search"
                                placeholder="Rechercher un soin, une cure..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg py-1.5 pl-9 pr-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-xs font-medium"
                            />
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <ThemeToggle />
                        
                        {/* 3. Bouton Favoris uniquement pour les clients connectés */}
                        {isLoggedIn && (
                            <button onClick={onNavigateToFavorites} className="relative group p-1.5 text-slate-500 hover:text-brand-primary transition-colors hidden sm:block" title="Mes Favoris">
                                <HeartIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                {favoritesCount > 0 && (
                                    <span className="absolute top-0 right-0 bg-brand-primary text-white text-[8px] font-black rounded-full h-3.5 w-3.5 flex items-center justify-center border border-white dark:border-brand-dark">
                                        {favoritesCount}
                                    </span>
                                )}
                            </button>
                        )}

                        {/* 3. Bouton Compte uniquement pour les clients connectés */}
                        {isLoggedIn ? (
                            <div className="relative" ref={menuRef}>
                                <button 
                                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                    className="flex items-center gap-2 group bg-slate-50 dark:bg-white/5 px-2.5 py-1 rounded-lg hover:bg-brand-primary/10 transition-all border border-transparent hover:border-brand-primary/10"
                                >
                                    <div className="w-6 h-6 rounded-md bg-brand-primary flex items-center justify-center shadow-xs">
                                        <UserIcon className="w-3 h-3 text-white" />
                                    </div>
                                    <div className="hidden xl:flex flex-col items-start leading-none">
                                        <span className="text-[7px] font-black uppercase tracking-wider text-slate-400">Client</span>
                                        <span className="text-[11px] font-bold mt-0.5 uppercase flex items-center gap-1">
                                            {user?.firstName} <ChevronDownIcon className="w-2.5 h-2.5" />
                                        </span>
                                    </div>
                                </button>

                                {isProfileMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-brand-dark border border-slate-100 dark:border-white/10 rounded-xl shadow-xl overflow-hidden py-1.5 animate-fadeIn z-50">
                                        <button onClick={() => { setIsProfileMenuOpen(false); onNavigateToProfile(); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                            <UserIcon className="w-3.5 h-3.5 text-brand-primary" /> Mon Profil
                                        </button>
                                        <button onClick={() => { setIsProfileMenuOpen(false); onNavigateToOrderHistory(); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                            <ClockIcon className="w-3.5 h-3.5 text-brand-primary" /> Mes Commandes
                                        </button>
                                        <div className="mx-3 my-1 h-px bg-slate-100 dark:bg-white/5"></div>
                                        <button onClick={() => { setIsProfileMenuOpen(false); onLogout(); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors">
                                            <ArrowLeftOnRectangleIcon className="w-3.5 h-3.5" /> Déconnexion
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={onNavigateToLogin}
                                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-white/5 hover:bg-brand-primary hover:text-white text-slate-700 dark:text-slate-200 transition-all border border-slate-200/60 dark:border-white/10"
                            >
                                <UserIcon className="w-3.5 h-3.5" />
                                <span>Connexion</span>
                            </button>
                        )}

                        <button onClick={openCart} className="relative group">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center shadow-md shadow-brand-primary/20 group-hover:scale-105 transition-transform">
                                <CartIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                            </div>
                            {itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-brand-secondary text-white text-[8px] font-black rounded-full h-4 w-4 flex items-center justify-center border border-white dark:border-brand-dark shadow-xs">
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
