
import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon, UserIcon, CartIcon, HeartIcon, ScaleIcon } from './IconComponents';
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

const getProductIdsFromPack = (pack: Pack, allPacks: Pack[]): number[] => {
    let ids = [...pack.includedProductIds];
    if (pack.includedPackIds) {
        pack.includedPackIds.forEach(subPackId => {
            const subPack = allPacks.find(p => p.id === subPackId);
            if (subPack) {
                ids = [...ids, ...getProductIdsFromPack(subPack, allPacks)];
            }
        });
    }
    return ids;
};

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

            // 1. Search Categories
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

            // 2. Search Products
            allProducts.forEach(product => {
                let match = false;
                let context = `Dans la catégorie: ${product.category}`;
                
                if (product.name.toLowerCase().includes(query) || product.brand.toLowerCase().includes(query) || product.category.toLowerCase().includes(query)) {
                    match = true;
                }

                const discountQuery = query.match(/(\d+)\s*%?/);
                if (discountQuery && product.discount && product.discount === parseInt(discountQuery[1], 10)) {
                    match = true;
                    context = `En promotion: -${product.discount}%`;
                }

                if (product.specifications) {
                    for (const spec of product.specifications) {
                        if (`${spec.name} ${spec.value}`.toLowerCase().includes(query)) {
                            match = true;
                            context = `Caractéristique: ${spec.name} ${spec.value}`;
                            break;
                        }
                    }
                }

                if (match && !foundProductIds.has(product.id)) {
                    productResults.push({ item: product, context });
                    foundProductIds.add(product.id);
                }
            });

            // 3. Search Products in Packs
            allPacks.forEach(pack => {
                const productIdsInPack = getProductIdsFromPack(pack, allPacks);
                productIdsInPack.forEach(productId => {
                    const product = allProducts.find(p => p.id === productId);
                    if (product && (product.name.toLowerCase().includes(query) || product.brand.toLowerCase().includes(query)) && !foundProductIds.has(product.id)) {
                        productResults.push({ item: product, context: `Dans le pack: ${pack.name}` });
                        foundProductIds.add(product.id);
                    }
                });
            });

            setResults({
                products: productResults.slice(0, 5),
                categories: categoryResults.slice(0, 3)
            });

        }, 300);

        return () => clearTimeout(handler);
    }, [searchQuery, allProducts, allPacks, allCategories]);

    return (
        <header className={`bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-md sticky top-0 z-40 transition-all duration-300 ${isScrolled ? 'py-2' : 'py-3 md:py-5'}`}>
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    {/* Top Row on Mobile: Logo + Icons */}
                    <div className="flex items-center justify-between w-full md:w-auto">
                        <div className="flex items-center">
                            <a href="#" onClick={(e) => { e.preventDefault(); window.location.reload(); }}>
                                <Logo />
                            </a>
                        </div>

                        {/* Mobile Icons (Visible only on small screens, grouped with Logo) */}
                        <div className="flex items-center space-x-2 md:hidden">
                            <ThemeToggle />
                            
                            <button onClick={openCart} className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-red-600">
                                <CartIcon className="w-6 h-6" />
                                {itemCount > 0 && (
                                    <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                                        {itemCount}
                                    </span>
                                )}
                            </button>

                            <div className="relative">
                                <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600">
                                    <UserIcon className="w-6 h-6" />
                                </button>
                                {isLoggedIn && isProfileMenuOpen && (
                                    <div 
                                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border dark:border-gray-700"
                                        onMouseLeave={() => setIsProfileMenuOpen(false)}
                                    >
                                        <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToProfile(); setIsProfileMenuOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Mon Profil</a>
                                        {user?.role !== 'ADMIN' && (
                                            <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToOrderHistory(); setIsProfileMenuOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Mes Commandes</a>
                                        )}
                                        <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); setIsProfileMenuOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Déconnexion</a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Search Bar - Full width on mobile, centered on desktop */}
                    <div className="flex-1 w-full md:max-w-2xl md:mx-8 order-last md:order-none" ref={searchRef}>
                        <div className="relative">
                            <input
                                type="search"
                                placeholder="Rechercher un produit..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-full py-2 pl-10 pr-4 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-sm md:text-base"
                            />
                            <div className="absolute top-0 left-0 flex items-center h-full pl-3">
                                <SearchIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
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

                    {/* Desktop Icons (Hidden on mobile) */}
                    <div className="hidden md:flex items-center space-x-4 md:space-x-6">
                        <ThemeToggle />
                        
                        {/* Compare Button */}
                        {isLoggedIn && (
                            <button onClick={onNavigateToCompare} className="relative flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500" aria-label="Comparer">
                                <ScaleIcon className="w-6 h-6" />
                                <span className="hidden xl:block">Comparer</span>
                                {compareList.length > 0 && (
                                    <span className="absolute -top-2 -right-3 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        {compareList.length}
                                    </span>
                                )}
                            </button>
                        )}

                        {/* Favorites Button */}
                        {isLoggedIn && (
                             <button onClick={onNavigateToFavorites} className="relative flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500">
                                <HeartIcon className="w-6 h-6" />
                                <span className="hidden xl:block">Favoris</span>
                                {favoritesCount > 0 && (
                                    <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        {favoritesCount}
                                    </span>
                                )}
                            </button>
                        )}

                        {/* User Menu */}
                        <div className="relative">
                            {isLoggedIn ? (
                                 <button onMouseEnter={() => setIsProfileMenuOpen(true)} onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500">
                                    <UserIcon className="w-6 h-6" />
                                    <span className="hidden xl:block">Mon Compte</span>
                                </button>
                            ) : (
                                <button onClick={onNavigateToLogin} className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500">
                                    <UserIcon className="w-6 h-6" />
                                    <span className="hidden xl:block">Compte</span>
                                </button>
                            )}
                             {isLoggedIn && isProfileMenuOpen && (
                                 <div 
                                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border dark:border-gray-700"
                                    onMouseLeave={() => setIsProfileMenuOpen(false)}
                                >
                                    <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToProfile(); setIsProfileMenuOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Mon Profil</a>
                                    {user?.role !== 'ADMIN' && (
                                        <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToOrderHistory(); setIsProfileMenuOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Mes Commandes</a>
                                    )}
                                    <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); setIsProfileMenuOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Déconnexion</a>
                                </div>
                            )}
                        </div>

                        {/* Cart Button */}
                        <button onClick={openCart} className="relative flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500">
                            <CartIcon className="w-6 h-6" />
                            <span className="hidden xl:block">Panier</span>
                            {itemCount > 0 && (
                                <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
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
