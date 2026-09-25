
import React, { useState, useEffect } from 'react';
import { ChevronUpIcon } from './IconComponents';

export const ScrollToTopButton: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
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
                    className="fixed bottom-24 right-6 w-12 h-12 rounded-full flex items-center justify-center bg-white dark:bg-gray-800 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-gray-700 shadow-xl hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white transition-all duration-300 z-40 group"
                    aria-label="Retour en haut"
                >
                    <ChevronUpIcon className="h-6 w-6 transform group-hover:-translate-y-1 transition-transform" />
                </button>
            )}
        </>
    );
};
