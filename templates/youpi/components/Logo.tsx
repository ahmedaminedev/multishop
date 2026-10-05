import React from 'react';

export const Logo: React.FC<{ className?: string; showTagline?: boolean; onClick?: () => void }> = ({
  className = '',
  showTagline = true,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 group cursor-pointer select-none ${className}`}
    >
      {/* 3D Cute Teddy Bear Emblem matching capture */}
      <div className="relative shrink-0 w-11 h-11 sm:w-13 sm:h-13 flex items-center justify-center transition-transform group-hover:scale-105 duration-200">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Bear Ears */}
          <circle cx="24" cy="26" r="15" fill="#f59e0b" />
          <circle cx="24" cy="26" r="9" fill="#fde68a" />
          <circle cx="76" cy="26" r="15" fill="#f59e0b" />
          <circle cx="76" cy="26" r="9" fill="#fde68a" />
          
          {/* Bear Head */}
          <ellipse cx="50" cy="52" rx="36" ry="32" fill="#fbbf24" stroke="#d97706" strokeWidth="2.5" />
          
          {/* Cheeks */}
          <circle cx="30" cy="57" r="5" fill="#fda4af" opacity="0.6" />
          <circle cx="70" cy="57" r="5" fill="#fda4af" opacity="0.6" />

          {/* Bear Snout / Muzzle */}
          <ellipse cx="50" cy="62" rx="16" ry="13" fill="#fef3c7" />
          {/* Bear Nose */}
          <ellipse cx="50" cy="57" rx="6" ry="4.5" fill="#78350f" />
          {/* Smiling Mouth */}
          <path
            d="M45 64 Q50 69 55 64"
            stroke="#78350f"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Bear Eyes with playful sparkle highlights */}
          <ellipse cx="37" cy="45" rx="5" ry="6.5" fill="#1e1b4b" />
          <circle cx="39" cy="43" r="2" fill="#ffffff" />
          <circle cx="35.5" cy="47" r="1" fill="#ffffff" />

          <ellipse cx="63" cy="45" rx="5" ry="6.5" fill="#1e1b4b" />
          <circle cx="65" cy="43" r="2" fill="#ffffff" />
          <circle cx="61.5" cy="47" r="1" fill="#ffffff" />

          {/* Red/Orange Ribbon Bow under neck */}
          <path d="M42 82 L32 87 L35 77 Z" fill="#ef4444" />
          <path d="M58 82 L68 87 L65 77 Z" fill="#ef4444" />
          <circle cx="50" cy="80" r="5" fill="#dc2626" />
        </svg>
      </div>

      {/* Brand Typography matching screenshot */}
      <div className="flex flex-col justify-center">
        <div className="flex items-baseline tracking-tight font-black leading-none">
          <span className="text-2xl sm:text-3xl font-extrabold text-[#e11d48] tracking-tight drop-shadow-xs font-sans">
            Youpi
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#0284c7] tracking-tight drop-shadow-xs font-sans">
            Shop
          </span>
        </div>
        {showTagline && (
          <div className="flex items-center gap-1 mt-1 text-[11px] sm:text-[12px] font-semibold text-slate-500 dark:text-slate-400 italic">
            <span>Des sourires à chaque jeu !</span>
            <span className="text-amber-500 font-bold text-xs">✨</span>
          </div>
        )}
      </div>
    </div>
  );
};

