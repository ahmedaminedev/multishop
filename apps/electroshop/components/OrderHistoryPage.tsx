

import React, { useState, useMemo, useEffect } from 'react';
import type { Order } from '../types';
import { Breadcrumb } from './Breadcrumb';
import { ShoppingBagIcon, CalendarIcon, SearchIcon, ChevronRightIcon } from './IconComponents';

interface OrderHistoryPageProps {
    orders: Order[];
    onNavigateHome: () => void;
    onNavigateToProfile: () => void;
    onNavigateToOrderDetail: (orderId: string) => void;
}

const OrderStatusBadge: React.FC<{ status: Order['status'] }> = ({ status }) => {
    const baseClasses = 'px-2.5 py-1 text-xs font-semibold rounded-full';
    const statusClasses = {
        'Livrée': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        'Expédiée': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        'En attente': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        'Annulée': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

const OrderHistoryCard: React.FC<{ order: Order; onNavigateToOrderDetail: (orderId: string) => void; }> = ({ order, onNavigateToOrderDetail }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5 transition-all duration-300 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex-grow">
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Commande #{order.id}</h3>
                        <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        {new Date(order.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div className="flex items-center gap-6 text-center text-sm w-full sm:w-auto">
                    <div className="flex-1 sm:flex-auto">
                        <p className="text-gray-500 dark:text-gray-400">Articles</p>
                        <p className="font-semibold">{order.itemCount}</p>
                    </div>
                    <div className="flex-1 sm:flex-auto">
                        <p className="text-gray-500 dark:text-gray-400">Total</p>
                        <p className="font-bold text-red-600 text-base">{order.total.toFixed(3).replace('.', ',')} DT</p>
                    </div>
                </div>
                <div className="w-full sm:w-auto flex-shrink-0">
                    <button onClick={() => onNavigateToOrderDetail(order.id)} className="w-full sm:w-auto bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                        Voir les détails
                        <ChevronRightIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};


export const OrderHistoryPage: React.FC<OrderHistoryPageProps> = ({ orders, onNavigateHome, onNavigateToProfile, onNavigateToOrderDetail }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<Order['status'] | 'all'>('all');

    useEffect(() => {
        document.title = `Historique des Commandes - Electro Shop`;
    }, []);

    const filteredOrders = useMemo(() => {
        return orders
            .filter(o => filterStatus === 'all' || o.status === filterStatus)
            .filter(o => 
                o.id.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [orders, searchTerm, filterStatus]);

    const orderStatuses: Order['status'][] = ['En attente', 'Expédiée', 'Livrée', 'Annulée'];

    return (
        <div className="bg-gray-100 dark:bg-gray-950 min-h-screen">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <Breadcrumb items={[{ name: 'Accueil', onClick: onNavigateHome }, { name: 'Mon Compte', onClick: onNavigateToProfile }, { name: 'Historique des Commandes' }]} />
                </div>

                <header className="mb-8 md:flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">Historique des Commandes</h1>
                        <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">Consultez et suivez vos commandes passées.</p>
                    </div>
                </header>
                
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-grow w-full md:w-auto">
                        <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Rechercher par N° de commande..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 pl-10 pr-3 text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value as any)}
                        className="w-full md:w-auto bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500"
                    >
                        <option value="all">Tous les statuts</option>
                        {orderStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                </div>
                
                {filteredOrders.length > 0 ? (
                    <div className="space-y-4">
                        {filteredOrders.map(order => (
                            <OrderHistoryCard key={order.id} order={order} onNavigateToOrderDetail={onNavigateToOrderDetail} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <ShoppingBagIcon className="w-24 h-24 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Aucune commande à afficher.</h2>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">Il semble que vous n'ayez pas encore passé de commande.</p>
                        <button onClick={onNavigateHome} className="mt-6 bg-red-600 text-white font-bold py-3 px-8 rounded-full hover:bg-red-700 transition-colors duration-300">
                            Commencer mes achats
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
