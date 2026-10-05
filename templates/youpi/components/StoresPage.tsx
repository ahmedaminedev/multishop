import React from 'react';
import { Store } from '../types';
import { MapPin, Phone, Clock, Navigation } from 'lucide-react';

interface StoresPageProps {
  stores: Store[];
}

export const StoresPage: React.FC<StoresPageProps> = ({ stores }) => {
  return (
    <div className="py-12 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-amber-500">
            NOS BOUTIQUES PHYSIQUES
          </span>
          <h1 className="text-3xl sm:text-4xl font-black font-serif text-slate-900 dark:text-white">
            Venez nous rendre visite en magasin
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Retrouvez tous nos univers de jouets, espaces démos et conseils personnalisés dans nos points de vente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {stores.map((store) => (
            <div
              key={store.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center text-2xl">
                  🧸
                </div>
                <div>
                  <h3 className="font-bold font-serif text-lg text-slate-900 dark:text-white">
                    {store.name}
                  </h3>
                  <span className="text-xs text-emerald-600 font-bold">Ouvert aujourd'hui</span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{store.address}</span>
                </p>
                <p className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{store.phone}</span>
                </p>
                <p className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{store.hours}</span>
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Obtenir l'itinéraire</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
