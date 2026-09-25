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
        const slideInterval = setInterval(nextSlide, 5000);
        return () => clearInterval(slideInterval);
    }, [slides]);


    return (
        <section className="relative h-96 w-full overflow-hidden rounded-lg">
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
                    style={{ opacity: index === currentSlide ? 1 : 0 }}
                >
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${slide.bgImage}')` }} />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-start p-12">
                        <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 transition-all duration-500 transform" style={{ transform: index === currentSlide ? 'translateY(0)' : 'translateY(20px)', opacity: index === currentSlide ? 1 : 0, transitionDelay: '200ms' }}>{slide.title}</h1>
                        <p className="text-lg text-white mb-6 transition-all duration-500 transform" style={{ transform: index === currentSlide ? 'translateY(0)' : 'translateY(20px)', opacity: index === currentSlide ? 1 : 0, transitionDelay: '400ms' }}>{slide.subtitle}</p>
                        <a href="#" className="bg-red-600 text-white font-bold py-3 px-8 rounded-full hover:bg-red-700 transition-all duration-500 transform hover:scale-105" style={{ transform: index === currentSlide ? 'translateY(0)' : 'translateY(20px)', opacity: index === currentSlide ? 1 : 0, transitionDelay: '600ms' }}>
                            {slide.buttonText}
                        </a>
                    </div>
                </div>
            ))}
            
            <button onClick={prevSlide} className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/50 dark:bg-black/50 p-2 rounded-full hover:bg-white/80 dark:hover:bg-black/80 transition-colors z-10" aria-label="Previous Slide">
                <ChevronLeftIcon className="w-6 h-6 text-gray-800 dark:text-white" />
            </button>
            <button onClick={nextSlide} className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/50 dark:bg-black/50 p-2 rounded-full hover:bg-white/80 dark:hover:bg-black/80 transition-colors z-10" aria-label="Next Slide">
                <ChevronRightIcon className="w-6 h-6 text-gray-800 dark:text-white" />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                {slides.map((_, index) => (
                    <button key={index} onClick={() => setCurrentSlide(index)} className={`w-3 h-3 rounded-full transition-all ${currentSlide === index ? 'bg-red-600 scale-125' : 'bg-white/50 dark:bg-white/30'}`} aria-label={`Go to slide ${index + 1}`}/>
                ))}
            </div>
        </section>
    );
};