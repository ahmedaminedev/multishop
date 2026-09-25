import React, { useState, useMemo } from 'react';
import type { Order } from '../../types';
import { SearchIcon, CalendarIcon, UserIcon, ShoppingBagIcon } from '../IconComponents';

interface ViewOrdersPageProps {
    orders: Order[];
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


const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-5 flex flex-col gap-4 transition-transform hover:-translate-y-1 hover:shadow-xl">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{order.id}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        {order.date}
                    </p>
                </div>
                <OrderStatusBadge status={order.status} />
            </div>
            
            <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                        <UserIcon className="w-5 h-5"/>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Client</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{order.customerName}</p>
                    </div>
                </div>
                
                <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                    <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Articles</p>
                        <p className="font-bold text-gray-800 dark:text-gray-200">{order.itemCount}</p>
                    </div>
                    <div className="h-8 border-l border-gray-200 dark:border-gray-600"></div>
                     <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                        <p className="font-bold text-red-600 text-lg">{order.total.toFixed(3).replace('.', ',')} DT</p>
                    </div>
                </div>
            </div>
        </div>
    );
};


export const ViewOrdersPage: React.FC<ViewOrdersPageProps> = ({ orders }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<Order['status'] | 'all'>('all');
    const [sortOption, setSortOption] = useState('date-desc');
    const [currentPage, setCurrentPage] = useState(1);
    const ORDERS_PER_PAGE = 9;

    const processedOrders = useMemo(() => {
        let filtered = orders
            .filter(o => 
                o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.customerName.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .filter(o => filterStatus === 'all' || o.status === filterStatus);

        filtered.sort((a, b) => {
            switch (sortOption) {
                case 'date-asc': return new Date(a.date).getTime() - new Date(b.date).getTime();
                case 'date-desc': return new Date(b.date).getTime() - new Date(a.date).getTime();
                case 'total-asc': return a.total - b.total;
                case 'total-desc': return b.total - a.total;
                default: return 0;
            }
        });

        return filtered;
    }, [orders, searchTerm, filterStatus, sortOption]);

    const totalPages = Math.ceil(processedOrders.length / ORDERS_PER_PAGE);
    const paginatedOrders = processedOrders.slice(
        (currentPage - 1) * ORDERS_PER_PAGE,
        currentPage * ORDERS_PER_PAGE
    );

    const orderStatuses: Order['status'][] = ['En attente', 'Expédiée', 'Livrée', 'Annulée'];

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Consulter les Commandes</h1>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-8 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-grow w-full md:w-auto">
                    <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Rechercher par ID ou client..."
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 pl-10 pr-3 text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={e => { setFilterStatus(e.target.value as any); setCurrentPage(1); }}
                    className="w-full md:w-auto bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500"
                >
                    <option value="all">Tous les statuts</option>
                    {orderStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                </select>
                <select
                    value={sortOption}
                    onChange={e => { setSortOption(e.target.value); setCurrentPage(1); }}
                    className="w-full md:w-auto bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500"
                >
                    <option value="date-desc">Trier par: Date (Plus récent)</option>
                    <option value="date-asc">Trier par: Date (Plus ancien)</option>
                    <option value="total-desc">Trier par: Total (Haut-Bas)</option>
                    <option value="total-asc">Trier par: Total (Bas-Haut)</option>
                </select>
            </div>

            {paginatedOrders.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {paginatedOrders.map(order => (
                        <OrderCard key={order.id} order={order} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <ShoppingBagIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" />
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Aucune commande trouvée.</p>
                    <p className="text-sm text-gray-500 mt-2">Essayez de modifier vos filtres de recherche.</p>
                </div>
            )}

             {totalPages > 1 && (
                <nav className="flex justify-center items-center mt-8 space-x-2" aria-label="Pagination">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                    >
                        Précédent
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Page {currentPage} sur {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                    >
                        Suivant
                    </button>
                </nav>
            )}
        </div>
    );
};
