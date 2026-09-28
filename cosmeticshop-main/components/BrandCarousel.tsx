
import React from 'react';
import type { Brand } from '../types';
import { SparklesIcon } from './IconComponents';
import CircularGallery from './CircularGallery';
import { useTheme } from './ThemeContext';

interface BrandCarouselProps {
    brands: Brand[];
}

export const BrandCarousel: React.FC<BrandCarouselProps> = ({ brands }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Transformation des marques pour la galerie
    const galleryItems = brands.map(b => ({
        image: b.logoUrl,
        text: b.name
    }));

    return (
        <section className="relative py-12 bg-gradient-to-b from-white via-rose-50/30 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 overflow-hidden">
            
            {/* Header Éditorial */}
            <div className="text-center mb-8 relative z-10 px-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-gray-800 border border-rose-100 dark:border-gray-700 shadow-sm mb-3 animate-fadeIn">
                    <SparklesIcon className="w-3 h-3 text-rose-500" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                        Confiance & Authenticité
                    </span>
                </div>
                <h2 className="text-2xl md:text-4xl font-serif font-medium text-gray-900 dark:text-white mb-2 tracking-tight">
                    Nos Maisons <span className="italic text-rose-500">Partenaires</span>
                </h2>
            </div>

            {/* Conteneur de la galerie 3D */}
            <div className="relative w-full h-[350px]">
                {/* Overlay SEO-friendly caché */}
                <div className="sr-only">
                    {brands.map(b => <span key={b.id}>{b.name}</span>)}
                </div>

                <CircularGallery 
                    items={galleryItems}
                    bend={3} // Courbure accentuée pour effet 3D moderne
                    textColor={isDark ? '#e5e7eb' : '#374151'} 
                    borderRadius={0.08}
                    scrollEase={0.08}
                    scrollSpeed={3}
                    font={'bold 24px "Playfair Display", serif'}
                    imageFit="contain" // Force le mode contain pour les logos
                    circular={true} // Active le mode carte circulaire
                    itemSize={500} // Augmenté de 300 à 450 pour agrandir les cartes
                />
            </div>
        </section>
    );
};
