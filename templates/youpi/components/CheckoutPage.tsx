import React, { useState } from 'react';
import { useCart } from './CartContext';
import { useToast } from './ToastContext';
import { CheckCircle2, ArrowLeft, Truck, Gift, ShieldCheck, ShoppingBag } from 'lucide-react';

interface CheckoutPageProps {
  onBackToShopping: () => void;
  onOrderSuccess: (order: any) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onBackToShopping, onOrderSuccess }) => {
  const { cart, totalPrice, clearCart } = useCart();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: 'Tunis',
    address: '',
    giftWrap: true,
    giftMessage: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);

  const deliveryCost = totalPrice >= 100 ? 0 : 7;
  const finalTotal = totalPrice + deliveryCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      addToast('Veuillez remplir vos coordonnées complètes de livraison.', 'error');
      return;
    }

    if (cart.length === 0) {
      addToast('Votre panier est vide.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        orderNumber: `CMD-YOUPI-${Date.now().toString().slice(-5)}`,
        customer: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '')}@client.tn`,
          address: `${formData.address}, ${formData.city}`
        },
        items: cart.map(item => ({
          id: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          imageUrl: item.product.imageUrl
        })),
        totalAmount: finalTotal,
        paymentMethod: 'Paiement en espèces à la livraison (COD)',
        status: 'en_attente',
        notes: `${formData.giftWrap ? '🎁 Emballage cadeau demandé. ' : ''}${formData.giftMessage ? `Mot : "${formData.giftMessage}". ` : ''}${formData.notes}`,
        date: new Date().toISOString().split('T')[0]
      };

      // Send to server
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-shop-id': 'youpi' },
        body: JSON.stringify(orderPayload)
      }).catch(() => null);

      let created = orderPayload;
      if (res && res.ok) {
        created = await res.json();
      }

      setCompletedOrder(created);
      clearCart();
      addToast('Commande confirmée avec succès !', 'success');
      onOrderSuccess(created);
    } catch (err: any) {
      addToast("Erreur lors de l'enregistrement de la commande", 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (completedOrder) {
    return (
      <div className="min-h-[70vh] bg-slate-50 dark:bg-slate-950 py-12 px-4 flex items-center justify-center animate-fadeIn">
        <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl text-center space-y-5 border border-slate-100 dark:border-slate-800">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto text-3xl shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-600">
              Commande Confirmée !
            </span>
            <h2 className="text-2xl font-black font-serif text-slate-900 dark:text-white mt-1">
              Merci pour votre confiance !
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Votre commande <strong className="text-slate-800 dark:text-slate-200">#{completedOrder.orderNumber}</strong> d'un montant de <strong className="text-amber-600">{completedOrder.totalAmount} DT</strong> a bien été enregistrée.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl text-xs text-left space-y-2 border border-slate-100 dark:border-slate-800">
            <p className="flex justify-between">
              <span className="text-slate-500">Destinataire :</span>
              <span className="font-bold">{completedOrder.customer?.name}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-500">Téléphone de contact :</span>
              <span className="font-bold">{completedOrder.customer?.phone}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-500">Mode de paiement :</span>
              <span className="font-bold text-emerald-600">Espèces à la livraison</span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-500">Délai estimé :</span>
              <span className="font-bold">24 à 48 heures ouvrées</span>
            </p>
          </div>

          <button
            onClick={onBackToShopping}
            className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 cursor-pointer transition-all"
          >
            Retourner à la boutique YoupiShop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Back Button */}
        <button
          onClick={onBackToShopping}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continuer mes achats</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-900 dark:text-white">
              Validation de votre Commande
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Paiement sécurisé en espèces lors de la réception de vos jouets à domicile.
            </p>
          </div>
          <span className="text-xs font-black uppercase px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 w-max">
            🚚 Livraison partout en Tunisie
          </span>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Customer & Address Information */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-4">
            
            <h2 className="text-base font-black font-serif text-slate-900 dark:text-white flex items-center gap-2">
              <span>📍 Coordonnées de Livraison</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nom et Prénom du destinataire *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Amira Ben Mahmoud"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Numéro de Téléphone (Mobile) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+216 98 123 456"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Gouvernorat / Ville *
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-amber-500"
                  >
                    {['Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Sousse', 'Monastir', 'Sfax', 'Bizerte', 'Gabès', 'Kairouan', 'Autre ville'].map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Adresse exacte de livraison *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Rue, N° bâtiment, résidence, repère proche..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Gift Wrap Option */}
              <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900/50 space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.giftWrap}
                    onChange={(e) => setFormData({ ...formData, giftWrap: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
                  />
                  <span className="font-bold text-amber-900 dark:text-amber-200 text-xs">
                    🎁 Emballage cadeau soigné avec ruban (Offert gratuitement)
                  </span>
                </label>
                {formData.giftWrap && (
                  <input
                    type="text"
                    value={formData.giftMessage}
                    onChange={(e) => setFormData({ ...formData, giftMessage: e.target.value })}
                    placeholder="Message personnalisé à joindre (Ex: Joyeux Anniversaire Youssef !)"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 text-xs text-slate-800 dark:text-slate-200"
                  />
                )}
              </div>

            </div>

          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-5">
            <h2 className="text-base font-black font-serif text-slate-900 dark:text-white flex items-center justify-between">
              <span>Récapitulatif ({cart.length} art.)</span>
              <span className="text-xs text-slate-400 font-sans font-normal">Paiement à la livraison</span>
            </h2>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-56 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.product.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-10 h-10 object-contain rounded-lg bg-slate-50 dark:bg-slate-800 p-0.5 border border-slate-200/50 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{item.product.name}</p>
                      <p className="text-[10px] text-slate-400">Qté : {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-black tabular-nums text-slate-900 dark:text-white shrink-0">
                    {item.product.price * item.quantity} DT
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Sous-total articles :</span>
                <span className="font-bold tabular-nums text-slate-800 dark:text-slate-200">{totalPrice} DT</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Frais de livraison :</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {deliveryCost === 0 ? 'Gratuit (Dès 100 DT)' : '7 DT'}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-slate-100 dark:border-slate-800 text-sm">
                <span className="font-black text-slate-900 dark:text-white">Total TTC :</span>
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
                  {finalTotal} DT
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Validation en cours...</span>
              ) : (
                <span>Confirmer la commande ({finalTotal} DT)</span>
              )}
            </button>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-500 space-y-1">
              <p className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Paiement 100% sécurisé</span>
              </p>
              <p>Vous ne réglez qu'à la livraison entre les mains du livreur après vérification de votre colis.</p>
            </div>

          </div>

        </form>

      </div>
    </div>
  );
};
