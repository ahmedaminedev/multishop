import React, { useState } from 'react';
import type { Pack, Product, Category } from '../../types';
import { Plus, Edit2, Trash2, Boxes, Sparkles, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { PackFormModal } from './PackFormModal';
import { api } from '../../utils/api';
import { useToast } from '../ToastContext';

interface ManagePacksPageProps {
  packs: Pack[];
  setPacks: React.Dispatch<React.SetStateAction<Pack[]>>;
  allProducts?: Product[];
  allCategories?: Category[];
}

const isPackAvailable = (pack: Pack, allProducts: Product[] = [], allPacks: Pack[] = []): boolean => {
  if (pack.includedProductIds && pack.includedProductIds.length > 0) {
    for (const productId of pack.includedProductIds) {
      const product = allProducts.find(p => p.id === productId);
      if (!product || ((product.quantity ?? 0) <= 0 && (product.quantité_enstock ?? 0) <= 0)) {
        return false;
      }
    }
  }
  if (pack.includedPackIds && pack.includedPackIds.length > 0) {
    for (const subPackId of pack.includedPackIds) {
      const subPack = allPacks.find(p => p.id === subPackId);
      if (!subPack || !isPackAvailable(subPack, allProducts, allPacks)) {
        return false;
      }
    }
  }
  return true;
};

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
        await api.updatePack(editingPack.id, packData);
        setPacks(prev =>
          prev.map(p => (p.id === editingPack.id ? ({ ...packData, id: p.id } as Pack) : p))
        );
        addToast(`Pack déco "${packData.name || packData.title}" mis à jour avec succès !`, 'success');
      } else {
        const created = await api.createPack(packData);
        const newPack = created || { ...packData, id: Date.now() };
        setPacks(prev => [...prev, newPack as Pack]);
        addToast(`Pack déco "${packData.name || packData.title}" créé avec succès !`, 'success');
      }
    } catch {
      if (editingPack) {
        setPacks(prev =>
          prev.map(p => (p.id === editingPack.id ? ({ ...packData, id: p.id } as Pack) : p))
        );
      } else {
        setPacks(prev => [...prev, { ...packData, id: Date.now() } as Pack]);
      }
      addToast('Pack déco enregistré localement', 'info');
    }
  };

  const handleDeletePack = async (packId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce pack déco / ensemble mobilier ?')) {
      try {
        await api.deletePack(packId);
        setPacks(prev => prev.filter(p => p.id !== packId));
        addToast('Pack supprimé de la base de données.', 'info');
      } catch {
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
    <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-white font-sans space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🏠</span>
            <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950/50 px-2.5 py-0.5 rounded-full">
              Packs & Bundles DariShop
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-serif">
            Gestion des <span className="text-indigo-600 dark:text-indigo-400">Packs Pièces & Salons</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Composez des ensembles harmonisés (Canapé + Table + Luminaire, Suite parentale) avec calcul automatique des prix et contrôle des stocks
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un Pack Déco</span>
        </button>
      </div>

      {/* Table view matching FitnessShop & YoupiShop */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] text-slate-500 dark:text-slate-400 uppercase bg-slate-100/60 dark:bg-slate-800/60 font-black tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th scope="col" className="px-6 py-4">Aperçu</th>
                <th scope="col" className="px-6 py-4">Nom du Pack & Pièce</th>
                <th scope="col" className="px-6 py-4">Prix & Remise</th>
                <th scope="col" className="px-6 py-4">Composition & Articles</th>
                <th scope="col" className="px-6 py-4">Disponibilité Stock</th>
                <th scope="col" className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {packs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                    Aucun pack configuré pour le moment. Cliquez sur "Ajouter un Pack Déco" pour composer votre première offre salon ou chambre.
                  </td>
                </tr>
              ) : (
                packs.map(pack => {
                  const available = isPackAvailable(pack, allProducts, packs);
                  const packTitle = pack.name || pack.title || 'Pack Déco';
                  const itemsCount = (pack.includedProductIds?.length) || (pack.includedItems?.length) || 0;
                  const subPacksCount = pack.includedPackIds?.length || 0;
                  const originalP = Number(pack.oldPrice || pack.originalPrice || 0);

                  return (
                    <tr
                      key={pack.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Image Thumbnail */}
                      <td className="px-6 py-4">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-2xs">
                          <img
                            src={pack.imageUrl}
                            alt={packTitle}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>

                      {/* Name & Badge */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white uppercase font-serif text-sm">
                              {packTitle}
                            </span>
                            {pack.badge && (
                              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                {pack.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-sm">
                            {pack.description}
                          </p>
                        </div>
                      </td>

                      {/* Price & Discount */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-slate-900 dark:text-white font-mono font-black text-base">
                            {Number(pack.price).toLocaleString('fr-FR')} DT
                          </span>
                          {originalP > pack.price && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                              <span className="line-through font-mono">
                                {originalP.toLocaleString('fr-FR')} DT
                              </span>
                              {pack.discount && (
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.2 rounded">
                                  -{pack.discount}%
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Composition */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <Boxes className="w-3.5 h-3.5 text-indigo-600" />
                            <span>
                              {itemsCount} meuble{itemsCount > 1 ? 's' : ''}
                              {subPacksCount > 0 ? ` + ${subPacksCount} pack(s)` : ''}
                            </span>
                          </span>
                          {pack.includedItems && pack.includedItems.length > 0 && (
                            <p className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                              {pack.includedItems.join(' • ')}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {available ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>En Stock</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] font-bold">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Stock Épuisé</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(pack)}
                            className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl transition-colors cursor-pointer"
                            title="Modifier ce pack"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePack(pack.id)}
                            className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors cursor-pointer"
                            title="Supprimer ce pack"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <PackFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSavePack}
          pack={editingPack}
          allProducts={allProducts}
          allPacks={packs}
          allCategories={allCategories}
        />
      )}

    </div>
  );
};
