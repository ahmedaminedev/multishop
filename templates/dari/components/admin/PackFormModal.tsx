import React, { useState, useEffect, useMemo } from 'react';
import type { Pack, Product, Category } from '../../types';
import { X, Search, Sparkles, Check, ChevronDown, Tag, Boxes, Layers, Image as ImageIcon } from 'lucide-react';

interface PackFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (packData: Omit<Pack, 'id'>) => void;
  pack: Pack | null;
  allProducts: Product[];
  allPacks: Pack[];
  allCategories: Category[];
}

export const PackFormModal: React.FC<PackFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  pack,
  allProducts = [],
  allPacks = [],
  allCategories = []
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [discount, setDiscount] = useState<number>(15);
  const [badge, setBadge] = useState<string>('MEILLEURE VENTE');
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [selectedPackIds, setSelectedPackIds] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'packs'>('products');

  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (pack) {
      setName(pack.name || pack.title || '');
      setDescription(pack.description || '');
      setImageUrl(pack.imageUrl || '');
      setDiscount(pack.discount || 15);
      setBadge(pack.badge || 'MEILLEURE VENTE');
      setSelectedProductIds(pack.includedProductIds || []);
      setSelectedPackIds(pack.includedPackIds || []);
    } else {
      setName('');
      setDescription('');
      setImageUrl('');
      setDiscount(15);
      setBadge('MEILLEURE VENTE');
      setSelectedProductIds([]);
      setSelectedPackIds([]);
    }
    setProductSearchTerm('');
    setSelectedCategory('all');
  }, [pack, isOpen]);

  // Dynamic Base Price calculation from selected products & packs
  const basePrice = useMemo(() => {
    const productsSum = selectedProductIds.reduce((sum, id) => {
      const prod = allProducts.find(p => p.id === id);
      return sum + (prod?.price || 0);
    }, 0);
    const packsSum = selectedPackIds.reduce((sum, id) => {
      const subPack = allPacks.find(p => p.id === id);
      return sum + (subPack?.price || 0);
    }, 0);
    return productsSum + packsSum;
  }, [selectedProductIds, selectedPackIds, allProducts, allPacks]);

  // Discounted Final Pack Price
  const finalPrice = useMemo(() => {
    return Math.max(0, Math.round(basePrice * (1 - (discount || 0) / 100)));
  }, [basePrice, discount]);

  const savingsAmount = useMemo(() => {
    return Math.max(0, basePrice - finalPrice);
  }, [basePrice, finalPrice]);

  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => {
      const matchesSearch =
        !productSearchTerm ||
        p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
        p.brand?.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
        (p.pieceMaison && p.pieceMaison.toLowerCase().includes(productSearchTerm.toLowerCase()));
      const matchesCat =
        selectedCategory === 'all' ||
        p.category === selectedCategory ||
        p.parentCategory === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [allProducts, productSearchTerm, selectedCategory]);

  const toggleProduct = (productId: number) => {
    setSelectedProductIds(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const toggleSubPack = (subPackId: number) => {
    setSelectedPackIds(prev =>
      prev.includes(subPackId) ? prev.filter(id => id !== subPackId) : [...prev, subPackId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const includedItems = selectedProductIds
      .map(id => allProducts.find(p => p.id === id)?.name)
      .filter(Boolean) as string[];

    const packProducts = selectedProductIds
      .map(id => allProducts.find(p => p.id === id))
      .filter(Boolean) as Product[];

    const packPayload: Omit<Pack, 'id'> = {
      name: name.trim(),
      title: name.trim(),
      description: description.trim() || `Ensemble mobilier harmonieux : ${includedItems.slice(0, 3).join(' + ')}.`,
      imageUrl: imageUrl.trim() || packProducts[0]?.imageUrl || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800',
      price: finalPrice,
      oldPrice: basePrice,
      originalPrice: basePrice,
      discount: Number(discount) || 0,
      includedItems,
      includedProductIds: selectedProductIds,
      includedPackIds: selectedPackIds,
      badge: badge.trim()
    };

    onSave(packPayload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/50 dark:from-slate-800 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 text-lg">
              🏠
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight font-serif">
                  {pack ? 'Modifier le Pack Déco' : 'Nouveau Pack Pièce & Mobilier'}
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                  DariShop
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Composez un bundle salon, chambre ou séjour avec calcul automatique du prix et des remises
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6 text-xs">
          
          {/* SECTION 1: Informations Générales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Nom du pack */}
            <div className="md:col-span-2 space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                Nom du Pack Déco *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Pack Salon Contemporain Cosy, Pack Suite Parentale Sérénité..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-xs"
              />
            </div>

            {/* Badge promotionnel */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                Badge Marketing
              </label>
              <select
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold cursor-pointer text-xs"
              >
                <option value="MEILLEURE VENTE">⭐ MEILLEURE VENTE</option>
                <option value="COUP DE CŒUR">❤️ COUP DE CŒUR</option>
                <option value="NOUVELLE COLLECTION">✨ NOUVELLE COLLECTION</option>
                <option value="OFFRE HARMONISÉE">🛋️ OFFRE HARMONISÉE</option>
                <option value="ÉDITION LIMITÉE">💎 ÉDITION LIMITÉE</option>
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-3 space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                Description & Argumentaire Déco
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: L'ensemble harmonieux complet pour transformer votre séjour : Canapé 3 places + Table basse + Lampadaire..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-xs resize-none"
              />
            </div>

            {/* Image URL */}
            <div className="md:col-span-3 space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                Visuel du Pack (Photo d'Ambiance Pièce)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800"
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:bg-white text-xs"
                />
              </div>
              <p className="text-[10px] text-slate-400">
                Laissez vide pour utiliser automatiquement la photo du premier article sélectionné dans le pack.
              </p>
            </div>

          </div>

          {/* SECTION 2: Tarification Dynamique & Remise */}
          <div className="bg-gradient-to-br from-indigo-50/70 via-slate-50 to-purple-50/50 dark:from-slate-800/80 dark:to-slate-800/40 p-4 sm:p-5 rounded-2xl border border-indigo-100 dark:border-slate-700/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Calcul Automatique Tarifaire
                </span>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                    {finalPrice.toLocaleString('fr-FR')} DT
                  </span>
                  {basePrice > finalPrice && (
                    <span className="text-sm font-bold text-slate-400 line-through font-mono">
                      {basePrice.toLocaleString('fr-FR')} DT
                    </span>
                  )}
                  {savingsAmount > 0 && (
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                      Économie client : -{savingsAmount.toLocaleString('fr-FR')} DT
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  Prix de base calculé sur la somme des {selectedProductIds.length} article(s) inclus.
                </p>
              </div>

              {/* Discount Input */}
              <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
                <div className="text-right">
                  <label className="block text-[10px] font-black text-slate-500 uppercase">
                    Remise Globale
                  </label>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    Avantage Pack
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="90"
                    value={discount}
                    onChange={(e) => setDiscount(Math.max(0, Math.min(90, Number(e.target.value) || 0)))}
                    className="w-16 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center font-black text-sm text-slate-900 dark:text-white"
                  />
                  <span className="font-bold text-slate-500 text-sm">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Sélection des Pièces & Articles du Pack */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Composition du Pack ({selectedProductIds.length} sélectionné{selectedProductIds.length > 1 ? 's' : ''})
                </h3>
              </div>

              {/* Tabs Products vs Sub-Packs */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('products')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'products'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  Articles Catalogue ({allProducts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('packs')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'packs'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  Sous-Packs ({allPacks.filter(p => !pack || p.id !== pack.id).length})
                </button>
              </div>
            </div>

            {/* TAB 1: ARTICLES DU CATALOGUE */}
            {activeTab === 'products' && (
              <div className="space-y-3">
                {/* Search & Category Filter */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Rechercher par nom, matière, pièce..."
                      value={productSearchTerm}
                      onChange={(e) => setProductSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium cursor-pointer"
                  >
                    <option value="all">Toutes les Catégories</option>
                    {allCategories.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Products List with Checkboxes */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredProducts.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                      Aucun meuble ou article correspondant à votre recherche.
                    </div>
                  ) : (
                    filteredProducts.map(prod => {
                      const isSelected = selectedProductIds.includes(prod.id);
                      return (
                        <div
                          key={prod.id}
                          onClick={() => toggleProduct(prod.id)}
                          className={`p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-indigo-50/60 dark:bg-indigo-950/30'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                              isSelected
                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                            }`}>
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>

                            <img
                              src={prod.imageUrl}
                              alt=""
                              className="w-10 h-10 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200 dark:border-slate-700"
                            />

                            <div className="min-w-0">
                              <p className={`font-bold truncate text-xs ${isSelected ? 'text-indigo-950 dark:text-indigo-200' : 'text-slate-900 dark:text-white'}`}>
                                {prod.name}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                <span>{prod.category}</span>
                                {prod.pieceMaison && <span>• {prod.pieceMaison}</span>}
                                {prod.materiauPrincipal && <span>• {prod.materiauPrincipal}</span>}
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-black text-slate-900 dark:text-white font-mono text-xs">
                              {prod.price} DT
                            </span>
                            <span className={`block text-[10px] font-bold ${prod.quantity > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                              {prod.quantity > 0 ? `${prod.quantity} en stock` : 'Rupture'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: SOUS-PACKS COMPOSABLES */}
            {activeTab === 'packs' && (
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {allPacks.filter(p => !pack || p.id !== pack.id).length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    Aucun autre pack disponible à imbriquer.
                  </div>
                ) : (
                  allPacks
                    .filter(p => !pack || p.id !== pack.id)
                    .map(subP => {
                      const isSelected = selectedPackIds.includes(subP.id);
                      return (
                        <div
                          key={subP.id}
                          onClick={() => toggleSubPack(subP.id)}
                          className={`p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-indigo-50/60 dark:bg-indigo-950/30'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                              isSelected
                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                            }`}>
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>

                            <img
                              src={subP.imageUrl}
                              alt=""
                              className="w-10 h-10 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200 dark:border-slate-700"
                            />

                            <div className="min-w-0">
                              <p className="font-bold truncate text-xs text-slate-900 dark:text-white">
                                {subP.name || subP.title}
                              </p>
                              <span className="text-[10px] text-slate-400">
                                {subP.includedItems?.length || 0} article(s) inclus
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-black text-slate-900 dark:text-white font-mono text-xs">
                              {subP.price} DT
                            </span>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            )}

            {/* Selected Items Tags preview */}
            {selectedProductIds.length > 0 && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Articles inclus ({selectedProductIds.length}) :
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProductIds.map(id => {
                    const prod = allProducts.find(p => p.id === id);
                    if (!prod) return null;
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300 shadow-2xs"
                      >
                        <span className="truncate max-w-[180px]">{prod.name}</span>
                        <span className="font-mono text-indigo-600 font-bold">{prod.price} DT</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleProduct(id);
                          }}
                          className="text-slate-400 hover:text-rose-500 cursor-pointer ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!name.trim() || selectedProductIds.length === 0}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{pack ? 'Enregistrer les Modifications' : 'Créer le Pack Déco'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
