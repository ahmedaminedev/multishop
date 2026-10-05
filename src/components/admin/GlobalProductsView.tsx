import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Plus, Edit2, Check, Filter, Layers, Package, Building2, 
  Sparkles, Phone, MapPin, ExternalLink, AlertCircle, X, CheckCircle2,
  Boxes, Store, ArrowUpRight
} from 'lucide-react';
import { FilialeType, FILIALE_CONFIG, Fournisseur } from '../../models/ProductFiliale';
import { ImageUploadInput } from '../common/ImageUploadInput';

interface GlobalProductsViewProps {
  products: any[];
  onSaveProduct: (product: any) => Promise<any>;
  suppliers?: Fournisseur[];
  onSaveSupplier?: (supplier: any) => Promise<any>;
  activeShop?: string;
  onSelectShop?: (shop: string) => void;
}

export const GlobalProductsView: React.FC<GlobalProductsViewProps> = ({
  products,
  onSaveProduct,
  suppliers = [],
  onSaveSupplier,
  activeShop = 'all',
  onSelectShop
}) => {
  const [filialeFilter, setFilialeFilter] = useState(activeShop);
  const [boutiqueFilter, setBoutiqueFilter] = useState<'all' | 'in_shop' | 'out_of_shop' | 'out_of_stock'>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for products modal (create or edit)
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formFeedback, setFormFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Local suppliers list (to append newly created suppliers immediately)
  const [localSuppliers, setLocalSuppliers] = useState<Fournisseur[]>(suppliers);

  useEffect(() => {
    setLocalSuppliers(suppliers);
  }, [suppliers]);

  // Mini-form state for inline quick supplier creation inside product modal
  const [showQuickSupplierForm, setShowQuickSupplierForm] = useState(false);
  const [isCreatingSupplier, setIsCreatingSupplier] = useState(false);
  const [quickSupplierData, setQuickSupplierData] = useState({
    nom: '',
    telephone: '',
    localisation: '',
    type_vente: 'les_deux' as 'engros' | 'detail' | 'les_deux',
    lien: '',
    notes: ''
  });

  // Keep in sync with parent activeShop context
  useEffect(() => {
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
        p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.fournisseurNom && p.fournisseurNom.toLowerCase().includes(searchQuery.toLowerCase()));

      const stockQty = p.quantité_enstock ?? p.quantity ?? 0;
      const inBoutique = p.existe_dans_boutique !== false;

      let matchBoutique = true;
      if (boutiqueFilter === 'in_shop') matchBoutique = inBoutique;
      else if (boutiqueFilter === 'out_of_shop') matchBoutique = !inBoutique;
      else if (boutiqueFilter === 'out_of_stock') matchBoutique = stockQty <= 0;

      let matchSupplier = true;
      if (supplierFilter !== 'all') {
        if (supplierFilter === 'none') {
          matchSupplier = !p.fournisseurId && !p.fournisseurNom;
        } else {
          matchSupplier = p.fournisseurId === supplierFilter || p.fournisseurNom === supplierFilter;
        }
      }

      return matchFiliale && matchSearch && matchBoutique && matchSupplier;
    });
  }, [products, filialeFilter, searchQuery, boutiqueFilter, supplierFilter]);

  const shopTabs = [
    { id: 'all', label: 'Toutes les filiales', icon: '🌐' },
    { id: 'para', label: 'PharmaShop', icon: '🌿' },
    { id: 'nutrition', label: 'Fitness Shop', icon: '⚡' },
    { id: 'cosmetic', label: 'Cosmetics Shop', icon: '💄' },
    { id: 'electro', label: 'Electro Shop', icon: '🔌' },
    { id: 'youpi', label: 'YoupiShop', icon: '🧸' },
  ];

  // Quick statistics
  const stats = useMemo(() => {
    const total = products.length;
    const inShop = products.filter(p => p.existe_dans_boutique !== false).length;
    const outOfShop = total - inShop;
    const withSupplier = products.filter(p => Boolean(p.fournisseurId || p.fournisseurNom)).length;
    const lowStock = products.filter(p => (p.quantité_enstock ?? p.quantity ?? 0) <= 5).length;
    return { total, inShop, outOfShop, withSupplier, lowStock };
  }, [products]);

  // Open modal to create a new product
  const handleOpenCreateModal = () => {
    const defaultShop = filialeFilter !== 'all' ? filialeFilter : 'para';
    const cfg = FILIALE_CONFIG[FILIALE_CONFIG[`produit_myshops_${defaultShop}` as FilialeType] ? `produit_myshops_${defaultShop}` as FilialeType : FilialeType.PRODUIT_MYSHOPS_PARA];

    setEditingProduct({
      id: undefined,
      name: '',
      brand: '',
      category: 'Général',
      price: 49,
      oldPrice: 0,
      discount: 0,
      quantité_enstock: 15,
      quantity: 15,
      existe_dans_boutique: true,
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600',
      images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600'],
      description: '',
      filialeKey: defaultShop,
      filialeName: cfg?.name || 'PharmaShop',
      fournisseurId: '',
      fournisseurNom: ''
    });
    setIsCreatingNew(true);
    setShowQuickSupplierForm(false);
    setFormFeedback(null);
  };

  // Open modal to edit existing product
  const handleOpenEditModal = (prod: any) => {
    setEditingProduct({
      ...prod,
      quantité_enstock: prod.quantité_enstock ?? prod.quantity ?? 0,
      existe_dans_boutique: prod.existe_dans_boutique !== false,
      fournisseurId: prod.fournisseurId || '',
      fournisseurNom: prod.fournisseurNom || ''
    });
    setIsCreatingNew(false);
    setShowQuickSupplierForm(false);
    setFormFeedback(null);
  };

  // Quick Supplier Creation inside product form
  const handleQuickCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSupplierData.nom.trim()) {
      setFormFeedback({ type: 'error', message: 'Le nom du fournisseur est obligatoire.' });
      return;
    }

    setIsCreatingSupplier(true);
    try {
      let savedSupplier: any;
      if (onSaveSupplier) {
        savedSupplier = await onSaveSupplier({
          ...quickSupplierData,
          dateCreation: new Date().toISOString(),
          historique_achats: []
        });
      } else {
        // Fallback local creation
        savedSupplier = {
          id: `frn-${Date.now()}`,
          ...quickSupplierData,
          dateCreation: new Date().toISOString(),
          historique_achats: []
        };
      }

      // Update local suppliers list
      setLocalSuppliers(prev => [savedSupplier, ...prev]);

      // Automatically assign to currently edited product
      setEditingProduct((prev: any) => ({
        ...prev,
        fournisseurId: savedSupplier.id,
        fournisseurNom: savedSupplier.nom
      }));

      // Reset mini form
      setShowQuickSupplierForm(false);
      setQuickSupplierData({
        nom: '',
        telephone: '',
        localisation: '',
        type_vente: 'les_deux',
        lien: '',
        notes: ''
      });
      setFormFeedback({
        type: 'success',
        message: `Fournisseur "${savedSupplier.nom}" créé et affecté avec succès au produit !`
      });
    } catch (err: any) {
      setFormFeedback({
        type: 'error',
        message: err?.message || 'Erreur lors de la création rapide du fournisseur.'
      });
    } finally {
      setIsCreatingSupplier(false);
    }
  };

  // Product Form Submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editingProduct.name?.trim()) {
      setFormFeedback({ type: 'error', message: 'Le nom du produit est requis.' });
      return;
    }

    setIsSaving(true);
    setFormFeedback(null);
    try {
      const selectedSupplier = localSuppliers.find(s => s.id === editingProduct.fournisseurId);
      const supplierName = selectedSupplier ? selectedSupplier.nom : (editingProduct.fournisseurNom || '');

      const updatedProduct = {
        ...editingProduct,
        quantity: editingProduct.quantité_enstock ?? editingProduct.quantity ?? 0,
        quantité_enstock: editingProduct.quantité_enstock ?? editingProduct.quantity ?? 0,
        existe_dans_boutique: editingProduct.existe_dans_boutique !== false,
        fournisseurId: editingProduct.fournisseurId || '',
        fournisseurNom: supplierName,
        imageUrl: editingProduct.imageUrl || editingProduct.images?.[0] || 'https://picsum.photos/400/400'
      };

      await onSaveProduct(updatedProduct);
      setEditingProduct(null);
      setIsCreatingNew(false);
    } catch (err: any) {
      setFormFeedback({
        type: 'error',
        message: err?.message || "Erreur lors de l'enregistrement du produit."
      });
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
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Gestion globale des stocks, publication en boutique et liaison directe avec les fournisseurs
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 transition-all duration-200 cursor-pointer shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nouveau Produit</span>
        </button>
      </div>

      {/* Quick KPI stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">En Boutique</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-emerald-700">{stats.inShop}</div>
          <span className="text-[10px] text-slate-400">Actifs & visibles en ligne</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Hors Boutique</span>
            <Boxes className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-amber-700">{stats.outOfShop}</div>
          <span className="text-[10px] text-slate-400">En stock réservé / à valider</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Fournisseur Lié</span>
            <Building2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-black text-blue-700">{stats.withSupplier}</div>
          <span className="text-[10px] text-slate-400">Fournisseur référencé</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Stock Faible</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl font-black text-rose-700">{stats.lowStock}</div>
          <span className="text-[10px] text-slate-400">Quantité ≤ 5 unités</span>
        </div>
      </div>

      {/* Filiale Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 overflow-x-auto no-scrollbar">
        {shopTabs.map((st) => {
          const isSelected = filialeFilter === st.id;
          const count = st.id === 'all' 
            ? products.length 
            : products.filter(p => p.filialeKey === st.id).length;
          return (
            <button
              key={st.id}
              type="button"
              onClick={() => handleShopFilterChange(st.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <span>{st.icon}</span>
              <span>{st.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter Bar with Search, Boutique status, and Supplier Filter */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, marque, catégorie, fournisseur..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Supplier Filter Select */}
          <div className="w-full md:w-64 shrink-0">
            <div className="relative">
              <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <select
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">🏢 Tous les fournisseurs</option>
                <option value="none">⚠️ Sans fournisseur assigné</option>
                {localSuppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nom} ({s.localisation || 'Tunisie'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Add Product Button in Search Row */}
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 font-bold text-xs transition-colors cursor-pointer shrink-0 active:scale-95"
            title="Ajouter rapidement une nouvelle référence au catalogue"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="whitespace-nowrap">+ Nouveau Produit</span>
          </button>
        </div>

        {/* Boutique Publication Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 mr-2 uppercase tracking-wider">Statut :</span>
          <button
            type="button"
            onClick={() => setBoutiqueFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              boutiqueFilter === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Tous les statuts ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setBoutiqueFilter('in_shop')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              boutiqueFilter === 'in_shop' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-emerald-800 hover:bg-emerald-50'
            }`}
          >
            ✅ En boutique ({stats.inShop})
          </button>
          <button
            type="button"
            onClick={() => setBoutiqueFilter('out_of_shop')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              boutiqueFilter === 'out_of_shop' ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-100 text-amber-800 hover:bg-amber-50'
            }`}
          >
            📦 Hors boutique ({stats.outOfShop})
          </button>
          <button
            type="button"
            onClick={() => setBoutiqueFilter('out_of_stock')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              boutiqueFilter === 'out_of_stock' ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-100 text-rose-800 hover:bg-rose-50'
            }`}
          >
            ⚠️ Rupture / Stock bas ({stats.lowStock})
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Article</th>
                <th className="py-3.5 px-4">Filiale</th>
                <th className="py-3.5 px-4">Catégorie</th>
                <th className="py-3.5 px-4">Prix Public</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Fournisseur Associé</th>
                <th className="py-3.5 px-4">Visibilité Boutique</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Package className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                    <p className="font-bold text-slate-700 text-sm">Aucun produit ne correspond à ces critères</p>
                    <p className="text-xs text-slate-400 mt-1 mb-4">Modifiez vos filtres ou créez une nouvelle référence dans le catalogue.</p>
                    <button
                      type="button"
                      onClick={handleOpenCreateModal}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 cursor-pointer active:scale-95 transition-all"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      <span>Ajouter un Produit</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const cfg = FILIALE_CONFIG[prod.filialeType as FilialeType] || FILIALE_CONFIG[FilialeType.PRODUIT_MYSHOPS_PARA];
                  const stockQty = prod.quantité_enstock ?? prod.quantity ?? 0;
                  const isInBoutique = prod.existe_dans_boutique !== false;
                  const supplier = localSuppliers.find(s => s.id === prod.fournisseurId) || 
                    (prod.fournisseurNom ? { nom: prod.fournisseurNom, localisation: '' } : null);

                  return (
                    <tr key={`${prod.filialeKey}-${prod.id}`} className="hover:bg-slate-50/70 transition-colors">
                      {/* Image & Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.imageUrl || prod.images?.[0] || 'https://picsum.photos/400/400'}
                            alt={prod.name}
                            loading="lazy"
                            decoding="async"
                            className="w-11 h-11 rounded-xl object-cover bg-slate-50 border border-slate-100 shrink-0 shadow-2xs"
                          />
                          <div>
                            <p className="font-bold text-slate-900 line-clamp-1 max-w-[200px]" title={prod.name}>
                              {prod.name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-semibold">{prod.brand || 'Sans marque'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Filiale Badge */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                            <span>{cfg.icon}</span>
                            <span>{prod.filialeName || cfg.name}</span>
                          </span>
                          <span className="inline-block text-[9px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            {prod.filialeKey}
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px]">
                          {prod.category || 'Général'}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4">
                        <span className="font-black text-slate-900 text-sm">{prod.price} DT</span>
                        {prod.oldPrice && (
                          <span className="text-[10px] text-slate-400 line-through ml-1.5">
                            {prod.oldPrice} DT
                          </span>
                        )}
                      </td>

                      {/* Stock Quantity */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black ${
                          stockQty > 5 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : stockQty > 0
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {stockQty} en stock
                        </span>
                      </td>

                      {/* Fournisseur Associé */}
                      <td className="py-3.5 px-4">
                        {supplier ? (
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <div>
                              <p className="font-bold text-slate-900 text-[11px] line-clamp-1 max-w-[170px]" title={supplier.nom}>
                                {supplier.nom}
                              </p>
                              {supplier.localisation && (
                                <p className="text-[9px] text-slate-400 font-medium">{supplier.localisation}</p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(prod)}
                            className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-dashed border-slate-300 hover:border-blue-300 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Associer un fournisseur</span>
                          </button>
                        )}
                      </td>

                      {/* Visibilité Boutique */}
                      <td className="py-3.5 px-4">
                        {isInBoutique ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            <span>En boutique</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200" title="En stock uniquement, non visible par les clients">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            <span>Hors boutique (Stock)</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(prod)}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-bold text-xs cursor-pointer transition-all flex items-center gap-1.5 ml-auto shadow-2xs"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Éditer</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🚀 MODAL UNIFIÉE : CRÉATION / ÉDITION PRODUIT AVEC LIAISON FOURNISSEUR    */}
      {/* ========================================================================= */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 text-slate-900 max-h-[92vh] flex flex-col overflow-hidden border border-slate-100">
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  {isCreatingNew ? <Plus className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    {isCreatingNew ? 'Nouveau Produit' : `Édition : ${editingProduct.name}`}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isCreatingNew ? 'Ajouter une nouvelle référence au catalogue du groupe' : `${editingProduct.filialeName} • ${editingProduct.category}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setIsCreatingNew(false);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto py-5 space-y-5 text-xs pr-1">
              {formFeedback && (
                <div className={`p-3.5 rounded-2xl flex items-center gap-2.5 font-bold text-xs ${
                  formFeedback.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formFeedback.message}</span>
                </div>
              )}

              {/* Destination Filiale (if creating) */}
              {isCreatingNew && (
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <label className="block text-slate-700 font-bold mb-2">Boutique / Filiale de destination *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { key: 'para', name: 'PharmaShop', icon: '🌿' },
                      { key: 'nutrition', name: 'Fitness Shop', icon: '⚡' },
                      { key: 'cosmetic', name: 'Cosmetics', icon: '💄' },
                      { key: 'electro', name: 'Electro', icon: '🔌' },
                      { key: 'youpi', name: 'YoupiShop', icon: '🧸' },
                    ].map((f) => (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => {
                          const cfg = FILIALE_CONFIG[`produit_myshops_${f.key}` as FilialeType] || FILIALE_CONFIG[FilialeType.PRODUIT_MYSHOPS_PARA];
                          setEditingProduct({
                            ...editingProduct,
                            filialeKey: f.key,
                            filialeName: cfg.name
                          });
                        }}
                        className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                          editingProduct.filialeKey === f.key
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="block text-base mb-0.5">{f.icon}</span>
                        <span>{f.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Title & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">Nom de l'article *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    placeholder="Ex: Banc Développé Incliné Pro, Sérum Vitamine C..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Marque / Fabricant</label>
                  <input
                    type="text"
                    value={editingProduct.brand || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    placeholder="Ex: Technogym, La Roche-Posay..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Image Upload with PC import or Web URL */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <ImageUploadInput
                  label="Visuel du Produit"
                  value={editingProduct.imageUrl || editingProduct.images?.[0] || ''}
                  onChange={(url) => setEditingProduct({ ...editingProduct, imageUrl: url, images: [url] })}
                  placeholder="https://images.unsplash.com/..."
                  helperText="📁 Vous pouvez importer une photo depuis votre ordinateur (PC) ou coller une URL d'image web."
                />
              </div>

              {/* ================================================================ */}
              {/* 🏢 SECTION FOURNISSEUR : SÉLECTION + CRÉATION RAPIDE INTÉGRÉE  */}
              {/* ================================================================ */}
              <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-200/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                      Fournisseur Associé (Approvisionnement)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowQuickSupplierForm(!showQuickSupplierForm)}
                    className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 bg-white px-3 py-1.5 rounded-xl border border-blue-200 hover:border-blue-400 shadow-2xs transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{showQuickSupplierForm ? 'Fermer le mini-formulaire' : '+ Nouveau Fournisseur'}</span>
                  </button>
                </div>

                {/* Dropdown to pick existing supplier */}
                <div>
                  <label className="block text-slate-600 font-medium mb-1 text-[11px]">
                    Sélectionner un fournisseur existant pour ce produit :
                  </label>
                  <select
                    value={editingProduct.fournisseurId || ''}
                    onChange={(e) => {
                      const sId = e.target.value;
                      const matched = localSuppliers.find(s => s.id === sId);
                      setEditingProduct({
                        ...editingProduct,
                        fournisseurId: sId,
                        fournisseurNom: matched ? matched.nom : ''
                      });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="">-- Aucun fournisseur assigné (Produit propre) --</option>
                    {localSuppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        🏢 {s.nom} — {s.localisation || 'Tunisie'} {s.telephone ? `(${s.telephone})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sub-form: Mini Formulaire Création Rapide de Fournisseur */}
                {showQuickSupplierForm && (
                  <div className="bg-white p-4 rounded-2xl border border-blue-300 shadow-sm space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-1.5 font-black text-xs text-blue-900">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Création Rapide d'un Fournisseur</span>
                      </div>
                      <span className="text-[10px] text-slate-400">S'ajoutera directement à la base Fournisseurs</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Nom de l'entreprise *</label>
                        <input
                          type="text"
                          required
                          value={quickSupplierData.nom}
                          onChange={(e) => setQuickSupplierData({ ...quickSupplierData, nom: e.target.value })}
                          placeholder="Ex: Grossiste Médical Express"
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Téléphone / WhatsApp</label>
                        <input
                          type="text"
                          value={quickSupplierData.telephone}
                          onChange={(e) => setQuickSupplierData({ ...quickSupplierData, telephone: e.target.value })}
                          placeholder="+216 22 123 456"
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Localisation / Ville</label>
                        <input
                          type="text"
                          value={quickSupplierData.localisation}
                          onChange={(e) => setQuickSupplierData({ ...quickSupplierData, localisation: e.target.value })}
                          placeholder="Ex: Tunis Charguia 2"
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Type de Vente</label>
                        <select
                          value={quickSupplierData.type_vente}
                          onChange={(e) => setQuickSupplierData({ ...quickSupplierData, type_vente: e.target.value as any })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                        >
                          <option value="engros">Grossiste (En gros)</option>
                          <option value="detail">Détaillant</option>
                          <option value="les_deux">Les deux / Importateur direct</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setShowQuickSupplierForm(false)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-[11px] cursor-pointer"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        disabled={isCreatingSupplier}
                        onClick={handleQuickCreateSupplier}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[11px] cursor-pointer shadow-xs flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isCreatingSupplier ? 'Création...' : 'Créer & Associer immédiatement'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Publication Status (Boutique Visibility) */}
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
                <p className="text-[11px] text-slate-500 ml-6 leading-relaxed">
                  {editingProduct.existe_dans_boutique !== false ? (
                    <span className="text-emerald-700 font-semibold">
                      ✅ Ce produit sera immédiatement visible et achetable par les clients finaux dans la boutique.
                    </span>
                  ) : (
                    <span className="text-amber-800 font-semibold">
                      📦 Ce produit restera enregistré uniquement en réserve de stock ("Hors boutique"), invisible aux acheteurs web.
                    </span>
                  )}
                </p>
              </div>

              {/* Price & Stock & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Catégorie</label>
                  <input
                    type="text"
                    value={editingProduct.category || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    placeholder="Ex: Haltères, Soins, Électro..."
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Prix de Vente (DT) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editingProduct.price || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Quantité en Stock *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingProduct.quantité_enstock ?? editingProduct.quantity ?? 0}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setEditingProduct({ ...editingProduct, quantité_enstock: v, quantity: v });
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Description & Fiche technique</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  placeholder="Caractéristiques, conseils d'utilisation, garantie..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setIsCreatingNew(false);
                  }}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSaving ? 'Enregistrement...' : isCreatingNew ? 'Créer le produit' : 'Sauvegarder les modifications'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
