import React from 'react';
import type { Brand } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './IconComponents';

interface BrandCarouselProps {
    brands: Brand[];
}

export const BrandCarousel: React.FC<BrandCarouselProps> = ({ brands }) => {
    const scrollRef = React.useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollAmount = clientWidth * 0.7;
            const scrollTo = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    return (
        <section className="my-12">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Nos Marques Partenaires</h2>
                <div className="flex items-center space-x-2">
                    <button onClick={() => scroll('left')} className="p-2 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" aria-label="Scroll left">
                        <ChevronLeftIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    </button>
                    <button onClick={() => scroll('right')} className="p-2 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" aria-label="Scroll right">
                        <ChevronRightIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    </button>
                </div>
            </div>
            <div ref={scrollRef} className="flex items-center space-x-12 overflow-x-auto p-4 no-scrollbar">
                {brands.map(brand => (
                    <a href="#" key={brand.name} className="flex-shrink-0">
                        <img 
                            src={brand.logoUrl} 
                            alt={`${brand.name} logo`}
                            className="h-14 object-contain filter grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300 dark:invert-[.85] dark:hover:invert-0" 
                        />
                    </a>
                ))}
            </div>
        </section>
    );
};