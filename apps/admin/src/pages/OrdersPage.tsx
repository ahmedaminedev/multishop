import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';

export const OrdersPage: React.FC = () => {
  const { currentStoreSlug, apiFetch } = useStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url = currentStoreSlug === 'all' ? '/orders' : `/orders?storeSlug=${currentStoreSlug}`;
      const data = await apiFetch(url);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentStoreSlug]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await apiFetch(`/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      setOrders(orders.map(o => (o.id === orderId || o._id === orderId) ? { ...o, status: newStatus } : o));
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    }
  };

  const filteredOrders = orders.filter(o => !statusFilter || o.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestion des Commandes</h1>
          <p className="text-sm text-slate-500 mt-1">
            Suivi des ventes, expéditions et livraison multi-boutiques en temps réel.
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Tous les statuts</option>
          <option value="PENDING">En attente (PENDING)</option>
          <option value="CONFIRMED">Confirmée (CONFIRMED)</option>
          <option value="SHIPPED">Expédiée (SHIPPED)</option>
          <option value="DELIVERED">Livrée (DELIVERED)</option>
          <option value="CANCELLED">Annulée (CANCELLED)</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Commande</th>
                <th className="px-5 py-3">Boutique</th>
                <th className="px-5 py-3">Client & Adresse</th>
                <th className="px-5 py-3">Articles</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Statut & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    Chargement des commandes...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    Aucune commande trouvée.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id || ord._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">#{ord.id}</div>
                      <div className="text-xs text-slate-400">
                        {new Date(ord.createdAt || Date.now()).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                        {ord.storeSlug || 'parashop'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">
                        {ord.customer?.firstName} {ord.customer?.lastName}
                      </div>
                      <div className="text-xs text-slate-500">{ord.customer?.phone} • {ord.customer?.city}</div>
                      <div className="text-xs text-slate-400 truncate max-w-xs">{ord.customer?.address}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-slate-800 font-medium">
                        {ord.items?.length || 1} article(s)
                      </div>
                      <div className="text-xs text-slate-400">
                        {ord.items?.map((i: any) => i.name).slice(0, 2).join(', ')}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      {ord.totalAmount} TND
                    </td>
                    <td className="px-5 py-3.5">
                      <select
                        value={ord.status || 'PENDING'}
                        onChange={(e) => updateStatus(ord.id || ord._id, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border focus:outline-none cursor-pointer ${
                          ord.status === 'CONFIRMED' || ord.status === 'DELIVERED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : ord.status === 'SHIPPED'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : ord.status === 'CANCELLED'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
