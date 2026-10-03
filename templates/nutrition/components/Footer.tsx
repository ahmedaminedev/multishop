import React from 'react';
import { Logo } from './Logo';
import { FacebookIcon, InstagramIcon, TwitterIcon } from './IconComponents';
import type { Advertisements, LogoConfig } from '../types';
import { TrustBadges } from './TrustBadges';

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
    const fitnessHome = advertisements?.fitnessHome;
    const phone = fitnessHome?.footerPhone || '+216 71 888 999';
    const email = fitnessHome?.footerEmail || 'contact@fitnessshop.tn';
    const address = fitnessHome?.footerAddress || 'Zone Industrielle La Charguia II, Tunis';

    return (
        <footer className="relative bg-white text-slate-800 border-t border-slate-200 overflow-hidden font-sans">
            {/* Subtle background text watermark in daylight mode */}
            <div className="absolute top-0 left-0 w-full overflow-hidden opacity-[0.03] pointer-events-none select-none">
                <span className="text-[20vw] font-black italic tracking-tighter leading-none whitespace-nowrap text-slate-900">
                    FITNESS SHOP
                </span>
            </div>

            {/* Trust Badges in daylight mode displayed on every page above the footer */}
            <TrustBadges />

            {/* Main Footer Columns */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
                    
                    {/* Colonne 1 : Brand & Logo */}
                    <div className="lg:col-span-4 space-y-5">
                        <Logo logoConfig={activeLogoConfig} variant="footer" />
                        <p className="text-slate-600 text-xs sm:text-sm font-normal leading-relaxed max-w-sm">
                            Votre référence en Tunisie pour l'équipement de musculation, cardio-training, bancs, racks et haltères professionnels. Atteins tes objectifs sportifs avec le meilleur matériel.
                        </p>
                        <div className="text-xs text-slate-500 space-y-1 font-medium pt-1">
                            <p><strong className="text-slate-700">Hotline:</strong> {phone}</p>
                            <p><strong className="text-slate-700">Email:</strong> {email}</p>
                            <p><strong className="text-slate-700">Showroom:</strong> {address}</p>
                        </div>
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
                                    className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 hover:text-black hover:bg-[#84cc16] hover:border-[#84cc16] transition-all duration-200 shadow-2xs"
                                >
                                    {item.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Colonne 2 : Rayons Clés */}
                    <div className="lg:col-span-3">
                        <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 mb-5 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#84cc16]"></span>
                            <span>Rayons Fitness</span>
                        </h4>
                        <ul className="space-y-2.5 text-xs font-semibold text-slate-600">
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
                                        className="hover:text-[#4d7c0f] hover:translate-x-0.5 transition-all inline-block"
                                    >
                                        {cat}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Colonne 3 : Informations & Support */}
                    <div className="lg:col-span-2">
                        <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 mb-5 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#84cc16]"></span>
                            <span>Service Client</span>
                        </h4>
                        <ul className="space-y-2.5 text-xs font-semibold text-slate-600">
                            <li><a href="#/contact" className="hover:text-[#4d7c0f] hover:translate-x-0.5 transition-all inline-block">Contact & Devis</a></li>
                            <li><a href="#/stores" className="hover:text-[#4d7c0f] hover:translate-x-0.5 transition-all inline-block">Nos Showrooms</a></li>
                            <li><a href="#/promotions" className="hover:text-[#4d7c0f] hover:translate-x-0.5 transition-all inline-block">Offres & Promos</a></li>
                            <li><a href="#/order-history" className="hover:text-[#4d7c0f] hover:translate-x-0.5 transition-all inline-block">Suivi Commande</a></li>
                            <li><a href="#/privacy-policy" onClick={(e) => { e.preventDefault(); onNavigateToPrivacy?.(); }} className="hover:text-[#4d7c0f] hover:translate-x-0.5 transition-all inline-block">Confidentialité</a></li>
                            <li><a href="#/data-deletion" onClick={(e) => { e.preventDefault(); onNavigateToDataDeletion?.(); }} className="hover:text-[#4d7c0f] hover:translate-x-0.5 transition-all inline-block">Gestion des données</a></li>
                        </ul>
                    </div>

                    {/* Colonne 4 : Newsletter */}
                    <div className="lg:col-span-3 bg-gradient-to-br from-slate-50 to-slate-100/90 border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 mb-2">
                            Rejoindre la Communauté
                        </h4>
                        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                            Recevez nos guides d'entraînement, fiches conseils et promotions exclusives chaque semaine.
                        </p>
                        <form onSubmit={(e) => e.preventDefault()} className="space-y-2.5">
                            <input 
                                type="email" 
                                placeholder="Votre adresse e-mail" 
                                className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#84cc16] focus:ring-2 focus:ring-[#84cc16]/20 transition-all shadow-2xs"
                            />
                            <button 
                                type="submit"
                                className="w-full bg-[#84cc16] hover:bg-[#72b012] text-slate-950 font-black text-xs uppercase tracking-wide py-2.5 rounded-xl transition-colors cursor-pointer shadow-xs"
                            >
                                S'inscrire
                            </button>
                        </form>
                    </div>

                </div>

                {/* Footer Bottom Bar */}
                <div className="border-t border-slate-200 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-600">
                    <p className="font-medium text-center sm:text-left">
                        &copy; {new Date().getFullYear()} FITNESS SHOP. Tous droits réservés. Équipement sportif haute performance.
                    </p>
                    <div className="flex gap-6 items-center font-bold tracking-wider text-[11px] text-slate-500">
                        <span>PAIEMENT SÉCURISÉ</span>
                        <span>·</span>
                        <span>LIVRAISON EXPRESS TN</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

