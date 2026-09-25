import React from 'react';
import type { Order, Product, ContactMessage } from '../../types';
import { StatCard } from './StatCard';
import { ChartPlaceholder } from './ChartPlaceholder';
import { ArrowUpRightIcon, UsersIcon, ShoppingBagIcon, InboxIcon } from '../IconComponents';

interface DashboardHomePageProps {
    orders: Order[];
    products: Product[];
    messages: ContactMessage[];
}

export const DashboardHomePage: React.FC<DashboardHomePageProps> = ({ orders, products, messages }) => {
    const totalRevenue = orders
        .filter(o => o.status === 'Livrée')
        .reduce((sum, o) => sum + o.total, 0);

    const newOrders = orders.filter(o => o.status === 'En attente').length;
    
    const unreadMessages = messages.filter(m => !m.read).length;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Tableau de bord</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    title="Revenu Total"
                    value={`${totalRevenue.toFixed(0)} DT`}
                    change="+12.5%"
                    changeType="increase"
                    icon={<ArrowUpRightIcon className="w-6 h-6"/>}
                />
                 <StatCard 
                    title="Nouvelles Commandes"
                    value={newOrders.toString()}
                    change="+5"
                    changeType="increase"
                    icon={<ShoppingBagIcon className="w-6 h-6"/>}
                />
                 <StatCard 
                    title="Total Produits"
                    value={products.length.toString()}
                    change=""
                    icon={<UsersIcon className="w-6 h-6"/>}
                />
                 <StatCard 
                    title="Messages Non Lus"
                    value={unreadMessages.toString()}
                    changeType={unreadMessages > 0 ? "increase" : undefined}
                    icon={<InboxIcon className="w-6 h-6"/>}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <ChartPlaceholder title="Aperçu des ventes mensuelles" />
                </div>
                <div>
                    <ChartPlaceholder title="Répartition par statut" type="pie" />
                </div>
            </div>

            <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                 <h3 className="text-xl font-bold mb-4">Commandes Récentes</h3>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">ID Commande</th>
                                <th scope="col" className="px-6 py-3">Client</th>
                                <th scope="col" className="px-6 py-3">Total</th>
                                <th scope="col" className="px-6 py-3">Statut</th>
                                <th scope="col" className="px-6 py-3">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.slice(0, 5).map(order => (
                                <tr key={order.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{order.id}</td>
                                    <td className="px-6 py-4">{order.customerName}</td>
                                    <td className="px-6 py-4">{order.total.toFixed(3).replace('.',',')} DT</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            order.status === 'Livrée' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                            order.status === 'Expédiée' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                                            order.status === 'En attente' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                        }`}>{order.status}</span>
                                    </td>
                                    <td className="px-6 py-4">{order.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            </div>
        </div>
    );
};