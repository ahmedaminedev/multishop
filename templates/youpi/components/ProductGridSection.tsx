import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { Search, SlidersHorizontal, Package, Sparkles } from 'lucide-react';

interface ProductGridSectionProps {
  products: Product[];
  selectedCategory: string;
  onSelectCategory?: (cat: string) => void;
  onSelectProduct?: (product: Product) => void;
  searchQuery?: string;
}

export const ProductGridSection: React.FC<ProductGridSectionProps> = ({
  products,
  selectedCategory,
  onSelectCategory = () => {},
  onSelectProduct = () => {},
  searchQuery = ''
}) => {
  const [selectedAge, setSelectedAge] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'populaire' | 'prix-asc' | 'prix-desc'>('populaire');

  const categories = [
    { id: 'all', label: 'Tous les jouets' },
    { id: '0-3', label: '👶 0-3 ans' },
    { id: '3-6', label: '🧸 3-6 ans' },
    { id: '6-12', label: '🎮 6-12 ans' },
    { id: 'Jeux de société', label: '🎲 Jeux de société' },
    { id: 'Puzzles', label: '🧩 Puzzles' },
    { id: 'Éducatifs', label: '💡 Éducatifs' },
    { id: 'Extérieurs', label: '🚲 Extérieurs' },
    { id: 'Marques', label: '🏷️ Marques' }
  ];

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Matching category / age / brand
        let matchCategory = true;
        if (selectedCategory && selectedCategory !== 'all') {
          if (selectedCategory === '0-3') {
            matchCategory = Boolean(
              p.category?.toLowerCase().includes('éveil') ||
              p.category?.toLowerCase().includes('bébé') ||
              p.trancheAge?.includes('0') ||
              p.trancheAge?.includes('1') ||
              p.trancheAge?.includes('2') ||
              p.trancheAge?.includes('3') ||
              p.trancheAge?.includes('mois')
            );
          } else if (selectedCategory === '3-6') {
            matchCategory = Boolean(
              p.trancheAge?.includes('3') ||
              p.trancheAge?.includes('4') ||
              p.trancheAge?.includes('5') ||
              p.trancheAge?.includes('6') ||
              p.category?.toLowerCase().includes('lego') ||
              p.category?.toLowerCase().includes('construction')
            );
          } else if (selectedCategory === '6-12') {
            matchCategory = Boolean(
              p.trancheAge?.includes('6') ||
              p.trancheAge?.includes('7') ||
              p.trancheAge?.includes('8') ||
              p.trancheAge?.includes('10') ||
              p.trancheAge?.includes('12') ||
              p.category?.toLowerCase().includes('société')
            );
          } else if (selectedCategory === 'Jeux de société') {
            matchCategory = Boolean(p.category?.toLowerCase().includes('société') || p.parentCategory?.toLowerCase().includes('société'));
          } else if (selectedCategory === 'Puzzles') {
            matchCategory = Boolean(p.category?.toLowerCase().includes('puzzle') || p.name?.toLowerCase().includes('puzzle') || p.description?.toLowerCase().includes('puzzle'));
          } else if (selectedCategory === 'Éducatifs') {
            matchCategory = Boolean(p.category?.toLowerCase().includes('éveil') || p.category?.toLowerCase().includes('éducatif') || p.description?.toLowerCase().includes('montessori'));
          } else if (selectedCategory === 'Extérieurs') {
            matchCategory = Boolean(p.category?.toLowerCase().includes('plein air') || p.category?.toLowerCase().includes('véhicule') || p.name?.toLowerCase().includes('draisienne') || p.name?.toLowerCase().includes('trottinette'));
          } else if (selectedCategory === 'Marques') {
            matchCategory = Boolean(p.brand && ['Lego', 'Janod', 'Djeco', 'Barbie', 'Playmobil', 'Fisher-Price', 'Chicco'].includes(p.brand));
          } else {
            matchCategory = Boolean(
              p.category?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
              p.parentCategory?.toLowerCase().includes(selectedCategory.toLowerCase())
            );
          }
        }

        const matchSearch =
          !searchQuery ||
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase());

        return matchCategory && matchSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'prix-asc') return a.price - b.price;
        if (sortBy === 'prix-desc') return b.price - a.price;
        return (b.rating || 5) - (a.rating || 5);
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <section className="py-10 sm:py-12 bg-[#fafbfc] dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-500">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>CATALOGUE OFFICIEL YOUPISHOP</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-serif mt-0.5">
              Notre Sélection de Jouets
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {filteredProducts.length} référence{filteredProducts.length > 1 ? 's' : ''} disponible{filteredProducts.length > 1 ? 's' : ''}
              {selectedCategory !== 'all' && (
                <span className="ml-2 font-bold text-amber-600">
                  • Filtre : {categories.find(c => c.id === selectedCategory)?.label || selectedCategory}
                </span>
              )}
            </p>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Trier par :</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-2xs"
            >
              <option value="populaire">⭐ Plus populaires & avis</option>
              <option value="prix-asc">Prix : Moins cher au plus cher</option>
              <option value="prix-desc">Prix : Plus cher au moins cher</option>
            </select>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                  isSelected
                    ? 'bg-[#facc15] text-slate-950 shadow-md ring-2 ring-amber-400/40 scale-105'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-700/60 border border-slate-200/80 dark:border-slate-700'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-2">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-500 mx-auto flex items-center justify-center text-3xl">
              🧸
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              Aucun jouet trouvé pour cette recherche
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Essayez de réinitialiser le filtre de catégorie ou de taper un mot-clé plus général (ex: Lego, bois, puzzle, société).
            </p>
            <button
              onClick={() => onSelectCategory('all')}
              className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              Voir tous les jouets
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
