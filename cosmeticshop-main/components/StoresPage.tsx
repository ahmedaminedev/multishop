
import React, { useEffect } from 'react';
import type { Store } from '../types';
import { Breadcrumb } from './Breadcrumb';
import { MapPinIcon, PhoneIcon, ClockIcon, MailIcon } from './IconComponents';

interface StoresPageProps {
    onNavigateHome: () => void;
    stores: Store[];
}

export const StoresPage: React.FC<StoresPageProps> = ({ onNavigateHome, stores }) => {
    
    useEffect(() => {
        document.title = "Nos Magasins - Electro Shop";
    }, []);

    return (
        <div className="bg-gray-100 dark:bg-gray-950 min-h-screen">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <Breadcrumb items={[{ name: 'Accueil', onClick: onNavigateHome }, { name: 'Nos Magasins' }]} />
                </div>

                <header className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">Nos Points de Vente</h1>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Retrouvez-nous dans nos différents magasins à travers la Tunisie pour découvrir nos produits et bénéficier de nos conseils d'experts.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {stores.map((store) => (
                        <div key={store.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row group transition-transform hover:-translate-y-1">
                            <div className="md:w-2/5 relative overflow-hidden">
                                <img 
                                    src={store.imageUrl} 
                                    alt={store.name} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                {store.isPickupPoint && (
                                    <span className="absolute top-4 left-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                                        Point de retrait
                                    </span>
                                )}
                            </div>
                            <div className="p-8 md:w-3/5 flex flex-col">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-red-600 transition-colors">{store.name}</h2>
                                
                                <div className="space-y-4 flex-grow">
                                    <div className="flex items-start gap-3">
                                        <MapPinIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                                        <span className="text-gray-600 dark:text-gray-300">{store.address}, {store.postalCode} {store.city}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <PhoneIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                        <a href={`tel:${store.phone.replace(/\s/g, '')}`} className="text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors">{store.phone}</a>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MailIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                        <a href={`mailto:${store.email}`} className="text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors">{store.email}</a>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <ClockIcon className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
                                        <span className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{store.openingHours}</span>
                                    </div>
                                </div>

                                {store.mapUrl && (
                                    <div className="mt-6 pt-6 border-t dark:border-gray-700">
                                        <iframe 
                                            src={store.mapUrl} 
                                            width="100%" 
                                            height="150" 
                                            style={{ border: 0, borderRadius: '0.5rem' }} 
                                            allowFullScreen 
                                            loading="lazy" 
                                            referrerPolicy="no-referrer-when-downgrade"
                                            title={`Carte de ${store.name}`}
                                        ></iframe>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
