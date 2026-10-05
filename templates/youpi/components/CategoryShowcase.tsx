import React from 'react';
import { ArrowRight } from 'lucide-react';
import eveilImg from '../../../src/assets/images/category_youpi_eveil_1791240046354.jpg';
import legoImg from '../../../src/assets/images/category_youpi_lego_1791240056376.jpg';
import societeImg from '../../../src/assets/images/category_youpi_societe_1791240065789.jpg';
import heroImg from '../../../src/assets/images/hero_youpishop_toys_1791240036994.jpg';

interface CategoryShowcaseProps {
  onSelectCategory: (categoryName: string) => void;
  selectedCategory: string;
}

export const CategoryShowcase: React.FC<CategoryShowcaseProps> = ({
  onSelectCategory,
  selectedCategory
}) => {
  const categories = [
    {
      id: 'eveil',
      name: 'Éveil & Bébé',
      age: '0 à 3 ans',
      description: 'Montessori, hochets, cubes sensoriels & doudous bio',
      image: eveilImg,
      color: 'from-amber-500/80 to-orange-600/90'
    },
    {
      id: 'construction',
      name: 'Construction & Lego',
      age: '4 à 12 ans',
      description: 'Briques créatives, maquettes, stations & fusées',
      image: legoImg,
      color: 'from-blue-600/80 to-indigo-700/90'
    },
    {
      id: 'societe',
      name: 'Jeux de Société',
      age: 'Dès 5 ans',
      description: 'Stratégie, coopération, cartes & ambiance familiale',
      image: societeImg,
      color: 'from-emerald-600/80 to-teal-700/90'
    },
    {
      id: 'plein-air',
      name: 'Plein Air & Véhicules',
      age: '3 à 10 ans',
      description: 'Trottinettes LED, circuits de course, draisiennes',
      image: heroImg,
      color: 'from-rose-500/80 to-purple-600/90'
    }
  ];

  return (
    <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-500 text-xs font-black uppercase tracking-wider">
              <span>EXPLORER PAR UNIVERS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-serif mt-1">
              Les Univers Coup de Cœur
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
            Choisissez l'univers adapté aux passions et à l'âge de votre enfant.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(isSelected ? 'all' : cat.name)}
                className={`group relative rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 border-2 ${
                  isSelected
                    ? 'border-amber-500 ring-4 ring-amber-500/20 scale-[1.02]'
                    : 'border-transparent hover:-translate-y-1'
                }`}
              >
                {/* Background Image */}
                <div className="h-64 sm:h-72 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                  />
                </div>

                {/* Gradient Scrim & Info */}
                <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} p-5 flex flex-col justify-end text-white transition-opacity`}>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs w-max mb-1">
                    {cat.age}
                  </span>
                  <h3 className="text-lg font-black font-serif leading-tight">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-white/90 font-medium line-clamp-2 mt-1">
                    {cat.description}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-200 mt-3 group-hover:translate-x-1 transition-transform">
                    <span>Explorer l'univers</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
