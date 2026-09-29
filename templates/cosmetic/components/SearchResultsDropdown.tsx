import React from 'react';
import type { SearchResult } from '../types';
import { ChevronRightIcon } from './IconComponents';

interface SearchResultsDropdownProps {
    results: SearchResult;
    onNavigateToProductDetail: (productId: number) => void;
    onNavigateToCategory: (categoryName: string) => void;
    clearSearch: () => void;
}

export const SearchResultsDropdown: React.FC<SearchResultsDropdownProps> = ({ results, onNavigateToProductDetail, onNavigateToCategory, clearSearch }) => {
    
    const handleProductClick = (productId: number) => {
        onNavigateToProductDetail(productId);
        clearSearch();
    };

    const handleCategoryClick = (categoryName: string) => {
        onNavigateToCategory(categoryName);
        clearSearch();
    };

    const hasResults = results.products.length > 0 || results.categories.length > 0;

    return (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-2xl border dark:border-gray-700 z-50 overflow-hidden animate-fadeIn">
            {hasResults ? (
                <div className="max-h-[60vh] overflow-y-auto">
                    {/* Product results */}
                    {results.products.length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold uppercase text-gray-400 p-3 bg-gray-50 dark:bg-gray-700/50">Produits</h3>
                            <ul>
                                {results.products.map(({ item, context }) => (
                                    <li key={item.id}>
                                        <a href="#" onClick={(e) => { e.preventDefault(); handleProductClick(item.id); }} className="flex items-center gap-4 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                            <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded-md" />
                                            <div className="flex-grow min-w-0">
                                                <p className="font-semibold text-sm text-gray-800 dark:text-gray-100 truncate">{item.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{context}</p>
                                            </div>
                                            <p className="text-sm font-bold text-red-600 flex-shrink-0">{item.price.toFixed(3).replace('.',',')} DT</p>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {/* Category results */}
                    {results.categories.length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold uppercase text-gray-400 p-3 bg-gray-50 dark:bg-gray-700/50">Catégories</h3>
                             <ul>
                                {results.categories.map(({ name }) => (
                                    <li key={name}>
                                        <a href="#" onClick={(e) => { e.preventDefault(); handleCategoryClick(name); }} className="flex justify-between items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                            <span className="font-semibold text-sm text-gray-800 dark:text-gray-100">{name}</span>
                                            <ChevronRightIcon className="w-4 h-4 text-gray-400"/>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            ) : (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    <p>Aucun résultat trouvé pour votre recherche.</p>
                </div>
            )}
        </div>
    );
};

// Simple fade-in animation
const style = document.createElement('style');
style.innerHTML = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
`;
document.head.appendChild(style);