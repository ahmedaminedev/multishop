import React, { useState, useMemo } from 'react';
import { Search, Filter, Eye, Printer, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

interface GlobalOrdersViewProps {
  orders: any[];
  onUpdateOrderStatus: (orderId: string, status: string) => Promise<void>;
  activeShop?: string;
  onSelectShop?: (shop: string) => void;
}

export const GlobalOrdersView: React.FC<GlobalOrdersViewProps> = ({
  orders,
  onUpdateOrderStatus,
  activeShop = 'all',
  onSelectShop
}) => {
  const [filialeFilter, setFilialeFilter] = useState(activeShop);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Keep in sync with parent activeShop context
  React.useEffect(() => {
    setFilialeFilter(activeShop);
  }, [activeShop]);

  const handleShopFilterChange = (shop: string) => {
    setFilialeFilter(shop);
    if (onSelectShop) onSelectShop(shop);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchFiliale = filialeFilter === 'all' || o.filialeKey === filialeFilter;
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      const matchSearch = !searchQuery ||
        o.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchFiliale && matchStatus && matchSearch;
    });
  }, [orders, filialeFilter, statusFilter, searchQuery]);

  const shopTabs = [
    { id: 'all', label: 'Toutes', icon: '🌐' },
    { id: 'para', label: 'PharmaShop', icon: '🌿' },
    { id: 'nutrition', label: 'Fitness Shop', icon: '⚡' },
    { id: 'cosmetic', label: 'Cosmetics', icon: '💄' },
    { id: 'electro', label: 'Electro', icon: '🔌' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
            GESTION DES COMMANDES <span className="text-blue-600">CENTRALISÉES</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Visualisez et traitez les commandes clients de PharmaShop, Fitness Shop, Cosmetics et Electro Shop
          </p>
        </div>

        {/* Quick Shop Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80 overflow-x-auto no-scrollbar">
          {shopTabs.map((st) => {
            const isSelected = filialeFilter === st.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => handleShopFilterChange(st.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <span>{st.icon}</span>
                <span>{st.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par référence, client..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filiale Filter */}
        <select
          value={filialeFilter}
          onChange={(e) => handleShopFilterChange(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <option value="all">Toutes les Boutiques</option>
          <option value="para">🌿 PharmaShop</option>
          <option value="nutrition">⚡ Fitness Shop</option>
          <option value="cosmetic">💄 Cosmetics Shop</option>
          <option value="electro">🔌 Electro Shop</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <option value="all">Tous les Statuts</option>
          <option value="En attente">En attente</option>
          <option value="Expédiée">Expédiée</option>
          <option value="Livrée">Livrée</option>
          <option value="Annulée">Annulée</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Réf Commande</th>
                <th className="py-3 px-4">Filiale</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Articles</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    Aucune commande trouvée.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{order.id}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-700">
                        {order.filialeKey === 'para' && '🌿 PharmaShop'}
                        {order.filialeKey === 'nutrition' && '⚡ Fitness Shop'}
                        {order.filialeKey === 'cosmetic' && '💄 Cosmetics'}
                        {order.filialeKey === 'electro' && '🔌 Electro Shop'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{order.customerName}</p>
                      <p className="text-[10px] text-slate-400">{order.customerEmail || order.phone || 'Non spécifié'}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{order.date}</td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{order.items?.length || 1} article(s)</td>
                    <td className="py-3 px-4 font-black text-slate-900">{order.total} DT</td>
                    <td className="py-3 px-4">
                      <select
                        value={order.status}
                        onChange={(e) => onUpdateOrderStatus(order.id, e.target.value)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-full border cursor-pointer focus:outline-none ${
                          order.status === 'Livrée' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          order.status === 'Expédiée' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          order.status === 'Annulée' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <option value="En attente">En attente</option>
                        <option value="Expédiée">Expédiée</option>
                        <option value="Livrée">Livrée</option>
                        <option value="Annulée">Annulée</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 text-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">Commande {selectedOrder.id}</h3>
                <p className="text-xs text-slate-500">Filiale: {selectedOrder.filialeName || selectedOrder.filialeKey}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl space-y-1">
                <p className="font-bold text-slate-800">Coordonnées du client :</p>
                <p><span className="text-slate-500">Nom :</span> {selectedOrder.customerName}</p>
                <p><span className="text-slate-500">Email :</span> {selectedOrder.customerEmail || '—'}</p>
                <p><span className="text-slate-500">Téléphone :</span> {selectedOrder.phone || '—'}</p>
                <p><span className="text-slate-500">Adresse de livraison :</span> {selectedOrder.shippingAddress || 'Tunisie'}</p>
              </div>

              <div>
                <p className="font-bold text-slate-800 mb-2">Articles commandés :</p>
                <div className="space-y-2 border border-slate-100 rounded-xl p-3">
                  {(selectedOrder.items || []).length > 0 ? (
                    selectedOrder.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-50 last:border-none">
                        <div>
                          <p className="font-semibold text-slate-900">{item.name}</p>
                          <p className="text-[10px] text-slate-400">Qté: {item.quantity || 1}</p>
                        </div>
                        <span className="font-bold text-slate-900">{item.price} DT</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400">1 x Pack Découverte ({selectedOrder.total} DT)</p>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center text-sm font-black pt-2 border-t border-slate-100">
                <span>Total Commande :</span>
                <span className="text-blue-600 text-base">{selectedOrder.total} DT</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
