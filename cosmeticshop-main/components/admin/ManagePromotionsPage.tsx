import React, { useState } from 'react';
import type { Promotion, Product, Pack, Category } from '../../types';
import { PencilIcon, TrashIcon, PlusIcon, SparklesIcon } from '../IconComponents';
import { PromotionFormModal } from './PromotionFormModal';

interface ManagePromotionsPageProps {
    promotions: Promotion[];
    setPromotions: React.Dispatch<React.SetStateAction<Promotion[]>>;
    allProducts: Product[];
    allPacks: Pack[];
    allCategories: Category[];
}

const getPromotionStatus = (startDate: string, endDate: string): { text: 'Active' | 'Programmée' | 'Expirée'; color: 'green' | 'blue' | 'gray' } => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) return { text: 'Programmée', color: 'blue' };
    if (now > end) return { text: 'Expirée', color: 'gray' };
    return { text: 'Active', color: 'green' };
};

const StatusBadge: React.FC<{ status: { text: string, color: string } }> = ({ status }) => {
    const colorClasses = {
        green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${colorClasses[status.color]}`}>{status.text}</span>;
};

export const ManagePromotionsPage: React.FC<ManagePromotionsPageProps> = ({ promotions, setPromotions, allProducts, allPacks, allCategories }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

    const handleSave = (promoData: Omit<Promotion, 'id'>) => {
        if (editingPromotion) {
            setPromotions(prev => prev.map(p => p.id === editingPromotion.id ? { ...promoData, id: p.id } : p));
        } else {
            setPromotions(prev => [...prev, { ...promoData, id: Date.now() }]);
        }
    };

    const handleDelete = (promoId: number) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette promotion ?")) {
            setPromotions(prev => prev.filter(p => p.id !== promoId));
        }
    };

    const openCreateModal = () => {
        setEditingPromotion(null);
        setIsModalOpen(true);
    };

    const openEditModal = (promo: Promotion) => {
        setEditingPromotion(promo);
        setIsModalOpen(true);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Gérer les Promotions</h1>
                <button
                    onClick={openCreateModal}
                    className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
                >
                    <PlusIcon className="w-5 h-5" />
                    Ajouter une promotion
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Nom</th>
                                <th scope="col" className="px-6 py-3">Remise</th>
                                <th scope="col" className="px-6 py-3">Période</th>
                                <th scope="col" className="px-6 py-3">Appliqué à</th>
                                <th scope="col" className="px-6 py-3">Statut</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {promotions.map(promo => {
                                const status = getPromotionStatus(promo.startDate, promo.endDate);
                                return (
                                    <tr key={promo.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{promo.name}</td>
                                        <td className="px-6 py-4 font-bold text-red-600">{promo.discountPercentage}%</td>
                                        <td className="px-6 py-4">{promo.startDate} au {promo.endDate}</td>
                                        <td className="px-6 py-4">{promo.productIds.length} produit(s), {promo.packIds.length} pack(s)</td>
                                        <td className="px-6 py-4"><StatusBadge status={status} /></td>
                                        <td className="px-6 py-4 flex items-center gap-4">
                                            <button onClick={() => openEditModal(promo)} className="text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400" aria-label="Modifier">
                                                <PencilIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleDelete(promo.id)} className="text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400" aria-label="Supprimer">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <PromotionFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    promotion={editingPromotion}
                    allProducts={allProducts}
                    allPacks={allPacks}
                    allCategories={allCategories}
                />
            )}
        </div>
    );
};
