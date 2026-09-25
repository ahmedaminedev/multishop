
import React from 'react';
import { PhoneIcon, MailIcon, LocationIcon } from './IconComponents';
import type { User } from '../types';

interface TopBarProps {
    user: User | null;
    onNavigateToAdmin: () => void;
    onNavigateToStores: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ user, onNavigateToAdmin, onNavigateToStores }) => {
    return (
        <div className="bg-gray-950 text-white border-b border-gray-800 transition-colors duration-300">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row justify-between items-center h-auto sm:h-10 py-2 sm:py-0 text-[10px] font-medium uppercase tracking-widest gap-2 sm:gap-0">
                    
                    {/* Contact Info - Left */}
                    <div className="flex items-center space-x-4 lg:space-x-6">
                        <a href="tel:+21655263522" className="flex items-center gap-2 text-gray-300 hover:text-rose-400 transition-colors group">
                            <PhoneIcon className="w-3 h-3 text-gray-500 group-hover:text-rose-400 transition-colors" />
                            <span>+216 55 263 522</span>
                        </a>
                        <span className="hidden sm:inline text-gray-800">|</span>
                        <a href="mailto:contact@cosmeticshop.com" className="flex items-center gap-2 text-gray-300 hover:text-rose-400 transition-colors group">
                            <MailIcon className="w-3 h-3 text-gray-500 group-hover:text-rose-400 transition-colors" />
                            <span className="normal-case tracking-wider">contact@cosmeticshop.com</span>
                        </a>
                    </div>

                    {/* Marketing/Promo - Center (Visible on Large Screens) */}
                    <div className="hidden lg:block text-rose-400/90 font-semibold animate-pulse">
                        Livraison gratuite à partir de 300 DT d'achat
                    </div>

                    {/* Navigation Links - Right */}
                    <div className="flex items-center space-x-4 lg:space-x-6">
                        <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToStores(); }} className="flex items-center gap-2 text-gray-300 hover:text-rose-400 transition-colors group">
                            <LocationIcon className="w-3 h-3 text-gray-500 group-hover:text-rose-400 transition-colors" />
                            <span>Nos Magasins</span>
                        </a>
                        
                        {user && user.role === 'ADMIN' && (
                            <>
                                <span className="text-gray-800">|</span>
                                <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToAdmin(); }} className="text-rose-500 hover:text-rose-400 font-bold transition-colors">
                                    Dashboard
                                </a>
                            </>
                        )}
                        
                        <span className="hidden sm:inline text-gray-800">|</span>
                        <a href="#" className="text-gray-300 hover:text-rose-400 transition-colors">Suivi commande</a>
                        <span className="hidden sm:inline text-gray-800">|</span>
                        <a href="#" className="text-gray-300 hover:text-rose-400 transition-colors">Aide</a>
                    </div>
                </div>
            </div>
        </div>
    );
};
