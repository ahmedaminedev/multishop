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
    
    const [filters, setFilters] = useState({
        price: { min: 0, max: 3000 },
        brands: [] as string[],
        materials: [] as string[],
    });
    const [isPromoFilterActive, setIsPromoFilterActive] = useState(false);

    const maxPrice = useMemo(() => 
        Math.ceil(initialProducts.reduce((max, p) => p.price > max ? p.price : max, 0)) || 3000,
    [initialProducts]);

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
        document.title = `${categoryName || 'Arsenal'} - IronFuel Nutrition`;
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
        }, 400); 
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

    const bannerTitle = categoryName === 'product-list' ? 'CATALOGUE GÉNÉRAL' : categoryName.toUpperCase();

    return (
        <div className="bg-white dark:bg-brand-black min-h-screen relative overflow-hidden font-sans transition-colors duration-300">
            
            {/* --- INDUSTRIAL HERO HEADER --- */}
            <div className="relative h-[250px] lg:h-[350px] w-full overflow-hidden flex items-center justify-center border-b-4 border-black dark:border-brand-neon">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gray-900 z-0">
                    <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2000&auto=format&fit=crop" className="w-full h-full object-cover opacity-20 grayscale contrast-125" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-brand-black via-transparent to-transparent"></div>
                    {/* HUD Grid */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(204,255,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(204,255,0,0.05)_1px,transparent_1px)] bg-[size:30px_30px] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]"></div>
                </div>
                
                <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
                    <div className="mb-4 inline-flex items-center gap-2 border border-brand-neon/30 bg-brand-neon/5 px-4 py-1 slant">
                        <span className="slant-reverse text-brand-neon text-[10px] font-black uppercase tracking-[0.3em]">IronFuel Supply</span>
                    </div>
                    <h1 className="text-5xl lg:text-8xl font-serif font-black italic text-gray-900 dark:text-white leading-none tracking-tighter animate-fadeInUp">
                        {bannerTitle}
                    </h1>
                </div>
            </div>

            <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 relative z-10">
                
                <div className="py-6 border-b border-gray-100 dark:border-gray-800 mb-8">
                    <Breadcrumb items={[{ name: 'Accueil', onClick: onNavigateHome }, { name: categoryName || 'Catalogue' }]} />
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* --- SIDEBAR FILTERS --- */}
                    <div className={`
                        fixed inset-0 z-50 bg-white dark:bg-brand-black p-6 overflow-y-auto transition-transform duration-300 lg:translate-x-0 lg:static lg:bg-transparent lg:p-0 lg:overflow-visible lg:w-[300px] lg:block
                        ${showMobileFilters ? 'translate-x-0' : '-translate-x-full'}
                    `}>
                        <div className="lg:hidden flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black italic uppercase">Paramètres</h2>
                            <button onClick={() => setShowMobileFilters(false)} className="p-2 text-brand-neon bg-black"><XMarkIcon className="w-6 h-6"/></button>
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
                        {/* Tactical Toolbar */}
                        <div className="sticky top-20 z-30 bg-white/90 dark:bg-brand-black/90 backdrop-blur-md border border-gray-100 dark:border-gray-800 p-4 mb-8 flex flex-col md:flex-row justify-between items-center gap-4 transition-all duration-300 shadow-xl">
                            
                            <button 
                                onClick={() => setShowMobileFilters(true)}
                                className="lg:hidden w-full md:w-auto flex justify-center items-center gap-3 px-6 py-3 bg-black text-brand-neon font-black text-xs uppercase slant"
                            >
                                <span className="slant-reverse flex items-center gap-2"><AdjustmentsHorizontalIcon className="w-4 h-4"/> Filtres</span>
                            </button>

                            <div className="hidden lg:flex items-center gap-4">
                                <div className="w-2 h-2 bg-brand-neon rounded-full animate-pulse shadow-[0_0_8px_#ccff00]"></div>
                                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold">
                                    <strong className="text-gray-900 dark:text-white">{displayedProducts.length}</strong> UNITÉS DÉTECTÉES
                                </span>
                            </div>

                            <div className="flex items-center gap-6 w-full md:w-auto justify-between">
                                <div className="relative group flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden sm:block">Trier :</span>
                                    <select 
                                        value={sortOrder} 
                                        onChange={(e) => setSortOrder(e.target.value)} 
                                        className="bg-transparent border-b border-gray-200 dark:border-gray-800 py-1 text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest focus:outline-none focus:border-brand-neon cursor-pointer"
                                    >
                                        <option value="price-asc">Prix Croissant</option>
                                        <option value="price-desc">Prix Décroissant</option>
                                        <option value="name-asc">Nom (A-Z)</option>
                                    </select>
                                </div>

                                <div className="flex items-center bg-gray-50 dark:bg-brand-gray p-1 slant">
                                     <button onClick={() => setViewMode('grid-3')} className={`p-2 transition-all slant-reverse ${viewMode === 'grid-3' ? 'text-brand-neon bg-black shadow-lg' : 'text-gray-400'}`}>
                                        <Squares2X2Icon className="w-4 h-4"/>
                                     </button>
                                     <button onClick={() => setViewMode('list')} className={`p-2 transition-all slant-reverse ${viewMode === 'list' ? 'text-brand-neon bg-black shadow-lg' : 'text-gray-400'}`}>
                                        <Bars3Icon className="w-4 h-4"/>
                                     </button>
                                </div>
                            </div>
                        </div>
                        
                        {/* Products Grid */}
                        {isLoading ? (
                            <ProductListSkeleton count={9} />
                        ) : (
                            displayedProducts.length > 0 ? (
                                <div className={viewMode === 'list' ? 'space-y-8' : `grid ${gridClasses} gap-6 lg:gap-8`}>
                                    {displayedProducts.map((product, index) => (
                                        <div 
                                            key={product.id} 
                                            className="animate-fadeIn"
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
                                <div className="flex flex-col items-center justify-center py-40 bg-gray-50/50 dark:bg-[#0a0a0a] border-2 border-dashed border-gray-200 dark:border-gray-800">
                                    <div className="w-20 h-20 bg-gray-100 dark:bg-black flex items-center justify-center mb-6 text-gray-300 dark:text-gray-700">
                                        <XMarkIcon className="w-12 h-12" />
                                    </div>
                                    <p className="text-xl font-serif font-black italic uppercase text-gray-900 dark:text-white mb-4">Alerte : Signal perdu</p>
                                    <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mb-10">Aucune ressource ne correspond à vos filtres.</p>
                                    <button 
                                        onClick={() => { setFilters({ price: { min: 0, max: 3000 }, brands: [], materials: [] }); setIsPromoFilterActive(false); }}
                                        className="px-10 py-4 bg-black dark:bg-white text-white dark:text-black font-black uppercase text-xs tracking-widest slant"
                                    >
                                        <span className="slant-reverse block">Réinitialiser les systèmes</span>
                                    </button>
                                </div>
                            )
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};
