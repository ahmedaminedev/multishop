
import React, { createContext, useState, useContext, ReactNode, useMemo, useCallback, useEffect } from 'react';
import type { CartItem, Cartable, User } from '../types';
import { 
    loadUnifiedCart, 
    saveUnifiedCart, 
    enrichCartItem, 
    UNIFIED_CART_EVENT 
} from '@/src/utils/multiShopCart';

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: Cartable, quantity?: number, selectedColor?: string) => void;
    removeFromCart: (itemId: string) => void;
    updateQuantity: (itemId: string, newQuantity: number) => void;
    clearCart: () => void;
    identifyUser: (user: User | null) => void;
    itemCount: number;
    cartTotal: number;
    isCartOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [userId, setUserId] = useState<string | null>(null);
    const [cartItems, setCartItems] = useState<CartItem[]>(() => loadUnifiedCart(null, 'cosmetic'));
    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        const items = loadUnifiedCart(userId, 'cosmetic');
        setCartItems(items);

        const handleSync = (e: any) => {
            if (e.detail?.items) {
                setCartItems(e.detail.items);
            } else {
                setCartItems(loadUnifiedCart(userId, 'cosmetic'));
            }
        };

        window.addEventListener(UNIFIED_CART_EVENT, handleSync);
        window.addEventListener('storage', handleSync);
        return () => {
            window.removeEventListener(UNIFIED_CART_EVENT, handleSync);
            window.removeEventListener('storage', handleSync);
        };
    }, [userId]);

    const openCart = useCallback(() => setIsCartOpen(true), []);
    const closeCart = useCallback(() => setIsCartOpen(false), []);

    const identifyUser = useCallback((user: User | null) => {
        const newId = user ? user.id.toString() : null;
        setUserId(newId);
        setCartItems(loadUnifiedCart(newId, 'cosmetic'));
    }, []);

    const addToCart = useCallback((item: Cartable, quantity = 1, selectedColor?: string) => {
        const isPack = 'includedItems' in item;
        const colorSuffix = selectedColor ? `-${selectedColor.replace(/\s+/g, '')}` : '';
        const id = `${isPack ? 'pack' : 'product'}-${item.id}${colorSuffix}`;

        setCartItems(prevItems => {
            const existingIndex = prevItems.findIndex(i => i.id === id);
            let updated: CartItem[];
            if (existingIndex > -1) {
                updated = [...prevItems];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    quantity: updated[existingIndex].quantity + quantity
                };
            } else {
                const rawItem: CartItem = {
                    id,
                    name: item.name,
                    price: item.price,
                    imageUrl: item.imageUrl,
                    quantity,
                    originalItem: item,
                    selectedColor: selectedColor,
                    shopId: 'cosmetic'
                };
                const enriched = enrichCartItem(rawItem, 'cosmetic');
                updated = [...prevItems, enriched];
            }
            saveUnifiedCart(updated, userId);
            return updated;
        });
    }, [userId]);

    const removeFromCart = useCallback((itemId: string) => {
        setCartItems(prevItems => {
            const updated = prevItems.filter(item => item.id !== itemId);
            saveUnifiedCart(updated, userId);
            return updated;
        });
    }, [userId]);

    const updateQuantity = useCallback((itemId: string, newQuantity: number) => {
        setCartItems(prevItems => {
            let updated: CartItem[];
            if (newQuantity <= 0) {
                updated = prevItems.filter(item => item.id !== itemId);
            } else {
                updated = prevItems.map(item =>
                    item.id === itemId ? { ...item, quantity: newQuantity } : item
                );
            }
            saveUnifiedCart(updated, userId);
            return updated;
        });
    }, [userId]);

    const clearCart = useCallback(() => {
        setCartItems([]);
        saveUnifiedCart([], userId);
    }, [userId]);

    const itemCount = useMemo(() => {
        return cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
    }, [cartItems]);

    const cartTotal = useMemo(() => {
        return cartItems.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 1)), 0);
    }, [cartItems]);

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        identifyUser,
        itemCount,
        cartTotal,
        isCartOpen,
        openCart,
        closeCart
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
