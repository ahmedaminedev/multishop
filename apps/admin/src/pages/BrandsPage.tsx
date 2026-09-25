import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';

interface BrandData {
  id: number | string;
  _id?: string;
  name: string;
  logoUrl?: string;
  featured?: boolean;
  storeSlug?: string;
}

export const BrandsPage: React.FC = () => {
  const { currentStoreSlug, apiFetch } = useStore();
  const [brands, setBrands] = useState<BrandData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandData | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    logoUrl: '',
    featured: true,
    storeSlug: currentStoreSlug !== 'all' ? currentStoreSlug : 'parashop'
  });

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const url = currentStoreSlug === 'all' ? '/brands' : `/brands?storeSlug=${currentStoreSlug}`;
      const data = await apiFetch(url);
      setBrands(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error fetching brands:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, [currentStoreSlug]);

  const openCreateModal = () => {
    setEditingBrand(null);
    setFormData({
      name: '',
      logoUrl: '',
      featured: true,
      storeSlug: currentStoreSlug !== 'all' ? currentStoreSlug : 'parashop'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (brand: BrandData) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      logoUrl: brand.logoUrl || '',
      featured: brand.featured !== undefined ? brand.featured : true,
      storeSlug: brand.storeSlug || (currentStoreSlug !== 'all' ? currentStoreSlug : 'parashop')
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number | string) => {
    if (!window.confirm('Supprimer cette marque partenaire ?')) return;
    try {
      await apiFetch(`/brands/${id}`, { method: 'DELETE' });
      fetchBrands();
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBrand) {
        await apiFetch(`/brands/${editingBrand.id || editingBrand._id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
      } else {
        await apiFetch('/brands', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }
      setIsModalOpen(false);
      fetchBrands();
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestion des Marques & Partenaires</h1>
          <p className="text-sm text-slate-500 mt-1">
            Marques officielles distribuées sur chaque boutique (logos, mise en avant carrousel).
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter une Marque
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">Chargement des marques...</div>
        ) : brands.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">Aucune marque trouvée.</div>
        ) : (
          brands.map((b) => (
            <div key={b.id || b._id} className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between items-center text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 mb-3 overflow-hidden border border-slate-200">
                {b.logoUrl ? (
                  <img src={b.logoUrl} alt={b.name} className="w-full h-full object-contain" />
                ) : (
                  <span>{b.name.substring(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div className="w-full">
                <div className="font-bold text-xs text-slate-900 truncate">{b.name}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{b.storeSlug}</div>
              </div>
              <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-slate-100 w-full justify-center">
                <button
                  onClick={() => openEditModal(b)}
                  className="p-1 text-slate-500 hover:text-indigo-600 text-xs font-semibold"
                  title="Éditer"
                >
                  ✎
                </button>
                <button
                  onClick={() => handleDelete(b.id || b._id!)}
                  className="p-1 text-slate-400 hover:text-rose-600 text-xs"
                  title="Supprimer"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900 mb-4">{editingBrand ? 'Modifier la Marque' : 'Nouvelle Marque'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nom de la marque</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">URL Logo (Optionnel)</label>
                <input
                  type="url"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
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
                  <option value="parashop">PharmaNature</option>
                  <option value="nutritionshop">IronFuel</option>
                  <option value="cosmeticshop">Cosmetics Shop</option>
                  <option value="electroshop">Electro Shop</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured-brand"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded text-indigo-600 w-4 h-4"
                />
                <label htmlFor="featured-brand" className="text-xs font-semibold text-slate-700">Mettre en avant</label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
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
