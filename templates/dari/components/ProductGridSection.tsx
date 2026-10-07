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
  const [sortBy, setSortBy] = useState<'populaire' | 'prix-asc' | 'prix-desc'>('populaire');

  const categories = [
    { id: 'all', label: 'Toutes les collections' },
    { id: 'Mobilier & Salons', label: '🛋️ Mobilier & Salons' },
    { id: 'Luminaires & Éclairage', label: '💡 Luminaires & Éclairage' },
    { id: 'Décoration & Miroirs', label: '🪞 Décoration & Miroirs' },
    { id: 'Linge de Maison & Tapis', label: '🧶 Linge & Tapis' },
    { id: 'Art de la Table & Cuisine', label: '🍽️ Art de la Table' },
    { id: 'Rangement & Dressings', label: '🗄️ Rangement & Dressings' }
  ];

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        let matchCategory = true;
        if (selectedCategory && selectedCategory !== 'all') {
          matchCategory = Boolean(
            p.category?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
            p.parentCategory?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
            p.pieceMaison?.toLowerCase().includes(selectedCategory.toLowerCase())
          );
        }

        const matchSearch =
          !searchQuery ||
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.pieceMaison && p.pieceMaison.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchCategory && matchSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'prix-asc') return a.price - b.price;
        if (sortBy === 'prix-desc') return b.price - a.price;
        return (b.rating || 5) - (a.rating || 5);
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <section className="py-8 sm:py-12 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Filter Tabs Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {categories.map((c) => {
              const isSelected = selectedCategory === c.id || (selectedCategory === '' && c.id === 'all');
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSelectCategory(c.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0f3e37] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-[#f4efe8] hover:text-[#0f3e37]'
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-slate-400 font-semibold hidden sm:inline">Trier par :</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl px-3 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="populaire">Coups de Cœur</option>
              <option value="prix-asc">Prix croissant</option>
              <option value="prix-desc">Prix décroissant</option>
            </select>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-900 px-3 py-2 rounded-xl">
              {filteredProducts.length} articles
            </span>
          </div>

        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 pt-8">
            {filteredProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-3">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Aucun meuble ou article trouvé</h3>
            <p className="text-xs text-slate-500">Essayez de modifier vos filtres ou vos termes de recherche.</p>
            <button
              type="button"
              onClick={() => onSelectCategory('all')}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
