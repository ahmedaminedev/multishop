import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
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

    // Persistance locale
    useEffect(() => {
        const stored = localStorage.getItem('ironfuel_compare');
        if (stored) {
            try {
                setCompareList(JSON.parse(stored));
            } catch (e) {
                console.error("Error loading compare list", e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('ironfuel_compare', JSON.stringify(compareList));
    }, [compareList]);

    const addToCompare = useCallback((product: Product) => {
        setCompareList(prev => {
            // Déjà présent
            if (prev.find(p => p.id === product.id)) {
                addToast("Unité déjà présente dans l'analyse.", "info");
                return prev;
            }
            
            // Limite de 3
            if (prev.length >= 3) {
                addToast("Capacité maximale de l'analyse atteinte (3 unités).", "warning");
                return prev;
            }

            // Cohérence de catégorie (Benchmarking intelligent)
            if (prev.length > 0 && prev[0].category !== product.category) {
                addToast("Erreur de protocole : Comparez uniquement des produits de la même catégorie.", "error");
                return prev;
            }

            addToast("Unité ajoutée au dashboard VERSUS.", "success");
            return [...prev, product];
        });
    }, [addToast]);

    const removeFromCompare = useCallback((productId: number) => {
        setCompareList(prev => prev.filter(p => p.id !== productId));
    }, []);

    const clearCompare = useCallback(() => {
        setCompareList([]);
        addToast("Dashboard Versus réinitialisé.", "info");
    }, [addToast]);

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
