import React, { useMemo } from 'react';
import { useCart } from './CartContext';
import { useToast } from './ToastContext';
import { XMarkIcon, PlusIcon, MinusIcon, TrashIcon, CartIcon } from './IconComponents';
import { groupCartByShop } from '@/src/utils/multiShopCart';

export const CartSidebar: React.FC<{ isLoggedIn: boolean; onNavigateToCheckout: () => void; onNavigateToLogin: () => void; }> = ({ isLoggedIn, onNavigateToCheckout, onNavigateToLogin }) => {
    const { isCartOpen, closeCart, cartItems, cartTotal, itemCount, updateQuantity, removeFromCart } = useCart();
    const { addToast } = useToast();
    
    const FREE_SHIPPING_LIMIT = 300;
    const progress = Math.min(100, (cartTotal / FREE_SHIPPING_LIMIT) * 100);
    const remaining = Math.max(0, FREE_SHIPPING_LIMIT - cartTotal);

    const shopGroups = useMemo(() => groupCartByShop(cartItems), [cartItems]);
    const isMultiShop = shopGroups.length > 1;

    const handleCheckout = () => {
        closeCart();
        if (isLoggedIn) onNavigateToCheckout();
        else {
            addToast("Authentification requise pour commander.", "info");
            onNavigateToLogin();
        }
    };

    return (
        <>
            <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] transition-opacity duration-500 ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={closeCart}></div>
            <div className={`fixed top-0 right-0 h-full w-full max-w-[460px] bg-brand-black border-l border-gray-800 z-[101] transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                
                {/* Header */}
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-brand-gray">
                    <div>
                        <h2 className="text-xl font-serif font-black italic text-white flex items-center gap-3 uppercase">
                            <CartIcon className="w-5 h-5 text-brand-neon" />
                            Votre Panier <span className="text-xs font-mono text-brand-neon bg-black px-2 py-0.5 ml-2 border border-brand-neon/30">{itemCount} Unités</span>
                        </h2>
                    </div>
                    <button onClick={closeCart} className="p-2 text-gray-500 hover:text-white"><XMarkIcon className="w-6 h-6" /></button>
                </div>

                {/* Multi-Shop Banner */}
                {isMultiShop && (
                    <div className="mx-6 mt-3 px-3.5 py-2 bg-gray-900 border border-brand-neon/40 text-white flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-brand-neon animate-ping"></span>
                            <span className="font-mono uppercase tracking-wider font-bold">Réseau MultiShop ({shopGroups.length} filiales)</span>
                        </div>
                        <div className="flex items-center gap-1">
                            {shopGroups.map(g => (
                                <span key={g.meta.id} className="text-sm">{g.meta.icon}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Progress Level */}
                <div className="p-6 bg-black/40 border-b border-gray-800">
                    <div className="flex justify-between items-end mb-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Livraison Offerte</p>
                        <p className="text-xs font-bold text-brand-neon">{remaining > 0 ? `+${remaining.toFixed(3)} DT restants` : 'CAPACITÉ MAXIMALE ATTEINTE'}</p>
                    </div>
                    <div className="h-1.5 w-full bg-gray-900 border border-gray-800 overflow-hidden slant">
                        <div className="h-full bg-brand-neon transition-all duration-1000 shadow-[0_0_15px_#ccff00]" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                {/* Items Grouped by Boutique */}
                <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {cartItems.length > 0 ? (
                        shopGroups.map(group => (
                            <div key={group.meta.id} className="border border-gray-800 bg-[#0d0e12] overflow-hidden">
                                {/* Group Header */}
                                <div className="px-4 py-2 bg-gray-900/90 border-b border-gray-800 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span>{group.meta.icon}</span>
                                        <span className="text-xs font-black uppercase text-white tracking-wider">{group.meta.name}</span>
                                        <span className="text-[9px] font-mono px-1.5 py-0.5 bg-black text-gray-400 border border-gray-700">{group.meta.badge}</span>
                                    </div>
                                    <span className="text-xs font-mono font-bold text-brand-neon">{group.subtotal.toFixed(3)} DT</span>
                                </div>

                                <div className="divide-y divide-gray-800/60 p-2">
                                    {group.items.map(item => (
                                        <div key={item.id} className="flex gap-4 p-3 hover:bg-white/[0.02] transition-colors">
                                            <div className="w-16 h-16 bg-black border border-gray-800 flex-shrink-0 p-1.5 flex items-center justify-center">
                                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />
                                            </div>
                                            <div className="flex-grow flex flex-col justify-between">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="text-xs font-bold text-white uppercase italic leading-tight line-clamp-1">{item.name}</h3>
                                                    <button onClick={() => removeFromCart(item.id)} className="text-gray-600 hover:text-red-500 transition-colors p-0.5"><TrashIcon className="w-3.5 h-3.5" /></button>
                                                </div>
                                                {item.selectedColor && (
                                                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">Var: {item.selectedColor}</p>
                                                )}
                                                <div className="flex justify-between items-end mt-2">
                                                    <div className="flex items-center bg-black border border-gray-700">
                                                        <button onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)} className="p-1 hover:text-brand-neon"><MinusIcon className="w-3 h-3"/></button>
                                                        <span className="w-6 text-center text-xs font-mono font-bold text-white">{item.quantity || 1}</span>
                                                        <button onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)} className="p-1 hover:text-brand-neon"><PlusIcon className="w-3 h-3"/></button>
                                                    </div>
                                                    <p className="text-xs font-black text-white font-mono">{((item.price || 0) * (item.quantity || 1)).toFixed(3)} <span className="text-[9px] text-gray-500">DT</span></p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-20">
                            <CartIcon className="w-16 h-16 mb-4" />
                            <p className="text-sm font-black uppercase tracking-widest">Aucun équipement détecté</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && (
                    <div className="p-6 bg-brand-gray border-t border-brand-neon shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em]">Total Investissement</p>
                            <p className="text-3xl font-serif font-black text-white italic">{cartTotal.toFixed(3)} <span className="text-sm text-brand-neon">DT</span></p>
                        </div>
                        <button 
                            onClick={handleCheckout}
                            className="w-full bg-brand-neon text-black font-black uppercase tracking-widest text-sm py-4 hover:bg-white transition-all slant cursor-pointer"
                        >
                            <span className="slant-reverse block">Finaliser la Commande ({itemCount})</span>
                        </button>
                        <p className="text-center mt-4 text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                            Paiement sécurisé MultiShop par cryptage SSL-256 bits
                        </p>
                    </div>
                )}
            </div>
        </>
    );
};