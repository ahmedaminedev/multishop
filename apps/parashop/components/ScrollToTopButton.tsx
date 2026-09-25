
import React, { useState, useEffect } from 'react';
import { ChevronUpIcon } from './IconComponents';

export const ScrollToTopButton: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        // Le bouton n'apparaît que si on a scrollé de plus de 300px
        // Cela garantit qu'il est masqué quand on est au niveau des publicités du haut
        if (window.pageYOffset > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    return (
        <>
            {isVisible && (
                <button
                    onClick={scrollToTop}
                    className={`
                        fixed bottom-28 right-8 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 z-40 group
                        bg-gray-100 border-2 border-gray-300 text-gray-500 shadow-md
                        hover:border-brand-neon hover:text-brand-neon hover:scale-110
                        dark:bg-black dark:border-brand-neon dark:text-brand-neon dark:shadow-[0_0_20px_rgba(204,255,0,0.15)]
                        dark:hover:shadow-[0_0_30px_rgba(204,255,0,0.4)]
                    `}
                    aria-label="Retour en haut"
                >
                    <ChevronUpIcon className="h-6 w-6 transform group-hover:-translate-y-1 transition-transform duration-300" />
                    
                    {/* Effet d'onde subtil - uniquement visible en mode sombre ou au survol */}
                    <span className="absolute inset-0 rounded-full border border-brand-neon animate-ping opacity-0 group-hover:opacity-10 dark:opacity-5"></span>
                </button>
            )}
        </>
    );
};
