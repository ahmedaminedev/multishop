import React, { useMemo } from 'react';
import { useCart } from './CartContext';
import { useToast } from './ToastContext';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Truck, ShieldCheck } from 'lucide-react';
import { groupCartByShop } from '@/src/utils/multiShopCart';

export const CartSidebar: React.FC<{ 
    isLoggedIn: boolean; 
    onNavigateToCheckout: () => void; 
    onNavigateToLogin: () => void; 
}> = ({ isLoggedIn, onNavigateToCheckout, onNavigateToLogin }) => {
    const { isCartOpen, closeCart, cartItems, cartTotal, itemCount, updateQuantity, removeFromCart } = useCart();
    const { addToast } = useToast();
    
    const FREE_SHIPPING_LIMIT = 200; // 200 DT limit
    const progress = Math.min(100, (cartTotal / FREE_SHIPPING_LIMIT) * 100);
    const remaining = Math.max(0, FREE_SHIPPING_LIMIT - cartTotal);

    const shopGroups = useMemo(() => groupCartByShop(cartItems), [cartItems]);
    const isMultiShop = shopGroups.length > 1;

    const handleCheckout = () => {
        closeCart();
        if (isLoggedIn) {
            onNavigateToCheckout();
        } else {
            addToast("Veuillez vous connecter pour valider votre commande.", "info");
            onNavigateToLogin();
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div 
                className={`fixed inset-0 bg-black/60 backdrop-blur-xs z-[130] transition-opacity duration-300 ${
                    isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`} 
                onClick={closeCart}
            />

            {/* Sidebar drawer */}
            <div 
                className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 z-[131] shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${
                    isCartOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                {/* Header */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#84cc16] text-black flex items-center justify-center font-bold">
                            <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-slate-900 dark:text-white leading-none">
                                Mon Panier
                            </h2>
                            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                                {itemCount} article{itemCount > 1 ? 's' : ''} sélectionné{itemCount > 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>

                    <button 
                        onClick={closeCart} 
                        className="w-8 h-8 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                        title="Fermer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Free Delivery Tracker */}
                <div className="px-5 py-3.5 bg-slate-100/70 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-700/80">
                    <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                        <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <Truck className="w-3.5 h-3.5 text-[#84cc16]" />
                            <span>Livraison Gratuite</span>
                        </span>
                        <span className="text-[#65a30d] dark:text-[#84cc16]">
                            {remaining === 0 
                                ? 'Offerte sur votre commande !' 
                                : `Plus que ${remaining.toFixed(3)} DT`
                            }
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-[#84cc16] transition-all duration-500 rounded-full" 
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Multi-Shop warning if items come from other stores */}
                {isMultiShop && (
                    <div className="mx-4 mt-3 px-3 py-2 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between">
                        <span className="font-bold">Panier MultiShop ({shopGroups.length} filiales)</span>
                        <span className="text-[10px] font-mono uppercase bg-blue-200 dark:bg-blue-800 px-1.5 py-0.5 rounded">
                            Commande Unifiée
                        </span>
                    </div>
                )}

                {/* Cart Items List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cartItems.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                                <ShoppingBag className="w-8 h-8 text-slate-400" />
                            </div>
                            <p className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
                                Votre panier est vide
                            </p>
                            <p className="text-xs text-slate-500 max-w-xs mb-4">
                                Découvrez nos haltères, bancs de musculation, racks et compléments de performance.
                            </p>
                            <button
                                onClick={closeCart}
                                className="px-5 py-2.5 bg-[#84cc16] hover:bg-[#72b012] text-black font-extrabold text-xs rounded-lg transition-colors cursor-pointer"
                            >
                                Explorer le catalogue
                            </button>
                        </div>
                    ) : (
                        cartItems.map((item) => (
                            <div 
                                key={item.id} 
                                className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700/80 shadow-2xs hover:border-slate-200 transition-all"
                            >
                                {/* Thumbnail */}
                                <div className="w-16 h-16 rounded-lg bg-slate-50 dark:bg-slate-900 p-1.5 flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800">
                                    <img 
                                        src={item.imageUrl} 
                                        alt={item.name} 
                                        className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                                    />
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 leading-tight">
                                            {item.name}
                                        </h4>
                                        <button 
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                                            title="Supprimer"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between mt-2.5">
                                        {/* Quantity control pill */}
                                        <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900">
                                            <button 
                                                onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                                                className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="px-2 text-xs font-black text-slate-900 dark:text-white">
                                                {item.quantity || 1}
                                            </span>
                                            <button 
                                                onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                                                className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>

                                        {/* Price */}
                                        <span className="text-xs font-black text-slate-900 dark:text-white">
                                            {((item.price || 0) * (item.quantity || 1)).toFixed(3)} DT
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer / Checkout */}
                {cartItems.length > 0 && (
                    <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                        <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                            <div className="flex justify-between">
                                <span>Sous-total</span>
                                <span className="font-bold text-slate-900 dark:text-white">{cartTotal.toFixed(3)} DT</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Livraison</span>
                                <span className="font-bold text-[#65a30d] dark:text-[#84cc16]">
                                    {remaining === 0 ? 'Gratuite' : '7.000 DT'}
                                </span>
                            </div>
                            <div className="border-t border-slate-100 dark:border-slate-800 pt-2 flex justify-between text-base font-black text-slate-900 dark:text-white">
                                <span>Total estimé</span>
                                <span className="text-[#65a30d] dark:text-[#84cc16]">
                                    {(cartTotal + (remaining === 0 ? 0 : 7)).toFixed(3)} DT
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleCheckout}
                            className="w-full py-3.5 px-4 bg-[#84cc16] hover:bg-[#72b012] text-black font-black text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
                        >
                            <span>Valider la commande</span>
                            <ArrowRight className="w-4 h-4 stroke-[3]" />
                        </button>

                        <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 font-semibold pt-1">
                            <span className="flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-[#84cc16]" />
                                <span>Paiement Sécurisé</span>
                            </span>
                            <span>•</span>
                            <span>Garantie Matériel 2 ans</span>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};
