
import React, { useState, useRef, useEffect } from 'react';
import type { Category } from '../types';
import { ChevronDownIcon } from './IconComponents';

interface CategoryBarProps {
    categories: Category[];
    onCategoryClick: (categoryName: string) => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({ categories, onCategoryClick }) => {
    const [openCategory, setOpenCategory] = useState<string | null>(null);
    const navRef = useRef<HTMLDivElement>(null);

    // Fermer le menu si on clique ailleurs
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (navRef.current && !navRef.current.contains(event.target as Node)) {
                setOpenCategory(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = (name: string) => {
        setOpenCategory(openCategory === name ? null : name);
    };

    return (
        <div ref={navRef} className="bg-white dark:bg-brand-dark border-b border-gray-100 dark:border-white/5 relative z-40 hidden md:block shadow-sm">
            <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
                <ul className="flex justify-center items-center gap-2 lg:gap-6">
                    {categories.map((category) => {
                        const hasChildren = (category.megaMenu && category.megaMenu.length > 0) || (category.subCategories && category.subCategories.length > 0);
                        const isOpen = openCategory === category.name;

                        return (
                            <li key={category.name} className="relative group">
                                <button 
                                    onClick={() => hasChildren ? handleToggle(category.name) : onCategoryClick(category.name)}
                                    className={`
                                        py-5 px-4 text-[13px] font-black uppercase tracking-widest transition-all flex items-center gap-2
                                        ${isOpen ? 'text-brand-primary' : 'text-slate-500 dark:text-slate-400 hover:text-brand-primary'}
                                    `}
                                >
                                    {category.name}
                                    {hasChildren && (
                                        <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'opacity-40'}`} />
                                    )}
                                </button>

                                {/* Dropdown Menu (Mega or Simple) */}
                                {hasChildren && isOpen && (
                                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-screen max-w-screen-2xl bg-white dark:bg-gray-900 shadow-2xl border-t border-brand-primary/20 animate-fadeIn z-50 rounded-b-[2rem] overflow-hidden">
                                        <div className="mx-auto px-12 py-12">
                                            {category.megaMenu ? (
                                                <div className="grid grid-cols-5 gap-12">
                                                    {category.megaMenu.map((group, idx) => (
                                                        <div key={idx} className="space-y-6">
                                                            <h4 className="font-serif font-black text-slate-900 dark:text-white text-base uppercase tracking-wider border-b border-slate-50 pb-3">{group.title}</h4>
                                                            <ul className="space-y-3">
                                                                {group.items.map((item, i) => (
                                                                    <li key={i}>
                                                                        <button 
                                                                            onClick={() => { onCategoryClick(item.name); setOpenCategory(null); }} 
                                                                            className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-brand-primary transition-all text-left block w-full"
                                                                        >
                                                                            {item.name}
                                                                        </button>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <ul className="grid grid-cols-4 gap-6">
                                                    {category.subCategories?.map((sub, i) => (
                                                        <li key={i}>
                                                            <button 
                                                                onClick={() => { onCategoryClick(sub); setOpenCategory(null); }} 
                                                                className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl text-sm font-black text-slate-600 dark:text-slate-300 hover:bg-brand-primary hover:text-white transition-all w-full text-center"
                                                            >
                                                                {sub}
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                        {/* Bottom accent bar */}
                                        <div className="h-2 bg-brand-primary/10 w-full"></div>
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};
