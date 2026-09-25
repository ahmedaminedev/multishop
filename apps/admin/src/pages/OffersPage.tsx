import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';

interface Promotion {
  id?: number | string;
  _id?: string;
  title: string;
  code?: string;
  discountPercentage: number;
  active?: boolean;
  storeSlug?: string;
  description?: string;
}

export const OffersPage: React.FC = () => {
  const { currentStoreSlug, apiFetch } = useStore();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [offersConfig, setOffersConfig] = useState<any>({
    headerOffer: { text: "Livraison gratuite dès 100 TND d'achat", active: true },
    flashSale: { active: true, discount: 20, endsAt: new Date(Date.now() + 86400000).toISOString() }
  });
  const [loading, setLoading] = useState(true);
  const [configSaved, setConfigSaved] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);

  const [promoForm, setPromoForm] = useState({
    title: '',
    code: '',
    discountPercentage: 15,
    description: '',
    storeSlug: currentStoreSlug !== 'all' ? currentStoreSlug : 'parashop'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const urlPromos = currentStoreSlug === 'all' ? '/promotions' : `/promotions?storeSlug=${currentStoreSlug}`;
      const [promosData, configData] = await Promise.all([
        apiFetch(urlPromos),
        apiFetch('/offers-config').catch(() => null)
      ]);
      setPromotions(Array.isArray(promosData) ? promosData : []);
      if (configData) setOffersConfig(configData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentStoreSlug]);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/offers-config', {
        method: 'PUT',
        body: JSON.stringify(offersConfig)
      });
      setConfigSaved(true);
      setTimeout(() => setConfigSaved(false), 2500);
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    }
  };

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...promoForm,
      discountPercentage: Number(promoForm.discountPercentage),
      storeSlug: promoForm.storeSlug
    };

    try {
      if (editingPromo) {
        await apiFetch(`/promotions/${editingPromo.id || editingPromo._id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await apiFetch('/promotions', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
      setIsPromoModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    }
  };

  const handleDeletePromo = async (id: number | string | undefined) => {
    if (!id) return;
    if (!window.confirm('Supprimer ce code promotionnel ?')) return;
    try {
      await apiFetch(`/promotions/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestion des Offres & Promotions</h1>
          <p className="text-sm text-slate-500 mt-1">
            Bandeau d'entête supérieur, ventes flashs et codes promotionnels par boutique.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingPromo(null);
            setPromoForm({
              title: '',
              code: 'PROMO15',
              discountPercentage: 15,
              description: '',
              storeSlug: currentStoreSlug !== 'all' ? currentStoreSlug : 'parashop'
            });
            setIsPromoModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Créer un Code Promo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Header Ticker and Flash Sale Settings */}
        <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Bandeau d'En-tête & Vente Flash</span>
          </h2>

          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Texte d'En-tête (Ticker Notification)</span>
                <input
                  type="checkbox"
                  checked={offersConfig.headerOffer?.active ?? true}
                  onChange={(e) => setOffersConfig({
                    ...offersConfig,
                    headerOffer: { ...offersConfig.headerOffer, active: e.target.checked }
                  })}
                  className="rounded text-indigo-600 w-4 h-4"
                />
              </div>
              <input
                type="text"
                value={offersConfig.headerOffer?.text || ''}
                onChange={(e) => setOffersConfig({
                  ...offersConfig,
                  headerOffer: { ...offersConfig.headerOffer, text: e.target.value }
                })}
                placeholder="Ex: Livraison gratuite dès 100 TND d'achat"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Vente Flash Programmée</span>
                <input
                  type="checkbox"
                  checked={offersConfig.flashSale?.active ?? true}
                  onChange={(e) => setOffersConfig({
                    ...offersConfig,
                    flashSale: { ...offersConfig.flashSale, active: e.target.checked }
                  })}
                  className="rounded text-indigo-600 w-4 h-4"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Pourcentage de remise (%)</label>
                <input
                  type="number"
                  value={offersConfig.flashSale?.discount || 20}
                  onChange={(e) => setOffersConfig({
                    ...offersConfig,
                    flashSale: { ...offersConfig.flashSale, discount: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              {configSaved ? (
                <span className="text-xs text-emerald-600 font-semibold">✓ Modifications enregistrées !</span>
              ) : <span />}
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
              >
                Mettre à jour les Offres
              </button>
            </div>
          </form>
        </div>

        {/* Promotions List */}
        <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900">Codes Promotions Actifs</h2>
          <div className="space-y-3 max-h-[420px] overflow-y-auto">
            {promotions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">Aucun code promo créé.</div>
            ) : (
              promotions.map((promo) => (
                <div key={promo.id || promo._id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-slate-900">{promo.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-semibold">
                        {promo.code || 'PROMO'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {promo.storeSlug}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 text-xs font-extrabold rounded-full bg-emerald-100 text-emerald-800">
                      -{promo.discountPercentage}%
                    </span>
                    <button
                      onClick={() => handleDeletePromo(promo.id || promo._id)}
                      className="text-slate-400 hover:text-rose-600 text-xs p-1"
                      title="Supprimer"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal for Promo */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Nouveau Code Promo</h2>
            <form onSubmit={handleSavePromo} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Titre de la promotion</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Solde d'Été 2026"
                  value={promoForm.title}
                  onChange={(e) => setPromoForm({ ...promoForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Code coupon</label>
                  <input
                    type="text"
                    required
                    placeholder="ETE20"
                    value={promoForm.code}
                    onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Remise (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    required
                    value={promoForm.discountPercentage}
                    onChange={(e) => setPromoForm({ ...promoForm, discountPercentage: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Boutique</label>
                <select
                  value={promoForm.storeSlug}
                  onChange={(e) => setPromoForm({ ...promoForm, storeSlug: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="parashop">PharmaNature</option>
                  <option value="nutritionshop">IronFuel</option>
                  <option value="cosmeticshop">Cosmetics Shop</option>
                  <option value="electroshop">Electro Shop</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPromoModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  Créer la Promotion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
