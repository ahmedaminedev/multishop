
import React, { useState, useEffect } from 'react';
import type { DestockageAd } from '../types';

interface DestockageCarouselProps {
    ads: DestockageAd[];
}

export const DestockageCarousel: React.FC<DestockageCarouselProps> = ({ ads }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (ads.length <= 1) return;

        const currentAdDuration = (ads[currentIndex]?.duration || 10) * 1000;
        
        const timer = setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % ads.length);
        }, currentAdDuration);

        return () => clearTimeout(timer);
    }, [currentIndex, ads]);

    if (!ads || ads.length === 0) {
        return null;
    }

    return (
        <section className="my-12 relative rounded-lg overflow-hidden bg-red-600 h-auto md:h-80 shadow-lg hover:shadow-xl transition-shadow duration-300">
             <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/confetti.png')" }}></div>

            {ads.map((ad, index) => {
                const isActive = index === currentIndex;
                return (
                    <a href="#" key={ad.id} className={`destockage-slide absolute inset-0 p-8 flex flex-col md:flex-row items-center text-white ${isActive ? 'slide-active' : ''}`}>
                        <div className="relative z-10 w-full md:w-1/3 text-center md:text-left mb-6 md:mb-0 animated-item animated-text">
                            <h2 className="text-4xl md:text-5xl font-extrabold uppercase tracking-wider">{ad.mainTitle}</h2>
                            <p className="text-2xl md:text-3xl font-semibold mt-2">{ad.subTitle}</p>
                            <div className="mt-4 inline-flex flex-col items-center bg-white text-red-600 px-4 py-2 rounded-lg shadow-md">
                                <span className="text-5xl font-bold leading-none">{ad.price}</span>
                                <span className="text-lg font-bold line-through text-gray-500">{ad.oldPrice}</span>
                            </div>
                        </div>

                        <div className="relative z-10 flex-1 h-64 md:h-full flex items-center justify-around gap-4">
                            {ad.images.map((image, imgIndex) => (
                                <img 
                                    key={imgIndex}
                                    src={image.src}
                                    alt={image.alt}
                                    className={`object-contain drop-shadow-lg h-16 md:h-20 animated-item animated-image animated-image-${imgIndex + 1} ${imgIndex === 1 ? 'h-28 md:h-36' : ''} ${imgIndex === 2 ? 'h-40 md:h-56' : ''}`}
                                />
                            ))}
                        </div>
                        <div className="absolute right-0 bottom-0 z-0 hidden lg:block animated-item animated-chef">
                            <img src={ad.chefImage} alt="chef" className="h-80 opacity-90 object-contain mix-blend-luminosity"/>
                        </div>
                    </a>
                );
            })}

            {ads.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
                    {ads.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${currentIndex === index ? 'bg-white scale-125' : 'bg-white/50'}`}
                            aria-label={`Go to ad ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};
