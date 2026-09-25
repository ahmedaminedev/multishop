
import React, { useState, useEffect, useMemo } from 'react';
import type { Product, Category } from '../types';
import { Breadcrumb } from './Breadcrumb';
import { FiltersSidebar } from './FiltersSidebar';
import { ProductCard } from './ProductCard';
import { ProductListItem } from './ProductListItem';
import { Squares2X2Icon, Bars3Icon, ShoppingBagIcon, AdjustmentsHorizontalIcon, XMarkIcon } from './IconComponents';
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
        document.title = `${categoryName || 'Boutique'} - PharmaNature`;
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
            case 'grid-3': return 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4';
            case 'list': return 'grid-cols-1';
            default: return 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4';
        }
    }, [viewMode]);

    const bannerTitle = categoryName === 'product-list' ? 'CATALOGUE GÉNÉRAL' : categoryName.toUpperCase();

    return (
        <div className="bg-white dark:bg-brand-dark min-h-screen relative font-sans transition-colors duration-300">
            
            <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-10">
                
                <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <Breadcrumb items={[{ name: 'Accueil', onClick: onNavigateHome }, { name: categoryName || 'Boutique' }]} />
                        <h1 className="text-4xl md:text-6xl font-serif font-black text-slate-900 dark:text-white mt-6 tracking-tighter">
                            {bannerTitle}
                        </h1>
                        <p className="text-slate-400 font-medium text-lg mt-2">{displayedProducts.length} références trouvées</p>
                    </div>

                    <div className="hidden lg:flex items-center gap-4 bg-slate-50 dark:bg-white/5 p-2 rounded-2xl">
                         <button onClick={() => setViewMode('grid-3')} className={`p-3 rounded-xl transition-all ${viewMode === 'grid-3' ? 'bg-white dark:bg-gray-800 text-brand-primary shadow-md' : 'text-slate-400'}`}>
                            <Squares2X2Icon className="w-5 h-5"/>
                         </button>
                         <button onClick={() => setViewMode('list')} className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-800 text-brand-primary shadow-md' : 'text-slate-400'}`}>
                            <Bars3Icon className="w-5 h-5"/>
                         </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    
                    {/* --- SIDEBAR FILTERS --- */}
                    <div className={`
                        fixed inset-0 z-[70] bg-white dark:bg-brand-dark p-8 overflow-y-auto transition-transform duration-300 lg:translate-x-0 lg:static lg:bg-transparent lg:p-0 lg:overflow-visible lg:w-[300px] lg:block
                        ${showMobileFilters ? 'translate-x-0' : '-translate-x-full'}
                    `}>
                        <div className="lg:hidden flex justify-between items-center mb-10">
                            <h2 className="text-2xl font-serif font-bold">Filtres</h2>
                            <button onClick={() => setShowMobileFilters(false)} className="p-3 bg-slate-100 rounded-2xl text-slate-900"><XMarkIcon className="w-6 h-6"/></button>
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
                        {/* Mobile Toolbar */}
                        <div className="lg:hidden mb-8 sticky top-24 z-30">
                            <button 
                                onClick={() => setShowMobileFilters(true)}
                                className="w-full flex justify-center items-center gap-3 px-6 py-4 bg-brand-primary text-white font-bold text-xs uppercase rounded-2xl shadow-xl"
                            >
                                <AdjustmentsHorizontalIcon className="w-5 h-5"/> 
                                Filtrer les produits
                            </button>
                        </div>

                        <div className="flex justify-end mb-8">
                            <div className="relative inline-block border-b-2 border-slate-100 dark:border-white/5 pb-2">
                                <select 
                                    value={sortOrder} 
                                    onChange={(e) => setSortOrder(e.target.value)} 
                                    className="bg-transparent border-none py-1 text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest focus:ring-0 cursor-pointer"
                                >
                                    <option value="price-asc">Prix Croissant</option>
                                    <option value="price-desc">Prix Décroissant</option>
                                    <option value="name-asc">Nom A-Z</option>
                                </select>
                            </div>
                        </div>
                        
                        {/* Products Grid */}
                        {isLoading ? (
                            <ProductListSkeleton count={12} />
                        ) : (
                            displayedProducts.length > 0 ? (
                                <div className={viewMode === 'list' ? 'space-y-6' : `grid ${gridClasses} gap-6 md:gap-8`}>
                                    {displayedProducts.map((product) => (
                                        <div key={product.id} className="animate-fadeIn">
                                            {viewMode === 'list' ? (
                                                <ProductListItem product={product} onPreview={onPreview} onNavigateToProductDetail={onNavigateToProductDetail}/>
                                            ) : (
                                                <ProductCard product={product} onPreview={onPreview} onNavigateToProductDetail={onNavigateToProductDetail} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-40 bg-slate-50 dark:bg-white/5 rounded-[4rem] border border-dashed border-slate-200">
                                    <ShoppingBagIcon className="w-16 h-16 text-slate-200 mb-6" />
                                    <p className="text-xl font-bold text-slate-900 dark:text-white mb-2">Aucun produit trouvé</p>
                                    <button 
                                        onClick={() => { setFilters({ price: { min: 0, max: 3000 }, brands: [], materials: [] }); setIsPromoFilterActive(false); }}
                                        className="text-brand-primary font-bold hover:underline"
                                    >
                                        Réinitialiser les filtres
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
