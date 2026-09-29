import React, { useState, useEffect } from 'react';
import type { AudioPromoAd } from '../types';

interface AudioPromoBannerProps {
    ads: AudioPromoAd[];
}

export const AudioPromoBanner: React.FC<AudioPromoBannerProps> = ({ ads }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!ads || ads.length <= 1) return;
        const currentAdDuration = (ads[currentIndex]?.duration || 8) * 1000;
        const timer = setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % ads.length);
        }, currentAdDuration);
        return () => clearTimeout(timer);
    }, [currentIndex, ads]);

    if (!ads || ads.length === 0) {
        return null;
    }

    return (
        <section className="my-12 relative rounded-lg overflow-hidden h-60 md:h-72 shadow-lg hover:shadow-xl transition-shadow duration-300">
            {ads.map((ad, index) => {
                const isActive = index === currentIndex;
                return (
                    <a href="#" key={ad.id} className={`audio-promo-slide p-8 flex items-center bg-gradient-to-r ${ad.background} ${isActive ? 'active' : ''}`}>
                        <div className="relative z-10 w-full md:w-1/2 text-white">
                            <p className="text-5xl md:text-6xl font-extrabold leading-tight ap-animated-item ap-title">
                                {ad.title}
                            </p>
                            <h3 className="text-2xl md:text-3xl font-semibold mt-2 ap-animated-item ap-subtitle1">
                                {ad.subtitle1}
                            </h3>
                            <p className="text-xl md:text-2xl font-light ap-animated-item ap-subtitle2">
                                {ad.subtitle2}
                            </p>
                        </div>
                        <div className="absolute right-0 top-0 h-full w-full md:w-3/5 overflow-hidden">
                            <img
                                src={ad.image}
                                alt={ad.subtitle1}
                                className="absolute right-0 bottom-0 h-auto w-full max-w-lg object-contain ap-animated-item ap-image opacity-30 md:opacity-100"
                            />
                        </div>
                    </a>
                );
            })}
             {ads.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
                    {ads.map((_, index) => (
                        <button key={index} onClick={() => setCurrentIndex(index)} className={`w-3 h-3 rounded-full transition-all duration-300 ${currentIndex === index ? 'bg-white scale-125' : 'bg-white/50'}`} aria-label={`Go to ad ${index + 1}`} />
                    ))}
                </div>
            )}
        </section>
    );
};