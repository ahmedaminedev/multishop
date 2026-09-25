
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
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Gérer les Magasins</h1>
                <button
                    onClick={openCreateModal}
                    className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
                >
                    <PlusIcon className="w-5 h-5" />
                    Ajouter un magasin
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stores.map(store => (
                    <div key={store.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden group">
                        <div className="relative h-48">
                            <img src={store.imageUrl} alt={store.name} className="w-full h-full object-cover" />
                            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button onClick={() => openEditModal(store)} className="bg-white/90 dark:bg-gray-900/90 p-2 rounded-full text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 shadow-md">
                                    <PencilIcon className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleDelete(store.id)} className="bg-white/90 dark:bg-gray-900/90 p-2 rounded-full text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 shadow-md">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                            {store.isPickupPoint && (
                                <span className="absolute bottom-2 left-2 bg-green-100 text-green-800 text-xs font-bold px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">Point de retrait</span>
                            )}
                        </div>
                        <div className="p-5 flex flex-col flex-grow gap-2">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{store.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                                <MapPinIcon className="w-5 h-5 flex-shrink-0 text-red-500" />
                                {store.address}, {store.postalCode} {store.city}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                                <PhoneIcon className="w-5 h-5 flex-shrink-0 text-blue-500" />
                                {store.phone}
                            </p>
                            <div className="mt-auto pt-3 border-t dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                                {store.openingHours}
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
