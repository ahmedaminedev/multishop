
import React from 'react';
import type { CollageItem } from '../types';
import { ArrowUpRightIcon } from './IconComponents';

interface EditorialMasonryProps {
    items: CollageItem[];
    isPreview?: boolean;
}

export const EditorialMasonry: React.FC<EditorialMasonryProps> = ({ items, isPreview = false }) => {
    // Si aucun item, on n'affiche rien
    if (!items || items.length === 0) return null;

    // Définition des classes de grille en fonction de la taille
    const getSizeClasses = (size: string) => {
        switch (size) {
            case 'large': // Grand carré (2x2)
                return 'col-span-2 row-span-2 aspect-square';
            case 'tall': // Haut (1x2)
                return 'col-span-1 row-span-2 h-full';
            case 'wide': // Large (2x1)
                return 'col-span-2 row-span-1 aspect-[2/1]';
            case 'small': // Petit carré (1x1)
            default:
                return 'col-span-1 row-span-1 aspect-square';
        }
    };

    const WrapperComponent = isPreview ? 'div' : 'a';

    return (
        <section className={`my-16 max-w-screen-2xl mx-auto ${!isPreview ? 'px-4 sm:px-6 lg:px-8' : ''}`}>
            {!isPreview && (
                <div className="mb-10 text-center">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                        Éditorial Beauté
                    </h2>
                    <p className="mt-2 text-gray-500 font-light italic">Inspirations et tendances du moment</p>
                </div>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)]">
                {items.map((item) => (
                    <WrapperComponent
                        key={item.id}
                        href={isPreview ? undefined : item.link}
                        className={`relative group overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 ${getSizeClasses(item.size)} block shadow-sm hover:shadow-lg transition-shadow duration-300`}
                    >
                        <img
                            src={item.imageUrl}
                            alt={item.title || 'Collage image'}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                        />
                        
                        {/* Overlay Gradient - Plus prononcé et toujours visible */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>

                        {/* Content - Toujours visible et stylisé */}
                        <div className="absolute bottom-0 left-0 p-5 sm:p-8 w-full flex flex-col justify-end h-full z-20">
                            {item.subtitle && (
                                <p 
                                    className="text-xs font-bold text-rose-200 uppercase tracking-[0.2em] mb-2 drop-shadow-md translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
                                    dangerouslySetInnerHTML={{ __html: item.subtitle }}
                                >
                                </p>
                            )}
                            {item.title && (
                                <h3 
                                    className="text-2xl md:text-4xl font-serif font-extrabold text-white leading-none drop-shadow-lg tracking-tight mb-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-75"
                                    dangerouslySetInnerHTML={{ __html: item.title }}
                                >
                                </h3>
                            )}
                            
                            {/* Bouton "Découvrir" qui apparait au survol */}
                            <div className="h-0 opacity-0 group-hover:opacity-100 group-hover:h-auto overflow-hidden transition-all duration-300 ease-in-out">
                                <div className="flex items-center text-white text-sm font-bold uppercase tracking-wider mt-4 pt-2 border-t border-white/30">
                                    <span>Découvrir</span>
                                    <ArrowUpRightIcon className="w-5 h-5 ml-2" />
                                </div>
                            </div>
                        </div>
                    </WrapperComponent>
                ))}
            </div>
        </section>
    );
};
