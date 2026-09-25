import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';

export const Dashboard: React.FC = () => {
  const { currentStoreSlug, apiFetch } = useStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await apiFetch(`/admin/dashboard${currentStoreSlug !== 'all' ? `?storeSlug=${currentStoreSlug}` : ''}`);
      setStats(data);
    } catch (e) {
      console.error('Error fetching dashboard stats:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [currentStoreSlug]);

  if (loading && !stats) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {currentStoreSlug === 'all' ? 'Vue d\'Ensemble Multi-Boutiques' : `Tableau de Bord : ${currentStoreSlug.toUpperCase()}`}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Indicateurs de performance, commandes récentes et répartition des ventes.
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium bg-white text-slate-700 border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
        >
          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualiser
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Chiffre d'Affaires</span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-slate-900">{stats?.totalRevenue?.toLocaleString()} TND</div>
            <div className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <span>↑ +14.8%</span>
              <span className="text-slate-400">ce mois</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Commandes Totales</span>
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-slate-900">{stats?.totalOrders}</div>
            <div className="text-xs text-indigo-600 font-medium mt-1">Multi-boutiques synchronisées</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Catalogue Produits</span>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-slate-900">{stats?.totalProducts}</div>
            <div className="text-xs text-amber-600 font-medium mt-1">Articles en stock</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Boutiques Actives</span>
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-slate-900">{stats?.storesCount || 4}</div>
            <div className="text-xs text-purple-600 font-medium mt-1">Tenants isolés</div>
          </div>
        </div>
      </div>

      {/* Per-store Breakdown (Visible especially in All Stores view) */}
      {currentStoreSlug === 'all' && stats?.storesBreakdown && (
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Performance par Boutique</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.storesBreakdown.map((sb: any) => (
              <div
                key={sb.storeSlug}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-sm text-slate-800">{sb.storeName}</span>
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: sb.themeColor || '#3b82f6' }}
                  />
                </div>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Revenus :</span>
                    <span className="font-bold text-slate-900">{sb.revenue} TND</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Commandes :</span>
                    <span className="font-bold text-slate-900">{sb.ordersCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Produits :</span>
                    <span className="font-bold text-slate-900">{sb.productsCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200/80 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Dernières Commandes</h2>
          <span className="text-xs font-medium text-slate-500">Multi-tenant live stream</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Réf / Date</th>
                <th className="px-5 py-3">Boutique</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Articles</th>
                <th className="px-5 py-3">Montant</th>
                <th className="px-5 py-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.recentOrders?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    Aucune commande récente.
                  </td>
                </tr>
              ) : (
                stats?.recentOrders?.map((ord: any) => (
                  <tr key={ord.id || ord._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      <div>#{ord.id}</div>
                      <div className="text-xs text-slate-400 font-normal">
                        {new Date(ord.createdAt || Date.now()).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                        {ord.storeSlug || 'parashop'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-slate-900 font-medium">
                        {ord.customer?.firstName} {ord.customer?.lastName}
                      </div>
                      <div className="text-xs text-slate-400">{ord.customer?.phone}</div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {ord.items?.length || 1} article(s)
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      {ord.totalAmount} TND
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          ord.status === 'CONFIRMED' || ord.status === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'SHIPPED'
                            ? 'bg-blue-100 text-blue-800'
                            : ord.status === 'CANCELLED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ord.status || 'PENDING'}
                      </span>
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
