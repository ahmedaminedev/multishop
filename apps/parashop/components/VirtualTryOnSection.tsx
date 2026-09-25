
import React from 'react';
import { SparklesIcon, ArrowUpRightIcon, CheckCircleIcon, ShoppingBagIcon } from './IconComponents';
import type { VirtualTryOnConfig } from '../types';

interface VirtualTryOnSectionProps {
    config?: VirtualTryOnConfig;
}

export const VirtualTryOnSection: React.FC<VirtualTryOnSectionProps> = ({ config }) => {
    return (
        <section className="relative w-full py-20 bg-white border-y border-slate-50 overflow-hidden">
            <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
                
                {/* Visual side */}
                <div className="w-full lg:w-1/2">
                    <div className="relative grid grid-cols-2 gap-4">
                        <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl transform -rotate-2">
                            <img src="https://images.unsplash.com/photo-1570172619383-2ef40176191a?q=80&w=800" className="w-full h-full object-cover" alt="Expertise" />
                        </div>
                        <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl mt-12 transform rotate-2">
                            <img src="https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800" className="w-full h-full object-cover" alt="Qualité" />
                        </div>
                        {/* Overlay Card */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-brand-dark p-8 rounded-3xl shadow-3xl border border-slate-100 min-w-[280px]">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-2xl flex items-center justify-center">
                                    <SparklesIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xl font-serif font-black text-slate-900 dark:text-white leading-none">100% Certifié</p>
                                    <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">Origine Laboratoire</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed italic">"Nous sélectionnons uniquement des produits testés dermatologiquement pour votre sécurité."</p>
                        </div>
                    </div>
                </div>

                {/* Content Side */}
                <div className="w-full lg:w-1/2 text-left">
                    <div className="inline-flex items-center gap-2 bg-brand-light text-brand-primary px-4 py-2 rounded-full mb-8 font-black uppercase text-[10px] tracking-widest">
                        <ShoppingBagIcon className="w-4 h-4" />
                        L'Excellence Pharmaceutique
                    </div>
                    <h2 className="text-5xl md:text-6xl font-serif font-black text-slate-900 dark:text-white leading-none mb-8 tracking-tighter">
                        Vos Marques <br/> <span className="text-brand-primary italic">Incontournables</span>
                    </h2>
                    <p className="text-slate-500 text-lg mb-12 font-medium leading-relaxed">
                        Plus de 500 références des plus grands laboratoires. Une sélection rigoureuse pour répondre à tous vos besoins de santé, de dermo-cosmétique et de bien-être quotidien.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 mb-12">
                        {["Livraison Partout en Tunisie", "Paiement à la livraison", "Conseils experts 7j/7", "Produits Authentiques"].map(feat => (
                            <div key={feat} className="flex items-center gap-3 text-slate-900 dark:text-white font-bold text-sm">
                                <CheckCircleIcon className="w-5 h-5 text-brand-primary" />
                                {feat}
                            </div>
                        ))}
                    </div>

                    <button className="bg-brand-primary text-white font-black py-5 px-12 rounded-2xl shadow-xl shadow-brand-primary/20 hover:bg-brand-primaryHover transition-all flex items-center gap-4 uppercase tracking-[0.2em] text-xs">
                        Parcourir le catalogue
                        <ArrowUpRightIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </section>
    );
};
