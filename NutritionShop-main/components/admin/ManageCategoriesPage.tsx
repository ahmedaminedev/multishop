
import React, { useState } from 'react';
import type { Category } from '../../types';
import { PencilIcon, TrashIcon, PlusIcon, TagIcon } from '../IconComponents';
import { CategoryFormModal } from './CategoryFormModal';


interface ManageCategoriesPageProps {
    categories: Category[];
    setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

export const ManageCategoriesPage: React.FC<ManageCategoriesPageProps> = ({ categories, setCategories }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const handleSaveCategory = (categoryData: Category) => {
        if (editingCategory) {
            // Update
            setCategories(prev => prev.map(c => c.name === editingCategory.name ? categoryData : c));
        } else {
            // Add new
            setCategories(prev => [...prev, categoryData]);
        }
    };
    
    const handleDeleteCategory = (categoryName: string) => {
        if(window.confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${categoryName}" ?`)) {
            setCategories(prev => prev.filter(c => c.name !== categoryName));
        }
    };
    
    const openCreateModal = () => {
        setEditingCategory(null);
        setIsModalOpen(true);
    };
    
    const openEditModal = (category: Category) => {
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    return (
        <div className="p-6 bg-gray-100 dark:bg-black min-h-screen text-gray-900 dark:text-white transition-colors duration-300">
            <div className="flex justify-between items-center mb-8 border-b border-gray-200 dark:border-gray-800 pb-6">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-wider italic">Structure <span className="text-black dark:text-brand-neon">Catégories</span></h1>
                    <p className="text-xs text-gray-500 font-mono mt-1">Organisation du catalogue</p>
                </div>
                <button 
                    onClick={openCreateModal}
                    className="bg-black dark:bg-brand-neon text-white dark:text-black font-bold text-xs uppercase tracking-widest py-3 px-6 hover:bg-gray-800 dark:hover:bg-white transition-colors flex items-center gap-2"
                >
                    <PlusIcon className="w-4 h-4" />
                    Nouvelle Catégorie
                </button>
            </div>
            
            <div className="bg-white dark:bg-[#1f2833] border border-gray-200 dark:border-gray-800 rounded-sm overflow-hidden shadow-sm dark:shadow-none">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-black border-b border-gray-200 dark:border-gray-700 font-bold tracking-wider">
                            <tr>
                                <th scope="col" className="px-6 py-4">Nom</th>
                                <th scope="col" className="px-6 py-4">Type de Menu</th>
                                <th scope="col" className="px-6 py-4">Contenu</th>
                                <th scope="col" className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {categories.map(category => (
                                <tr key={category.name} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase tracking-wide flex items-center gap-3">
                                        <TagIcon className="w-4 h-4 text-black dark:text-brand-neon" />
                                        {category.name}
                                    </td>
                                    <td className="px-6 py-4">
                                        {category.megaMenu ? (
                                            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-[10px] font-bold px-2 py-1 uppercase tracking-wider">Méga Menu</span>
                                        ) : category.subCategories ? (
                                            <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-brand-neon border border-green-200 dark:border-brand-neon/30 text-[10px] font-bold px-2 py-1 uppercase tracking-wider">Liste Simple</span>
                                        ) : (
                                            <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 text-[10px] font-bold px-2 py-1 uppercase tracking-wider">Vide</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-gray-500 dark:text-gray-400">
                                        {category.megaMenu ? `${category.megaMenu.length} groupe(s)` : category.subCategories ? `${category.subCategories.length} lien(s)` : '0'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openEditModal(category)} className="p-2 bg-gray-100 dark:bg-black border border-gray-200 dark:border-gray-700 hover:border-black dark:hover:border-brand-neon text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-brand-neon transition-all">
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeleteCategory(category.name)} className="p-2 bg-gray-100 dark:bg-black border border-gray-200 dark:border-gray-700 hover:border-red-500 text-gray-500 dark:text-gray-400 hover:text-red-500 transition-all">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            </div>

            {isModalOpen && (
                <CategoryFormModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveCategory}
                    category={editingCategory}
                />
            )}
        </div>
    );
};
