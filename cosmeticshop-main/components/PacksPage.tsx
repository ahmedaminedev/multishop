
import React, { useState, useEffect, useMemo } from 'react';
import type { Pack, Product, Category } from '../types';
import { Breadcrumb } from './Breadcrumb';
import { ShoppingBagIcon, Squares2X2Icon, Bars3Icon, ChevronDownIcon, SparklesIcon, AdjustmentsHorizontalIcon, XMarkIcon } from './IconComponents';
import { FiltersSidebar } from './FiltersSidebar';
import { useCart } from './CartContext';

interface PacksPageProps {
    onNavigateHome: () => void;
    onNavigateToCategory: (categoryName: string) => void;
    packs: Pack[];
    allProducts: Product[];
    allPacks: Pack[];
    onNavigateToPacks: () => void;
    onNavigateToPackDetail: (packId: number) => void;
    categories: Category[];
}

const isPackAvailable = (pack: Pack, allProducts: Product[], allPacks: Pack[]): boolean => {
    for (const productId of pack.includedProductIds) {
        const product = allProducts.find(p => p.id === productId);
        if (!product || product.quantity === 0) return false;
    }
    return true;
};

const PackCard: React.FC<{ pack: Pack; allProducts: Product[]; allPacks: Pack[]; onNavigateToPackDetail: (packId: number) => void; }> = ({ pack, allProducts, allPacks, onNavigateToPackDetail }) => {
    const { addToCart, openCart } = useCart();
    const savings = pack.oldPrice - pack.price;
    const isAvailable = useMemo(() => isPackAvailable(pack, allProducts, allPacks), [pack, allProducts, allPacks]);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isAvailable) return;
        addToCart(pack);
        openCart();
    };
    
    return (
        <div 
            onClick={() => onNavigateToPackDetail(pack.id)}
            className="group bg-white dark:bg-gray-800 rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all duration-500 overflow-hidden border border-transparent hover:border-rose-100 dark:hover:border-gray-700 h-full flex flex-col cursor-pointer transform hover:-translate-y-2"
        >
            <div className="relative h-72 overflow-hidden">
                <img 
                    src={pack.imageUrl} 
                    alt={pack.name} 
                    className={`w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110 ${!isAvailable ? 'grayscale opacity-80' : ''}`}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80"></div>
                
                <div className="absolute bottom-0 left-0 p-6 w-full">
                    <h3 className="text-2xl font-serif font-bold text-white leading-tight drop-shadow-md group-hover:text-rose-200 transition-colors">{pack.name}</h3>
                    <p className="text-white/80 text-sm mt-2 line-clamp-2 font-light">{pack.description}</p>
                </div>

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className="bg-white/90 backdrop-blur text-rose-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                        Coffret
                    </span>
                    {!isAvailable && (
                        <span className="bg-gray-900/90 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                            Rupture
                        </span>
                    )}
                </div>
                
                {/* Savings Badge */}
                <div className="absolute top-4 right-4 bg-rose-500 text-white w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-lg border-2 border-white/20">
                    <span className="text-xs font-bold">SAVE</span>
                    <span className="text-sm font-bold">{Math.round((savings / pack.oldPrice) * 100)}%</span>
                </div>
            </div>

            <div className="p-6 flex flex-col flex-grow bg-white dark:bg-gray-800">
                <div className="mb-6 space-y-3">
                    <div className="flex flex-wrap gap-2">
                        {pack.includedItems.slice(0, 3).map((item, idx) => (
                            <span key={idx} className="text-[10px] uppercase font-bold tracking-wider text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                {item}
                            </span>
                        ))}
                        {pack.includedItems.length > 3 && <span className="text-xs text-gray-400">+{pack.includedItems.length - 3}</span>}
                    </div>
                </div>

                <div className="mt-auto pt-6 border-t border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div>
                        <span className="block text-sm text-gray-400 line-through mb-0.5">{pack.oldPrice.toFixed(0)} DT</span>
                        <span className="block text-2xl font-serif font-bold text-gray-900 dark:text-white">{pack.price.toFixed(0)} <span className="text-base font-sans font-light text-gray-500">DT</span></span>
                    </div>

                    <button 
                        onClick={handleAddToCart}
                        disabled={!isAvailable}
                        className="w-12 h-12 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center hover:scale-110 hover:bg-rose-600 dark:hover:bg-rose-500 dark:hover:text-white transition-all shadow-lg disabled:bg-gray-300 disabled:scale-100 disabled:cursor-not-allowed"
                    >
                        <ShoppingBagIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const PackListItem: React.FC<{ pack: Pack; allProducts: Product[]; allPacks: Pack[]; onNavigateToPackDetail: (packId: number) => void; }> = ({ pack, allProducts, allPacks, onNavigateToPackDetail }) => {
    const { addToCart, openCart } = useCart();
    const isAvailable = useMemo(() => isPackAvailable(pack, allProducts, allPacks), [pack, allProducts, allPacks]);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isAvailable) return;
        addToCart(pack);
        openCart();
    };

    return (
        <div onClick={() => onNavigateToPackDetail(pack.id)} className="group bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 cursor-pointer flex flex-col md:flex-row items-center gap-6 overflow-hidden">
            <div className="relative w-full md:w-64 h-64 md:h-48 flex-shrink-0 overflow-hidden rounded-2xl">
                <img
                    src={pack.imageUrl}
                    alt={pack.name}
                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${!isAvailable ? 'grayscale opacity-70' : ''}`}
                />
            </div>

            <div className="flex-grow text-center md:text-left">
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-2 block">Coffret Exclusif</span>
                <h3 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-3 group-hover:text-rose-600 transition-colors">{pack.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 max-w-xl">{pack.description}</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {pack.includedItems.map((item, index) => (
                         <span key={index} className="text-xs bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full border border-gray-100 dark:border-gray-600">
                            {item}
                        </span>
                    ))}
                </div>
            </div>

            <div className="flex-shrink-0 w-full md:w-auto flex flex-col items-center md:items-end gap-4 p-4 md:border-l border-gray-100 dark:border-gray-700">
                <div className="text-right">
                    <p className="text-sm text-gray-400 line-through">{pack.oldPrice.toFixed(0)} DT</p>
                    <p className="text-3xl font-serif font-bold text-gray-900 dark:text-white">{pack.price.toFixed(0)} DT</p>
                </div>
                <button 
                    onClick={handleAddToCart}
                    disabled={!isAvailable}
                    className="w-full md:w-auto px-8 py-3 bg-black dark:bg-white text-white dark:text-black font-bold uppercase text-xs rounded-full hover:bg-rose-600 dark:hover:bg-rose-500 dark:hover:text-white transition-all shadow-lg flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    <ShoppingBagIcon className="w-4 h-4" />
                    <span>{isAvailable ? 'Ajouter' : 'Indisponible'}</span>
                </button>
            </div>
        </div>
    );
};

export const PacksPage: React.FC<PacksPageProps> = ({ onNavigateHome, onNavigateToCategory, packs, allProducts, allPacks, onNavigateToPacks, onNavigateToPackDetail, categories }) => {
    const [sortOrder, setSortOrder] = useState('price-asc');
    const [viewMode, setViewMode] = useState('grid');
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [filters, setFilters] = useState({
        price: { min: 0, max: 5000 },
        brands: [] as string[],
        materials: [] as string[],
    });

    // Mock products in packs for filter consistency (as FiltersSidebar expects products)
    // In a real scenario, you'd extract unique brands/prices from packs metadata directly
    const productsInPacks = useMemo(() => {
        // Simplified: We just pass a dummy list that represents pack prices/brands for the filter logic
        return packs.map(p => ({
            id: p.id,
            price: p.price,
            brand: "Coffret", // Default brand for packs or extract from content
            material: ""
        }));
    }, [packs]);

    const maxPrice = useMemo(() => Math.ceil(packs.reduce((max, p) => p.price > max ? p.price : max, 0)) || 5000, [packs]);

    useEffect(() => {
        document.title = `Nos Coffrets - Cosmetics Shop`;
        setFilters(prev => ({ ...prev, price: { ...prev.price, max: maxPrice } }));
    }, [packs]);
    
    const displayedPacks = useMemo(() => {
        let filtered = [...packs].filter(p => p.price >= filters.price.min && p.price <= filters.price.max);
        
        filtered.sort((a, b) => {
            switch (sortOrder) {
                case 'price-asc': return a.price - b.price;
                case 'price-desc': return b.price - a.price;
                case 'name-asc': return a.name.localeCompare(b.name);
                default: return 0;
            }
        });
        
        return filtered;
    }, [packs, filters, sortOrder]);
    
    const gridClasses = viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1';

    return (
        <div className="bg-[#FAFAFA] dark:bg-gray-950 min-h-screen relative overflow-hidden font-sans">
             {/* Abstract BG */}
             <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-purple-100/20 dark:bg-purple-900/10 rounded-full blur-[150px]"></div>
                <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-rose-100/20 dark:bg-rose-900/10 rounded-full blur-[150px]"></div>
            </div>

            {/* Header */}
            <div className="relative z-10 pt-8 pb-12 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Breadcrumb items={[{ name: 'Accueil', onClick: onNavigateHome }, { name: 'Coffrets & Packs' }]} />
                    <div className="mt-8 text-center max-w-3xl mx-auto animate-fadeInUp">
                        <span className="text-rose-500 font-bold uppercase tracking-[0.25em] text-xs mb-3 block">Idées Cadeaux</span>
                        <h1 className="text-4xl md:text-6xl font-serif font-medium text-gray-900 dark:text-white mb-4">L'Art d'Offrir</h1>
                        <p className="text-lg text-gray-500 dark:text-gray-400 font-light">Des assortiments d'exception pour faire plaisir ou se faire plaisir.</p>
                    </div>
                </div>
            </div>

            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
                <div className="flex flex-col lg:flex-row gap-10">
                    
                    {/* Sidebar */}
                    <div className={`
                        fixed inset-0 z-50 bg-white dark:bg-gray-900 p-6 overflow-y-auto transition-transform duration-300 lg:translate-x-0 lg:static lg:bg-transparent lg:p-0 lg:overflow-visible lg:w-[300px] lg:block
                        ${showMobileFilters ? 'translate-x-0' : '-translate-x-full'}
                    `}>
                        <div className="lg:hidden flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Filtres</h2>
                            <button onClick={() => setShowMobileFilters(false)}><XMarkIcon className="w-6 h-6"/></button>
                        </div>
                        {/* We reuse FiltersSidebar but with simplified data for Packs since they don't share same structure strictly */}
                        <FiltersSidebar 
                            products={productsInPacks as any}
                            filters={filters}
                            onFilterChange={setFilters}
                            maxPrice={maxPrice}
                        />
                    </div>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        {/* Toolbar */}
                        <div className="flex flex-wrap justify-between items-center mb-8 gap-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md p-2 rounded-2xl border border-white/40 dark:border-gray-700 shadow-sm">
                             <button 
                                onClick={() => setShowMobileFilters(true)}
                                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 rounded-xl text-sm font-bold shadow-sm"
                            >
                                <AdjustmentsHorizontalIcon className="w-5 h-5"/> Filtres
                            </button>

                            <div className="flex items-center gap-4 ml-auto">
                                <div className="relative group">
                                    <div className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-colors">
                                        <select 
                                            value={sortOrder} 
                                            onChange={(e) => setSortOrder(e.target.value)} 
                                            className="bg-transparent text-sm font-bold text-gray-900 dark:text-white focus:outline-none cursor-pointer appearance-none pr-4"
                                        >
                                            <option value="price-asc">Prix croissant</option>
                                            <option value="price-desc">Prix décroissant</option>
                                            <option value="name-asc">Nom (A-Z)</option>
                                        </select>
                                        <ChevronDownIcon className="w-4 h-4 text-gray-400 pointer-events-none -ml-4" />
                                    </div>
                                </div>

                                <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                                     <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow-sm text-rose-600' : 'text-gray-400 hover:text-gray-600'}`}><Squares2X2Icon className="w-5 h-5"/></button>
                                     <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm text-rose-600' : 'text-gray-400 hover:text-gray-600'}`}><Bars3Icon className="w-5 h-5"/></button>
                                </div>
                            </div>
                        </div>
                        
                        {displayedPacks.length > 0 ? (
                            <div className={viewMode === 'list' ? 'space-y-6' : `grid ${gridClasses} gap-8`}>
                                {displayedPacks.map((pack, index) => (
                                    <div key={pack.id} className="animate-fadeInUp" style={{ animationDelay: `${index * 100}ms` }}>
                                        {viewMode === 'list' ? (
                                            <PackListItem pack={pack} allProducts={allProducts} allPacks={allPacks} onNavigateToPackDetail={onNavigateToPackDetail} />
                                        ) : (
                                            <PackCard pack={pack} allProducts={allProducts} allPacks={allPacks} onNavigateToPackDetail={onNavigateToPackDetail} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 bg-white/50 dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                                <div className="w-20 h-20 bg-rose-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 text-rose-300">
                                    <SparklesIcon className="w-10 h-10" />
                                </div>
                                <p className="text-xl font-serif text-gray-900 dark:text-white">Aucun coffret trouvé.</p>
                                <button onClick={() => setFilters({price: {min: 0, max: maxPrice}, brands: [], materials: []})} className="mt-4 text-sm font-bold text-rose-600 underline">Réinitialiser les filtres</button>
                            </div>
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
