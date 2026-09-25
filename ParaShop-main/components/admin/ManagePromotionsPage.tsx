
import React, { useState } from 'react';
import type { Promotion, Product, Pack, Category } from '../../types';
import { PencilIcon, TrashIcon, PlusIcon, SparklesIcon, TagIcon } from '../IconComponents';
import { PromotionFormModal } from './PromotionFormModal';

interface ManagePromotionsPageProps {
    promotions: Promotion[];
    setPromotions: React.Dispatch<React.SetStateAction<Promotion[]>>;
    allProducts: Product[];
    allPacks: Pack[];
    allCategories: Category[];
}

export const ManagePromotionsPage: React.FC<ManagePromotionsPageProps> = ({ promotions, setPromotions, allProducts, allPacks, allCategories }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

    return (
        <div className="p-8 bg-slate-50/50 dark:bg-brand-dark min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-serif font-black text-slate-900 dark:text-white uppercase tracking-tight">Cures <span className="text-brand-primary italic">Privilèges</span></h1>
                    <p className="text-slate-400 font-medium mt-2">Gestion des avantages et campagnes promotionnelles</p>
                </div>
                <button onClick={() => { setEditingPromotion(null); setIsModalOpen(true); }} className="bg-brand-primary text-white font-black py-4 px-10 rounded-2xl shadow-xl shadow-brand-primary/20 hover:bg-brand-primaryHover transition-all flex items-center gap-3 uppercase tracking-widest text-xs">
                    <PlusIcon className="w-5 h-5" /> Nouvelle Campagne
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 dark:border-white/5">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-black/20">
                        <tr>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Offre</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Avantage</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Période</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                        {promotions.map(promo => (
                            <tr key={promo.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                <td className="px-10 py-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-brand-light dark:bg-gray-700 rounded-xl flex items-center justify-center text-brand-primary"><TagIcon className="w-5 h-5"/></div>
                                        <span className="font-serif font-bold text-lg text-slate-900 dark:text-white uppercase">{promo.name}</span>
                                    </div>
                                </td>
                                <td className="px-10 py-8">
                                    <span className="px-4 py-1.5 bg-rose-50 text-rose-600 rounded-full text-[11px] font-black uppercase tracking-widest border border-rose-100">
                                        -{promo.discountPercentage}% Remise
                                    </span>
                                </td>
                                <td className="px-10 py-8 font-mono text-xs text-slate-400 font-bold uppercase">
                                    {promo.startDate} &rarr; {promo.endDate}
                                </td>
                                <td className="px-10 py-8 text-right">
                                    <div className="flex justify-end gap-3">
                                        <button onClick={() => { setEditingPromotion(promo); setIsModalOpen(true); }} className="p-3 bg-slate-50 dark:bg-gray-700 text-slate-400 hover:text-brand-primary rounded-xl transition-all"><PencilIcon className="w-4 h-4"/></button>
                                        <button className="p-3 bg-slate-50 dark:bg-gray-700 text-slate-400 hover:text-rose-500 rounded-xl transition-all"><TrashIcon className="w-4 h-4"/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <PromotionFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={(d) => editingPromotion ? setPromotions(prev => prev.map(p => p.id === editingPromotion.id ? {...d, id: p.id} : p)) : setPromotions(prev => [...prev, {...d, id: Date.now()}])} promotion={editingPromotion} allProducts={allProducts} allPacks={allPacks} allCategories={allCategories} />
            )}
        </div>
    );
};
