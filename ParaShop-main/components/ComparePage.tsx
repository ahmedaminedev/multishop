import React, { useMemo, useEffect } from 'react';
import { useCompare } from './CompareContext';
import { useCart } from './CartContext';
import { XMarkIcon, TrashIcon, CartIcon, ScaleIcon, CheckCircleIcon, InformationCircleIcon } from './IconComponents';
import { Breadcrumb } from './Breadcrumb';
import { useToast } from './ToastContext';

interface ComparePageProps {
    onNavigateHome: () => void;
}

export const ComparePage: React.FC<ComparePageProps> = ({ onNavigateHome }) => {
    const { compareList, removeFromCompare, clearCompare } = useCompare();
    const { addToCart, openCart } = useCart();
    const { addToast } = useToast();

    useEffect(() => {
        document.title = `VERSUS - Comparateur Performance IronFuel`;
        window.scrollTo(0,0);
    }, []);

    // Extraire toutes les clés de spécifications uniques présentes dans les produits sélectionnés
    const allSpecNames = useMemo(() => {
        const names = new Set<string>();
        compareList.forEach(product => {
            product.specifications?.forEach(spec => names.add(spec.name));
        });
        return Array.from(names).sort();
    }, [compareList]);

    const handleAdd = (product: any) => {
        if (product.quantity === 0) return;
        addToCart(product);
        addToast(`${product.name} ajouté au set`, "success");
        openCart();
    };

    if (compareList.length === 0) {
        return (
            <div className="bg-white dark:bg-brand-black min-h-screen flex items-center justify-center p-6 font-sans transition-colors duration-300">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-brand-gray border border-gray-200 dark:border-gray-800 flex items-center justify-center mx-auto mb-6 text-gray-400 dark:text-gray-600 slant">
                        <ScaleIcon className="w-10 h-10 slant-reverse" />
                    </div>
                    <h2 className="text-3xl font-serif font-black italic text-gray-900 dark:text-white uppercase mb-4 tracking-tighter">Analyse inactive</h2>
                    <p className="text-gray-500 dark:text-gray-400 font-mono text-xs uppercase tracking-widest mb-8 leading-relaxed">
                        Sélectionnez des unités dans le catalogue pour lancer le benchmarking technique.
                    </p>
                    <button onClick={onNavigateHome} className="w-full bg-black dark:bg-brand-neon text-white dark:text-black font-black uppercase tracking-[0.2em] text-xs py-4 slant hover:bg-brand-neon hover:text-black transition-all">
                        <span className="slant-reverse block">Explorer l'armurerie</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-brand-black min-h-screen pb-32 font-sans transition-colors duration-300">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                <div className="mb-8">
                    <Breadcrumb items={[{ name: 'Accueil', onClick: onNavigateHome }, { name: 'Comparateur Versus' }]} />
                </div>

                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div>
                        <h1 className="text-5xl md:text-7xl font-serif font-black italic text-gray-900 dark:text-white uppercase tracking-tighter leading-none">
                            TECH <span className="text-brand-neon">VERSUS</span>
                        </h1>
                        <p className="mt-4 text-gray-500 dark:text-gray-400 font-mono text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
                            <div className="w-2 h-2 bg-brand-neon rounded-full animate-pulse"></div>
                            Analyse comparative des biomarqueurs actifs
                        </p>
                    </div>
                    <button 
                        onClick={clearCompare} 
                        className="text-gray-400 hover:text-brand-alert transition-all font-black uppercase text-[10px] tracking-widest border border-gray-100 dark:border-gray-800 px-6 py-3 bg-gray-50 dark:bg-brand-dark slant"
                    >
                        <span className="slant-reverse block flex items-center gap-2"><TrashIcon className="w-4 h-4" /> Vider la sélection</span>
                    </button>
                </header>

                {/* --- GRILLE DE COMPARAISON EFFICACE --- */}
                <div className="overflow-x-auto rounded-sm border border-gray-100 dark:border-gray-800 shadow-2xl">
                    <table className="w-full border-collapse bg-white dark:bg-brand-dark">
                        <thead>
                            <tr>
                                {/* Colonne Libellés (Vide en haut) */}
                                <th className="p-6 w-64 bg-gray-50 dark:bg-black border-b border-gray-100 dark:border-gray-800"></th>
                                
                                {/* En-têtes Produits */}
                                {compareList.map((product) => (
                                    <th key={product.id} className="p-8 border-b border-l border-gray-100 dark:border-gray-800 min-w-[300px] relative group bg-white dark:bg-brand-dark">
                                        <button 
                                            onClick={() => removeFromCompare(product.id)}
                                            className="absolute top-4 right-4 p-2 text-gray-300 hover:text-brand-alert transition-colors"
                                            title="Retirer"
                                        >
                                            <XMarkIcon className="w-5 h-5" />
                                        </button>
                                        
                                        <div className="flex flex-col items-center">
                                            <div className="w-32 h-32 mb-6 bg-gray-50 dark:bg-black p-4 flex items-center justify-center border border-gray-100 dark:border-gray-800">
                                                <img src={product.imageUrl} alt={product.name} className="max-h-full max-w-full object-contain filter drop-shadow-md" />
                                            </div>
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 font-mono">{product.brand}</span>
                                            <h3 className="font-serif font-black italic text-lg text-gray-900 dark:text-white uppercase leading-tight text-center mb-4 line-clamp-2 h-12">
                                                {product.name}
                                            </h3>
                                            <div className="text-2xl font-black text-gray-900 dark:text-white font-mono tracking-tighter">
                                                {product.price.toFixed(3)} <span className="text-[10px] text-brand-neon">TND</span>
                                            </div>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        
                        <tbody className="text-sm">
                            {/* Rangée: Disponibilité */}
                            <tr className="hover:bg-gray-50 dark:hover:bg-black/20 transition-colors">
                                <td className="p-6 font-black text-[10px] uppercase tracking-widest text-gray-400 bg-gray-50 dark:bg-black border-b border-gray-100 dark:border-gray-800">
                                    Disponibilité
                                </td>
                                {compareList.map(p => (
                                    <td key={p.id} className="p-6 text-center border-b border-l border-gray-100 dark:border-gray-800">
                                        {p.quantity > 0 ? (
                                            <span className="text-green-600 dark:text-brand-neon font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                                                <CheckCircleIcon className="w-4 h-4" /> En Stock
                                            </span>
                                        ) : (
                                            <span className="text-brand-alert font-black text-[10px] uppercase tracking-widest opacity-60">Épuisé</span>
                                        )}
                                    </td>
                                ))}
                            </tr>

                            {/* Dynamique: Spécifications Techniques */}
                            {allSpecNames.map((specName) => (
                                <tr key={specName} className="hover:bg-gray-50 dark:hover:bg-black/20 transition-colors">
                                    <td className="p-6 font-black text-[10px] uppercase tracking-widest text-gray-400 bg-gray-50 dark:bg-black border-b border-gray-100 dark:border-gray-800">
                                        {specName}
                                    </td>
                                    {compareList.map(product => {
                                        const spec = product.specifications?.find(s => s.name === specName);
                                        return (
                                            <td key={product.id} className="p-6 text-center border-b border-l border-gray-100 dark:border-gray-800 font-mono font-bold text-gray-700 dark:text-gray-300">
                                                {spec ? spec.value : '---'}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}

                            {/* Rangée: Description Courte */}
                            <tr>
                                <td className="p-6 font-black text-[10px] uppercase tracking-widest text-gray-400 bg-gray-50 dark:bg-black border-b border-gray-100 dark:border-gray-800">
                                    Briefing
                                </td>
                                {compareList.map(p => (
                                    <td key={p.id} className="p-6 border-b border-l border-gray-100 dark:border-gray-800">
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed italic text-center">
                                            {p.description ? p.description.substring(0, 100) + '...' : 'Aucun briefing technique disponible.'}
                                        </p>
                                    </td>
                                ))}
                            </tr>

                            {/* Rangée: Actions Finales */}
                            <tr className="bg-gray-50/30 dark:bg-black/40">
                                <td className="p-6 bg-gray-50 dark:bg-black border-gray-100 dark:border-gray-800"></td>
                                {compareList.map(product => (
                                    <td key={product.id} className="p-8 border-l border-gray-100 dark:border-gray-800">
                                        <button 
                                            onClick={() => handleAdd(product)}
                                            disabled={product.quantity === 0}
                                            className="w-full bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.2em] text-[10px] py-5 slant hover:bg-brand-neon hover:text-black dark:hover:bg-brand-neon transition-all shadow-xl disabled:opacity-30 group"
                                        >
                                            <span className="slant-reverse block flex items-center justify-center gap-2">
                                                {product.quantity === 0 ? 'RUPTURE' : 'DÉPLOYER AU SET'}
                                                {product.quantity > 0 && <CartIcon className="w-4 h-4 transition-transform group-hover:rotate-12" />}
                                            </span>
                                        </button>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Section d'information complémentaire */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="p-10 bg-gray-50 dark:bg-brand-gray border border-gray-100 dark:border-gray-800 slant">
                        <div className="slant-reverse flex items-start gap-6">
                            <div className="w-12 h-12 flex-shrink-0 bg-brand-neon text-black flex items-center justify-center rounded-none shadow-[0_0_15px_#ccff00]">
                                <InformationCircleIcon className="w-7 h-7" />
                            </div>
                            <div>
                                <h4 className="text-xl font-serif font-black italic uppercase text-gray-900 dark:text-white mb-2">Aide à la décision</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono leading-relaxed uppercase tracking-wider">
                                    IronFuel compare les données analytiques certifiées. Priorisez toujours la valeur nutritionnelle (Protéines/dose) par rapport au prix brut pour un impact métabolique maximal.
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-center md:justify-end gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 border-2 border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-300">
                                <CheckCircleIcon className="w-8 h-8" />
                            </div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Qualité Labo</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 border-2 border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-300">
                                <CartIcon className="w-8 h-8" />
                            </div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Logistique 48h</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
