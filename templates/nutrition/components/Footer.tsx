import React from 'react';
import { Logo } from './Logo';
import { FacebookIcon, InstagramIcon, TwitterIcon } from './IconComponents';
import type { Advertisements, LogoConfig } from '../types';
import { ShieldCheck, Truck, Headphones, CreditCard } from 'lucide-react';

interface FooterProps {
    onNavigateToPrivacy?: () => void;
    onNavigateToDataDeletion?: () => void;
    onNavigateToCategory?: (category: string) => void;
    advertisements?: Advertisements;
    logoConfig?: LogoConfig;
}

export const Footer: React.FC<FooterProps> = ({ 
    onNavigateToPrivacy, 
    onNavigateToDataDeletion,
    onNavigateToCategory,
    advertisements,
    logoConfig
}) => {
    const activeLogoConfig = logoConfig || advertisements?.logoConfig;

    return (
        <footer className="relative bg-[#070a12] text-slate-200 border-t border-white/10 overflow-hidden font-sans">
            {/* Subtle background text watermark */}
            <div className="absolute top-0 left-0 w-full overflow-hidden opacity-[0.02] pointer-events-none select-none">
                <span className="text-[20vw] font-black italic tracking-tighter leading-none whitespace-nowrap text-white">
                    FITNESS SHOP
                </span>
            </div>

            {/* Quick Value Assurances Banner */}
            <div className="border-b border-white/5 bg-[#0b0f19]/80 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#84cc16]/10 flex items-center justify-center text-[#84cc16]">
                            <Truck className="w-5 h-5 stroke-[2.2]" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-white uppercase tracking-wider">Livraison Express</p>
                            <p className="text-[11px] text-slate-400">24/48h sur toute la Tunisie</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#84cc16]/10 flex items-center justify-center text-[#84cc16]">
                            <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-white uppercase tracking-wider">Matériel Garanti</p>
                            <p className="text-[11px] text-slate-400">Certifié conforme & robuste</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#84cc16]/10 flex items-center justify-center text-[#84cc16]">
                            <CreditCard className="w-5 h-5 stroke-[2.2]" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-white uppercase tracking-wider">Paiement Sécurisé</p>
                            <p className="text-[11px] text-slate-400">En ligne ou à la livraison</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#84cc16]/10 flex items-center justify-center text-[#84cc16]">
                            <Headphones className="w-5 h-5 stroke-[2.2]" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-white uppercase tracking-wider">Support 7j/7</p>
                            <p className="text-[11px] text-slate-400">Conseillers spécialisés fitness</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer Columns */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
                    
                    {/* Colonne 1 : Brand & Logo */}
                    <div className="lg:col-span-4 space-y-5">
                        <Logo logoConfig={activeLogoConfig} variant="footer" />
                        <p className="text-slate-400 text-xs sm:text-sm font-normal leading-relaxed max-w-sm">
                            Votre référence en Tunisie pour l'équipement de musculation, cardio-training, bancs, racks et haltères professionnels. Atteins tes objectifs sportifs avec le meilleur matériel.
                        </p>
                        <div className="flex gap-3 pt-2">
                            {[
                                { icon: <FacebookIcon className="w-4 h-4"/>, label: 'Facebook' },
                                { icon: <InstagramIcon className="w-4 h-4"/>, label: 'Instagram' },
                                { icon: <TwitterIcon className="w-4 h-4"/>, label: 'Twitter' }
                            ].map((item, i) => (
                                <a 
                                    key={i} 
                                    href="#" 
                                    aria-label={item.label}
                                    className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-black hover:bg-[#84cc16] hover:border-[#84cc16] transition-all duration-200"
                                >
                                    {item.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Colonne 2 : Rayons Clés */}
                    <div className="lg:col-span-3">
                        <h4 className="text-sm font-extrabold uppercase tracking-wider text-white mb-5 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#84cc16]"></span>
                            <span>Rayons Fitness</span>
                        </h4>
                        <ul className="space-y-2.5 text-xs font-semibold text-slate-400">
                            {['Musculation', 'Cardio', 'Cross Training', 'Fitness & Yoga', 'Haltères & Poids', 'Bancs de Musculation', 'Racks & Stations', 'Accessoires'].map((cat) => (
                                <li key={cat}>
                                    <a 
                                        href={`#/product-list?category=${encodeURIComponent(cat)}`}
                                        onClick={(e) => {
                                            if (onNavigateToCategory) {
                                                e.preventDefault();
                                                onNavigateToCategory(cat);
                                            }
                                        }}
                                        className="hover:text-[#84cc16] transition-colors inline-block"
                                    >
                                        {cat}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Colonne 3 : Informations & Support */}
                    <div className="lg:col-span-2">
                        <h4 className="text-sm font-extrabold uppercase tracking-wider text-white mb-5 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#84cc16]"></span>
                            <span>Service Client</span>
                        </h4>
                        <ul className="space-y-2.5 text-xs font-semibold text-slate-400">
                            <li><a href="#/contact" className="hover:text-[#84cc16] transition-colors inline-block">Contact & Devis</a></li>
                            <li><a href="#/stores" className="hover:text-[#84cc16] transition-colors inline-block">Nos Showrooms</a></li>
                            <li><a href="#/promotions" className="hover:text-[#84cc16] transition-colors inline-block">Offres & Promos</a></li>
                            <li><a href="#/order-history" className="hover:text-[#84cc16] transition-colors inline-block">Suivi Commande</a></li>
                            <li><a href="#/privacy-policy" onClick={(e) => { e.preventDefault(); onNavigateToPrivacy?.(); }} className="hover:text-[#84cc16] transition-colors inline-block">Confidentialité</a></li>
                            <li><a href="#/data-deletion" onClick={(e) => { e.preventDefault(); onNavigateToDataDeletion?.(); }} className="hover:text-[#84cc16] transition-colors inline-block">Gestion des données</a></li>
                        </ul>
                    </div>

                    {/* Colonne 4 : Newsletter */}
                    <div className="lg:col-span-3 bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h4 className="text-sm font-black uppercase tracking-wider text-white mb-2">
                            Rejoindre la Communauté
                        </h4>
                        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                            Recevez nos guides d'entraînement, fiches conseils et promotions exclusives chaque semaine.
                        </p>
                        <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
                            <input 
                                type="email" 
                                placeholder="Votre adresse e-mail" 
                                className="w-full bg-[#0c1422] border border-white/15 text-white rounded-lg px-3.5 py-2.5 text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#84cc16] transition-colors"
                            />
                            <button 
                                type="submit"
                                className="w-full bg-[#84cc16] hover:bg-[#72b012] text-black font-extrabold text-xs uppercase tracking-wide py-2.5 rounded-lg transition-colors cursor-pointer"
                            >
                                S'inscrire
                            </button>
                        </form>
                    </div>

                </div>

                {/* Footer Bottom Bar */}
                <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                    <p className="font-medium text-center sm:text-left">
                        &copy; {new Date().getFullYear()} FITNESS SHOP. Tous droits réservés. Équipement sportif haute performance.
                    </p>
                    <div className="flex gap-6 items-center font-bold tracking-wider text-[11px] text-slate-400">
                        <span>PAIEMENT SÉCURISÉ</span>
                        <span>·</span>
                        <span>LIVRAISON EXPRESS TN</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

