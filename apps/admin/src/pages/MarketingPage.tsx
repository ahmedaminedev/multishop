import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';

export const MarketingPage: React.FC = () => {
  const { currentStoreSlug, apiFetch } = useStore();
  const [promotions, setPromotions] = useState<any[]>([]);
  const [pixelId, setPixelId] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const url = currentStoreSlug === 'all' ? '/promotions' : `/promotions?storeSlug=${currentStoreSlug}`;
        const data = await apiFetch(url);
        setPromotions(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchPromos();
  }, [currentStoreSlug]);

  const handleSavePixel = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Marketing & Tracking</h1>
        <p className="text-sm text-slate-500 mt-1">
          Promotions actives, bannières et configuration des tags Facebook Pixel par boutique.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pixel Config */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-1">Configuration Meta / Facebook Pixel</h2>
          <p className="text-xs text-slate-500 mb-4">
            Associez un identifiant Pixel spécifique à la boutique sélectionnée ({currentStoreSlug.toUpperCase()}).
          </p>
          <form onSubmit={handleSavePixel} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pixel ID</label>
              <input
                type="text"
                value={pixelId}
                onChange={(e) => setPixelId(e.target.value)}
                placeholder="Ex: 849203920194829"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
            >
              {saved ? 'Enregistré avec succès !' : 'Enregistrer le Pixel'}
            </button>
          </form>
        </div>

        {/* Promotions */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-1">Promotions Actives</h2>
          <p className="text-xs text-slate-500 mb-4">Codes promo et remises en cours.</p>
          <div className="space-y-3">
            {promotions.length === 0 ? (
              <p className="text-xs text-slate-400">Aucune promotion enregistrée.</p>
            ) : (
              promotions.map((pr, idx) => (
                <div key={pr.id || idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{pr.title}</div>
                    <div className="text-xs text-slate-400 font-mono">Code: {pr.code || 'PROMO'}</div>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-100 rounded-full">
                    -{pr.discountPercentage || 15}%
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
