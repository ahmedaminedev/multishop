
import React, { useMemo } from 'react';
import { useCompare } from './CompareContext';
import { useCart } from './CartContext';
import { XMarkIcon, TrashIcon, CartIcon } from './IconComponents';
import { Breadcrumb } from './Breadcrumb';

interface ComparePageProps {
    onNavigateHome: () => void;
}

export const ComparePage: React.FC<ComparePageProps> = ({ onNavigateHome }) => {
    const { compareList, removeFromCompare, clearCompare } = useCompare();
    const { addToCart, openCart } = useCart();

    // Extract all unique specification keys
    const allSpecKeys = useMemo(() => {
        const keys = new Set<string>();
        compareList.forEach(product => {
            product.specifications?.forEach(spec => keys.add(spec.name));
        });
        return Array.from(keys);
    }, [compareList]);

    const handleAddToCart = (product: import('../types').Product) => {
        addToCart(product);
        openCart();
    }

    if (compareList.length === 0) {
        return (
            <div className="max-w-screen-2xl mx-auto px-4 py-12 text-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Votre comparateur est vide.</h2>
                <p className="mt-2 text-gray-500">Ajoutez des produits pour les comparer.</p>
                <button onClick={onNavigateHome} className="mt-6 bg-red-600 text-white font-bold py-2 px-6 rounded-full hover:bg-red-700 transition-colors">
                    Retour à l'accueil
                </button>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 dark:bg-gray-950 min-h-screen pb-12">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Breadcrumb items={[{ name: 'Accueil', onClick: onNavigateHome }, { name: 'Comparateur' }]} />
                
                <div className="flex justify-between items-center mt-6 mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Comparer les produits</h1>
                    <button onClick={clearCompare} className="flex items-center gap-2 text-red-600 hover:text-red-800 font-semibold">
                        <TrashIcon className="w-5 h-5" /> Tout effacer
                    </button>
                </div>

                <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <table className="w-full min-w-[800px] table-fixed border-collapse">
                        <thead>
                            <tr>
                                <th className="w-48 p-4 bg-gray-50 dark:bg-gray-900 border-b border-r dark:border-gray-700 text-left font-bold text-gray-700 dark:text-gray-300">Caractéristiques</th>
                                {compareList.map(product => (
                                    <th key={product.id} className="w-64 p-4 border-b border-r dark:border-gray-700 relative bg-white dark:bg-gray-800 align-top">
                                        <button onClick={() => removeFromCompare(product.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1">
                                            <XMarkIcon className="w-5 h-5" />
                                        </button>
                                        <div className="flex flex-col items-center text-center">
                                            <img src={product.imageUrl} alt={product.name} className="h-32 w-32 object-contain mb-4" />
                                            <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2 h-10 mb-2">{product.name}</h3>
                                            <p className="text-red-600 font-extrabold text-lg mb-3">{product.price.toFixed(3)} DT</p>
                                            <button 
                                                onClick={() => handleAddToCart(product)}
                                                disabled={product.quantity === 0}
                                                className="w-full bg-red-600 text-white py-2 px-4 rounded-md flex items-center justify-center gap-2 hover:bg-red-700 text-sm font-semibold disabled:bg-gray-400"
                                            >
                                                <CartIcon className="w-4 h-4" />
                                                {product.quantity === 0 ? 'Épuisé' : 'Ajouter'}
                                            </button>
                                        </div>
                                    </th>
                                ))}
                                {/* Fill empty columns if less than 3 products */}
                                {[...Array(3 - compareList.length)].map((_, i) => (
                                    <th key={`empty-${i}`} className="w-64 bg-gray-50/50 dark:bg-gray-900/50 border-b border-r dark:border-gray-700"></th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {/* Basic Info Rows */}
                            <tr>
                                <td className="p-4 font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 border-r dark:border-gray-700">Marque</td>
                                {compareList.map(product => (
                                    <td key={product.id} className="p-4 text-center text-gray-600 dark:text-gray-400 border-r dark:border-gray-700 font-medium">{product.brand}</td>
                                ))}
                                {[...Array(3 - compareList.length)].map((_, i) => <td key={`e-${i}`} className="border-r dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50"></td>)}
                            </tr>
                            <tr>
                                <td className="p-4 font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 border-r dark:border-gray-700">Disponibilité</td>
                                {compareList.map(product => (
                                    <td key={product.id} className="p-4 text-center border-r dark:border-gray-700">
                                        {product.quantity > 0 ? (
                                            <span className="text-green-600 font-semibold bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded text-xs">En Stock</span>
                                        ) : (
                                            <span className="text-red-600 font-semibold bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded text-xs">Épuisé</span>
                                        )}
                                    </td>
                                ))}
                                {[...Array(3 - compareList.length)].map((_, i) => <td key={`e-${i}`} className="border-r dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50"></td>)}
                            </tr>

                            {/* Dynamic Specs Rows */}
                            {allSpecKeys.map(specKey => (
                                <tr key={specKey}>
                                    <td className="p-4 font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 border-r dark:border-gray-700">{specKey}</td>
                                    {compareList.map(product => {
                                        const specValue = product.specifications?.find(s => s.name === specKey)?.value || '-';
                                        return (
                                            <td key={product.id} className="p-4 text-center text-gray-600 dark:text-gray-400 border-r dark:border-gray-700 text-sm">
                                                {specValue}
                                            </td>
                                        );
                                    })}
                                    {[...Array(3 - compareList.length)].map((_, i) => <td key={`e-${i}`} className="border-r dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50"></td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
