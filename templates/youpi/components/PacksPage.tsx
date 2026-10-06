import React from 'react';
import { Pack } from '../types';
import { useCart } from './CartContext';
import { ShoppingBag, Sparkles, Check, Gift } from 'lucide-react';

interface PacksPageProps {
  packs: Pack[];
}

export const PacksPage: React.FC<PacksPageProps> = ({ packs }) => {
  const { addToCart } = useCart();

  return (
    <div className="py-12 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-amber-500">
            OFFRES GROUPÉES & CADEAUX
          </span>
          <h1 className="text-3xl sm:text-4xl font-black font-serif text-slate-900 dark:text-white">
            Coffrets & Packs Économiques
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Des ensembles de jouets soigneusement assortis par nos éducateurs pour les anniversaires et les fêtes, avec des réductions immédiates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {packs.map((pack) => (
            <div
              key={pack.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-md hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-64 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800 mb-6 flex items-center justify-center p-4">
                  <img
                    src={pack.imageUrl}
                    alt={pack.title}
                    className="max-h-full max-w-full object-contain"
                  />
                  <span className="absolute top-4 right-4 px-3 py-1 rounded-xl bg-rose-500 text-white font-black text-xs">
                    -{pack.discount}%
                  </span>
                </div>

                <div className="space-y-3">
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    Pack Avantage
                  </span>
                  <h3 className="text-xl font-black font-serif text-slate-900 dark:text-white">
                    {pack.name || pack.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {pack.description}
                  </p>

                  {/* Included items */}
                  <div className="pt-2">
                    <p className="text-[11px] font-bold uppercase text-slate-400 mb-1.5">
                      Articles inclus dans ce coffret :
                    </p>
                    <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                      {pack.products && pack.products.length > 0 ? (
                        pack.products.map((prod, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>{prod.name} ({prod.price} DT)</span>
                          </li>
                        ))
                      ) : pack.includedItems && pack.includedItems.length > 0 ? (
                        pack.includedItems.map((item, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))
                      ) : (
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>Assortiment complet de jouets YoupiShop</span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                    {pack.price} DT
                  </span>
                  {(pack.oldPrice || pack.originalPrice) && (
                    <span className="text-xs text-slate-400 line-through ml-2 tabular-nums">
                      {pack.oldPrice || pack.originalPrice} DT
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (pack.products && pack.products.length > 0) {
                      pack.products.forEach(p => addToCart(p, 1));
                    } else {
                      addToCart({
                        id: pack.id,
                        name: pack.name || pack.title,
                        price: pack.price,
                        imageUrl: pack.imageUrl,
                        category: 'Packs & Coffrets'
                      } as any, 1);
                    }
                  }}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Commander le Pack</span>
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
