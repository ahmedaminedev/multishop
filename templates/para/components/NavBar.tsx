
import React, { useState } from 'react';
import { MenuIcon, XMarkIcon, SparklesIcon } from './IconComponents';

interface NavBarProps {
    onNavigateHome: () => void;
    onNavigateToPacks: () => void;
    onNavigateToPromotions: () => void;
    onNavigateToBlog: () => void;
    onNavigateToNews: () => void;
    onNavigateToContact: () => void;
}

export const NavBar: React.FC<NavBarProps> = ({ 
    onNavigateHome, 
    onNavigateToPacks,
    onNavigateToPromotions,
    onNavigateToBlog, 
    onNavigateToContact 
}) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navLinks = [
        { name: 'ACCUEIL', action: onNavigateHome },
        { name: 'NOS PACKS & CURES', action: onNavigateToPacks },
        { name: 'PROMOTIONS', action: onNavigateToPromotions, highlight: true },
        { name: 'MAGAZINE SANTÉ', action: onNavigateToBlog },
        { name: 'CONTACT & CONSEILS', action: onNavigateToContact },
    ];

    return (
        <nav className="relative z-50 bg-white dark:bg-brand-dark border-b border-gray-100 dark:border-white/5 transition-all">
            <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
                <div className="flex items-center justify-between h-12 sm:h-14">
                    <div className="md:hidden">
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-brand-dark dark:text-white p-2">
                            {isMobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
                        </button>
                    </div>

                    <div className="hidden md:flex flex-1 justify-center">
                        <div className="flex items-center gap-2 lg:gap-3">
                            {navLinks.map((link) => (
                                <button 
                                    key={link.name} 
                                    onClick={(e) => { e.preventDefault(); link.action(); }}
                                    className={`
                                        group relative py-2 px-5 rounded-full transition-all duration-300
                                        ${link.highlight 
                                            ? 'bg-brand-primary text-white shadow-sm hover:bg-brand-primaryHover scale-105' 
                                            : 'text-slate-800 dark:text-slate-200 hover:text-brand-primary hover:bg-brand-light dark:hover:bg-white/5'}
                                    `}
                                >
                                    <span className="block text-sm lg:text-[15px] font-black uppercase tracking-wider relative z-10">
                                        {link.name}
                                    </span>
                                    {!link.highlight && (
                                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-brand-primary transition-all group-hover:w-6"></span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {isMobileMenuOpen && (
                 <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-brand-dark border-b shadow-2xl z-50 p-6 animate-fadeIn">
                    <div className="flex flex-col gap-2">
                        {navLinks.map((link) => (
                            <button 
                                key={link.name} 
                                onClick={() => { link.action(); setIsMobileMenuOpen(false); }}
                                className={`p-4 text-base font-black uppercase tracking-widest rounded-xl text-left ${link.highlight ? 'bg-brand-primary text-white' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50'}`}
                            >
                                {link.name}
                            </button>
                        ))}
                    </div>
                 </div>
            )}
        </nav>
    );
};
