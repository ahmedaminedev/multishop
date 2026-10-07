import React, { createContext, useContext, useState } from 'react';
import { Product } from '../types';

interface CompareContextType {
  compareItems: Product[];
  toggleCompare: (product: Product) => void;
  isInCompare: (productId: number) => boolean;
  clearCompare: () => void;
}

const CompareContext = createContext<CompareContextType>({
  compareItems: [],
  toggleCompare: () => {},
  isInCompare: () => false,
  clearCompare: () => {},
});

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [compareItems, setCompareItems] = useState<Product[]>([]);

  const toggleCompare = (product: Product) => {
    setCompareItems(prev => {
      if (prev.some(p => p.id === product.id)) {
        return prev.filter(p => p.id !== product.id);
      }
      if (prev.length >= 4) {
        return [...prev.slice(1), product];
      }
      return [...prev, product];
    });
  };

  const isInCompare = (productId: number) => compareItems.some(p => p.id === productId);
  const clearCompare = () => setCompareItems([]);

  return (
    <CompareContext.Provider value={{ compareItems, toggleCompare, isInCompare, clearCompare }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => useContext(CompareContext);
