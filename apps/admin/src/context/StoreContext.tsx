import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface Store {
  id: string;
  slug: string;
  name: string;
  subtitle?: string;
  themeColor?: string;
  secondaryColor?: string;
  path?: string;
  description?: string;
  currency?: string;
  active?: boolean;
  fbPixelId?: string;
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
  };
}

interface StoreContextType {
  stores: Store[];
  currentStoreSlug: string;
  currentStore: Store | null;
  setCurrentStoreSlug: (slug: string) => void;
  apiFetch: (endpoint: string, options?: RequestInit, storeOverride?: string) => Promise<any>;
  refreshStores: () => Promise<void>;
  loading: boolean;
  isStoreAdmin: boolean;
}

const defaultStores: Store[] = [
  { id: 'parashop', slug: 'parashop', name: 'PharmaNature', themeColor: '#008b5e', path: '/parashop', currency: 'TND' },
  { id: 'nutritionshop', slug: 'nutritionshop', name: 'IronFuel Nutrition', themeColor: '#ccff00', path: '/nutritionshop', currency: 'TND' },
  { id: 'cosmeticshop', slug: 'cosmeticshop', name: 'Cosmetics Shop', themeColor: '#e11d48', path: '/cosmeticshop', currency: 'TND' },
  { id: 'electroshop', slug: 'electroshop', name: 'Electro Shop', themeColor: '#ef4444', path: '/electroshop', currency: 'TND' },
];

const StoreContext = createContext<StoreContextType>({
  stores: defaultStores,
  currentStoreSlug: 'all',
  currentStore: null,
  setCurrentStoreSlug: () => {},
  apiFetch: async () => ({}),
  refreshStores: async () => {},
  loading: false,
  isStoreAdmin: false,
});

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, apiFetch: authFetch } = useAuth();
  const [stores, setStores] = useState<Store[]>(defaultStores);
  const [currentStoreSlug, setCurrentStoreSlugState] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(false);

  const isStoreAdmin = user?.role === 'STORE_ADMIN';

  // Automatically lock store admin to their assigned store
  useEffect(() => {
    if (user?.role === 'STORE_ADMIN' && user.storeSlug) {
      setCurrentStoreSlugState(user.storeSlug);
    }
  }, [user]);

  const setCurrentStoreSlug = (slug: string) => {
    if (isStoreAdmin && user?.storeSlug && slug !== user.storeSlug) {
      alert(`Accès limité : vous êtes administrateur de la boutique ${user.storeSlug}.`);
      return;
    }
    setCurrentStoreSlugState(slug);
  };

  const refreshStores = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/stores');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setStores(data);
        }
      }
    } catch (e) {
      console.warn('Could not fetch stores, using defaults:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStores();
  }, []);

  const currentStore = currentStoreSlug === 'all'
    ? null
    : stores.find(s => s.slug === currentStoreSlug) || null;

  const apiFetch = async (endpoint: string, options: RequestInit = {}, storeOverride?: string) => {
    const targetStore = storeOverride !== undefined ? storeOverride : currentStoreSlug;
    return authFetch(endpoint, options, targetStore);
  };

  return (
    <StoreContext.Provider
      value={{
        stores,
        currentStoreSlug,
        currentStore,
        setCurrentStoreSlug,
        apiFetch,
        refreshStores,
        loading,
        isStoreAdmin,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
