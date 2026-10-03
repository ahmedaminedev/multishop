import React, { useState, useEffect, useMemo } from 'react';
import type { Product, Category } from '../types';
import { Breadcrumb } from './Breadcrumb';
import { FiltersSidebar } from './FiltersSidebar';
import { ProductCard } from './ProductCard';
import { ProductListItem } from './ProductListItem';
import { Squares2X2Icon, Bars3Icon, AdjustmentsHorizontalIcon, XMarkIcon } from './IconComponents';
import { ProductListSkeleton } from './Skeletons';
import { ArrowRight, Tag, SlidersHorizontal, Check, Table, Dumbbell, ShieldCheck } from 'lucide-react';

interface ProductListPageProps {
    categoryName: string;
    onNavigateHome: () => void;
    onNavigateToCategory: (categoryName: string) => void;
    onPreview: (product: Product) => void;
    onNavigateToPacks?: () => void;
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
    products: allProducts,
    onNavigateToProductDetail,
    categories,
    activeFilters
}) => {
    const [initialProducts, setInitialProducts] = useState<Product[]>([]);
    const [sortOrder, setSortOrder] = useState('price-asc');
    const [viewMode, setViewMode] = useState<'grid-3' | 'grid-4' | 'list' | 'table'>('grid-4');
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
        if (category.toLowerCase() === 'marques' || category.toLowerCase() === 'brands') return allProducts;
        const mainCat = allCategories.find(c => c.name.toLowerCase() === category.toLowerCase());
        let validCategories = [category];
        
        if (mainCat) {
            if (mainCat.subCategories) validCategories = [...validCategories, ...mainCat.subCategories];
            if (mainCat.megaMenu) mainCat.megaMenu.forEach(group => group.items.forEach(item => validCategories.push(item.name)));
            return allProducts.filter(p => p.parentCategory === category || validCategories.includes(p.category));
        } else {
            const catLower = category.toLowerCase();
            return allProducts.filter(p => {
                const prodCat = (p.category || '').toLowerCase();
                const prodName = (p.name || '').toLowerCase();
                if (prodCat === catLower || prodCat.includes(catLower)) return true;
                if (catLower.includes('musculation') && (prodCat.includes('halt') || prodCat.includes('banc') || prodCat.includes('rack') || prodCat.includes('poids') || prodCat.includes('station'))) return true;
                if (catLower.includes('cardio') && (prodCat.includes('tapis') || prodCat.includes('velo') || prodName.includes('cardio') || prodName.includes('tapis'))) return true;
                if (catLower.includes('cross') && (prodCat.includes('cross') || prodCat.includes('kettlebell') || prodCat.includes('disque') || prodName.includes('cross'))) return true;
                if (catLower.includes('yoga') && (prodCat.includes('yoga') || prodCat.includes('fitness') || prodName.includes('yoga') || prodName.includes('tapis de sol'))) return true;
                if (catLower.includes('accessoires') && (prodCat.includes('accessoire') || prodCat.includes('ceinture') || prodCat.includes('shaker') || prodCat.includes('gant'))) return true;
                return false;
            });
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
        const titleName = categoryName === 'product-list' ? 'Catalogue Matériel' : categoryName;
        document.title = `${titleName || 'Arsenal'} - Fitness Shop`;
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
        }, 250); 
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

    // Matching image selection based on category
    const categoryBannerBg = useMemo(() => {
        const cat = (categoryName || '').toLowerCase();
        if (cat.includes('cardio') || cat.includes('tapis')) return '/src/assets/images/category_tapis_cardio_1790951629862.jpg';
        if (cat.includes('rack') || cat.includes('station')) return '/src/assets/images/category_rack_station_1790951619589.jpg';
        if (cat.includes('banc')) return '/src/assets/images/category_banc_musculation_1790951610418.jpg';
        if (cat.includes('halt') || cat.includes('poids')) return '/src/assets/images/category_halteres_poids_1790951598408.jpg';
        if (cat.includes('cross') || cat.includes('disque')) return '/src/assets/images/banner_bumper_plates_promo_1790951639841.jpg';
        return '/src/assets/images/hero_fitness_athlete_1790951585544.jpg';
    }, [categoryName]);

    // Navbar Category quick tabs for 1-click switching
    const quickCategories = [
        { label: 'Tous les produits', target: 'product-list' },
        { label: 'Musculation', target: 'Musculation' },
        { label: 'Cardio', target: 'Cardio' },
        { label: 'Cross Training', target: 'Cross Training' },
        { label: 'Fitness & Yoga', target: 'Fitness & Yoga' },
        { label: 'Accessoires', target: 'Accessoires' },
        { label: 'Marques', target: 'Marques' },
        { label: 'Haltères & Poids', target: 'Haltères & Poids' },
        { label: 'Bancs de Musculation', target: 'Bancs de Musculation' },
        { label: 'Racks & Stations', target: 'Racks & Stations' },
    ];

    const isBrandView = (categoryName || '').toLowerCase() === 'marques' || (categoryName || '').toLowerCase() === 'brands';

    const currentDisplayTitle = isBrandView
        ? 'Nos Marques & Équipements Pro'
        : (categoryName === 'product-list' || !categoryName ? 'Catalogue & Équipements Pro' : categoryName);

    const availableBrands = useMemo(() => {
        return Array.from(new Set(allProducts.map(p => p.brand).filter(Boolean)));
    }, [allProducts]);

    return (
        <div className="bg-[#f8fafc] dark:bg-slate-950 min-h-screen relative text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
            
            {/* --- HERO BANNER MATCHING HOMEPAGE AESTHETIC --- */}
            <div className="relative w-full bg-[#0a0d14] text-white overflow-hidden border-b border-white/10">
                <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${categoryBannerBg}')` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0a0d14] via-[#0a0d14]/90 to-[#0a0d14]/70"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 z-10">
                    <div className="max-w-3xl space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="w-5 h-1 bg-[#84cc16] rounded-full inline-block"></span>
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#84cc16]">
                                Fitness Shop Equipment
                            </span>
                            <span className="text-white/40">·</span>
                            <span className="text-[11px] font-bold text-slate-400">
                                {displayedProducts.length} articles disponibles
                            </span>
                        </div>

                        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-none">
                            {currentDisplayTitle}
                        </h1>

                        <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-medium leading-relaxed pt-1">
                            Sélection de matériel professionnel certifié pour clubs et particuliers : durabilité, sécurité et performances maximales.
                        </p>
                    </div>

                    {/* Quick Category Switcher Tabs */}
                    <div className="mt-8 pt-6 border-t border-white/10 overflow-x-auto scrollbar-none flex items-center gap-2">
                        {quickCategories.map((cat) => {
                            const isSelected = categoryName === cat.target || (categoryName === 'product-list' && cat.target === 'product-list');
                            return (
                                <button
                                    key={cat.target}
                                    type="button"
                                    onClick={() => onNavigateToCategory(cat.target)}
                                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                                        isSelected
                                            ? 'bg-[#84cc16] text-black shadow-md shadow-[#84cc16]/20'
                                            : 'bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white'
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Brand Quick Selector if on Marques or when brands exist */}
                    {isBrandView && availableBrands.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#84cc16] block mb-2">
                                Filtrer par Fabricant / Marque :
                            </span>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFilters(prev => ({ ...prev, brands: [] }))}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                        filters.brands.length === 0
                                            ? 'bg-white text-black font-black'
                                            : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}
                                >
                                    Toutes les marques ({availableBrands.length})
                                </button>
                                {availableBrands.map((brandName) => {
                                    const isBrandSelected = filters.brands.includes(brandName);
                                    return (
                                        <button
                                            key={brandName}
                                            type="button"
                                            onClick={() => {
                                                setFilters(prev => ({
                                                    ...prev,
                                                    brands: isBrandSelected
                                                        ? prev.brands.filter(b => b !== brandName)
                                                        : [brandName]
                                                }));
                                            }}
                                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                                isBrandSelected
                                                    ? 'bg-[#84cc16] text-black font-black shadow-xs'
                                                    : 'bg-white/10 text-slate-200 hover:bg-white/20 hover:text-white'
                                            }`}
                                        >
                                            <span>{brandName}</span>
                                            {isBrandSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- BREADCRUMBS & TOOLBAR --- */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                <Breadcrumb 
                    items={[
                        { name: 'Accueil', onClick: onNavigateHome }, 
                        { name: 'Fitness Shop', onClick: () => onNavigateToCategory('product-list') },
                        { name: currentDisplayTitle }
                    ]} 
                />
            </div>

            {/* --- MAIN CONTENT & FILTERS --- */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    
                    {/* Mobile Filters Drawer */}
                    {showMobileFilters && (
                        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex lg:hidden">
                            <div className="w-full max-w-xs bg-white dark:bg-slate-900 h-full p-6 overflow-y-auto ml-auto flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                                        <h2 className="text-base font-black uppercase text-slate-900 dark:text-white">Filtres</h2>
                                        <button 
                                            onClick={() => setShowMobileFilters(false)}
                                            className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                                        >
                                            <XMarkIcon className="w-5 h-5"/>
                                        </button>
                                    </div>
                                    <FiltersSidebar 
                                        products={initialProducts} 
                                        filters={filters}
                                        onFilterChange={setFilters}
                                        maxPrice={maxPrice}
                                    />
                                </div>
                                <button
                                    onClick={() => setShowMobileFilters(false)}
                                    className="w-full mt-6 py-3 bg-[#84cc16] text-black font-extrabold text-xs uppercase rounded-xl"
                                >
                                    Afficher ({displayedProducts.length}) résultats
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Desktop Sidebar Filters */}
                    <div className="hidden lg:block w-72 shrink-0">
                        <FiltersSidebar 
                            products={initialProducts} 
                            filters={filters}
                            onFilterChange={setFilters}
                            maxPrice={maxPrice}
                        />
                    </div>

                    {/* Product Listing Main View */}
                    <main className="flex-1 min-w-0 w-full">
                        {/* Control Toolbar */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-2xs">
                            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                                <button 
                                    onClick={() => setShowMobileFilters(true)}
                                    className="lg:hidden flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs font-bold"
                                >
                                    <AdjustmentsHorizontalIcon className="w-4 h-4 text-[#84cc16]"/>
                                    <span>Filtres</span>
                                </button>

                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#84cc16] animate-pulse"></span>
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                        <strong className="text-slate-900 dark:text-white font-black">{displayedProducts.length}</strong> produits trouvés
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                                {/* Sort Dropdown */}
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-slate-400 hidden md:inline">Trier par :</span>
                                    <select 
                                        value={sortOrder} 
                                        onChange={(e) => setSortOrder(e.target.value)} 
                                        className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-1.5 px-3 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#84cc16] cursor-pointer"
                                    >
                                        <option value="price-asc">Prix Croissant</option>
                                        <option value="price-desc">Prix Décroissant</option>
                                        <option value="name-asc">Nom (A-Z)</option>
                                    </select>
                                </div>

                                {/* View Switcher */}
                                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-0.5">
                                    <button 
                                        onClick={() => setViewMode('grid-4')} 
                                        className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid-4' ? 'bg-white dark:bg-slate-900 text-[#84cc16] shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
                                        title="Vue Grille"
                                    >
                                        <Squares2X2Icon className="w-4 h-4"/>
                                    </button>
                                    <button 
                                        onClick={() => setViewMode('list')} 
                                        className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-slate-900 text-[#84cc16] shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
                                        title="Vue Liste"
                                    >
                                        <Bars3Icon className="w-4 h-4"/>
                                    </button>
                                    <button 
                                        onClick={() => setViewMode('table')} 
                                        className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 ${viewMode === 'table' ? 'bg-white dark:bg-slate-900 text-[#84cc16] shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
                                        title="Vue Tableau Comparatif Pro"
                                    >
                                        <Table className="w-4 h-4"/>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Product Cards Grid or Technical Table */}
                        {isLoading ? (
                            <ProductListSkeleton count={8} />
                        ) : displayedProducts.length > 0 ? (
                            viewMode === 'table' ? (
                                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead>
                                                <tr className="bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                                                    <th className="py-3.5 px-4">Équipement</th>
                                                    <th className="py-3.5 px-4">Catégorie</th>
                                                    <th className="py-3.5 px-4">Capacité / Poids</th>
                                                    <th className="py-3.5 px-4">Châssis & Matière</th>
                                                    <th className="py-3.5 px-4">Garantie</th>
                                                    <th className="py-3.5 px-4 text-right">Prix (DT)</th>
                                                    <th className="py-3.5 px-4 text-center">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                                                {displayedProducts.map((p) => (
                                                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center gap-3">
                                                                <img 
                                                                    src={p.imageUrl} 
                                                                    alt={p.name} 
                                                                    className="w-12 h-12 object-cover rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100" 
                                                                />
                                                                <div>
                                                                    <span className="font-bold text-slate-900 dark:text-white block hover:text-[#84cc16] cursor-pointer" onClick={() => onNavigateToProductDetail(p.id)}>
                                                                        {p.name}
                                                                    </span>
                                                                    <span className="text-[10px] text-slate-400 font-bold uppercase">{p.brand}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                                                            {p.category}
                                                        </td>
                                                        <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                                                            {p.chargeMaxKg ? `${p.chargeMaxKg} KG Max` : p.poidsKg ? `${p.poidsKg} KG` : 'Standard Pro'}
                                                        </td>
                                                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                                                            {p.matiere || 'Acier Carbone & Fonte'}
                                                        </td>
                                                        <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                                                            {p.garantieMois ? `${p.garantieMois} Mois` : '24 Mois'}
                                                        </td>
                                                        <td className="py-3 px-4 text-right font-mono font-black text-slate-900 dark:text-white text-sm">
                                                            {p.price.toFixed(3)}
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => onNavigateToProductDetail(p.id)}
                                                                className="px-3 py-1.5 bg-[#84cc16] hover:bg-[#72b012] text-black font-black uppercase text-[10px] rounded-lg tracking-wider transition-colors cursor-pointer"
                                                            >
                                                                Détails
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className={
                                    viewMode === 'list'
                                        ? 'space-y-4'
                                        : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5'
                                }>
                                    {displayedProducts.map((product) => (
                                        <div key={product.id}>
                                            {viewMode === 'list' ? (
                                                <ProductListItem 
                                                    product={product} 
                                                    onPreview={onPreview} 
                                                    onNavigateToProductDetail={onNavigateToProductDetail}
                                                />
                                            ) : (
                                                <ProductCard 
                                                    product={product} 
                                                    onPreview={onPreview} 
                                                    onNavigateToProductDetail={onNavigateToProductDetail} 
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center">
                                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-400">
                                    <Tag className="w-8 h-8 text-[#84cc16]" />
                                </div>
                                <h3 className="text-lg font-black uppercase text-slate-900 dark:text-white mb-2">
                                    Aucun article ne correspond aux filtres
                                </h3>
                                <p className="text-xs text-slate-500 max-w-sm mb-6">
                                    Modifiez vos critères de prix ou réinitialisez les filtres pour découvrir notre matériel fitness.
                                </p>
                                <button 
                                    onClick={() => {
                                        setFilters({ price: { min: 0, max: 3000 }, brands: [], materials: [] });
                                        setIsPromoFilterActive(false);
                                    }}
                                    className="px-6 py-2.5 bg-[#84cc16] hover:bg-[#72b012] text-black font-extrabold text-xs uppercase rounded-xl transition-colors cursor-pointer"
                                >
                                    Réinitialiser tous les filtres
                                </button>
                            </div>
                        )}
                    </main>

                </div>
            </div>
        </div>
    );
};
