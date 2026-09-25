
import React, { useState, useMemo } from 'react';
import type { Order } from '../../types';
import { SearchIcon, CalendarIcon, UserIcon, ShoppingBagIcon, CheckCircleIcon, ClockIcon } from '../IconComponents';

interface ViewOrdersPageProps {
    orders: Order[];
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

export const ViewOrdersPage: React.FC<ViewOrdersPageProps> = ({ orders }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = useMemo(() => orders.filter(o => 
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) || o.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    ), [orders, searchTerm]);

    return (
        <div className="p-8 bg-slate-50/50 dark:bg-brand-dark min-h-screen">
            <div className="mb-12">
                <h1 className="text-4xl font-serif font-black text-slate-900 dark:text-white uppercase tracking-tight">Dossiers <span className="text-brand-primary italic">Commandes</span></h1>
                <p className="text-slate-400 font-medium mt-2">Suivi logistique et expéditions des soins</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] mb-12 flex items-center gap-4 shadow-sm border border-slate-100 dark:border-white/5">
                <SearchIcon className="w-6 h-6 text-slate-300 ml-4" />
                <input type="text" placeholder="RECHERCHER UN DOSSIER..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-grow bg-transparent border-none text-sm font-bold placeholder-slate-300 focus:ring-0" />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 dark:border-white/5">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-black/20">
                        <tr>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">ID / Date</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Patient</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Investissement</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Statut</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                        {filtered.map(order => (
                            <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                <td className="px-10 py-8">
                                    <p className="font-mono font-bold text-slate-900 dark:text-white">#{order.id}</p>
                                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">{new Date(order.date).toLocaleDateString()}</p>
                                </td>
                                <td className="px-10 py-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-brand-light dark:bg-gray-700 rounded-xl flex items-center justify-center text-brand-primary"><UserIcon className="w-5 h-5"/></div>
                                        <span className="font-bold text-slate-700 dark:text-slate-200">{order.customerName}</span>
                                    </div>
                                </td>
                                <td className="px-10 py-8">
                                    <span className="font-black text-brand-primary text-lg">{order.total.toFixed(3)} DT</span>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase">{order.itemCount} soins</p>
                                </td>
                                <td className="px-10 py-8"><OrderStatusBadge status={order.status} /></td>
                                <td className="px-10 py-8 text-right">
                                    <button className="px-6 py-2 bg-slate-50 dark:bg-gray-700 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-primary hover:text-white transition-all">Consulter</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
