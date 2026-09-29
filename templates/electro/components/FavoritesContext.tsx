import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

interface FavoritesContextType {
    favoriteIds: number[];
    toggleFavorite: (productId: number) => void;
    isFavorite: (productId: number) => boolean;
    favoritesCount: number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [favoriteIds, setFavoriteIds] = useState<number[]>(() => {
        // Retrieve from localStorage on initial load
        try {
            const item = window.localStorage.getItem('favoriteProducts');
            return item ? JSON.parse(item) : [];
        } catch (error) {
            console.error(error);
            return [];
        }
    });
    
    const toggleFavorite = useCallback((productId: number) => {
        setFavoriteIds(prev => {
            const isFav = prev.includes(productId);
            const newFavorites = isFav ? prev.filter(id => id !== productId) : [...prev, productId];
            // Persist to localStorage
            window.localStorage.setItem('favoriteProducts', JSON.stringify(newFavorites));
            return newFavorites;
        });
    }, []);

    const isFavorite = useCallback((productId: number) => {
        return favoriteIds.includes(productId);
    }, [favoriteIds]);

    const value = {
        favoriteIds,
        toggleFavorite,
        isFavorite,
        favoritesCount: favoriteIds.length,
    };

    return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};

export const useFavorites = (): FavoritesContextType => {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
};
