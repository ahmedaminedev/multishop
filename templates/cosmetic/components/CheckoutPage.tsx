
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
        <div className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400 group-focus-within:text-rose-600 transition-colors z-10">
            {icon}
        </div>
        <input 
            type={type} 
            id={name} 
            name={name}
            value={value}
            onChange={onChange}
            className={`
                peer w-full h-14 bg-white dark:bg-gray-800 
                border-2 border-gray-200 dark:border-gray-700 rounded-xl 
                px-4 ${icon ? 'pl-12' : ''} pt-4 pb-1
                text-gray-900 dark:text-white font-medium
                placeholder-transparent outline-none transition-all duration-300
                focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10
                shadow-sm hover:border-gray-300 dark:hover:border-gray-600
            `}
            placeholder={placeholder}
        />
        <label 
            htmlFor={name}
            className={`
                absolute left-4 ${icon ? 'left-12' : 'left-4'} top-1 
                text-[10px] uppercase font-bold tracking-wider text-gray-500 dark:text-gray-400
                transition-all duration-300
                peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-placeholder-shown:capitalize peer-placeholder-shown:font-normal peer-placeholder-shown:tracking-normal
                peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-rose-500 peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-wider
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
                                    w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 border-2
                                    ${isActive ? 'bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-200 scale-110' : 
                                      isCompleted ? 'bg-green-500 border-green-500 text-white' : 
                                      'bg-white border-gray-200 text-gray-300'}
                                `}
                            >
                                {isCompleted ? <CheckCircleIcon className="w-6 h-6"/> : step.id}
                            </div>
                            <span className={`absolute -bottom-6 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors duration-300 ${isActive ? 'text-rose-600' : isCompleted ? 'text-green-500' : 'text-gray-300'}`}>
                                {step.label}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <div className="w-16 sm:w-32 h-0.5 bg-gray-100 mx-2 relative overflow-hidden rounded-full">
                                <div 
                                    className={`absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 transition-all duration-700 ease-out`}
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
    <div className="flex items-center gap-4 py-3 border-b border-dashed border-gray-100 dark:border-gray-700 last:border-0">
        <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-gray-100 bg-white flex-shrink-0">
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
            <span className="absolute bottom-0 right-0 bg-black text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-tl-md font-bold">
                {item.quantity}
            </span>
        </div>
        <div className="flex-grow min-w-0">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{item.name}</p>
            {item.selectedColor && <p className="text-xs text-gray-400">{item.selectedColor}</p>}
        </div>
        <p className="text-sm font-bold text-gray-900 dark:text-white font-serif">
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
            const orderId = 'ES' + Date.now().toString().slice(-8).toUpperCase();
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
        <div className="bg-[#F8F9FA] dark:bg-gray-950 min-h-screen font-sans pb-24">
            {/* Header Minimaliste */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-30 shadow-sm/50 backdrop-blur-md bg-white/80">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <button onClick={onNavigateHome} className="flex items-center gap-3 text-gray-500 hover:text-gray-900 transition-colors group">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-rose-50 group-hover:text-rose-500 transition-colors">
                            <ArrowLongLeftIcon className="w-5 h-5"/>
                        </div>
                        <span className="text-sm font-bold uppercase tracking-wider">Retour Boutique</span>
                    </button>
                    <div className="font-serif font-bold text-xl text-gray-900 dark:text-white">Validation Commande</div>
                    <div className="w-32"></div> {/* Spacer for centering */}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <StepIndicator currentStep={activeStep} />

                <div className="flex flex-col lg:flex-row gap-12">
                    
                    {/* Left Column: Interactive Forms */}
                    <div className="flex-grow max-w-4xl space-y-8 animate-fadeIn">
                        
                        {activeStep === 1 && (
                            <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-gray-800">
                                <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-8">Vos Coordonnées</h2>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <ModernInput name="firstName" label="Prénom" icon={<UserIcon className="w-5 h-5"/>} value={formData.firstName} onChange={handleInputChange} />
                                        <ModernInput name="lastName" label="Nom" icon={<UserIcon className="w-5 h-5"/>} value={formData.lastName} onChange={handleInputChange} />
                                    </div>
                                    <ModernInput name="email" label="Adresse E-mail" type="email" icon={<MailIcon className="w-5 h-5"/>} value={formData.email} onChange={handleInputChange} />
                                </div>
                                <div className="flex justify-end mt-10">
                                    <button onClick={handleNext} className="bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-xs px-12 py-4 rounded-full hover:bg-rose-600 dark:hover:bg-rose-500 dark:hover:text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                                        Continuer vers la livraison
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeStep === 2 && (
                            <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-gray-800">
                                <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-8">Adresse de Livraison</h2>
                                <div className="space-y-6">
                                    <ModernInput name="address" label="Adresse (Rue, Appt...)" icon={<LocationIcon className="w-5 h-5"/>} value={formData.address} onChange={handleInputChange} />
                                    <div className="grid grid-cols-2 gap-6">
                                        <ModernInput name="city" label="Ville" value={formData.city} onChange={handleInputChange} />
                                        <ModernInput name="postalCode" label="Code Postal" value={formData.postalCode} onChange={handleInputChange} />
                                    </div>
                                    <ModernInput name="phone" label="Téléphone (8 chiffres)" type="tel" icon={<PhoneIcon className="w-5 h-5"/>} value={formData.phone} onChange={handleInputChange} />
                                    
                                    <div className="mt-10">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Méthode d'expédition</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div 
                                                onClick={() => setShippingOption('transporteur-tunisie')}
                                                className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 group overflow-hidden ${shippingOption === 'transporteur-tunisie' ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-900/10' : 'border-gray-200 dark:border-gray-700 hover:border-rose-200'}`}
                                            >
                                                <div className="flex justify-between items-center mb-2 relative z-10">
                                                    <span className="font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                                        <div className={`p-2 rounded-full ${shippingOption === 'transporteur-tunisie' ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                            <DeliveryTruckIcon className="w-5 h-5"/>
                                                        </div>
                                                        Livraison Domicile
                                                    </span>
                                                    <span className="font-bold text-rose-600">{cartTotal >= 300 ? 'Gratuit' : '7 DT'}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 pl-11 relative z-10">Livraison rapide 24-48h partout en Tunisie.</p>
                                                {shippingOption === 'transporteur-tunisie' && <div className="absolute inset-0 border-2 border-rose-500 rounded-2xl pointer-events-none"></div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mt-10">
                                    <button onClick={() => setActiveStep(1)} className="text-gray-500 font-bold text-sm hover:text-gray-900 dark:hover:text-white transition-colors underline decoration-transparent hover:decoration-gray-500">Retour</button>
                                    <button onClick={handleNext} className="bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-xs px-12 py-4 rounded-full hover:bg-rose-600 dark:hover:bg-rose-500 dark:hover:text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                                        Procéder au paiement
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeStep === 3 && (
                            <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-gray-800">
                                <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-8">Moyen de Paiement</h2>
                                <div className="space-y-4">
                                    <div 
                                        onClick={() => setPaymentMethod('card')}
                                        className={`flex items-center gap-6 p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${paymentMethod === 'card' ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-900/10 shadow-md' : 'border-gray-200 dark:border-gray-700 hover:border-rose-200'}`}
                                    >
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${paymentMethod === 'card' ? 'border-rose-600' : 'border-gray-300'}`}>
                                            {paymentMethod === 'card' && <div className="w-3 h-3 bg-rose-600 rounded-full"></div>}
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-bold text-gray-900 dark:text-white text-lg">Carte Bancaire</p>
                                            <p className="text-sm text-gray-500">Sécurisé par Paymee. CIB, Visa, Mastercard.</p>
                                        </div>
                                        <div className="flex gap-2 opacity-80">
                                            <VisaIcon className="h-8"/>
                                            <MastercardIcon className="h-8"/>
                                        </div>
                                    </div>

                                    <div 
                                        onClick={() => setPaymentMethod('cod')}
                                        className={`flex items-center gap-6 p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${paymentMethod === 'cod' ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-900/10 shadow-md' : 'border-gray-200 dark:border-gray-700 hover:border-rose-200'}`}
                                    >
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${paymentMethod === 'cod' ? 'border-rose-600' : 'border-gray-300'}`}>
                                            {paymentMethod === 'cod' && <div className="w-3 h-3 bg-rose-600 rounded-full"></div>}
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-bold text-gray-900 dark:text-white text-lg">Paiement à la livraison</p>
                                            <p className="text-sm text-gray-500">Payez en espèces à la réception de votre colis.</p>
                                        </div>
                                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500"><HomeIcon className="w-6 h-6"/></div>
                                    </div>
                                </div>

                                <div className="mt-8 flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                                    <input type="checkbox" id="terms" checked={termsAgreed} onChange={(e) => setTermsAgreed(e.target.checked)} className="mt-1 h-5 w-5 text-rose-600 rounded border-gray-300 focus:ring-rose-500 cursor-pointer" />
                                    <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-300 cursor-pointer select-none">
                                        J'accepte les <span className="font-bold text-gray-900 dark:text-white underline">Conditions Générales de Vente</span> et la politique de confidentialité.
                                    </label>
                                </div>

                                <div className="flex justify-between items-center mt-10">
                                    <button onClick={() => setActiveStep(2)} className="text-gray-500 font-bold text-sm hover:text-gray-900 dark:hover:text-white transition-colors underline decoration-transparent hover:decoration-gray-500">Retour</button>
                                    <button 
                                        onClick={handleConfirmOrder} 
                                        disabled={!termsAgreed || isProcessing}
                                        className="bg-rose-600 text-white font-bold uppercase tracking-widest text-xs px-12 py-4 rounded-full hover:bg-rose-700 hover:shadow-xl hover:shadow-rose-500/30 transition-all disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed transform hover:-translate-y-1 flex items-center gap-3"
                                    >
                                        {isProcessing ? 'Traitement...' : <><LockIcon className="w-4 h-4" /> Payer {finalTotal.toFixed(3)} DT</>}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Order Summary (Sticky) */}
                    <div className="w-full lg:w-[420px] flex-shrink-0">
                        <div className="sticky top-28 bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 overflow-hidden">
                            {/* Header Ticket */}
                            <div className="bg-[#111827] text-white p-8 text-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                                <h3 className="font-serif font-bold text-2xl relative z-10">Votre Panier</h3>
                                <p className="text-xs uppercase tracking-[0.2em] mt-2 text-gray-400 relative z-10">{cartItems.length} Articles</p>
                                {/* Circle decoration */}
                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-gray-900 rounded-full z-10"></div>
                            </div>

                            <div className="p-8">
                                {/* Scrollable List */}
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar mb-8">
                                    {cartItems.map(item => (
                                        <OrderItemRow key={item.id} item={item} />
                                    ))}
                                </div>

                                {/* Divider */}
                                <div className="border-t-2 border-dashed border-gray-200 dark:border-gray-700 my-6 relative">
                                    <div className="absolute -left-10 -top-3 w-6 h-6 bg-[#F8F9FA] dark:bg-gray-950 rounded-full"></div>
                                    <div className="absolute -right-10 -top-3 w-6 h-6 bg-[#F8F9FA] dark:bg-gray-950 rounded-full"></div>
                                </div>

                                {/* Totals */}
                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                                        <span>Sous-total</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{cartTotal.toFixed(3)} DT</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                                        <span>Livraison</span>
                                        <span className={SHIPPING_COST === 0 ? 'text-green-600 font-bold' : 'font-medium text-gray-900 dark:text-white'}>
                                            {SHIPPING_COST > 0 ? `${SHIPPING_COST.toFixed(3)} DT` : 'OFFERTE'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                                        <span>Timbre Fiscal</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{FISCAL_STAMP.toFixed(3)} DT</span>
                                    </div>
                                    
                                    <div className="pt-6 mt-4 border-t border-gray-100 dark:border-gray-700">
                                        <div className="flex justify-between items-end">
                                            <span className="font-bold text-gray-900 dark:text-white text-lg">Total TTC</span>
                                            <span className="font-serif font-extrabold text-4xl text-rose-600 leading-none">
                                                {finalTotal.toFixed(3)} <span className="text-sm font-sans font-medium text-gray-400">DT</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Security Footer */}
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 text-center border-t border-gray-100 dark:border-gray-800">
                                <div className="flex justify-center items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    <LockIcon className="w-3 h-3" /> Paiement 100% Sécurisé
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
