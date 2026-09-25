import React from 'react';
import type { ImagePromoAd } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './IconComponents';

interface ImagePromoCarouselProps {
    ads: ImagePromoAd[];
    isPreview?: boolean;
}

export const SmallPromoBanners: React.FC<ImagePromoCarouselProps> = ({ ads, isPreview = false }) => {
    const scrollRef = React.useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            // Scroll by one item width + gap
            const scrollAmount = (clientWidth / 3);
            const scrollTo = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };
    
    const WrapperComponent = isPreview ? 'div' : 'a';

    return (
        <section className="my-12 relative group">
            <div ref={scrollRef} className="flex space-x-8 overflow-x-auto pb-2 no-scrollbar">
                {ads.map(ad => (
                    <div key={ad.id} className="flex-shrink-0 w-[calc(100%-2rem)] sm:w-[calc(50%-1rem)] md:w-[calc(33.333%-1.333rem)]">
                         <WrapperComponent 
                            href={isPreview ? undefined : ad.link} 
                            className={`block rounded-lg overflow-hidden shadow-lg transition-all duration-300 ${!isPreview ? 'hover:shadow-2xl hover:-translate-y-1' : ''}`}
                         >
                            <img 
                                src={ad.imageUrl} 
                                alt={ad.altText}
                                className="w-full h-auto aspect-square object-cover"
                            />
                        </WrapperComponent>
                    </div>
                ))}
            </div>
            <button onClick={() => scroll('left')} className="absolute top-1/2 left-0 -translate-y-1/2 bg-white dark:bg-gray-700 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:scale-110 active:scale-95" aria-label="Scroll left">
                <ChevronLeftIcon className="w-6 h-6 text-gray-800 dark:text-gray-200" />
            </button>
            <button onClick={() => scroll('right')} className="absolute top-1/2 right-0 -translate-y-1/2 bg-white dark:bg-gray-700 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:scale-110 active:scale-95" aria-label="Scroll right">
                <ChevronRightIcon className="w-6 h-6 text-gray-800 dark:text-gray-200" />
            </button>
        </section>
    );
};
