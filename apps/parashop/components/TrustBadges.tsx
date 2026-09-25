
import React from 'react';
import { CheckCircleIcon, CustomerSupportIcon, StarIcon, SecurePaymentIcon } from './IconComponents';
import type { TrustBadgeConfig } from '../types';

const TrustBadge: React.FC<{ icon: React.ReactNode; title: string; subtitle: string }> = ({ icon, title, subtitle }) => (
    <div className="flex flex-col items-center text-center p-10 group transition-all duration-500 relative border-r border-gray-50 dark:border-white/5 last:border-0">
        <div className="mb-8 relative">
            <div className="absolute -inset-4 bg-brand-primary/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500"></div>
            <div className="relative z-10 w-16 h-16 flex items-center justify-center bg-white dark:bg-gray-800 text-brand-primary rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none transition-all group-hover:rotate-12">
                {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: "w-8 h-8" }) : icon}
            </div>
        </div>

        <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-white mb-2 uppercase tracking-tight group-hover:text-brand-primary transition-colors">
            {title}
        </h3>
        
        <p className="text-xs font-medium text-gray-400 dark:text-gray-500 leading-relaxed px-4">
            {subtitle}
        </p>
    </div>
);

interface TrustBadgesProps {
    badges?: TrustBadgeConfig[];
}

export const TrustBadges: React.FC<TrustBadgesProps> = ({ badges }) => {
    const defaultIcons = [<CheckCircleIcon />, <CustomerSupportIcon />, <SecurePaymentIcon />, <StarIcon />];

    const displayBadges = badges && badges.length > 0 
        ? badges.map((badge, index) => ({
            title: badge.title,
            subtitle: badge.subtitle,
            icon: badge.iconUrl 
                ? <img src={badge.iconUrl} alt="" className="w-8 h-8 object-contain" /> 
                : defaultIcons[index % defaultIcons.length]
          }))
        : [
            { icon: <CheckCircleIcon />, title: "Expertise Santé", subtitle: "Formulé par des professionnels" },
            { icon: <CustomerSupportIcon />, title: "Conseil Pharmacien", subtitle: "Assistance gratuite 7j/7" },
            { icon: <SecurePaymentIcon />, title: "Discrétion Totale", subtitle: "Expédition neutre et sécurisée" },
            { icon: <StarIcon />, title: "Qualité Labo", subtitle: "Puretée et origine certifiées" }
        ];

    return (
        <section className="relative py-0 bg-white dark:bg-brand-dark rounded-[3rem] shadow-2xl shadow-gray-200/40 dark:shadow-none overflow-hidden my-12 border border-gray-100 dark:border-white/5">
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
