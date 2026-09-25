
import React, { useState, useMemo, useEffect } from 'react';
import type { Order } from '../types';
import { Breadcrumb } from './Breadcrumb';
import { ShoppingBagIcon, CalendarIcon, SearchIcon, ChevronRightIcon, ClockIcon } from './IconComponents';

interface OrderHistoryPageProps {
    orders: Order[];
    onNavigateHome: () => void;
    onNavigateToProfile: () => void;
    onNavigateToOrderDetail: (orderId: string) => void;
}

const OrderStatusBadge: React.FC<{ status: Order['status'] }> = ({ status }) => {
    const statusConfig = {
        'Livrée': { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', icon: '●' },
        'Expédiée': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', icon: '✈' },
        'En attente': { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', icon: '⏳' },
        'Annulée': { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-400', icon: '✕' }
    };
    
    const config = statusConfig[status] || statusConfig['En attente'];

    return (
        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${config.bg} ${config.text}`}>
            <span className="text-[10px]">{config.icon}</span> {status}
        </span>
    );
};

const OrderStatCard: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-gray-700 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-500">
            {icon}
        </div>
        <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold">{label}</p>
            <p className="text-2xl font-serif font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);

const OrderHistoryCard: React.FC<{ order: Order; onNavigateToOrderDetail: (orderId: string) => void; }> = ({ order, onNavigateToOrderDetail }) => {
    // Afficher jusqu'à 4 images d'aperçu
    const previewItems = order.items.slice(0, 4);
    const remainingCount = order.items.length - 4;

    return (
        <div 
            onClick={() => onNavigateToOrderDetail(order.id)}
            className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-rose-100/50 dark:hover:shadow-none hover:-translate-y-1 cursor-pointer"
        >
            {/* Header de la carte */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 pb-6 border-b border-gray-50 dark:border-gray-700/50">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-center font-serif font-bold text-lg text-gray-400 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                        #{order.id.slice(-2)}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">Commande <span className="font-mono text-gray-500 dark:text-gray-400 text-base">#{order.id}</span></h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                            <CalendarIcon className="w-3.5 h-3.5" />
                            {new Date(order.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </div>
                <OrderStatusBadge status={order.status} />
            </div>

            {/* Contenu visuel */}
            <div className="flex flex-col md:flex-row gap-6 md:items-center">
                
                {/* Aperçu des produits (Stack d'images) */}
                <div className="flex-grow">
                    <div className="flex items-center gap-2">
                        {previewItems.map((item, idx) => (
                            <div key={idx} className="relative w-14 h-14 rounded-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-700 p-1 overflow-hidden">
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-md" />
                            </div>
                        ))}
                        {remainingCount > 0 && (
                            <div className="w-14 h-14 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-300">
                                +{remainingCount}
                            </div>
                        )}
                        {order.items.length === 0 && (
                            <span className="text-xs text-gray-400 italic">Détails non disponibles</span>
                        )}
                    </div>
                </div>

                {/* Totaux et Action */}
                <div className="flex items-center justify-between md:justify-end gap-8 pt-4 md:pt-0 border-t md:border-t-0 border-gray-50 dark:border-gray-700/50">
                    <div className="text-left md:text-right">
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Montant Total</p>
                        <p className="font-serif font-bold text-xl text-gray-900 dark:text-white">{order.total.toFixed(3)} <span className="text-xs font-sans text-gray-500">DT</span></p>
                    </div>
                    <div className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:border-black group-hover:text-white transition-all">
                        <ChevronRightIcon className="w-5 h-5" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export const OrderHistoryPage: React.FC<OrderHistoryPageProps> = ({ orders, onNavigateHome, onNavigateToProfile, onNavigateToOrderDetail }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<Order['status'] | 'all'>('all');

    useEffect(() => {
        document.title = `Mes Commandes - Cosmetics Shop`;
        window.scrollTo(0,0);
    }, []);

    const filteredOrders = useMemo(() => {
        return orders
            .filter(o => filterStatus === 'all' || o.status === filterStatus)
            .filter(o => 
                o.id.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [orders, searchTerm, filterStatus]);

    const orderStatuses: Order['status'][] = ['En attente', 'Expédiée', 'Livrée', 'Annulée'];

    // Calcul des statistiques
    const totalSpent = useMemo(() => orders.reduce((acc, o) => acc + o.total, 0), [orders]);
    const activeOrders = useMemo(() => orders.filter(o => o.status === 'En attente' || o.status === 'Expédiée').length, [orders]);

    return (
        <div className="bg-[#F9FAFB] dark:bg-gray-950 min-h-screen">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <Breadcrumb items={[{ name: 'Accueil', onClick: onNavigateHome }, { name: 'Mon Compte', onClick: onNavigateToProfile }, { name: 'Historique' }]} />
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-white mb-2">Mes Commandes</h1>
                        <p className="text-gray-500 dark:text-gray-400 font-light">Retrouvez l'historique et le suivi de vos achats.</p>
                    </div>
                    
                    {/* Stats Rapides */}
                    <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0">
                        <div className="bg-white dark:bg-gray-800 px-5 py-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-3 min-w-[140px]">
                            <div className="p-2 bg-rose-50 rounded-lg text-rose-500"><ShoppingBagIcon className="w-4 h-4"/></div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase">Total</p>
                                <p className="font-bold text-gray-900 dark:text-white">{orders.length}</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 px-5 py-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-3 min-w-[140px]">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-500"><ClockIcon className="w-4 h-4"/></div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase">En cours</p>
                                <p className="font-bold text-gray-900 dark:text-white">{activeOrders}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Barre de Filtres Flottante */}
                <div className="sticky top-24 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-2 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-none border border-gray-200 dark:border-gray-700 mb-8 flex flex-col md:flex-row gap-2 transition-all">
                    <div className="relative flex-grow">
                        <SearchIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Rechercher par N° de commande..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent border-none rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-0 placeholder:text-gray-400 text-gray-800 dark:text-gray-100 h-full"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0 px-1 md:px-0">
                        <button 
                            onClick={() => setFilterStatus('all')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${filterStatus === 'all' ? 'bg-gray-900 text-white dark:bg-white dark:text-black shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'}`}
                        >
                            Tout voir
                        </button>
                        {orderStatuses.map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap border ${filterStatus === status ? 'bg-white dark:bg-gray-800 border-rose-500 text-rose-600 shadow-sm' : 'border-transparent bg-gray-50 dark:bg-gray-800 text-gray-500 hover:bg-gray-100'}`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* Liste des commandes */}
                {filteredOrders.length > 0 ? (
                    <div className="space-y-6 animate-fadeIn">
                        {filteredOrders.map(order => (
                            <OrderHistoryCard key={order.id} order={order} onNavigateToOrderDetail={onNavigateToOrderDetail} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                        <div className="w-24 h-24 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mb-6 animate-bounce-slow">
                            <ShoppingBagIcon className="w-10 h-10 text-rose-300" />
                        </div>
                        <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-2">Aucune commande trouvée</h2>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm text-center mb-8">Nous n'avons trouvé aucune commande correspondant à vos critères de recherche.</p>
                        <button onClick={() => {setSearchTerm(''); setFilterStatus('all');}} className="text-rose-600 font-bold hover:underline">
                            Réinitialiser les filtres
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
