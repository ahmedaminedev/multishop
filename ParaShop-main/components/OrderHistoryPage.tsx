
import React, { useState, useMemo, useEffect } from 'react';
import type { Order } from '../types';
import { Breadcrumb } from './Breadcrumb';
import { ShoppingBagIcon, CalendarIcon, SearchIcon, ChevronRightIcon, ClockIcon, CheckCircleIcon } from './IconComponents';

interface OrderHistoryPageProps {
    orders: Order[];
    onNavigateHome: () => void;
    onNavigateToProfile: () => void;
    onNavigateToOrderDetail: (orderId: string) => void;
}

const OrderStatusBadge: React.FC<{ status: Order['status'] }> = ({ status }) => {
    const config = {
        'Livrée': 'bg-emerald-50 text-emerald-600 border-emerald-100',
        'Expédiée': 'bg-blue-50 text-blue-600 border-blue-100',
        'En attente': 'bg-amber-50 text-amber-600 border-amber-100',
        'Annulée': 'bg-rose-50 text-rose-600 border-rose-100'
    }[status] || 'bg-slate-50 text-slate-600 border-slate-100';
    return <span className={`${config} px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border`}>{status}</span>;
};

const OrderHistoryCard: React.FC<{ order: Order; onNavigateToOrderDetail: (orderId: string) => void; }> = ({ order, onNavigateToOrderDetail }) => {
    return (
        <div 
            onClick={() => onNavigateToOrderDetail(order.id)}
            className="group bg-white dark:bg-brand-dark rounded-[2.5rem] border border-slate-100 dark:border-white/5 p-8 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer overflow-hidden relative"
        >
            <div className="absolute top-0 left-0 w-2 h-full bg-brand-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center font-serif font-black text-xl text-slate-300 group-hover:bg-brand-primary group-hover:text-white transition-all shadow-sm">
                        #{order.id.slice(-2)}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-xl uppercase tracking-tighter">Dossier <span className="text-slate-400 font-mono text-sm">#{order.id}</span></h3>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                            <CalendarIcon className="w-3.5 h-3.5" />
                            {new Date(order.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-10 w-full md:w-auto">
                    <div className="flex -space-x-4">
                        {order.items.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="w-12 h-12 rounded-xl border-4 border-white dark:border-brand-dark bg-slate-50 dark:bg-gray-800 overflow-hidden shadow-sm">
                                <img src={item.imageUrl} className="w-full h-full object-cover" />
                            </div>
                        ))}
                        {order.items.length > 3 && (
                            <div className="w-12 h-12 rounded-xl border-4 border-white dark:border-brand-dark bg-brand-primary text-white flex items-center justify-center text-[10px] font-black">
                                +{order.items.length - 3}
                            </div>
                        )}
                    </div>

                    <div className="text-left md:text-right">
                        <p className="text-[9px] text-slate-300 font-black uppercase tracking-widest mb-1">Montant Total</p>
                        <p className="font-black text-2xl text-brand-primary tracking-tighter">{order.total.toFixed(3)} <span className="text-xs">DT</span></p>
                    </div>

                    <OrderStatusBadge status={order.status} />

                    <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-gray-800 flex items-center justify-center text-slate-300 group-hover:bg-brand-primary group-hover:text-white transition-all shadow-sm">
                        <ChevronRightIcon className="w-6 h-6" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export const OrderHistoryPage: React.FC<OrderHistoryPageProps> = ({ orders, onNavigateHome, onNavigateToProfile, onNavigateToOrderDetail }) => {
    useEffect(() => {
        document.title = `Mes Cures - PharmaNature`;
        window.scrollTo(0,0);
    }, []);

    return (
        <div className="bg-brand-bg dark:bg-brand-dark min-h-screen pb-32 transition-colors duration-500">
            <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-12">
                <div className="mb-12">
                    <Breadcrumb items={[{ name: 'Accueil', onClick: onNavigateHome }, { name: 'Espace Patient', onClick: onNavigateToProfile }, { name: 'Mes Cures' }]} />
                </div>

                <header className="mb-20">
                    <span className="text-brand-primary font-black uppercase tracking-[0.5em] text-[10px] mb-4 block">Archives Patient</span>
                    <h1 className="text-5xl md:text-7xl font-serif font-black text-slate-900 dark:text-white tracking-tighter uppercase">
                        Suivi de mes <span className="text-brand-primary italic">Protocoles</span>
                    </h1>
                </header>

                {orders.length > 0 ? (
                    <div className="space-y-8 animate-fadeIn">
                        {orders.map(order => (
                            <OrderHistoryCard key={order.id} order={order} onNavigateToOrderDetail={onNavigateToOrderDetail} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-40 bg-white dark:bg-gray-800 rounded-[4rem] border border-dashed border-slate-200">
                        <ShoppingBagIcon className="w-16 h-16 mx-auto mb-8 text-slate-100" />
                        <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-4 uppercase">Aucune commande active</h2>
                        <button onClick={onNavigateHome} className="bg-brand-primary text-white font-black py-4 px-12 rounded-2xl shadow-xl shadow-brand-primary/20 hover:bg-brand-primaryHover transition-all uppercase text-xs tracking-widest">Commencer un protocole</button>
                    </div>
                )}
            </div>
        </div>
    );
};
