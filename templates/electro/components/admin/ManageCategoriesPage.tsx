import React, { useState } from 'react';
import type { Category } from '../../types';
import { PencilIcon, TrashIcon, PlusIcon } from '../IconComponents';
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
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Gérer les Catégories</h1>
                <button 
                    onClick={openCreateModal}
                    className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-red-700 transition-colors"
                >
                    <PlusIcon className="w-5 h-5" />
                    Ajouter une catégorie
                </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Nom</th>
                                <th scope="col" className="px-6 py-3">Type de Menu</th>
                                <th scope="col" className="px-6 py-3">Nombre d'éléments</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map(category => (
                                <tr key={category.name} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{category.name}</td>
                                    <td className="px-6 py-4">
                                        {category.megaMenu ? (
                                            <span className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">Méga Menu</span>
                                        ) : category.subCategories ? (
                                            <span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">Liste Simple</span>
                                        ) : (
                                            <span className="bg-gray-100 text-gray-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">Aucun</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {category.megaMenu ? `${category.megaMenu.length} groupe(s)` : category.subCategories ? `${category.subCategories.length} lien(s)` : '0'}
                                    </td>
                                    <td className="px-6 py-4 flex items-center gap-4">
                                        <button onClick={() => openEditModal(category)} className="text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400">
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDeleteCategory(category.name)} className="text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
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