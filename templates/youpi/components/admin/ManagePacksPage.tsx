import React, { useState } from 'react';
import type { Pack, Product, Category } from '../../types';
import { Plus, Edit2, Trash2, Gift, Sparkles, CheckCircle, Package } from 'lucide-react';
import { PackFormModal } from './PackFormModal';
import { api } from '../../utils/api';
import { useToast } from '../ToastContext';

interface ManagePacksPageProps {
  packs: Pack[];
  setPacks: React.Dispatch<React.SetStateAction<Pack[]>>;
  allProducts: Product[];
  allCategories: Category[];
}

export const ManagePacksPage: React.FC<ManagePacksPageProps> = ({
  packs = [],
  setPacks,
  allProducts = [],
  allCategories = []
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPack, setEditingPack] = useState<Pack | null>(null);
  const { addToast } = useToast();

  const handleSavePack = async (packData: Omit<Pack, 'id'>) => {
    try {
      if (editingPack) {
        // Update
        const updated = await api.updatePack(editingPack.id, packData);
        setPacks(prev =>
          prev.map(p => (p.id === editingPack.id ? { ...packData, id: p.id } : p))
        );
        addToast(`Pack "${packData.name}" mis à jour avec succès !`, 'success');
      } else {
        // Create
        const created = await api.createPack(packData);
        const newPack = created || { ...packData, id: Date.now() };
        setPacks(prev => [...prev, newPack]);
        addToast(`Pack "${packData.name}" créé avec succès !`, 'success');
      }
    } catch (e: any) {
      if (editingPack) {
        setPacks(prev =>
          prev.map(p => (p.id === editingPack.id ? { ...packData, id: p.id } : p))
        );
      } else {
        setPacks(prev => [...prev, { ...packData, id: Date.now() }]);
      }
      addToast(`Pack enregistré localement`, 'info');
    }
  };

  const handleDeletePack = async (packId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce pack / coffret cadeau ?')) {
      try {
        await api.deletePack(packId);
        setPacks(prev => prev.filter(p => p.id !== packId));
        addToast('Pack supprimé avec succès.', 'info');
      } catch (e) {
        setPacks(prev => prev.filter(p => p.id !== packId));
        addToast('Pack supprimé localement.', 'info');
      }
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

  return (
    <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-white font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🎁</span>
            <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/50 px-2.5 py-0.5 rounded-full">
              Packs & Bundles YoupiShop
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Gestion des <span className="text-amber-500">Packs & Coffrets</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Proposez des lots de jouets thématiques avec remises irrésistibles
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un Pack</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] text-slate-500 dark:text-slate-400 uppercase bg-slate-100/60 dark:bg-slate-800/60 font-black tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th scope="col" className="px-6 py-4">Aperçu</th>
                <th scope="col" className="px-6 py-4">Nom du Coffret</th>
                <th scope="col" className="px-6 py-4">Prix & Remise</th>
                <th scope="col" className="px-6 py-4">Contenu du Pack</th>
                <th scope="col" className="px-6 py-4">Statut</th>
                <th scope="col" className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {packs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                    Aucun pack configuré pour le moment. Cliquez sur "Ajouter un Pack" pour lancer une offre groupée.
                  </td>
                </tr>
              ) : (
                packs.map(pack => (
                  <tr
                    key={pack.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-2xs">
                        <img
                          src={pack.imageUrl}
                          alt={pack.name || pack.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-black text-slate-900 dark:text-white text-sm">
                        {pack.name || pack.title}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {pack.description}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-black text-amber-600 dark:text-amber-400">
                          {pack.price.toFixed(2)} DT
                        </span>
                        {(pack.oldPrice || pack.originalPrice) && (
                          <span className="text-xs text-slate-400 line-through">
                            {(pack.oldPrice || pack.originalPrice)?.toFixed(2)} DT
                          </span>
                        )}
                      </div>
                      {pack.discount ? (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200">
                          -{pack.discount}%
                        </span>
                      ) : null}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <Package className="w-4 h-4 text-amber-500" />
                        <span>
                          {pack.includedProductIds?.length || pack.includedItems?.length || pack.products?.length || 2} jouet(s) inclus
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>En ligne</span>
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(pack)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 hover:text-amber-700 dark:text-slate-300 transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePack(pack.id)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-red-100 dark:bg-slate-800 dark:hover:bg-red-950/30 text-slate-600 hover:text-red-600 dark:text-slate-300 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <PackFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePack}
        pack={editingPack}
        allProducts={allProducts}
        allPacks={packs}
        allCategories={allCategories}
      />
    </div>
  );
};
