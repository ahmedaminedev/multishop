import React, { useState } from 'react';
import type { Category } from '../../types';
import { Plus, Edit2, Trash2, Tag, FolderTree, Baby, Sparkles } from 'lucide-react';
import { CategoryFormModal } from './CategoryFormModal';
import { api } from '../../utils/api';
import { useToast } from '../ToastContext';

interface ManageCategoriesPageProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

export const ManageCategoriesPage: React.FC<ManageCategoriesPageProps> = ({
  categories,
  setCategories
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { addToast } = useToast();

  const handleSaveCategory = async (categoryData: Category) => {
    try {
      if (editingCategory) {
        // Update existing
        const targetIdentifier = editingCategory.name;
        await api.updateCategory(targetIdentifier, categoryData);
        setCategories(prev =>
          prev.map(c => (c.name === editingCategory.name ? categoryData : c))
        );
        addToast(`Catégorie "${categoryData.name}" mise à jour avec succès !`, 'success');
      } else {
        // Create new
        const created = await api.createCategory(categoryData);
        setCategories(prev => [...prev, created || categoryData]);
        addToast(`Catégorie "${categoryData.name}" créée avec succès !`, 'success');
      }
    } catch (e: any) {
      // Local fallback in case of transient error
      if (editingCategory) {
        setCategories(prev =>
          prev.map(c => (c.name === editingCategory.name ? categoryData : c))
        );
      } else {
        setCategories(prev => [...prev, categoryData]);
      }
      addToast(`Catégorie enregistrée localement`, 'info');
    }
  };

  const handleDeleteCategory = async (categoryName: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${categoryName}" de YoupiShop ?`)) {
      try {
        await api.deleteCategory(categoryName);
        setCategories(prev => prev.filter(c => c.name !== categoryName));
        addToast(`Catégorie "${categoryName}" supprimée.`, 'info');
      } catch (e) {
        setCategories(prev => prev.filter(c => c.name !== categoryName));
        addToast(`Catégorie supprimée localement.`, 'info');
      }
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
    <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-white font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🧸</span>
            <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/50 px-2.5 py-0.5 rounded-full">
              YoupiShop Backoffice
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Structure des <span className="text-amber-500">Catégories</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gérez les tranches d'âge, le méga menu et l'organisation du catalogue jouets
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle Catégorie</span>
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] text-slate-500 dark:text-slate-400 uppercase bg-slate-100/60 dark:bg-slate-800/60 font-black tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th scope="col" className="px-6 py-4">Catégorie</th>
                <th scope="col" className="px-6 py-4">Tranche d'Âge</th>
                <th scope="col" className="px-6 py-4">Type de Menu</th>
                <th scope="col" className="px-6 py-4">Contenu</th>
                <th scope="col" className="px-6 py-4">Thème</th>
                <th scope="col" className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {categories.map((category, idx) => (
                <tr
                  key={category.name || idx}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 flex items-center justify-center text-lg shadow-2xs">
                        {category.icon || '🧸'}
                      </div>
                      <div>
                        <div className="text-sm font-black text-slate-900 dark:text-white">
                          {category.name}
                        </div>
                        {category.slug && (
                          <div className="text-[11px] font-mono text-slate-400">
                            /{category.slug}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50">
                      <Baby className="w-3 h-3 text-amber-600" />
                      <span>{category.ageRange || 'Tous âges'}</span>
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    {category.megaMenu && category.megaMenu.length > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        <Sparkles className="w-3 h-3" />
                        <span>Méga Menu</span>
                      </span>
                    ) : category.subCategories && category.subCategories.length > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        <FolderTree className="w-3 h-3" />
                        <span>Liste Simple</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                        Direct
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                    {category.megaMenu && category.megaMenu.length > 0
                      ? `${category.megaMenu.length} groupe(s)`
                      : category.subCategories && category.subCategories.length > 0
                      ? `${category.subCategories.length} lien(s)`
                      : 'Lien direct'}
                  </td>

                  <td className="px-6 py-4">
                    <span className="inline-block w-4 h-4 rounded-full bg-amber-400 border border-white shadow-xs"></span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(category)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 hover:text-amber-700 dark:text-slate-300 transition-colors"
                        title="Modifier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.name)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-red-100 dark:bg-slate-800 dark:hover:bg-red-950/30 text-slate-600 hover:text-red-600 dark:text-slate-300 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCategory}
        category={editingCategory}
      />
    </div>
  );
};
