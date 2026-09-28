import React, { useState, useEffect, useMemo } from 'react';
import type { Product, Category } from '../types';
import { Breadcrumb } from './Breadcrumb';
import { FiltersSidebar } from './FiltersSidebar';
import { ProductCard } from './ProductCard';
import { ProductListItem } from './ProductListItem';
import { Squares2X2Icon, Bars3Icon, ChevronDownIcon } from './IconComponents';
import { VerticalNav } from './VerticalNav';
import { ProductListSkeleton } from './Skeletons';

interface ProductListPageProps {
    categoryName: string;
    onNavigateHome: () => void;
    onNavigateToCategory: (categoryName: string) => void;
    isNavCollapsed: boolean;
    onToggleNav: () => void;
    onPreview: (product: Product) => void;
    onNavigateToPacks: () => void;
    products: Product[];
    onNavigateToProductDetail: (productId: number) => void;
    categories: Category[];
}

export const ProductListPage: React.FC<ProductListPageProps> = ({ 
    categoryName, 
    onNavigateHome,
    onNavigateToCategory,
    isNavCollapsed,
    onToggleNav,
    onPreview,
    onNavigateToPacks,
    products: allProducts,
    onNavigateToProductDetail,
    categories
}) => {
    const [initialProducts, setInitialProducts] = useState<Product[]>([]);
    const [sortOrder, setSortOrder] = useState('price-asc');
    const [viewMode, setViewMode] = useState('grid-3');
    const [isLoading, setIsLoading] = useState(true); // Loading state
    const [filters, setFilters] = useState({
        price: { min: 0, max: 3000 },
        brands: [] as string[],
        materials: [] as string[],
    });

    const maxPrice = useMemo(() => 
        Math.ceil(initialProducts.reduce((max, p) => p.price > max ? p.price : max, 0)) || 3000,
    [initialProducts]);

     const getProductsByCategory = (category: string, allProducts: Product[]) => {
        const categoryProducts = allProducts.filter(p => p.category === category || (category === 'Lave-linge frontal' && p.name.toLowerCase().includes('lave')));
        if (categoryProducts.length > 0) return categoryProducts;
        if(category.toLowerCase().includes('raclette')) return allProducts.filter(p => p.category === 'Appareil à raclette');
        return []; 
    };

    useEffect(() => {
        document.title = `${categoryName} - Electro Shop`;
        setIsLoading(true);
        
        // Simulate API delay
        const timer = setTimeout(() => {
            const products = getProductsByCategory(categoryName, allProducts);
            setInitialProducts(products);

            // Reset filters
            const newMaxPrice = Math.ceil(products.reduce((max, p) => p.price > max ? p.price : max, 0)) || 3000;
            setFilters({
                price: { min: 0, max: newMaxPrice },
                brands: [],
                materials: [],
            });
            setIsLoading(false);
        }, 800); // 800ms delay

        return () => clearTimeout(timer);
    }, [categoryName, allProducts]);

    const displayedProducts = useMemo(() => {
        let filtered = [...initialProducts]
            .filter(p => p.price >= filters.price.min && p.price <= filters.price.max);
        
        if (filters.brands.length > 0) {
            filtered = filtered.filter(p => filters.brands.includes(p.brand));
        }

        if (filters.materials.length > 0) {
            filtered = filtered.filter(p => p.material && filters.materials.includes(p.material));
        }
        
        filtered.sort((a, b) => {
            switch (sortOrder) {
                case 'price-asc':
                    return a.price - b.price;
                case 'price-desc':
                    return b.price - a.price;
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                default:
                    return 0;
            }
        });
        
        return filtered;
    }, [initialProducts, filters, sortOrder]);


    const gridClasses = useMemo(() => {
        switch (viewMode) {
            case 'grid-3': return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
            case 'list': return 'grid-cols-1';
            default: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
        }
    }, [viewMode]);

    return (
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
             <div className="flex flex-col lg:flex-row gap-8">
                <aside className={`relative z-20 shrink-0 transition-all duration-300 ${isNavCollapsed ? 'lg:w-20' : 'lg:w-1/4 xl:w-1/5'}`}>
                    <VerticalNav
                        categories={categories}
                        isCollapsed={isNavCollapsed}
                        onToggleCollapse={onToggleNav}
                        onCategoryClick={onNavigateToCategory}
                        onNavigateToPacks={onNavigateToPacks}
                    />
                </aside>
                <div className="flex-1 min-w-0">
                    <Breadcrumb items={[{ name: 'Accueil', onClick: onNavigateHome }, { name: categoryName }]} />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 my-6">{categoryName}</h1>
                    <div className="flex flex-col lg:flex-row gap-8">
                        <FiltersSidebar 
                            products={initialProducts} 
                            filters={filters}
                            onFilterChange={setFilters}
                            maxPrice={maxPrice}
                        />

                        <main className="flex-1">
                            <div className="flex justify-between items-center mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-2">
                                     <button onClick={() => setViewMode('grid-3')} className={`p-2 rounded ${viewMode === 'grid-3' ? 'bg-red-100 text-red-600' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`} aria-label="Grid 3 columns"><Squares2X2Icon className="w-5 h-5"/></button>
                                     <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-red-100 text-red-600' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`} aria-label="List view"><Bars3Icon className="w-5 h-5"/></button>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <select 
                                            value={sortOrder} 
                                            onChange={(e) => setSortOrder(e.target.value)} 
                                            className="appearance-none rounded-md border border-gray-300 dark:border-gray-600 py-2 pl-3 pr-10 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                        >
                                            <option value="price-asc">Trier par: Prix: faible à élevé</option>
                                            <option value="price-desc">Trier par: Prix: élevé à faible</option>
                                            <option value="name-asc">Trier par: Nom</option>
                                        </select>
                                        <ChevronDownIcon className="w-5 h-5 text-gray-400 absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                     <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">Affichage des {displayedProducts.length} articles</span>
                                </div>
                            </div>
                            
                            {isLoading ? (
                                <ProductListSkeleton count={9} />
                            ) : (
                                displayedProducts.length > 0 ? (
                                    viewMode === 'list' ? (
                                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                                            {displayedProducts.map(product => (
                                                <ProductListItem key={product.id} product={product} onPreview={onPreview} onNavigateToProductDetail={onNavigateToProductDetail}/>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className={`grid ${gridClasses} gap-6`}>
                                            {displayedProducts.map(product => (
                                                <ProductCard key={product.id} product={product} onPreview={onPreview} onNavigateToProductDetail={onNavigateToProductDetail} />
                                            ))}
                                        </div>
                                    )
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-lg text-gray-600 dark:text-gray-400">Aucun produit ne correspond à votre sélection.</p>
                                        <p className="text-sm text-gray-500 mt-2">Essayez de modifier ou de réinitialiser vos filtres.</p>
                                    </div>
                                )
                            )}
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
};