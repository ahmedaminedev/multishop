
import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './IconComponents';
import type { HeroSlide } from '../types';

interface HeroSectionProps {
    slides: HeroSlide[];
}

export const HeroSection: React.FC<HeroSectionProps> = ({ slides }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = () => {
        setCurrentSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1));
    };
    
    useEffect(() => {
        const slideInterval = setInterval(nextSlide, 6000); // Slower for elegance
        return () => clearInterval(slideInterval);
    }, [slides]);


    return (
        <section className="relative h-[500px] lg:h-[600px] w-full overflow-hidden rounded-2xl shadow-xl mx-auto my-6 bg-gray-100 dark:bg-gray-800">
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
                    style={{ opacity: index === currentSlide ? 1 : 0, zIndex: index === currentSlide ? 1 : 0 }}
                >
                    {/* Background Media (Image or Video) */}
                    {slide.videoUrl ? (
                        <video
                            src={slide.videoUrl}
                            poster={slide.bgImage}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover transform scale-105"
                        />
                    ) : (
                        <div 
                            className="absolute inset-0 bg-cover bg-center transform transition-transform duration-[10000ms] scale-105" 
                            style={{ backgroundImage: `url('${slide.bgImage}')` }} 
                        />
                    )}

                    {/* Gradient Overlay & Content */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex flex-col justify-center items-start p-12 lg:p-24">
                        <div className="max-w-2xl animate-fade-in-up">
                            <h1 
                                className="text-5xl lg:text-7xl font-serif font-bold text-white mb-6 leading-tight drop-shadow-md tracking-wide" 
                                style={{ opacity: index === currentSlide ? 1 : 0, transform: index === currentSlide ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s ease 0.2s' }}
                                dangerouslySetInnerHTML={{ __html: slide.title }}
                            >
                            </h1>
                            <p 
                                className="text-xl lg:text-2xl text-white/90 mb-8 font-light tracking-wide" 
                                style={{ opacity: index === currentSlide ? 1 : 0, transform: index === currentSlide ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s ease 0.4s' }}
                                dangerouslySetInnerHTML={{ __html: slide.subtitle }}
                            >
                            </p>
                            <a 
                                href={slide.link || "#"} 
                                className="inline-block bg-white text-gray-900 font-semibold py-4 px-10 rounded-full hover:bg-rose-50 transition-all duration-300 transform hover:scale-105 shadow-lg tracking-wider uppercase text-sm cursor-pointer z-50" 
                                style={{ opacity: index === currentSlide ? 1 : 0, transform: index === currentSlide ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s ease 0.6s' }}
                            >
                                {slide.buttonText}
                            </a>
                        </div>
                    </div>
                </div>
            ))}
            
            <button onClick={prevSlide} className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md p-3 rounded-full text-white transition-all z-20 border border-white/30">
                <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button onClick={nextSlide} className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md p-3 rounded-full text-white transition-all z-20 border border-white/30">
                <ChevronRightIcon className="w-6 h-6" />
            </button>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
                {slides.map((_, index) => (
                    <button 
                        key={index} 
                        onClick={() => setCurrentSlide(index)} 
                        className={`h-1 rounded-full transition-all duration-500 ${currentSlide === index ? 'w-12 bg-white' : 'w-4 bg-white/50'}`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </section>
    );
};
