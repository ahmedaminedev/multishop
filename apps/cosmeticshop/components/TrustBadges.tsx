
import React from 'react';
import { DeliveryTruckIcon, SecurePaymentIcon, CustomerSupportIcon, GuaranteeIcon } from './IconComponents';
import type { TrustBadgeConfig } from '../types';

const TrustBadge: React.FC<{ icon: React.ReactNode; title: string; subtitle: string; iconUrl?: string }> = ({ icon, title, subtitle, iconUrl }) => (
    <div className="flex flex-col items-center text-center px-4 py-4 group cursor-default transition-all duration-300">
        <div className="mb-5 relative">
            <div className="absolute inset-0 bg-rose-200 dark:bg-rose-900 rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
            <div className="relative z-10 w-16 h-16 flex items-center justify-center rounded-full bg-rose-50 dark:bg-gray-800 text-rose-500 transition-all duration-300 group-hover:bg-rose-500 group-hover:text-white shadow-sm group-hover:shadow-lg transform group-hover:scale-110 overflow-hidden">
                {iconUrl ? (
                    <img src={iconUrl} alt={title} className="w-8 h-8 object-contain transition-all duration-300 group-hover:brightness-0 group-hover:invert" />
                ) : (
                    React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: "w-7 h-7" }) : icon
                )}
            </div>
        </div>
        <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-white mb-2 leading-tight" dangerouslySetInnerHTML={{ __html: title }}></h3>
        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em]" dangerouslySetInnerHTML={{ __html: subtitle }}></p>
    </div>
);

interface TrustBadgesProps {
    badges?: TrustBadgeConfig[];
}

export const TrustBadges: React.FC<TrustBadgesProps> = ({ badges }) => {
    // Default badges if none provided
    const defaultBadges: TrustBadgeConfig[] = [
        { id: 1, title: "Livraison Rapide", subtitle: "Sur toute la Tunisie" },
        { id: 2, title: "Paiement Sécurisé", subtitle: "100% sécurisé" },
        { id: 3, title: "Service Client", subtitle: "A votre écoute 7j/7" },
        { id: 4, title: "Garantie", subtitle: "Produits authentiques" }
    ];

    // If badges exists but is empty (e.g. from DB but cleared), use defaults. 
    // This aligns with the "if nothing, show defaults" philosophy for this component.
    const displayBadges = (badges && badges.length > 0) ? badges : defaultBadges;

    // Map fixed icons to index for fallback
    const icons = [
        <DeliveryTruckIcon />,
        <SecurePaymentIcon />,
        <CustomerSupportIcon />,
        <GuaranteeIcon />
    ];

    return (
        <section className="py-12 border-y border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
            <div className="max-w-screen-2xl mx-auto px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:divide-x divide-gray-100 dark:divide-gray-800">
                    {displayBadges.map((badge, index) => (
                        <div key={badge.id || index} className="w-full">
                            <TrustBadge 
                                icon={icons[index % icons.length]} 
                                title={badge.title} 
                                subtitle={badge.subtitle} 
                                iconUrl={badge.iconUrl}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
