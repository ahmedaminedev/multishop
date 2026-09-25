
import React, { useState, useMemo } from 'react';
import type { Order } from '../../types';
import { SearchIcon, CalendarIcon, UserIcon, ShoppingBagIcon } from '../IconComponents';

interface ViewOrdersPageProps {
    orders: Order[];
}

const OrderStatusBadge: React.FC<{ status: Order['status'] }> = ({ status }) => {
    const statusClasses = {
        'Livrée': 'bg-green-100 dark:bg-green-500 text-green-700 dark:text-black',
        'Expédiée': 'bg-blue-100 dark:bg-blue-500 text-blue-700 dark:text-white',
        'En attente': 'bg-yellow-100 dark:bg-brand-neon text-yellow-700 dark:text-black',
        'Annulée': 'bg-red-100 dark:bg-red-600 text-red-700 dark:text-white'
    };
    const base = statusClasses[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white';
    
    return <span className={`${base} px-3 py-1 text-[10px] font-black uppercase tracking-widest skew-x-[-12deg] inline-block`}><span className="skew-x-[12deg] inline-block">{status}</span></span>;
};


const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
    return (
        <div className="bg-white dark:bg-[#1f2833] border border-gray-200 dark:border-gray-700 hover:border-black dark:hover:border-brand-neon transition-all duration-300 p-0 flex flex-col group h-full shadow-sm dark:shadow-none">
            {/* Header Ticket */}
            <div className="bg-gray-50 dark:bg-black p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <div>
                    <h3 className="font-mono font-bold text-gray-900 dark:text-white text-sm">{order.id}</h3>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mt-1">
                        <CalendarIcon className="w-3 h-3" />
                        {order.date}
                    </p>
                </div>
                <OrderStatusBadge status={order.status} />
            </div>
            
            <div className="p-5 flex flex-col flex-grow">
                 <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400">
                        <UserIcon className="w-5 h-5"/>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Client</p>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">{order.customerName}</p>
                    </div>
                </div>
                
                <div className="mt-auto grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700 border-dashed">
                    <div>
                        <p className="text-[10px] text-gray-500 uppercase font-bold">Articles</p>
                        <p className="font-mono font-bold text-gray-900 dark:text-white text-lg">{order.itemCount}</p>
                    </div>
                     <div className="text-right">
                        <p className="text-[10px] text-gray-500 uppercase font-bold">Total</p>
                        <p className="font-mono font-bold text-black dark:text-brand-neon text-lg">{order.total.toFixed(3)} DT</p>
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
        <div className="p-6 bg-gray-100 dark:bg-black min-h-screen text-gray-900 dark:text-white transition-colors duration-300">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-wider italic mb-8 border-b border-gray-200 dark:border-gray-800 pb-6">Logistique <span className="text-black dark:text-brand-neon">Commandes</span></h1>

            <div className="bg-white dark:bg-[#1f2833] p-4 mb-8 flex flex-col md:flex-row gap-4 items-center border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none">
                <div className="relative flex-grow w-full md:w-auto group">
                    <SearchIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-black dark:group-focus-within:text-brand-neon transition-colors" />
                    <input
                        type="text"
                        placeholder="RECHERCHER ID / CLIENT..."
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 py-3 pl-10 pr-3 text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider focus:outline-none focus:border-black dark:focus:border-brand-neon transition-colors"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={e => { setFilterStatus(e.target.value as any); setCurrentPage(1); }}
                    className="w-full md:w-auto bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 py-3 px-3 text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider focus:outline-none focus:border-black dark:focus:border-brand-neon cursor-pointer"
                >
                    <option value="all">TOUS STATUTS</option>
                    {orderStatuses.map(status => <option key={status} value={status}>{status.toUpperCase()}</option>)}
                </select>
                <select
                    value={sortOption}
                    onChange={e => { setSortOption(e.target.value); setCurrentPage(1); }}
                    className="w-full md:w-auto bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 py-3 px-3 text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider focus:outline-none focus:border-black dark:focus:border-brand-neon cursor-pointer"
                >
                    <option value="date-desc">DATE (RÉCENT)</option>
                    <option value="date-asc">DATE (ANCIEN)</option>
                    <option value="total-desc">TOTAL (HAUT-BAS)</option>
                    <option value="total-asc">TOTAL (BAS-HAUT)</option>
                </select>
            </div>

            {paginatedOrders.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {paginatedOrders.map(order => (
                        <OrderCard key={order.id} order={order} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white dark:bg-[#1f2833] border border-dashed border-gray-200 dark:border-gray-700">
                    <ShoppingBagIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600" />
                    <p className="mt-4 text-lg text-gray-500 font-mono">Aucune commande trouvée.</p>
                </div>
            )}

             {totalPages > 1 && (
                <nav className="flex justify-center items-center mt-12 space-x-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-white dark:bg-[#1f2833] text-gray-700 dark:text-white border border-gray-200 dark:border-gray-700 hover:border-black dark:hover:border-brand-neon disabled:opacity-50 disabled:hover:border-gray-200 dark:disabled:hover:border-gray-700"
                    >
                        Précédent
                    </button>
                    <span className="text-xs font-mono text-black dark:text-brand-neon mx-4">
                        PAGE {currentPage} / {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-white dark:bg-[#1f2833] text-gray-700 dark:text-white border border-gray-200 dark:border-gray-700 hover:border-black dark:hover:border-brand-neon disabled:opacity-50 disabled:hover:border-gray-200 dark:disabled:hover:border-gray-700"
                    >
                        Suivant
                    </button>
                </nav>
            )}
        </div>
    );
};
