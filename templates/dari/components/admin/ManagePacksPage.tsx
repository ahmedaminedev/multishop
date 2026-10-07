import React, { useState } from 'react';
import type { Pack } from '../../types';
import { Plus, Edit2, Trash2, Boxes } from 'lucide-react';
import { api } from '../../utils/api';
import { useToast } from '../ToastContext';

interface ManagePacksPageProps {
  packs: Pack[];
  setPacks: React.Dispatch<React.SetStateAction<Pack[]>>;
}

export const ManagePacksPage: React.FC<ManagePacksPageProps> = ({ packs, setPacks }) => {
  const { addToast } = useToast();
  const [editingPack, setEditingPack] = useState<Pack | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState(0);
  const [formOldPrice, setFormOldPrice] = useState(0);
  const [formDesc, setFormDesc] = useState('');
  const [formImage, setFormImage] = useState('');

  const handleOpen = (p?: Pack) => {
    if (p) {
      setEditingPack(p);
      setFormName(p.name || p.title || '');
      setFormPrice(p.price || 0);
      setFormOldPrice(p.originalPrice || p.oldPrice || 0);
      setFormDesc(p.description || '');
      setFormImage(p.imageUrl || '');
    } else {
      setEditingPack(null);
      setFormName('');
      setFormPrice(990);
      setFormOldPrice(1200);
      setFormDesc('');
      setFormImage('');
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const packData: Pack = {
      id: editingPack?.id || Date.now(),
      name: formName,
      title: formName,
      price: Number(formPrice),
      oldPrice: Number(formOldPrice),
      originalPrice: Number(formOldPrice),
      description: formDesc,
      imageUrl: formImage || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800'
    };

    try {
      if (editingPack) {
        await api.updatePack(editingPack.id, packData);
        setPacks(prev => prev.map(p => p.id === editingPack.id ? packData : p));
        addToast(`Pack "${formName}" mis à jour !`, 'success');
      } else {
        await api.createPack(packData);
        setPacks(prev => [...prev, packData]);
        addToast(`Pack "${formName}" créé avec succès !`, 'success');
      }
    } catch {
      setPacks(prev => editingPack ? prev.map(p => p.id === editingPack.id ? packData : p) : [...prev, packData]);
      addToast('Pack enregistré localement', 'info');
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Supprimer ce pack ?')) return;
    try {
      await api.deletePack(id);
    } catch {}
    setPacks(prev => prev.filter(p => p.id !== id));
    addToast('Pack supprimé.', 'info');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase font-serif">
            Packs Pièces & Salons DariShop
          </h2>
          <p className="text-xs text-slate-500">Gérez les offres combinées et bundles pièces harmonisées.</p>
        </div>
        <button
          type="button"
          onClick={() => handleOpen()}
          className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Pack Déco</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packs.map((pack) => (
          <div key={pack.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs flex flex-col justify-between">
            <div className="h-44 relative">
              <img src={pack.imageUrl} alt="" className="w-full h-full object-cover" />
              <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-900/80 text-white text-xs font-black">
                {pack.price} DT
              </span>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white font-serif">{pack.name || pack.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">{pack.description}</p>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleOpen(pack)}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(pack.id)}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white font-serif">
              {editingPack ? 'Modifier le Pack' : 'Nouveau Pack Déco'}
            </h3>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Titre du pack</label>
              <input
                type="text"
                required
                value={formName}
                onChange={e => setFormName(e.target.value)}
                placeholder="Ex: Pack Salon Cosy"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Prix Pack (DT)</label>
                <input
                  type="number"
                  required
                  value={formPrice}
                  onChange={e => setFormPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Prix Original (DT)</label>
                <input
                  type="number"
                  value={formOldPrice}
                  onChange={e => setFormOldPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Description</label>
              <textarea
                rows={2}
                value={formDesc}
                onChange={e => setFormDesc(e.target.value)}
                placeholder="Détails des articles inclus..."
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
