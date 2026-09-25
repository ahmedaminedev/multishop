import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';

interface UserItem {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'STORE_ADMIN' | 'USER';
  storeSlug?: string | null;
  phone?: string;
  city?: string;
  address?: string;
}

export const CustomersPage: React.FC = () => {
  const { apiFetch } = useStore();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STORE_ADMIN' as 'SUPER_ADMIN' | 'STORE_ADMIN' | 'USER',
    storeSlug: 'parashop',
    phone: '',
    city: ''
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/admin/users');
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error fetching users:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'STORE_ADMIN',
      storeSlug: 'parashop',
      phone: '',
      city: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (u: UserItem) => {
    setEditingUser(u);
    setFormData({
      name: u.name,
      email: u.email,
      password: '',
      role: u.role,
      storeSlug: u.storeSlug || 'parashop',
      phone: u.phone || '',
      city: u.city || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (u: UserItem) => {
    if (!window.confirm(`Supprimer l'utilisateur "${u.name}" (${u.email}) ?`)) return;
    try {
      await apiFetch(`/admin/users/${u.id || u._id}`, { method: 'DELETE' });
      fetchUsers();
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        storeSlug: formData.role === 'SUPER_ADMIN' ? null : formData.storeSlug,
        phone: formData.phone,
        city: formData.city
      };
      if (formData.password) {
        payload.password = formData.password;
      }

      if (editingUser) {
        await apiFetch(`/admin/users/${editingUser.id || editingUser._id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await apiFetch('/admin/users', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = filterRole === 'ALL' || u.role === filterRole;
    const matchesSearch = !searchTerm ||
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Utilisateurs, Administrateurs & Clients</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestion sécurisée des accès : Super Admins globaux, Store Admins par boutique et clients front-office.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Créer un Utilisateur
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Rechercher par nom, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'SUPER_ADMIN', 'STORE_ADMIN', 'USER'].map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                filterRole === r
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r === 'ALL' ? 'Tous' : r === 'SUPER_ADMIN' ? 'Super Admins' : r === 'STORE_ADMIN' ? 'Store Admins' : 'Clients'}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-5 py-3">Utilisateur</th>
              <th className="px-5 py-3">Email & Coordonnées</th>
              <th className="px-5 py-3">Rôle</th>
              <th className="px-5 py-3">Boutique Assignée</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">Chargement...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">Aucun utilisateur correspondant.</td></tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id || u._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-slate-900">{u.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">id: {u.id || u._id}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="text-slate-700 font-mono text-xs">{u.email}</div>
                    {u.phone && <div className="text-[11px] text-slate-400">{u.phone} {u.city && `• ${u.city}`}</div>}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                      u.role === 'SUPER_ADMIN'
                        ? 'bg-purple-100 text-purple-800'
                        : u.role === 'STORE_ADMIN'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {u.role === 'SUPER_ADMIN' ? 'Super Admin' : u.role === 'STORE_ADMIN' ? 'Store Admin' : 'Client'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-500">
                    {u.storeSlug ? (
                      <span className="font-semibold text-slate-700 px-2 py-0.5 bg-slate-100 rounded">{u.storeSlug}</span>
                    ) : (
                      <span className="text-slate-400 italic">Toutes (Accès global)</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(u)}
                        className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors"
                      >
                        Éditer
                      </button>
                      <button
                        onClick={() => handleDelete(u)}
                        className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl my-8">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              {editingUser ? 'Modifier le Compte' : 'Créer un Compte'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nom complet</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Ex: Yasmine Driss"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Adresse Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="nom@boutique.tn"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mot de passe {editingUser && <span className="text-slate-400 font-normal">(laisser vide pour ne pas changer)</span>}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Rôle</label>
                  <select
                    value={formData.role}
                    onChange={(e: any) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    <option value="STORE_ADMIN">Store Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="USER">Client</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Boutique</label>
                  <select
                    disabled={formData.role === 'SUPER_ADMIN'}
                    value={formData.storeSlug}
                    onChange={(e) => setFormData({ ...formData, storeSlug: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white disabled:opacity-50"
                  >
                    <option value="parashop">PharmaNature</option>
                    <option value="nutritionshop">IronFuel</option>
                    <option value="cosmeticshop">Cosmetics</option>
                    <option value="electroshop">Electro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Téléphone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="+216 ..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ville</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Tunis, Sousse..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
