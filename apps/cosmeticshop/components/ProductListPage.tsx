
import React, { useState, useEffect, useMemo } from 'react';
import type { Product, Category } from '../types';
import { Breadcrumb } from './Breadcrumb';
import { FiltersSidebar } from './FiltersSidebar';
import { ProductCard } from './ProductCard';
import { ProductListItem } from './ProductListItem';
import { Squares2X2Icon, Bars3Icon, ChevronDownIcon, SparklesIcon, AdjustmentsHorizontalIcon, XMarkIcon } from './IconComponents';
import { ProductListSkeleton } from './Skeletons';

interface ProductListPageProps {
    categoryName: string;
    onNavigateHome: () => void;
    onNavigateToCategory: (categoryName: string) => void;
    onPreview: (product: Product) => void;
    onNavigateToPacks: () => void;
    products: Product[];
    onNavigateToProductDetail: (productId: number) => void;
    categories: Category[];
    activeFilters?: {
        brand: string;
        minPrice: string;
        maxPrice: string;
        promo: boolean;
    };
}

export const ProductListPage: React.FC<ProductListPageProps> = ({ 
    categoryName, 
    onNavigateHome,
    onNavigateToCategory,
    onPreview,
    onNavigateToPacks,
    products: allProducts,
    onNavigateToProductDetail,
    categories,
    activeFilters
}) => {
    const [initialProducts, setInitialProducts] = useState<Product[]>([]);
    const [sortOrder, setSortOrder] = useState('price-asc');
    const [viewMode, setViewMode] = useState('grid-3');
    const [isLoading, setIsLoading] = useState(true);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    
    // Filters State
    const [filters, setFilters] = useState({
        price: { min: 0, max: 3000 },
        brands: [] as string[],
        materials: [] as string[],
    });
    const [isPromoFilterActive, setIsPromoFilterActive] = useState(false);

    // Max Price Calculation
    const maxPrice = useMemo(() => 
        Math.ceil(initialProducts.reduce((max, p) => p.price > max ? p.price : max, 0)) || 3000,
    [initialProducts]);

    // --- Data Logic (Fetching & Filtering) ---
    const getProductsByCategory = (category: string, allProducts: Product[], allCategories: Category[]) => {
        if (!category || category === 'Tous les produits' || category === 'product-list') return allProducts;
        const mainCat = allCategories.find(c => c.name === category);
        let validCategories = [category];
        
        if (mainCat) {
            if (mainCat.subCategories) validCategories = [...validCategories, ...mainCat.subCategories];
            if (mainCat.megaMenu) mainCat.megaMenu.forEach(group => group.items.forEach(item => validCategories.push(item.name)));
            return allProducts.filter(p => p.parentCategory === category || validCategories.includes(p.category));
        } else {
            return allProducts.filter(p => p.category === category);
        }
    };

    useEffect(() => {
        if (activeFilters) {
            let products = getProductsByCategory(categoryName, allProducts, categories);
            const currentMax = Math.ceil(products.reduce((max, p) => p.price > max ? p.price : max, 0)) || 3000;

            setFilters(prev => ({
                ...prev,
                brands: activeFilters.brand ? [activeFilters.brand] : [],
                price: {
                    min: activeFilters.minPrice ? Number(activeFilters.minPrice) : 0,
                    max: activeFilters.maxPrice ? Number(activeFilters.maxPrice) : currentMax
                }
            }));
            setIsPromoFilterActive(activeFilters.promo);
        }
    }, [activeFilters, categoryName, allProducts, categories]);

    useEffect(() => {
        document.title = `${categoryName || 'Produits'} - Cosmetics Shop`;
        setIsLoading(true);
        const timer = setTimeout(() => {
            let products = getProductsByCategory(categoryName, allProducts, categories);
            if (!activeFilters || (!activeFilters.brand && !activeFilters.minPrice && !activeFilters.maxPrice && !activeFilters.promo)) {
                 const currentMax = Math.ceil(products.reduce((max, p) => p.price > max ? p.price : max, 0)) || 3000;
                 setFilters(prev => ({
                    price: { min: 0, max: currentMax },
                    brands: [],
                    materials: []
                 }));
                 setIsPromoFilterActive(false);
            }
            setInitialProducts(products);
            setIsLoading(false);
        }, 600); // Animation delay
        return () => clearTimeout(timer);
    }, [categoryName, allProducts, categories]); 

    const displayedProducts = useMemo(() => {
        let filtered = [...initialProducts]
            .filter(p => p.price >= filters.price.min && p.price <= filters.price.max);
        
        if (filters.brands.length > 0) filtered = filtered.filter(p => filters.brands.includes(p.brand));
        if (filters.materials.length > 0) filtered = filtered.filter(p => p.material && filters.materials.includes(p.material));
        if (isPromoFilterActive) filtered = filtered.filter(p => p.promo || p.discount);
        
        filtered.sort((a, b) => {
            switch (sortOrder) {
                case 'price-asc': return a.price - b.price;
                case 'price-desc': return b.price - a.price;
                case 'name-asc': return a.name.localeCompare(b.name);
                default: return 0;
            }
        });
        return filtered;
    }, [initialProducts, filters, sortOrder, isPromoFilterActive]);

    const gridClasses = useMemo(() => {
        switch (viewMode) {
            case 'grid-3': return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
            case 'list': return 'grid-cols-1';
            default: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
        }
    }, [viewMode]);

    const removeBrandFilter = (brand: string) => setFilters(prev => ({ ...prev, brands: prev.brands.filter(b => b !== brand) }));
    const resetPriceFilter = () => setFilters(prev => ({ ...prev, price: { min: 0, max: maxPrice } }));

    // Dynamic banner text based on category
    const bannerTitle = categoryName === 'product-list' ? 'La Collection' : categoryName;
    const bannerSubtitle = "Explorez notre sélection raffinée, conçue pour sublimer votre beauté naturelle avec élégance.";

    return (
        <div className="bg-[#FAFAFA] dark:bg-gray-950 min-h-screen relative overflow-hidden font-sans">
            
            {/* --- IMMERSIVE HERO HEADER --- */}
            <div className="relative h-[300px] lg:h-[400px] w-full overflow-hidden flex items-center justify-center mb-8">
                {/* Background Image/Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-rose-50 to-white dark:from-gray-900 dark:to-black z-0"></div>
                {/* Abstract Blobs */}
                <div className="absolute top-[-50%] left-[-20%] w-[80%] h-[150%] bg-rose-200/30 dark:bg-rose-900/20 rounded-full blur-[100px] animate-pulse pointer-events-none"></div>
                
                <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
                    <span className="inline-block py-1 px-3 rounded-full bg-white/50 dark:bg-white/10 backdrop-blur-sm border border-white/40 dark:border-white/10 text-rose-600 dark:text-rose-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 shadow-sm animate-fadeIn">
                        Cosmetics Shop
                    </span>
                    <h1 className="text-5xl lg:text-7xl font-serif text-gray-900 dark:text-white mb-6 leading-none animate-fadeInUp">
                        {bannerTitle}
                    </h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 font-light max-w-2xl mx-auto animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                        {bannerSubtitle}
                    </p>
                </div>
            </div>

            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 relative z-10 -mt-10">
                
                {/* Breadcrumb Area */}
                <div className="mb-8 hidden lg:block pl-2">
                    <Breadcrumb items={[{ name: 'Accueil', onClick: onNavigateHome }, { name: categoryName || 'Produits' }]} />
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* --- SIDEBAR FILTERS --- */}
                    <div className={`
                        fixed inset-0 z-50 bg-white dark:bg-gray-900 p-6 overflow-y-auto transition-transform duration-300 lg:translate-x-0 lg:static lg:bg-transparent lg:p-0 lg:overflow-visible lg:w-[280px] lg:block
                        ${showMobileFilters ? 'translate-x-0' : '-translate-x-full'}
                    `}>
                        <div className="lg:hidden flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold font-serif">Filtres</h2>
                            <button onClick={() => setShowMobileFilters(false)} className="p-2 rounded-full hover:bg-gray-100"><XMarkIcon className="w-6 h-6"/></button>
                        </div>
                        <FiltersSidebar 
                            products={initialProducts} 
                            filters={filters}
                            onFilterChange={setFilters}
                            maxPrice={maxPrice}
                        />
                    </div>

                    {/* --- MAIN GRID --- */}
                    <main className="flex-1 min-w-0">
                        {/* Toolbar */}
                        <div className="sticky top-20 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg shadow-gray-200/20 dark:shadow-none p-3 mb-8 flex flex-col md:flex-row justify-between items-center gap-4 transition-all duration-300">
                            
                            {/* Mobile Toggle */}
                            <button 
                                onClick={() => setShowMobileFilters(true)}
                                className="lg:hidden w-full md:w-auto flex justify-center items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm font-bold shadow-sm"
                            >
                                <AdjustmentsHorizontalIcon className="w-5 h-5"/> Filtres
                            </button>

                            {/* Count */}
                            <div className="hidden lg:flex items-center gap-2 px-4">
                                <span className="text-sm text-gray-500 font-medium">
                                    <strong className="text-gray-900 dark:text-white">{displayedProducts.length}</strong> produits
                                </span>
                            </div>

                            {/* Promo Toggle */}
                            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-xl">
                                <span className={`text-xs font-bold uppercase tracking-wider ${isPromoFilterActive ? 'text-rose-500' : 'text-gray-400'}`}>Promotions</span>
                                <button 
                                    onClick={() => setIsPromoFilterActive(!isPromoFilterActive)}
                                    className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-300 ease-in-out ${isPromoFilterActive ? 'bg-rose-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isPromoFilterActive ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                </button>
                            </div>

                            {/* Actions Right */}
                            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                                <div className="relative group">
                                    <select 
                                        value={sortOrder} 
                                        onChange={(e) => setSortOrder(e.target.value)} 
                                        className="appearance-none bg-transparent pl-3 pr-8 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 cursor-pointer focus:outline-none hover:text-rose-600 transition-colors"
                                    >
                                        <option value="price-asc">Prix croissant</option>
                                        <option value="price-desc">Prix décroissant</option>
                                        <option value="name-asc">Nom (A-Z)</option>
                                    </select>
                                    <ChevronDownIcon className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-rose-500 transition-colors" />
                                </div>

                                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2 hidden md:block"></div>

                                <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                                     <button onClick={() => setViewMode('grid-3')} className={`p-2 rounded-md transition-all ${viewMode === 'grid-3' ? 'bg-white dark:bg-gray-600 shadow text-rose-600' : 'text-gray-400 hover:text-gray-600'}`} aria-label="Grille">
                                        <Squares2X2Icon className="w-4 h-4"/>
                                     </button>
                                     <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow text-rose-600' : 'text-gray-400 hover:text-gray-600'}`} aria-label="Liste">
                                        <Bars3Icon className="w-4 h-4"/>
                                     </button>
                                </div>
                            </div>
                        </div>

                        {/* Active Filters Tags */}
                        {(filters.brands.length > 0 || filters.price.max < maxPrice) && (
                            <div className="flex flex-wrap items-center gap-2 mb-6 animate-fadeIn">
                                {filters.brands.map(brand => (
                                    <button key={brand} onClick={() => removeBrandFilter(brand)} className="flex items-center gap-1 px-3 py-1 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded-full text-xs font-bold border border-rose-100 dark:border-rose-800 hover:bg-rose-100 transition-colors">
                                        {brand} <XMarkIcon className="w-3 h-3"/>
                                    </button>
                                ))}
                                {filters.price.max < maxPrice && (
                                    <button onClick={resetPriceFilter} className="flex items-center gap-1 px-3 py-1 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded-full text-xs font-bold border border-rose-100 dark:border-rose-800 hover:bg-rose-100 transition-colors">
                                        &lt; {filters.price.max} TND <XMarkIcon className="w-3 h-3"/>
                                    </button>
                                )}
                                <button onClick={() => { setFilters({ price: { min: 0, max: 3000 }, brands: [], materials: [] }); setIsPromoFilterActive(false); }} className="text-xs text-gray-400 hover:text-gray-600 underline ml-2">Effacer tout</button>
                            </div>
                        )}
                        
                        {/* Products Grid */}
                        {isLoading ? (
                            <ProductListSkeleton count={9} />
                        ) : (
                            displayedProducts.length > 0 ? (
                                <div className={viewMode === 'list' ? 'space-y-6' : `grid ${gridClasses} gap-6 lg:gap-8`}>
                                    {displayedProducts.map((product, index) => (
                                        <div 
                                            key={product.id} 
                                            className="animate-fadeInUp"
                                            style={{ animationDelay: `${index * 50}ms` }} 
                                        >
                                            {viewMode === 'list' ? (
                                                <ProductListItem product={product} onPreview={onPreview} onNavigateToProductDetail={onNavigateToProductDetail}/>
                                            ) : (
                                                <ProductCard product={product} onPreview={onPreview} onNavigateToProductDetail={onNavigateToProductDetail} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 text-gray-300">
                                        <SparklesIcon className="w-10 h-10" />
                                    </div>
                                    <p className="text-xl font-serif text-gray-900 dark:text-white mb-2">Aucun résultat.</p>
                                    <button 
                                        onClick={() => {
                                            setFilters({ price: { min: 0, max: 3000 }, brands: [], materials: [] });
                                            setIsPromoFilterActive(false);
                                        }}
                                        className="mt-4 px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform"
                                    >
                                        Voir tous les produits
                                    </button>
                                </div>
                            )
                        )}
                    </main>
                </div>
            </div>
            
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeInUp { animation: fadeInUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
            `}</style>
        </div>
    );
};