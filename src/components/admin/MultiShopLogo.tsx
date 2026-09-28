import React from 'react';

interface MultiShopLogoProps {
  className?: string;
  showSubtitle?: boolean;
}

export const MultiShopLogo: React.FC<MultiShopLogoProps> = ({ className = '', showSubtitle = false }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Dynamic Cart Icon with Cyan, Blue, Orange motion stripes */}
      <div className="relative flex-shrink-0">
        <svg className="w-9 h-9" viewBox="0 0 54 44" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        <div className="flex items-center text-xl font-black tracking-tight leading-none">
          <span className="text-slate-900 font-extrabold">Multi</span>
          <span className="text-blue-600 font-black">Shop</span>
        </div>
        {showSubtitle && (
          <p className="text-[11px] text-slate-400 font-medium mt-1 leading-none">
            Votre succès, notre priorité !
          </p>
        )}
      </div>
    </div>
  );
};
