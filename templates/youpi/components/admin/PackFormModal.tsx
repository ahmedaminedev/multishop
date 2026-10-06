import React, { useState, useEffect, useMemo } from 'react';
import type { Pack, Product, Category } from '../../types';
import { X, Search, Gift, Sparkles, Check, ChevronDown, Tag } from 'lucide-react';

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
      setSelectedProductIds(pack.includedProductIds || pack.products?.map(p => p.id) || []);
      setSelectedPackIds(pack.includedPackIds || []);
    } else {
      setName('');
      setDescription('');
      setImageUrl('');
      setDiscount(15);
      setSelectedProductIds([]);
      setSelectedPackIds([]);
    }
    setProductSearchTerm('');
    setSelectedCategory('all');
  }, [pack, isOpen]);

  // Dynamic Base Price calculation from selected products
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
    return Math.max(0, basePrice * (1 - (discount || 0) / 100));
  }, [basePrice, discount]);

  const savingsAmount = useMemo(() => {
    return Math.max(0, basePrice - finalPrice);
  }, [basePrice, finalPrice]);

  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => {
      const matchesSearch =
        p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
        p.brand?.toLowerCase().includes(productSearchTerm.toLowerCase());
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
      description: description.trim(),
      imageUrl: imageUrl.trim() || packProducts[0]?.imageUrl || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=600',
      price: Math.round(finalPrice * 100) / 100,
      oldPrice: Math.round(basePrice * 100) / 100,
      originalPrice: Math.round(basePrice * 100) / 100,
      discount: Number(discount) || 0,
      includedItems,
      includedProductIds: selectedProductIds,
      includedPackIds: selectedPackIds,
      products: packProducts
    };

    onSave(packPayload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl shadow-xs">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>{pack ? 'Modifier le Pack & Bundle' : 'Créer un Pack & Coffret Jouets'}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900/50 text-amber-900 dark:text-amber-300 font-bold">
                  YoupiShop
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Regroupez plusieurs jouets pour former un coffret cadeau à tarif avantageux
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Nom du Pack / Coffret Cadeau *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Coffret Éveil & Découverte Montessori"
                required
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Image du Pack (URL)
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Description & Avantages du Pack
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Un ensemble complet pour stimuler les sens et l'autonomie des tout-petits..."
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Pricing calculation summary box */}
          <div className="p-4 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-300/60 dark:border-amber-900/50 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Valeur Totale Réelle
                </span>
                <span className="text-base font-extrabold text-slate-700 dark:text-slate-300 line-through">
                  {basePrice.toFixed(2)} DT
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Remise Pack (%)
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <input
                    type="number"
                    min="0"
                    max="90"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                    className="w-16 px-2 py-1 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 rounded-lg text-xs font-black text-amber-700 dark:text-amber-400 text-center"
                  />
                  <span className="text-xs font-bold text-amber-600">%</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Économie Client
                </span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                  -{savingsAmount.toFixed(2)} DT
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                PRIX PACK PROPOSÉ
              </span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {finalPrice.toFixed(2)} DT
              </span>
            </div>
          </div>

          {/* Product & Sub-pack Selection Tabs */}
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 mb-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('products')}
                  className={`pb-2 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                    activeTab === 'products'
                      ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Jouets inclus ({selectedProductIds.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('packs')}
                  className={`pb-2 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                    activeTab === 'packs'
                      ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Sous-Packs ({selectedPackIds.length})
                </button>
              </div>

              {activeTab === 'products' && (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={productSearchTerm}
                      onChange={(e) => setProductSearchTerm(e.target.value)}
                      placeholder="Rechercher un jouet..."
                      className="pl-7 pr-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                  </div>

                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  >
                    <option value="all">Toutes catégories</option>
                    {allCategories.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Products List Grid */}
            {activeTab === 'products' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto p-1 custom-scrollbar">
                {filteredProducts.map(prod => {
                  const isSelected = selectedProductIds.includes(prod.id);
                  return (
                    <div
                      key={prod.id}
                      onClick={() => toggleProduct(prod.id)}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 ring-1 ring-amber-500'
                          : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-amber-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-300 dark:border-slate-600'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>

                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-10 h-10 object-contain rounded-lg bg-slate-100 dark:bg-slate-900 p-0.5 shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {prod.name}
                        </p>
                        <p className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">
                          {prod.price.toFixed(2)} DT
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Sub-packs Selection */}
            {activeTab === 'packs' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
                {allPacks.filter(p => !pack || p.id !== pack.id).map(p => {
                  const isSelected = selectedPackIds.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      onClick={() => toggleSubPack(p.id)}
                      className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 ring-1 ring-amber-500'
                          : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-amber-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-300 dark:border-slate-600'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>

                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-10 h-10 object-cover rounded-lg shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {p.name || p.title}
                        </p>
                        <p className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">
                          {p.price.toFixed(2)} DT
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md hover:shadow-lg"
            >
              {pack ? 'Enregistrer le Pack' : 'Créer le Pack Jouets'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
