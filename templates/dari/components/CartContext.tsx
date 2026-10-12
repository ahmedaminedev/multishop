import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from '../types';
import {
  loadUnifiedCart,
  saveUnifiedCart,
  enrichCartItem,
  normalizeProductId,
  UNIFIED_CART_EVENT
} from '@/src/utils/multiShopCart';

export interface CartItem {
  id?: string;
  product: Product;
  quantity: number;
  shopId?: string;
  shopName?: string;
  shopIcon?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number | string) => void;
  updateQuantity: (productId: number | string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    return loadUnifiedCart(null, 'dari').map(item => ({
      id: item.id,
      product: item.product || item,
      quantity: item.quantity,
      shopId: item.shopId,
      shopName: item.shopName,
      shopIcon: item.shopIcon
    }));
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Synchronize across sub-shops and storage changes
  useEffect(() => {
    const syncCart = () => {
      const items = loadUnifiedCart(null, 'dari');
      setCart(items.map(item => ({
        id: item.id,
        product: item.product || item,
        quantity: item.quantity,
        shopId: item.shopId,
        shopName: item.shopName,
        shopIcon: item.shopIcon
      })));
    };

    window.addEventListener(UNIFIED_CART_EVENT, syncCart);
    window.addEventListener('storage', syncCart);
    return () => {
      window.removeEventListener(UNIFIED_CART_EVENT, syncCart);
      window.removeEventListener('storage', syncCart);
    };
  }, []);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    const rawItems = loadUnifiedCart(null, 'dari');
    const cleanTargetId = normalizeProductId(product.id);
    const enriched = enrichCartItem({
      productId: cleanTargetId || product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity,
      shopId: 'dari',
      product
    }, 'dari');

    const existingIdx = rawItems.findIndex(i => {
      const pId = normalizeProductId(i.productId || i.product?.id || i.id);
      return pId === cleanTargetId && (i.shopId || 'dari') === 'dari';
    });

    let updated: any[];
    if (existingIdx > -1) {
      updated = [...rawItems];
      updated[existingIdx].quantity += quantity;
    } else {
      updated = [...rawItems, enriched];
    }

    saveUnifiedCart(updated);
    setCart(updated.map(item => ({
      id: item.id,
      product: item.product || item,
      quantity: item.quantity,
      shopId: item.shopId,
      shopName: item.shopName,
      shopIcon: item.shopIcon
    })));
    setIsCartOpen(true);
  }, []);

  const removeFromCart = useCallback((productId: number | string) => {
    const rawItems = loadUnifiedCart(null, 'dari');
    const cleanTargetId = normalizeProductId(productId);
    const updated = rawItems.filter(i => {
      const pId = normalizeProductId(i.productId || i.product?.id || i.id);
      return pId !== cleanTargetId && String(i.id) !== String(productId);
    });
    saveUnifiedCart(updated);
    setCart(updated.map(item => ({
      id: item.id,
      product: item.product || item,
      quantity: item.quantity,
      shopId: item.shopId,
      shopName: item.shopName,
      shopIcon: item.shopIcon
    })));
  }, []);

  const updateQuantity = useCallback((productId: number | string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const rawItems = loadUnifiedCart(null, 'dari');
    const cleanTargetId = normalizeProductId(productId);
    const updated = rawItems.map(i => {
      const pId = normalizeProductId(i.productId || i.product?.id || i.id);
      if (pId === cleanTargetId || String(i.id) === String(productId)) {
        return { ...i, quantity };
      }
      return i;
    });
    saveUnifiedCart(updated);
    setCart(updated.map(item => ({
      id: item.id,
      product: item.product || item,
      quantity: item.quantity,
      shopId: item.shopId,
      shopName: item.shopName,
      shopIcon: item.shopIcon
    })));
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    saveUnifiedCart([]);
    setCart([]);
  }, []);

  const totalItems = cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  const totalPrice = cart.reduce((sum, item) => sum + ((Number(item.product?.price) || 0) * (Number(item.quantity) || 1)), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    return {
      cart: [],
      addToCart: () => {},
      removeFromCart: () => {},
      updateQuantity: () => {},
      clearCart: () => {},
      totalItems: 0,
      totalPrice: 0,
      isCartOpen: false,
      setIsCartOpen: () => {}
    };
  }
  return context;
};
