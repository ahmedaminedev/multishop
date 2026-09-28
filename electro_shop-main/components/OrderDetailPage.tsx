
import React, { useState } from 'react';
import type { Order, Product, Address } from '../types';
import { Breadcrumb } from './Breadcrumb';
import { useCart } from './CartContext';
// FIX: Changed TruckIcon to DeliveryTruckIcon as that is the exported name.
import { CalendarIcon, ShoppingBagIcon, DeliveryTruckIcon, CheckCircleIcon, CreditCardIcon, LocationIcon, PrinterIcon } from './IconComponents';
import { Invoice } from './Invoice';

interface OrderDetailPageProps {
    order: Order;
    allProducts: Product[];
    onNavigateHome: () => void;
    onNavigateToOrderHistory: () => void;
    onNavigateToProductDetail: (productId: number) => void;
}

const OrderStatusBadge: React.FC<{ status: Order['status'] }> = ({ status }) => {
    const statusInfo = {
        'Livrée': { text: 'Livrée', color: 'green' },
        'Expédiée': { text: 'Expédiée', color: 'blue' },
        'En attente': { text: 'En attente', color: 'yellow' },
        'Annulée': { text: 'Annulée', color: 'red' }
    };
    const { text, color } = statusInfo[status];
    const colorClasses = `bg-${color}-100 text-${color}-800 dark:bg-${color}-900 dark:text-${color}-300`;
    return <span className={`px-3 py-1 text-sm font-semibold rounded-full ${colorClasses}`}>{text}</span>;
};

const OrderTimeline: React.FC<{ status: Order['status'], date: string }> = ({ status, date }) => {
    const steps = [
        { name: 'Commande passée', status: ['En attente', 'Expédiée', 'Livrée'], icon: <ShoppingBagIcon className="w-6 h-6"/> },
        { name: 'Commande expédiée', status: ['Expédiée', 'Livrée'], icon: <DeliveryTruckIcon className="w-6 h-6"/> },
        { name: 'Commande livrée', status: ['Livrée'], icon: <CheckCircleIcon className="w-6 h-6"/> },
    ];

    const getStepDate = (stepName: string) => {
        // This is a mock. In a real app, you'd have dates for each step.
        const orderDate = new Date(date);
        if (stepName === 'Commande passée') return orderDate.toLocaleDateString('fr-FR');
        if (stepName === 'Commande expédiée') {
             orderDate.setDate(orderDate.getDate() + 1);
             return orderDate.toLocaleDateString('fr-FR');
        }
        if (stepName === 'Commande livrée') {
            orderDate.setDate(orderDate.getDate() + 3);
            return orderDate.toLocaleDateString('fr-FR');
        }
        return '';
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
            <h3 className="text-xl font-bold mb-6">Suivi de la commande</h3>
            <div className="relative">
                {steps.map((step, index) => {
                    const isActive = step.status.includes(status);
                    const isLast = index === steps.length - 1;
                    return (
                        <div key={step.name} className="flex items-start pb-10">
                            <div className="flex flex-col items-center mr-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isActive ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                                    {step.icon}
                                </div>
                                {!isLast && <div className={`w-0.5 grow mt-2 ${isActive && steps[index+1].status.includes(status) ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'}`}></div>}
                            </div>
                            <div className="pt-2">
                                <p className={`font-semibold ${isActive ? 'text-gray-800 dark:text-gray-100' : 'text-gray-500'}`}>{step.name}</p>
                                {isActive && <p className="text-sm text-gray-500 dark:text-gray-400">{getStepDate(step.name)}</p>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const OrderItemCard: React.FC<{ item: Product, quantity: number, allProducts: Product[], onNavigateToProductDetail: (id: number) => void }> = ({ item, quantity, allProducts, onNavigateToProductDetail }) => {
    const { addToCart, openCart } = useCart();
    const handleBuyAgain = () => {
        const product = allProducts.find(p => p.id === item.id);
        if (product) {
            addToCart(product);
            openCart();
        }
    };
    return (
        <div className="flex items-center gap-4 p-4 border-b dark:border-gray-700 last:border-0">
            <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-contain rounded-md bg-white"/>
            <div className="flex-grow">
                <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToProductDetail(item.id)}} className="font-semibold text-gray-800 dark:text-gray-100 hover:text-red-600">{item.name}</a>
                <p className="text-sm text-gray-500 dark:text-gray-400">Quantité: {quantity}</p>
            </div>
            <div className="text-right">
                <p className="font-semibold">{(item.price * quantity).toFixed(3).replace(',', '.')} DT</p>
                <button onClick={handleBuyAgain} className="mt-2 text-sm font-semibold text-red-600 hover:underline">Racheter</button>
            </div>
        </div>
    );
};

export const OrderDetailPage: React.FC<OrderDetailPageProps> = ({ order, allProducts, onNavigateHome, onNavigateToOrderHistory, onNavigateToProductDetail }) => {
    const [isInvoiceVisible, setIsInvoiceVisible] = useState(false);
    
    return (
        <div className="bg-gray-100 dark:bg-gray-950 min-h-screen">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <Breadcrumb items={[{ name: 'Accueil', onClick: onNavigateHome }, { name: 'Historique des commandes', onClick: onNavigateToOrderHistory }, { name: `Commande ${order.id}` }]} />

                <header className="my-8 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Détails de la commande {order.id}</h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-300 flex items-center gap-2">
                           <CalendarIcon className="w-5 h-5"/> Passée le {new Date(order.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                </header>

                <main className="grid lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-8">
                        <OrderTimeline status={order.status} date={order.date} />

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
                             <h3 className="text-xl font-bold p-6 border-b dark:border-gray-700">Articles commandés ({order.itemCount})</h3>
                             <div className="divide-y dark:divide-gray-700">
                                {order.items.map((item) => (
                                    <OrderItemCard key={item.productId} item={item} quantity={item.quantity} allProducts={allProducts} onNavigateToProductDetail={onNavigateToProductDetail} />
                                ))}
                            </div>
                        </div>
                    </div>

                    <aside className="lg:col-span-1 space-y-8 sticky top-24">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
                            <h3 className="text-xl font-bold mb-4">Récapitulatif</h3>
                             <div className="space-y-4">
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2"><LocationIcon className="w-5 h-5 text-gray-400"/> Adresse de livraison</p>
                                    <div className="text-sm text-gray-600 dark:text-gray-300 pl-7 mt-1 border-l-2 ml-2.5 pl-4 border-gray-200 dark:border-gray-600">
                                        <p>{order.customerName}</p>
                                        <p>{order.shippingAddress.street}</p>
                                        <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                                    </div>
                                </div>
                                <div>
                                     <p className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2"><CreditCardIcon className="w-5 h-5 text-gray-400"/> Mode de paiement</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 pl-7">{order.paymentMethod}</p>
                                </div>
                                 <div className="pt-4 border-t dark:border-gray-700 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-300">Sous-total ({order.itemCount} articles)</span>
                                        <span>{order.total.toFixed(3).replace(',', '.')} DT</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-300">Livraison</span>
                                        <span>{(order.total >= 300 ? 0 : 7).toFixed(3).replace(',', '.')} DT</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg pt-2 border-t dark:border-gray-600 mt-2">
                                        <span>Total</span>
                                        <span>{(order.total + (order.total >= 300 ? 0 : 7)).toFixed(3).replace(',', '.')} DT</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                         <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700 space-y-3">
                              <button onClick={() => setIsInvoiceVisible(true)} className="w-full bg-red-600 text-white font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 text-sm hover:bg-red-700 transition-colors">
                                <PrinterIcon className="w-5 h-5" />
                                Imprimer la facture
                            </button>
                         </div>
                    </aside>
                </main>
            </div>

            {isInvoiceVisible && (
                <Invoice order={order} onClose={() => setIsInvoiceVisible(false)} />
            )}
        </div>
    );
};
