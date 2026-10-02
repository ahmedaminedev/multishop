import React from 'react';
import { Award, Truck, ShieldCheck, Headphones } from 'lucide-react';

export const TrustBadges: React.FC = () => {
    return (
        <section className="relative w-full bg-[#0a0f18] text-white overflow-hidden border-t border-white/5 py-8 sm:py-10">
            {/* Green geometric accent strip on right side matching screenshot */}
            <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-36 bg-[#84cc16]/20 skew-x-[-20deg] translate-x-12 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                    
                    {/* 1. Produits de qualité */}
                    <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-full bg-[#84cc16]/10 flex items-center justify-center shrink-0">
                            <Award className="w-6 h-6 text-[#84cc16]" />
                        </div>
                        <div className="flex flex-col leading-tight">
                            <span className="text-sm font-bold text-white">Produits de qualité</span>
                            <span className="text-xs text-slate-400 mt-0.5">Marques reconnues mondialement</span>
                        </div>
                    </div>

                    {/* 2. Livraison rapide */}
                    <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-full bg-[#84cc16]/10 flex items-center justify-center shrink-0">
                            <Truck className="w-6 h-6 text-[#84cc16]" />
                        </div>
                        <div className="flex flex-col leading-tight">
                            <span className="text-sm font-bold text-white">Livraison rapide</span>
                            <span className="text-xs text-slate-400 mt-0.5">Partout en Tunisie</span>
                        </div>
                    </div>

                    {/* 3. Paiement sécurisé */}
                    <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-full bg-[#84cc16]/10 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-6 h-6 text-[#84cc16]" />
                        </div>
                        <div className="flex flex-col leading-tight">
                            <span className="text-sm font-bold text-white">Paiement sécurisé</span>
                            <span className="text-xs text-slate-400 mt-0.5">À la livraison ou en ligne</span>
                        </div>
                    </div>

                    {/* 4. Service client */}
                    <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-full bg-[#84cc16]/10 flex items-center justify-center shrink-0">
                            <Headphones className="w-6 h-6 text-[#84cc16]" />
                        </div>
                        <div className="flex flex-col leading-tight">
                            <span className="text-sm font-bold text-white">Service client</span>
                            <span className="text-xs text-slate-400 mt-0.5">Disponible 7j/7</span>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};
