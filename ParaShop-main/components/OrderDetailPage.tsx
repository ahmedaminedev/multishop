
import React, { useState } from 'react';
import type { Order, Product } from '../types';
import { useCart } from './CartContext';
import { 
    ShoppingBagIcon, 
    DeliveryTruckIcon, 
    CheckCircleIcon, 
    CreditCardIcon, 
    LocationIcon, 
    PrinterIcon, 
    UserIcon, 
    ArrowLongLeftIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    SparklesIcon,
    XMarkIcon
} from './IconComponents';
import { Invoice } from './Invoice';
import { Logo } from './Logo';

interface OrderDetailPageProps {
    order: Order;
    allProducts: Product[];
    onNavigateHome: () => void;
    onNavigateToOrderHistory: () => void;
    onNavigateToProductDetail: (productId: number) => void;
}

const OrderStatusBadge: React.FC<{ status: Order['status'] }> = ({ status }) => {
    const statusConfig = {
        'Livrée': { bg: 'bg-emerald-50 text-emerald-600', icon: <CheckCircleIcon className="w-4 h-4"/> },
        'Expédiée': { bg: 'bg-blue-50 text-blue-600', icon: <DeliveryTruckIcon className="w-4 h-4"/> },
        'En attente': { bg: 'bg-brand-light text-brand-primary', icon: <ShoppingBagIcon className="w-4 h-4"/> },
        'Annulée': { bg: 'bg-rose-50 text-rose-600', icon: <XMarkIcon className="w-4 h-4"/> }
    };
    const config = statusConfig[status] || statusConfig['En attente'];
    return (
        <span className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${config.bg} border border-current/10 shadow-sm`}>
            {config.icon} {status}
        </span>
    );
};

export const OrderDetailPage: React.FC<OrderDetailPageProps> = ({ order, onNavigateToOrderHistory, onNavigateToProductDetail }) => {
    const [isInvoiceVisible, setIsInvoiceVisible] = useState(false);

    return (
        <div className="bg-brand-bg dark:bg-brand-dark min-h-screen pb-32 transition-colors duration-500">
            <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-12">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16">
                    <div>
                        <button onClick={onNavigateToOrderHistory} className="flex items-center gap-3 text-slate-400 hover:text-brand-primary mb-8 font-black uppercase text-[10px] tracking-widest group">
                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-all"><ArrowLongLeftIcon className="w-4 h-4"/></div> 
                            Archives Patient
                        </button>
                        <h1 className="text-4xl md:text-6xl font-serif font-black text-slate-900 dark:text-white leading-none tracking-tighter uppercase">Dossier <span className="text-brand-primary italic">#{order.id}</span></h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsInvoiceVisible(true)} className="flex items-center gap-3 px-8 py-3 bg-white dark:bg-gray-800 border border-slate-100 dark:border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-brand-primary transition-all shadow-sm">
                            <PrinterIcon className="w-4 h-4" /> Facture Officielle
                        </button>
                        <OrderStatusBadge status={order.status} />
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
                    {/* Colonne Principale */}
                    <div className="xl:col-span-8 space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-10 shadow-xl border border-slate-50 dark:border-white/5">
                            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-brand-primary mb-10 flex items-center gap-4">
                                <div className="w-2 h-6 bg-brand-primary rounded-full"></div>
                                Composition du Protocole
                            </h3>
                            <div className="space-y-4">
                                {order.items.map((item, idx) => (
                                    <div key={idx} onClick={() => onNavigateToProductDetail(item.productId)} className="group flex items-center justify-between p-6 rounded-[2rem] bg-slate-50/50 dark:bg-white/5 border border-transparent hover:border-brand-primary/20 hover:bg-white transition-all cursor-pointer">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-white dark:bg-brand-dark rounded-2xl p-2 shadow-sm overflow-hidden flex-shrink-0">
                                                <img src={item.imageUrl} className="w-full h-full object-cover rounded-lg" />
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Unité Scientifique</p>
                                                <p className="font-bold text-base text-slate-900 dark:text-white uppercase leading-tight">{item.name}</p>
                                                <p className="text-xs font-bold text-brand-primary mt-1">x{item.quantity}</p>
                                            </div>
                                        </div>
                                        <p className="text-lg font-black text-slate-900 dark:text-white font-mono">{(item.price * item.quantity).toFixed(3)} <span className="text-[10px]">DT</span></p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* NOTE CLINIQUE (Réutilisation du design du détail produit) */}
                        <div className="relative p-10 bg-brand-light/40 dark:bg-white/5 rounded-[2.5rem] border-l-8 border-brand-primary overflow-hidden">
                             <div className="absolute top-0 right-0 p-8 opacity-5 text-brand-primary"><SparklesIcon className="w-32 h-32"/></div>
                             <div className="relative z-10 flex items-center gap-8">
                                <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-brand-primary shadow-sm flex-shrink-0"><SparklesIcon className="w-8 h-8" /></div>
                                <div>
                                    <h4 className="text-xl font-serif font-bold text-slate-900 dark:text-white uppercase">Guide de Conservation</h4>
                                    <p className="text-sm text-slate-500 italic mt-2 leading-relaxed">"Conservez vos soins dans un endroit frais et sec, à l'abri de la lumière directe pour préserver l'intégrité des principes actifs botaniques."</p>
                                </div>
                             </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <aside className="xl:col-span-4 space-y-8">
                        <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-10 shadow-xl border border-slate-50 dark:border-white/5">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-2xl flex items-center justify-center"><LocationIcon className="w-6 h-6"/></div>
                                <h3 className="text-sm font-black uppercase tracking-widest">Réception</h3>
                            </div>
                            <div className="space-y-8">
                                <div>
                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">Destinataire</p>
                                    <p className="font-bold text-slate-900 dark:text-white text-lg">{order.customerName}</p>
                                    <p className="text-slate-400 font-medium mt-1 leading-relaxed uppercase text-[10px] tracking-widest">{order.shippingAddress.street}<br/>{order.shippingAddress.postalCode} {order.shippingAddress.city}</p>
                                </div>
                                <div className="pt-8 border-t border-slate-50 dark:border-white/5">
                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-3">Paiement</p>
                                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100">
                                        <CreditCardIcon className="w-5 h-5 text-brand-primary"/>
                                        <p className="font-black text-slate-900 dark:text-white uppercase text-[10px] tracking-widest">{order.paymentMethod}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-brand-dark text-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12"><SparklesIcon className="w-48 h-48"/></div>
                            <h3 className="text-xl font-serif font-black mb-10 border-b border-white/5 pb-6">Bilan Protocole</h3>
                            <div className="space-y-5 font-mono text-sm mb-10">
                                <div className="flex justify-between text-slate-400"><span>Actifs cumulés</span><span>{order.total.toFixed(3)} DT</span></div>
                                <div className="flex justify-between text-slate-400"><span>Logistique 48h</span><span>OFFERTE</span></div>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-sm font-black uppercase tracking-widest">Total Net</span>
                                <span className="text-5xl font-serif font-black text-brand-primary tracking-tighter">{order.total.toFixed(3)} <span className="text-xs font-sans">DT</span></span>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
            {isInvoiceVisible && <Invoice order={order} onClose={() => setIsInvoiceVisible(false)} />}
        </div>
    );
};
