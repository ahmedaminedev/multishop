
import React from 'react';
import { Logo } from './Logo';

interface FooterProps {
    onNavigateToPrivacy?: () => void;
    onNavigateToDataDeletion?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateToPrivacy, onNavigateToDataDeletion }) => {
    return (
        <footer className="bg-gray-50 border-t border-gray-200 dark:bg-black/80 dark:border-gray-800 mt-20">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="space-y-4">
                        <Logo />
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-light">
                            L'excellence de la beauté à portée de main. Découvrez une sélection curated de produits de luxe pour révéler votre éclat naturel.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-lg font-serif font-bold text-gray-900 dark:text-white mb-6">Navigation</h3>
                        <ul className="space-y-3 text-sm font-light">
                            <li><a href="#" className="text-gray-600 hover:text-rose-600 dark:text-gray-400 dark:hover:text-white transition-colors">Nos Magasins</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-rose-600 dark:text-gray-400 dark:hover:text-white transition-colors">Le Blog</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-rose-600 dark:text-gray-400 dark:hover:text-white transition-colors">Conditions Générales</a></li>
                            <li>
                                <a 
                                    href="#/privacy-policy" 
                                    onClick={(e) => { e.preventDefault(); onNavigateToPrivacy?.(); }} 
                                    className="text-gray-600 hover:text-rose-600 dark:text-gray-400 dark:hover:text-white transition-colors"
                                >
                                    Politique de confidentialité
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-serif font-bold text-gray-900 dark:text-white mb-6">Service Client</h3>
                        <ul className="space-y-3 text-sm font-light">
                            <li><a href="#" className="text-gray-600 hover:text-rose-600 dark:text-gray-400 dark:hover:text-white transition-colors">Contactez-nous</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-rose-600 dark:text-gray-400 dark:hover:text-white transition-colors">Suivre ma commande</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-rose-600 dark:text-gray-400 dark:hover:text-white transition-colors">FAQ & Retours</a></li>
                        </ul>
                    </div>
                     <div>
                        <h3 className="text-lg font-serif font-bold text-gray-900 dark:text-white mb-6">Newsletter</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 font-light">Recevez nos offres exclusives et conseils beauté.</p>
                        <form className="flex flex-col gap-2">
                            <input type="email" placeholder="Votre email" className="w-full rounded-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-rose-300 text-sm" />
                            <button className="bg-gray-900 text-white rounded-full px-4 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-rose-600 transition-colors">S'abonner</button>
                        </form>
                    </div>
                </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-800 py-8">
                 <p className="text-center text-xs text-gray-400 uppercase tracking-widest font-semibold">&copy; {new Date().getFullYear()} Cosmetics Shop. Tous droits réservés.</p>
            </div>
        </footer>
    );
};