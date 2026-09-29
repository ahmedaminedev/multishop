
import React, { useMemo, useState } from 'react';
import { ChevronDownIcon } from './IconComponents';

interface Filters {
    price: { min: number; max: number };
    brands: string[];
    materials: string[];
}
interface FiltersSidebarProps {
    products: { price: number; brand?: string; material?: string; }[];
    filters: Filters;
    onFilterChange: (newFilters: Filters) => void;
    maxPrice: number;
}

const FilterAccordion: React.FC<{ title: string, isOpenDefault?: boolean, children: React.ReactNode }> = ({ title, isOpenDefault = true, children }) => {
    const [isOpen, setIsOpen] = useState(isOpenDefault);

    return (
        <div className="mb-6">
            <button 
                type="button" 
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between py-4 text-left border-b border-slate-100 dark:border-white/5"
            >
                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">
                    {title}
                </span>
                <span className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-primary' : 'text-slate-400'}`}>
                    <ChevronDownIcon className="w-4 h-4" />
                </span>
            </button>
            <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[600px] opacity-100 py-6' : 'max-h-0 opacity-0'}`}
            >
                {children}
            </div>
        </div>
    );
};

export const FiltersSidebar: React.FC<FiltersSidebarProps> = ({ products, filters, onFilterChange, maxPrice }) => {
    const brands = useMemo(() => {
        const brandCounts: { [key: string]: number } = {};
        products.forEach(p => {
            if (p.brand) {
                brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
            }
        });
        return Object.entries(brandCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count); 
    }, [products]);

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFilterChange({ ...filters, price: { ...filters.price, max: Number(e.target.value) } });
    };

    const handleBrandChange = (brandName: string) => {
        const newBrands = filters.brands.includes(brandName)
            ? filters.brands.filter(b => b !== brandName)
            : [...filters.brands, brandName];
        onFilterChange({ ...filters, brands: newBrands });
    };

    return (
        <aside className="w-full lg:w-[300px] flex-shrink-0">
            <div className="sticky top-32">
                <FilterAccordion title="Budgets (DT)">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-2xl font-black text-brand-primary">{filters.price.max.toFixed(0)} <span className="text-xs">DT</span></span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max={maxPrice} 
                        value={filters.price.max} 
                        onChange={handlePriceChange}
                        className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-brand-primary"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase mt-4">
                        <span>Min: 0 DT</span>
                        <span>Max: {maxPrice} DT</span>
                    </div>
                </FilterAccordion>

                {brands.length > 0 && (
                    <FilterAccordion title="Marques">
                        <div className="space-y-2">
                            {brands.map(brand => {
                                const isSelected = filters.brands.includes(brand.name);
                                return (
                                    <div 
                                        key={brand.name}
                                        onClick={() => handleBrandChange(brand.name)}
                                        className={`
                                            flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-all
                                            ${isSelected 
                                                ? 'bg-brand-primary/5 border-brand-primary text-brand-primary' 
                                                : 'bg-white dark:bg-white/5 border-transparent text-slate-600 hover:bg-slate-50'}
                                        `}
                                    >
                                        <span className="text-xs font-bold uppercase">{brand.name}</span>
                                        <span className="text-[10px] opacity-50 font-black">{brand.count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </FilterAccordion>
                )}
            </div>
        </aside>
    );
};
