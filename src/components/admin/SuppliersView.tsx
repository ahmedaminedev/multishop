import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, ExternalLink, Phone, MapPin, Building2, Package, Sparkles, 
  Check, AlertTriangle, ArrowRight, History, Calendar, Layers, CheckCircle2,
  Boxes, ShieldAlert, ArrowUpRight
} from 'lucide-react';
import { Fournisseur, FutureProduit, Produit } from '../../models/ProductFiliale';
import { ImageUploadInput } from '../common/ImageUploadInput';

interface SuppliersViewProps {
  suppliers: Fournisseur[];
  products: any[];
  futureProducts: FutureProduit[];
  onSaveSupplier: (supplier: any) => Promise<any>;
  onDeleteSupplier: (id: string) => Promise<void>;
  onExecuteRestock: (supplierId: string, payload: {
    type: 'produit_existant' | 'future_produit';
    items: Array<{ id: string | number; quantite: number; prixAchat?: number }>;
    notes?: string;
  }) => Promise<{ success: boolean; message: string }>;
  initialTargetFutureProduct?: FutureProduit | null;
}

const VALID_NETWORK_SITES = ['fitnessshop', 'nutrition', 'youpi', 'youpishop'];

const SITE_LABELS: Record<string, { name: string; color: string; bg: string }> = {
  fitnessshop: { name: 'Fitness Shop', color: 'text-lime-700', bg: 'bg-lime-50 border-lime-200' },
  nutrition: { name: 'Fitness Shop', color: 'text-lime-700', bg: 'bg-lime-50 border-lime-200' },
  youpi: { name: 'YoupiShop', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  youpishop: { name: 'YoupiShop', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' }
};

export const SuppliersView: React.FC<SuppliersViewProps> = ({
  suppliers,
  products,
  futureProducts,
  onSaveSupplier,
  onDeleteSupplier,
  onExecuteRestock,
  initialTargetFutureProduct
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplierForDetails, setSelectedSupplierForDetails] = useState<Fournisseur | null>(null);
  const [supplierDetailTab, setSupplierDetailTab] = useState<'products' | 'receptions'>('products');
  
  // Create / Edit Supplier Modal State (with integrated product restock selection)
  const [editingSupplier, setEditingSupplier] = useState<Partial<Fournisseur> | null>(null);
  const [supplierAffectationMode, setSupplierAffectationMode] = useState<'none' | 'produit_existant' | 'future_produit'>('none');
  const [isSavingSupplier, setIsSavingSupplier] = useState(false);
  const [supplierFormFeedback, setSupplierFormFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Standalone Restock Intake Modal State (for existing supplier card button)
  const [activeRestockSupplier, setActiveRestockSupplier] = useState<Fournisseur | null>(() => {
    if (initialTargetFutureProduct && suppliers.length > 0) return suppliers[0];
    return null;
  });
  const [restockType, setRestockType] = useState<'produit_existant' | 'future_produit'>(() => {
    return initialTargetFutureProduct ? 'future_produit' : 'produit_existant';
  });

  // Selections for Option 1: Existing Products (shared schema)
  const [selectedExistingProducts, setSelectedExistingProducts] = useState<Record<number, { selected: boolean; quantite: number; prixAchat: number }>>({});
  const [existingShopFilter, setExistingShopFilter] = useState('all');
  const [existingSearch, setExistingSearch] = useState('');

  // Selections for Option 2: Future Products (shared schema)
  const [selectedFutureProducts, setSelectedFutureProducts] = useState<Record<string, { selected: boolean; quantite: number; prixAchat: number }>>(() => {
    if (initialTargetFutureProduct) {
      return {
        [initialTargetFutureProduct.id]: {
          selected: true,
          quantite: initialTargetFutureProduct.quantite || 10,
          prixAchat: initialTargetFutureProduct.prix_source || 50
        }
      };
    }
    return {};
  });
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedSiteGroupFilter, setSelectedSiteGroupFilter] = useState<string>('all');

  const [restockNotes, setRestockNotes] = useState('');
  const [isExecutingRestock, setIsExecutingRestock] = useState(false);
  const [restockFeedback, setRestockFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const filteredSuppliers = suppliers.filter(s => {
    return !searchQuery ||
      s.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.localisation && s.localisation.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.telephone && s.telephone.includes(searchQuery));
  });

  const handleOpenAddSupplier = () => {
    setEditingSupplier({
      nom: '',
      localisation: '',
      lien: '',
      image: '',
      telephone: '',
      notes: ''
    });
    setSupplierAffectationMode('none');
    setSelectedExistingProducts({});
    setSelectedFutureProducts({});
    setRestockNotes('');
    setSupplierFormFeedback(null);
  };

  // Group Future Products by Site & Category for Option 2
  const groupedFutureProducts = useMemo(() => {
    const groups: Record<string, { siteLabel: string; isNonExistant: boolean; items: FutureProduit[] }> = {};

    futureProducts.forEach(fp => {
      const isNonExistant = fp.is_futur_site || Boolean(fp.futur_site) || !VALID_NETWORK_SITES.includes(fp.site?.toLowerCase());
      const siteKey = isNonExistant ? (fp.futur_site || 'Site Non Existant') : fp.site;
      const siteLabel = isNonExistant ? `Futur Site : "${siteKey}" (Non Déployé)` : (SITE_LABELS[fp.site]?.name || fp.site);

      if (!groups[siteKey]) {
        groups[siteKey] = { siteLabel, isNonExistant, items: [] };
      }
      groups[siteKey].items.push(fp);
    });

    return groups;
  }, [futureProducts]);

  // List of all categories across future products for grouped category filtering
  const allFutureCategories = useMemo(() => {
    const cats = new Set<string>();
    futureProducts.forEach(fp => {
      if (fp.categorie) cats.add(fp.categorie);
    });
    return Array.from(cats);
  }, [futureProducts]);

  // Filtered Existing Products
  const filteredExistingProducts = useMemo(() => {
    return products.filter(p => {
      const matchShop = existingShopFilter === 'all' || p.filialeKey === existingShopFilter;
      const matchSearch = !existingSearch ||
        p.name?.toLowerCase().includes(existingSearch.toLowerCase()) ||
        p.brand?.toLowerCase().includes(existingSearch.toLowerCase()) ||
        p.category?.toLowerCase().includes(existingSearch.toLowerCase());
      return matchShop && matchSearch;
    });
  }, [products, existingShopFilter, existingSearch]);

  // Build reception payload helper
  const buildReceptionPayload = (mode: 'produit_existant' | 'future_produit') => {
    if (mode === 'produit_existant') {
      const items = Object.entries(selectedExistingProducts)
        .filter(([_, data]) => data.selected && data.quantite > 0)
        .map(([id, data]) => ({
          id: Number(id),
          quantite: data.quantite,
          prixAchat: data.prixAchat
        }));
      return items.length > 0 ? { type: 'produit_existant' as const, items, notes: restockNotes } : null;
    } else {
      const items = Object.entries(selectedFutureProducts)
        .filter(([_, data]) => data.selected && data.quantite > 0)
        .map(([id, data]) => ({
          id,
          quantite: data.quantite,
          prixAchat: data.prixAchat
        }));
      return items.length > 0 ? { type: 'future_produit' as const, items, notes: restockNotes } : null;
    }
  };

  // Submit Supplier Creation / Edition (WITH integrated product/future product allocation)
  const handleSaveSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier?.nom) {
      setSupplierFormFeedback({ type: 'error', message: 'Le nom du fournisseur est obligatoire.' });
      return;
    }

    setSupplierFormFeedback(null);

    // If user chose to assign future products, check for non-existent sites first!
    if (supplierAffectationMode === 'future_produit') {
      const itemsToSubmit = Object.entries(selectedFutureProducts)
        .filter(([_, data]) => data.selected && data.quantite > 0);

      if (itemsToSubmit.length === 0) {
        setSupplierFormFeedback({ 
          type: 'error', 
          message: 'Veuillez cocher au moins un futur produit et indiquer sa quantité, ou choisissez "Aucun produit pour le moment".' 
        });
        return;
      }

      const invalidSitesFound: string[] = [];
      itemsToSubmit.forEach(([id]) => {
        const fp = futureProducts.find(f => f.id === id);
        if (fp) {
          const isNonExistant = fp.is_futur_site || Boolean(fp.futur_site) || !VALID_NETWORK_SITES.includes(fp.site?.toLowerCase());
          if (isNonExistant) {
            invalidSitesFound.push(fp.futur_site || fp.site || 'Site Non Existant');
          }
        }
      });

      if (invalidSitesFound.length > 0) {
        const uniqueSites = [...new Set(invalidSitesFound)].join(', ');
        setSupplierFormFeedback({
          type: 'error',
          message: `Le site "${uniqueSites}" n'existe pas dans un site tu ne peux pas les affecter ses produits. Veuillez désélectionner ces articles pour continuer.`
        });
        return;
      }
    } else if (supplierAffectationMode === 'produit_existant') {
      const itemsToSubmit = Object.entries(selectedExistingProducts)
        .filter(([_, data]) => data.selected && data.quantite > 0);

      if (itemsToSubmit.length === 0) {
        setSupplierFormFeedback({ 
          type: 'error', 
          message: 'Veuillez cocher au moins un produit et préciser sa quantité reçue, ou choisissez "Aucun produit pour le moment".' 
        });
        return;
      }
    }

    setIsSavingSupplier(true);
    try {
      const receptionPayload = supplierAffectationMode !== 'none' ? buildReceptionPayload(supplierAffectationMode) : null;
      
      const supplierToSave = {
        ...editingSupplier,
        reception: receptionPayload
      };

      const result = await onSaveSupplier(supplierToSave);
      
      // If we did a reception separately or if server returned message:
      const msg = result?.receptionMessage || (receptionPayload 
        ? 'Fournisseur créé et marchandises enregistrées avec succès en stock !' 
        : 'Fournisseur enregistré avec succès !');
      
      setSupplierFormFeedback({ type: 'success', message: msg });
      setTimeout(() => {
        setEditingSupplier(null);
        setSelectedExistingProducts({});
        setSelectedFutureProducts({});
        setSupplierFormFeedback(null);
      }, 1600);
    } catch (err: any) {
      setSupplierFormFeedback({ type: 'error', message: err.message || 'Erreur lors de l\'enregistrement.' });
    } finally {
      setIsSavingSupplier(false);
    }
  };

  // Standalone Restock Submission for existing supplier
  const handleSubmitRestock = async () => {
    if (!activeRestockSupplier) return;
    setRestockFeedback(null);

    if (restockType === 'produit_existant') {
      const itemsToSubmit = Object.entries(selectedExistingProducts)
        .filter(([_, data]) => data.selected && data.quantite > 0)
        .map(([id, data]) => ({
          id: Number(id),
          quantite: data.quantite,
          prixAchat: data.prixAchat
        }));

      if (itemsToSubmit.length === 0) {
        setRestockFeedback({ type: 'error', message: 'Veuillez sélectionner au moins un produit et préciser sa quantité reçue.' });
        return;
      }

      setIsExecutingRestock(true);
      try {
        const res = await onExecuteRestock(activeRestockSupplier.id, {
          type: 'produit_existant',
          items: itemsToSubmit,
          notes: restockNotes
        });
        setRestockFeedback({ type: 'success', message: res.message });
        setTimeout(() => {
          setActiveRestockSupplier(null);
          setSelectedExistingProducts({});
          setRestockFeedback(null);
        }, 1800);
      } catch (err: any) {
        setRestockFeedback({ type: 'error', message: err.message || 'Erreur lors du réapprovisionnement.' });
      } finally {
        setIsExecutingRestock(false);
      }
    } else {
      // Option 2: Future Products
      const itemsToSubmit = Object.entries(selectedFutureProducts)
        .filter(([_, data]) => data.selected && data.quantite > 0)
        .map(([id, data]) => ({
          id,
          quantite: data.quantite,
          prixAchat: data.prixAchat
        }));

      if (itemsToSubmit.length === 0) {
        setRestockFeedback({ type: 'error', message: 'Veuillez sélectionner au moins un futur produit.' });
        return;
      }

      // Check if any selected future product belongs to a non-existent site
      const invalidSitesFound: string[] = [];
      itemsToSubmit.forEach(item => {
        const fp = futureProducts.find(f => f.id === item.id);
        if (fp) {
          const isNonExistant = fp.is_futur_site || Boolean(fp.futur_site) || !VALID_NETWORK_SITES.includes(fp.site?.toLowerCase());
          if (isNonExistant) {
            invalidSitesFound.push(fp.futur_site || fp.site || 'Site Non Existant');
          }
        }
      });

      if (invalidSitesFound.length > 0) {
        const uniqueSites = [...new Set(invalidSitesFound)].join(', ');
        setRestockFeedback({
          type: 'error',
          message: `Le site "${uniqueSites}" n'existe pas dans un site tu ne peux pas les affecter ses produits.`
        });
        return;
      }

      setIsExecutingRestock(true);
      try {
        const res = await onExecuteRestock(activeRestockSupplier.id, {
          type: 'future_produit',
          items: itemsToSubmit,
          notes: restockNotes
        });
        setRestockFeedback({ type: 'success', message: res.message });
        setTimeout(() => {
          setActiveRestockSupplier(null);
          setSelectedFutureProducts({});
          setRestockFeedback(null);
        }, 2200);
      } catch (err: any) {
        setRestockFeedback({ type: 'error', message: err.message || 'Erreur lors de la conversion en stock.' });
      } finally {
        setIsExecutingRestock(false);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              FOURNISSEURS & RÉCEPTIONS DE STOCK
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
              {suppliers.length} fournisseurs
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Historique de provenance d'achat, formulaire d'affectation immédiate de produits & conversion des futurs articles
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddSupplier}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Fournisseur & Entrée Stock</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un fournisseur par nom, ville ou téléphone..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Total commandes passées : <strong className="text-slate-900">
            {suppliers.reduce((acc, s) => acc + (s.historique_achats?.length || 0), 0)} réceptions
          </strong>
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSuppliers.map((supplier) => {
          const totalAchats = (supplier.historique_achats || []).length;
          const dernierAchat = supplier.historique_achats?.[0];

          return (
            <div
              key={supplier.id}
              className="bg-white border border-slate-200/80 hover:border-emerald-300 rounded-2xl p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header card with Image & Name */}
                <div className="flex items-start gap-3">
                  <img
                    src={supplier.image || 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=300'}
                    alt={supplier.nom}
                    className="w-14 h-14 rounded-xl object-cover bg-slate-50 border border-slate-100 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{supplier.nom}</h3>
                    {supplier.localisation && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{supplier.localisation}</span>
                      </p>
                    )}
                    {supplier.telephone && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{supplier.telephone}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Details & Link */}
                <div className="space-y-2 text-xs pt-3 border-t border-slate-100">
                  {supplier.lien && (
                    <a
                      href={supplier.lien}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1.5 font-medium truncate"
                    >
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{supplier.lien}</span>
                    </a>
                  )}

                  {supplier.notes && (
                    <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl line-clamp-2">
                      {supplier.notes}
                    </p>
                  )}

                  {/* Summary of linked catalogue products */}
                  {(() => {
                    const linkedProducts = products.filter(p => p.fournisseurId === supplier.id || (p.fournisseurNom && p.fournisseurNom.toLowerCase() === supplier.nom.toLowerCase()));
                    return (
                      <div 
                        onClick={() => {
                          setSelectedSupplierForDetails(supplier);
                          setSupplierDetailTab('products');
                        }}
                        className="bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200/80 p-2.5 rounded-xl flex items-center justify-between text-[11px] cursor-pointer transition-colors"
                      >
                        <span className="text-blue-900 font-bold flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-blue-600" />
                          <span>{linkedProducts.length} article{linkedProducts.length > 1 ? 's' : ''} catalogue associé{linkedProducts.length > 1 ? 's' : ''}</span>
                        </span>
                        <span className="text-blue-600 font-bold text-[10px]">Voir fiches →</span>
                      </div>
                    );
                  })()}

                  {/* Summary of purchase history */}
                  <div className="bg-emerald-50/60 border border-emerald-100 p-2.5 rounded-xl flex items-center justify-between text-[11px]">
                    <span className="text-emerald-800 font-bold flex items-center gap-1">
                      <History className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{totalAchats} réception{totalAchats > 1 ? 's' : ''} enregistrée{totalAchats > 1 ? 's' : ''}</span>
                    </span>
                    {dernierAchat && (
                      <span className="text-slate-400 text-[10px]">
                        Dernière : {dernierAchat.date}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSupplierForDetails(supplier)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer inline-flex items-center gap-1"
                >
                  <History className="w-3.5 h-3.5 text-slate-500" />
                  <span>Historique</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSupplier(supplier);
                      setSupplierAffectationMode('none');
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                    title="Modifier les coordonnées du fournisseur"
                  >
                    ✏️
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveRestockSupplier(supplier);
                      setRestockFeedback(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>Entrée en Stock</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 🚀 FORMULAIRE COMPLET D'AJOUT FOURNISSEUR AVEC AFFECTATION DE PRODUITS   */}
      {/* ========================================================================= */}
      {editingSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full p-6 sm:p-8 text-slate-900 max-h-[94vh] flex flex-col overflow-hidden border border-slate-200 my-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-100 shrink-0">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {editingSupplier.id ? 'Mise à jour Fournisseur' : 'Nouveau Fournisseur Partenaire'}
                </span>
                <h3 className="font-black text-lg text-slate-900 mt-1">
                  {editingSupplier.id ? `Modifier : ${editingSupplier.nom}` : 'Créer un Fournisseur & Affecter des Marchandises'}
                </h3>
                <p className="text-xs text-slate-500">
                  Enregistrez les coordonnées et choisissez d'affecter directement des produits en stock ou de convertir des futurs produits prospectés
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingSupplier(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Feedback Alert if any */}
            {supplierFormFeedback && (
              <div className={`p-4 rounded-2xl my-3 text-xs font-bold flex items-center gap-2 animate-fadeIn shrink-0 ${
                supplierFormFeedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {supplierFormFeedback.type === 'success' ? (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{supplierFormFeedback.message}</span>
              </div>
            )}

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveSupplierSubmit} className="flex-1 overflow-y-auto space-y-6 pr-1 pt-3">
              {/* SECTION 1: INFOS DU FOURNISSEUR */}
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                    Étape 1 : Informations du Fournisseur
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-xs">
                      Nom de l'entreprise / Fournisseur <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Tunisie Fitness Distribution, Jouets & Compagnie..."
                      value={editingSupplier.nom || ''}
                      onChange={(e) => setEditingSupplier({ ...editingSupplier, nom: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-xs">
                      Localisation / Ville (Optionnel)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Tunis, Sousse, Monastir, Chine, Paris..."
                      value={editingSupplier.localisation || ''}
                      onChange={(e) => setEditingSupplier({ ...editingSupplier, localisation: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-xs">Téléphone / Contact</label>
                    <input
                      type="text"
                      placeholder="+216 71 000 000 / +216 98 000 000"
                      value={editingSupplier.telephone || ''}
                      onChange={(e) => setEditingSupplier({ ...editingSupplier, telephone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-xs">Site Web / Lien Fournisseur</label>
                    <input
                      type="url"
                      placeholder="https://fournisseur-partenaire.com"
                      value={editingSupplier.lien || ''}
                      onChange={(e) => setEditingSupplier({ ...editingSupplier, lien: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* IMAGE IMPORTÉE DEPUIS LE PC (EXIGENCE UTILISATEUR 1) */}
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                  <ImageUploadInput
                    label="Image / Logo du Fournisseur"
                    value={editingSupplier.image || ''}
                    onChange={(url) => setEditingSupplier({ ...editingSupplier, image: url })}
                    placeholder="https://..."
                    helperText="📁 Vous pouvez importer une photo ou logo directement depuis votre ordinateur (PC) ou glisser-déposer le fichier."
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-xs">Notes & Modalités d'achat</label>
                  <textarea
                    rows={2}
                    placeholder="Conditions de paiement, franco de port, remises grossiste, coordonnées du commercial..."
                    value={editingSupplier.notes || ''}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, notes: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* SECTION 2: AFFECTATION LORS DE LA CRÉATION (EXIGENCE UTILISATEUR 2 & 3) */}
              <div className="bg-white border-2 border-emerald-500/20 rounded-2xl p-5 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Boxes className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                        Étape 2 : Affectation de Marchandises lors de la Création
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Choisissez si vous souhaitez affecter des produits existants ou des futurs produits repérés
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    2 Options d'affectation disponibles
                  </span>
                </div>

                {/* 3 CHOIX DE MODE */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <label className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                    supplierAffectationMode === 'produit_existant'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="affectation_mode"
                      value="produit_existant"
                      checked={supplierAffectationMode === 'produit_existant'}
                      onChange={() => setSupplierAffectationMode('produit_existant')}
                      className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <p className="font-bold text-xs flex items-center gap-1">
                        <Package className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Option 1 : Produits existants</span>
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                        Sélectionner des produits du catalogue et renseigner la quantité reçue à ajouter en stock
                      </p>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                    supplierAffectationMode === 'future_produit'
                      ? 'bg-purple-50 border-purple-500 text-purple-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="affectation_mode"
                      value="future_produit"
                      checked={supplierAffectationMode === 'future_produit'}
                      onChange={() => setSupplierAffectationMode('future_produit')}
                      className="mt-0.5 text-purple-600 focus:ring-purple-500"
                    />
                    <div>
                      <p className="font-bold text-xs flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        <span>Option 2 : Futurs produits</span>
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                        Convertir des futurs produits prospectés en nouveaux articles en stock (Hors boutique par défaut)
                      </p>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                    supplierAffectationMode === 'none'
                      ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="affectation_mode"
                      value="none"
                      checked={supplierAffectationMode === 'none'}
                      onChange={() => setSupplierAffectationMode('none')}
                      className="mt-0.5 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-bold text-xs">Créer le fournisseur seul</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                        Enregistrer uniquement la fiche partenaire sans mouvement de stock immédiat
                      </p>
                    </div>
                  </label>
                </div>

                {/* SUB-FORM FOR OPTION 1: EXISTING PRODUCTS */}
                {supplierAffectationMode === 'produit_existant' && (
                  <div className="space-y-3 pt-2 border-t border-slate-200 animate-fadeIn">
                    <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-950">
                      <p className="font-bold">Instructions Gestion de Stock (Option 1) :</p>
                      <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                        Sélectionnez les produits commandés auprès de ce fournisseur et indiquez la <strong>quantité livrée</strong>.
                        Cette quantité s'ajoutera automatiquement à la <em>quantité_enstock</em> de chaque article.
                        Les articles qui ne sont pas encore en ligne restent <em>"Hors boutique"</em> jusqu'à validation dans leur formulaire d'édition.
                      </p>
                    </div>

                    {/* Filter and Search */}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          placeholder="Rechercher par nom, marque, référence..."
                          value={existingSearch}
                          onChange={(e) => setExistingSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <select
                        value={existingShopFilter}
                        onChange={(e) => setExistingShopFilter(e.target.value)}
                        className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
                      >
                        <option value="all">Toutes les boutiques ({products.length})</option>
                        <option value="nutrition">⚡ Fitness Shop</option>
                        <option value="youpi">🧸 YoupiShop</option>
                      </select>
                    </div>

                    {/* Products Table with Quantities */}
                    <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-[300px] overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] sticky top-0 border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3 w-10">Select</th>
                            <th className="py-2.5 px-3">Produit</th>
                            <th className="py-2.5 px-3">Boutique</th>
                            <th className="py-2.5 px-3">Stock Actuel</th>
                            <th className="py-2.5 px-3">Statut Boutique</th>
                            <th className="py-2.5 px-3 w-32">Quantité Reçue</th>
                            <th className="py-2.5 px-3 w-32">Nouveau Stock Estimé</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredExistingProducts.map(p => {
                            const state = selectedExistingProducts[p.id] || { 
                              selected: false, 
                              quantite: 10, 
                              prixAchat: Math.round((p.price || 50) * 0.6) 
                            };
                            const isInBoutique = p.existe_dans_boutique !== false;
                            const currentStock = p.quantité_enstock ?? p.quantity ?? 0;
                            const newStock = state.selected ? currentStock + state.quantite : currentStock;

                            return (
                              <tr
                                key={`edit-${p.filialeKey}-${p.id}`}
                                className={`transition-colors ${state.selected ? 'bg-emerald-50/50' : 'hover:bg-slate-50'}`}
                              >
                                <td className="py-2 px-3">
                                  <input
                                    type="checkbox"
                                    checked={state.selected}
                                    onChange={(e) => {
                                      setSelectedExistingProducts({
                                        ...selectedExistingProducts,
                                        [p.id]: {
                                          ...state,
                                          selected: e.target.checked
                                        }
                                      });
                                    }}
                                    className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                  />
                                </td>
                                <td className="py-2 px-3 font-semibold text-slate-800">
                                  <div className="flex items-center gap-2">
                                    <img
                                      src={p.imageUrl}
                                      alt=""
                                      className="w-8 h-8 rounded-lg object-cover bg-slate-100 shrink-0"
                                    />
                                    <div>
                                      <span className="line-clamp-1 max-w-[180px] font-bold text-slate-900">{p.name}</span>
                                      <span className="text-[10px] text-slate-400">{p.brand}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-2 px-3 text-[11px] font-bold text-slate-600">
                                  {p.filialeName || p.filialeKey}
                                </td>
                                <td className="py-2 px-3 font-bold text-slate-700">
                                  {currentStock} unités
                                </td>
                                <td className="py-2 px-3">
                                  {isInBoutique ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                      En boutique
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                      Hors boutique
                                    </span>
                                  )}
                                </td>
                                <td className="py-2 px-3">
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      min="1"
                                      disabled={!state.selected}
                                      value={state.quantite}
                                      onChange={(e) => {
                                        setSelectedExistingProducts({
                                          ...selectedExistingProducts,
                                          [p.id]: {
                                            ...state,
                                            quantite: Math.max(1, Number(e.target.value))
                                          }
                                        });
                                      }}
                                      className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center disabled:opacity-40"
                                    />
                                    <span className="text-[10px] text-slate-400 font-bold">unités</span>
                                  </div>
                                </td>
                                <td className="py-2 px-3 font-bold">
                                  {state.selected ? (
                                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-xs">
                                      → {newStock} unités
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 text-xs">-</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* SUB-FORM FOR OPTION 2: FUTURE PRODUCTS WITH STRICT SITE VALIDATION */}
                {supplierAffectationMode === 'future_produit' && (
                  <div className="space-y-4 pt-2 border-t border-slate-200 animate-fadeIn">
                    <div className="bg-purple-50/70 border border-purple-200 p-3.5 rounded-xl text-xs text-purple-950">
                      <p className="font-bold flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span>Règles d'Affectation des Futurs Produits (Option 2) :</span>
                      </p>
                      <p className="text-[11px] text-purple-800 mt-1 leading-relaxed">
                        1. Si un futur produit est lié à un <strong>site qui n'existe pas</strong> dans les boutiques actives du réseau (Fitness Shop, YoupiShop), le système affiche un message d'alerte et bloque son affectation.<br />
                        2. Pour les produits dont le site et la catégorie existent, vous indiquez la <strong>quantité en stock</strong>. Ils s'enregistrent en base comme de nouveaux produits en stock avec le statut <strong>"Hors boutique" par défaut</strong> (existe_dans_boutique = false) afin que vous puissiez compléter et valider leurs fiches avant publication.
                      </p>
                    </div>

                    {/* Filter Pills for Categories / Sites */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-500">Filtrer par catégorie :</span>
                      <button
                        type="button"
                        onClick={() => setSelectedCategoryFilter('all')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          selectedCategoryFilter === 'all'
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Toutes les catégories
                      </button>
                      {allFutureCategories.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedCategoryFilter(cat)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            selectedCategoryFilter === cat
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Grouped by Target Site */}
                    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                      {Object.entries(groupedFutureProducts).map(([siteKey, group]) => {
                        const matchingItems = group.items.filter(fp => {
                          return selectedCategoryFilter === 'all' || fp.categorie === selectedCategoryFilter;
                        });

                        if (matchingItems.length === 0) return null;

                        return (
                          <div
                            key={`group-${siteKey}`}
                            className={`rounded-2xl border p-4 transition-all ${
                              group.isNonExistant
                                ? 'bg-amber-50/60 border-amber-300'
                                : 'bg-slate-50/60 border-slate-200'
                            }`}
                          >
                            {/* Group Header */}
                            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                              <div className="flex items-center gap-2">
                                <span className="font-black text-xs text-slate-800">
                                  {group.siteLabel}
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold">
                                  ({matchingItems.length} article{matchingItems.length > 1 ? 's' : ''})
                                </span>
                              </div>

                              {group.isNonExistant && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-800 border border-red-200">
                                  <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                                  <span>Site inexistant (Non affectable)</span>
                                </span>
                              )}
                            </div>

                            {/* WARNING REQUIRED BY USER: site x,y... n'existe pas dans un site tu ne peux pas les affecter ses produits */}
                            {group.isNonExistant && (
                              <div className="mb-3 p-3 rounded-xl bg-amber-100 border border-amber-300 text-xs text-amber-950 font-bold flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                                <span>
                                  ⚠️ Le site "{siteKey}" n'existe pas dans un site (table active MultiShop). Vous ne pouvez pas affecter ces produits à une boutique.
                                </span>
                              </div>
                            )}

                            {/* Items List */}
                            <div className="divide-y divide-slate-200/80">
                              {matchingItems.map(fp => {
                                const isConverted = fp.statut === 'converti_en_stock';
                                const state = selectedFutureProducts[fp.id] || {
                                  selected: false,
                                  quantite: fp.quantite || 10,
                                  prixAchat: fp.prix_source || 45
                                };

                                return (
                                  <div
                                    key={fp.id}
                                    className={`py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                      group.isNonExistant ? 'opacity-65' : ''
                                    }`}
                                  >
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                      <input
                                        type="checkbox"
                                        disabled={group.isNonExistant || isConverted}
                                        checked={state.selected}
                                        onChange={(e) => {
                                          setSelectedFutureProducts({
                                            ...selectedFutureProducts,
                                            [fp.id]: {
                                              ...state,
                                              selected: e.target.checked
                                            }
                                          });
                                        }}
                                        className="rounded text-purple-600 focus:ring-purple-500 cursor-pointer disabled:opacity-40"
                                      />
                                      <img
                                        src={fp.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=200'}
                                        alt=""
                                        className="w-10 h-10 rounded-xl object-cover bg-white border border-slate-200 shrink-0"
                                      />
                                      <div className="min-w-0">
                                        <p className="font-bold text-xs text-slate-900 line-clamp-1">{fp.nom}</p>
                                        <p className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                          <span>Catégorie : <strong>{fp.categorie}</strong></span>
                                          <span>•</span>
                                          <span>Source : <strong className="text-purple-700">{fp.sourceNom}</strong></span>
                                        </p>
                                      </div>
                                    </div>

                                    {/* Quantité & Prix Achat Inputs */}
                                    <div className="flex items-center gap-3 shrink-0 pl-7 sm:pl-0">
                                      <div>
                                        <span className="text-[9px] text-slate-400 block font-bold">Quantité en Stock</span>
                                        <div className="flex items-center gap-1">
                                          <input
                                            type="number"
                                            min="1"
                                            disabled={group.isNonExistant || isConverted || !state.selected}
                                            value={state.quantite}
                                            onChange={(e) => {
                                              setSelectedFutureProducts({
                                                ...selectedFutureProducts,
                                                [fp.id]: {
                                                  ...state,
                                                  quantite: Math.max(1, Number(e.target.value))
                                                }
                                              });
                                            }}
                                            className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center disabled:opacity-40"
                                          />
                                          <span className="text-[10px] text-slate-400">unités</span>
                                        </div>
                                      </div>

                                      <div>
                                        <span className="text-[9px] text-slate-400 block font-bold">Prix Achat (DT)</span>
                                        <input
                                          type="number"
                                          min="0"
                                          disabled={group.isNonExistant || isConverted || !state.selected}
                                          value={state.prixAchat}
                                          onChange={(e) => {
                                            setSelectedFutureProducts({
                                              ...selectedFutureProducts,
                                              [fp.id]: {
                                                ...state,
                                                prixAchat: Number(e.target.value)
                                              }
                                            });
                                          }}
                                          className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center disabled:opacity-40"
                                        />
                                      </div>

                                      {isConverted ? (
                                        <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">
                                          Déjà en stock
                                        </span>
                                      ) : state.selected && (
                                        <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                                          📦 Hors boutique par défaut
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Notes globales de réception */}
              {supplierAffectationMode !== 'none' && (
                <div className="pt-2 animate-fadeIn">
                  <label className="block text-slate-700 font-semibold mb-1 text-xs">
                    Notes ou référence bordereau de réception
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Facture d'achat N° 2026-44, Arrivage cargo Port Radès..."
                    value={restockNotes}
                    onChange={(e) => setRestockNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 sticky bottom-0 bg-white py-2">
                <button
                  type="button"
                  onClick={() => setEditingSupplier(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSavingSupplier}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                >
                  {isSavingSupplier 
                    ? 'Enregistrement en cours...' 
                    : supplierAffectationMode !== 'none'
                    ? 'Valider & Enregistrer Fournisseur + Entrée Stock'
                    : 'Enregistrer le Fournisseur'
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📦 MODAL D'ENTRÉE EN STOCK DIRECTE POUR FOURNISSEUR EXISTANT             */}
      {/* ========================================================================= */}
      {activeRestockSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full p-6 sm:p-8 text-slate-900 max-h-[92vh] flex flex-col overflow-hidden border border-slate-100 my-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Fournisseur Partenaire : {activeRestockSupplier.nom}
                </span>
                <h3 className="font-black text-lg text-slate-900 mt-1">
                  NOUVELLE ENTRÉE DE MARCHANDISE EN STOCK
                </h3>
                <p className="text-xs text-slate-500">
                  Sélectionnez si vous réapprovisionnez un produit existant en stock ou si vous convertissez des futurs produits prospectés
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveRestockSupplier(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* TAB SELECTION : 2 OPTIONS */}
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl my-4">
              <button
                type="button"
                onClick={() => setRestockType('produit_existant')}
                className={`py-2.5 px-4 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  restockType === 'produit_existant'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Package className="w-4 h-4 text-emerald-600" />
                <span>Option 1 : Réceptionner Produits Existants</span>
              </button>
              <button
                type="button"
                onClick={() => setRestockType('future_produit')}
                className={`py-2.5 px-4 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  restockType === 'future_produit'
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Option 2 : Affecter Futurs Produits (Conversion)</span>
              </button>
            </div>

            {/* Feedback Alert if any */}
            {restockFeedback && (
              <div className={`p-4 rounded-2xl mb-4 text-xs font-bold flex items-center gap-2 animate-fadeIn ${
                restockFeedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {restockFeedback.type === 'success' ? (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{restockFeedback.message}</span>
              </div>
            )}

            {/* TAB 1: EXISTING PRODUCTS */}
            {restockType === 'produit_existant' && (
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                <div className="bg-blue-50/70 border border-blue-200 p-3 rounded-2xl text-xs text-blue-950">
                  <p className="font-bold">Notice de Gestion de Stock :</p>
                  <p className="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
                    Indiquez la quantité livrée. La quantité s'additionnera directement au stock actuel.
                    Les articles qui étaient en statut <em>"Hors boutique"</em> restent hors boutique jusqu'à validation manuelle dans leur fiche.
                  </p>
                </div>

                {/* Filter and search */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Filtrer par nom ou référence..."
                      value={existingSearch}
                      onChange={(e) => setExistingSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <select
                    value={existingShopFilter}
                    onChange={(e) => setExistingShopFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
                  >
                    <option value="all">Toutes les boutiques ({products.length})</option>
                    <option value="nutrition">⚡ Fitness Shop</option>
                    <option value="youpi">🧸 YoupiShop</option>
                  </select>
                </div>

                {/* Table of Existing Products */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-[340px] overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 w-10">Select</th>
                        <th className="py-2.5 px-3">Article</th>
                        <th className="py-2.5 px-3">Boutique</th>
                        <th className="py-2.5 px-3">Stock Actuel</th>
                        <th className="py-2.5 px-3">Statut Boutique</th>
                        <th className="py-2.5 px-3 w-32">Quantité Reçue</th>
                        <th className="py-2.5 px-3 w-32">Prix Achat (DT)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredExistingProducts.map(p => {
                        const state = selectedExistingProducts[p.id] || { 
                          selected: false, 
                          quantite: 10, 
                          prixAchat: Math.round((p.price || 50) * 0.6) 
                        };
                        const isInBoutique = p.existe_dans_boutique !== false;

                        return (
                          <tr
                            key={`modal-${p.filialeKey}-${p.id}`}
                            className={`transition-colors ${state.selected ? 'bg-emerald-50/40' : 'hover:bg-slate-50'}`}
                          >
                            <td className="py-2 px-3">
                              <input
                                type="checkbox"
                                checked={state.selected}
                                onChange={(e) => {
                                  setSelectedExistingProducts({
                                    ...selectedExistingProducts,
                                    [p.id]: {
                                      ...state,
                                      selected: e.target.checked
                                    }
                                  });
                                }}
                                className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                              />
                            </td>
                            <td className="py-2 px-3 font-semibold text-slate-800">
                              <div className="flex items-center gap-2">
                                <img
                                  src={p.imageUrl}
                                  alt=""
                                  className="w-8 h-8 rounded-lg object-cover bg-slate-100 shrink-0"
                                />
                                <div>
                                  <span className="line-clamp-1 max-w-[200px] font-bold">{p.name}</span>
                                  <span className="text-[10px] text-slate-400">{p.brand}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-2 px-3 text-[11px] font-bold text-slate-600">
                              {p.filialeName || p.filialeKey}
                            </td>
                            <td className="py-2 px-3 font-bold text-slate-700">
                              {p.quantité_enstock ?? p.quantity ?? 0} unités
                            </td>
                            <td className="py-2 px-3">
                              {isInBoutique ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  En boutique
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                  Hors boutique
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                min="1"
                                disabled={!state.selected}
                                value={state.quantite}
                                onChange={(e) => {
                                  setSelectedExistingProducts({
                                    ...selectedExistingProducts,
                                    [p.id]: {
                                      ...state,
                                      quantite: Math.max(1, Number(e.target.value))
                                    }
                                  });
                                }}
                                className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center disabled:opacity-40"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                min="0"
                                disabled={!state.selected}
                                value={state.prixAchat}
                                onChange={(e) => {
                                  setSelectedExistingProducts({
                                    ...selectedExistingProducts,
                                    [p.id]: {
                                      ...state,
                                      prixAchat: Number(e.target.value)
                                    }
                                  });
                                }}
                                className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center disabled:opacity-40"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: FUTURE PRODUCTS CONVERSION (WITH SITE EXISTENCE VALIDATION) */}
            {restockType === 'future_produit' && (
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                <div className="bg-purple-50/70 border border-purple-200 p-3.5 rounded-2xl text-xs text-purple-950">
                  <p className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>Règles d'Intégration des Futurs Produits :</span>
                  </p>
                  <p className="text-[11px] text-purple-800 mt-1 leading-relaxed">
                    Les futurs produits validés sont créés dans la boutique cible avec leur quantité en stock.
                    <strong> Par défaut, ils sont enregistrés avec le statut "Hors boutique"</strong> afin que vous puissiez réviser leurs fiches (description, photos, prix) et cocher "Publier en boutique" avant mise en ligne aux clients.
                  </p>
                </div>

                {/* Grouped by Target Site */}
                <div className="space-y-4">
                  {Object.entries(groupedFutureProducts).map(([siteKey, group]) => {
                    return (
                      <div
                        key={siteKey}
                        className={`rounded-2xl border p-4 transition-all ${
                          group.isNonExistant
                            ? 'bg-amber-50/60 border-amber-300'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        {/* Group Header */}
                        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-xs text-slate-800">
                              {group.siteLabel}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold">
                              ({group.items.length} référence{group.items.length > 1 ? 's' : ''})
                            </span>
                          </div>

                          {group.isNonExistant && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span>Site inexistant dans le réseau (Affectation bloquée)</span>
                            </span>
                          )}
                        </div>

                        {/* Warning message if non-existant */}
                        {group.isNonExistant && (
                          <div className="mb-3 p-2.5 rounded-xl bg-amber-100 border border-amber-300 text-xs text-amber-950 font-bold">
                            ⚠️ Le site "{siteKey}" n'existe pas dans un site tu ne peux pas les affecter ses produits.
                          </div>
                        )}

                        {/* Future Products in this Group */}
                        <div className="divide-y divide-slate-100">
                          {group.items.map(fp => {
                            const isConverted = fp.statut === 'converti_en_stock';
                            const state = selectedFutureProducts[fp.id] || {
                              selected: false,
                              quantite: fp.quantite || 10,
                              prixAchat: fp.prix_source || 45
                            };

                            return (
                              <div
                                key={fp.id}
                                className={`py-2.5 flex items-center justify-between gap-3 ${
                                  group.isNonExistant ? 'opacity-60' : ''
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <input
                                    type="checkbox"
                                    disabled={group.isNonExistant || isConverted}
                                    checked={state.selected}
                                    onChange={(e) => {
                                      setSelectedFutureProducts({
                                        ...selectedFutureProducts,
                                        [fp.id]: {
                                          ...state,
                                          selected: e.target.checked
                                        }
                                      });
                                    }}
                                    className="rounded text-purple-600 focus:ring-purple-500 cursor-pointer disabled:opacity-40"
                                  />
                                  <img
                                    src={fp.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=200'}
                                    alt=""
                                    className="w-9 h-9 rounded-lg object-cover bg-slate-100 shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <p className="font-bold text-xs text-slate-800 line-clamp-1">{fp.nom}</p>
                                    <p className="text-[10px] text-slate-400">
                                      Catégorie : <strong>{fp.categorie}</strong> • Source : {fp.sourceNom}
                                    </p>
                                  </div>
                                </div>

                                {/* Inputs for quantity & purchase price */}
                                <div className="flex items-center gap-2 shrink-0">
                                  <div>
                                    <span className="text-[9px] text-slate-400 block font-bold">Qté Stock</span>
                                    <input
                                      type="number"
                                      min="1"
                                      disabled={group.isNonExistant || isConverted || !state.selected}
                                      value={state.quantite}
                                      onChange={(e) => {
                                        setSelectedFutureProducts({
                                          ...selectedFutureProducts,
                                          [fp.id]: {
                                            ...state,
                                            quantite: Math.max(1, Number(e.target.value))
                                          }
                                        });
                                      }}
                                      className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center disabled:opacity-40"
                                    />
                                  </div>

                                  <div>
                                    <span className="text-[9px] text-slate-400 block font-bold">Prix Achat</span>
                                    <input
                                      type="number"
                                      min="0"
                                      disabled={group.isNonExistant || isConverted || !state.selected}
                                      value={state.prixAchat}
                                      onChange={(e) => {
                                        setSelectedFutureProducts({
                                          ...selectedFutureProducts,
                                          [fp.id]: {
                                            ...state,
                                            prixAchat: Number(e.target.value)
                                          }
                                        });
                                      }}
                                      className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center disabled:opacity-40"
                                    />
                                  </div>

                                  {isConverted && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                                      Déjà en stock
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Notes & Modal Footer */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="w-full sm:w-1/2">
                <input
                  type="text"
                  placeholder="Notes de réception (numéro de facture, bordereau, livreur...)"
                  value={restockNotes}
                  onChange={(e) => setRestockNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setActiveRestockSupplier(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={isExecutingRestock}
                  onClick={handleSubmitRestock}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  {isExecutingRestock ? 'Enregistrement en cours...' : 'Valider & Enregistrer en Stock'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📜 MODAL DÉTAILS FOURNISSEUR (PRODUITS LIÉS + HISTORIQUE D'ACHAT)         */}
      {/* ========================================================================= */}
      {selectedSupplierForDetails && (() => {
        const linkedProds = products.filter(p => p.fournisseurId === selectedSupplierForDetails.id || (p.fournisseurNom && p.fournisseurNom.toLowerCase() === selectedSupplierForDetails.nom.toLowerCase()));
        const histAchats = selectedSupplierForDetails.historique_achats || [];

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-xl max-w-2xl w-full p-6 text-slate-900 max-h-[85vh] flex flex-col overflow-hidden">
              <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedSupplierForDetails.image || 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=300'}
                    alt={selectedSupplierForDetails.nom}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-100 shadow-xs"
                  />
                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      {selectedSupplierForDetails.nom}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {selectedSupplierForDetails.localisation || 'Tunisie'} {selectedSupplierForDetails.telephone ? `• ${selectedSupplierForDetails.telephone}` : ''}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSupplierForDetails(null)}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Navigation Tabs inside Modal */}
              <div className="flex items-center gap-2 pt-3 pb-2 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => setSupplierDetailTab('products')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    supplierDetailTab === 'products'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Articles Catalogue ({linkedProds.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSupplierDetailTab('receptions')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    supplierDetailTab === 'receptions'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Historique des Réceptions ({histAchats.length})</span>
                </button>
              </div>

              {/* Tab 1: Linked Catalogue Products */}
              {supplierDetailTab === 'products' && (
                <div className="flex-1 overflow-y-auto py-4 space-y-2.5">
                  {linkedProds.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs space-y-2">
                      <Package className="w-8 h-8 mx-auto text-slate-300" />
                      <p className="font-semibold text-slate-600">Aucun produit du catalogue n'est encore rattaché à ce fournisseur</p>
                      <p className="text-[11px] text-slate-400">
                        Dans l'onglet "Catalogue & Stock", éditez un produit ou créez-en un nouveau et sélectionnez "{selectedSupplierForDetails.nom}".
                      </p>
                    </div>
                  ) : (
                    linkedProds.map((prod) => {
                      const stockQty = prod.quantité_enstock ?? prod.quantity ?? 0;
                      return (
                        <div
                          key={`${prod.filialeKey}-${prod.id}`}
                          className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.imageUrl || prod.images?.[0] || 'https://picsum.photos/400/400'}
                              alt={prod.name}
                              className="w-10 h-10 rounded-xl object-cover bg-white border border-slate-100 shadow-2xs"
                            />
                            <div>
                              <p className="font-bold text-slate-900 text-xs line-clamp-1">{prod.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">{prod.filialeName || prod.filialeKey}</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-[10px] text-slate-400">{prod.category}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <span className="font-black text-slate-900 text-xs block">{prod.price} DT</span>
                              <span className={`text-[10px] font-bold ${stockQty > 5 ? 'text-emerald-700' : 'text-amber-700'}`}>
                                {stockQty} en stock
                              </span>
                            </div>

                            {prod.existe_dans_boutique !== false ? (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                                En boutique
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800">
                                Hors boutique
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Tab 2: Purchase & Stock Reception History */}
              {supplierDetailTab === 'receptions' && (
                <div className="flex-1 overflow-y-auto py-4 space-y-3">
                  {histAchats.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs">
                      Aucun historique d'achat ou de réception enregistré pour ce fournisseur pour le moment.
                    </div>
                  ) : (
                    histAchats.map((achat, idx) => (
                      <div key={achat.id || idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="flex items-center gap-1.5 text-slate-800">
                            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Réception du {achat.date}</span>
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {achat.type === 'produit_existant' ? 'Produits Existants' : 'Futurs Produits Convertis'}
                          </span>
                        </div>

                        <div className="divide-y divide-slate-200/60 pt-1 text-xs">
                          {achat.items?.map((item, i) => (
                            <div key={i} className="py-1.5 flex items-center justify-between text-[11px]">
                              <span className="font-semibold text-slate-700">
                                • {item.nom} ({item.siteName || item.site})
                              </span>
                              <span className="font-bold text-slate-900">
                                +{item.quantite} unités {item.prixAchat ? `à ${item.prixAchat} DT` : ''}
                              </span>
                            </div>
                          ))}
                        </div>

                        {achat.notes && (
                          <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200/60">
                            Note : {achat.notes}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedSupplierForDetails(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
