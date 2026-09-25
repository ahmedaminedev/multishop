
import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Product, Category } from '../../types';
import { LinkIcon, SearchIcon, CheckCircleIcon } from '../IconComponents';

interface LinkBuilderProps {
    value: string;
    onChange: (url: string) => void;
    allProducts: Product[];
    allCategories: Category[];
}

type LinkType = 'static' | 'dynamic' | 'product';

const STATIC_PAGES = [
    { label: 'Accueil', value: 'home' },
    { label: 'Tous les Produits', value: 'product-list' },
    { label: 'Promotions', value: 'promotions' },
    { label: 'Les Packs', value: 'packs' },
    { label: 'Le Blog', value: 'blog' },
    { label: 'Contact', value: 'contact' },
    { label: 'Nos Magasins', value: 'stores' },
];

export const LinkBuilder: React.FC<LinkBuilderProps> = ({ value, onChange, allProducts, allCategories }) => {
    const [mode, setMode] = useState<LinkType>('static');
    
    // Static State
    const [selectedPage, setSelectedPage] = useState('product-list');
    
    // Dynamic Filter State
    const [selectedMainCategory, setSelectedMainCategory] = useState('');
    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [minPrice, setMinPrice] = useState<number>(0);
    const [maxPrice, setMaxPrice] = useState<number>(0);
    const [isPromo, setIsPromo] = useState(false);

    // Single Product State
    const [selectedSingleId, setSelectedSingleId] = useState<number | null>(null);
    const [productSearch, setProductSearch] = useState('');
    const [productFilterCat, setProductFilterCat] = useState('');
    const [productFilterBrand, setProductFilterBrand] = useState('');

    const lastGeneratedUrl = useRef(value);

    // --- 1. INITIALIZATION ---
    useEffect(() => {
        if (!value) return;
        if (value === lastGeneratedUrl.current) return;

        if (value.startsWith('#/') || value.startsWith('/')) {
            const cleanUrl = value.replace('#/', '').replace('/', '');
            
            // Case: Single Product
            if (cleanUrl.startsWith('product/')) {
                const idPart = cleanUrl.split('/')[1];
                const id = parseInt(idPart);
                if (!isNaN(id)) {
                    setMode('product');
                    setSelectedSingleId(id);
                }
            }
            // Case: Dynamic Filter List
            else if (cleanUrl.startsWith('product-list') && cleanUrl.includes('?')) {
                setMode('dynamic');
                const [_, query] = cleanUrl.split('?');
                const params = new URLSearchParams(query);
                
                const catParam = params.get('category') || '';
                
                // Determine if it's main or sub category
                const mainCatObj = allCategories.find(c => c.name === catParam);
                if (mainCatObj) {
                    setSelectedMainCategory(catParam);
                    setSelectedSubCategory('');
                } else {
                    const parentCat = allCategories.find(c => 
                        c.subCategories?.includes(catParam) || 
                        c.megaMenu?.some(g => g.items.some(i => i.name === catParam))
                    );
                    if (parentCat) {
                        setSelectedMainCategory(parentCat.name);
                        setSelectedSubCategory(catParam);
                    } else {
                        setSelectedMainCategory('');
                        setSelectedSubCategory(catParam);
                    }
                }

                setSelectedBrand(params.get('brand') || '');
                // Prices will be set by bounds logic if not explicitly in URL or if URL matches bounds
                // But for now we just parse if present, logic below handles consistency
                if (params.get('minPrice')) setMinPrice(Number(params.get('minPrice')));
                if (params.get('maxPrice')) setMaxPrice(Number(params.get('maxPrice')));
                
                setIsPromo(params.get('promo') === 'true');
            } 
            // Case: Static Page
            else {
                const [path] = cleanUrl.split('?');
                const isStatic = STATIC_PAGES.some(p => p.value === path);
                if (isStatic || path === 'product-list' || path === '') {
                    setMode('static');
                    setSelectedPage(path || 'home');
                }
            }
        }
    }, [value, allCategories]);

    // --- 2. LOGIQUE EN CASCADE ---

    // A. Sous-catégories disponibles pour la catégorie principale choisie
    const availableSubCategories = useMemo(() => {
        if (!selectedMainCategory) return [];
        const cat = allCategories.find(c => c.name === selectedMainCategory);
        if (!cat) return [];
        
        let subs: string[] = [];
        if (cat.subCategories) subs = [...subs, ...cat.subCategories];
        if (cat.megaMenu) {
            cat.megaMenu.forEach(group => {
                group.items.forEach(item => subs.push(item.name));
            });
        }
        return subs.sort();
    }, [selectedMainCategory, allCategories]);

    // B. Produits filtrés par le contexte (Catégorie + Sous-Catégorie)
    // Cela sert de base pour calculer les marques disponibles et les bornes de prix
    const contextProducts = useMemo(() => {
        let prods = allProducts;

        // 1. Filtrage par Catégorie
        if (selectedSubCategory) {
            prods = prods.filter(p => p.category === selectedSubCategory);
        } else if (selectedMainCategory) {
            // Si catégorie mère, on inclut tous les produits de ses sous-catégories
            const validCategories = [selectedMainCategory, ...availableSubCategories];
            prods = prods.filter(p => validCategories.includes(p.category));
        }

        // 2. Filtrage par Promo si actif (affecte marques et prix)
        if (isPromo) {
            prods = prods.filter(p => p.promo || p.discount);
        }

        return prods;
    }, [allProducts, selectedMainCategory, selectedSubCategory, availableSubCategories, isPromo]);

    // C. Marques disponibles dans le contexte actuel
    const availableBrands = useMemo(() => {
        const brands = new Set<string>();
        contextProducts.forEach(p => brands.add(p.brand));
        return Array.from(brands).sort();
    }, [contextProducts]);

    // D. Produits filtrés finaux (Contexte + Marque) pour calculer le prix
    const filteredProductsForPrice = useMemo(() => {
        let prods = contextProducts;
        if (selectedBrand) {
            prods = prods.filter(p => p.brand === selectedBrand);
        }
        return prods;
    }, [contextProducts, selectedBrand]);

    // E. Bornes de Prix (Min/Max) dynamiques
    const priceBounds = useMemo(() => {
        if (filteredProductsForPrice.length === 0) return { min: 0, max: 0 };
        const prices = filteredProductsForPrice.map(p => p.price);
        return {
            min: Math.floor(Math.min(...prices)),
            max: Math.ceil(Math.max(...prices))
        };
    }, [filteredProductsForPrice]);

    // Reset dependents logic
    useEffect(() => {
        if (selectedMainCategory && selectedSubCategory && !availableSubCategories.includes(selectedSubCategory)) {
            setSelectedSubCategory('');
        }
    }, [selectedMainCategory]);

    useEffect(() => {
        if (selectedBrand && !availableBrands.includes(selectedBrand)) {
            setSelectedBrand('');
        }
    }, [contextProducts]); // Reset brand if context changes (e.g. changing category)

    // Initialisation du range slider lors du changement de contexte
    useEffect(() => {
        // On met à jour les curseurs uniquement si les bornes changent significativement ou si c'est la première fois
        // Pour éviter de bloquer l'utilisateur s'il a déjà bougé les curseurs, on pourrait raffiner, 
        // mais ici on assure que le filtre rend "au moins un produit" en calant sur les bornes réelles.
        if (priceBounds.max > 0) {
             // Si le min actuel est hors bornes ou 0, on le cale
             if (minPrice < priceBounds.min || minPrice > priceBounds.max) setMinPrice(priceBounds.min);
             // Si le max actuel est hors bornes ou 0, on le cale
             if (maxPrice > priceBounds.max || maxPrice < priceBounds.min || maxPrice === 0) setMaxPrice(priceBounds.max);
        } else {
            setMinPrice(0);
            setMaxPrice(0);
        }
    }, [priceBounds]);


    // --- 3. URL GENERATION ---
    useEffect(() => {
        let newUrl = '#';
        
        if (mode === 'static') {
            if(selectedPage === 'home') newUrl = '#/';
            else newUrl = `#/${selectedPage}`;
        } else if (mode === 'dynamic') {
            const params = new URLSearchParams();
            
            // Priority to subcategory, fallback to main
            if (selectedSubCategory) params.append('category', selectedSubCategory);
            else if (selectedMainCategory) params.append('category', selectedMainCategory);
            
            if (selectedBrand) params.append('brand', selectedBrand);
            
            // Only append prices if valid range
            if (minPrice > 0) params.append('minPrice', minPrice.toString());
            if (maxPrice > 0) params.append('maxPrice', maxPrice.toString());
            
            if (isPromo) params.append('promo', 'true');
            
            const queryString = params.toString();
            newUrl = `#/product-list?${queryString}`;
        } else if (mode === 'product') {
            if (selectedSingleId) newUrl = `#/product/${selectedSingleId}`;
            else if (value && value.startsWith('#/product/')) return; // Keep existing if valid
            else return;
        }

        if (newUrl !== value) {
             lastGeneratedUrl.current = newUrl;
             onChange(newUrl);
        }
    }, [mode, selectedPage, selectedMainCategory, selectedSubCategory, selectedBrand, minPrice, maxPrice, isPromo, selectedSingleId]);


    // Search candidates for Single Product mode
    const productCandidates = useMemo(() => {
        if (mode !== 'product') return [];
        return allProducts.filter(p => {
            const matchName = p.name.toLowerCase().includes(productSearch.toLowerCase());
            const matchCat = productFilterCat ? p.category === productFilterCat : true;
            const matchBrand = productFilterBrand ? p.brand === productFilterBrand : true;
            return matchName && matchCat && matchBrand;
        }).slice(0, 50);
    }, [allProducts, mode, productSearch, productFilterCat, productFilterBrand]);

    const allProductBrands = useMemo(() => [...new Set(allProducts.map(p => p.brand))].sort(), [allProducts]);
    const allProductCats = useMemo(() => [...new Set(allProducts.map(p => p.category))].sort(), [allProducts]);

    return (
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600 space-y-4">
            <div className="flex flex-col gap-2 mb-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Type de lien</label>
                <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-600 gap-1">
                    <button 
                        type="button"
                        onClick={() => setMode('static')} 
                        className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors ${mode === 'static' ? 'bg-gray-900 text-white dark:bg-white dark:text-black shadow-sm' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                        Page
                    </button>
                    <button 
                        type="button"
                        onClick={() => setMode('dynamic')} 
                        className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors ${mode === 'dynamic' ? 'bg-rose-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                        Filtres
                    </button>
                    <button 
                        type="button"
                        onClick={() => setMode('product')} 
                        className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors ${mode === 'product' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                        Produit
                    </button>
                </div>
            </div>

            {/* MODE: STATIC PAGE */}
            {mode === 'static' && (
                <div className="animate-fadeIn">
                    <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select 
                            value={selectedPage} 
                            onChange={(e) => setSelectedPage(e.target.value)}
                            className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-2 pl-10 pr-3 text-sm focus:ring-2 focus:ring-rose-500"
                        >
                            {STATIC_PAGES.map(page => (
                                <option key={page.value} value={page.value}>{page.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* MODE: DYNAMIC FILTERS (CASCADE) */}
            {mode === 'dynamic' && (
                <div className="space-y-4 animate-fadeIn">
                    {/* Categories Cascade */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Catégorie Mère</label>
                            <select 
                                value={selectedMainCategory} 
                                onChange={(e) => setSelectedMainCategory(e.target.value)}
                                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-1.5 px-2 text-xs focus:ring-rose-500 focus:border-rose-500"
                            >
                                <option value="">Toutes</option>
                                {allCategories.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Sous-catégorie</label>
                            <select 
                                value={selectedSubCategory} 
                                onChange={(e) => setSelectedSubCategory(e.target.value)}
                                disabled={!selectedMainCategory}
                                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-1.5 px-2 text-xs disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:text-gray-400"
                            >
                                <option value="">Toutes</option>
                                {availableSubCategories.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Brand Filter (Dependent) */}
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Marque (Filtre dynamique)</label>
                        <select 
                            value={selectedBrand} 
                            onChange={(e) => setSelectedBrand(e.target.value)}
                            className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-1.5 px-2 text-xs focus:ring-rose-500"
                        >
                            <option value="">Toutes les marques ({contextProducts.length} produits)</option>
                            {availableBrands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                        </select>
                    </div>

                    {/* Dynamic Price Bar */}
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Filtrer par Prix</label>
                            <span className="text-[10px] text-green-600 font-bold bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">
                                {filteredProductsForPrice.length} produits
                            </span>
                        </div>
                        
                        {filteredProductsForPrice.length > 0 ? (
                            <div className="space-y-3">
                                {/* Min Slider */}
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono text-gray-500 w-8">Min</span>
                                    <input 
                                        type="range"
                                        min={priceBounds.min}
                                        max={priceBounds.max}
                                        value={minPrice}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            if (val <= maxPrice) setMinPrice(val);
                                        }}
                                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                                    />
                                    <span className="text-[10px] font-bold w-12 text-right">{minPrice} DT</span>
                                </div>
                                {/* Max Slider */}
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono text-gray-500 w-8">Max</span>
                                    <input 
                                        type="range"
                                        min={priceBounds.min}
                                        max={priceBounds.max}
                                        value={maxPrice}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            if (val >= minPrice) setMaxPrice(val);
                                        }}
                                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                                    />
                                    <span className="text-[10px] font-bold w-12 text-right">{maxPrice} DT</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-red-500 text-center italic py-2">Aucun produit ne correspond à cette sélection.</p>
                        )}
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input 
                            type="checkbox" 
                            id="filter-promo" 
                            checked={isPromo} 
                            onChange={(e) => setIsPromo(e.target.checked)}
                            className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                        />
                        <label htmlFor="filter-promo" className="text-xs text-gray-700 dark:text-gray-300 select-none cursor-pointer">
                            En <span className="font-bold text-rose-600">Promotion</span> uniquement
                        </label>
                    </div>
                </div>
            )}

            {/* MODE: SINGLE PRODUCT */}
            {mode === 'product' && (
                <div className="space-y-3 animate-fadeIn">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            placeholder="Rechercher un produit..."
                            className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-2 pl-9 pr-3 text-sm focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    
                    <div className="flex gap-2">
                        <select 
                            value={productFilterCat} 
                            onChange={(e) => setProductFilterCat(e.target.value)}
                            className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-2 text-xs"
                        >
                            <option value="">Toutes Catégories</option>
                            {allProductCats.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <select 
                            value={productFilterBrand} 
                            onChange={(e) => setProductFilterBrand(e.target.value)}
                            className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-2 text-xs"
                        >
                            <option value="">Toutes Marques</option>
                            {allProductBrands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                        </select>
                    </div>

                    <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 custom-scrollbar">
                        {productCandidates.length > 0 ? (
                            productCandidates.map(product => {
                                const isSelected = selectedSingleId === product.id;
                                return (
                                    <div 
                                        key={product.id} 
                                        onClick={() => setSelectedSingleId(product.id)}
                                        className={`flex items-center gap-3 p-2 cursor-pointer border-b last:border-0 dark:border-gray-700 transition-colors ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                    >
                                        <img src={product.imageUrl} alt="" className="w-8 h-8 rounded object-cover bg-gray-100" />
                                        <div className="flex-grow min-w-0">
                                            <p className={`text-xs font-medium truncate ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-200'}`}>{product.name}</p>
                                            <p className="text-[10px] text-gray-500">{product.brand}</p>
                                        </div>
                                        {isSelected && <CheckCircleIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-4 text-center text-xs text-gray-400">Aucun produit trouvé</div>
                        )}
                    </div>
                </div>
            )}
            
            <div className="text-[10px] text-gray-400 bg-white dark:bg-gray-800 p-2 rounded border border-dashed border-gray-300 dark:border-gray-600 break-all">
                <span className="font-bold uppercase mr-2 text-gray-300">Résultat :</span>
                <span className="text-blue-500 font-mono">{value || 'Aucun lien'}</span>
            </div>
        </div>
    );
};
