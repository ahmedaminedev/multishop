
import React, { useState, useEffect } from 'react';
import type { AudioPromoAd } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './IconComponents';

interface AudioPromoBannerProps {
    ads: AudioPromoAd[];
}

export const AudioPromoBanner: React.FC<AudioPromoBannerProps> = ({ ads }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % ads.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length);
    };

    useEffect(() => {
        if (!ads || ads.length <= 1) return;
        const currentAdDuration = (ads[currentIndex]?.duration || 8) * 1000;
        const timer = setTimeout(nextSlide, currentAdDuration);
        return () => clearTimeout(timer);
    }, [currentIndex, ads]);

    if (!ads || ads.length === 0) {
        return null;
    }

    const ad = ads[currentIndex];

    return (
        <section className="my-16 relative shadow-xl overflow-hidden group mx-auto max-w-screen-2xl">
            <div className="flex flex-col md:flex-row min-h-[500px]">
                {/* Left Side: Editorial Text Content */}
                <div className="w-full md:w-1/2 bg-white dark:bg-gray-900 flex flex-col justify-center items-center text-center p-12 z-10 relative">
                    <div key={ad.id} className="animate-fade-in-up max-w-md">
                        {/* Artistic Serif Typography */}
                        <h3 
                            className="font-serif italic text-3xl text-gray-500 dark:text-gray-400 mb-3 tracking-wide"
                            dangerouslySetInnerHTML={{ __html: ad.subtitle1 }}
                        >
                        </h3>
                        
                        <h2 
                            className="font-serif text-5xl md:text-6xl text-gray-900 dark:text-white mb-6 leading-tight"
                            dangerouslySetInnerHTML={{ __html: ad.title }}
                        >
                        </h2>
                        
                        <div className="w-16 h-px bg-gray-300 dark:bg-gray-700 mx-auto mb-8"></div>

                        <p 
                            className="font-sans text-gray-600 dark:text-gray-300 mb-10 text-lg font-light tracking-wide leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: ad.subtitle2 }}
                        >
                        </p>
                        
                        <button className="bg-black dark:bg-white text-white dark:text-black uppercase text-xs font-bold tracking-[0.2em] py-4 px-12 hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-300 shadow-lg transform hover:scale-105">
                            Découvrir
                        </button>
                    </div>
                </div>

                {/* Right Side: Full Bleed Image */}
                <div className="w-full md:w-1/2 relative min-h-[400px] md:min-h-full overflow-hidden">
                    <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800">
                        <img
                            key={ad.image}
                            src={ad.image}
                            alt={ad.title}
                            className="w-full h-full object-cover transition-transform duration-[3000ms] ease-out hover:scale-105 animate-fadeIn"
                        />
                    </div>
                </div>
            </div>

            {/* Navigation Arrows (Absolute positioned across the whole section) */}
            {ads.length > 1 && (
                <>
                    <button 
                        onClick={prevSlide}
                        className="absolute top-1/2 left-4 md:left-8 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/80 hover:bg-white text-black transition-all rounded-full shadow-lg z-20 backdrop-blur-sm hover:scale-110"
                        aria-label="Previous slide"
                    >
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <button 
                        onClick={nextSlide}
                        className="absolute top-1/2 right-4 md:right-8 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/80 hover:bg-white text-black transition-all rounded-full shadow-lg z-20 backdrop-blur-sm hover:scale-110"
                        aria-label="Next slide"
                    >
                        <ChevronRightIcon className="w-6 h-6" />
                    </button>
                </>
            )}
            
            {/* Pagination Dots */}
            {ads.length > 1 && (
                <div className="absolute bottom-6 left-1/2 md:left-1/4 -translate-x-1/2 flex space-x-3 z-20">
                    {ads.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`h-1.5 rounded-full transition-all duration-500 ${currentIndex === index ? 'w-8 bg-black dark:bg-white' : 'w-2 bg-gray-300 dark:bg-gray-600'}`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};
