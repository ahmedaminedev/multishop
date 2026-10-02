import React, { useState } from 'react';
import { Menu, ChevronDown, Flame } from 'lucide-react';

interface NavBarProps {
    onNavigateHome: () => void;
    onNavigateToCategory?: (categoryName: string) => void;
    onNavigateToPacks: () => void;
    onNavigateToPromotions: () => void;
    onNavigateToBlog: () => void;
    onNavigateToNews: () => void;
    onNavigateToContact: () => void;
}

export const NavBar: React.FC<NavBarProps> = ({ 
    onNavigateHome, 
    onNavigateToCategory,
    onNavigateToPromotions
}) => {
    const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('Accueil');

    const categoriesList = [
        'Musculation',
        'Cardio',
        'Cross Training',
        'Fitness & Yoga',
        'Haltères & Poids',
        'Bancs de Musculation',
        'Racks & Stations',
        'Disques & Barres',
        'Kettlebells',
        'Accessoires',
        'Nutrition & Protéines'
    ];

    const mainNavItems = [
        { label: 'Accueil', action: () => { setActiveTab('Accueil'); onNavigateHome(); } },
        { label: 'Musculation', action: () => { setActiveTab('Musculation'); onNavigateToCategory?.('Musculation'); } },
        { label: 'Cardio', action: () => { setActiveTab('Cardio'); onNavigateToCategory?.('Cardio'); } },
        { label: 'Cross Training', action: () => { setActiveTab('Cross Training'); onNavigateToCategory?.('Cross Training'); } },
        { label: 'Fitness & Yoga', action: () => { setActiveTab('Fitness & Yoga'); onNavigateToCategory?.('Fitness & Yoga'); } },
        { label: 'Accessoires', action: () => { setActiveTab('Accessoires'); onNavigateToCategory?.('Accessoires'); } },
        { label: 'Marques', action: () => { setActiveTab('Marques'); onNavigateToCategory?.('Marques'); } },
        { label: 'Promotions', action: () => { setActiveTab('Promotions'); onNavigateToPromotions(); }, isPromo: true },
    ];

    return (
        <nav className="w-full bg-[#0c1422] text-white relative z-40 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center h-12">
                    
                    {/* Left: Green "Toutes les catégories" Button */}
                    <div className="relative shrink-0 mr-4 lg:mr-8">
                        <button
                            type="button"
                            onClick={() => setIsCategoriesDropdownOpen(!isCategoriesDropdownOpen)}
                            className="h-12 px-4 sm:px-6 bg-[#84cc16] hover:bg-[#72b012] text-black font-extrabold text-xs sm:text-sm uppercase tracking-wide flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                            <Menu className="w-4 h-4 stroke-[2.5]" />
                            <span>Toutes les catégories</span>
                            <ChevronDown className={`w-3.5 h-3.5 stroke-[2.5] transition-transform ${isCategoriesDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {isCategoriesDropdownOpen && (
                            <div className="absolute left-0 top-full w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50 animate-fadeIn">
                                {categoriesList.map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => {
                                            setIsCategoriesDropdownOpen(false);
                                            setActiveTab(cat);
                                            onNavigateToCategory?.(cat);
                                        }}
                                        className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#84cc16] transition-colors flex items-center justify-between"
                                    >
                                        <span>{cat}</span>
                                        <span className="text-[10px] text-slate-400">→</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="flex-1 overflow-x-auto scrollbar-none flex items-center space-x-1 sm:space-x-4 lg:space-x-6">
                        {mainNavItems.map((item) => {
                            const isActive = activeTab === item.label;
                            return (
                                <button
                                    key={item.label}
                                    type="button"
                                    onClick={item.action}
                                    className={`relative h-12 px-2.5 sm:px-3 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                                        isActive 
                                            ? 'text-[#84cc16]' 
                                            : 'text-slate-300 hover:text-white'
                                    }`}
                                >
                                    {item.isPromo && <Flame className="w-3.5 h-3.5 text-[#84cc16] animate-pulse" />}
                                    <span>{item.label}</span>
                                    {isActive && (
                                        <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#84cc16]"></span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                </div>
            </div>
        </nav>
    );
};
