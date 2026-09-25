import React from 'react';

export const Logo: React.FC = () => (
    <div className="flex items-center gap-4 select-none group">
        <div className="relative w-12 h-12 flex items-center justify-center bg-gray-900 border-2 border-brand-neon slant transform transition-transform group-hover:scale-110 duration-300">
            {/* Dumbbell Icon */}
            <svg 
                width="28" 
                height="28" 
                viewBox="0 0 24 24" 
                fill="none" 
                className="text-brand-neon transform slant-reverse" 
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M6 4h2v16H6V4zm10 0h2v16h-2V4zM2 8h4v8H2V8zm16 0h4v8h-4V8zM8 11h8v2H8v-2z" fill="currentColor"/>
            </svg>
            <div className="absolute inset-0 bg-brand-neon opacity-10 animate-pulse"></div>
        </div>
        <div className="flex flex-col">
            <span className="text-3xl font-serif font-black text-gray-900 dark:text-white tracking-tighter leading-none italic uppercase">
                IRON<span className="text-brand-neon">FUEL</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.5em] text-gray-500 dark:text-gray-400 font-sans font-black mt-1">
                ELITE NUTRITION
            </span>
        </div>
    </div>
);