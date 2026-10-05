import React from 'react';

export const Logo: React.FC<{ className?: string; showTagline?: boolean }> = ({ className = 'h-8 sm:h-9', showTagline = true }) => {
  return (
    <div className="flex items-center gap-2.5 group cursor-pointer select-none">
      {/* Playful Colorful Toy Emblem (Teddy / Balloon / Rocket hybrid) */}
      <div className="relative shrink-0 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
        <span className="text-xl">🧸</span>
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
        </span>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center leading-none tracking-tight">
          <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-serif">
            Youpi
          </span>
          <span className="text-xl sm:text-2xl font-black text-amber-500 font-serif">
            Shop
          </span>
          <span className="ml-1 text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
            JOUETS
          </span>
        </div>
        {showTagline && (
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-0.5">
            L'univers magique des enfants
          </span>
        )}
      </div>
    </div>
  );
};
