import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Gift } from 'lucide-react';
import { useCart } from './CartContext';

interface CartSidebarProps {
  onProceedToCheckout: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ onProceedToCheckout }) => {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();

  if (!isCartOpen) return null;

  const freeShippingThreshold = 100;
  const missingForFreeShipping = Math.max(0, freeShippingThreshold - totalPrice);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col justify-between text-slate-900 dark:text-white border-l border-slate-200 dark:border-slate-800 animate-slideLeft">
          
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-500" />
              <h2 className="text-base sm:text-lg font-black font-serif">
                Mon Panier Jouets ({totalItems})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free shipping bar */}
          <div className="px-5 sm:px-6 py-2.5 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-100 dark:border-amber-900/40 text-xs">
            {missingForFreeShipping === 0 ? (
              <p className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <span>🎉</span>
                <span>Félicitations ! Livraison gratuite offerte sur votre commande !</span>
              </p>
            ) : (
              <p className="font-medium text-amber-800 dark:text-amber-300">
                Plus que <strong className="font-bold">{missingForFreeShipping} DT</strong> pour bénéficier de la livraison gratuite !
              </p>
            )}
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center mx-auto text-2xl">
                  🧸
                </div>
                <h3 className="font-bold text-base">Votre panier est vide</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Découvrez nos jeux d'éveil, briques de construction et jeux de société pour remplir votre hotte !
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-xs uppercase cursor-pointer"
                >
                  Continuer les achats
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                >
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-xl bg-white dark:bg-slate-900 p-1 border border-slate-200/60 shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="font-bold text-xs sm:text-sm line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">
                        {item.product.brand}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="px-2 py-1 text-slate-500 font-bold hover:text-slate-900 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-black tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="px-2 py-1 text-slate-500 font-bold hover:text-slate-900 cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-black text-sm text-slate-900 dark:text-white tabular-nums">
                        {item.product.price * item.quantity} DT
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Subtotal & Checkout Button */}
          {cart.length > 0 && (
            <div className="p-5 sm:p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Sous-total articles :</span>
                  <span className="font-bold tabular-nums text-slate-800 dark:text-slate-200">
                    {totalPrice} DT
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Livraison partout en Tunisie :</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {missingForFreeShipping === 0 ? 'Offerte (Gratuit)' : '7 DT'}
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-slate-100 dark:border-slate-800 text-sm">
                  <span className="font-black">Total à payer :</span>
                  <span className="text-xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
                    {totalPrice + (missingForFreeShipping === 0 ? 0 : 7)} DT
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Commander (Paiement à la livraison)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  Garantie 100% Satisfait
                </span>
                <span className="flex items-center gap-1">
                  <Gift className="w-3 h-3 text-amber-500" />
                  Emballage cadeau disponible
                </span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
