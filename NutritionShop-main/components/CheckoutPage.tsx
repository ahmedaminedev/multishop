
import React, { useState } from 'react';
import { useCart } from './CartContext';
import { useToast } from './ToastContext';
import { 
    DeliveryTruckIcon, 
    LockIcon,
    MailIcon,
    PhoneIcon,
    LocationIcon,
    HomeIcon,
    VisaIcon,
    MastercardIcon,
    CheckCircleIcon,
    UserIcon,
    ArrowLongLeftIcon
} from './IconComponents';
import type { CartItem, CustomerInfo, Store } from '../types';
import { api } from '../utils/api';

interface CheckoutPageProps {
    onNavigateHome: () => void;
    onOrderComplete: (cartItems: CartItem[], customerInfo: CustomerInfo, paymentId?: string) => void;
    onNavigateToPaymentGateway: (orderId: string, total: number, customerInfo: CustomerInfo) => void;
    stores: Store[];
}

// --- NOUVEAU COMPOSANT INPUT MODERNE & VISIBLE ---
const ModernInput: React.FC<{ 
    name: string; 
    label: string; 
    value: string; 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
    type?: string;
    icon?: React.ReactNode;
    placeholder?: string;
}> = ({ name, label, value, onChange, type = 'text', icon, placeholder = " " }) => (
    <div className="relative w-full group">
        <div className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-500 group-focus-within:text-brand-neon transition-colors z-10">
            {icon}
        </div>
        <input 
            type={type} 
            id={name} 
            name={name}
            value={value}
            onChange={onChange}
            className={`
                peer w-full h-14 bg-white dark:bg-[#1f2833] 
                border-2 border-gray-200 dark:border-gray-700 
                px-4 ${icon ? 'pl-12' : ''} pt-4 pb-1
                text-gray-900 dark:text-white font-bold
                placeholder-transparent outline-none transition-all duration-300
                focus:border-brand-neon focus:ring-0
                hover:border-gray-300 dark:hover:border-gray-500
            `}
            placeholder={placeholder}
        />
        <label 
            htmlFor={name}
            className={`
                absolute left-4 ${icon ? 'left-12' : 'left-4'} top-1 
                text-[10px] uppercase font-bold tracking-wider text-gray-500
                transition-all duration-300
                peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-placeholder-shown:capitalize peer-placeholder-shown:font-normal peer-placeholder-shown:tracking-normal
                peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-brand-neon peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-wider
                pointer-events-none
            `}
        >
            {label}
        </label>
    </div>
);

const StepIndicator: React.FC<{ currentStep: number }> = ({ currentStep }) => {
    const steps = [
        { id: 1, label: "Identité" },
        { id: 2, label: "Livraison" },
        { id: 3, label: "Paiement" }
    ];

    return (
        <div className="flex items-center justify-center w-full mb-12">
            {steps.map((step, index) => {
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;
                
                return (
                    <React.Fragment key={step.id}>
                        <div className="relative flex flex-col items-center">
                            <div 
                                className={`
                                    w-10 h-10 flex items-center justify-center font-black text-sm transition-all duration-500 border-2 skew-x-[-12deg]
                                    ${isActive ? 'bg-brand-neon border-brand-neon text-black scale-110' : 
                                      isCompleted ? 'bg-white border-white text-black' : 
                                      'bg-transparent border-gray-600 text-gray-600'}
                                `}
                            >
                                <span className="skew-x-[12deg]">
                                    {isCompleted ? <CheckCircleIcon className="w-5 h-5"/> : step.id}
                                </span>
                            </div>
                            <span className={`absolute -bottom-8 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors duration-300 ${isActive ? 'text-brand-neon' : isCompleted ? 'text-white' : 'text-gray-600'}`}>
                                {step.label}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <div className="w-16 sm:w-32 h-0.5 bg-gray-800 mx-4 relative overflow-hidden">
                                <div 
                                    className={`absolute inset-0 bg-brand-neon transition-all duration-700 ease-out`}
                                    style={{ width: isCompleted ? '100%' : '0%' }}
                                ></div>
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

const OrderItemRow: React.FC<{ item: CartItem }> = ({ item }) => (
    <div className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
        <div className="relative w-14 h-14 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex-shrink-0">
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
            <span className="absolute -bottom-2 -right-2 bg-brand-neon text-black text-[9px] w-5 h-5 flex items-center justify-center font-bold border border-black">
                {item.quantity}
            </span>
        </div>
        <div className="flex-grow min-w-0">
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate uppercase">{item.name}</p>
            {item.selectedColor && <p className="text-[10px] text-gray-500 uppercase tracking-wider">{item.selectedColor}</p>}
        </div>
        <p className="text-sm font-black text-gray-900 dark:text-white font-mono">
            {(item.price * item.quantity).toFixed(3)}
        </p>
    </div>
);

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigateHome, onOrderComplete, stores }) => {
    const [activeStep, setActiveStep] = useState(1);
    const [formData, setFormData] = useState<CustomerInfo>({
        email: '', firstName: '', lastName: '', address: '', address2: '', postalCode: '', city: '', country: 'Tunisia', phone: '',
    });
    const [shippingOption, setShippingOption] = useState('transporteur-tunisie');
    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('card');
    const [termsAgreed, setTermsAgreed] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const { cartItems, clearCart, cartTotal } = useCart();
    const { addToast } = useToast();
    
    const isStorePickup = shippingOption.startsWith('store-');
    const SHIPPING_COST = isStorePickup ? 0 : (cartTotal >= 300 ? 0.000 : 7.000);
    const FISCAL_STAMP = 1.000;
    const finalTotal = cartTotal + SHIPPING_COST + FISCAL_STAMP;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateStep = (step: number) => {
        if (step === 1) {
            return formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) && formData.firstName.trim() && formData.lastName.trim();
        }
        if (step === 2) {
            return formData.address.trim() && formData.city.trim() && formData.postalCode.trim() && formData.phone.match(/^\d{8}$/);
        }
        return true;
    };

    const handleNext = () => {
        if (!validateStep(activeStep)) {
            addToast("Veuillez remplir correctement tous les champs obligatoires.", "error");
            return;
        }
        setActiveStep(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleConfirmOrder = async () => {
        if (!termsAgreed) { addToast("Veuillez accepter les CGV.", "warning"); return; }
        setIsProcessing(true);
        try {
            const orderId = 'IF' + Date.now().toString().slice(-8).toUpperCase();
            const newOrder = {
                id: orderId,
                customerName: `${formData.firstName} ${formData.lastName}`,
                date: new Date().toISOString(),
                total: finalTotal,
                status: 'En attente',
                itemCount: cartItems.reduce((acc, i) => acc + i.quantity, 0),
                items: cartItems.map(i => ({ productId: parseInt(i.id.split('-')[1]), name: i.name, quantity: i.quantity, price: i.price, imageUrl: i.imageUrl })),
                shippingAddress: { type: 'Domicile', street: formData.address, city: formData.city, postalCode: formData.postalCode, isDefault: true },
                paymentMethod: paymentMethod === 'card' ? 'Carte Bancaire (Paymee)' : 'Paiement à la livraison'
            };

            await api.createOrder(newOrder);

            if (paymentMethod === 'cod') {
                clearCart();
                window.location.href = `/?payment=success&orderId=${orderId}`;
            } else {
                const response = await api.initiatePayment({ orderId, amount: finalTotal, customerInfo: formData });
                if (response?.payment_url) window.location.href = response.payment_url;
                else throw new Error("Erreur paiement.");
            }
        } catch (error: any) {
            addToast(error.message || "Erreur.", "error");
            setIsProcessing(false);
        }
    };

    return (
        <div className="bg-white dark:bg-black min-h-screen font-sans pb-24">
            {/* Header Minimaliste */}
            <div className="bg-white dark:bg-brand-black border-b border-gray-100 dark:border-gray-800 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <button onClick={onNavigateHome} className="flex items-center gap-3 text-gray-500 hover:text-brand-neon transition-colors group">
                        <div className="w-8 h-8 flex items-center justify-center border border-gray-700 group-hover:border-brand-neon transition-colors">
                            <ArrowLongLeftIcon className="w-5 h-5"/>
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest">Retour Boutique</span>
                    </button>
                    <div className="font-serif font-black uppercase italic text-xl text-gray-900 dark:text-white">Commande</div>
                    <div className="w-32"></div> 
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <StepIndicator currentStep={activeStep} />

                <div className="flex flex-col lg:flex-row gap-12">
                    
                    {/* Left Column: Interactive Forms */}
                    <div className="flex-grow max-w-4xl space-y-8 animate-fadeIn">
                        
                        {activeStep === 1 && (
                            <div className="bg-gray-50 dark:bg-brand-black p-8 lg:p-10 border border-gray-200 dark:border-gray-800">
                                <h2 className="text-2xl font-serif font-black italic uppercase text-gray-900 dark:text-white mb-8">Vos Coordonnées</h2>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <ModernInput name="firstName" label="Prénom" icon={<UserIcon className="w-5 h-5"/>} value={formData.firstName} onChange={handleInputChange} />
                                        <ModernInput name="lastName" label="Nom" icon={<UserIcon className="w-5 h-5"/>} value={formData.lastName} onChange={handleInputChange} />
                                    </div>
                                    <ModernInput name="email" label="Adresse E-mail" type="email" icon={<MailIcon className="w-5 h-5"/>} value={formData.email} onChange={handleInputChange} />
                                </div>
                                <div className="flex justify-end mt-10">
                                    <button onClick={handleNext} className="bg-brand-neon text-black font-black uppercase tracking-widest text-xs px-12 py-4 hover:bg-white transition-all skew-x-[-12deg]">
                                        <span className="skew-x-[12deg] block">Suivant</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeStep === 2 && (
                            <div className="bg-gray-50 dark:bg-brand-black p-8 lg:p-10 border border-gray-200 dark:border-gray-800">
                                <h2 className="text-2xl font-serif font-black italic uppercase text-gray-900 dark:text-white mb-8">Livraison</h2>
                                <div className="space-y-6">
                                    <ModernInput name="address" label="Adresse (Rue, Appt...)" icon={<LocationIcon className="w-5 h-5"/>} value={formData.address} onChange={handleInputChange} />
                                    <div className="grid grid-cols-2 gap-6">
                                        <ModernInput name="city" label="Ville" value={formData.city} onChange={handleInputChange} />
                                        <ModernInput name="postalCode" label="Code Postal" value={formData.postalCode} onChange={handleInputChange} />
                                    </div>
                                    <ModernInput name="phone" label="Téléphone (8 chiffres)" type="tel" icon={<PhoneIcon className="w-5 h-5"/>} value={formData.phone} onChange={handleInputChange} />
                                    
                                    <div className="mt-10">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Méthode d'expédition</h3>
                                        <div 
                                            onClick={() => setShippingOption('transporteur-tunisie')}
                                            className={`relative p-6 border-2 cursor-pointer transition-all duration-300 group ${shippingOption === 'transporteur-tunisie' ? 'border-brand-neon bg-brand-neon/5' : 'border-gray-200 dark:border-gray-700 hover:border-white'}`}
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-bold text-gray-900 dark:text-white flex items-center gap-3 uppercase text-sm tracking-wide">
                                                    <div className={`p-2 ${shippingOption === 'transporteur-tunisie' ? 'bg-brand-neon text-black' : 'bg-gray-700 text-gray-400'}`}>
                                                        <DeliveryTruckIcon className="w-5 h-5"/>
                                                    </div>
                                                    Livraison Domicile
                                                </span>
                                                <span className="font-black text-brand-neon uppercase text-sm">{cartTotal >= 300 ? 'Gratuit' : '7 DT'}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 pl-12 uppercase tracking-wide">Livraison Express 24-48h</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mt-10">
                                    <button onClick={() => setActiveStep(1)} className="text-gray-500 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors underline decoration-gray-700">Retour</button>
                                    <button onClick={handleNext} className="bg-brand-neon text-black font-black uppercase tracking-widest text-xs px-12 py-4 hover:bg-white transition-all skew-x-[-12deg]">
                                        <span className="skew-x-[12deg] block">Paiement</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeStep === 3 && (
                            <div className="bg-gray-50 dark:bg-brand-black p-8 lg:p-10 border border-gray-200 dark:border-gray-800">
                                <h2 className="text-2xl font-serif font-black italic uppercase text-gray-900 dark:text-white mb-8">Paiement</h2>
                                <div className="space-y-4">
                                    <div 
                                        onClick={() => setPaymentMethod('card')}
                                        className={`flex items-center gap-6 p-6 border-2 cursor-pointer transition-all duration-300 ${paymentMethod === 'card' ? 'border-brand-neon bg-brand-neon/5' : 'border-gray-200 dark:border-gray-700 hover:border-white'}`}
                                    >
                                        <div className={`w-5 h-5 border-2 flex items-center justify-center transition-colors ${paymentMethod === 'card' ? 'border-brand-neon' : 'border-gray-500'}`}>
                                            {paymentMethod === 'card' && <div className="w-3 h-3 bg-brand-neon"></div>}
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-bold text-gray-900 dark:text-white text-base uppercase tracking-wide">Carte Bancaire</p>
                                            <p className="text-xs text-gray-500 uppercase">Sécurisé par Paymee</p>
                                        </div>
                                        <div className="flex gap-2 opacity-80">
                                            <VisaIcon className="h-6"/>
                                            <MastercardIcon className="h-6"/>
                                        </div>
                                    </div>

                                    <div 
                                        onClick={() => setPaymentMethod('cod')}
                                        className={`flex items-center gap-6 p-6 border-2 cursor-pointer transition-all duration-300 ${paymentMethod === 'cod' ? 'border-brand-neon bg-brand-neon/5' : 'border-gray-200 dark:border-gray-700 hover:border-white'}`}
                                    >
                                        <div className={`w-5 h-5 border-2 flex items-center justify-center transition-colors ${paymentMethod === 'cod' ? 'border-brand-neon' : 'border-gray-500'}`}>
                                            {paymentMethod === 'cod' && <div className="w-3 h-3 bg-brand-neon"></div>}
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-bold text-gray-900 dark:text-white text-base uppercase tracking-wide">Paiement à la livraison</p>
                                            <p className="text-xs text-gray-500 uppercase">Espèces uniquement</p>
                                        </div>
                                        <div className="p-2 bg-gray-200 dark:bg-gray-800 text-gray-500"><HomeIcon className="w-5 h-5"/></div>
                                    </div>
                                </div>

                                <div className="mt-8 flex items-start gap-3 p-4 bg-black/20 border border-gray-700">
                                    <input type="checkbox" id="terms" checked={termsAgreed} onChange={(e) => setTermsAgreed(e.target.checked)} className="mt-1 h-4 w-4 text-brand-neon border-gray-600 focus:ring-brand-neon cursor-pointer bg-black" />
                                    <label htmlFor="terms" className="text-xs text-gray-400 cursor-pointer select-none uppercase tracking-wide">
                                        J'accepte les <span className="font-bold text-white underline">Conditions Générales</span>.
                                    </label>
                                </div>

                                <div className="flex justify-between items-center mt-10">
                                    <button onClick={() => setActiveStep(2)} className="text-gray-500 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors underline decoration-gray-700">Retour</button>
                                    <button 
                                        onClick={handleConfirmOrder} 
                                        disabled={!termsAgreed || isProcessing}
                                        className="bg-brand-neon text-black font-black uppercase tracking-widest text-xs px-12 py-4 hover:bg-white transition-all skew-x-[-12deg] disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-3"
                                    >
                                        <span className="skew-x-[12deg] flex items-center gap-2">
                                            {isProcessing ? 'TRAITEMENT...' : <><LockIcon className="w-4 h-4" /> PAYER {finalTotal.toFixed(3)} DT</>}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Order Summary (Sticky) */}
                    <div className="w-full lg:w-[420px] flex-shrink-0">
                        <div className="sticky top-28 bg-white dark:bg-brand-black border border-gray-100 dark:border-gray-800 shadow-xl">
                            {/* Header Ticket */}
                            <div className="bg-[#111] text-white p-6 border-b border-gray-800">
                                <h3 className="font-serif font-black italic text-xl uppercase">Votre Panier</h3>
                                <p className="text-[10px] uppercase tracking-[0.2em] mt-1 text-brand-neon font-bold">{cartItems.length} Articles</p>
                            </div>

                            <div className="p-6">
                                {/* Scrollable List */}
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar mb-6">
                                    {cartItems.map(item => (
                                        <OrderItemRow key={item.id} item={item} />
                                    ))}
                                </div>

                                {/* Divider */}
                                <div className="border-t border-dashed border-gray-700 my-6"></div>

                                {/* Totals */}
                                <div className="space-y-3 font-mono text-sm">
                                    <div className="flex justify-between text-gray-500">
                                        <span>Sous-total</span>
                                        <span className="font-bold text-white">{cartTotal.toFixed(3)} DT</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500">
                                        <span>Livraison</span>
                                        <span className={SHIPPING_COST === 0 ? 'text-brand-neon font-bold' : 'font-bold text-white'}>
                                            {SHIPPING_COST > 0 ? `${SHIPPING_COST.toFixed(3)} DT` : 'OFFERTE'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-gray-500">
                                        <span>Timbre Fiscal</span>
                                        <span className="font-bold text-white">{FISCAL_STAMP.toFixed(3)} DT</span>
                                    </div>
                                    
                                    <div className="pt-4 mt-2 border-t border-gray-700">
                                        <div className="flex justify-between items-end">
                                            <span className="font-black text-white uppercase text-base tracking-wider">Total TTC</span>
                                            <span className="font-black text-3xl text-brand-neon leading-none">
                                                {finalTotal.toFixed(3)} <span className="text-sm text-gray-500 font-bold">DT</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Security Footer */}
                            <div className="bg-black p-3 text-center border-t border-gray-800">
                                <div className="flex justify-center items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-gray-500">
                                    <LockIcon className="w-3 h-3" /> Paiement Sécurisé SSL
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
