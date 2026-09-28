import React from 'react';
import { Logo } from './Logo';
import { FacebookIcon, InstagramIcon, TwitterIcon } from './IconComponents';

interface FooterProps {
    onNavigateToPrivacy?: () => void;
    onNavigateToDataDeletion?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateToPrivacy, onNavigateToDataDeletion }) => {
    return (
        <footer className="relative transition-colors duration-500 overflow-hidden
            bg-white dark:bg-brand-black 
            text-gray-900 dark:text-white
            border-t border-gray-100 dark:border-brand-neon">
            
            {/* --- DESIGN SOMBRE : INDUSTRIEL & TACTIQUE --- */}
            <div className="hidden dark:block">
                {/* Background Text Decor (Uniquement en mode sombre pour l'effet "Gym") */}
                <div className="absolute top-0 left-0 w-full overflow-hidden opacity-[0.03] pointer-events-none select-none">
                    <span className="text-[25vw] font-black font-serif leading-none whitespace-nowrap text-white italic">
                        IRON FUEL NUTRITION
                    </span>
                </div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
            </div>

            {/* --- CONTENU COMMUN --- */}
            <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 lg:px-16 relative z-10 pt-20 pb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
                    
                    {/* Colonne 1 : Brand & Spirit */}
                    <div className="space-y-8">
                        <Logo />
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-mono leading-relaxed max-w-xs uppercase tracking-wider italic">
                            La nutrition de l'élite. Nous fournissons les ressources pures pour ceux qui refusent le repos.
                        </p>
                        <div className="flex gap-4">
                            {[<FacebookIcon className="w-5 h-5"/>, <InstagramIcon className="w-5 h-5"/>, <TwitterIcon className="w-5 h-5"/>].map((icon, i) => (
                                <a key={i} href="#" className="w-12 h-12 border border-gray-200 dark:border-gray-800 flex items-center justify-center hover:bg-brand-neon hover:text-black hover:border-brand-neon transition-all duration-300 slant">
                                    <span className="slant-reverse">{icon}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Colonne 2 : Navigation */}
                    <div>
                        <h4 className="font-serif font-black italic text-xl mb-8 flex items-center gap-3">
                            <span className="w-1.5 h-6 bg-brand-neon slant"></span> 
                            <span className="dark:text-white text-gray-900">Catalogue</span>
                        </h4>
                        <ul className="space-y-4 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
                            <li><a href="#" className="hover:text-brand-neon transition-all block">Protéines de Combat</a></li>
                            <li><a href="#" className="hover:text-brand-neon transition-all block">Force & Créatine</a></li>
                            <li><a href="#" className="hover:text-brand-neon transition-all block">Packs Performance</a></li>
                            <li><a href="#" className="hover:text-brand-neon transition-all block">Accessoires Tactiques</a></li>
                        </ul>
                    </div>

                    {/* Colonne 3 : Support */}
                    <div>
                        <h4 className="font-serif font-black italic text-xl mb-8 flex items-center gap-3">
                            <span className="w-1.5 h-6 bg-brand-neon slant"></span>
                            <span className="dark:text-white text-gray-900">Liaison HQ</span>
                        </h4>
                        <ul className="space-y-4 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
                            <li><a href="#" className="hover:text-brand-neon transition-all block">Suivi de Déploiement</a></li>
                            <li><a href="#" className="hover:text-brand-neon transition-all block">Contact Support</a></li>
                            <li><a href="#/privacy-policy" onClick={(e) => {e.preventDefault(); onNavigateToPrivacy?.()}} className="hover:text-brand-neon transition-all block">Confidentialité</a></li>
                            <li><a href="#" className="hover:text-brand-neon transition-all block">Bases (Magasins)</a></li>
                        </ul>
                    </div>

                    {/* Colonne 4 : Newsletter (Design Adaptive) */}
                    <div className="bg-gray-50 dark:bg-white/5 p-8 border border-gray-100 dark:border-white/10 slant">
                        <div className="slant-reverse">
                            <h4 className="font-serif font-black italic text-xl mb-4 text-brand-neon">REJOINDRE L'UNITÉ</h4>
                            <p className="text-[10px] font-mono text-gray-500 dark:text-gray-400 mb-6 uppercase tracking-wider">Infiltrez-vous pour recevoir les protocoles d'entraînement et offres flash.</p>
                            <form className="space-y-2">
                                <input 
                                    type="email" 
                                    placeholder="EMAIL@HQ.COM" 
                                    className="w-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white px-4 py-3 text-[10px] font-black focus:outline-none focus:border-brand-neon transition-colors"
                                />
                                <button className="w-full bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest py-3 text-[10px] hover:bg-brand-neon dark:hover:bg-brand-neon transition-all shadow-xl">
                                    S'ENRÔLER
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Footer Bottom Bar */}
                <div className="border-t border-gray-100 dark:border-gray-900 pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-[0.4em]">
                    <p>&copy; {new Date().getFullYear()} IRONFUEL NUTRITION. NO PAIN NO GAIN.</p>
                    <div className="flex gap-8 items-center">
                        <span className="hover:text-brand-neon transition-colors cursor-default">VISA</span>
                        <span className="hover:text-brand-neon transition-colors cursor-default">MASTERCARD</span>
                        <span className="hover:text-brand-neon transition-colors cursor-default">CASH ON DELIVERY</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};
