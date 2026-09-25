
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
        { name: 'Les packs', action: onNavigateToPacks },
        { name: 'Blog', action: onNavigateToBlog },
        { name: 'Contactez-nous', action: onNavigateToContact },
    ];

    const handleLinkClick = (e: React.MouseEvent, action: () => void) => {
        e.preventDefault();
        action();
        setIsMobileMenuOpen(false);
    };

    return (
        <nav className="bg-white dark:bg-gray-800 border-t border-b border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    
                    {/* Left placeholder for desktop, menu button for mobile */}
                    <div className="flex-1 flex items-center">
                        <div className="md:hidden">
                            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600 dark:text-gray-300 hover:text-red-600 flex items-center">
                                <MenuIcon className="w-6 h-6 mr-2" />
                                <span>Menu</span>
                            </button>
                        </div>
                    </div>

                    {/* Centered navigation links for desktop */}
                    <div className="hidden md:flex items-center space-x-10">
                        {navLinks.map((link) => (
                             <a 
                                key={link.name} 
                                href="#" 
                                onClick={(e) => handleLinkClick(e, link.action)}
                                className="relative text-base font-semibold text-gray-800 dark:text-gray-200 tracking-wide hover:text-red-600 transition-colors duration-200 after:content-[''] after:absolute after:left-0 after:bottom-[-5px] after:h-[2px] after:w-0 after:bg-red-600 after:transition-all after:duration-300 hover:after:w-full"
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>
                    
                    {/* Right side: Promotions link */}
                    <div className="flex-1 flex items-center justify-end">
                         <a href="#" onClick={(e) => handleLinkClick(e, onNavigateToPromotions)} className="text-sm font-semibold text-red-600 hover:underline">
                            PROMOTIONS
                        </a>
                    </div>
                </div>
            </div>
            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                 <div className="md:hidden py-2 border-t dark:border-gray-700">
                     {navLinks.map((link) => (
                         <div key={link.name} className="px-4">
                             <a 
                                href="#" 
                                onClick={(e) => handleLinkClick(e, link.action)}
                                className="flex justify-between items-center py-3 text-base font-semibold text-gray-800 dark:text-gray-200 hover:text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700 -mx-4 px-4 transition-all"
                            >
                                 <span>{link.name}</span>
                             </a>
                         </div>
                     ))}
                 </div>
            )}
        </nav>
    );
};
