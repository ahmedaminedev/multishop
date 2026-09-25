import React from 'react';
import { useStore } from '../../context/StoreContext';

export const StoreSwitcher: React.FC = () => {
  const { stores, currentStoreSlug, setCurrentStoreSlug, currentStore } = useStore();

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <label htmlFor="store-select" className="sr-only">Sélectionner la boutique</label>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm hover:border-slate-300 transition-colors">
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: currentStore ? currentStore.themeColor || '#10b981' : '#6366f1' }}
          />
          <select
            id="store-select"
            value={currentStoreSlug}
            onChange={(e) => setCurrentStoreSlug(e.target.value)}
            className="bg-transparent font-medium text-sm text-slate-800 focus:outline-none cursor-pointer pr-2"
          >
            <option value="all">🌐 Vue Globale (Toutes les 4 boutiques)</option>
            {stores.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name} ({s.slug})
              </option>
            ))}
          </select>
        </div>
      </div>

      {currentStoreSlug !== 'all' && (
        <a
          href={`/${currentStoreSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
          title="Ouvrir le frontend dans un nouvel onglet"
        >
          <span>Voir le site</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      )}
    </div>
  );
};
