import React, { useState, useEffect, useMemo } from 'react';
import type { Pack, Product, Category } from '../types';
import { Breadcrumb } from './Breadcrumb';
import { CartIcon, Squares2X2Icon, Bars3Icon, ChevronDownIcon } from './IconComponents';
import { VerticalNav } from './VerticalNav';
import { FiltersSidebar } from './FiltersSidebar';
import { useCart } from './CartContext';

interface PacksPageProps {
    onNavigateHome: () => void;
    onNavigateToCategory: (categoryName: string) => void;
    isNavCollapsed: boolean;
    onToggleNav: () => void;
    packs: Pack[];
    allProducts: Product[];
    allPacks: Pack[];
    onNavigateToPacks: () => void;
    onNavigateToPackDetail: (packId: number) => void;
    categories: Category[];
}

// Helper function to check pack availability recursively
const isPackAvailable = (pack: Pack, allProducts: Product[], allPacks: Pack[]): boolean => {
    for (const productId of pack.includedProductIds) {
        const product = allProducts.find(p => p.id === productId);
        if (!product || product.quantity === 0) {
            return false;
        }
    }
    if (pack.includedPackIds) {
        for (const subPackId of pack.includedPackIds) {
            const subPack = allPacks.find(p => p.id === subPackId);
            if (!subPack || !isPackAvailable(subPack, allProducts, allPacks)) {
                return false;
            }
        }
    }
    return true;
};

const PackCard: React.FC<{ pack: Pack; allProducts: Product[]; allPacks: Pack[]; onNavigateToPackDetail: (packId: number) => void; }> = ({ pack, allProducts, allPacks, onNavigateToPackDetail }) => {
    const { addToCart, openCart } = useCart();
    const savings = pack.oldPrice - pack.price;
    const isAvailable = useMemo(() => isPackAvailable(pack, allProducts, allPacks), [pack, allProducts, allPacks]);

    const handleAddToCart = () => {
        if (!isAvailable) return;
        addToCart(pack);
        openCart();
    };
    
    const includedProducts = pack.includedProductIds.map(id => allProducts.find(p => p.id === id)).filter(Boolean);
    const includedPacks = (pack.includedPackIds || []).map(id => allPacks.find(p => p.id === id)).filter(Boolean);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md group overflow-hidden transition-all duration-300 flex flex-col h-full border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1">
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToPackDetail(pack.id); }} className="relative block">
                <img 
                    src={pack.imageUrl} 
                    alt={pack.name} 
                    className={`w-full h-56 object-cover ${!isAvailable ? 'filter grayscale' : ''}`}
                />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex flex-col justify-end p-4">
                    <h3 className="text-2xl font-bold text-white tracking-tight leading-tight">{pack.name}</h3>
                </div>
                 {!isAvailable && (
                    <span className="absolute top-3 right-3 bg-gray-700 text-white text-xs font-bold px-3 py-1 rounded-md shadow-md z-10">
                        INDISPONIBLE
                    </span>
                )}
            </a>

            <div className="p-4 flex flex-col flex-grow">
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm flex-grow">{pack.description}</p>

                <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 text-sm">Inclus dans ce pack :</h4>
                    <ul className="space-y-1.5">
                        {includedPacks.map((item, index) => (
                             <li key={`subpack-${index}`} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3 shrink-0"></span>
                                <span className="font-semibold">[PACK]</span>&nbsp;{item.name}
                            </li>
                        ))}
                        {includedProducts.map((item, index) => (
                            <li key={`product-${index}`} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <span className={`w-1.5 h-1.5 rounded-full mr-3 shrink-0 ${item.quantity > 0 ? 'bg-red-500' : 'bg-gray-400'}`}></span>
                                {item.name} {item.quantity === 0 && <span className="text-xs text-red-500 ml-2">(Épuisé)</span>}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700/50">
                    <div className="flex justify-between items-center mb-4 gap-2">
                         <div className="flex items-baseline flex-wrap">
                            <span className="text-3xl font-bold text-red-600 mr-2">{pack.price.toFixed(0)} DT</span>
                            <span className="text-base text-gray-400 line-through">{pack.oldPrice.toFixed(0)} DT</span>
                        </div>
                         <div className="bg-yellow-400 text-gray-900 text-center text-xs font-bold px-3 py-1.5 rounded-md leading-tight shadow shrink-0">
                            Économisez<br/>{savings.toFixed(0)} DT
                        </div>
                    </div>

                    <button 
                        onClick={handleAddToCart}
                        disabled={!isAvailable}
                        className="w-full font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:text-gray-500 bg-red-600 text-white hover:bg-red-700 focus:ring-red-300"
                    >
                        <CartIcon className="w-5 h-5" />
                        <span>{isAvailable ? 'Ajouter le pack au panier' : 'Indisponible'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const PackListItem: React.FC<{ pack: Pack; allProducts: Product[]; allPacks: Pack[]; onNavigateToPackDetail: (packId: number) => void; }> = ({ pack, allProducts, allPacks, onNavigateToPackDetail }) => {
    const { addToCart, openCart } = useCart();
    const isAvailable = useMemo(() => isPackAvailable(pack, allProducts, allPacks), [pack, allProducts, allPacks]);

    const handleAddToCart = () => {
        if (!isAvailable) return;
        addToCart(pack);
        openCart();
    };

    const includedProducts = pack.includedProductIds.map(id => allProducts.find(p => p.id === id)).filter(Boolean);
    const includedPacks = (pack.includedPackIds || []).map(id => allPacks.find(p => p.id === id)).filter(Boolean);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row items-center p-4 gap-6">
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToPackDetail(pack.id); }} className="relative flex-shrink-0 w-full md:w-64 block">
                <img
                    src={pack.imageUrl}
                    alt={pack.name}
                    className={`w-full h-auto object-contain rounded-lg ${!isAvailable ? 'filter grayscale' : ''}`}
                />
            </a>

            <div className="flex-grow text-center md:text-left">
                <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToPackDetail(pack.id); }} className="block">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 hover:text-red-600 transition-colors">{pack.name}</h3>
                </a>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{pack.description}</p>
                <div>
                    <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200 mb-2">Inclus dans ce pack :</h4>
                    <ul className="space-y-1">
                        {includedPacks.map((item, index) => (
                             <li key={`subpack-${index}`} className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                                <span className="font-semibold">[PACK]</span>&nbsp;{item.name}
                            </li>
                        ))}
                        {includedProducts.map((item, index) => (
                            <li key={`product-${index}`} className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${item.quantity > 0 ? 'bg-red-500' : 'bg-gray-400'}`}></span>
                                {item.name} {item.quantity === 0 && <span className="text-xs text-red-500 ml-1">(Épuisé)</span>}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="flex-shrink-0 w-full md:w-64 flex flex-col items-center md:items-end gap-3">
                <div className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 text-sm font-bold px-3 py-1 rounded-md">
                    Économisez {pack.oldPrice - pack.price} DT
                </div>
                <div className="text-right">
                    <p className="text-3xl font-bold text-red-600">{pack.price.toFixed(0)} DT</p>
                    <p className="text-md text-gray-400 line-through -mt-1">{pack.oldPrice.toFixed(0)} DT</p>
                </div>
                <button 
                    onClick={handleAddToCart}
                    disabled={!isAvailable}
                    className="w-full md:w-auto font-semibold py-3 px-6 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200 shadow-sm disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:text-gray-500 bg-red-600 text-white hover:bg-red-700"
                >
                    <CartIcon className="w-5 h-5" />
                    <span>{isAvailable ? 'Ajouter le pack' : 'Indisponible'}</span>
                </button>
            </div>
        </div>
    );
};

export const PacksPage: React.FC<PacksPageProps> = ({ onNavigateHome, onNavigateToCategory, isNavCollapsed, onToggleNav, packs, allProducts, allPacks, onNavigateToPacks, onNavigateToPackDetail, categories }) => {
    const [sortOrder, setSortOrder] = useState('price-asc');
    const [viewMode, setViewMode] = useState('grid');
    const [filters, setFilters] = useState({
        price: { min: 0, max: 5000 },
        brands: [] as string[],
        materials: [] as string[],
    });

    const productsInPacks = useMemo(() => {
        const productIds = new Set(packs.flatMap(p => p.includedProductIds));
        return allProducts.filter(p => productIds.has(p.id));
    }, [packs, allProducts]);

    const maxPrice = useMemo(() =>
        Math.ceil(packs.reduce((max, p) => p.price > max ? p.price : max, 0)) || 5000,
        [packs]
    );

    useEffect(() => {
        document.title = `Nos Packs - Electro Shop`;
        const newMaxPrice = Math.ceil(packs.reduce((max, p) => p.price > max ? p.price : max, 0)) || 5000;
        setFilters({
            price: { min: 0, max: newMaxPrice },
            brands: [],
            materials: [],
        });
    }, [packs]);
    
    const displayedPacks = useMemo(() => {
        let filtered = [...packs]
            .filter(p => p.price >= filters.price.min && p.price <= filters.price.max);
        
        if (filters.brands.length > 0) {
            filtered = filtered.filter(pack => 
                pack.includedProductIds.some(productId => {
                    const product = allProducts.find(p => p.id === productId);
                    return product && filters.brands.includes(product.brand);
                })
            );
        }

        if (filters.materials.length > 0) {
             filtered = filtered.filter(pack => 
                pack.includedProductIds.some(productId => {
                    const product = allProducts.find(p => p.id === productId);
                    return product && product.material && filters.materials.includes(product.material);
                })
            );
        }

        filtered.sort((a, b) => {
            switch (sortOrder) {
                case 'price-asc': return a.price - b.price;
                case 'price-desc': return b.price - a.price;
                case 'name-asc': return a.name.localeCompare(b.name);
                default: return 0;
            }
        });
        
        return filtered;
    }, [packs, filters, sortOrder, allProducts]);
    
    const gridClasses = viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1';

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
                    <Breadcrumb items={[{ name: 'Accueil', onClick: onNavigateHome }, { name: 'Les packs' }]} />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 my-6">Nos Packs Exclusifs</h1>
                    <div className="flex flex-col lg:flex-row gap-8">
                        <FiltersSidebar 
                            products={productsInPacks}
                            filters={filters}
                            onFilterChange={setFilters}
                            maxPrice={maxPrice}
                        />

                        <main className="flex-1">
                            <div className="flex justify-between items-center mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-2">
                                     <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-red-100 text-red-600' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`} aria-label="Grid view"><Squares2X2Icon className="w-5 h-5"/></button>
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
                                     <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">Affichage des {displayedPacks.length} packs</span>
                                </div>
                            </div>
                            
                            {displayedPacks.length > 0 ? (
                                viewMode === 'list' ? (
                                    <div className="space-y-6">
                                        {displayedPacks.map(pack => (
                                            <PackListItem key={pack.id} pack={pack} allProducts={allProducts} allPacks={allPacks} onNavigateToPackDetail={onNavigateToPackDetail} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className={`grid ${gridClasses} gap-8`}>
                                        {displayedPacks.map(pack => (
                                            <PackCard key={pack.id} pack={pack} allProducts={allProducts} allPacks={allPacks} onNavigateToPackDetail={onNavigateToPackDetail} />
                                        ))}
                                    </div>
                                )
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-lg text-gray-600 dark:text-gray-400">Aucun pack ne correspond à votre sélection.</p>
                                    <p className="text-sm text-gray-500 mt-2">Essayez de modifier ou de réinitialiser vos filtres.</p>
                                </div>
                            )}
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
};