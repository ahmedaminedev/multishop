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
        <div className="bg-brand-dark text-white/90 border-b border-white/5 font-sans text-[10px] font-medium uppercase tracking-wider">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row justify-between items-center h-auto sm:h-12 py-2.5 sm:py-0 gap-3 sm:gap-0">
                    
                    {/* Contact Info */}
                    <div className="flex items-center space-x-6">
                        <a href="tel:+21655263522" className="flex items-center gap-2 hover:text-brand-secondary transition-colors">
                            <div className="w-5 h-5 rounded-full bg-brand-primary/20 flex items-center justify-center">
                                <PhoneIcon className="w-3 h-3 text-brand-primary" />
                            </div>
                            <span className="font-bold">CONSEIL EXPERT : +216 55 263 522</span>
                        </a>
                        <span className="hidden sm:inline opacity-20 text-white">|</span>
                        <a href="mailto:contact@pharmanature.tn" className="flex items-center gap-2 hover:text-brand-secondary transition-colors">
                            <div className="w-5 h-5 rounded-full bg-brand-primary/20 flex items-center justify-center">
                                <MailIcon className="w-3 h-3 text-brand-primary" />
                            </div>
                            <span className="normal-case font-medium">contact@pharmanature.tn</span>
                        </a>
                    </div>

                    {/* Medical Message - Center */}
                    <div className="hidden lg:flex items-center gap-2">
                        <span className="text-white font-black flex items-center gap-2 px-4 py-1 bg-brand-primary/10 rounded-full border border-brand-primary/20">
                             🌿 <span className="text-brand-primary italic">LIVRAISON OFFERTE</span> SUR TOUTES LES CURES DÈS 120 DT
                        </span>
                    </div>

                    {/* Right Links */}
                    <div className="flex items-center space-x-6">
                        <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToStores(); }} className="flex items-center gap-2 hover:text-brand-primary transition-colors">
                            <LocationIcon className="w-3.5 h-3.5 text-brand-primary" />
                            <span>Nos Pharmacies</span>
                        </a>
                        
                        {user && user.role === 'ADMIN' && (
                            <>
                                <span className="opacity-20">|</span>
                                <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToAdmin(); }} className="text-brand-primary font-black hover:text-white transition-colors flex items-center gap-2">
                                    <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></div>
                                    GESTION QG
                                </a>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};