
import React from 'react';
import { useCart } from './CartContext';
import { useToast } from './ToastContext';
import { 
    XMarkIcon, 
    PlusIcon, 
    MinusIcon, 
    TrashIcon, 
    CartIcon, 
    CheckCircleIcon, 
    LockIcon
} from './IconComponents';

export const CartSidebar: React.FC<{ isLoggedIn: boolean; onNavigateToCheckout: () => void; onNavigateToLogin: () => void; }> = ({ isLoggedIn, onNavigateToCheckout, onNavigateToLogin }) => {
    const { isCartOpen, closeCart, cartItems, cartTotal, itemCount, updateQuantity, removeFromCart } = useCart();
    const { addToast } = useToast();
    
    const FREE_SHIPPING_LIMIT = 120;
    const progress = Math.min(100, (cartTotal / FREE_SHIPPING_LIMIT) * 100);
    const remaining = Math.max(0, FREE_SHIPPING_LIMIT - cartTotal);

    const handleCheckout = () => {
        closeCart();
        if (isLoggedIn) onNavigateToCheckout();
        else {
            addToast("Identification requise pour commander.", "info");
            onNavigateToLogin();
        }
    };

    return (
        <>
            {/* Overlay */}
            <div 
                className={`fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[100] transition-opacity duration-500 ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
                onClick={closeCart}
            ></div>

            {/* Sidebar Design Purifié */}
            <div className={`fixed top-0 right-0 h-full w-full max-w-[420px] bg-white z-[101] transform transition-transform duration-500 ease-out flex flex-col shadow-2xl ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                
                {/* Header Minimaliste */}
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-serif font-black text-slate-800 uppercase tracking-tight">Mon <span className="text-brand-primary italic">Panier</span></h2>
                        <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-full">{itemCount}</span>
                    </div>
                    <button onClick={closeCart} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Barre de Progression Fine */}
                <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Livraison</span>
                        <span className="text-[10px] font-bold text-brand-primary uppercase">
                            {remaining > 0 ? `${remaining.toFixed(3)} DT restants` : 'OFFERTE'}
                        </span>
                    </div>
                    <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-primary transition-all duration-700" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                {/* Liste des Produits - Espace Maximisé */}
                <div className="flex-grow overflow-y-auto px-6 py-2 custom-cart-scrollbar">
                    {cartItems.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {cartItems.map(item => (
                                <div key={item.id} className="py-6 flex gap-4 animate-fadeIn">
                                    <div className="w-20 h-20 bg-slate-50 rounded-xl p-2 flex-shrink-0 border border-slate-100">
                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />
                                    </div>
                                    <div className="flex-grow flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-xs font-bold text-slate-800 uppercase leading-tight line-clamp-2 pr-4">{item.name}</h3>
                                            <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                                                <TrashIcon className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <div className="flex justify-between items-center mt-3">
                                            <div className="flex items-center bg-slate-50 rounded-lg p-0.5 border border-slate-100">
                                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-brand-primary"><MinusIcon className="w-3 h-3"/></button>
                                                <span className="w-6 text-center text-[11px] font-bold text-slate-700">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-brand-primary"><PlusIcon className="w-3 h-3"/></button>
                                            </div>
                                            <span className="text-sm font-black text-slate-900">{(item.price * item.quantity).toFixed(3)} DT</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center py-20">
                            <CartIcon className="w-12 h-12 text-slate-100 mb-4" />
                            <p className="text-sm text-slate-400 font-medium italic">Votre panier est vide</p>
                        </div>
                    )}
                </div>

                {/* Footer Compact & Rassurant */}
                <div className="p-6 border-t border-slate-100 bg-white">
                    <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>Sous-total</span>
                            <span>{cartTotal.toFixed(3)} DT</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">Total TTC</span>
                                <span className="text-[9px] text-slate-300 font-bold uppercase mt-0.5">Paiement sécurisé</span>
                            </div>
                            <span className="text-3xl font-serif font-black text-slate-900 tracking-tighter">
                                {(cartTotal + (remaining <= 0 ? 0 : 7)).toFixed(3)} <span className="text-xs font-sans">DT</span>
                            </span>
                        </div>
                    </div>

                    <button 
                        onClick={handleCheckout}
                        disabled={cartItems.length === 0}
                        className="w-full bg-brand-primary text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-primary/20 hover:bg-brand-primaryHover transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-[11px] disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none"
                    >
                        VALIDER MA COMMANDE <CheckCircleIcon className="w-4 h-4" />
                    </button>
                    
                    <div className="mt-4 flex items-center justify-center gap-2 opacity-30 grayscale">
                        <LockIcon className="w-3 h-3" />
                        <span className="text-[8px] font-black uppercase tracking-tighter">SSL Secure Payment</span>
                    </div>
                </div>
            </div>

            {/* Styles spécifiques pour le scrollbar du panier uniquement */}
            <style>{`
                .custom-cart-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-cart-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-cart-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-cart-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </>
    );
};
