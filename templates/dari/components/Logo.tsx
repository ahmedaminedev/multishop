import React from 'react';
import type { LogoConfig } from '../types';

export interface LogoProps {
    logoConfig?: LogoConfig;
    variant?: 'navbar' | 'footer' | 'default';
    customHeight?: number;
    className?: string;
    showTagline?: boolean;
    onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({ 
    logoConfig, 
    variant = 'navbar', 
    customHeight, 
    className = '',
    showTagline = true,
    onClick
}) => {
    // Dynamic height determination: customHeight > logoConfig specific > defaults
    const height = customHeight || (
        variant === 'footer' 
            ? (logoConfig?.footerHeight || 50)
            : (logoConfig?.navbarHeight || 44)
    );

    // Read stored logoConfig if not passed directly
    const effectiveConfig: LogoConfig = logoConfig || (() => {
        try {
            const saved = localStorage.getItem('multishop_dari_logo');
            if (saved) return JSON.parse(saved);
        } catch {
            // fallback
        }
        return {};
    })();

    const textPrimary = effectiveConfig.textPrimary || 'Dari';
    const textSecondary = effectiveConfig.textSecondary || 'Shop';
    const tagline = effectiveConfig.tagline || 'Maison & Décoration';
    const customLogoUrl = effectiveConfig.logoUrl;

    // If user uploaded a custom logo image in the backoffice
    if (customLogoUrl && customLogoUrl.trim() !== '') {
        return (
            <div 
                onClick={onClick}
                className={`inline-flex items-center select-none group cursor-pointer ${className}`}
                style={{ height: `${height}px` }}
            >
                <img 
                    src={customLogoUrl} 
                    alt={`${textPrimary}${textSecondary}`} 
                    draggable={false}
                    style={{ height: `${height}px`, maxHeight: '100%', width: 'auto', userSelect: 'none' }}
                    className="object-contain group-hover:scale-[1.02] transition-transform duration-200 pointer-events-none"
                />
            </div>
        );
    }

    // Proportional scaling factor based on 44px baseline
    const scale = height / 44;
    const emblemSize = Math.round(44 * scale);
    const primaryFontSize = Math.max(18, Math.round(24 * scale));
    const taglineFontSize = Math.max(8, Math.round(9.5 * scale));

    return (
        <div 
            onClick={onClick}
            className={`inline-flex items-center gap-2.5 sm:gap-3 select-none group cursor-pointer ${className}`}
            style={{ height: `${height}px` }}
        >
            {/* Exact Architectural House Emblem from Capture */}
            <div 
                className="relative shrink-0 flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
                style={{ width: `${emblemSize}px`, height: `${emblemSize}px` }}
            >
                <svg 
                    viewBox="0 0 100 85" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full drop-shadow-xs"
                >
                    {/* Left Roof Gable & Warm Terracotta Wooden Siding Steps */}
                    <path d="M12 52 L42 16 L48 24 L22 56 Z" fill="#b87333" />
                    <rect x="25" y="44" width="22" height="4" rx="1" fill="#b87333" />
                    <rect x="23" y="52" width="26" height="4" rx="1" fill="#b87333" />
                    <rect x="21" y="60" width="30" height="4" rx="1" fill="#b87333" />
                    
                    {/* Window Quad Inset in Terracotta */}
                    <rect x="36" y="46" width="6" height="6" rx="1" fill="#e8984a" />
                    <rect x="44" y="46" width="6" height="6" rx="1" fill="#e8984a" />
                    <rect x="36" y="54" width="6" height="6" rx="1" fill="#e8984a" />
                    <rect x="44" y="54" width="6" height="6" rx="1" fill="#e8984a" />

                    {/* Right Roof Gable & Chimney / Main Structure in Deep Forest Green */}
                    <path d="M42 16 L88 54 L81 61 L42 27 L42 16 Z" fill="#0f3e37" />
                    <path d="M68 28 V16 H76 V35 Z" fill="#0f3e37" />
                    
                    {/* Right Wall & Ground Foundation in Deep Forest Green */}
                    <path d="M78 54 V72 H20 V76 H86 V54 H78 Z" fill="#0f3e37" />
                    <rect x="62" y="50" width="16" height="20" rx="1" fill="#0f3e37" />
                </svg>
            </div>

            {/* Brand Typography matching capture */}
            <div className="flex flex-col justify-center leading-none">
                <div 
                    className="font-black tracking-tight leading-none flex items-center"
                    style={{ fontSize: `${primaryFontSize}px` }}
                >
                    <span className="text-[#0f3e37] dark:text-emerald-400 font-extrabold tracking-tight">
                        {textPrimary}
                    </span>
                    <span className="text-[#b87333] font-extrabold tracking-tight">
                        {textSecondary}
                    </span>
                </div>
                {showTagline && (
                    <div 
                        className="font-medium text-[#0f3e37] dark:text-emerald-300 mt-1 whitespace-nowrap tracking-normal"
                        style={{ fontSize: `${taglineFontSize}px` }}
                    >
                        {tagline}
                    </div>
                )}
            </div>
        </div>
    );
};
