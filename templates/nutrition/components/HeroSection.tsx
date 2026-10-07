import React from 'react';
import { Truck, ShieldCheck, Headphones, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import type { FitnessHomeHeroConfig } from '../types';

interface HeroSectionProps {
    onExplore?: () => void;
    config?: FitnessHomeHeroConfig;
    slides?: any;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExplore, config }) => {
    const badge = config?.badge || 'ÉQUIPEMENT DE MUSCULATION';
    const title = config?.title || 'ATTEINS TES';
    const titleHighlight = config?.titleHighlight || 'OBJECTIFS';
    const description = config?.description || 'Matériel de sport de qualité pour un entraînement plus efficace et plus motivant.';
    const buttonText = config?.buttonText || 'Découvrir la collection';
    const bgImage = config?.bgImage || '/src/assets/images/hero_fitness_athlete_1790951585544.jpg';
    const calligraphyTop = config?.calligraphyTop || 'Plus fort';
    const calligraphyBottom = config?.calligraphyBottom || 'chaque jour';

    return (
        <section className="relative w-full bg-[#0a0d14] text-white overflow-hidden font-sans">
            {/* Background Image Container with athlete */}
            <div className="relative w-full min-h-[460px] sm:min-h-[520px] lg:min-h-[580px] flex items-center">
                
                {/* Background image with dramatic lighting */}
                <div 
                    className="absolute inset-0 bg-cover bg-right md:bg-center transition-all duration-500"
                    style={{ 
                        backgroundImage: `url('${bgImage}')`
                    }}
                >
                    {/* Dark gradient overlay for text readability on left */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0a0d14] via-[#0a0d14]/85 md:via-[#0a0d14]/70 to-transparent"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 w-full z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        
                        {/* Left Column: Headline and Call-to-Action */}
                        <div className="lg:col-span-7 space-y-4 sm:space-y-6">
                            <span className="inline-block text-[11px] sm:text-xs font-black tracking-[0.25em] uppercase text-slate-300">
                                {badge}
                            </span>

                            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.9] text-white">
                                {title}<br />
                                <span className="text-[#84cc16]">{titleHighlight}</span>
                            </h1>

                            <p className="text-sm sm:text-base text-slate-300 max-w-lg font-medium leading-relaxed">
                                {description}
                            </p>

                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={() => onExplore?.()}
                                    className="px-6 sm:px-8 py-3.5 bg-[#84cc16] hover:bg-[#72b012] text-black font-extrabold text-sm rounded-lg inline-flex items-center gap-2 shadow-lg shadow-[#84cc16]/20 transition-all hover:translate-x-1 cursor-pointer"
                                >
                                    <span>{buttonText}</span>
                                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                                </button>
                            </div>

                            {/* 3 Value propositions below CTA */}
                            <div className="pt-6 sm:pt-10 flex flex-wrap items-center gap-6 sm:gap-8 text-xs text-slate-300 border-t border-white/10">
                                <div className="flex items-center gap-2.5">
                                    <Truck className="w-5 h-5 text-[#84cc16] shrink-0" />
                                    <div className="flex flex-col leading-tight">
                                        <span className="font-bold text-white">Livraison rapide</span>
                                        <span className="text-[10px] text-slate-400">partout en Tunisie</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2.5">
                                    <ShieldCheck className="w-5 h-5 text-[#84cc16] shrink-0" />
                                    <div className="flex flex-col leading-tight">
                                        <span className="font-bold text-white">Paiement sécurisé</span>
                                        <span className="text-[10px] text-slate-400">à la livraison ou en ligne</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2.5">
                                    <Headphones className="w-5 h-5 text-[#84cc16] shrink-0" />
                                    <div className="flex flex-col leading-tight">
                                        <span className="font-bold text-white">Service client</span>
                                        <span className="text-[10px] text-slate-400">7j/7</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Inscription / Calligraphy Slogan & Carousel controls */}
                        <div className="hidden lg:flex lg:col-span-5 flex-col items-end justify-between self-stretch pt-4 pb-2">
                            {/* Script quote "Plus fort chaque jour" matching screenshot */}
                            <div className="relative text-right mr-4 select-none">
                                <span className="font-serif italic text-3xl xl:text-4xl text-white/90 drop-shadow-md">
                                    {calligraphyTop}
                                </span>
                                <div className="font-serif italic text-3xl xl:text-4xl text-white/90 drop-shadow-md">
                                    {calligraphyBottom}
                                </div>
                                <div className="w-24 h-1 bg-[#84cc16] rounded-full ml-auto mt-2"></div>
                            </div>

                            {/* Carousel Controls matching screenshot */}
                            <div className="flex items-center gap-4 mt-auto">
                                <div className="flex items-center gap-2">
                                    <button 
                                        type="button"
                                        className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                                        title="Précédent"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button 
                                        type="button"
                                        className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                                        title="Suivant"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Pagination Dots */}
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-[#84cc16]"></span>
                                    <span className="w-2 h-2 rounded-full bg-white/40"></span>
                                    <span className="w-2 h-2 rounded-full bg-white/40"></span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </section>
    );
};
