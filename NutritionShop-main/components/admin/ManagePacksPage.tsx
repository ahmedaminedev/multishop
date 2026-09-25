
import React, { useState, useMemo } from 'react';
import type { Pack, Product, Category } from '../../types';
import { PencilIcon, TrashIcon, PlusIcon, CubeIcon } from '../IconComponents';
import { PackFormModal } from './PackFormModal';

interface ManagePacksPageProps {
    packs: Pack[];
    setPacks: React.Dispatch<React.SetStateAction<Pack[]>>;
    allProducts: Product[];
    allCategories: Category[];
}

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
            setPacks(prev => prev.map(p => p.id === editingPack.id ? { ...packData, id: p.id } : p));
        } else {
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

    const productCategories = allCategories.filter(c => c.name !== 'Pack électroménager');

    return (
        <div className="p-6 bg-gray-100 dark:bg-black min-h-screen text-gray-900 dark:text-white transition-colors duration-300">
            <div className="flex justify-between items-center mb-8 border-b border-gray-200 dark:border-gray-800 pb-6">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-wider italic">Packs <span className="text-black dark:text-brand-neon">Elite</span></h1>
                    <p className="text-xs text-gray-500 font-mono mt-1">Offres groupées et bundles</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="bg-black dark:bg-brand-neon text-white dark:text-black font-bold text-xs uppercase tracking-widest py-3 px-6 hover:bg-gray-800 dark:hover:bg-white transition-colors flex items-center gap-2"
                >
                    <PlusIcon className="w-4 h-4" />
                    Ajouter un pack
                </button>
            </div>

            <div className="bg-white dark:bg-[#1f2833] border border-gray-200 dark:border-gray-800 rounded-sm overflow-hidden shadow-sm dark:shadow-none">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-black border-b border-gray-200 dark:border-gray-700 font-bold tracking-wider">
                            <tr>
                                <th scope="col" className="px-6 py-4">Aperçu</th>
                                <th scope="col" className="px-6 py-4">Nom du Pack</th>
                                <th scope="col" className="px-6 py-4">Prix</th>
                                <th scope="col" className="px-6 py-4">Contenu</th>
                                <th scope="col" className="px-6 py-4">Statut</th>
                                <th scope="col" className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {packs.map(pack => {
                                const isAvailable = isPackAvailable(pack, allProducts, packs);
                                return (
                                <tr key={pack.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="w-16 h-16 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                                            <img src={pack.imageUrl} alt={pack.name} className="max-w-full max-h-full object-cover" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase">{pack.name}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-black dark:text-brand-neon font-mono font-bold text-lg">{pack.price.toFixed(3)} DT</span>
                                            {pack.oldPrice > pack.price && (
                                                <span className="text-xs text-gray-500 line-through decoration-red-500">{pack.oldPrice.toFixed(3)} DT</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-mono text-gray-500 dark:text-gray-400">
                                        {`${pack.includedProductIds.length} produit(s)`}
                                        {(pack.includedPackIds?.length || 0) > 0 && `, ${pack.includedPackIds?.length} pack(s)`}
                                    </td>
                                     <td className="px-6 py-4">
                                        {isAvailable ? (
                                             <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 text-[10px] font-bold px-2 py-1 uppercase tracking-wider">Disponible</span>
                                        ) : (
                                            <span className="bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-800 text-[10px] font-bold px-2 py-1 uppercase tracking-wider">Indisponible</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openEditModal(pack)} className="p-2 bg-gray-100 dark:bg-black border border-gray-200 dark:border-gray-700 hover:border-black dark:hover:border-brand-neon text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-brand-neon transition-all">
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeletePack(pack.id)} className="p-2 bg-gray-100 dark:bg-black border border-gray-200 dark:border-gray-700 hover:border-red-500 text-gray-500 dark:text-gray-400 hover:text-red-500 transition-all">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
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
