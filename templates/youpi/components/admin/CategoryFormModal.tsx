import React, { useState, useEffect } from 'react';
import type { Category, SubCategoryGroup } from '../../types';
import { X, Plus, Trash2, Tag, Baby, Palette, Sparkles, FolderTree } from 'lucide-react';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryData: Category) => void;
  category: Category | null;
}

const AGE_RANGES = [
  'Tous âges',
  '0-3 ans (Éveil & Petite Enfance)',
  '3-6 ans (Maternelle & Imagination)',
  '6-12 ans (École & Créativité)',
  '12+ ans (Ados & Stratégie)'
];

const ICONS_PRESETS = [
  { label: 'Ours / Doudou', icon: '🧸' },
  { label: 'Véhicules & Bolides', icon: '🚗' },
  { label: 'Société & Dés', icon: '🎲' },
  { label: 'Briques & Lego', icon: '🧱' },
  { label: 'Créativité & Art', icon: '🎨' },
  { label: 'Plein air & Vélo', icon: '🚲' },
  { label: 'Fusée & Spatial', icon: '🚀' },
  { label: 'Lecture & Contes', icon: '📚' },
  { label: 'Sport & Plein air', icon: '⚽' },
  { label: 'Cadeaux & Surprise', icon: '🎁' }
];

const COLOR_THEMES = [
  { id: 'amber', name: 'Jaune Miel', bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
  { id: 'rose', name: 'Rose Bonbon', bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300' },
  { id: 'blue', name: 'Bleu Ciel', bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  { id: 'emerald', name: 'Vert Forêt', bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
  { id: 'purple', name: 'Violet Magique', bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
  { id: 'cyan', name: 'Turquoise Lagon', bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-300' }
];

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  category
}) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [ageRange, setAgeRange] = useState('Tous âges');
  const [icon, setIcon] = useState('🧸');
  const [color, setColor] = useState('amber');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [menuType, setMenuType] = useState<'none' | 'simple' | 'mega'>('none');
  const [subCategories, setSubCategories] = useState('');
  const [megaMenu, setMegaMenu] = useState<SubCategoryGroup[]>([]);

  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setSlug(category.slug || (category.name ? category.name.toLowerCase().replace(/\s+/g, '-') : ''));
      setAgeRange(category.ageRange || 'Tous âges');
      setIcon(category.icon || '🧸');
      setColor(category.color || 'amber');
      setImage(category.image || '');
      setDescription(category.description || '');

      if (category.megaMenu && category.megaMenu.length > 0) {
        setMenuType('mega');
        setMegaMenu(category.megaMenu);
        setSubCategories('');
      } else if (category.subCategories && category.subCategories.length > 0) {
        setMenuType('simple');
        setSubCategories(category.subCategories.join('\n'));
        setMegaMenu([]);
      } else {
        setMenuType('none');
        setSubCategories('');
        setMegaMenu([]);
      }
    } else {
      setName('');
      setSlug('');
      setAgeRange('Tous âges');
      setIcon('🧸');
      setColor('amber');
      setImage('');
      setDescription('');
      setMenuType('none');
      setSubCategories('');
      setMegaMenu([]);
    }
  }, [category, isOpen]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!category) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-')
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCategory: Category = {
      ...(category?.id ? { id: category.id } : { id: Date.now() }),
      name: name.trim(),
      slug: slug.trim() || name.trim().toLowerCase().replace(/\s+/g, '-'),
      ageRange,
      icon,
      color,
      image,
      description
    };

    if (menuType === 'simple') {
      newCategory.subCategories = subCategories
        .split('\n')
        .map(s => s.trim())
        .filter(s => s !== '');
    } else if (menuType === 'mega') {
      newCategory.megaMenu = megaMenu;
    }

    onSave(newCategory);
    onClose();
  };

  // Mega Menu Helpers (Exact match to FitnessShop functionality)
  const addMegaMenuGroup = () => {
    setMegaMenu([...megaMenu, { title: 'Nouveau Groupe Jouets', items: [{ name: 'Nouvel article' }] }]);
  };

  const removeMegaMenuGroup = (groupIndex: number) => {
    setMegaMenu(megaMenu.filter((_, i) => i !== groupIndex));
  };

  const handleMegaMenuGroupChange = (groupIndex: number, newTitle: string) => {
    const updated = [...megaMenu];
    updated[groupIndex].title = newTitle;
    setMegaMenu(updated);
  };

  const addMegaMenuItem = (groupIndex: number) => {
    const updated = [...megaMenu];
    updated[groupIndex].items.push({ name: 'Nouvel article' });
    setMegaMenu(updated);
  };

  const removeMegaMenuItem = (groupIndex: number, itemIndex: number) => {
    const updated = [...megaMenu];
    updated[groupIndex].items = updated[groupIndex].items.filter((_, i) => i !== itemIndex);
    setMegaMenu(updated);
  };

  const handleMegaMenuItemChange = (groupIndex: number, itemIndex: number, newName: string) => {
    const updated = [...megaMenu];
    updated[groupIndex].items[itemIndex].name = newName;
    setMegaMenu(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl shadow-xs">
              {icon}
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>{category ? 'Modifier la Catégorie' : 'Nouvelle Catégorie Jouets'}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 font-bold">
                  YoupiShop
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Structure de navigation, tranche d'âge et mega menu
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Nom de la catégorie *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ex: Jeux d'Éveil & Montessori"
                  required
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Slug URL / Identifiant
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="Ex: jeux-eveil-montessori"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* YoupiShop Specific Attributes: Tranche d'Âge & Icône Mascot */}
          <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Attributs YoupiShop (Âge, Icône & Thème Pastel)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Baby className="w-3.5 h-3.5 text-amber-600" />
                  <span>Tranche d'Âge Recommandée</span>
                </label>
                <select
                  value={ageRange}
                  onChange={(e) => setAgeRange(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {AGE_RANGES.map((ar) => (
                    <option key={ar} value={ar}>{ar}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-amber-600" />
                  <span>Couleur Pastel YoupiShop</span>
                </label>
                <div className="flex items-center gap-2">
                  {COLOR_THEMES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setColor(c.id)}
                      className={`w-7 h-7 rounded-xl ${c.bg} border-2 transition-all flex items-center justify-center text-xs ${
                        color === c.id ? `${c.border} scale-110 shadow-xs ring-2 ring-amber-500` : 'border-transparent'
                      }`}
                      title={c.name}
                    >
                      •
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Icône Jouet / Émoticône rapide
              </label>
              <div className="flex flex-wrap gap-2">
                {ICONS_PRESETS.map((ic) => (
                  <button
                    key={ic.icon}
                    type="button"
                    onClick={() => setIcon(ic.icon)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                      icon === ic.icon
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs scale-105'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-amber-50'
                    }`}
                  >
                    <span className="text-base">{ic.icon}</span>
                    <span className="text-[11px]">{ic.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Image d'illustration / Bannière (URL)
                </label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Slogan ou courte description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Favorise la motricité fine et l'autonomie"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Menu Type Selection (Exact copy of FitnessShop structure) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-amber-500" />
              <span>Type de Menu et Sous-catégories</span>
            </label>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'none', label: 'Aucun sous-menu', desc: 'Lien direct simple' },
                { id: 'simple', label: 'Liste Simple', desc: 'Menu déroulant classique' },
                { id: 'mega', label: 'Méga Menu', desc: 'Colonnes & groupes riches' }
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMenuType(m.id as any)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    menuType === m.id
                      ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-500 ring-2 ring-amber-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-amber-300'
                  }`}
                >
                  <p className={`text-xs font-black ${menuType === m.id ? 'text-amber-900 dark:text-amber-300' : 'text-slate-800 dark:text-slate-200'}`}>
                    {m.label}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Simple List Configuration */}
          {menuType === 'simple' && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Sous-catégories (une par ligne)
              </label>
              <textarea
                value={subCategories}
                onChange={(e) => setSubCategories(e.target.value)}
                rows={5}
                placeholder="Hochets & Doudous&#10;Tapis d'Éveil&#10;Puzzles Premier Âge&#10;Jouets en Bois"
                className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-[11px] text-slate-400">
                Chaque ligne deviendra un lien dans le menu déroulant de YoupiShop.
              </p>
            </div>
          )}

          {/* Mega Menu Configuration (Matching FitnessShop) */}
          {menuType === 'mega' && (
            <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Groupes du Méga Menu
                  </h4>
                  <p className="text-[11px] text-slate-500">Organisez vos colonnes d'articles par thème</p>
                </div>
                <button
                  type="button"
                  onClick={addMegaMenuGroup}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-amber-600 transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter un Groupe</span>
                </button>
              </div>

              {megaMenu.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  Aucun groupe dans ce méga menu. Cliquez sur "Ajouter un Groupe" pour commencer.
                </div>
              ) : (
                <div className="space-y-3">
                  {megaMenu.map((group, groupIdx) => (
                    <div
                      key={groupIdx}
                      className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={group.title}
                          onChange={(e) => handleMegaMenuGroupChange(groupIdx, e.target.value)}
                          placeholder="Titre de la colonne (ex: Briques de Construction)"
                          className="flex-1 px-3 py-1.5 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => addMegaMenuItem(groupIdx)}
                          className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3 text-amber-600" />
                          <span>Lien</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => removeMegaMenuGroup(groupIdx)}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Items */}
                      <div className="pl-4 space-y-1.5 border-l-2 border-amber-200 dark:border-amber-900">
                        {group.items.map((item, itemIdx) => (
                          <div key={itemIdx} className="flex items-center gap-2">
                            <span className="text-[10px] text-amber-500 font-bold">•</span>
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => handleMegaMenuItemChange(groupIdx, itemIdx, e.target.value)}
                              placeholder="Nom du lien"
                              className="flex-1 px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                            <button
                              type="button"
                              onClick={() => removeMegaMenuItem(groupIdx, itemIdx)}
                              className="p-1 text-slate-400 hover:text-red-500"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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
              {category ? 'Enregistrer les modifications' : 'Créer la catégorie'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
