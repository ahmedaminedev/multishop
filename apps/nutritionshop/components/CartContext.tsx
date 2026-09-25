
import React, { createContext, useState, useContext, ReactNode, useMemo, useCallback, useEffect } from 'react';
import type { CartItem, Cartable, User } from '../types';

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
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // 1. Chargement du panier au changement d'utilisateur (ou démarrage)
    useEffect(() => {
        const loadCart = () => {
            // Détermine la clé de stockage : spécifique utilisateur ou invité
            const key = userId ? `cart_${userId}` : 'cart_guest';
            try {
                const stored = localStorage.getItem(key);
                if (stored) {
                    setCartItems(JSON.parse(stored));
                } else {
                    setCartItems([]);
                }
            } catch (e) {
                console.error("Erreur chargement panier", e);
                setCartItems([]);
            }
        };
        loadCart();
    }, [userId]);

    // 2. Sauvegarde automatique à chaque modification du panier
    useEffect(() => {
        const key = userId ? `cart_${userId}` : 'cart_guest';
        try {
            localStorage.setItem(key, JSON.stringify(cartItems));
        } catch (e) {
            console.error("Erreur sauvegarde panier", e);
        }
    }, [cartItems, userId]);

    const openCart = useCallback(() => setIsCartOpen(true), []);
    const closeCart = useCallback(() => setIsCartOpen(false), []);

    /**
     * Gère la transition entre le mode Invité et le mode Connecté.
     * Fusionne le panier invité avec le panier utilisateur existant.
     */
    const identifyUser = useCallback((user: User | null) => {
        if (user) {
            const newUserId = user.id.toString();
            
            // A. Récupérer le panier actuel de l'invité (avant de changer d'ID)
            const guestCartStr = localStorage.getItem('cart_guest');
            const guestCart: CartItem[] = guestCartStr ? JSON.parse(guestCartStr) : [];

            // B. Si le panier invité n'est pas vide, on procède à la fusion
            if (guestCart.length > 0) {
                // Récupérer le panier de l'utilisateur (s'il existe déjà en mémoire locale)
                const userCartKey = `cart_${newUserId}`;
                const userCartStr = localStorage.getItem(userCartKey);
                let userCart: CartItem[] = userCartStr ? JSON.parse(userCartStr) : [];

                // Fusionner les items
                guestCart.forEach(guestItem => {
                    const existingItemIndex = userCart.findIndex(ui => ui.id === guestItem.id);
                    if (existingItemIndex > -1) {
                        // L'article existe déjà, on cumule la quantité
                        userCart[existingItemIndex].quantity += guestItem.quantity;
                    } else {
                        // L'article n'existe pas, on l'ajoute
                        userCart.push(guestItem);
                    }
                });

                // Sauvegarder immédiatement le panier fusionné sous la clé de l'utilisateur
                localStorage.setItem(userCartKey, JSON.stringify(userCart));
                
                // Vider le panier invité pour éviter les doublons futurs
                localStorage.removeItem('cart_guest');
            }

            // C. Mettre à jour l'ID (ce qui déclenchera le useEffect de chargement)
            setUserId(newUserId);
        } else {
            // Déconnexion : on revient au mode invité
            setUserId(null);
        }
    }, []);

    const addToCart = useCallback((item: Cartable, quantity = 1, selectedColor?: string) => {
        const isPack = 'includedItems' in item;
        // Création d'un ID unique incluant la couleur pour différencier les variantes
        const colorSuffix = selectedColor ? `-${selectedColor.replace(/\s+/g, '')}` : '';
        const id = `${isPack ? 'pack' : 'product'}-${item.id}${colorSuffix}`;

        setCartItems(prevItems => {
            const existingItemIndex = prevItems.findIndex(i => i.id === id);
            if (existingItemIndex > -1) {
                // Clone pour immutabilité
                const newItems = [...prevItems];
                newItems[existingItemIndex].quantity += quantity;
                return newItems;
            } else {
                const newItem: CartItem = {
                    id,
                    name: item.name,
                    price: item.price,
                    imageUrl: item.imageUrl,
                    quantity,
                    originalItem: item,
                    selectedColor: selectedColor
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
        const key = userId ? `cart_${userId}` : 'cart_guest';
        localStorage.removeItem(key);
    }, [userId]);

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
