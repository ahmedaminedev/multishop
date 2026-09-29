
import React, { useMemo } from 'react';
import type { Product } from '../types';
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


const FilterGroup: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="border-b border-gray-200 dark:border-gray-700 py-6">
        <h3 className="-my-3 flow-root">
            <button type="button" className="flex w-full items-center justify-between bg-white dark:bg-gray-800 py-3 text-sm text-gray-500 dark:text-gray-300 hover:text-gray-600" aria-controls={`filter-section-${title}`} aria-expanded="true">
                <span className="font-bold text-gray-900 dark:text-gray-100">{title}</span>
                <span className="ml-6 flex items-center">
                    <ChevronDownIcon className="h-5 w-5" />
                </span>
            </button>
        </h3>
        <div className="pt-6" id={`filter-section-${title}`}>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    </div>
);


export const FiltersSidebar: React.FC<FiltersSidebarProps> = ({ products, filters, onFilterChange, maxPrice }) => {
    const brands = useMemo(() => {
        const brandCounts: { [key: string]: number } = {};
        products.forEach(p => {
            if (p.brand) {
                brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
            }
        });
        return Object.entries(brandCounts).map(([name, count]) => ({ name, count }));
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
        <aside className="w-full lg:w-1/4 lg:pr-8">
            <h2 className="text-xl font-bold border-b-2 border-yellow-400 pb-2 mb-4 hidden lg:block">Filtre</h2>
            <div className="space-y-6">
                <FilterGroup title="Prix">
                    <div className="flex justify-between items-center text-sm">
                        <span>{filters.price.min} TND</span>
                        <span>{filters.price.max} TND</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max={maxPrice} 
                        value={filters.price.max} 
                        className="w-full" 
                        onChange={handlePriceChange} 
                    />
                </FilterGroup>

                {brands.length > 0 && (
                    <FilterGroup title="Marque">
                        {brands.map(brand => (
                            <div key={brand.name} className="flex items-center">
                                <input
                                    id={`filter-brand-${brand.name}`}
                                    name="brand[]"
                                    defaultValue={brand.name}
                                    type="checkbox"
                                    checked={filters.brands.includes(brand.name)}
                                    onChange={() => handleBrandChange(brand.name)}
                                    className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                                />
                                <label htmlFor={`filter-brand-${brand.name}`} className="ml-3 text-sm text-gray-600 dark:text-gray-300">
                                    {brand.name} ({brand.count})
                                </label>
                            </div>
                        ))}
                    </FilterGroup>
                )}

                {materials.length > 0 && (
                    <FilterGroup title="Plus de filtres">
                        {materials.map(material => (
                            <div key={material.name} className="flex items-center">
                                <input
                                    id={`filter-material-${material.name}`}
                                    name="material[]"
                                    defaultValue={material.name}
                                    type="checkbox"
                                    checked={filters.materials.includes(material.name)}
                                    onChange={() => handleMaterialChange(material.name)}
                                    className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                                />
                                <label htmlFor={`filter-material-${material.name}`} className="ml-3 text-sm text-gray-600 dark:text-gray-300">
                                    {material.name} ({material.count})
                                </label>
                            </div>
                        ))}
                    </FilterGroup>
                )}
            </div>
        </aside>
    );
};
