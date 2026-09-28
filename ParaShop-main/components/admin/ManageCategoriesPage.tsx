
import React, { useState } from 'react';
import type { Category } from '../../types';
import { PencilIcon, TrashIcon, PlusIcon, TagIcon, SparklesIcon } from '../IconComponents';
import { CategoryFormModal } from './CategoryFormModal';

interface ManageCategoriesPageProps {
    categories: Category[];
    setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

export const ManageCategoriesPage: React.FC<ManageCategoriesPageProps> = ({ categories, setCategories }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const handleSaveCategory = (categoryData: Category) => {
        if (editingCategory) setCategories(prev => prev.map(c => c.name === editingCategory.name ? categoryData : c));
        else setCategories(prev => [...prev, categoryData]);
    };
    
    return (
        <div className="p-8 bg-slate-50/50 dark:bg-brand-dark min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-serif font-black text-slate-900 dark:text-white uppercase tracking-tight">Rayons <span className="text-brand-primary italic">Experts</span></h1>
                    <p className="text-slate-400 font-medium mt-2">Organisation thérapeutique du catalogue</p>
                </div>
                <button onClick={() => { setEditingCategory(null); setIsModalOpen(true); }} className="bg-brand-primary text-white font-black py-4 px-10 rounded-2xl shadow-xl shadow-brand-primary/20 hover:bg-brand-primaryHover transition-all flex items-center gap-3 uppercase tracking-widest text-xs">
                    <PlusIcon className="w-5 h-5" /> Nouveau Rayon
                </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 dark:border-white/5">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-black/20">
                        <tr>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Rayon</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Type d'affichage</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                        {categories.map(category => (
                            <tr key={category.name} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                <td className="px-10 py-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-brand-light dark:bg-gray-700 rounded-xl flex items-center justify-center text-brand-primary"><TagIcon className="w-5 h-5"/></div>
                                        <span className="font-serif font-bold text-lg text-slate-900 dark:text-white">{category.name}</span>
                                    </div>
                                </td>
                                <td className="px-10 py-8">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${category.megaMenu ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                        {category.megaMenu ? 'Méga Menu' : 'Liste Simple'}
                                    </span>
                                </td>
                                <td className="px-10 py-8 text-right">
                                    <div className="flex justify-end gap-3">
                                        <button onClick={() => { setEditingCategory(category); setIsModalOpen(true); }} className="p-3 bg-slate-50 dark:bg-gray-700 text-slate-400 hover:text-brand-primary rounded-xl transition-all"><PencilIcon className="w-4 h-4" /></button>
                                        <button className="p-3 bg-slate-50 dark:bg-gray-700 text-slate-400 hover:text-rose-500 rounded-xl transition-all"><TrashIcon className="w-4 h-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && <CategoryFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveCategory} category={editingCategory} />}
        </div>
    );
};
