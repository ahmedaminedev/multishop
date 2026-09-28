
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
        ? 'py-3 bg-white/95 dark:bg-brand-dark/95 shadow-xl backdrop-blur-xl' 
        : 'py-6 bg-white dark:bg-brand-dark border-b border-slate-100 dark:border-white/5';

    return (
        <header className={`sticky top-0 z-[60] transition-all duration-500 ${headerClass}`}>
            <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
                <div className="flex items-center justify-between gap-8 lg:gap-16">
                    
                    <a href="#" className="shrink-0">
                        <Logo />
                    </a>

                    <div className="hidden md:flex flex-1 max-w-xl relative">
                        <div className="relative w-full group">
                            <input
                                type="search"
                                placeholder="Rechercher un soin, une cure..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-6 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary transition-all text-sm font-medium"
                            />
                            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 lg:gap-6">
                        <ThemeToggle />
                        
                        <button onClick={onNavigateToFavorites} className="relative group p-2.5 text-slate-500 hover:text-brand-primary transition-colors hidden sm:block">
                            <HeartIcon className="w-6 h-6" />
                            {favoritesCount > 0 && (
                                <span className="absolute top-1 right-1 bg-brand-primary text-white text-[8px] font-black rounded-full h-4 w-4 flex items-center justify-center border border-white dark:border-brand-dark">
                                    {favoritesCount}
                                </span>
                            )}
                        </button>

                        <div className="relative" ref={menuRef}>
                            {isLoggedIn ? (
                                <button 
                                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                    className="flex items-center gap-3 group bg-slate-50 dark:bg-white/5 px-4 py-2 rounded-2xl hover:bg-brand-primary/10 transition-all border border-transparent hover:border-brand-primary/10"
                                >
                                    <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center shadow-lg shadow-brand-primary/20">
                                        <UserIcon className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="hidden xl:flex flex-col items-start leading-none">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Patient</span>
                                        <span className="text-xs font-bold mt-1 uppercase flex items-center gap-2">
                                            {user?.firstName} <ChevronDownIcon className="w-3 h-3" />
                                        </span>
                                    </div>
                                </button>
                            ) : (
                                <button onClick={onNavigateToLogin} className="flex items-center gap-3 text-slate-600 dark:text-slate-300 hover:text-brand-primary group transition-colors">
                                    <div className="w-11 h-11 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-brand-primary/10 transition-colors">
                                        <UserIcon className="w-5 h-5" />
                                    </div>
                                    <div className="hidden xl:flex flex-col items-start leading-none">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Compte</span>
                                        <span className="text-xs font-bold mt-1 uppercase">Connexion</span>
                                    </div>
                                </button>
                            )}

                            {isProfileMenuOpen && isLoggedIn && (
                                <div className="absolute right-0 mt-4 w-64 bg-white dark:bg-brand-dark border border-slate-100 dark:border-white/10 rounded-[2rem] shadow-2xl overflow-hidden py-4 animate-fadeIn">
                                    <button onClick={() => { setIsProfileMenuOpen(false); onNavigateToProfile(); }} className="w-full flex items-center gap-4 px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                        <UserIcon className="w-5 h-5 text-brand-primary" /> Mon Profil
                                    </button>
                                    <button onClick={() => { setIsProfileMenuOpen(false); onNavigateToOrderHistory(); }} className="w-full flex items-center gap-4 px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                        <ClockIcon className="w-5 h-5 text-brand-primary" /> Mes Cures
                                    </button>
                                    <div className="mx-6 my-2 h-px bg-slate-100 dark:bg-white/5"></div>
                                    <button onClick={() => { setIsProfileMenuOpen(false); onLogout(); }} className="w-full flex items-center gap-4 px-6 py-4 text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors">
                                        <ArrowLeftOnRectangleIcon className="w-5 h-5" /> Déconnexion
                                    </button>
                                </div>
                            )}
                        </div>

                        <button onClick={openCart} className="relative group">
                            <div className="w-11 h-11 rounded-2xl bg-brand-primary text-white flex items-center justify-center shadow-lg shadow-brand-primary/20 group-hover:scale-105 transition-transform">
                                <CartIcon className="w-5 h-5" />
                            </div>
                            {itemCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-brand-secondary text-white text-[9px] font-black rounded-full h-5 w-5 flex items-center justify-center border-2 border-white dark:border-brand-dark shadow-md">
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
