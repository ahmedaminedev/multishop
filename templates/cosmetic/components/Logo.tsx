
import React from 'react';

export const Logo: React.FC = () => (
    <div className="flex items-center gap-2 select-none group">
        <div className="relative w-8 h-8 flex items-center justify-center">
            {/* Elegant Flower/Petal Abstract Icon */}
            {/* Note: width="32" and height="32" are explicitely required for html2canvas/PDF generation */}
            <svg 
                width="32" 
                height="32" 
                viewBox="0 0 24 24" 
                fill="none" 
                className="w-8 h-8 text-rose-500 dark:text-rose-400 transition-transform duration-500 group-hover:rotate-45" 
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M12 2C13.5 5 17 7 20 7C17 9 17 13 12 15C7 13 7 9 4 7C7 7 10.5 5 12 2Z" fill="currentColor" stroke="currentColor" strokeWidth="1"/>
                <path d="M12 22C10.5 19 7 17 4 17C7 15 7 11 12 9C17 11 17 15 20 17C17 17 13.5 19 12 22Z" fill="currentColor" opacity="0.6" stroke="currentColor" strokeWidth="1"/>
            </svg>
        </div>
        <div className="flex flex-col">
            <span className="text-2xl font-serif font-bold text-gray-900 dark:text-white tracking-tight leading-none">
                Cosmetics
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400 font-sans font-semibold">
                Shop
            </span>
        </div>
    </div>
);
