import React, { useState, useMemo } from 'react';
import type { Pack, Product, Category } from '../../types';
import { PencilIcon, TrashIcon, PlusIcon } from '../IconComponents';
import { PackFormModal } from './PackFormModal';

interface ManagePacksPageProps {
    packs: Pack[];
    setPacks: React.Dispatch<React.SetStateAction<Pack[]>>;
    allProducts: Product[];
    allCategories: Category[];
}

// Helper function to check pack availability recursively
const isPackAvailable = (pack: Pack, allProducts: Product[], allPacks: Pack[]): boolean => {
    for (const productId of pack.includedProductIds) {
        const product = allProducts.find(p => p.id === productId);
        if (!product || product.quantity === 0) {
            return false;
        }
    }
    if (pack.includedPackIds) {
        for (const subPackId of pack.includedPackIds) {
            const subPack = allPacks.find(p => p.id === subPackId);
            if (!subPack || !isPackAvailable(subPack, allProducts, allPacks)) {
                return false;
            }
        }
    }
    return true;
};


export const ManagePacksPage: React.FC<ManagePacksPageProps> = ({ packs, setPacks, allProducts, allCategories }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPack, setEditingPack] = useState<Pack | null>(null);

    const handleSavePack = (packData: Omit<Pack, 'id'>) => {
        if (editingPack) {
            // Update
            setPacks(prev => prev.map(p => p.id === editingPack.id ? { ...packData, id: p.id } : p));
        } else {
            // Add new
            setPacks(prev => [...prev, { ...packData, id: Date.now() }]);
        }
    };

    const handleDeletePack = (packId: number) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce pack ?")) {
            setPacks(prev => prev.filter(p => p.id !== packId));
        }
    };

    const openCreateModal = () => {
        setEditingPack(null);
        setIsModalOpen(true);
    };

    const openEditModal = (pack: Pack) => {
        setEditingPack(pack);
        setIsModalOpen(true);
    };

    // Filter out the special navigation "category" for packs
    const productCategories = allCategories.filter(c => c.name !== 'Pack électroménager');

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Gérer les Packs</h1>
                <button
                    onClick={openCreateModal}
                    className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-red-700 transition-colors"
                >
                    <PlusIcon className="w-5 h-5" />
                    Ajouter un pack
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Image</th>
                                <th scope="col" className="px-6 py-3">Nom</th>
                                <th scope="col" className="px-6 py-3">Prix</th>
                                <th scope="col" className="px-6 py-3">Contenu</th>
                                <th scope="col" className="px-6 py-3">Statut</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {packs.map(pack => {
                                const isAvailable = isPackAvailable(pack, allProducts, packs);
                                return (
                                <tr key={pack.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4">
                                        <img src={pack.imageUrl} alt={pack.name} className="w-12 h-12 object-cover rounded-md" />
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{pack.name}</td>
                                    <td className="px-6 py-4">{pack.price.toFixed(3).replace('.', ',')} DT</td>
                                    <td className="px-6 py-4">
                                        {`${pack.includedProductIds.length} produit(s)`}
                                        {(pack.includedPackIds?.length || 0) > 0 && `, ${pack.includedPackIds?.length} pack(s)`}
                                    </td>
                                     <td className="px-6 py-4">
                                        {isAvailable ? (
                                             <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">Disponible</span>
                                        ) : (
                                            <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300">Indisponible</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 flex items-center gap-4">
                                        <button onClick={() => openEditModal(pack)} className="text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400">
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDeletePack(pack.id)} className="text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <PackFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSavePack}
                    pack={editingPack}
                    allProducts={allProducts}
                    allPacks={packs}
                    allCategories={productCategories}
                />
            )}
        </div>
    );
};