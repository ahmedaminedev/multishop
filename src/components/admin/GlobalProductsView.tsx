import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit2, Check, Filter, Layers } from 'lucide-react';
import { FilialeType, FILIALE_CONFIG } from '../../models/ProductFiliale';

interface GlobalProductsViewProps {
  products: any[];
  onSaveProduct: (product: any) => Promise<void>;
}

export const GlobalProductsView: React.FC<GlobalProductsViewProps> = ({ products, onSaveProduct }) => {
  const [filialeFilter, setFilialeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchFiliale = filialeFilter === 'all' || p.filialeKey === filialeFilter;
      const matchSearch = !searchQuery ||
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchFiliale && matchSearch;
    });
  }, [products, filialeFilter, searchQuery]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSaving(true);
    try {
      await onSaveProduct(editingProduct);
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
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
            CATALOGUE CENTRALISÉ <span className="text-blue-600">MULTI-FILIALES</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Gestion des 67 références réparties sur les 4 boutiques avec héritage de types
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs flex flex-wrap items-center gap-3">
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

        <select
          value={filialeFilter}
          onChange={(e) => setFilialeFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <option value="all">Toutes les Filiales (67)</option>
          <option value="para">🌿 PharmaNature (2)</option>
          <option value="nutrition">⚡ IronFuel Nutrition (15)</option>
          <option value="cosmetic">💄 Cosmetics Shop (19)</option>
          <option value="electro">🔌 Electro Shop (31)</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Article</th>
                <th className="py-3 px-4">Filiale & Typage</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4">Prix</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Attributs Spécifiques</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((prod) => {
                const cfg = FILIALE_CONFIG[prod.filialeType as FilialeType] || FILIALE_CONFIG[FilialeType.PRODUIT_MYSHOPS_PARA];
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
                          className="w-10 h-10 rounded-lg object-cover bg-slate-50 border border-slate-100"
                        />
                        <div>
                          <p className="font-bold text-slate-900 line-clamp-1 max-w-[220px]">{prod.name}</p>
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
                          {prod.filialeType}
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

                    {/* Stock */}
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        prod.quantity > 5 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {prod.quantity} en stock
                      </span>
                    </td>

                    {/* Filiale Specific Attributes */}
                    <td className="py-3 px-4 text-[11px] text-slate-600">
                      {prod.filialeType === FilialeType.PRODUIT_MYSHOPS_ELECTRO && (
                        <p><span className="text-slate-400">Garantie :</span> <strong className="text-blue-600">{prod.garantieMois || 24} mois</strong> • {prod.puissanceWatts || '1200W'}</p>
                      )}
                      {prod.filialeType === FilialeType.PRODUIT_MYSHOPS_NUTRITION && (
                        <p><span className="text-slate-400">Saveur :</span> <strong className="text-amber-600">{prod.goutSaveur || 'Chocolat'}</strong> • {prod.proteinesParPortion || '24g'}</p>
                      )}
                      {prod.filialeType === FilialeType.PRODUIT_MYSHOPS_COSMETIQUE && (
                        <p><span className="text-slate-400">Teinte :</span> <strong className="text-rose-600">{prod.teinte || 'Naturel'}</strong> • {prod.effetSoin || 'Éclat'}</p>
                      )}
                      {prod.filialeType === FilialeType.PRODUIT_MYSHOPS_PARA && (
                        <p><span className="text-slate-400">Posologie :</span> <strong className="text-emerald-600">{prod.posologie || '1-2 / jour'}</strong></p>
                      )}
                    </td>

                    {/* Edit button */}
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setEditingProduct({ ...prod })}
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

      {/* Edit Modal */}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Prix (DT)</label>
                  <input
                    type="number"
                    value={editingProduct.price || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Stock</label>
                  <input
                    type="number"
                    value={editingProduct.quantity || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, quantity: Number(e.target.value) })}
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
