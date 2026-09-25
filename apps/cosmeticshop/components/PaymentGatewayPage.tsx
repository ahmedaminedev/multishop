
import React, { useState, useEffect } from 'react';
import { useCart } from './CartContext';
import type { CartItem, CustomerInfo } from '../types';
import { LockIcon, VisaIcon, MastercardIcon, ArrowLongLeftIcon, CheckCircleIcon } from './IconComponents';
import { Logo } from './Logo';

interface PaymentGatewayPageProps {
    orderId: string;
    total: number;
    customerInfo: CustomerInfo;
    onNavigateHome: () => void;
    onOrderComplete: (cartItems: CartItem[], customerInfo: CustomerInfo, orderId: string) => void;
    onGoBack: () => void;
}

export const PaymentGatewayPage: React.FC<PaymentGatewayPageProps> = ({ orderId, total, customerInfo, onNavigateHome, onOrderComplete, onGoBack }) => {
    const { cartItems, clearCart } = useCart();
    const [timeLeft, setTimeLeft] = useState(15 * 60);
    
    // Card State for visualization
    const [cardNumber, setCardNumber] = useState('');
    const [cardHolder, setCardHolder] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => prev <= 1 ? 0 : prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const handlePayment = (e: React.FormEvent) => {
        e.preventDefault();
        onOrderComplete(cartItems, customerInfo, orderId);
        clearCart();
    };

    const formatCardNumber = (val: string) => {
        const v = val.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) {
            return parts.join(' ');
        } else {
            return val;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[700px] h-[700px] bg-rose-600/30 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute top-[40%] -right-[10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-0 left-1/3 w-[800px] h-[300px] bg-gradient-to-t from-black to-transparent opacity-80"></div>
            </div>

            <div className="relative z-10 w-full max-w-5xl flex flex-col lg:flex-row gap-12 lg:gap-24 items-center">
                
                {/* Left: Order Info & Timer */}
                <div className="w-full lg:w-1/2 text-white">
                    <button onClick={onGoBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm font-medium">
                        <ArrowLongLeftIcon className="w-5 h-5" /> Annuler et revenir
                    </button>
                    
                    <div className="mb-10">
                        <Logo /> 
                    </div>

                    <div className="mb-8">
                        <p className="text-gray-400 text-sm uppercase tracking-widest font-bold mb-2">Total à payer</p>
                        <h1 className="text-6xl font-serif font-bold text-white mb-2">{total.toFixed(3)} <span className="text-2xl text-rose-500">TND</span></h1>
                        <p className="text-gray-400 text-sm flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Commande réf. <span className="font-mono text-white bg-white/10 px-2 py-0.5 rounded">{orderId}</span>
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase mb-1">Expiration Session</p>
                            <p className="text-2xl font-mono font-bold">{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</p>
                        </div>
                        <div className="h-10 w-px bg-white/10"></div>
                        <div className="flex flex-col items-end">
                            <p className="text-xs text-gray-400 font-bold uppercase mb-1">Sécurité</p>
                            <div className="flex items-center gap-2 text-green-400 text-sm font-bold">
                                <LockIcon className="w-4 h-4"/> SSL Encrypted
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Interactive Card & Form */}
                <div className="w-full lg:w-1/2 perspective-1000">
                    
                    {/* Visual Credit Card */}
                    <div className="relative w-full max-w-[400px] h-[250px] mx-auto mb-10 transition-transform duration-700 preserve-3d" style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                        {/* Front */}
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-800 to-black rounded-2xl shadow-2xl border border-white/10 p-6 flex flex-col justify-between backface-hidden z-20 overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                            
                            <div className="flex justify-between items-start relative z-10">
                                <div className="w-12 h-8 bg-yellow-600/80 rounded-md border border-yellow-400/50 flex items-center justify-center">
                                    <div className="w-8 h-5 border border-black/20 rounded-sm"></div>
                                </div>
                                <VisaIcon className="h-8 text-white"/>
                            </div>
                            
                            <div className="relative z-10 text-center">
                                <p className="font-mono text-2xl tracking-widest text-white drop-shadow-md">
                                    {cardNumber || '•••• •••• •••• ••••'}
                                </p>
                            </div>

                            <div className="flex justify-between items-end relative z-10">
                                <div>
                                    <p className="text-[10px] uppercase text-gray-400 font-bold tracking-widest mb-1">Titulaire</p>
                                    <p className="font-medium text-sm tracking-wider uppercase truncate max-w-[200px]">{cardHolder || 'NOM PRENOM'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase text-gray-400 font-bold tracking-widest mb-1 text-right">Expire</p>
                                    <p className="font-mono text-sm tracking-wider">{expiry || 'MM/YY'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Back */}
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl border border-white/10 flex flex-col pt-6 backface-hidden rotate-y-180 z-10">
                            <div className="w-full h-12 bg-black/80 mb-6"></div>
                            <div className="px-6 relative">
                                <p className="text-[10px] text-right text-gray-400 uppercase font-bold mr-2 mb-1">CVV</p>
                                <div className="w-full h-10 bg-white text-black font-mono flex items-center justify-end px-3 tracking-widest font-bold rounded">
                                    {cvv || '•••'}
                                </div>
                                <div className="mt-6 flex justify-center opacity-50">
                                    <MastercardIcon className="h-10"/>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Form */}
                    <form onSubmit={handlePayment} className="bg-white dark:bg-gray-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/20">
                        <div className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Numéro de carte</label>
                                <input 
                                    type="text" 
                                    maxLength={19}
                                    placeholder="0000 0000 0000 0000"
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                    onFocus={() => setIsFlipped(false)}
                                    className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none font-mono"
                                    required
                                />
                            </div>
                            
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Nom du titulaire</label>
                                <input 
                                    type="text" 
                                    placeholder="Ex: JEAN DUPONT"
                                    value={cardHolder}
                                    onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                                    onFocus={() => setIsFlipped(false)}
                                    className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Expiration</label>
                                    <input 
                                        type="text" 
                                        placeholder="MM/YY"
                                        maxLength={5}
                                        value={expiry}
                                        onChange={(e) => {
                                            let v = e.target.value.replace(/[^0-9]/g, '');
                                            if(v.length >= 2) v = v.substring(0,2) + '/' + v.substring(2,4);
                                            setExpiry(v);
                                        }}
                                        onFocus={() => setIsFlipped(false)}
                                        className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none font-mono text-center"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">CVV</label>
                                    <input 
                                        type="text" 
                                        maxLength={3}
                                        placeholder="123"
                                        value={cvv}
                                        onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
                                        onFocus={() => setIsFlipped(true)}
                                        className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none font-mono text-center"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button 
                            type="submit"
                            className="w-full mt-8 bg-rose-600 hover:bg-rose-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-rose-600/30 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
                        >
                            <LockIcon className="w-4 h-4" />
                            Confirmer le paiement
                        </button>
                    </form>
                </div>
            </div>
            
            {/* Style pour la 3D Flip Card */}
            <style>{`
                .perspective-1000 { perspective: 1000px; }
                .preserve-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
            `}</style>
        </div>
    );
};
