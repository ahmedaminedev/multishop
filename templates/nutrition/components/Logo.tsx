import React from 'react';

export const Logo: React.FC = () => (
    <div className="flex items-center gap-3 select-none group cursor-pointer">
        {/* Hexagonal green badge with dumbbell icon */}
        <div className="relative w-11 h-11 flex items-center justify-center bg-[#84cc16] rounded-xl shadow-sm group-hover:scale-105 transition-transform duration-200">
            <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                className="text-black" 
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Stylized dumbbell matching screenshot */}
                <rect x="2" y="7" width="3" height="10" rx="1.5" fill="currentColor"/>
                <rect x="5" y="9" width="2" height="6" rx="0.5" fill="currentColor"/>
                <rect x="7" y="11" width="10" height="2" rx="0.5" fill="currentColor"/>
                <rect x="17" y="9" width="2" height="6" rx="0.5" fill="currentColor"/>
                <rect x="19" y="7" width="3" height="10" rx="1.5" fill="currentColor"/>
            </svg>
        </div>

        {/* Brand Text */}
        <div className="flex flex-col text-left">
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none font-sans uppercase">
                IRON<span className="text-slate-900 dark:text-white">FUEL</span>
            </span>
            <span className="text-[9px] uppercase tracking-[0.22em] text-slate-600 dark:text-slate-400 font-extrabold mt-0.5">
                ELITE FITNESS EQUIPMENT
            </span>
        </div>
    </div>
);
