
import React from 'react';
import { SparklesIcon, ArrowUpRightIcon } from './IconComponents';
import type { VirtualTryOnConfig, VirtualTryOnImage } from '../types';

interface VirtualTryOnSectionProps {
    config?: VirtualTryOnConfig;
}

export const VirtualTryOnSection: React.FC<VirtualTryOnSectionProps> = ({ config }) => {
    const title = config?.title || "VOTRE OBJECTIF ?";
    const description = config?.description || "Découvrez les compléments adaptés à votre morphologie et vos buts.";
    const buttonText = config?.buttonText || "FAIRE LE QUIZ";
    const link = config?.link || "#";
    
    // Helper to normalize image config
    const normalizeImageConfig = (img?: VirtualTryOnImage | string): VirtualTryOnImage => {
        if (!img) return { url: '', scale: 100, top: 0, rotation: 0 };
        if (typeof img === 'string') return { url: img, scale: 100, top: 0, rotation: 0 };
        return img;
    };

    const leftImg = normalizeImageConfig(config?.imageLeft);
    const rightImg = normalizeImageConfig(config?.imageRight);

    // Default fallbacks aligned with Gym/Fitness theme
    const leftUrl = leftImg.url || "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=800&auto=format&fit=crop"; // Weights
    const rightUrl = rightImg.url || "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop"; // Athlete

    return (
        <section className="relative w-full py-24 my-16 bg-[#050505] overflow-hidden border-y border-gray-800">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
            
            {/* Ambient Neon Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-neon/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-screen-2xl mx-auto relative z-10 h-full flex flex-col md:flex-row items-center justify-between px-4 sm:px-6 lg:px-8 gap-12">
                
                {/* Left Image Block - Skewed */}
                <div className="hidden md:block w-1/3 h-[400px] relative group">
                    <div className="absolute inset-0 transform -skew-x-12 overflow-hidden border border-gray-800 rounded-sm">
                        <img 
                            src={leftUrl} 
                            alt="Objectif Musculation" 
                            className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700 scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent"></div>
                    </div>
                    {/* Floating Label */}
                    <div className="absolute bottom-10 left-0 bg-brand-neon text-black px-4 py-1 text-[10px] font-black uppercase tracking-widest transform -skew-x-12 shadow-lg">
                        <span className="skew-x-12 block">Performance</span>
                    </div>
                </div>

                {/* Center Content */}
                <div className="w-full md:w-1/3 text-center flex flex-col items-center justify-center relative">
                    <div className="mb-6 inline-flex items-center gap-2 border border-brand-neon/30 px-4 py-1.5 rounded-full bg-brand-neon/5">
                        <SparklesIcon className="w-4 h-4 text-brand-neon animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-neon">Intelligence Artificielle</span>
                    </div>

                    <h2 
                        className="text-5xl lg:text-7xl font-serif font-black text-white uppercase italic tracking-tighter mb-6 leading-none drop-shadow-2xl"
                        dangerouslySetInnerHTML={{ __html: title }}
                    >
                    </h2>
                    
                    <div className="w-24 h-1 bg-gray-800 mb-8"></div>

                    <p 
                        className="text-gray-400 font-mono text-sm md:text-base leading-relaxed mb-10 max-w-sm"
                        dangerouslySetInnerHTML={{ __html: description }}
                    >
                    </p>
                    
                    <a 
                        href={link}
                        className="group relative inline-flex items-center justify-center px-8 py-4 bg-transparent overflow-hidden transition-all duration-300 transform hover:-translate-y-1"
                    >
                        <span className="absolute inset-0 w-full h-full bg-brand-neon skew-x-[-12deg]"></span>
                        <span className="absolute inset-0 w-full h-full bg-white skew-x-[-12deg] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                        
                        <div className="relative flex items-center gap-3">
                            <span className="font-black uppercase tracking-[0.2em] text-xs text-black group-hover:text-black transition-colors">
                                {buttonText}
                            </span>
                            <ArrowUpRightIcon className="w-4 h-4 text-black" />
                        </div>
                    </a>
                </div>

                {/* Right Image Block - Skewed Reverse */}
                <div className="hidden md:block w-1/3 h-[400px] relative group">
                    <div className="absolute inset-0 transform skew-x-12 overflow-hidden border border-gray-800 rounded-sm">
                        <img 
                            src={rightUrl} 
                            alt="Objectif Fitness" 
                            className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700 scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-transparent to-transparent"></div>
                    </div>
                     {/* Floating Label */}
                     <div className="absolute top-10 right-0 bg-white text-black px-4 py-1 text-[10px] font-black uppercase tracking-widest transform skew-x-12 shadow-lg">
                        <span className="-skew-x-12 block">Endurance</span>
                    </div>
                </div>

            </div>
        </section>
    );
};
