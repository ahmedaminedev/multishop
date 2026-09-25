import React, { useState, useEffect } from 'react';
import { useCart } from './CartContext';
import type { CartItem, CustomerInfo } from '../types';
import { LockIcon, VisaIcon, MastercardIcon, ArrowLongLeftIcon } from './IconComponents';
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
    const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // Optionally handle session expiry
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const handlePayment = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate payment success - Pass the orderId so App.tsx can use it for redirection
        onOrderComplete(cartItems, customerInfo, orderId);
        clearCart();
    };

    return (
        <div className="bg-gray-100 dark:bg-gray-950 min-h-screen flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md mb-4">
                <button onClick={onGoBack} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 font-semibold transition-colors">
                    <ArrowLongLeftIcon className="w-5 h-5" />
                    Retourner aux options de paiement
                </button>
            </div>

            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 space-y-6">
                <div className="flex justify-center">
                    <Logo />
                </div>

                <div className="text-center">
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white">Numéro de la commande <span className="text-red-600 font-extrabold">{orderId}</span></h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Il reste {minutes} min, {seconds.toString().padStart(2, '0')} sec. à la fin de la session
                    </p>
                </div>

                <form onSubmit={handlePayment} className="space-y-4">
                    <InputField id="cardNumber" label="Numéro de la carte" type="text" placeholder="•••• •••• •••• ••••" />
                    <div className="grid grid-cols-3 gap-4">
                        <SelectField id="month" label="Mois" options={Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0'))} />
                        <SelectField id="year" label="Année" options={Array.from({length: 10}, (_, i) => (new Date().getFullYear() + i).toString())} />
                        <InputField id="cvv" label="CVV" type="text" placeholder="CVV" />
                    </div>
                    <InputField id="cardHolder" label="Le nom du détenteur" type="text" />
                    
                    <div className="pt-2">
                        <div className="flex items-start">
                            <input type="checkbox" id="save-email" defaultChecked className="h-4 w-4 rounded text-red-600 focus:ring-red-500 border-gray-300 mt-1" />
                            <label htmlFor="save-email" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">Adresse e-mail</label>
                        </div>
                        <div className="mt-2">
                             <InputField id="email" label="Adresse e-mail" type="email" placeholder="votre@email.com"/>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
                    >
                        <span>Paiement {total.toFixed(3).replace('.', ',')} TND</span>
                    </button>
                </form>

                 <div className="text-center text-sm text-gray-500 dark:text-gray-400 flex flex-col items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <LockIcon className="w-4 h-4" />
                        <span>Paiement sécurisé</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <VisaIcon className="h-6" />
                        <MastercardIcon className="h-6" />
                    </div>
                </div>
            </div>
        </div>
    );
};


const InputField: React.FC<{ id: string, label: string, type: string, placeholder?: string }> = ({ id, label, type, placeholder }) => (
    <div>
        <label htmlFor={id} className="sr-only">{label}</label>
        <input 
            type={type} 
            id={id} 
            name={id}
            placeholder={placeholder || label}
            required
            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500 transition"
        />
    </div>
);

const SelectField: React.FC<{ id: string, label: string, options: string[] }> = ({ id, label, options }) => (
    <div>
        <label htmlFor={id} className="sr-only">{label}</label>
        <select 
            id={id} 
            name={id}
            required
            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500 transition"
        >
            <option value="">{label}</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);