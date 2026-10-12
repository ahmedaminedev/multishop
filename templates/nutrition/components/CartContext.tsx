
import React, { createContext, useState, useContext, ReactNode, useMemo, useCallback, useEffect } from 'react';
import type { CartItem, Cartable, User } from '../types';
import { 
    loadUnifiedCart, 
    saveUnifiedCart, 
    enrichCartItem, 
    normalizeProductId,
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
    const [cartItems, setCartItems] = useState<CartItem[]>(() => loadUnifiedCart(null, 'nutrition'));
    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        const items = loadUnifiedCart(userId, 'nutrition');
        setCartItems(items);

        const handleSync = (e: any) => {
            if (e.detail?.items) {
                setCartItems(e.detail.items);
            } else {
                setCartItems(loadUnifiedCart(userId, 'nutrition'));
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
        setCartItems(loadUnifiedCart(newId, 'nutrition'));
    }, []);

    const addToCart = useCallback((item: Cartable, quantity = 1, selectedColor?: string) => {
        const cleanTargetId = normalizeProductId(item.id);
        const targetShop = (item as any).filialeKey || (item as any).shopId || 'nutrition';

        setCartItems(prevItems => {
            const existingIndex = prevItems.findIndex(i => {
                const cleanId = normalizeProductId(i.productId || i.id);
                return cleanId === cleanTargetId && (i.shopId || 'nutrition') === targetShop && (i.selectedColor || '') === (selectedColor || '');
            });

            let updated: CartItem[];
            if (existingIndex > -1) {
                updated = [...prevItems];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    quantity: updated[existingIndex].quantity + quantity
                };
            } else {
                const rawItem: CartItem = {
                    id: `cart_${targetShop}_${cleanTargetId || item.id}${selectedColor ? `_${selectedColor}` : ''}`,
                    productId: cleanTargetId || item.id,
                    name: item.name,
                    price: item.price,
                    imageUrl: item.imageUrl,
                    quantity,
                    originalItem: item,
                    selectedColor: selectedColor,
                    shopId: targetShop
                };
                const enriched = enrichCartItem(rawItem, targetShop);
                updated = [...prevItems, enriched];
            }
            saveUnifiedCart(updated, userId);
            return updated;
        });
    }, [userId]);

    const removeFromCart = useCallback((itemId: string) => {
        const cleanTarget = normalizeProductId(itemId);
        setCartItems(prevItems => {
            const updated = prevItems.filter(item => 
                item.id !== itemId && normalizeProductId(item.productId || item.id) !== cleanTarget
            );
            saveUnifiedCart(updated, userId);
            return updated;
        });
    }, [userId]);

    const updateQuantity = useCallback((itemId: string, newQuantity: number) => {
        const cleanTarget = normalizeProductId(itemId);
        setCartItems(prevItems => {
            let updated: CartItem[];
            if (newQuantity <= 0) {
                updated = prevItems.filter(item => 
                    item.id !== itemId && normalizeProductId(item.productId || item.id) !== cleanTarget
                );
            } else {
                updated = prevItems.map(item =>
                    (item.id === itemId || normalizeProductId(item.productId || item.id) === cleanTarget) ? { ...item, quantity: newQuantity } : item
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
