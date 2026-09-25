
import React, { useState, useRef, useEffect } from 'react';
import type { Category } from '../types';
import { ListBulletIcon, ChevronRightIcon, ChevronDoubleLeftIcon, ChevronDownIcon } from './IconComponents';

interface VerticalNavProps {
    categories: Category[];
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    onCategoryClick: (categoryName: string) => void;
    onNavigateToPacks: () => void;
}

export const VerticalNav: React.FC<VerticalNavProps> = ({ categories, isCollapsed, onToggleCollapse, onCategoryClick, onNavigateToPacks }) => {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const navRef = useRef<HTMLElement>(null);

    // Initial state check for mobile (default collapsed)
    useEffect(() => {
        if (window.innerWidth < 1024 && !isCollapsed) {
            onToggleCollapse();
        }
    }, []);

    const handleCategoryClick = (e: React.MouseEvent, categoryName: string) => {
        e.preventDefault();
        
        if (categoryName === 'Pack électroménager') {
            onNavigateToPacks();
            setActiveCategory(null);
            return;
        }

        const category = categories.find(c => c.name === categoryName);
        if (category?.subCategories || category?.megaMenu) {
            setActiveCategory(prev => (prev === categoryName ? null : categoryName));
        } else {
            setActiveCategory(null);
            onCategoryClick(categoryName);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (navRef.current && !navRef.current.contains(event.target as Node)) {
                setActiveCategory(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    
    useEffect(() => {
        if (isCollapsed) {
            setActiveCategory(null);
        }
    }, [isCollapsed]);

    return (
        <nav ref={navRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 sticky top-20 lg:top-24 z-30">
            <div
                onClick={onToggleCollapse}
                className="bg-yellow-400 text-gray-800 font-bold text-base lg:text-lg p-3 flex items-center justify-between rounded-t-lg cursor-pointer select-none"
            >
                <div className="flex items-center overflow-hidden">
                    <ListBulletIcon className="w-6 h-6 mr-3 shrink-0" />
                    <span className={`truncate transition-opacity duration-200 ${isCollapsed ? 'opacity-0 lg:opacity-0' : 'opacity-100'}`}>
                        {!isCollapsed ? 'Tous les départements' : ''}
                    </span>
                </div>
                <ChevronDoubleLeftIcon className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
            </div>

            <div className={`${isCollapsed ? 'hidden' : 'block'} border-t border-gray-100 dark:border-gray-700`}>
                <ul className="py-2 max-h-[60vh] lg:max-h-none overflow-y-auto">
                    {categories.map((category) => (
                        <li key={category.name} className="relative border-b last:border-b-0 border-gray-100 dark:border-gray-700/50">
                            <a 
                                href="#" 
                                onClick={(e) => handleCategoryClick(e, category.name)}
                                className="flex items-center justify-between p-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                aria-haspopup={!!(category.subCategories || category.megaMenu)}
                                aria-expanded={activeCategory === category.name}
                            >
                                <span className="truncate">{category.name}</span>
                                {(category.subCategories || category.megaMenu || category.name === 'Pack électroménager') && (
                                    activeCategory === category.name ? 
                                    <ChevronDownIcon className="w-4 h-4 text-gray-400" /> :
                                    <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                                )}
                            </a>
                            
                            {/* Submenu Handling */}
                            {/* Simple SubCategories */}
                            {category.subCategories && !category.megaMenu && (
                                <div className={`
                                    lg:absolute lg:left-full lg:top-0 lg:w-56 lg:bg-white lg:dark:bg-gray-800 lg:shadow-lg lg:rounded-md lg:py-1 lg:border lg:border-gray-200 lg:dark:border-gray-700 lg:z-30
                                    ${activeCategory === category.name ? 'block' : 'hidden lg:invisible lg:opacity-0'}
                                    transition-all duration-200 bg-gray-50 dark:bg-gray-900/50
                                `}>
                                    {category.subCategories.map((sub, i) => (
                                        <a key={i} href="#" onClick={(e) => { e.preventDefault(); onCategoryClick(sub); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 pl-8 lg:pl-4 border-l-2 border-transparent hover:border-red-500 lg:border-l-0">{sub}</a>
                                    ))}
                                </div>
                            )}

                            {/* Mega Menu */}
                            {category.megaMenu && (
                                <div className={`
                                    lg:absolute lg:left-full lg:-top-px lg:w-[800px] lg:max-h-[80vh] lg:overflow-y-auto lg:bg-white lg:dark:bg-gray-800 lg:shadow-lg lg:rounded-r-md lg:border lg:border-gray-200 lg:dark:border-gray-700 lg:border-t-4 lg:border-yellow-400 lg:z-30
                                    ${activeCategory === category.name ? 'block' : 'hidden lg:invisible lg:opacity-0'}
                                    transition-all duration-200 bg-gray-50 dark:bg-gray-900/50
                                `}>
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-x-10 lg:gap-y-8 p-4 lg:p-8">
                                        {category.megaMenu.map((group) => (
                                            <div key={group.title} className="flex flex-col space-y-2 py-1">
                                                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm lg:text-base mb-1 lg:mb-3">{group.title}</h3>
                                                <ul className="space-y-1 lg:space-y-2 pl-2 border-l border-gray-300 dark:border-gray-600 lg:border-none lg:pl-0">
                                                    {group.items.map((item, i) => (
                                                        <li key={i}>
                                                            <a href="#" onClick={(e) => { e.preventDefault(); onCategoryClick(item.name); }} className="block text-sm lg:text-base text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500">{item.name}</a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
};
