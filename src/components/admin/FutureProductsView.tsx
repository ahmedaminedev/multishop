import React, { useState } from 'react';
import { Search, Plus, ExternalLink, Image as ImageIcon, Tag, Store, AlertTriangle, Edit3, Trash2, ArrowRight, CheckCircle2, Sparkles, Building2, Package } from 'lucide-react';
import { FutureProduit, SourceProduit, StatutFutureProduit } from '../../models/ProductFiliale';
import { ImageUploadInput } from '../common/ImageUploadInput';

interface FutureProductsViewProps {
  futureProducts: FutureProduit[];
  sources: SourceProduit[];
  onSaveFutureProduct: (product: FutureProduit) => Promise<void>;
  onDeleteFutureProduct: (id: string) => Promise<void>;
  onQuickAddSource?: (source: SourceProduit) => Promise<SourceProduit>;
  onOpenRestockWithFuture?: (futureProduct: FutureProduit) => void;
  categoriesBySite?: Record<string, string[]>;
}

const DEFAULT_CATEGORIES_BY_SITE: Record<string, string[]> = {
  fitnessshop: [
    'Haltères & Poids Libres',
    'Bancs de Musculation',
    'Racks & Stations Crossfit',
    'Tapis de Course & Cardio',
    'Nutrition Sportive & Whey',
    'Accessoires & Bandes'
  ],
  parashop: [
    'Sérums & Soins Visage',
    'Vitamines & Compléments',
    'Phytothérapie & Bio',
    'Hygiène & Corps',
    'Défenses Immunitaires'
  ],
  cosmetic: [
    'Soins Visage & Rituels',
    'Maquillage & Teint',
    'Parfumerie de Luxe',
    'Soins Anti-Âge & Peptides',
    'Sérums Éclat'
  ],
  electro: [
    'Multimédia & Son',
    'Gros Électroménager',
    'Petit Électroménager',
    'Smartphones & Accessoires',
    'Gaming & TV'
  ]
};

const SITE_OPTIONS = [
  { id: 'fitnessshop', label: 'Fitness Shop (Équipements & Muscu)', filialeKey: 'nutrition', color: 'text-lime-700 bg-lime-50 border-lime-200' },
  { id: 'parashop', label: 'PharmaShop (Parapharmacie & Bio)', filialeKey: 'para', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { id: 'cosmetic', label: 'Cosmetics Shop (Beauté & Luxe)', filialeKey: 'cosmetic', color: 'text-rose-700 bg-rose-50 border-rose-200' },
  { id: 'electro', label: 'Electro Shop (High-Tech & Maison)', filialeKey: 'electro', color: 'text-blue-700 bg-blue-50 border-blue-200' }
];

export const FutureProductsView: React.FC<FutureProductsViewProps> = ({
  futureProducts,
  sources,
  onSaveFutureProduct,
  onDeleteFutureProduct,
  onQuickAddSource,
  onOpenRestockWithFuture,
  categoriesBySite = DEFAULT_CATEGORIES_BY_SITE
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [siteFilter, setSiteFilter] = useState('all');
  const [statutFilter, setStatutFilter] = useState<string>('all');
  const [editingFutureProduct, setEditingFutureProduct] = useState<Partial<FutureProduit> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Sub-state for quick adding a source from inside the modal
  const [showQuickSourceForm, setShowQuickSourceForm] = useState(false);
  const [quickSourceData, setQuickSourceData] = useState({ nom: '', lien: '', type_vente: 'les_deux' as const });
  const [isQuickSourceSaving, setIsQuickSourceSaving] = useState(false);

  const filteredList = futureProducts.filter(fp => {
    const matchSearch = !searchQuery ||
      fp.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (fp.sourceNom && fp.sourceNom.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (fp.categorie && fp.categorie.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (fp.futur_site && fp.futur_site.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchSite = siteFilter === 'all' ||
      (siteFilter === 'non_existant' && (fp.is_futur_site || fp.futur_site)) ||
      (!fp.is_futur_site && fp.site === siteFilter);

    const matchStatut = statutFilter === 'all' || fp.statut === statutFilter;

    return matchSearch && matchSite && matchStatut;
  });

  const handleOpenAddModal = () => {
    setEditingFutureProduct({
      nom: '',
      image: '',
      lien: '',
      prix_source: 0,
      quantite: 15,
      sourceId: sources[0]?.id || '',
      sourceNom: sources[0]?.nom || '',
      site: 'fitnessshop',
      is_futur_site: false,
      futur_site: '',
      categorie: categoriesBySite.fitnessshop?.[0] || 'Général',
      statut: 'en_prospection',
      notes: ''
    });
    setShowQuickSourceForm(false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFutureProduct?.nom) return;
    if (!editingFutureProduct.sourceId) {
      alert("Une source existante doit être obligatoirement affectée. Vous pouvez en créer une nouvelle en un clic.");
      return;
    }

    setIsSaving(true);
    try {
      const selectedSource = sources.find(s => s.id === editingFutureProduct.sourceId);
      const productToSave = new FutureProduit({
        ...editingFutureProduct,
        sourceNom: selectedSource?.nom || editingFutureProduct.sourceNom || 'Source Partenaire'
      });
      await onSaveFutureProduct(productToSave);
      setEditingFutureProduct(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateQuickSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSourceData.nom || !quickSourceData.lien || !onQuickAddSource) return;
    setIsQuickSourceSaving(true);
    try {
      const created = await onQuickAddSource(new SourceProduit(quickSourceData));
      setEditingFutureProduct(prev => prev ? { ...prev, sourceId: created.id, sourceNom: created.nom } : null);
      setShowQuickSourceForm(false);
      setQuickSourceData({ nom: '', lien: '', type_vente: 'les_deux' });
    } finally {
      setIsQuickSourceSaving(false);
    }
  };

  const getSiteBadge = (fp: FutureProduit) => {
    if (fp.is_futur_site || fp.futur_site) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          <span>Futur Site : {fp.futur_site || 'Inconnu'}</span>
        </span>
      );
    }

    const opt = SITE_OPTIONS.find(s => s.id === fp.site);
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${opt?.color || 'bg-slate-100 text-slate-700'}`}>
        <Store className="w-3 h-3" />
        <span>{opt?.label?.split(' (')[0] || fp.site}</span>
      </span>
    );
  };

  const getStatutBadge = (statut: StatutFutureProduit) => {
    switch (statut) {
      case 'en_prospection':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">En Prospection</span>;
      case 'converti_en_stock':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Converti en Stock</span>;
      case 'abandonne':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">Abandonné</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              PROSPECTION : FUTURS PRODUITS
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800">
              {futureProducts.length} références repérées
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Veille de marché : articles identifiés chez vos sources avant achat grossiste et entrée en stock
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Futur Produit</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un futur produit, une source, une catégorie..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Site Filter */}
        <select
          value={siteFilter}
          onChange={(e) => setSiteFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
        >
          <option value="all">Tous les sites cibles</option>
          <option value="fitnessshop">⚡ Fitness Shop</option>
          <option value="parashop">🌿 PharmaShop</option>
          <option value="cosmetic">💄 Cosmetics Shop</option>
          <option value="electro">🔌 Electro Shop</option>
          <option value="non_existant">⚠️ Futurs sites (non existants)</option>
        </select>

        {/* Status Filter */}
        <select
          value={statutFilter}
          onChange={(e) => setStatutFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
        >
          <option value="all">Tous les statuts</option>
          <option value="en_prospection">En prospection</option>
          <option value="converti_en_stock">Converti en stock</option>
          <option value="abandonne">Abandonné</option>
        </select>
      </div>

      {/* Grid of Future Products */}
      {filteredList.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-xs">
          <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-800">Aucun futur produit trouvé</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Identifiez des produits tendances sur Instagram ou TikTok et enregistrez-les ici pour planifier vos achats auprès des fournisseurs.
          </p>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter un futur produit</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((fp) => {
            const isNonExistantSite = fp.is_futur_site || Boolean(fp.futur_site);
            return (
              <div
                key={fp.id}
                className="bg-white border border-slate-200/80 hover:border-purple-300 rounded-2xl p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Bar */}
                  <div className="flex items-start gap-3">
                    <img
                      src={fp.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=400'}
                      alt={fp.nom}
                      className="w-16 h-16 rounded-xl object-cover bg-slate-50 border border-slate-100 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Prix source : <strong className="text-slate-900 text-xs">{fp.prix_source} DT</strong>
                        </span>
                        {getStatutBadge(fp.statut)}
                      </div>
                      <h3 className="font-bold text-slate-900 text-xs line-clamp-2 mt-0.5">{fp.nom}</h3>
                      <p className="text-[11px] text-purple-700 font-semibold mt-1 flex items-center gap-1 truncate">
                        <span>🏷️</span>
                        <span className="truncate">{fp.categorie}</span>
                      </p>
                    </div>
                  </div>

                  {/* Destination Site and Source info */}
                  <div className="space-y-1.5 text-xs pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">Site Cible :</span>
                      {getSiteBadge(fp)}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">Source :</span>
                      <span className="font-semibold text-slate-700 truncate text-[11px] max-w-[160px]">
                        {fp.sourceNom || 'Source Non Spécifiée'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">Quantité prévue :</span>
                      <span className="font-bold text-slate-800 text-[11px] bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        📦 {fp.quantite || fp.quantite_enstock || 10} unités
                      </span>
                    </div>

                    {fp.lien && (
                      <a
                        href={fp.lien}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1 text-[11px] font-medium pt-1"
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate">Lien de la publication repérée</span>
                      </a>
                    )}

                    {isNonExistantSite && (
                      <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-800 space-y-0.5">
                        <div className="flex items-center gap-1 font-bold">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Boutique non déployée</span>
                        </div>
                        <p className="text-[10px] text-amber-700">
                          Ce produit est rattaché à <strong>"{fp.futur_site}"</strong>. Il ne pourra être affecté en stock qu'après création effective de ce site.
                        </p>
                      </div>
                    )}

                    {fp.notes && (
                      <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl mt-1 line-clamp-2">
                        {fp.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Card Actions */}
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingFutureProduct({ ...fp })}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                      title="Modifier ce futur produit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(fp.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {fp.statut === 'en_prospection' && !isNonExistantSite && onOpenRestockWithFuture && (
                    <button
                      type="button"
                      onClick={() => onOpenRestockWithFuture(fp)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 font-bold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>Acheter & Stocker</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {editingFutureProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6 text-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {editingFutureProduct.id ? 'Modifier le Futur Produit' : 'Ajouter un Futur Produit en Prospection'}
                </h3>
                <p className="text-xs text-slate-500">
                  Enregistrez les informations relevées lors de votre veille pour vos futurs approvisionnements
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingFutureProduct(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nom du produit repéré <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Tapis Roulant Pliable Pro, Sérum Vitamine C..."
                  value={editingFutureProduct.nom || ''}
                  onChange={(e) => setEditingFutureProduct({ ...editingFutureProduct, nom: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Image avec import PC et URL */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <ImageUploadInput
                  label="Image du futur produit"
                  value={editingFutureProduct.image || ''}
                  onChange={(url) => setEditingFutureProduct({ ...editingFutureProduct, image: url })}
                  placeholder="https://..."
                  helperText="📁 Vous pouvez importer une photo enregistrée sur votre ordinateur (PC) ou coller une URL d'image web."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Prix Source Constaté (DT)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={editingFutureProduct.prix_source || 0}
                    onChange={(e) => setEditingFutureProduct({ ...editingFutureProduct, prix_source: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Quantité Envisagée (Stock)</label>
                  <input
                    type="number"
                    min="1"
                    value={editingFutureProduct.quantite ?? editingFutureProduct.quantite_enstock ?? 10}
                    onChange={(e) => {
                      const q = Math.max(1, Number(e.target.value));
                      setEditingFutureProduct({ ...editingFutureProduct, quantite: q, quantite_enstock: q });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Lien de la publication / produit</label>
                <input
                  type="url"
                  placeholder="https://instagram.com/..., https://facebook.com/..."
                  value={editingFutureProduct.lien || ''}
                  onChange={(e) => setEditingFutureProduct({ ...editingFutureProduct, lien: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Obligation d'affectation à une source */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-800 font-bold">
                    Source de Veille Affectée <span className="text-red-500">*</span>
                  </label>
                  {onQuickAddSource && (
                    <button
                      type="button"
                      onClick={() => setShowQuickSourceForm(!showQuickSourceForm)}
                      className="text-purple-600 hover:text-purple-800 text-[11px] font-bold cursor-pointer"
                    >
                      {showQuickSourceForm ? 'Annuler' : '+ Créer nouvelle source'}
                    </button>
                  )}
                </div>

                {!showQuickSourceForm ? (
                  <select
                    required
                    value={editingFutureProduct.sourceId || ''}
                    onChange={(e) => {
                      const sel = sources.find(s => s.id === e.target.value);
                      setEditingFutureProduct({
                        ...editingFutureProduct,
                        sourceId: e.target.value,
                        sourceNom: sel?.nom || ''
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  >
                    <option value="">Sélectionnez une source de veille...</option>
                    {sources.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.nom} ({s.type_vente === 'engros' ? 'En gros' : s.type_vente === 'detail' ? 'Détail' : 'Gros & Détail'})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-white rounded-xl border border-purple-200 space-y-2 animate-fadeIn">
                    <p className="font-bold text-[11px] text-purple-900">Ajout rapide de source :</p>
                    <input
                      type="text"
                      placeholder="Nom de la source (ex: Page Insta @trendy)"
                      value={quickSourceData.nom}
                      onChange={(e) => setQuickSourceData({ ...quickSourceData, nom: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                    />
                    <input
                      type="url"
                      placeholder="Lien URL de la page"
                      value={quickSourceData.lien}
                      onChange={(e) => setQuickSourceData({ ...quickSourceData, lien: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                    />
                    <button
                      type="button"
                      disabled={isQuickSourceSaving}
                      onClick={handleCreateQuickSource}
                      className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      {isQuickSourceSaving ? 'Création...' : 'Créer et Affecter cette Source'}
                    </button>
                  </div>
                )}
              </div>

              {/* Site et option Site non existant */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Boutique de Destination</span>

                  <label className="flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(editingFutureProduct.is_futur_site)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setEditingFutureProduct({
                          ...editingFutureProduct,
                          is_futur_site: checked,
                          site: checked ? 'autre' : 'fitnessshop',
                          futur_site: checked ? (editingFutureProduct.futur_site || '') : '',
                          categorie: checked ? '' : (categoriesBySite.fitnessshop?.[0] || 'Général')
                        });
                      }}
                      className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                    <span>Site non existant (Nouveau concept)</span>
                  </label>
                </div>

                {!editingFutureProduct.is_futur_site ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Site Actif du Réseau</label>
                      <select
                        value={editingFutureProduct.site || 'fitnessshop'}
                        onChange={(e) => {
                          const siteKey = e.target.value;
                          const cats = categoriesBySite[siteKey] || [];
                          setEditingFutureProduct({
                            ...editingFutureProduct,
                            site: siteKey,
                            categorie: cats[0] || 'Général'
                          });
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500 cursor-pointer"
                      >
                        {SITE_OPTIONS.map(opt => (
                          <option key={opt.id} value={opt.id}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Catégorie du Site</label>
                      <select
                        value={editingFutureProduct.categorie || ''}
                        onChange={(e) => setEditingFutureProduct({ ...editingFutureProduct, categorie: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500 cursor-pointer"
                      >
                        {(categoriesBySite[editingFutureProduct.site || 'fitnessshop'] || ['Général']).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 p-3 bg-amber-50/70 border border-amber-200 rounded-xl animate-fadeIn">
                    <div>
                      <label className="block text-amber-900 font-bold mb-1">
                        Nom du Futur Site (Boutique non existante actuellement) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: OpticShop, ModeShop, BabyCare..."
                        value={editingFutureProduct.futur_site || ''}
                        onChange={(e) => setEditingFutureProduct({ ...editingFutureProduct, futur_site: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 text-xs font-bold text-amber-900 focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-amber-900 font-bold mb-1">Catégorie pour ce futur site</label>
                      <input
                        type="text"
                        placeholder="Ex: Montures de Vue, Poussettes..."
                        value={editingFutureProduct.categorie || ''}
                        onChange={(e) => setEditingFutureProduct({ ...editingFutureProduct, categorie: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 text-xs font-medium text-amber-900 focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Notes de veille</label>
                <textarea
                  rows={2}
                  placeholder="Pourquoi ce produit est prometteur, marge prévisionnelle..."
                  value={editingFutureProduct.notes || ''}
                  onChange={(e) => setEditingFutureProduct({ ...editingFutureProduct, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingFutureProduct(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  {isSaving ? 'Enregistrement...' : 'Enregistrer le Futur Produit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-slate-900">
            <h3 className="font-bold text-sm text-slate-900 mb-2">Confirmer la suppression</h3>
            <p className="text-xs text-slate-500 mb-4">
              Êtes-vous sûr de vouloir supprimer ce futur produit prospecté ?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={async () => {
                  await onDeleteFutureProduct(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
