import React, { useState } from 'react';
import { useStore, Store } from '../context/StoreContext';

export const StoresPage: React.FC = () => {
  const { stores, refreshStores, apiFetch, setCurrentStoreSlug } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStore, setNewStore] = useState({
    name: '',
    slug: '',
    themeColor: '#2563eb',
    description: '',
    currency: 'TND',
    categoryTheme: 'Général'
  });

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/stores', {
        method: 'POST',
        body: JSON.stringify(newStore)
      });
      await refreshStores();
      setShowAddModal(false);
      setNewStore({ name: '', slug: '', themeColor: '#2563eb', description: '', currency: 'TND', categoryTheme: 'Général' });
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestion des Boutiques (Tenants)</h1>
          <p className="text-sm text-slate-500 mt-1">
            Configurez et supervisez vos 4 boutiques e-commerce indépendantes ou déployez-en de nouvelles.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Créer une Boutique
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {stores.map((s) => (
          <div key={s.slug} className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-sm"
                    style={{ backgroundColor: s.themeColor || '#6366f1' }}
                  >
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{s.name}</h2>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      slug: {s.slug}
                    </span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Active
                </span>
              </div>

              <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                {s.description || 'Boutique thématique dédiée intégrée à la suite multi-tenant.'}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
                <div>
                  <span className="block text-slate-400">Devise :</span>
                  <span className="font-semibold text-slate-700">{s.currency || 'TND'}</span>
                </div>
                <div>
                  <span className="block text-slate-400">URI interne :</span>
                  <span className="font-mono text-indigo-600">/{s.slug}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setCurrentStoreSlug(s.slug)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Gérer cette boutique →
              </button>
              <a
                href={`/${s.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Ouvrir le site ↗
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Ajouter une Nouvelle Boutique</h2>
            <form onSubmit={handleCreateStore} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nom de la boutique</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: BioShop Tunisie"
                  value={newStore.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '');
                    setNewStore({ ...newStore, name, slug });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Identifiant unique (slug)</label>
                <input
                  type="text"
                  required
                  placeholder="bioshop"
                  value={newStore.slug}
                  onChange={(e) => setNewStore({ ...newStore, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Couleur thématique</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={newStore.themeColor}
                    onChange={(e) => setNewStore({ ...newStore, themeColor: e.target.value })}
                    className="w-10 h-10 rounded border border-slate-200 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-600">{newStore.themeColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description courte</label>
                <textarea
                  rows={2}
                  value={newStore.description}
                  onChange={(e) => setNewStore({ ...newStore, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Spécialité, cible et positionnement..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  Créer la Boutique
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
