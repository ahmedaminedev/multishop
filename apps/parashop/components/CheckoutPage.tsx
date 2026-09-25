
import React, { useState, useEffect } from 'react';
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
    ArrowLongLeftIcon,
    SparklesIcon,
    ShoppingBagIcon
} from './IconComponents';
import type { CartItem, CustomerInfo, Store } from '../types';
import { api } from '../utils/api';
import { SEO } from './SEO';

interface CheckoutPageProps {
    onNavigateHome: () => void;
    onOrderComplete: (cartItems: CartItem[], customerInfo: CustomerInfo, paymentId?: string) => void;
    onNavigateToPaymentGateway: (orderId: string, total: number, customerInfo: CustomerInfo) => void;
    stores: Store[];
}

const ModernInput: React.FC<{ 
    name: string; 
    label: string; 
    value: string; 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
    type?: string;
    icon?: React.ReactNode;
}> = ({ name, label, value, onChange, type = 'text', icon }) => (
    <div className="relative w-full group">
        <div className="absolute top-1/2 -translate-y-1/2 left-5 text-slate-300 group-focus-within:text-brand-primary transition-colors z-10">
            {icon}
        </div>
        <input 
            type={type} 
            id={name} 
            name={name}
            value={value}
            onChange={onChange}
            className={`
                peer w-full h-16 bg-slate-50 border-2 border-transparent rounded-2xl 
                px-5 ${icon ? 'pl-14' : ''} pt-6 pb-2
                text-slate-900 font-bold text-sm
                placeholder-transparent outline-none transition-all duration-300
                focus:border-brand-primary/20 focus:bg-white focus:ring-4 focus:ring-brand-primary/5
            `}
            placeholder=" "
        />
        <label 
            htmlFor={name}
            className={`
                absolute left-5 ${icon ? 'left-14' : 'left-5'} top-2 
                text-[9px] uppercase font-black tracking-[0.2em] text-slate-400
                transition-all duration-300
                peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-placeholder-shown:font-bold peer-placeholder-shown:tracking-normal
                peer-focus:top-2 peer-focus:text-[9px] peer-focus:text-brand-primary peer-focus:font-black
                pointer-events-none
            `}
        >
            {label}
        </label>
    </div>
);

const StepIndicator: React.FC<{ currentStep: number }> = ({ currentStep }) => {
    const steps = [
        { id: 1, label: "Moi" },
        { id: 2, label: "Lieu" },
        { id: 3, label: "Paiement" }
    ];

    return (
        <div className="flex items-center justify-center w-full mb-12 px-4">
            {steps.map((step, index) => {
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;
                
                return (
                    <React.Fragment key={step.id}>
                        <div className="relative flex flex-col items-center group">
                            <div 
                                className={`
                                    w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-all duration-500 border-2
                                    ${isActive ? 'bg-brand-primary border-brand-primary text-white shadow-lg scale-110' : 
                                      isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 
                                      'bg-white border-slate-100 text-slate-300'}
                                `}
                            >
                                {isCompleted ? <CheckCircleIcon className="w-5 h-5"/> : step.id}
                            </div>
                            <span className={`absolute -bottom-6 text-[8px] font-black uppercase tracking-widest whitespace-nowrap transition-colors duration-300 ${isActive ? 'text-brand-primary' : 'text-slate-300'}`}>
                                {step.label}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <div className="w-8 sm:w-16 h-0.5 bg-slate-100 mx-3 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full bg-brand-primary transition-all duration-1000 ease-out`}
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
    <div className="flex items-center gap-4 py-4 border-b border-slate-50 last:border-0 group">
        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-50 flex-shrink-0 p-1 border border-slate-100 transition-transform group-hover:scale-105">
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />
            <span className="absolute top-0 right-0 bg-slate-900 text-white text-[7px] font-black px-1.5 py-0.5 rounded-bl-lg shadow-sm">
                x{item.quantity}
            </span>
        </div>
        <div className="flex-grow min-w-0">
            <h4 className="text-[10px] font-black text-slate-800 uppercase leading-tight truncate">{item.name}</h4>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Unité Pharmacologique</p>
        </div>
        <p className="text-xs font-black text-slate-900 font-mono">
            {(item.price * item.quantity).toFixed(3)}
        </p>
    </div>
);

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigateHome, onOrderComplete, stores }) => {
    const [activeStep, setActiveStep] = useState(1);
    const [formData, setFormData] = useState<CustomerInfo>({
        email: '', firstName: '', lastName: '', address: '', address2: '', postalCode: '', city: '', country: 'Tunisia', phone: '',
    });
    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('card');
    const [termsAgreed, setTermsAgreed] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const { cartItems, clearCart, cartTotal } = useCart();
    const { addToast } = useToast();
    
    const SHIPPING_COST = cartTotal >= 120 ? 0 : 7.000;
    const FISCAL_STAMP = 1.000;
    const finalTotal = cartTotal + SHIPPING_COST + FISCAL_STAMP;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [activeStep]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNext = () => {
        if (activeStep === 1 && (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) || !formData.firstName || !formData.lastName)) {
            addToast("Informations d'identité incomplètes.", "warning"); return;
        }
        if (activeStep === 2 && (!formData.address || !formData.city || !formData.phone)) {
            addToast("Adresse de livraison requise.", "warning"); return;
        }
        setActiveStep(prev => prev + 1);
    };

    const handleConfirmOrder = async () => {
        if (!termsAgreed) { addToast("Veuillez accepter les conditions.", "warning"); return; }
        setIsProcessing(true);
        try {
            const orderId = 'PN' + Date.now().toString().slice(-6);
            if (paymentMethod === 'cod') {
                clearCart();
                window.location.href = `/?payment=success&orderId=${orderId}`;
            } else {
                const response = await api.initiatePayment({ orderId, amount: finalTotal, customerInfo: formData });
                if (response?.payment_url) window.location.href = response.payment_url;
            }
        } catch (error) {
            addToast("Erreur lors de la validation.", "error");
            setIsProcessing(false);
        }
    };

    return (
        <div className="bg-[#fcfdfa] min-h-screen font-sans pb-32">
            <SEO title="Validation" description="Finalisez votre protocole." />
            
            {/* Nav Minimal */}
            <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
                <div className="max-w-screen-xl mx-auto px-6 h-20 flex items-center justify-between">
                    <button onClick={onNavigateHome} className="flex items-center gap-2 text-slate-400 hover:text-brand-primary transition-all font-black uppercase text-[9px] tracking-widest group">
                        <ArrowLongLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform"/>
                        Retour
                    </button>
                    <div className="text-center">
                        <p className="font-serif font-black text-lg text-slate-900 uppercase">Confirmation <span className="text-brand-primary">Cure</span></p>
                    </div>
                    <div className="w-16"></div>
                </div>
            </nav>

            <div className="max-w-screen-xl mx-auto px-6 py-12">
                <StepIndicator currentStep={activeStep} />

                <div className="flex flex-col lg:flex-row gap-12 items-start">
                    
                    {/* Colonne Formulaire */}
                    <main className="flex-grow w-full lg:max-w-[700px] animate-fadeIn">
                        
                        {activeStep === 1 && (
                            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
                                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-8">Votre Identité</h2>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <ModernInput name="firstName" label="Prénom" icon={<UserIcon className="w-5 h-5"/>} value={formData.firstName} onChange={handleInputChange} />
                                        <ModernInput name="lastName" label="Nom" icon={<UserIcon className="w-5 h-5"/>} value={formData.lastName} onChange={handleInputChange} />
                                    </div>
                                    <ModernInput name="email" label="Adresse E-mail" type="email" icon={<MailIcon className="w-5 h-5"/>} value={formData.email} onChange={handleInputChange} />
                                </div>
                                <div className="flex justify-end mt-12">
                                    <button onClick={handleNext} className="bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] px-12 py-5 rounded-2xl hover:bg-brand-primary transition-all shadow-lg">
                                        Suivant
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeStep === 2 && (
                            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
                                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-8">Lieu de Livraison</h2>
                                <div className="space-y-6">
                                    <ModernInput name="address" label="Adresse de réception" icon={<LocationIcon className="w-5 h-5"/>} value={formData.address} onChange={handleInputChange} />
                                    <div className="grid grid-cols-2 gap-6">
                                        <ModernInput name="city" label="Ville" value={formData.city} onChange={handleInputChange} />
                                        <ModernInput name="postalCode" label="Code Postal" value={formData.postalCode} onChange={handleInputChange} />
                                    </div>
                                    <ModernInput name="phone" label="Mobile" type="tel" icon={<PhoneIcon className="w-5 h-5"/>} value={formData.phone} onChange={handleInputChange} />
                                </div>
                                <div className="flex justify-between items-center mt-12">
                                    <button onClick={() => setActiveStep(1)} className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Retour</button>
                                    <button onClick={handleNext} className="bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] px-12 py-5 rounded-2xl hover:bg-brand-primary transition-all">
                                        Paiement
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeStep === 3 && (
                            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
                                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-8">Paiement</h2>
                                <div className="space-y-4">
                                    <button onClick={() => setPaymentMethod('card')} className={`w-full flex items-center gap-5 p-6 rounded-2xl border-2 transition-all ${paymentMethod === 'card' ? 'border-brand-primary bg-brand-light/20' : 'border-slate-50'}`}>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'card' ? 'border-brand-primary bg-brand-primary' : 'border-slate-200'}`}>{paymentMethod === 'card' && <div className="w-2 h-2 bg-white rounded-full"></div>}</div>
                                        <div className="flex-grow text-left"><p className="font-bold text-slate-900 text-sm">Carte Bancaire (Paymee)</p></div>
                                        <VisaIcon className="h-4"/>
                                    </button>
                                    <button onClick={() => setPaymentMethod('cod')} className={`w-full flex items-center gap-5 p-6 rounded-2xl border-2 transition-all ${paymentMethod === 'cod' ? 'border-brand-primary bg-brand-light/20' : 'border-slate-50'}`}>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-brand-primary bg-brand-primary' : 'border-slate-200'}`}>{paymentMethod === 'cod' && <div className="w-2 h-2 bg-white rounded-full"></div>}</div>
                                        <div className="flex-grow text-left"><p className="font-bold text-slate-900 text-sm">Espèces à la livraison</p></div>
                                        <HomeIcon className="w-5 h-5 text-slate-400"/>
                                    </button>
                                </div>
                                <div className="mt-8 flex items-start gap-3 p-6 bg-slate-50 rounded-2xl">
                                    <input type="checkbox" id="terms" checked={termsAgreed} onChange={(e) => setTermsAgreed(e.target.checked)} className="mt-1 h-4 w-4 text-brand-primary rounded" />
                                    <label htmlFor="terms" className="text-[10px] text-slate-500 leading-relaxed font-medium cursor-pointer">J'accepte les conditions générales de vente et la politique de confidentialité PharmaNature.</label>
                                </div>
                                <div className="flex justify-between items-center mt-12">
                                    <button onClick={() => setActiveStep(2)} className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Retour</button>
                                    <button onClick={handleConfirmOrder} disabled={!termsAgreed || isProcessing} className="bg-brand-primary text-white font-black uppercase tracking-widest text-[10px] px-12 py-5 rounded-2xl shadow-xl shadow-brand-primary/20 hover:bg-brand-primaryHover disabled:opacity-50 transition-all">
                                        {isProcessing ? 'Traitement...' : 'Confirmer ma commande'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </main>

                    {/* Récapitulatif - Design Aéré & Scroll Propre */}
                    <aside className="w-full lg:w-[400px] shrink-0">
                        <div className="sticky top-28 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                            <div className="p-8 pb-4">
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">Votre Set de Soin</h3>
                                <div className="max-h-[300px] overflow-y-auto pr-2 checkout-scrollbar">
                                    {cartItems.map(item => (
                                        <OrderItemRow key={item.id} item={item} />
                                    ))}
                                </div>
                            </div>

                            <div className="p-8 pt-0 space-y-4">
                                <div className="border-t border-dashed border-slate-100 pt-6 space-y-3">
                                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <span>Articles</span>
                                        <span>{cartTotal.toFixed(3)} DT</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <span>Logistique</span>
                                        <span className={SHIPPING_COST === 0 ? 'text-emerald-500' : ''}>{SHIPPING_COST === 0 ? 'OFFERTE' : '7.000 DT'}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <span>Timbre</span>
                                        <span>1.000 DT</span>
                                    </div>
                                </div>
                                
                                <div className="pt-6 mt-4 border-t-2 border-slate-50 flex justify-between items-end">
                                    <div>
                                        <p className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em]">Total Final</p>
                                        <p className="text-[8px] text-slate-300 font-bold uppercase mt-1">Paiement 100% sécurisé</p>
                                    </div>
                                    <span className="text-3xl font-serif font-black text-slate-900 tracking-tighter">
                                        {finalTotal.toFixed(3)} <span className="text-xs font-sans text-slate-400">DT</span>
                                    </span>
                                </div>
                            </div>
                            
                            <div className="bg-slate-50 p-6 flex justify-center items-center gap-4 opacity-30 grayscale grayscale-100">
                                <VisaIcon className="h-3"/>
                                <MastercardIcon className="h-5"/>
                                <LockIcon className="w-3 h-3"/>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            <style>{`
                .checkout-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .checkout-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .checkout-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 20px;
                }
                .checkout-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </div>
    );
};
