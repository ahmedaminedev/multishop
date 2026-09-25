
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
        const slideInterval = setInterval(nextSlide, 7000);
        return () => clearInterval(slideInterval);
    }, [slides]);

    if (!slides || slides.length === 0) return null;

    return (
        <section className="relative w-full h-[600px] lg:h-[800px] overflow-hidden bg-brand-black text-white group">
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                    {/* Background with Parallax effect */}
                    <div 
                        className={`absolute inset-0 bg-cover bg-center transition-transform duration-[7000ms] ease-linear ${index === currentSlide ? 'scale-110' : 'scale-100'}`}
                        style={{ backgroundImage: `url('${slide.bgImage}')` }} 
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent"></div>
                        {/* Carbon Texture Overlay */}
                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                    </div>

                    <div className="absolute inset-0 flex items-center px-6 md:px-24">
                        <div className="max-w-5xl relative z-20">
                            {/* Decorative Slant Line */}
                            <div className="w-16 h-1 bg-brand-neon mb-6 slant"></div>
                            
                            <h1 
                                className="text-6xl md:text-9xl font-serif font-black italic uppercase leading-[0.8] tracking-tighter mb-6 animate-fadeInUp"
                                style={{ transitionDelay: '200ms' }}
                                dangerouslySetInnerHTML={{ __html: slide.title }}
                            ></h1>
                            
                            <p 
                                className="text-lg md:text-2xl text-gray-300 font-sans font-medium uppercase tracking-[0.3em] mb-10 max-w-xl border-l-4 border-brand-neon pl-6 animate-fadeInUp"
                                style={{ transitionDelay: '400ms' }}
                                dangerouslySetInnerHTML={{ __html: slide.subtitle }}
                            ></p>
                            
                            <a 
                                href={slide.link || "#"} 
                                className="inline-block bg-brand-neon text-black font-black text-xl py-5 px-12 uppercase slant hover:bg-white transition-all duration-300 shadow-[0_0_20px_rgba(204,255,0,0.3)] animate-fadeInUp"
                                style={{ transitionDelay: '600ms' }}
                            >
                                <span className="slant-reverse block">
                                    {slide.buttonText}
                                </span>
                            </a>
                        </div>
                    </div>
                </div>
            ))}
            
            {/* Minimalist Controls */}
            <div className="absolute bottom-12 right-12 flex gap-4 z-30">
                <button onClick={prevSlide} className="w-12 h-12 border border-white/20 hover:border-brand-neon hover:text-brand-neon flex items-center justify-center transition-all bg-black/40 backdrop-blur-md">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <button onClick={nextSlide} className="w-12 h-12 border border-white/20 hover:border-brand-neon hover:text-brand-neon flex items-center justify-center transition-all bg-black/40 backdrop-blur-md">
                    <ChevronRightIcon className="w-6 h-6" />
                </button>
            </div>

            {/* Dash Indicators */}
            <div className="absolute bottom-12 left-12 flex gap-3 z-30">
                {slides.map((_, index) => (
                    <button 
                        key={index} 
                        onClick={() => setCurrentSlide(index)} 
                        className={`h-1 transition-all duration-500 ${currentSlide === index ? 'w-12 bg-brand-neon' : 'w-4 bg-gray-600'}`}
                    />
                ))}
            </div>
        </section>
    );
};
