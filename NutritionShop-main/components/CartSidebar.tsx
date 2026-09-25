import React, { useMemo } from 'react';
import { useCart } from './CartContext';
import { useToast } from './ToastContext';
import { XMarkIcon, PlusIcon, MinusIcon, TrashIcon, CartIcon } from './IconComponents';

export const CartSidebar: React.FC<{ isLoggedIn: boolean; onNavigateToCheckout: () => void; onNavigateToLogin: () => void; }> = ({ isLoggedIn, onNavigateToCheckout, onNavigateToLogin }) => {
    const { isCartOpen, closeCart, cartItems, cartTotal, itemCount, updateQuantity, removeFromCart } = useCart();
    const { addToast } = useToast();
    
    const FREE_SHIPPING_LIMIT = 300;
    const progress = Math.min(100, (cartTotal / FREE_SHIPPING_LIMIT) * 100);
    const remaining = Math.max(0, FREE_SHIPPING_LIMIT - cartTotal);

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
            <div className={`fixed top-0 right-0 h-full w-full max-w-[450px] bg-brand-black border-l border-gray-800 z-[101] transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                
                {/* Header */}
                <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-brand-gray">
                    <div>
                        <h2 className="text-2xl font-serif font-black italic text-white flex items-center gap-3 uppercase">
                            <CartIcon className="w-6 h-6 text-brand-neon" />
                            Votre Set <span className="text-xs font-mono text-gray-500 bg-black px-2 py-1 ml-2">{itemCount} Unités</span>
                        </h2>
                    </div>
                    <button onClick={closeCart} className="p-2 text-gray-500 hover:text-white"><XMarkIcon className="w-8 h-8" /></button>
                </div>

                {/* Progress Level */}
                <div className="p-8 bg-black/40 border-b border-gray-800">
                    <div className="flex justify-between items-end mb-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Niveau de Livraison Offerte</p>
                        <p className="text-xs font-bold text-brand-neon">{remaining > 0 ? `+${remaining.toFixed(3)} DT restants` : 'CAPACITÉ MAXIMALE ATTEINTE'}</p>
                    </div>
                    <div className="h-2 w-full bg-gray-900 border border-gray-800 overflow-hidden slant">
                        <div className="h-full bg-brand-neon transition-all duration-1000 shadow-[0_0_15px_#ccff00]" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                {/* Items */}
                <div className="flex-grow overflow-y-auto p-8 space-y-6 custom-scrollbar">
                    {cartItems.map(item => (
                        <div key={item.id} className="flex gap-6 pb-6 border-b border-gray-800 animate-fadeIn">
                            <div className="w-24 h-24 bg-brand-gray border border-gray-700 flex-shrink-0 p-2">
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />
                            </div>
                            <div className="flex-grow flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-sm font-bold text-white uppercase italic leading-tight">{item.name}</h3>
                                    <button onClick={() => removeFromCart(item.id)} className="text-gray-600 hover:text-brand-alert transition-colors"><TrashIcon className="w-4 h-4" /></button>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div className="flex items-center bg-black border border-gray-700">
                                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 hover:text-brand-neon"><MinusIcon className="w-3 h-3"/></button>
                                        <span className="w-8 text-center text-xs font-mono font-bold">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 hover:text-brand-neon"><PlusIcon className="w-3 h-3"/></button>
                                    </div>
                                    <p className="text-sm font-black text-white font-mono">{item.price.toFixed(3)} <span className="text-[10px] text-gray-500">DT</span></p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {cartItems.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                            <CartIcon className="w-16 h-16 mb-4" />
                            <p className="text-sm font-black uppercase tracking-widest">Aucun équipement détecté</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 bg-brand-gray border-t border-brand-neon shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em]">Total Investissement</p>
                        <p className="text-4xl font-serif font-black text-white italic">{cartTotal.toFixed(3)} <span className="text-sm text-brand-neon">DT</span></p>
                    </div>
                    <button 
                        onClick={handleCheckout}
                        disabled={cartItems.length === 0}
                        className="w-full bg-brand-neon text-black font-black uppercase tracking-widest text-sm py-5 hover:bg-white transition-all slant disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <span className="slant-reverse block">Finaliser la Commande</span>
                    </button>
                    <p className="text-center mt-6 text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                        Paiement sécurisé par cryptage SSL-256 bits
                    </p>
                </div>
            </div>
        </>
    );
};