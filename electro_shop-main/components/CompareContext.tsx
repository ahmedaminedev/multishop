
import React, { createContext, useState, useContext, useCallback } from 'react';
import type { Product } from '../types';
import { useToast } from './ToastContext';

interface CompareContextType {
    compareList: Product[];
    addToCompare: (product: Product) => void;
    removeFromCompare: (productId: number) => void;
    clearCompare: () => void;
    isComparing: (productId: number) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [compareList, setCompareList] = useState<Product[]>([]);
    const { addToast } = useToast();

    const addToCompare = useCallback((product: Product) => {
        setCompareList(prev => {
            if (prev.find(p => p.id === product.id)) {
                addToast("Ce produit est déjà dans le comparateur", "info");
                return prev;
            }
            if (prev.length >= 3) {
                addToast("Vous ne pouvez comparer que 3 produits à la fois", "error");
                return prev;
            }
            if (prev.length > 0 && prev[0].category !== product.category) {
                addToast("Vous ne pouvez comparer que des produits de la même catégorie", "error");
                return prev;
            }
            addToast("Produit ajouté au comparateur", "success");
            return [...prev, product];
        });
    }, [addToast]);

    const removeFromCompare = useCallback((productId: number) => {
        setCompareList(prev => prev.filter(p => p.id !== productId));
    }, []);

    const clearCompare = useCallback(() => {
        setCompareList([]);
    }, []);

    const isComparing = useCallback((productId: number) => {
        return compareList.some(p => p.id === productId);
    }, [compareList]);

    return (
        <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, clearCompare, isComparing }}>
            {children}
        </CompareContext.Provider>
    );
};

export const useCompare = (): CompareContextType => {
    const context = useContext(CompareContext);
    if (context === undefined) {
        throw new Error('useCompare must be used within a CompareProvider');
    }
    return context;
};
