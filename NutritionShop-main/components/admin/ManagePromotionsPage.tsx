
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
        green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
        blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        gray: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-500 border-gray-200 dark:border-gray-700',
    };
    return <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${colorClasses[status.color]}`}>{status.text}</span>;
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
        <div className="p-6 bg-gray-100 dark:bg-black min-h-screen text-gray-900 dark:text-white transition-colors duration-300">
            <div className="flex justify-between items-center mb-8 border-b border-gray-200 dark:border-gray-800 pb-6">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-wider italic">Campagnes <span className="text-black dark:text-brand-neon">Promo</span></h1>
                    <p className="text-xs text-gray-500 font-mono mt-1">Codes & Réductions</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="bg-black dark:bg-brand-neon text-white dark:text-black font-bold text-xs uppercase tracking-widest py-3 px-6 hover:bg-gray-800 dark:hover:bg-white transition-colors flex items-center gap-2"
                >
                    <PlusIcon className="w-4 h-4" />
                    Nouvelle Promo
                </button>
            </div>

            <div className="bg-white dark:bg-[#1f2833] border border-gray-200 dark:border-gray-800 rounded-sm overflow-hidden shadow-sm dark:shadow-none">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-black border-b border-gray-200 dark:border-gray-700 font-bold tracking-wider">
                            <tr>
                                <th scope="col" className="px-6 py-4">Nom Campagne</th>
                                <th scope="col" className="px-6 py-4">Remise</th>
                                <th scope="col" className="px-6 py-4">Période</th>
                                <th scope="col" className="px-6 py-4">Portée</th>
                                <th scope="col" className="px-6 py-4">Statut</th>
                                <th scope="col" className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {promotions.map(promo => {
                                const status = getPromotionStatus(promo.startDate, promo.endDate);
                                return (
                                    <tr key={promo.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase tracking-wide flex items-center gap-3">
                                            <SparklesIcon className="w-4 h-4 text-black dark:text-brand-neon" />
                                            {promo.name}
                                        </td>
                                        <td className="px-6 py-4 font-mono font-bold text-black dark:text-brand-neon text-lg">-{promo.discountPercentage}%</td>
                                        <td className="px-6 py-4 text-xs font-mono text-gray-500 dark:text-gray-400">{promo.startDate} <span className="text-gray-400 dark:text-gray-600">&rarr;</span> {promo.endDate}</td>
                                        <td className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">{promo.productIds.length} produits, {promo.packIds.length} packs</td>
                                        <td className="px-6 py-4"><StatusBadge status={status} /></td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => openEditModal(promo)} className="p-2 bg-gray-100 dark:bg-black border border-gray-200 dark:border-gray-700 hover:border-black dark:hover:border-brand-neon text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-brand-neon transition-all">
                                                    <PencilIcon className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(promo.id)} className="p-2 bg-gray-100 dark:bg-black border border-gray-200 dark:border-gray-700 hover:border-red-500 text-gray-500 dark:text-gray-400 hover:text-red-500 transition-all">
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
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
