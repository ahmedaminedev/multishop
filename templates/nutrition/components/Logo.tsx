import React from 'react';
import type { LogoConfig } from '../types';

export interface LogoProps {
    logoConfig?: LogoConfig;
    variant?: 'navbar' | 'footer' | 'default';
    customHeight?: number;
    className?: string;
    showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
    logoConfig, 
    variant = 'navbar', 
    customHeight, 
    className = '',
    showTagline = true
}) => {
    // Dynamic height determination: customHeight > logoConfig specific > defaults
    const height = customHeight || (
        variant === 'footer' 
            ? (logoConfig?.footerHeight || 48)
            : (logoConfig?.navbarHeight || 42)
    );

    // Read stored logoConfig if not passed directly
    const effectiveConfig: LogoConfig = logoConfig || (() => {
        try {
            const saved = localStorage.getItem('multishop_fitness_logo');
            if (saved) return JSON.parse(saved);
        } catch {
            // fallback
        }
        return {};
    })();

    const textPrimary = effectiveConfig.textPrimary || 'FITNESS';
    const textSecondary = effectiveConfig.textSecondary || 'SHOP';
    const tagline = effectiveConfig.tagline || 'ELITE FITNESS EQUIPMENT';
    const customLogoUrl = effectiveConfig.logoUrl;

    // If user uploaded a custom logo image in the backoffice
    if (customLogoUrl && customLogoUrl.trim() !== '') {
        return (
            <div 
                className={`inline-flex items-center select-none group cursor-pointer ${className}`}
                style={{ height: `${height}px` }}
            >
                <img 
                    src={customLogoUrl} 
                    alt={`${textPrimary} ${textSecondary}`} 
                    style={{ height: `${height}px`, maxHeight: '100%', width: 'auto' }}
                    className="object-contain group-hover:scale-[1.02] transition-transform duration-200"
                />
            </div>
        );
    }

    // Proportional scaling factor based on 42px baseline
    const scale = height / 42;
    const emblemSize = Math.round(38 * scale);
    const primaryFontSize = Math.max(16, Math.round(22 * scale));
    const taglineFontSize = Math.max(7, Math.round(8 * scale));

    return (
        <div 
            className={`inline-flex items-center gap-2.5 sm:gap-3 select-none group cursor-pointer ${className}`}
            style={{ height: `${height}px` }}
        >
            {/* Capture-Authentic Circular Dumbbell Emblem */}
            <div 
                className="relative shrink-0 flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
                style={{ width: `${emblemSize}px`, height: `${emblemSize}px` }}
            >
                <svg 
                    viewBox="0 0 100 100" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                >
                    {/* Outer Neon Green Ring */}
                    <circle 
                        cx="50" 
                        cy="50" 
                        r="42" 
                        stroke="#84cc16" 
                        strokeWidth="7" 
                        strokeLinecap="round"
                    />

                    {/* Central Dumbbell Bar (Black/Dark) */}
                    <rect x="35" y="44" width="30" height="12" rx="2" fill="#090d16" className="dark:fill-white" />
                    
                    {/* Left Inner Plate (Neon Green) */}
                    <rect x="25" y="28" width="8" height="44" rx="3" fill="#84cc16" />
                    {/* Left Outer Heavy Weight (Black/Dark) */}
                    <rect x="17" y="22" width="7" height="56" rx="3" fill="#090d16" className="dark:fill-zinc-200" />

                    {/* Right Inner Plate (Neon Green) */}
                    <rect x="67" y="28" width="8" height="44" rx="3" fill="#84cc16" />
                    {/* Right Outer Heavy Weight (Black/Dark) */}
                    <rect x="76" y="22" width="7" height="56" rx="3" fill="#090d16" className="dark:fill-zinc-200" />
                </svg>
            </div>

            {/* Brand Typography matching capture */}
            <div className="flex flex-col text-left justify-center leading-none">
                <div 
                    className="font-black italic tracking-tighter uppercase font-sans flex items-center"
                    style={{ fontSize: `${primaryFontSize}px` }}
                >
                    <span className="text-[#090d16] dark:text-white transition-colors">
                        {textPrimary}
                    </span>
                    <span className="text-[#84cc16] ml-1">
                        {textSecondary}
                    </span>
                </div>

                {showTagline && (
                    <span 
                        className="font-extrabold tracking-[0.24em] text-slate-500 dark:text-slate-400 uppercase mt-0.5"
                        style={{ fontSize: `${taglineFontSize}px` }}
                    >
                        {tagline}
                    </span>
                )}
            </div>
        </div>
    );
};

