import React from 'react';
import { DeliveryTruckIcon, CheckCircleIcon, CustomerSupportIcon, StarIcon } from './IconComponents';
import type { TrustBadgeConfig } from '../types';

const TrustBadge: React.FC<{ icon: React.ReactNode; title: string; subtitle: string }> = ({ icon, title, subtitle }) => (
    <div className="flex flex-col items-center text-center p-8 group transition-all duration-500 relative border-r border-gray-200 dark:border-gray-800 last:border-0">
        {/* Background Decorative Element */}
        <div className="absolute inset-0 bg-brand-neon opacity-0 group-hover:opacity-[0.03] dark:group-hover:opacity-[0.05] transition-opacity duration-500 skew-x-[-12deg]"></div>
        
        {/* Tactical Icon Container */}
        <div className="mb-6 relative">
            <div className="absolute -inset-4 border border-brand-neon/20 rounded-full scale-75 group-hover:scale-110 group-hover:border-brand-neon transition-all duration-500"></div>
            
            <div className="relative z-10 w-16 h-16 flex items-center justify-center bg-gray-900 text-brand-neon rounded-none slant border-2 border-brand-neon shadow-[0_0_15px_rgba(204,255,0,0.2)] group-hover:shadow-[0_0_25px_rgba(204,255,0,0.5)] transition-all">
                <span className="slant-reverse block">
                    {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: "w-8 h-8" }) : icon}
                </span>
            </div>
        </div>

        <h3 className="font-serif font-black italic text-xl text-gray-900 dark:text-white mb-2 uppercase tracking-tighter group-hover:text-brand-neon transition-colors">
            {title}
        </h3>
        
        <p className="text-[10px] font-mono font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] border-t border-gray-200 dark:border-gray-800 pt-3 mt-2 group-hover:border-brand-neon/50 transition-colors">
            {subtitle}
        </p>
    </div>
);

interface TrustBadgesProps {
    badges?: TrustBadgeConfig[];
}

export const TrustBadges: React.FC<TrustBadgesProps> = ({ badges }) => {
    const defaultIcons = [<DeliveryTruckIcon />, <CheckCircleIcon />, <CustomerSupportIcon />, <StarIcon />];

    const displayBadges = badges && badges.length > 0 
        ? badges.map((badge, index) => ({
            title: badge.title,
            subtitle: badge.subtitle,
            icon: badge.iconUrl 
                ? <img src={badge.iconUrl} alt="" className="w-8 h-8 object-contain" /> 
                : defaultIcons[index % defaultIcons.length]
          }))
        : [
            { icon: <DeliveryTruckIcon />, title: "LIVRAISON EXPRESS", subtitle: "24/48H PARTOUT" },
            { icon: <CheckCircleIcon />, title: "AUTHENTICITÉ 100%", subtitle: "PRODUITS CERTIFIÉS" },
            { icon: <CustomerSupportIcon />, title: "EXPERTISE PRO", subtitle: "CONSEILS DE COACHS" },
            { icon: <StarIcon />, title: "MEILLEUR PRIX", subtitle: "GARANTI SUR LE MARCHÉ" }
        ];

    return (
        <section className="relative py-0 border-y-4 border-black dark:border-brand-neon bg-white dark:bg-brand-black overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none"></div>
            
            <div className="max-w-screen-2xl mx-auto px-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    {displayBadges.map((badge, index) => (
                        <TrustBadge key={index} {...badge} />
                    ))}
                </div>
            </div>
        </section>
    );
};