import React from 'react';

interface MultiShopLogoProps {
  className?: string;
  showSubtitle?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const MultiShopLogo: React.FC<MultiShopLogoProps> = ({ className = '', showSubtitle = false, size = 'md' }) => {
  const iconSizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12 sm:w-14 sm:h-14',
    xl: 'w-14 h-14 sm:w-16 sm:h-16'
  }[size];

  const titleSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl sm:text-3xl md:text-[32px]',
    xl: 'text-3xl sm:text-4xl'
  }[size];

  return (
    <div className={`flex items-center gap-3 sm:gap-3.5 ${className}`}>
      {/* Dynamic Cart Icon with Cyan, Blue, Orange motion stripes */}
      <div className="relative flex-shrink-0 drop-shadow-sm">
        <svg className={iconSizeClasses} viewBox="0 0 54 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Motion streaks */}
          <path d="M2 11H18" stroke="#00b4d8" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M5 21H16" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" />
          <path d="M1 31H14" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" />
          
          {/* Cart frame */}
          <path 
            d="M17 11H44.5C45.8 11 46.7 12.3 46.3 13.5L42 27.5C41.7 28.4 40.8 29 39.8 29H23.5L20 11Z" 
            fill="#2563eb" 
          />
          <path d="M23.5 29L25.5 35.5H41" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Wheels */}
          <circle cx="27" cy="39" r="3.5" fill="#1e293b" />
          <circle cx="39" cy="39" r="3.5" fill="#1e293b" />
        </svg>
      </div>

      <div>
        <div className={`flex items-center font-black tracking-tighter leading-none ${titleSizeClasses}`}>
          <span className="text-slate-900 dark:text-white font-black">Multi</span>
          <span className="text-blue-600 font-black">Shop</span>
        </div>
        {showSubtitle && (
          <p className="text-[12px] text-slate-500 dark:text-slate-400 font-semibold mt-1 leading-none tracking-wide">
            Groupe E-Commerce N°1 en Tunisie
          </p>
        )}
      </div>
    </div>
  );
};
