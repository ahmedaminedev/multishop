import React from 'react';
import { Pack } from '../types';
import { ShoppingBag, Check, Sparkles } from 'lucide-react';
import { useCart } from './CartContext';
import { useToast } from './ToastContext';

interface PacksPageProps {
  packs: Pack[];
}

export const PacksPage: React.FC<PacksPageProps> = ({ packs }) => {
  const { addToCart, setIsCartOpen } = useCart();
  const { addToast } = useToast();

  const handleAddPack = (pack: Pack) => {
    // Treat pack as cart item
    addToCart({
      id: pack.id,
      name: pack.name || pack.title || 'Pack Pièce Complète',
      brand: 'Maison Dari',
      price: pack.price,
      oldPrice: pack.originalPrice || pack.oldPrice,
      imageUrl: pack.imageUrl,
      category: 'Packs Pièces & Salons',
      quantity: 10
    }, 1);
    addToast(`Pack "${pack.name || pack.title}" ajouté au panier ! ✨`, 'success');
    setIsCartOpen(true);
  };

  return (
    <div className="py-12 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            HARMONIE & GAIN DE TEMPS
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-serif">
            Nos Packs Pièces & Salons Clé en Main
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Des ensembles pensés par nos architectes d'intérieur pour créer une ambiance harmonieuse tout en profitant d'une remise exclusive sur le lot.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {packs.map((pack) => (
            <div
              key={pack.id}
              className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md flex flex-col md:flex-row"
            >
              <div className="md:w-1/2 relative min-h-[260px]">
                <img
                  src={pack.imageUrl}
                  alt={pack.name}
                  className="w-full h-full object-cover"
                />
                {pack.discount && (
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-black text-xs shadow-md">
                    -{pack.discount}% sur le pack
                  </span>
                )}
              </div>

              <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white font-serif">
                    {pack.name || pack.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {pack.description}
                  </p>

                  {pack.includedItems && (
                    <div className="mt-4 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Ce pack comprend :</span>
                      {pack.includedItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {pack.price.toLocaleString('fr-FR')} <span className="text-xs font-bold text-indigo-600">DT</span>
                    </span>
                    {(pack.originalPrice || pack.oldPrice) && (
                      <span className="text-xs text-slate-400 line-through block">
                        {(pack.originalPrice || pack.oldPrice)} DT
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddPack(pack)}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Choisir ce pack</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
