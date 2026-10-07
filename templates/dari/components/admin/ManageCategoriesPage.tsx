import React, { useState } from 'react';
import type { Category } from '../../types';
import { Plus, Edit2, Trash2, FolderTree } from 'lucide-react';
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
  const { addToast } = useToast();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formImage, setFormImage] = useState('');

  const handleOpenModal = (cat?: Category) => {
    if (cat) {
      setEditingCategory(cat);
      setFormName(cat.name);
      setFormDesc(cat.description || '');
      setFormImage(cat.image || '');
    } else {
      setEditingCategory(null);
      setFormName('');
      setFormDesc('');
      setFormImage('');
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const catData: Category = {
      id: editingCategory?.id || Date.now(),
      name: formName,
      description: formDesc,
      image: formImage || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=600'
    };

    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.name, catData);
        setCategories(prev => prev.map(c => c.name === editingCategory.name ? catData : c));
        addToast(`Rayon "${formName}" mis à jour !`, 'success');
      } else {
        await api.createCategory(catData);
        setCategories(prev => [...prev, catData]);
        addToast(`Rayon "${formName}" créé avec succès !`, 'success');
      }
    } catch {
      setCategories(prev => editingCategory ? prev.map(c => c.name === editingCategory.name ? catData : c) : [...prev, catData]);
      addToast('Enregistré localement', 'info');
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (name: string) => {
    if (!window.confirm(`Supprimer le rayon "${name}" ?`)) return;
    try {
      await api.deleteCategory(name);
    } catch {}
    setCategories(prev => prev.filter(c => c.name !== name));
    addToast(`Rayon "${name}" supprimé.`, 'info');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase font-serif">
            Rayons & Catégories DariShop
          </h2>
          <p className="text-xs text-slate-500">Gérez l'arborescence des univers décoration et mobilier.</p>
        </div>
        <button
          type="button"
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Rayon Déco</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((c) => (
          <div key={c.id || c.name} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex gap-4">
              <img src={c.image || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=400'} alt="" className="w-16 h-16 rounded-2xl object-cover bg-slate-100 shrink-0" />
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate font-serif">{c.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">{c.description || 'Rayon décoration intérieure'}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleOpenModal(c)}
                className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl cursor-pointer"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(c.name)}
                className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white font-serif">
              {editingCategory ? 'Modifier le Rayon' : 'Nouveau Rayon Déco'}
            </h3>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Nom du rayon</label>
              <input
                type="text"
                required
                value={formName}
                onChange={e => setFormName(e.target.value)}
                placeholder="Ex: Luminaires d'Ambiance"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Description</label>
              <textarea
                rows={2}
                value={formDesc}
                onChange={e => setFormDesc(e.target.value)}
                placeholder="Description du rayon..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Image URL</label>
              <input
                type="text"
                value={formImage}
                onChange={e => setFormImage(e.target.value)}
                placeholder="URL de l'image..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 cursor-pointer font-bold"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold cursor-pointer"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
