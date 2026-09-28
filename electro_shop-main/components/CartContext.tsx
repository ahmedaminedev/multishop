
import React, { createContext, useState, useContext, ReactNode, useMemo, useCallback, useEffect } from 'react';
import type { CartItem, Cartable } from '../types';

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: Cartable, quantity?: number) => void;
    removeFromCart: (itemId: string) => void;
    updateQuantity: (itemId: string, newQuantity: number) => void;
    clearCart: () => void;
    itemCount: number;
    cartTotal: number;
    isCartOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
        try {
            const stored = localStorage.getItem('electroShopCart');
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error("Failed to load cart from local storage", e);
            return [];
        }
    });
    
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Persist cart to local storage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('electroShopCart', JSON.stringify(cartItems));
        } catch (e) {
            console.error("Failed to save cart to local storage", e);
        }
    }, [cartItems]);

    const openCart = useCallback(() => setIsCartOpen(true), []);
    const closeCart = useCallback(() => setIsCartOpen(false), []);

    const addToCart = useCallback((item: Cartable, quantity = 1) => {
        const isPack = 'includedItems' in item;
        const id = `${isPack ? 'pack' : 'product'}-${item.id}`;

        setCartItems(prevItems => {
            const existingItem = prevItems.find(i => i.id === id);
            if (existingItem) {
                return prevItems.map(i =>
                    i.id === id ? { ...i, quantity: i.quantity + quantity } : i
                );
            } else {
                const newItem: CartItem = {
                    id,
                    name: item.name,
                    price: item.price,
                    imageUrl: item.imageUrl,
                    quantity,
                    originalItem: item
                };
                return [...prevItems, newItem];
            }
        });
    }, []);

    const removeFromCart = useCallback((itemId: string) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    }, []);

    const updateQuantity = useCallback((itemId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeFromCart(itemId);
        } else {
            setCartItems(prevItems =>
                prevItems.map(item =>
                    item.id === itemId ? { ...item, quantity: newQuantity } : item
                )
            );
        }
    }, [removeFromCart]);

    const clearCart = useCallback(() => {
        setCartItems([]);
        localStorage.removeItem('electroShopCart');
    }, []);

    const itemCount = useMemo(() => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    }, [cartItems]);

    const cartTotal = useMemo(() => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    }, [cartItems]);

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
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
