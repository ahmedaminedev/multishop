
import React from 'react';
import type { Brand } from '../types';

interface BrandCarouselProps {
    brands: Brand[];
}

export const BrandCarousel: React.FC<BrandCarouselProps> = ({ brands }) => {
    // Si pas de marques, on utilise des placeholders pour l'effet visuel
    const displayBrands = brands.length > 0 ? brands : Array(10).fill({ id: 0, name: 'Brand', logoUrl: '' });
    
    // On duplique la liste pour assurer un défilement infini sans coupure
    const marqueeBrands = [...displayBrands, ...displayBrands, ...displayBrands];

    return (
        <section className="py-16 border-y border-gray-100 dark:border-gray-800 bg-white dark:bg-brand-black overflow-hidden relative">
            {/* Titre Vertical (Optionnel, style magazine) */}
            <div className="absolute left-0 top-0 h-full w-12 bg-brand-neon z-20 flex items-center justify-center hidden md:flex">
                <span className="transform -rotate-90 text-black font-black tracking-widest text-xs uppercase whitespace-nowrap">
                    Partenaires Officiels
                </span>
            </div>

            <div className="relative w-full max-w-[1920px] mx-auto">
                <div className="flex animate-marquee hover:[animation-play-state:paused] items-center">
                    {marqueeBrands.map((brand, index) => (
                        <div 
                            key={`${brand.id}-${index}`} 
                            className="flex-shrink-0 mx-8 md:mx-16 w-32 md:w-40 opacity-50 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0 cursor-pointer"
                        >
                            {brand.logoUrl ? (
                                <img 
                                    src={brand.logoUrl} 
                                    alt={brand.name} 
                                    className="w-full h-auto object-contain max-h-20"
                                    loading="lazy"
                                />
                            ) : (
                                <span className="text-2xl font-serif font-bold text-gray-400 uppercase">{brand.name}</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Fade Gradients for smooth edges */}
            <div className="absolute top-0 left-0 w-20 md:w-40 h-full bg-gradient-to-r from-white dark:from-brand-black to-transparent z-10"></div>
            <div className="absolute top-0 right-0 w-20 md:w-40 h-full bg-gradient-to-l from-white dark:from-brand-black to-transparent z-10"></div>
        </section>
    );
};
