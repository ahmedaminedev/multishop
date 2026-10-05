import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit2, Check, Filter, Layers, Package } from 'lucide-react';
import { FilialeType, FILIALE_CONFIG } from '../../models/ProductFiliale';
import { ImageUploadInput } from '../common/ImageUploadInput';

interface GlobalProductsViewProps {
  products: any[];
  onSaveProduct: (product: any) => Promise<void>;
  activeShop?: string;
  onSelectShop?: (shop: string) => void;
}

export const GlobalProductsView: React.FC<GlobalProductsViewProps> = ({
  products,
  onSaveProduct,
  activeShop = 'all',
  onSelectShop
}) => {
  const [filialeFilter, setFilialeFilter] = useState(activeShop);
  const [boutiqueFilter, setBoutiqueFilter] = useState<'all' | 'in_shop' | 'out_of_shop' | 'out_of_stock'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Keep in sync with parent activeShop context
  React.useEffect(() => {
    setFilialeFilter(activeShop);
  }, [activeShop]);

  const handleShopFilterChange = (shop: string) => {
    setFilialeFilter(shop);
    if (onSelectShop) onSelectShop(shop);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchFiliale = filialeFilter === 'all' || p.filialeKey === filialeFilter;
      const matchSearch = !searchQuery ||
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase());

      const stockQty = p.quantité_enstock ?? p.quantity ?? 0;
      const inBoutique = p.existe_dans_boutique !== false;

      let matchBoutique = true;
      if (boutiqueFilter === 'in_shop') matchBoutique = inBoutique;
      else if (boutiqueFilter === 'out_of_shop') matchBoutique = !inBoutique;
      else if (boutiqueFilter === 'out_of_stock') matchBoutique = stockQty <= 0;

      return matchFiliale && matchSearch && matchBoutique;
    });
  }, [products, filialeFilter, searchQuery, boutiqueFilter]);

  const shopTabs = [
    { id: 'all', label: 'Toutes les filiales', icon: '🌐' },
    { id: 'para', label: 'PharmaShop', icon: '🌿' },
    { id: 'nutrition', label: 'Fitness Shop', icon: '⚡' },
    { id: 'cosmetic', label: 'Cosmetics Shop', icon: '💄' },
    { id: 'electro', label: 'Electro Shop', icon: '🔌' },
  ];

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSaving(true);
    try {
      const updatedProduct = {
        ...editingProduct,
        quantity: editingProduct.quantité_enstock ?? editingProduct.quantity ?? 0,
        quantité_enstock: editingProduct.quantité_enstock ?? editingProduct.quantity ?? 0,
        existe_dans_boutique: editingProduct.existe_dans_boutique !== false
      };
      await onSaveProduct(updatedProduct);
      setEditingProduct(null);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              CATALOGUE CENTRALISÉ <span className="text-blue-600">MULTI-FILIALES</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
              {products.length} références
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Suivi des stocks, statut de publication en boutique et caractéristiques par filiale
          </p>
        </div>

        {/* Quick Shop Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80 overflow-x-auto no-scrollbar">
          {shopTabs.map((st) => {
            const isSelected = filialeFilter === st.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => handleShopFilterChange(st.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <span>{st.icon}</span>
                <span>{st.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher produit, marque, catégorie..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Boutique Publication Status Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl overflow-x-auto">
          <button
            type="button"
            onClick={() => setBoutiqueFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              boutiqueFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tous les statuts ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setBoutiqueFilter('in_shop')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              boutiqueFilter === 'in_shop' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ✅ En boutique
          </button>
          <button
            type="button"
            onClick={() => setBoutiqueFilter('out_of_shop')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              boutiqueFilter === 'out_of_shop' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📦 Hors boutique (À valider)
          </button>
          <button
            type="button"
            onClick={() => setBoutiqueFilter('out_of_stock')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              boutiqueFilter === 'out_of_stock' ? 'bg-white text-red-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⚠️ Rupture
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Article</th>
                <th className="py-3 px-4">Filiale</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4">Prix Public</th>
                <th className="py-3 px-4">Quantité en Stock</th>
                <th className="py-3 px-4">Visibilité Boutique</th>
                <th className="py-3 px-4">Spécificités</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((prod) => {
                const cfg = FILIALE_CONFIG[prod.filialeType as FilialeType] || FILIALE_CONFIG[FilialeType.PRODUIT_MYSHOPS_PARA];
                const stockQty = prod.quantité_enstock ?? prod.quantity ?? 0;
                const isInBoutique = prod.existe_dans_boutique !== false;

                return (
                  <tr key={`${prod.filialeKey}-${prod.id}`} className="hover:bg-slate-50/60 transition-colors">
                    {/* Image & Title */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          loading="lazy"
                          decoding="async"
                          className="w-10 h-10 rounded-lg object-cover bg-slate-50 border border-slate-100 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 line-clamp-1 max-w-[200px]">{prod.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{prod.brand}</p>
                        </div>
                      </div>
                    </td>

                    {/* Filiale Badge */}
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
                          <span>{cfg.icon}</span>
                          <span>{prod.filialeName || cfg.name}</span>
                        </span>
                        <span className="inline-block text-[9px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {prod.filialeKey}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {prod.category}
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 text-sm">{prod.price} DT</span>
                      {prod.oldPrice && (
                        <span className="text-[10px] text-slate-400 line-through ml-1.5">
                          {prod.oldPrice} DT
                        </span>
                      )}
                    </td>

                    {/* Quantité en Stock */}
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        stockQty > 5 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : stockQty > 0
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {stockQty} en stock
                      </span>
                    </td>

                    {/* Visibilité Boutique (existe_dans_boutique) */}
                    <td className="py-3 px-4">
                      {isInBoutique ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <span>✅</span>
                          <span>En boutique</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200" title="En stock uniquement, non visible par les clients">
                          <span>📦</span>
                          <span>Hors boutique (À valider)</span>
                        </span>
                      )}
                    </td>

                    {/* Filiale Specific Attributes */}
                    <td className="py-3 px-4 text-[11px] text-slate-600">
                      {prod.filialeType === FilialeType.PRODUIT_MYSHOPS_ELECTRO && (
                        <p><span className="text-slate-400">Garantie :</span> <strong className="text-blue-600">{prod.garantieMois || 24} mois</strong> • {prod.puissanceWatts || '1200W'}</p>
                      )}
                      {prod.filialeType === FilialeType.PRODUIT_MYSHOPS_NUTRITION && (
                        <p><span className="text-slate-400">Saveur :</span> <strong className="text-amber-600">{prod.goutSaveur || 'Chocolat'}</strong></p>
                      )}
                      {prod.filialeType === FilialeType.PRODUIT_MYSHOPS_COSMETIQUE && (
                        <p><span className="text-slate-400">Teinte :</span> <strong className="text-rose-600">{prod.teinte || 'Naturel'}</strong></p>
                      )}
                      {prod.filialeType === FilialeType.PRODUIT_MYSHOPS_PARA && (
                        <p><span className="text-slate-400">Posologie :</span> <strong className="text-emerald-600">{prod.posologie || '1-2 / jour'}</strong></p>
                      )}
                    </td>

                    {/* Edit button */}
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setEditingProduct({
                          ...prod,
                          quantité_enstock: stockQty,
                          existe_dans_boutique: isInBoutique
                        })}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-xs cursor-pointer transition-colors"
                      >
                        Éditer
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal with existe_dans_boutique & quantité_enstock */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6 text-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">Édition Article : {editingProduct.name}</h3>
                <p className="text-xs text-slate-500">{editingProduct.filialeName} • {editingProduct.filialeType}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nom du produit</label>
                <input
                  type="text"
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Photo du produit avec import PC */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <ImageUploadInput
                  label="Image du produit"
                  value={editingProduct.imageUrl || ''}
                  onChange={(url) => setEditingProduct({ ...editingProduct, imageUrl: url, images: [url] })}
                  placeholder="https://..."
                  helperText="📁 Vous pouvez importer une photo enregistrée sur votre ordinateur (PC) ou coller une URL d'image web."
                />
              </div>

              {/* BOUTIQUE PUBLICATION OPTION (CRITICAL REQUIREMENT) */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.existe_dans_boutique !== false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, existe_dans_boutique: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="font-bold text-slate-900 text-xs">
                    Publier dans la boutique en ligne (existe_dans_boutique : Oui)
                  </span>
                </label>
                <p className="text-[11px] text-slate-500 ml-7 leading-relaxed">
                  {editingProduct.existe_dans_boutique !== false ? (
                    <span className="text-emerald-700 font-semibold">
                      ✅ Ce produit est actuellement actif et visible aux clients sur la boutique.
                    </span>
                  ) : (
                    <span className="text-amber-800 font-semibold">
                      📦 Ce produit est enregistré en stock uniquement ("Hors boutique"). Complétez les informations avant de cocher cette case pour le mettre officiellement en vente.
                    </span>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Prix de Vente Public (DT)</label>
                  <input
                    type="number"
                    value={editingProduct.price || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Quantité en Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduct.quantité_enstock ?? editingProduct.quantity ?? 0}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setEditingProduct({ ...editingProduct, quantité_enstock: v, quantity: v });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
