
import React, { useState } from 'react';
import type { Category } from '../types';
import { ChevronDownIcon } from './IconComponents';

interface CategoryBarProps {
    categories: Category[];
    onCategoryClick: (categoryName: string) => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({ categories, onCategoryClick }) => {
    const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

    return (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 relative z-30 hidden md:block">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <ul className="flex justify-center items-center gap-8 lg:gap-12 flex-wrap">
                    {categories.map((category) => {
                        const hasMegaMenu = category.megaMenu && category.megaMenu.length > 0;
                        const hasSubCategories = category.subCategories && category.subCategories.length > 0;
                        const hasChildren = hasMegaMenu || hasSubCategories;

                        return (
                            <li 
                                key={category.name} 
                                className="py-4"
                                onMouseEnter={() => setHoveredCategory(category.name)}
                                onMouseLeave={() => setHoveredCategory(null)}
                            >
                                <a 
                                    href="#" 
                                    onClick={(e) => { e.preventDefault(); onCategoryClick(category.name); }}
                                    className={`
                                        text-xs lg:text-sm font-sans font-bold uppercase tracking-widest transition-colors duration-300 flex items-center gap-1
                                        ${hoveredCategory === category.name ? 'text-rose-600' : 'text-gray-600 dark:text-gray-300 hover:text-rose-500'}
                                    `}
                                >
                                    {category.name}
                                    {hasChildren && (
                                        <ChevronDownIcon className={`w-3 h-3 transition-transform duration-300 ${hoveredCategory === category.name ? 'rotate-180' : ''}`} />
                                    )}
                                </a>

                                {/* Dropdown Menu */}
                                {(hoveredCategory === category.name && hasChildren) && (
                                    <div className="absolute left-0 top-full w-full bg-white dark:bg-gray-900 shadow-xl border-t border-rose-100 dark:border-gray-700 animate-fadeIn min-h-[200px] z-50">
                                        <div className="max-w-screen-2xl mx-auto px-8 py-8">
                                            {hasMegaMenu ? (
                                                <div className="grid grid-cols-4 gap-8">
                                                    {category.megaMenu!.map((group, idx) => (
                                                        <div key={idx}>
                                                            <h4 className="font-serif font-bold text-gray-900 dark:text-white mb-4 text-base border-b border-gray-100 dark:border-gray-700 pb-2">
                                                                {group.title}
                                                            </h4>
                                                            <ul className="space-y-2">
                                                                {group.items.map((item, i) => (
                                                                    <li key={i}>
                                                                        <a 
                                                                            href="#" 
                                                                            onClick={(e) => { e.preventDefault(); onCategoryClick(item.name); }}
                                                                            className="text-sm text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors block py-0.5 hover:translate-x-1 transform duration-200"
                                                                        >
                                                                            {item.name}
                                                                        </a>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    ))}
                                                    {/* Image promo optionnelle dans le menu (Placeholder statique pour le design) */}
                                                    <div className="col-span-1 bg-rose-50 dark:bg-gray-800 rounded-lg p-6 flex flex-col justify-center items-center text-center border border-rose-100 dark:border-gray-700">
                                                        <p className="font-serif text-rose-600 font-bold text-xl mb-2">Nouveautés</p>
                                                        <p className="text-sm text-gray-500 mb-4">Découvrez la collection {category.name}</p>
                                                        <button 
                                                            onClick={() => onCategoryClick(category.name)}
                                                            className="text-xs font-bold uppercase underline hover:text-rose-700"
                                                        >
                                                            Voir tout
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                /* Simple Subcategories List (Grid Display) */
                                                <div>
                                                    <h4 className="font-serif font-bold text-gray-400 dark:text-gray-500 mb-6 text-xs uppercase tracking-widest">
                                                        Explorer {category.name}
                                                    </h4>
                                                    <ul className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-y-4 gap-x-8">
                                                        {category.subCategories!.map((sub, i) => (
                                                            <li key={i}>
                                                                <a 
                                                                    href="#" 
                                                                    onClick={(e) => { e.preventDefault(); onCategoryClick(sub); }}
                                                                    className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-2 group"
                                                                >
                                                                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full group-hover:bg-rose-500 transition-colors"></span>
                                                                    {sub}
                                                                </a>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};
