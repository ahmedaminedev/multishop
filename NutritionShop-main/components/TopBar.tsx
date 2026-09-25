
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
        <div className="bg-[#050505] text-gray-400 border-b border-gray-800 transition-colors duration-300 font-sans text-[10px] font-bold uppercase tracking-widest">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row justify-between items-center h-auto sm:h-10 py-2 sm:py-0 gap-2 sm:gap-0">
                    
                    {/* Contact Info */}
                    <div className="flex items-center space-x-4 lg:space-x-6">
                        <a href="tel:+21655263522" className="flex items-center gap-2 hover:text-brand-neon transition-colors group">
                            <PhoneIcon className="w-3 h-3 group-hover:text-brand-neon transition-colors" />
                            <span>+216 55 263 522</span>
                        </a>
                        <span className="hidden sm:inline text-gray-800">|</span>
                        <a href="mailto:contact@ironfuel.tn" className="flex items-center gap-2 hover:text-brand-neon transition-colors group">
                            <MailIcon className="w-3 h-3 group-hover:text-brand-neon transition-colors" />
                            <span className="normal-case tracking-wider">contact@ironfuel.tn</span>
                        </a>
                    </div>

                    {/* Marketing - Center */}
                    <div className="hidden lg:flex items-center gap-2">
                        <span className="w-2 h-2 bg-brand-neon skew-x-[-12deg]"></span>
                        <span className="text-white italic">Livraison <span className="text-brand-neon">OFFERTE</span> dès 300 DT</span>
                        <span className="w-2 h-2 bg-brand-neon skew-x-[-12deg]"></span>
                    </div>

                    {/* Right Links */}
                    <div className="flex items-center space-x-4 lg:space-x-6">
                        <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToStores(); }} className="flex items-center gap-2 hover:text-brand-neon transition-colors">
                            <LocationIcon className="w-3 h-3" />
                            <span>Nos Salles / Magasins</span>
                        </a>
                        
                        {user && user.role === 'ADMIN' && (
                            <>
                                <span className="text-gray-800">|</span>
                                <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToAdmin(); }} className="text-brand-neon hover:text-white transition-colors bg-gray-900 px-2 py-0.5 rounded-sm">
                                    ADMIN DASHBOARD
                                </a>
                            </>
                        )}
                        
                        <span className="hidden sm:inline text-gray-800">|</span>
                        <a href="#" className="hover:text-brand-neon transition-colors">Suivi</a>
                    </div>
                </div>
            </div>
        </div>
    );
};
