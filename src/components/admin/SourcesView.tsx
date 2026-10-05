import React, { useState } from 'react';
import { Search, Plus, ExternalLink, Phone, MapPin, Tag, Edit3, Trash2, Sparkles, Instagram, Globe, CheckCircle } from 'lucide-react';
import { SourceProduit, TypeVenteSource } from '../../models/ProductFiliale';

interface SourcesViewProps {
  sources: SourceProduit[];
  onSaveSource: (source: SourceProduit) => Promise<void>;
  onDeleteSource: (id: string) => Promise<void>;
  onCreateFutureProductForSource?: (source: SourceProduit) => void;
  futureProductsCountBySource?: Record<string, number>;
}

export const SourcesView: React.FC<SourcesViewProps> = ({
  sources,
  onSaveSource,
  onDeleteSource,
  onCreateFutureProductForSource,
  futureProductsCountBySource = {}
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TypeVenteSource>('all');
  const [editingSource, setEditingSource] = useState<Partial<SourceProduit> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredSources = sources.filter(s => {
    const matchSearch = !searchQuery ||
      s.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.lien.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.localisation && s.localisation.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.notes && s.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchType = typeFilter === 'all' || s.type_vente === typeFilter;
    return matchSearch && matchType;
  });

  const handleOpenAddModal = () => {
    setEditingSource({
      nom: '',
      lien: '',
      numero: '',
      localisation: '',
      type_vente: 'les_deux',
      notes: ''
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSource?.nom || !editingSource?.lien) return;
    setIsSaving(true);
    try {
      const sourceToSave = new SourceProduit(editingSource);
      await onSaveSource(sourceToSave);
      setEditingSource(null);
    } finally {
      setIsSaving(false);
    }
  };

  const renderTypeVenteBadge = (type: TypeVenteSource) => {
    switch (type) {
      case 'engros':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">En gros</span>;
      case 'detail':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">En détail</span>;
      case 'les_deux':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">En gros & détail</span>;
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
              SOURCES DE VEILLE & SOURCING
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
              {sources.length} sources
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Répertoire des pages et canaux où vous repérez les tendances produits (Instagram, TikTok, Facebook, grossistes)
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle Source</span>
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
            placeholder="Rechercher une source, un lien, une ville..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              typeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tous ({sources.length})
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('engros')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              typeFilter === 'engros' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            En gros
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('detail')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              typeFilter === 'detail' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            En détail
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('les_deux')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              typeFilter === 'les_deux' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Les deux
          </button>
        </div>
      </div>

      {/* Sources Grid */}
      {filteredSources.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-xs">
          <Globe className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-800">Aucune source trouvée</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Ajoutez votre première source de prospection (page Instagram, TikTok, grossiste local) pour y rattacher de futurs produits.
          </p>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter une source</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSources.map((source) => {
            const countFuturs = futureProductsCountBySource[source.id] || 0;
            return (
              <div
                key={source.id}
                className="bg-white border border-slate-200/80 hover:border-blue-300 rounded-2xl p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Bar in card */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{source.nom}</h3>
                      <div className="mt-1 flex items-center gap-2">
                        {renderTypeVenteBadge(source.type_vente)}
                        <span className="text-[10px] text-slate-400 font-medium">
                          {countFuturs} futur{countFuturs > 1 ? 's' : ''} produit{countFuturs > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setEditingSource({ ...source })}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        title="Modifier la source"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(source.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Supprimer la source"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <a
                      href={source.lien}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1.5 truncate font-medium"
                    >
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{source.lien}</span>
                    </a>

                    {source.numero && (
                      <p className="flex items-center gap-1.5 text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{source.numero}</span>
                      </p>
                    )}

                    {source.localisation && (
                      <p className="flex items-center gap-1.5 text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{source.localisation}</span>
                      </p>
                    )}

                    {source.notes && (
                      <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl mt-2 line-clamp-2">
                        {source.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Action: Create Future Product from this Source */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400">
                    Ajoutée le {new Date(source.dateCreation).toLocaleDateString('fr-FR')}
                  </span>

                  {onCreateFutureProductForSource && (
                    <button
                      type="button"
                      onClick={() => onCreateFutureProductForSource(source)}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>+ Futur Produit</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit / Add Modal */}
      {editingSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 text-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {editingSource.id ? 'Modifier la Source' : 'Nouvelle Source de Produit'}
                </h3>
                <p className="text-xs text-slate-500">
                  Enregistrez la page social media ou le grossiste où vous avez vu des articles intéressants
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingSource(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nom ou Intitulé de la Source <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Page Insta @fitgear_tn, Grossiste Rue d'Athènes..."
                  value={editingSource.nom || ''}
                  onChange={(e) => setEditingSource({ ...editingSource, nom: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Lien URL de la page / profil <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://instagram.com/..., https://tiktok.com/@..."
                  value={editingSource.lien || ''}
                  onChange={(e) => setEditingSource({ ...editingSource, lien: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Téléphone / Contact</label>
                  <input
                    type="text"
                    placeholder="+216 20 000 000"
                    value={editingSource.numero || ''}
                    onChange={(e) => setEditingSource({ ...editingSource, numero: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Localisation (Optionnel)</label>
                  <input
                    type="text"
                    placeholder="Ex: Sousse, Tunis, Chine..."
                    value={editingSource.localisation || ''}
                    onChange={(e) => setEditingSource({ ...editingSource, localisation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">Type de Vente</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'engros' as TypeVenteSource, label: 'En gros' },
                    { id: 'detail' as TypeVenteSource, label: 'En détail' },
                    { id: 'les_deux' as TypeVenteSource, label: 'Les deux' }
                  ].map((t) => (
                    <label
                      key={t.id}
                      className={`flex items-center justify-center p-2 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
                        editingSource.type_vente === t.id
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="type_vente"
                        value={t.id}
                        checked={editingSource.type_vente === t.id}
                        onChange={() => setEditingSource({ ...editingSource, type_vente: t.id })}
                        className="sr-only"
                      />
                      <span>{t.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Notes & Conditions</label>
                <textarea
                  rows={3}
                  placeholder="Quantités minimums, délais de livraison, contact privilégié..."
                  value={editingSource.notes || ''}
                  onChange={(e) => setEditingSource({ ...editingSource, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSource(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  {isSaving ? 'Enregistrement...' : 'Enregistrer la Source'}
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
              Êtes-vous sûr de vouloir supprimer cette source ? Les futurs produits associés conserveront le nom de la source en archive.
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
                  await onDeleteSource(deleteConfirmId);
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
