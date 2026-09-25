
import React, { useMemo, useState } from 'react';
import type { Product } from '../types';
import { ChevronDownIcon, MinusIcon, PlusIcon, CheckCircleIcon } from './IconComponents';

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
        <div className="group border-b border-rose-100 dark:border-gray-700/50 last:border-0">
            <button 
                type="button" 
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between py-5 text-left transition-colors"
            >
                <span className="font-serif text-lg font-medium text-gray-900 dark:text-white group-hover:text-rose-600 transition-colors">
                    {title}
                </span>
                <span className={`ml-6 flex items-center justify-center w-6 h-6 rounded-full border border-gray-200 dark:border-gray-600 transition-all duration-300 ${isOpen ? 'bg-rose-50 border-rose-200 rotate-180' : 'bg-transparent'}`}>
                    <ChevronDownIcon className={`w-3 h-3 ${isOpen ? 'text-rose-600' : 'text-gray-400'}`} />
                </span>
            </button>
            <div 
                className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100 pb-6' : 'max-h-0 opacity-0'}`}
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
            .sort((a, b) => b.count - a.count); // Sort by count desc
    }, [products]);

    const materials = useMemo(() => {
        const materialCounts: { [key: string]: number } = {};
        products.forEach(p => {
            if (p.material) {
                materialCounts[p.material] = (materialCounts[p.material] || 0) + 1;
            }
        });
        return Object.entries(materialCounts).map(([name, count]) => ({ name, count }));
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

    const handleMaterialChange = (materialName: string) => {
        const newMaterials = filters.materials.includes(materialName)
            ? filters.materials.filter(m => m !== materialName)
            : [...filters.materials, materialName];
        onFilterChange({ ...filters, materials: newMaterials });
    };

    return (
        <aside className="w-full lg:w-[300px] flex-shrink-0 relative z-20">
            <div className="sticky top-24 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 dark:border-gray-700 p-6 lg:p-8 transition-all duration-500">
                
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-rose-100 dark:border-gray-700">
                    <div className="w-1.5 h-6 bg-rose-500 rounded-full"></div>
                    <h2 className="text-xl font-serif font-bold text-gray-900 dark:text-white tracking-wide">Filtres</h2>
                </div>

                <div className="space-y-1">
                    {/* Price Slider Section */}
                    <FilterAccordion title="Budget">
                        <div className="px-1 pt-2">
                            <div className="flex justify-between items-end mb-4">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Max</span>
                                <span className="text-2xl font-bold text-rose-600 font-serif">
                                    {filters.price.max} <span className="text-sm font-sans font-normal text-gray-500">TND</span>
                                </span>
                            </div>
                            
                            <div className="relative h-6 flex items-center">
                                <input 
                                    type="range" 
                                    min="0" 
                                    max={maxPrice} 
                                    value={filters.price.max} 
                                    onChange={handlePriceChange}
                                    className="absolute w-full h-1 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer z-20 accent-rose-600"
                                />
                                <div 
                                    className="absolute h-1 bg-rose-500 rounded-l-lg z-10 pointer-events-none top-1/2 -translate-y-1/2" 
                                    style={{ width: `${(filters.price.max / maxPrice) * 100}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-400 font-medium mt-2">
                                <span>0 TND</span>
                                <span>{maxPrice} TND</span>
                            </div>
                        </div>
                    </FilterAccordion>

                    {/* Brands Section - Chips Style */}
                    {brands.length > 0 && (
                        <FilterAccordion title="Marques">
                            <div className="flex flex-wrap gap-2">
                                {brands.map(brand => {
                                    const isSelected = filters.brands.includes(brand.name);
                                    return (
                                        <button
                                            key={brand.name}
                                            onClick={() => handleBrandChange(brand.name)}
                                            className={`
                                                relative px-3 py-1.5 text-xs font-bold rounded-full border transition-all duration-300 flex items-center gap-1.5
                                                ${isSelected 
                                                    ? 'bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-200 dark:shadow-none pr-2 pl-2' 
                                                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-rose-300 hover:text-rose-500'}
                                            `}
                                        >
                                            {brand.name}
                                            <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                                                ({brand.count})
                                            </span>
                                            {isSelected && <CheckCircleIcon className="w-3 h-3 text-white" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </FilterAccordion>
                    )}

                    {/* Materials/Features Section - Checkbox List Style */}
                    {materials.length > 0 && (
                        <FilterAccordion title="Spécificités" isOpenDefault={false}>
                            <div className="space-y-3">
                                {materials.map(material => {
                                    const isSelected = filters.materials.includes(material.name);
                                    return (
                                        <label key={material.name} className="flex items-center cursor-pointer group">
                                            <div className={`
                                                w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 mr-3
                                                ${isSelected 
                                                    ? 'bg-rose-600 border-rose-600 shadow-sm' 
                                                    : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 group-hover:border-rose-400'}
                                            `}>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={isSelected}
                                                    onChange={() => handleMaterialChange(material.name)}
                                                />
                                                {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                            </div>
                                            <span className={`text-sm transition-colors ${isSelected ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 group-hover:text-rose-500'}`}>
                                                {material.name}
                                            </span>
                                            <span className="ml-auto text-xs text-gray-400">
                                                {material.count}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </FilterAccordion>
                    )}
                </div>
            </div>
        </aside>
    );
};
