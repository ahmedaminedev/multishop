
import React, { useState } from 'react';
import type { Store } from '../../types';
import { PencilIcon, TrashIcon, PlusIcon, MapPinIcon, PhoneIcon } from '../IconComponents';
import { StoreFormModal } from './StoreFormModal';

interface ManageStoresPageProps {
    stores: Store[];
    setStores: React.Dispatch<React.SetStateAction<Store[]>>;
}

export const ManageStoresPage: React.FC<ManageStoresPageProps> = ({ stores, setStores }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStore, setEditingStore] = useState<Store | null>(null);

    const handleSave = (storeData: Omit<Store, 'id'>) => {
        if (editingStore) {
            setStores(prev => prev.map(s => s.id === editingStore.id ? { ...storeData, id: s.id } : s));
        } else {
            setStores(prev => [...prev, { ...storeData, id: Date.now() }]);
        }
    };

    const handleDelete = (storeId: number) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce magasin ?")) {
            setStores(prev => prev.filter(s => s.id !== storeId));
        }
    };

    const openCreateModal = () => {
        setEditingStore(null);
        setIsModalOpen(true);
    };

    const openEditModal = (store: Store) => {
        setEditingStore(store);
        setIsModalOpen(true);
    };

    return (
        <div className="p-6 bg-gray-100 dark:bg-black min-h-screen text-gray-900 dark:text-white transition-colors duration-300">
            <div className="flex justify-between items-center mb-8 border-b border-gray-200 dark:border-gray-800 pb-6">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-wider italic">Bases & <span className="text-black dark:text-brand-neon">Magasins</span></h1>
                    <p className="text-xs text-gray-500 font-mono mt-1">Points de déploiement physiques</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="bg-black dark:bg-brand-neon text-white dark:text-black font-bold text-xs uppercase tracking-widest py-3 px-6 hover:bg-gray-800 dark:hover:bg-white transition-colors flex items-center gap-2"
                >
                    <PlusIcon className="w-4 h-4" />
                    Nouveau Magasin
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stores.map(store => (
                    <div key={store.id} className="bg-white dark:bg-[#1f2833] border border-gray-200 dark:border-gray-800 flex flex-col group transition-all hover:border-black dark:hover:border-brand-neon shadow-sm dark:shadow-none">
                        <div className="relative h-48 overflow-hidden">
                            <img src={store.imageUrl} alt={store.name} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700" />
                            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button onClick={() => openEditModal(store)} className="bg-white dark:bg-black p-2 text-black dark:text-white hover:text-black dark:hover:text-brand-neon border border-gray-200 dark:border-gray-700 hover:border-black dark:hover:border-brand-neon transition-colors shadow-sm">
                                    <PencilIcon className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(store.id)} className="bg-white dark:bg-black p-2 text-red-500 hover:text-white border border-gray-200 dark:border-gray-700 hover:border-red-500 hover:bg-red-500 transition-colors shadow-sm">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                            {store.isPickupPoint && (
                                <span className="absolute bottom-0 left-0 bg-black dark:bg-brand-neon text-white dark:text-black text-[10px] font-black px-3 py-1 uppercase tracking-widest skew-x-[-12deg] m-2">
                                    <span className="skew-x-[12deg]">Pickup Point</span>
                                </span>
                            )}
                        </div>
                        <div className="p-6 flex flex-col flex-grow gap-4">
                            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase italic">{store.name}</h3>
                            
                            <div className="space-y-2 flex-grow">
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider flex items-start gap-2">
                                    <MapPinIcon className="w-4 h-4 flex-shrink-0 text-red-600" />
                                    {store.address}, {store.postalCode} {store.city}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider flex items-center gap-2">
                                    <PhoneIcon className="w-4 h-4 flex-shrink-0 text-blue-500" />
                                    {store.phone}
                                </p>
                            </div>
                            
                            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono uppercase">
                                    {store.openingHours}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <StoreFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    store={editingStore}
                />
            )}
        </div>
    );
};
