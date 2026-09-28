
import React from 'react';
import { Logo } from './Logo';
import { FacebookIcon, InstagramIcon, TwitterIcon, MailIcon, PhoneIcon } from './IconComponents';

interface FooterProps {
    onNavigateToPrivacy?: () => void;
    onNavigateToDataDeletion?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateToPrivacy, onNavigateToDataDeletion }) => {
    return (
        <footer className="relative bg-white dark:bg-brand-dark text-gray-900 dark:text-white border-t border-gray-100 dark:border-white/5 overflow-hidden">
            
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none select-none hidden lg:block">
                <div className="text-[20vw] font-black leading-none text-brand-primary italic opacity-10">HEALTH</div>
            </div>

            <div className="max-w-screen-2xl mx-auto px-6 lg:px-16 relative z-10 pt-24 pb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
                    
                    {/* Brand Info */}
                    <div className="space-y-10">
                        <Logo />
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-loose max-w-xs">
                            PharmaNature sélectionne les meilleures solutions naturelles pour votre vitalité. Expertise pharmaceutique certifiée au service de votre bien-être.
                        </p>
                        <div className="flex gap-4">
                            {[<FacebookIcon className="w-5 h-5"/>, <InstagramIcon className="w-5 h-5"/>, <TwitterIcon className="w-5 h-5"/>].map((icon, i) => (
                                <a key={i} href="#" className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-gray-400 hover:bg-brand-primary hover:text-white transition-all shadow-sm">
                                    {icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 className="text-lg font-bold mb-10 text-brand-primary">L'Expertise</h4>
                        <ul className="space-y-5 text-sm font-medium text-gray-500 dark:text-gray-400">
                            <li><a href="#" className="hover:text-brand-primary transition-all flex items-center gap-2">Vitamines & Minéraux</a></li>
                            <li><a href="#" className="hover:text-brand-primary transition-all flex items-center gap-2">Cures Détox</a></li>
                            <li><a href="#" className="hover:text-brand-primary transition-all flex items-center gap-2">Soin Dermato</a></li>
                            <li><a href="#" className="hover:text-brand-primary transition-all flex items-center gap-2">Nos Pharmaciens</a></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-lg font-bold mb-10 text-brand-secondary">Assistance</h4>
                        <ul className="space-y-5 text-sm font-medium text-gray-500 dark:text-gray-400">
                            <li><a href="#" className="hover:text-brand-secondary transition-all">Suivre ma Cure</a></li>
                            <li><a href="#" className="hover:text-brand-secondary transition-all">Conseil Personnalisé</a></li>
                            <li><a href="#/privacy-policy" onClick={(e) => {e.preventDefault(); onNavigateToPrivacy?.()}} className="hover:text-brand-secondary transition-all">Données & Vie Privée</a></li>
                            <li><a href="#" className="hover:text-brand-secondary transition-all">Points de Retrait</a></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="bg-brand-light dark:bg-white/5 p-10 rounded-[2.5rem] border border-brand-primary/10">
                        <h4 className="text-xl font-bold mb-4 text-brand-dark dark:text-white">Lettre de Santé</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">Recevez chaque semaine nos protocoles de santé naturelle et nos offres privées.</p>
                        <form className="space-y-3">
                            <input 
                                type="email" 
                                placeholder="votre@email.com" 
                                className="w-full bg-white dark:bg-brand-dark border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white px-6 py-4 rounded-2xl text-sm focus:outline-none focus:border-brand-primary"
                            />
                            <button className="w-full bg-brand-primary text-white font-bold uppercase tracking-widest py-4 rounded-2xl hover:bg-brand-primaryHover transition-all shadow-lg shadow-brand-primary/20">
                                S'ABONNER
                            </button>
                        </form>
                    </div>
                </div>

                <div className="border-t border-gray-100 dark:border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-xs font-medium text-gray-400">&copy; {new Date().getFullYear()} PHARMANATURE. EXPERTISE PHARMACEUTIQUE GARANTIE.</p>
                    <div className="flex gap-10 opacity-40">
                         <span className="text-[10px] font-black tracking-widest">VISA</span>
                         <span className="text-[10px] font-black tracking-widest">MASTERCARD</span>
                         <span className="text-[10px] font-black tracking-widest">PAYMEE</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};
