import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { Search, SlidersHorizontal, Package } from 'lucide-react';

interface ProductGridSectionProps {
  products: Product[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onSelectProduct: (product: Product) => void;
  searchQuery: string;
}

export const ProductGridSection: React.FC<ProductGridSectionProps> = ({
  products,
  selectedCategory,
  onSelectCategory,
  onSelectProduct,
  searchQuery
}) => {
  const [selectedAge, setSelectedAge] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'populaire' | 'prix-asc' | 'prix-desc'>('populaire');

  const categories = [
    { id: 'all', label: 'Tous les jouets' },
    { id: 'Éveil & Bébé', label: 'Éveil & Bébé' },
    { id: 'Construction & Lego', label: 'Construction & Lego' },
    { id: 'Jeux de Société', label: 'Jeux de Société' },
    { id: 'Plein Air & Véhicules', label: 'Plein Air' },
    { id: 'Arts Créatifs', label: 'Arts Créatifs' }
  ];

  const ageFilters = [
    { id: 'all', label: 'Tous les âges' },
    { id: '0-3', label: '0 - 3 ans' },
    { id: '4-7', label: '4 - 7 ans' },
    { id: '8+', label: '8 ans et +' }
  ];

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;
        const matchSearch =
          !searchQuery ||
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase());

        let matchAge = true;
        if (selectedAge === '0-3') {
          matchAge = Boolean(p.trancheAge?.includes('mois') || p.trancheAge?.includes('1') || p.trancheAge?.includes('2') || p.trancheAge?.includes('naissance'));
        } else if (selectedAge === '4-7') {
          matchAge = Boolean(p.trancheAge?.includes('3') || p.trancheAge?.includes('4') || p.trancheAge?.includes('5') || p.trancheAge?.includes('6'));
        } else if (selectedAge === '8+') {
          matchAge = Boolean(p.trancheAge?.includes('6') || p.trancheAge?.includes('8') || p.trancheAge?.includes('10') || p.trancheAge?.includes('12'));
        }

        return matchCategory && matchSearch && matchAge;
      })
      .sort((a, b) => {
        if (sortBy === 'prix-asc') return a.price - b.price;
        if (sortBy === 'prix-desc') return b.price - a.price;
        return (b.rating || 5) - (a.rating || 5);
      });
  }, [products, selectedCategory, searchQuery, selectedAge, sortBy]);

  return (
    <section className="py-12 bg-[#fafbfc] dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-amber-500">
              CATALOGUE OFFICIEL
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-serif mt-0.5">
              Notre Sélection de Jouets
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {filteredProducts.length} référence{filteredProducts.length > 1 ? 's' : ''} disponible{filteredProducts.length > 1 ? 's' : ''}
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

        {/* Category Tabs (Segmented control) */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-200/60 dark:bg-slate-800/60 rounded-2xl overflow-x-auto no-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Age Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
          <span className="text-slate-400 font-bold uppercase text-[10px] mr-1">Âge :</span>
          {ageFilters.map((age) => (
            <button
              key={age.id}
              onClick={() => setSelectedAge(age.id)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedAge === age.id
                  ? 'bg-amber-500 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-amber-400'
              }`}
            >
              {age.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8">
            <Package className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="font-bold text-base text-slate-700 dark:text-slate-200">
              Aucun jouet ne correspond à votre recherche
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Essayez de réinitialiser vos filtres d'âge ou de catégorie pour découvrir tout le catalogue.
            </p>
            <button
              onClick={() => {
                onSelectCategory('all');
                setSelectedAge('all');
              }}
              className="mt-4 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              Voir tous les jouets
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
