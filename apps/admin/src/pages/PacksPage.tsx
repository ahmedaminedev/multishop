import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';

export interface PackData {
  _id?: string;
  id?: number;
  name: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  imageUrl?: string;
  description?: string;
  storeSlug?: string;
  products?: any[];
}

export const PacksPage: React.FC = () => {
  const { currentStoreSlug, apiFetch } = useStore();
  const [packs, setPacks] = useState<PackData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPack, setEditingPack] = useState<PackData | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    oldPrice: '',
    discount: '',
    imageUrl: '',
    description: '',
    storeSlug: currentStoreSlug !== 'all' ? currentStoreSlug : 'parashop'
  });

  const fetchPacks = async () => {
    try {
      setLoading(true);
      const url = currentStoreSlug === 'all' ? '/packs' : `/packs?storeSlug=${currentStoreSlug}`;
      const data = await apiFetch(url);
      setPacks(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error fetching packs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPacks();
  }, [currentStoreSlug]);

  const openCreateModal = () => {
    setEditingPack(null);
    setFormData({
      name: '',
      price: '',
      oldPrice: '',
      discount: '',
      imageUrl: '',
      description: '',
      storeSlug: currentStoreSlug !== 'all' ? currentStoreSlug : 'parashop'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (pack: PackData) => {
    setEditingPack(pack);
    setFormData({
      name: pack.name,
      price: String(pack.price),
      oldPrice: pack.oldPrice ? String(pack.oldPrice) : '',
      discount: pack.discount ? String(pack.discount) : '',
      imageUrl: pack.imageUrl || '',
      description: pack.description || '',
      storeSlug: pack.storeSlug || (currentStoreSlug !== 'all' ? currentStoreSlug : 'parashop')
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number | string | undefined) => {
    if (!id) return;
    if (!window.confirm('Voulez-vous vraiment supprimer ce pack promotionnel ?')) return;
    try {
      await apiFetch(`/packs/${id}`, { method: 'DELETE' });
      fetchPacks();
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: Number(formData.price),
      oldPrice: formData.oldPrice ? Number(formData.oldPrice) : undefined,
      discount: formData.discount ? Number(formData.discount) : undefined,
      storeSlug: formData.storeSlug
    };

    try {
      if (editingPack) {
        await apiFetch(`/packs/${editingPack.id || editingPack._id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await apiFetch('/packs', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
      setIsModalOpen(false);
      fetchPacks();
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestion des Packs & Bundles</h1>
          <p className="text-sm text-slate-500 mt-1">
            Offres groupées, packs exclusifs et réductions combinées par boutique.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Créer un Pack
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">Chargement des packs...</div>
        ) : packs.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">Aucun pack configuré pour cette sélection.</div>
        ) : (
          packs.map((pack) => (
            <div key={pack._id || pack.id} className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between">
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono">
                    {pack.storeSlug}
                  </span>
                  {pack.discount && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      -{pack.discount}%
                    </span>
                  )}
                </div>

                <div className="flex gap-4 mb-3">
                  {pack.imageUrl ? (
                    <img src={pack.imageUrl} alt={pack.name} className="w-16 h-16 rounded-lg object-cover border border-slate-100 shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-2xl shrink-0">📦</div>
                  )}
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-2">{pack.name}</h3>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-extrabold text-base text-slate-900">{pack.price} TND</span>
                      {pack.oldPrice && <span className="text-xs text-slate-400 line-through">{pack.oldPrice} TND</span>}
                    </div>
                  </div>
                </div>

                {pack.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 mt-2">{pack.description}</p>
                )}
              </div>

              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(pack)}
                  className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(pack.id || pack._id)}
                  className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl my-8">
            <h2 className="text-lg font-bold text-slate-900 mb-4">{editingPack ? 'Modifier le Pack' : 'Nouveau Pack'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nom du pack</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Prix (TND)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ancien Prix (TND)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.oldPrice}
                    onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">URL Image du Pack</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Boutique</label>
                <select
                  value={formData.storeSlug}
                  onChange={(e) => setFormData({ ...formData, storeSlug: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="parashop">PharmaNature (parashop)</option>
                  <option value="nutritionshop">IronFuel (nutritionshop)</option>
                  <option value="cosmeticshop">Cosmetics Shop (cosmeticshop)</option>
                  <option value="electroshop">Electro Shop (electroshop)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
