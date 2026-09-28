
import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, SparklesIcon } from './IconComponents';
import type { HeroSlide } from '../types';

interface HeroSectionProps {
    slides: HeroSlide[];
}

export const HeroSection: React.FC<HeroSectionProps> = ({ slides }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = () => {
        setCurrentSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1));
    };

    useEffect(() => {
        const slideInterval = setInterval(nextSlide, 8000);
        return () => clearInterval(slideInterval);
    }, [slides]);

    if (!slides || slides.length === 0) return null;

    return (
        <section className="relative w-full h-[650px] lg:h-[800px] overflow-hidden bg-slate-100 rounded-[4rem] shadow-3xl mt-6 group">
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-110 z-0'}`}
                >
                    <div 
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url('${slide.bgImage}')` }} 
                    >
                        {/* Overlay Botanique Sombre */}
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/80 via-brand-dark/40 to-transparent"></div>
                    </div>

                    <div className="absolute inset-0 flex items-center px-8 md:px-24">
                        <div className="max-w-4xl relative z-20">
                            <div className="mb-8 inline-flex items-center gap-3 bg-brand-primary text-white text-[10px] font-black tracking-[0.3em] uppercase px-5 py-2.5 rounded-full shadow-2xl">
                                <SparklesIcon className="w-3.5 h-3.5" />
                                Certification Pharmaceutique
                            </div>
                            
                            <h1 
                                className="text-5xl md:text-8xl lg:text-9xl font-serif font-black text-white leading-[1.05] mb-10 tracking-tighter drop-shadow-2xl"
                                dangerouslySetInnerHTML={{ __html: slide.title }}
                            ></h1>
                            
                            <p 
                                className="text-xl md:text-2xl text-slate-100 font-medium mb-14 max-w-2xl leading-relaxed opacity-90 italic"
                                dangerouslySetInnerHTML={{ __html: slide.subtitle }}
                            ></p>
                            
                            <div className="flex flex-wrap gap-6">
                                <a 
                                    href={slide.link || "#"} 
                                    className="inline-flex items-center justify-center bg-white text-brand-primary font-black text-lg py-5 px-16 rounded-[2rem] hover:bg-brand-light transition-all duration-500 shadow-3xl hover:-translate-y-1 uppercase tracking-widest"
                                >
                                    {slide.buttonText}
                                </a>
                                <button className="inline-flex items-center justify-center bg-white/10 backdrop-blur-xl text-white font-bold text-lg py-5 px-16 rounded-[2rem] border border-white/20 hover:bg-white/20 transition-all uppercase tracking-widest">
                                    Nos Experts
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            
            {/* Pagination Zen */}
            <div className="absolute bottom-16 left-24 flex items-center gap-6 z-30">
                {slides.map((_, i) => (
                    <button 
                        key={i} 
                        onClick={() => setCurrentSlide(i)}
                        className={`h-1.5 transition-all duration-700 rounded-full ${i === currentSlide ? 'w-24 bg-brand-primary' : 'w-4 bg-white/30'}`}
                    />
                ))}
            </div>
        </section>
    );
};
