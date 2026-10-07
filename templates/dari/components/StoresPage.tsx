import React from 'react';
import { Store } from '../types';
import { MapPin, Phone, Clock, Compass } from 'lucide-react';

interface StoresPageProps {
  stores: Store[];
}

export const StoresPage: React.FC<StoresPageProps> = ({ stores }) => {
  return (
    <div className="py-12 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            EXPERIENCE IMMERSIVE
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-serif">
            Nos Showrooms DariShop en Tunisie
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Venez toucher les tissus, essayer le confort de nos assises et échanger avec nos décorateurs d'intérieur dans nos espaces d'exposition.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stores.map((s) => (
            <div
              key={s.id}
              className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md flex flex-col"
            >
              <div className="h-56 relative overflow-hidden">
                <img
                  src={s.image || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=600'}
                  alt={s.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider">
                  {s.city}
                </span>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white font-serif">
                    {s.name}
                  </h3>

                  <div className="mt-4 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <span>{s.address}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span className="font-bold">{s.phone}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>{s.hours}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <span className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center gap-1.5">
                    <Compass className="w-3.5 h-3.5" />
                    <span>Parking & Accès Décoration</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
