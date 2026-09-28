
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
        { name: 'Accueil', action: onNavigateHome },
        { name: 'Les Packs', action: onNavigateToPacks },
        { name: 'Le Blog', action: onNavigateToBlog },
        { name: 'Contact', action: onNavigateToContact },
    ];

    const handleLinkClick = (e: React.MouseEvent, action: () => void) => {
        e.preventDefault();
        action();
        setIsMobileMenuOpen(false);
    };

    return (
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 shadow-sm relative z-30">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14 md:h-16">
                    
                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                            className="text-gray-800 dark:text-gray-200 hover:text-rose-600 transition-colors p-2"
                            aria-label="Ouvrir le menu"
                        >
                            <MenuIcon className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Centered Desktop Navigation */}
                    <div className="hidden md:flex flex-1 justify-center">
                        <div className="flex items-center space-x-12">
                            {navLinks.map((link) => (
                                 <a 
                                    key={link.name} 
                                    href="#" 
                                    onClick={(e) => handleLinkClick(e, link.action)}
                                    className="group relative py-2"
                                >
                                    <span className="font-serif text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-[0.15em] group-hover:text-rose-600 transition-colors duration-300">
                                        {link.name}
                                    </span>
                                    <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-rose-600 transition-all duration-300 group-hover:w-full group-hover:left-0 ease-out"></span>
                                </a>
                            ))}
                        </div>
                    </div>
                    
                    {/* Right side: Modern OFFRES Button */}
                    <div className="flex items-center justify-end md:absolute md:right-8 md:top-1/2 md:-translate-y-1/2">
                         <a 
                            href="#" 
                            onClick={(e) => handleLinkClick(e, onNavigateToPromotions)} 
                            className="
                                relative overflow-hidden px-5 py-2 rounded-full group
                                border border-rose-200 dark:border-rose-800
                                bg-white dark:bg-gray-900
                                transition-all duration-300 hover:shadow-md hover:border-rose-400
                            "
                        >
                            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                            <span className="relative font-serif text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest group-hover:text-rose-700 dark:group-hover:text-rose-300 transition-colors">
                                Offres
                            </span>
                        </a>
                    </div>
                </div>
            </div>

            {/* Elegant Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                 <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 shadow-xl animate-fadeIn z-50">
                     <div className="flex flex-col py-4">
                         {navLinks.map((link) => (
                             <a 
                                key={link.name}
                                href="#" 
                                onClick={(e) => handleLinkClick(e, link.action)}
                                className="px-8 py-4 text-sm font-serif font-bold text-gray-800 dark:text-gray-200 uppercase tracking-widest hover:bg-rose-50 dark:hover:bg-gray-700 hover:text-rose-600 hover:pl-10 transition-all duration-300 border-l-4 border-transparent hover:border-rose-500"
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
