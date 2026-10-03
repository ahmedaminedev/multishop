import React from 'react';
import { ArrowUpRight, Zap, HeartPulse, Sparkles, Activity } from 'lucide-react';

export const CrossShopSynergy: React.FC = () => {
    return (
        <section className="w-full my-12 bg-gradient-to-r from-slate-900 via-[#0a1120] to-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
            
            {/* Background accent glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#84cc16]/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#84cc16]"></span>
                            <span className="text-[11px] font-black uppercase tracking-widest text-[#84cc16]">
                                Écosystème MultiShop Réseau
                            </span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
                            Optimisez Vos Performances Avec Nos Autres Filiales
                        </h3>
                    </div>

                    <span className="text-xs text-slate-400 font-medium">
                        Panier et compte client uniques sur l'ensemble du réseau
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* Filiale 1 : PharmaShop (Nutrition & Récupération) */}
                    <a
                        href="/?shop=para#/"
                        onClick={(e) => {
                            e.preventDefault();
                            document.cookie = "shop=para; path=/; max-age=31536000; SameSite=Lax";
                            localStorage.setItem('multishop_active_shop', 'para');
                            window.location.hash = '#/';
                            window.location.reload();
                        }}
                        className="group p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 transition-all flex flex-col justify-between cursor-pointer"
                    >
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                        <HeartPulse className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="text-xs font-black uppercase text-emerald-400 block tracking-wider">
                                            PharmaShop
                                        </span>
                                        <span className="text-[10px] text-slate-400">Santé, Récupération & Bio</span>
                                    </div>
                                </div>
                                <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                            </div>

                            <h4 className="text-base font-black text-white mb-2">
                                Compléments & Micronutrition Récupération
                            </h4>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                Magnésium marin, collagène pour articulations, oméga 3 et vitamines certifiées ISO pour optimiser la récupération après des séances lourdes.
                            </p>
                        </div>

                        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-emerald-400">
                            <span>Voir le rayon micronutrition</span>
                            <span className="text-white/60 text-[10px] font-mono">Livraison groupée</span>
                        </div>
                    </a>

                    {/* Filiale 2 : Electro Shop (High-Tech & Blenders) */}
                    <a
                        href="/?shop=electro#/"
                        onClick={(e) => {
                            e.preventDefault();
                            document.cookie = "shop=electro; path=/; max-age=31536000; SameSite=Lax";
                            localStorage.setItem('multishop_active_shop', 'electro');
                            window.location.hash = '#/';
                            window.location.reload();
                        }}
                        className="group p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/50 transition-all flex flex-col justify-between cursor-pointer"
                    >
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="text-xs font-black uppercase text-blue-400 block tracking-wider">
                                            Electro Shop
                                        </span>
                                        <span className="text-[10px] text-slate-400">High-Tech & Nutrition Connectée</span>
                                    </div>
                                </div>
                                <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                            </div>

                            <h4 className="text-base font-black text-white mb-2">
                                Montres Cardio GPS & Blenders Puissants
                            </h4>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                Suivez vos battements cardiaques, calories et VO2 Max en temps réel, ou préparez vos shakers de protéines avec des mixeurs haute vitesse 1200W.
                            </p>
                        </div>

                        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-blue-400">
                            <span>Voir les montres de sport</span>
                            <span className="text-white/60 text-[10px] font-mono">Garantie 24 mois</span>
                        </div>
                    </a>

                </div>
            </div>

        </section>
    );
};
