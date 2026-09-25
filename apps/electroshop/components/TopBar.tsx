
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
        <div className="bg-gray-800 dark:bg-gray-950 text-white text-xs">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-8">
                <div className="flex items-center space-x-4">
                    <a href="tel:+216-55-263-522" className="flex items-center space-x-1 hover:text-red-400">
                        <PhoneIcon className="w-4 h-4" />
                        <span>+216 55 263 522</span>
                    </a>
                    <a href="mailto:contact@electroshop.com" className="flex items-center space-x-1 hover:text-red-400">
                        <MailIcon className="w-4 h-4" />
                        <span>contact@electroshop.com</span>
                    </a>
                </div>
                <div className="flex items-center space-x-4">
                    <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToStores(); }} className="flex items-center space-x-1 hover:text-red-400">
                        <LocationIcon className="w-4 h-4" />
                        <span>Nos Magasins</span>
                    </a>
                    
                    {user && user.role === 'ADMIN' && (
                        <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToAdmin(); }} className="hover:text-red-400 font-bold text-red-400 transition-colors">
                            Dashboard Admin
                        </a>
                    )}
                    
                    <a href="#" className="hover:text-red-400">Suivi de commande</a>
                    <a href="#" className="hover:text-red-400">Contactez-nous</a>
                </div>
            </div>
        </div>
    );
};
