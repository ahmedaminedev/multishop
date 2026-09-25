
import React, { useState } from 'react';
import type { Store } from '../../types';
import { PencilIcon, TrashIcon, PlusIcon, MapPinIcon, PhoneIcon, StorefrontIcon } from '../IconComponents';
import { StoreFormModal } from './StoreFormModal';

interface ManageStoresPageProps {
    stores: Store[];
    setStores: React.Dispatch<React.SetStateAction<Store[]>>;
}

export const ManageStoresPage: React.FC<ManageStoresPageProps> = ({ stores, setStores }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStore, setEditingStore] = useState<Store | null>(null);

    return (
        <div className="p-8 bg-slate-50/50 dark:bg-brand-dark min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-serif font-black text-slate-900 dark:text-white uppercase tracking-tight">Nos <span className="text-brand-primary italic">Pharmacies</span></h1>
                    <p className="text-slate-400 font-medium mt-2">Gestion des points de vente et d'expédition</p>
                </div>
                <button onClick={() => { setEditingStore(null); setIsModalOpen(true); }} className="bg-brand-primary text-white font-black py-4 px-10 rounded-2xl shadow-xl shadow-brand-primary/20 hover:bg-brand-primaryHover transition-all flex items-center gap-3 uppercase tracking-widest text-xs">
                    <PlusIcon className="w-5 h-5" /> Ajouter une Officine
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {stores.map(store => (
                    <div key={store.id} className="bg-white dark:bg-gray-800 rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 dark:border-white/5 group hover:shadow-xl transition-all duration-500">
                        <div className="relative h-56">
                            <img src={store.imageUrl} alt={store.name} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-1000" />
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setEditingStore(store); setIsModalOpen(true); }} className="p-3 bg-white dark:bg-gray-700 text-brand-primary rounded-xl shadow-lg hover:scale-110 transition-all"><PencilIcon className="w-5 h-5" /></button>
                                <button className="p-3 bg-white dark:bg-gray-700 text-rose-500 rounded-xl shadow-lg hover:bg-rose-500 hover:text-white transition-all"><TrashIcon className="w-4 h-4" /></button>
                            </div>
                            {store.isPickupPoint && (
                                <span className="absolute bottom-4 left-4 bg-brand-primary text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                                    Click & Collect Actif
                                </span>
                            )}
                        </div>
                        <div className="p-10">
                            <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-tight">{store.name}</h3>
                            <div className="space-y-4">
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-3 uppercase tracking-wider">
                                    <MapPinIcon className="w-4 h-4 text-brand-primary" /> {store.city}, {store.postalCode}
                                </p>
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-3 uppercase tracking-wider">
                                    <PhoneIcon className="w-4 h-4 text-brand-primary" /> {store.phone}
                                </p>
                            </div>
                            <div className="mt-8 pt-8 border-t border-slate-50 dark:border-white/5">
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{store.openingHours}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <StoreFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={(d) => editingStore ? setStores(prev => prev.map(s => s.id === editingStore.id ? {...d, id: s.id} : s)) : setStores(prev => [...prev, {...d, id: Date.now()}])} store={editingStore} />
            )}
        </div>
    );
};
