
import React, { useState } from 'react';
import { MenuIcon } from './IconComponents';

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
    onNavigateToNews,
    onNavigateToContact 
}) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navLinks = [
        { name: 'Catalogue', action: onNavigateHome },
        { name: 'Packs Elite', action: onNavigateToPacks },
        // CHANGED: highlight logic to use brand-neon text
        { name: 'Offres', action: onNavigateToPromotions, highlight: true },
        { name: 'Blog', action: onNavigateToBlog },
        { name: 'Contact', action: onNavigateToContact },
    ];

    const handleLinkClick = (e: React.MouseEvent, action: () => void) => {
        e.preventDefault();
        action();
        setIsMobileMenuOpen(false);
    };

    return (
        <nav className="sticky top-0 z-50 bg-white/90 dark:bg-brand-black/90 backdrop-blur-md border-b-2 border-brand-light/10 dark:border-brand-dark transition-colors duration-300">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    
                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                            className="text-brand-black dark:text-white p-2 border border-brand-gray/20 rounded"
                        >
                            <MenuIcon className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Desktop Navigation - Centered & Technical */}
                    <div className="hidden md:flex flex-1 justify-center">
                        <div className="flex items-center space-x-1">
                            {navLinks.map((link) => (
                                 <a 
                                    key={link.name} 
                                    href="#" 
                                    onClick={(e) => handleLinkClick(e, link.action)}
                                    className={`
                                        group relative py-2 px-6 skew-x-[-12deg] border-r border-gray-200 dark:border-white/10 last:border-0
                                        hover:bg-brand-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-200
                                        ${link.highlight ? 'text-brand-neon font-black' : 'text-brand-black dark:text-white font-bold'}
                                    `}
                                >
                                    <span className="block skew-x-[12deg] uppercase text-sm tracking-widest relative z-10">
                                        {link.name}
                                        {/* Underline for Highlight */}
                                        {link.highlight && <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-brand-neon"></span>}
                                    </span>
                                    {/* Petit indicateur au survol */}
                                    <span className="absolute bottom-0 left-0 w-full h-1 bg-brand-neon transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"></span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                 <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-brand-black border-b border-brand-gray/20 shadow-xl z-50">
                     <div className="flex flex-col">
                         {navLinks.map((link) => (
                             <a 
                                key={link.name}
                                href="#" 
                                onClick={(e) => handleLinkClick(e, link.action)}
                                className={`px-6 py-4 text-base font-serif font-bold uppercase tracking-widest border-b border-gray-100 dark:border-white/5 hover:bg-brand-neon hover:text-black transition-colors ${link.highlight ? 'text-brand-neon' : ''}`}
                            >
                                {link.name}
                             </a>
                         ))}
                     </div>
                 </div>
            )}
        </nav>
    );
};
