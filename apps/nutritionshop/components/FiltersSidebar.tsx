
import React, { useMemo, useState } from 'react';
import type { Product } from '../types';
import { ChevronDownIcon, CheckCircleIcon } from './IconComponents';

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
        <div className="group border-b border-gray-200 dark:border-gray-700 last:border-0">
            <button 
                type="button" 
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between py-4 text-left transition-colors"
            >
                <span className="font-serif text-base font-bold text-gray-900 dark:text-white uppercase tracking-wider group-hover:text-brand-neon transition-colors">
                    {title}
                </span>
                <span className={`flex items-center justify-center w-6 h-6 transition-all duration-300 ${isOpen ? 'rotate-180 text-brand-neon' : 'text-gray-500'}`}>
                    <ChevronDownIcon className="w-4 h-4" />
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
            .sort((a, b) => b.count - a.count); 
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
        <aside className="w-full lg:w-[280px] flex-shrink-0 relative z-20">
            <div className="sticky top-24 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 p-6 transition-all duration-500 shadow-sm">
                
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="w-1 h-6 bg-brand-neon"></div>
                    <h2 className="text-xl font-serif font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">FILTRER</h2>
                </div>

                <div className="space-y-1">
                    {/* Price Slider Section */}
                    <FilterAccordion title="Budget">
                        <div className="px-1 pt-2">
                            <div className="flex justify-between items-end mb-4 font-mono">
                                <span className="text-xs text-gray-500">Max</span>
                                <span className="text-lg font-bold text-brand-neon">
                                    {filters.price.max} DT
                                </span>
                            </div>
                            
                            <div className="relative h-4 flex items-center">
                                <input 
                                    type="range" 
                                    min="0" 
                                    max={maxPrice} 
                                    value={filters.price.max} 
                                    onChange={handlePriceChange}
                                    className="absolute w-full h-1 bg-gray-700 rounded appearance-none cursor-pointer z-20 accent-[#ccff00]"
                                />
                            </div>
                            <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase mt-1">
                                <span>0</span>
                                <span>{maxPrice}</span>
                            </div>
                        </div>
                    </FilterAccordion>

                    {/* Brands Section - Industrial Checkbox */}
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
                                                flex items-center justify-between p-2 cursor-pointer border border-transparent hover:border-gray-700 transition-colors
                                                ${isSelected ? 'bg-gray-100 dark:bg-gray-800' : ''}
                                            `}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-4 h-4 border border-gray-400 flex items-center justify-center ${isSelected ? 'bg-brand-neon border-brand-neon' : ''}`}>
                                                    {isSelected && <div className="w-2 h-2 bg-black"></div>}
                                                </div>
                                                <span className={`text-xs font-bold uppercase ${isSelected ? 'text-black dark:text-white' : 'text-gray-500'}`}>{brand.name}</span>
                                            </div>
                                            <span className="text-[10px] text-gray-400 font-mono">[{brand.count}]</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </FilterAccordion>
                    )}

                    {/* Materials/Features Section */}
                    {materials.length > 0 && (
                        <FilterAccordion title="Objectifs" isOpenDefault={false}>
                            <div className="space-y-2">
                                {materials.map(material => {
                                    const isSelected = filters.materials.includes(material.name);
                                    return (
                                        <label key={material.name} className="flex items-center cursor-pointer group p-1">
                                            <div className={`
                                                w-4 h-4 border flex items-center justify-center mr-3 transition-colors
                                                ${isSelected 
                                                    ? 'bg-brand-neon border-brand-neon' 
                                                    : 'bg-transparent border-gray-500 group-hover:border-white'}
                                            `}>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={isSelected}
                                                    onChange={() => handleMaterialChange(material.name)}
                                                />
                                                {isSelected && <div className="w-2 h-2 bg-black"></div>}
                                            </div>
                                            <span className={`text-xs uppercase font-bold transition-colors ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>
                                                {material.name}
                                            </span>
                                            <span className="ml-auto text-[10px] text-gray-600 font-mono">
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
