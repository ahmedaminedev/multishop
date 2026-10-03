import React from 'react';
import { Award, Truck, ShieldCheck, Headphones } from 'lucide-react';

export const TrustBadges: React.FC<{ className?: string }> = ({ className = '' }) => {
    return (
        <section className={`relative w-full bg-slate-50 text-slate-800 border-y border-slate-200/90 py-7 sm:py-8 font-sans ${className}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    
                    {/* 1. Produits de qualité */}
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-[#84cc16]/15 flex items-center justify-center shrink-0 text-[#4d7c0f] shadow-xs">
                            <Award className="w-6 h-6 stroke-[2.2]" />
                        </div>
                        <div className="flex flex-col leading-tight">
                            <span className="text-sm font-black text-slate-900 uppercase tracking-tight">Produits de qualité</span>
                            <span className="text-xs text-slate-500 font-medium mt-0.5">Marques reconnues mondialement</span>
                        </div>
                    </div>

                    {/* 2. Livraison rapide */}
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-[#84cc16]/15 flex items-center justify-center shrink-0 text-[#4d7c0f] shadow-xs">
                            <Truck className="w-6 h-6 stroke-[2.2]" />
                        </div>
                        <div className="flex flex-col leading-tight">
                            <span className="text-sm font-black text-slate-900 uppercase tracking-tight">Livraison rapide</span>
                            <span className="text-xs text-slate-500 font-medium mt-0.5">Partout en Tunisie</span>
                        </div>
                    </div>

                    {/* 3. Paiement sécurisé */}
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-[#84cc16]/15 flex items-center justify-center shrink-0 text-[#4d7c0f] shadow-xs">
                            <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
                        </div>
                        <div className="flex flex-col leading-tight">
                            <span className="text-sm font-black text-slate-900 uppercase tracking-tight">Paiement sécurisé</span>
                            <span className="text-xs text-slate-500 font-medium mt-0.5">À la livraison ou en ligne</span>
                        </div>
                    </div>

                    {/* 4. Service client */}
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-[#84cc16]/15 flex items-center justify-center shrink-0 text-[#4d7c0f] shadow-xs">
                            <Headphones className="w-6 h-6 stroke-[2.2]" />
                        </div>
                        <div className="flex flex-col leading-tight">
                            <span className="text-sm font-black text-slate-900 uppercase tracking-tight">Service client</span>
                            <span className="text-xs text-slate-500 font-medium mt-0.5">Disponible 7j/7</span>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};
