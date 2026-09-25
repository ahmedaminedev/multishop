import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';

interface SubCategoryItem {
  name: string;
  link?: string;
}

interface SubCategoryGroup {
  title: string;
  items: SubCategoryItem[];
}

export interface CategoryData {
  _id?: string;
  id?: number | string;
  name: string;
  storeSlug?: string;
  icon?: string;
  subCategories?: string[];
  megaMenu?: SubCategoryGroup[];
}

export const CategoriesPage: React.FC = () => {
  const { currentStoreSlug, apiFetch } = useStore();
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formMenuType, setFormMenuType] = useState<'none' | 'simple' | 'mega'>('none');
  const [formSubCategoriesText, setFormSubCategoriesText] = useState('');
  const [formMegaMenu, setFormMegaMenu] = useState<SubCategoryGroup[]>([]);
  const [formTargetStore, setFormTargetStore] = useState(currentStoreSlug !== 'all' ? currentStoreSlug : 'parashop');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const url = currentStoreSlug === 'all' ? '/categories' : `/categories?storeSlug=${currentStoreSlug}`;
      const data = await apiFetch(url);
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error fetching categories:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [currentStoreSlug]);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormName('');
    setFormMenuType('none');
    setFormSubCategoriesText('');
    setFormMegaMenu([]);
    setFormTargetStore(currentStoreSlug !== 'all' ? currentStoreSlug : 'parashop');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: CategoryData) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormTargetStore(cat.storeSlug || (currentStoreSlug !== 'all' ? currentStoreSlug : 'parashop'));
    if (cat.megaMenu && cat.megaMenu.length > 0) {
      setFormMenuType('mega');
      setFormMegaMenu(cat.megaMenu);
      setFormSubCategoriesText('');
    } else if (cat.subCategories && cat.subCategories.length > 0) {
      setFormMenuType('simple');
      setFormSubCategoriesText(cat.subCategories.join('\n'));
      setFormMegaMenu([]);
    } else {
      setFormMenuType('none');
      setFormSubCategoriesText('');
      setFormMegaMenu([]);
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (cat: CategoryData) => {
    if (!window.confirm(`Supprimer définitivement la catégorie "${cat.name}" et toutes ses sous-catégories associées ?`)) return;
    try {
      await apiFetch(`/categories/${cat._id || cat.name}`);
      fetchCategories();
    } catch (err: any) {
      // In case apiFetch requires DELETE method
      try {
        await apiFetch(`/categories/${cat._id || cat.name}`, { method: 'DELETE' });
        fetchCategories();
      } catch (e: any) {
        alert(`Erreur: ${e.message}`);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    let subCategories: string[] = [];
    let megaMenu: SubCategoryGroup[] | undefined = undefined;

    if (formMenuType === 'simple') {
      subCategories = formSubCategoriesText
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);
    } else if (formMenuType === 'mega') {
      megaMenu = formMegaMenu;
    }

    const payload: Partial<CategoryData> = {
      name: formName.trim(),
      subCategories,
      megaMenu,
      storeSlug: formTargetStore
    };

    try {
      if (editingCategory) {
        await apiFetch(`/categories/${editingCategory._id || editingCategory.name}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await apiFetch('/categories', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    }
  };

  // MegaMenu Helpers
  const addMegaGroup = () => {
    setFormMegaMenu([...formMegaMenu, { title: 'Nouveau Groupe', items: [{ name: 'Sous-catégorie' }] }]);
  };

  const removeMegaGroup = (idx: number) => {
    setFormMegaMenu(formMegaMenu.filter((_, i) => i !== idx));
  };

  const updateMegaGroupTitle = (idx: number, title: string) => {
    const updated = [...formMegaMenu];
    updated[idx].title = title;
    setFormMegaMenu(updated);
  };

  const addMegaItem = (groupIdx: number) => {
    const updated = [...formMegaMenu];
    updated[groupIdx].items.push({ name: 'Nouvel élément' });
    setFormMegaMenu(updated);
  };

  const removeMegaItem = (groupIdx: number, itemIdx: number) => {
    const updated = [...formMegaMenu];
    updated[groupIdx].items = updated[groupIdx].items.filter((_, i) => i !== itemIdx);
    setFormMegaMenu(updated);
  };

  const updateMegaItemName = (groupIdx: number, itemIdx: number, name: string) => {
    const updated = [...formMegaMenu];
    updated[groupIdx].items[itemIdx].name = name;
    setFormMegaMenu(updated);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestion des Catégories & Sous-Catégories</h1>
          <p className="text-sm text-slate-500 mt-1">
            Structure dynamique des rayons, listes simples et Méga Menus arborescents synchronisés en base de données.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter une Catégorie
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Catégorie</th>
                <th className="px-5 py-3.5">Boutique</th>
                <th className="px-5 py-3.5">Type de sous-menu</th>
                <th className="px-5 py-3.5">Sous-catégories / Éléments</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                    Chargement des catégories depuis l'API...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                    Aucune catégorie enregistrée. Cliquez sur "Ajouter une Catégorie" pour en créer une.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => {
                  const isMega = cat.megaMenu && cat.megaMenu.length > 0;
                  const isSimple = cat.subCategories && cat.subCategories.length > 0;
                  const totalItems = isMega
                    ? cat.megaMenu!.reduce((sum, g) => sum + (g.items?.length || 0), 0)
                    : isSimple
                    ? cat.subCategories!.length
                    : 0;

                  return (
                    <tr key={cat._id || cat.name} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900 text-sm">{cat.name}</div>
                        <div className="text-xs text-slate-400 font-mono">id: {cat._id || cat.id || 'auto'}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                          {cat.storeSlug || 'parashop'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {isMega ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            Méga Menu ({cat.megaMenu!.length} groupes)
                          </span>
                        ) : isSimple ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Liste Simple ({cat.subCategories!.length} sous-catégories)
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                            Aucun sous-menu
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {isMega ? (
                          <div className="flex flex-wrap gap-1 max-w-md">
                            {cat.megaMenu!.map((group, idx) => (
                              <span key={idx} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                                {group.title} ({group.items?.length || 0})
                              </span>
                            ))}
                          </div>
                        ) : isSimple ? (
                          <div className="flex flex-wrap gap-1 max-w-md">
                            {cat.subCategories!.slice(0, 4).map((sub, idx) => (
                              <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                {sub}
                              </span>
                            ))}
                            {cat.subCategories!.length > 4 && (
                              <span className="text-xs text-slate-400">+{cat.subCategories!.length - 4} autres</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Rayon direct</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(cat)}
                            className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors"
                          >
                            Éditer
                          </button>
                          <button
                            onClick={() => handleDelete(cat)}
                            className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded transition-colors"
                          >
                            Supprimer
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

      {/* Modal for Add / Edit Category */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingCategory ? 'Modifier la Catégorie' : 'Créer une Catégorie'}
                </h2>
                <p className="text-xs text-slate-500">Mise à jour dynamique instantanée de la base de données.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nom de la catégorie <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex: Soins Visage, Multimédia..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Boutique (Tenant)</label>
                  <select
                    value={formTargetStore}
                    onChange={(e) => setFormTargetStore(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    <option value="parashop">PharmaNature (parashop)</option>
                    <option value="nutritionshop">IronFuel Nutrition (nutritionshop)</option>
                    <option value="cosmeticshop">Cosmetics Shop (cosmeticshop)</option>
                    <option value="electroshop">Electro Shop (electroshop)</option>
                  </select>
                </div>
              </div>

              {/* Menu Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Type d'organisation des sous-catégories</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormMenuType('none')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                      formMenuType === 'none'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Aucun sous-menu
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormMenuType('simple')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                      formMenuType === 'simple'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Liste Simple
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormMenuType('mega')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                      formMenuType === 'mega'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Méga Menu Arborescent
                  </button>
                </div>
              </div>

              {/* Simple Subcategories input */}
              {formMenuType === 'simple' && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sous-catégories (une par ligne)
                  </label>
                  <textarea
                    rows={4}
                    value={formSubCategoriesText}
                    onChange={(e) => setFormSubCategoriesText(e.target.value)}
                    placeholder="Vitamines&#10;Sommeil&#10;Énergie&#10;Articulations"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-sans"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Chaque saut de ligne représentera une sous-catégorie indépendante accessible par le client.
                  </span>
                </div>
              )}

              {/* Mega Menu Builder */}
              {formMenuType === 'mega' && (
                <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200 max-h-80 overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Groupes du Méga Menu</span>
                    <button
                      type="button"
                      onClick={addMegaGroup}
                      className="px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
                    >
                      + Ajouter un groupe
                    </button>
                  </div>

                  {formMegaMenu.length === 0 ? (
                    <div className="text-xs text-slate-400 text-center py-4">
                      Aucun groupe configuré. Cliquez sur "+ Ajouter un groupe" pour commencer.
                    </div>
                  ) : (
                    formMegaMenu.map((group, groupIdx) => (
                      <div key={groupIdx} className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={group.title}
                            onChange={(e) => updateMegaGroupTitle(groupIdx, e.target.value)}
                            placeholder="Titre du groupe (ex: Teint, Lave-linge...)"
                            className="flex-1 font-bold text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => removeMegaGroup(groupIdx)}
                            className="text-xs text-rose-600 hover:text-rose-800 p-1"
                            title="Supprimer ce groupe"
                          >
                            ✕
                          </button>
                        </div>

                        {/* Items inside this group */}
                        <div className="pl-3 border-l-2 border-slate-200 space-y-2">
                          {group.items.map((item, itemIdx) => (
                            <div key={itemIdx} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => updateMegaItemName(groupIdx, itemIdx, e.target.value)}
                                placeholder="Nom de l'élément (ex: Fond de teint)"
                                className="flex-1 text-xs px-2 py-1 border border-slate-200 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => removeMegaItem(groupIdx, itemIdx)}
                                className="text-slate-400 hover:text-rose-600 text-xs px-1"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addMegaItem(groupIdx)}
                            className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold"
                          >
                            + Ajouter un sous-élément
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  Enregistrer en Base
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
