import React, { useState, useMemo, useEffect } from 'react';
import {
  Truck,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Calendar,
  Search,
  Filter,
  Eye,
  Phone,
  MapPin,
  Package,
  Building2,
  DollarSign,
  Receipt,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check,
  RefreshCw,
  Send,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { centralApiRequest } from '../../services/apiClient';

export interface WorkScheduleInterval {
  id?: string;
  jourDebut: string;
  jourFin: string;
  heureDebut: string;
  heureFin: string;
}

export const JOURS_SEMAINE = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche'
];

export interface DeliveryCompany {
  id: string;
  nom: string;
  telephone: string;
  contact: string;
  zones: string;
  delaiMoyen: string;
  tarifDefaut: number;
  actif: boolean;
  horairesTravail?: WorkScheduleInterval[];
  joursTravailTexte?: string;
}

interface DeliveryCompaniesViewProps {
  orders: any[];
  activeShop?: string;
  onReloadOrders?: () => void;
  onSelectOrder?: (order: any) => void;
}

export const DeliveryCompaniesView: React.FC<DeliveryCompaniesViewProps> = ({
  orders,
  activeShop = 'all',
  onReloadOrders,
  onSelectOrder
}) => {
  // 1. Carriers state & CRUD
  const [carriers, setCarriers] = useState<DeliveryCompany[]>([]);
  const [selectedCarrierId, setSelectedCarrierId] = useState<string>('all');
  const [carrierModalOpen, setCarrierModalOpen] = useState(false);
  const [editingCarrier, setEditingCarrier] = useState<Partial<DeliveryCompany> | null>(null);

  // 2. Active sub-tab inside the delivery view:
  // 'overview' (CRUD & stats) | 'history' (already assigned) | 'in_progress' (encours + date filter) | 'returns' (commandes retour)
  const [currentTab, setCurrentTab] = useState<'overview' | 'history' | 'in_progress' | 'returns'>('overview');

  // 3. Search & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filialeFilter, setFilialeFilter] = useState(activeShop);
  const [dateFilterMode, setDateFilterMode] = useState<'all' | 'today' | 'tomorrow' | 'this_week' | 'custom'>('all');
  const [customDate, setCustomDate] = useState<string>('');

  // 4. Return Status Modification Modal
  const [returnModalOrder, setReturnModalOrder] = useState<any | null>(null);
  const [newReturnStatus, setNewReturnStatus] = useState<string>('RETOUR_EN_COURS');
  const [returnReason, setReturnReason] = useState<string>('Client injoignable après 3 appels');
  const [returnComment, setReturnComment] = useState<string>('');

  // 5. Delivery Date Modification Modal
  const [dateModalOrder, setDateModalOrder] = useState<any | null>(null);
  const [newPlannedDate, setNewPlannedDate] = useState<string>('');
  const [newPlannedSlot, setNewPlannedSlot] = useState<string>('09:00 - 13:00');
  const [newDateNotes, setNewDateNotes] = useState<string>('');

  // 6. Inspect Order modal (Detail of products & audit)
  const [inspectOrder, setInspectOrder] = useState<any | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Sync filialeFilter with prop
  useEffect(() => {
    setFilialeFilter(activeShop);
  }, [activeShop]);

  // Load delivery companies
  const loadCarriers = async () => {
    try {
      const res = await fetch('/api/delivery-companies');
      if (res.ok) {
        const data = await res.json();
        setCarriers(data);
      }
    } catch (e) {
      console.error('Erreur chargement transporteurs:', e);
    }
  };

  useEffect(() => {
    loadCarriers();
  }, []);

  // CRUD Handlers for Delivery Companies
  const handleSaveCarrier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCarrier || !editingCarrier.nom?.trim()) {
      showToast('Le nom de la société de livraison est obligatoire.', 'error');
      return;
    }

    const horaires = editingCarrier.horairesTravail || [];
    if (horaires.length === 0) {
      showToast('Veuillez ajouter au moins un intervalle de jours de travail et ses horaires.', 'error');
      return;
    }

    // Obligation check: each day interval MUST have an hourly interval defined (start and end time)
    for (let i = 0; i < horaires.length; i++) {
      const slot = horaires[i];
      if (!slot.heureDebut || !slot.heureFin) {
        showToast(
          `Obligation : Veuillez obligatoirement choisir l'intervalle horaire (heure de début et heure de fin) pour ${slot.jourDebut} à ${slot.jourFin}.`,
          'error'
        );
        return;
      }
      if (slot.heureDebut >= slot.heureFin) {
        showToast(
          `Pour l'intervalle ${slot.jourDebut} à ${slot.jourFin}, l'heure de fin (${slot.heureFin}) doit être postérieure à l'heure de début (${slot.heureDebut}).`,
          'error'
        );
        return;
      }
    }

    const formattedJours = horaires
      .map((h) => `${h.jourDebut === h.jourFin ? h.jourDebut : `${h.jourDebut} à ${h.jourFin}`} (${h.heureDebut} - ${h.heureFin})`)
      .join(', ');

    const payload = {
      ...editingCarrier,
      horairesTravail: horaires,
      joursTravailTexte: formattedJours
    };

    try {
      if (editingCarrier.id) {
        // Update
        const res = await fetch(`/api/delivery-companies/${editingCarrier.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          showToast(`Société ${editingCarrier.nom} mise à jour avec succès.`, 'success');
        }
      } else {
        // Create
        const res = await fetch('/api/delivery-companies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          showToast(`Nouvelle société ${editingCarrier.nom} créée avec succès.`, 'success');
        }
      }
      setCarrierModalOpen(false);
      setEditingCarrier(null);
      await loadCarriers();
    } catch (err: any) {
      showToast('Erreur lors de l\'enregistrement de la société.', 'error');
    }
  };

  const handleDeleteCarrier = async (carrierId: string, carrierName: string) => {
    if (!window.confirm(`Confirmez-vous la suppression de la société de livraison "${carrierName}" ?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/delivery-companies/${carrierId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`Société "${carrierName}" supprimée.`, 'info');
        if (selectedCarrierId === carrierId) setSelectedCarrierId('all');
        await loadCarriers();
      }
    } catch (err) {
      showToast('Erreur lors de la suppression.', 'error');
    }
  };

  const toggleCarrierActive = async (carrier: DeliveryCompany) => {
    try {
      const updated = { ...carrier, actif: !carrier.actif };
      const res = await fetch(`/api/delivery-companies/${carrier.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        showToast(`Société ${carrier.nom} ${updated.actif ? 'activée' : 'désactivée'}.`, 'info');
        await loadCarriers();
      }
    } catch (err) {
      showToast('Erreur lors du changement de statut.', 'error');
    }
  };

  // Filter orders by activeShop / filiale
  const filialeOrders = useMemo(() => {
    if (filialeFilter === 'all') return orders;
    return orders.filter((o) => {
      const sArr = Array.isArray(o.shops) ? o.shops : [o.filialeKey || 'nutrition'];
      return sArr.includes(filialeFilter) || o.filialeKey === filialeFilter;
    });
  }, [orders, filialeFilter]);

  // Filter orders by selected carrier
  const carrierOrders = useMemo(() => {
    if (selectedCarrierId === 'all') {
      // All orders assigned to any carrier
      return filialeOrders.filter((o) => !!o.affectationLivraison?.societeLivraisonNom);
    }
    return filialeOrders.filter(
      (o) =>
        o.affectationLivraison?.societeLivraisonId === selectedCarrierId ||
        o.affectationLivraison?.societeLivraisonNom?.toLowerCase() ===
          carriers.find((c) => c.id === selectedCarrierId)?.nom?.toLowerCase()
    );
  }, [filialeOrders, selectedCarrierId, carriers]);

  // CATEGORIZATION OF ORDERS:
  // 1. History (All assigned orders)
  const historyOrders = useMemo(() => {
    return carrierOrders.filter((o) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const matchNum = (o.orderNumber || o.id || '').toLowerCase().includes(q);
      const matchClient = (o.customerName || '').toLowerCase().includes(q);
      const matchPhone = (o.phone || '').toLowerCase().includes(q);
      const matchCity = (o.shippingAddress?.city || '').toLowerCase().includes(q);
      const matchItem = (o.items || []).some((it: any) => (it.name || '').toLowerCase().includes(q));
      return matchNum || matchClient || matchPhone || matchCity || matchItem;
    });
  }, [carrierOrders, searchQuery]);

  // 2. In-Progress Orders (AFFECTEE_LIVRAISON, EN_LIVRAISON, LIVRAISON_EN_ATTENTE, EXPEDIEE)
  const inProgressOrders = useMemo(() => {
    return carrierOrders.filter((o) => {
      const livStat = o.statutLivraison || 'NON_INITIEE';
      const cmdStat = o.statutCommande || o.status;
      const isInProgress =
        cmdStat !== 'CLOTUREE' &&
        cmdStat !== 'ARCHIVEE' &&
        livStat !== 'LIVREE' &&
        livStat !== 'RETOUR' &&
        livStat !== 'ECHEC_LIVRAISON' &&
        (livStat === 'AFFECTEE_LIVRAISON' ||
          livStat === 'EN_LIVRAISON' ||
          livStat === 'LIVRAISON_EN_ATTENTE' ||
          livStat === 'EXPEDIEE');

      if (!isInProgress) return false;

      // Filter by search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchNum = (o.orderNumber || o.id || '').toLowerCase().includes(q);
        const matchClient = (o.customerName || '').toLowerCase().includes(q);
        const matchPhone = (o.phone || '').toLowerCase().includes(q);
        const matchCity = (o.shippingAddress?.city || '').toLowerCase().includes(q);
        const matchItem = (o.items || []).some((it: any) => (it.name || '').toLowerCase().includes(q));
        if (!matchNum && !matchClient && !matchPhone && !matchCity && !matchItem) return false;
      }

      // Filter by Planned Delivery Date
      const plannedDate = o.affectationLivraison?.dateLivraisonPrevue;
      if (dateFilterMode === 'all') return true;
      if (!plannedDate) return false;

      const todayStr = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

      if (dateFilterMode === 'today') {
        return plannedDate === todayStr;
      }
      if (dateFilterMode === 'tomorrow') {
        return plannedDate === tomorrow;
      }
      if (dateFilterMode === 'this_week') {
        const now = new Date();
        const target = new Date(plannedDate);
        const diffDays = Math.ceil((target.getTime() - now.getTime()) / (1000 * 3600 * 24));
        return diffDays >= -1 && diffDays <= 7;
      }
      if (dateFilterMode === 'custom' && customDate) {
        return plannedDate === customDate;
      }

      return true;
    });
  }, [carrierOrders, searchQuery, dateFilterMode, customDate]);

  // 3. Return Orders (ECHEC_LIVRAISON, RETOUR, RETOUR_EN_COURS, RETOUR_RECU_EN_STOCK, RETOUR_CONFIRME, RETOUR_AVARIE, RETOUR_ANNULE)
  const returnOrders = useMemo(() => {
    return carrierOrders.filter((o) => {
      const livStat = o.statutLivraison || '';
      const retStat = o.statutRetour || o.retourDetails?.statut || '';
      const isReturn =
        livStat === 'RETOUR' ||
        livStat === 'ECHEC_LIVRAISON' ||
        retStat.startsWith('RETOUR') ||
        !!o.echecDetails ||
        !!o.retourDetails;

      if (!isReturn) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchNum = (o.orderNumber || o.id || '').toLowerCase().includes(q);
        const matchClient = (o.customerName || '').toLowerCase().includes(q);
        const matchReason = (o.echecDetails?.motif || o.retourDetails?.motif || '').toLowerCase().includes(q);
        const matchItem = (o.items || []).some((it: any) => (it.name || '').toLowerCase().includes(q));
        return matchNum || matchClient || matchReason || matchItem;
      }
      return true;
    });
  }, [carrierOrders, searchQuery]);

  // Handler: Update Return Status
  const handleUpdateReturnStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnModalOrder) return;

    const orderId = returnModalOrder.id || returnModalOrder.orderNumber;
    try {
      const res = await centralApiRequest(`/orders/${orderId}/update-return-status`, {
        method: 'POST',
        body: JSON.stringify({
          nouvelEtatRetour: newReturnStatus,
          motif: returnReason,
          commentaire: returnComment
        })
      });

      if (res && !res.error) {
        showToast(
          `État retour mis à jour pour la commande ${orderId} : ${newReturnStatus}.`,
          'success'
        );
        setReturnModalOrder(null);
        if (onReloadOrders) onReloadOrders();
      } else {
        showToast(res?.message || 'Erreur lors de la mise à jour du retour.', 'error');
      }
    } catch (err: any) {
      showToast('Erreur serveur lors de la mise à jour du statut retour.', 'error');
    }
  };

  // Handler: Update Planned Delivery Date
  const handleUpdateDeliveryDateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateModalOrder) return;

    const orderId = dateModalOrder.id || dateModalOrder.orderNumber;
    try {
      const res = await centralApiRequest(`/orders/${orderId}/update-delivery-date`, {
        method: 'POST',
        body: JSON.stringify({
          dateLivraisonPrevue: newPlannedDate,
          creneauHoraire: newPlannedSlot,
          notes: newDateNotes
        })
      });

      if (res && !res.error) {
        showToast(
          `Date de livraison reprogrammée au ${newPlannedDate} (${newPlannedSlot}).`,
          'success'
        );
        setDateModalOrder(null);
        if (onReloadOrders) onReloadOrders();
      } else {
        showToast(res?.message || 'Erreur lors de la mise à jour de la date.', 'error');
      }
    } catch (err: any) {
      showToast('Erreur serveur lors de la mise à jour.', 'error');
    }
  };

  // Quick logistical actions for in-progress orders
  const handleSetInDelivery = async (orderId: string) => {
    try {
      const res = await centralApiRequest(`/orders/${orderId}/in-delivery`, { method: 'POST' });
      if (res && !res.error) {
        showToast(`Commande ${orderId} marquée "En cours de livraison".`, 'success');
        if (onReloadOrders) onReloadOrders();
      }
    } catch (e) {
      showToast('Erreur lors du passage en livraison.', 'error');
    }
  };

  const handleSetDelivered = async (orderId: string) => {
    try {
      const res = await centralApiRequest(`/orders/${orderId}/delivered`, {
        method: 'POST',
        body: JSON.stringify({ commentaire: 'Livraison confirmée par la société partenaire' })
      });
      if (res && !res.error) {
        showToast(`Commande ${orderId} confirmée LIVRÉE avec succès !`, 'success');
        if (onReloadOrders) onReloadOrders();
      }
    } catch (e) {
      showToast('Erreur lors de la confirmation de livraison.', 'error');
    }
  };

  const getShopBadge = (shopKey: string) => {
    if (shopKey === 'nutrition') {
      return { label: 'Fitness Shop', bg: 'bg-lime-100 text-lime-900 border-lime-300' };
    }
    if (shopKey === 'youpi') {
      return { label: 'YoupiShop', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
    }
    if (shopKey === 'dari') {
      return { label: 'DariShop', bg: 'bg-indigo-100 text-indigo-900 border-indigo-300' };
    }
    return { label: 'MultiShop', bg: 'bg-slate-100 text-slate-800 border-slate-300' };
  };

  const getReturnStatusBadge = (status: string) => {
    switch (status) {
      case 'RETOUR_EN_COURS':
        return { label: 'Retour en Transit', bg: 'bg-orange-100 text-orange-800 border-orange-300' };
      case 'RETOUR_RECU_EN_STOCK':
        return { label: 'Réceptionné & Remis en Stock', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'RETOUR_CONFIRME':
        return { label: 'Retour Validé & Clôturé', bg: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'ECHEC_LIVRAISON':
        return { label: 'Échec / À Reprogrammer', bg: 'bg-rose-100 text-rose-800 border-rose-300' };
      case 'RETOUR_AVARIE':
        return { label: 'Colis Avarié / Litige', bg: 'bg-red-100 text-red-800 border-red-300' };
      case 'RETOUR_ANNULE':
        return { label: 'Retour Annulé / Relivré', bg: 'bg-purple-100 text-purple-800 border-purple-300' };
      default:
        return { label: status || 'Retour en cours', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
    }
  };

  const selectedCarrier = carriers.find((c) => c.id === selectedCarrierId);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-3 transition-all animate-bounce ${
            toastMessage.type === 'success'
              ? 'bg-emerald-600 text-white'
              : toastMessage.type === 'error'
              ? 'bg-rose-600 text-white'
              : 'bg-slate-900 text-white'
          }`}
        >
          {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
          {toastMessage.type === 'error' && <XCircle className="w-4 h-4" />}
          {toastMessage.type === 'info' && <Truck className="w-4 h-4" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* TOP HEADER & ACTIONS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Truck className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black font-serif text-slate-900 dark:text-white">
                Sociétés de Livraison Partenaires
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Gestion complète (CRUD) des transporteurs, historique des commandes & produits affectés, commandes en cours et gestion des retours.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setEditingCarrier({
                nom: '',
                telephone: '+216 ',
                contact: 'Service Logistique',
                zones: '24 Gouvernorats',
                delaiMoyen: '24-48h',
                tarifDefaut: 7,
                actif: true,
                horairesTravail: [
                  {
                    id: `slot-${Date.now()}`,
                    jourDebut: 'Lundi',
                    jourFin: 'Vendredi',
                    heureDebut: '08:00',
                    heureFin: '18:00'
                  }
                ]
              });
              setCarrierModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-blue-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Société de Livraison</span>
          </button>

          {onReloadOrders && (
            <button
              type="button"
              onClick={onReloadOrders}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
              title="Rafraîchir les données"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* KPI METRICS OVERVIEW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Sociétés Actives</span>
            <Building2 className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {carriers.filter((c) => c.actif).length}{' '}
            <span className="text-xs font-normal text-slate-400">/ {carriers.length}</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Partenaires sous contrat</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Affectées</span>
            <Package className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {filialeOrders.filter((o) => !!o.affectationLivraison?.societeLivraisonNom).length}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Commandes confiées aux livreurs</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">En Cours de Livraison</span>
            <Truck className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {filialeOrders.filter(
              (o) =>
                !!o.affectationLivraison?.societeLivraisonNom &&
                (o.statutLivraison === 'EN_LIVRAISON' || o.statutLivraison === 'AFFECTEE_LIVRAISON')
            ).length}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Colis actuellement sur la route</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Commandes Retours</span>
            <RotateCcw className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-2xl font-black text-orange-600 dark:text-orange-400">
            {filialeOrders.filter(
              (o) =>
                o.statutLivraison === 'RETOUR' ||
                o.statutLivraison === 'ECHEC_LIVRAISON' ||
                (o.statutRetour && o.statutRetour.startsWith('RETOUR'))
            ).length}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Incidents ou retours en traitement</p>
        </div>
      </div>

      {/* CARRIER SELECTOR BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-slate-500">Filtrer par Transporteur :</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setSelectedCarrierId('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCarrierId === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Tous les transporteurs ({carriers.length})
              </button>

              {carriers.map((carrier) => {
                const count = filialeOrders.filter(
                  (o) =>
                    o.affectationLivraison?.societeLivraisonId === carrier.id ||
                    o.affectationLivraison?.societeLivraisonNom?.toLowerCase() === carrier.nom.toLowerCase()
                ).length;

                return (
                  <button
                    key={carrier.id}
                    type="button"
                    onClick={() => setSelectedCarrierId(carrier.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      selectedCarrierId === carrier.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    <span>{carrier.nom}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                        selectedCarrierId === carrier.id ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Shop Switcher */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400">Boutique :</span>
            <select
              value={filialeFilter}
              onChange={(e) => setFilialeFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <option value="all">Tout le Groupe (3 boutiques)</option>
              <option value="nutrition">Fitness Shop</option>
              <option value="youpi">YoupiShop</option>
              <option value="dari">DariShop</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION: Overview / Historique / En Cours / Retours */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setCurrentTab('overview')}
          className={`pb-3 px-2 sm:px-4 text-xs sm:text-sm font-black flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            currentTab === 'overview'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Fiche Sociétés & CRUD</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600">
            {carriers.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentTab('history')}
          className={`pb-3 px-2 sm:px-4 text-xs sm:text-sm font-black flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            currentTab === 'history'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Historique Commandes & Produits Déjà Affectés</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800">
            {historyOrders.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentTab('in_progress')}
          className={`pb-3 px-2 sm:px-4 text-xs sm:text-sm font-black flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            currentTab === 'in_progress'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Commandes En Cours & Dates Prévues</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-800">
            {inProgressOrders.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentTab('returns')}
          className={`pb-3 px-2 sm:px-4 text-xs sm:text-sm font-black flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            currentTab === 'returns'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Commandes Retour & Modification d'État</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-orange-100 text-orange-800 font-mono">
            {returnOrders.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW & CARRIERS CRUD (GESTION DES SOCIÉTÉS DE LIVRAISON)        */}
      {/* ========================================================================= */}
      {currentTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {carriers.map((carrier) => {
              const assignedOrders = filialeOrders.filter(
                (o) =>
                  o.affectationLivraison?.societeLivraisonId === carrier.id ||
                  o.affectationLivraison?.societeLivraisonNom?.toLowerCase() === carrier.nom.toLowerCase()
              );
              const inProgressCount = assignedOrders.filter(
                (o) => o.statutLivraison === 'EN_LIVRAISON' || o.statutLivraison === 'AFFECTEE_LIVRAISON'
              ).length;
              const deliveredCount = assignedOrders.filter((o) => o.statutLivraison === 'LIVREE').length;
              const returnCount = assignedOrders.filter(
                (o) =>
                  o.statutLivraison === 'RETOUR' ||
                  o.statutLivraison === 'ECHEC_LIVRAISON' ||
                  (o.statutRetour && o.statutRetour.startsWith('RETOUR'))
              ).length;

              const totalAmount = assignedOrders.reduce((sum, o) => sum + (o.total || o.totalAmount || 0), 0);

              const isSelected = selectedCarrierId === carrier.id;

              return (
                <div
                  key={carrier.id}
                  className={`bg-white dark:bg-slate-900 rounded-3xl p-5 border transition-all shadow-xs flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-500 ring-2 ring-blue-500/20'
                      : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header Card */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold text-lg shadow-inner">
                          <Truck className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-black text-base text-slate-900 dark:text-white">
                            {carrier.nom}
                          </h3>
                          <p className="text-xs text-slate-400 font-mono flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{carrier.telephone || '+216 -- --- ---'}</span>
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleCarrierActive(carrier)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase cursor-pointer border transition-colors ${
                          carrier.actif
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                        }`}
                        title="Cliquer pour activer/désactiver"
                      >
                        {carrier.actif ? '● Active' : '○ Inactive'}
                      </button>
                    </div>

                    {/* Carrier Specs */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl space-y-1.5 text-xs">
                      <p className="flex justify-between">
                        <span className="text-slate-400">Responsable :</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{carrier.contact}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-slate-400">Zones couvertes :</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-right max-w-[170px] truncate">
                          {carrier.zones}
                        </span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-slate-400">Délai moyen :</span>
                        <span className="font-bold text-blue-600">{carrier.delaiMoyen}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-slate-400">Tarif par défaut :</span>
                        <span className="font-black text-slate-900 dark:text-white">{carrier.tarifDefaut} DT</span>
                      </p>

                      {/* Horaires et jours de travail de la société */}
                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                        <span className="text-slate-400 flex items-center gap-1 mb-1 font-bold text-[11px]">
                          <Clock className="w-3 h-3 text-blue-500" />
                          <span>Jours & Horaires de travail :</span>
                        </span>
                        <div className="space-y-1">
                          {carrier.horairesTravail && carrier.horairesTravail.length > 0 ? (
                            carrier.horairesTravail.map((h, hIdx) => (
                              <div
                                key={hIdx}
                                className="flex items-center justify-between px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[11px]"
                              >
                                <span className="font-bold text-slate-700 dark:text-slate-200">
                                  {h.jourDebut === h.jourFin ? h.jourDebut : `${h.jourDebut} à ${h.jourFin}`}
                                </span>
                                <span className="font-black text-blue-600 dark:text-blue-400 font-mono">
                                  {h.heureDebut} - {h.heureFin}
                                </span>
                              </div>
                            ))
                          ) : carrier.joursTravailTexte ? (
                            <p className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                              {carrier.joursTravailTexte}
                            </p>
                          ) : (
                            <p className="text-slate-400 italic text-[11px]">Lundi à Vendredi (08:00 - 18:00)</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Summary mini metrics */}
                    <div className="grid grid-cols-4 gap-1.5 text-center pt-1 text-[10px]">
                      <div className="bg-slate-50 dark:bg-slate-800/80 p-2 rounded-xl">
                        <span className="text-slate-400 block font-semibold">Total</span>
                        <span className="font-black text-xs text-slate-900 dark:text-white">{assignedOrders.length}</span>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-950/40 p-2 rounded-xl text-blue-700 dark:text-blue-300">
                        <span className="block font-semibold">En cours</span>
                        <span className="font-black text-xs">{inProgressCount}</span>
                      </div>
                      <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-xl text-emerald-700 dark:text-emerald-300">
                        <span className="block font-semibold">Livrées</span>
                        <span className="font-black text-xs">{deliveredCount}</span>
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-950/40 p-2 rounded-xl text-orange-700 dark:text-orange-300">
                        <span className="block font-semibold">Retours</span>
                        <span className="font-black text-xs">{returnCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCarrierId(carrier.id);
                        setCurrentTab('in_progress');
                      }}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Voir les colis ({assignedOrders.length})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          const existingHoraires = carrier.horairesTravail && carrier.horairesTravail.length > 0
                            ? carrier.horairesTravail
                            : [
                                {
                                  id: `slot-${Date.now()}`,
                                  jourDebut: 'Lundi',
                                  jourFin: 'Vendredi',
                                  heureDebut: '08:00',
                                  heureFin: '18:00'
                                }
                              ];
                          setEditingCarrier({
                            ...carrier,
                            horairesTravail: existingHoraires
                          });
                          setCarrierModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        title="Modifier cette société"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCarrier(carrier.id, carrier.nom)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                        title="Supprimer cette société"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: HISTORIQUE DES COMMANDES & PRODUITS DÉJÀ AFFECTÉS (EN DÉTAIL)        */}
      {/* ========================================================================= */}
      {currentTab === 'history' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[260px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par référence, produit, client, téléphone, ville..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="text-xs font-bold text-slate-500">
              {historyOrders.length} commande(s) répertoriée(s) pour{' '}
              <strong className="text-blue-600">
                {selectedCarrier ? selectedCarrier.nom : 'Tous les transporteurs'}
              </strong>
            </div>
          </div>

          {/* List of Orders with detailed products */}
          {historyOrders.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-2">
              <Package className="w-10 h-10 mx-auto opacity-30 text-slate-400" />
              <p className="font-bold text-slate-700 dark:text-slate-300">Aucune commande affectée trouvée.</p>
              <p className="text-xs">Modifiez les filtres de recherche ou sélectionnez un autre transporteur.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {historyOrders.map((order) => {
                const aff = order.affectationLivraison || {};
                const livStat = order.statutLivraison || 'NON_INITIEE';
                const cmdStat = order.statutCommande || order.status;

                return (
                  <div
                    key={order.id || order.orderNumber}
                    className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4 hover:border-slate-200 transition-all"
                  >
                    {/* Top Row: Ref, Carrier, Date, Client, Total */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3">
                      <div className="flex items-center gap-3">
                        <span className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 font-mono font-black text-xs">
                          {order.orderNumber || order.id}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-sm text-slate-900 dark:text-white">
                              {order.customerName}
                            </h4>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              <span>{order.phone}</span>
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <MapPin className="w-3 h-3 text-emerald-500" />
                            <span>
                              {order.shippingAddress?.city || 'Tunis'} — {order.shippingAddress?.street || 'Adresse client'}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end md:self-auto">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">
                            Transporteur :
                          </span>
                          <span className="font-extrabold text-xs text-blue-600">
                            🚚 {aff.societeLivraisonNom || 'Transporteur Partenaire'}
                          </span>
                        </div>

                        <div className="text-right pl-3 border-l border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">
                            Montant TTC :
                          </span>
                          <span className="font-black text-base text-slate-900 dark:text-white">
                            {(order.total || order.totalAmount || 0).toLocaleString('fr-FR')} DT
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setInspectOrder(order)}
                          className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer flex items-center gap-1"
                          title="Voir la commande complète et l'audit"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Détails</span>
                        </button>
                      </div>
                    </div>

                    {/* Timing details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-2xl">
                      <div>
                        <span className="text-slate-400">Date Commande :</span>{' '}
                        <strong className="text-slate-700 dark:text-slate-300">{order.date || '—'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Date Affectation :</span>{' '}
                        <strong className="text-slate-700 dark:text-slate-300">
                          {aff.dateAffectation || order.date || '—'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Date Livraison Prévue :</span>{' '}
                        <strong className="text-blue-600 font-bold">
                          {aff.dateLivraisonPrevue || 'Non définie'} ({aff.creneauHoraire || 'Journée'})
                        </strong>
                      </div>
                    </div>

                    {/* DÉTAIL DES PRODUITS DE LA COMMANDE */}
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-blue-500" />
                        <span>Produits affectés en détail ({order.items?.length || 0} article(s)) :</span>
                      </p>

                      <div className="border border-slate-100 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                        {(order.items || []).map((item: any, idx: number) => {
                          const badge = getShopBadge(item.shopId || order.filialeKey);
                          return (
                            <div
                              key={idx}
                              className="p-3 flex items-center justify-between text-xs hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {item.imageUrl ? (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-12 h-12 object-contain rounded-xl bg-slate-50 dark:bg-slate-800 p-1 border border-slate-200/80 dark:border-slate-700 shrink-0"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                    <Package className="w-5 h-5" />
                                  </div>
                                )}

                                <div className="min-w-0">
                                  <h5 className="font-bold text-slate-900 dark:text-white truncate max-w-md">
                                    {item.name}
                                  </h5>
                                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                    <span
                                      className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold border uppercase ${badge.bg}`}
                                    >
                                      {item.shopName || badge.label}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      Réf #{item.productId || item.id || idx + 1}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-semibold">
                                      P.U : {(item.price || 0).toLocaleString('fr-FR')} DT
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="text-xs font-black text-slate-900 dark:text-white block">
                                  {((item.price || 0) * (item.quantity || 1)).toLocaleString('fr-FR')} DT
                                </span>
                                <span className="text-[11px] font-bold text-slate-400">
                                  Qté : {item.quantity || 1}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: COMMANDES EN COURS & FILTRE PAR DATE DE LIVRAISON                    */}
      {/* ========================================================================= */}
      {currentTab === 'in_progress' && (
        <div className="space-y-5">
          {/* Filter Bar with Date Picker & Shortcuts */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span>Filtrer les livraisons en cours par date</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Consultez les livraisons planifiées pour aujourd'hui, demain ou sur une date précise.
                </p>
              </div>

              {/* Date Shortcuts Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setDateFilterMode('all');
                    setCustomDate('');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    dateFilterMode === 'all'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Toutes les dates
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDateFilterMode('today');
                    setCustomDate('');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    dateFilterMode === 'today'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Aujourd'hui
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDateFilterMode('tomorrow');
                    setCustomDate('');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    dateFilterMode === 'tomorrow'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Demain
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDateFilterMode('this_week');
                    setCustomDate('');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    dateFilterMode === 'this_week'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Cette Semaine
                </button>
              </div>
            </div>

            {/* Custom Date Input & Search */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Ou choisir une date exacte de livraison :
                </span>
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => {
                    setCustomDate(e.target.value);
                    setDateFilterMode('custom');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white cursor-pointer"
                />
                {customDate && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomDate('');
                      setDateFilterMode('all');
                    }}
                    className="text-xs text-rose-500 font-bold hover:underline cursor-pointer"
                  >
                    Effacer
                  </button>
                )}
              </div>

              <div className="relative min-w-[240px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher client, adresse, article..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>
            </div>
          </div>

          {/* List of in-progress orders */}
          {inProgressOrders.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-2">
              <Truck className="w-10 h-10 mx-auto opacity-30 text-blue-500" />
              <p className="font-bold text-slate-700 dark:text-slate-300">
                Aucune commande en cours pour cette date / ce filtre.
              </p>
              <p className="text-xs">
                Cliquez sur "Toutes les dates" pour voir l'ensemble des livraisons en cours.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {inProgressOrders.map((order) => {
                const aff = order.affectationLivraison || {};
                const livStat = order.statutLivraison || 'NON_INITIEE';

                return (
                  <div
                    key={order.id || order.orderNumber}
                    className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4"
                  >
                    {/* Header: Status, Date, Client */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3">
                      <div className="flex items-center gap-3">
                        <span className="p-2.5 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono font-black text-xs">
                          {order.orderNumber || order.id}
                        </span>
                        <div>
                          <h4 className="font-black text-sm text-slate-900 dark:text-white">
                            {order.customerName}
                          </h4>
                          <p className="text-xs text-slate-500 flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-emerald-500" />
                            <span>
                              {order.shippingAddress?.city} — {order.shippingAddress?.street}
                            </span>
                            <span>•</span>
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{order.phone}</span>
                          </p>
                        </div>
                      </div>

                      {/* Scheduled delivery badge */}
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 px-3 py-1.5 rounded-xl text-right">
                          <span className="text-[10px] text-blue-600 uppercase font-black block">
                            Date Prévue de Livraison :
                          </span>
                          <span className="text-xs font-black text-blue-900 dark:text-blue-200">
                            📅 {aff.dateLivraisonPrevue || 'À planifier'} ({aff.creneauHoraire || 'Journée'})
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setDateModalOrder(order);
                            setNewPlannedDate(aff.dateLivraisonPrevue || '');
                            setNewPlannedSlot(aff.creneauHoraire || '09:00 - 13:00');
                            setNewDateNotes(aff.instructions || '');
                          }}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                          title="Modifier la date ou le créneau de livraison"
                        >
                          <Calendar className="w-4 h-4 text-blue-600" />
                        </button>
                      </div>
                    </div>

                    {/* Products details */}
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                        Articles du colis ({order.items?.length || 0}) :
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {(order.items || []).map((item: any, i: number) => {
                          const badge = getShopBadge(item.shopId || order.filialeKey);
                          return (
                            <div
                              key={i}
                              className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-2.5 text-xs"
                            >
                              {item.imageUrl && (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-10 h-10 object-contain rounded-lg bg-white dark:bg-slate-900 p-0.5 border border-slate-200 shrink-0"
                                />
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="font-bold text-slate-900 dark:text-white truncate">
                                  {item.name}
                                </p>
                                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                                  <span className="font-semibold text-blue-600">{badge.label}</span>
                                  <span className="font-bold text-slate-700 dark:text-slate-300">
                                    Qté: {item.quantity || 1}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quick logistical action buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-400">Transporteur :</span>
                        <strong className="text-slate-800 dark:text-slate-200">
                          {aff.societeLivraisonNom || 'Non assigné'}
                        </strong>
                        <span>•</span>
                        <span className="text-slate-400">Total à encaisser :</span>
                        <strong className="text-emerald-600 font-black">
                          {(order.total || order.totalAmount || 0).toLocaleString('fr-FR')} DT (Espèces COD)
                        </strong>
                      </div>

                      <div className="flex items-center gap-2">
                        {livStat === 'AFFECTEE_LIVRAISON' && (
                          <button
                            type="button"
                            onClick={() => handleSetInDelivery(order.id || order.orderNumber)}
                            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Passer en Cours de Livraison</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleSetDelivered(order.id || order.orderNumber)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Confirmer Colis Livré</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setReturnModalOrder(order);
                            setNewReturnStatus('ECHEC_LIVRAISON');
                            setReturnReason('Client absent lors du passage du transporteur');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Signaler Échec / Retour</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: COMMANDES RETOUR & MODIFICATION DE L'ÉTAT RETOUR                   */}
      {/* ========================================================================= */}
      {currentTab === 'returns' && (
        <div className="space-y-4">
          {/* Header & info banner */}
          <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 rounded-3xl p-5 text-orange-950 dark:text-orange-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="font-black text-base flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-orange-600" />
                <span>Gestion Centralisée des Retours & Incidents Transporteur</span>
              </h3>
              <p className="text-xs text-orange-800 dark:text-orange-300 mt-0.5">
                Modifiez l'état de chaque commande retour (transit, réception au dépôt avec réintégration en stock, litige ou clôture).
              </p>
            </div>
            <div className="text-xs font-black bg-white dark:bg-slate-900 px-3.5 py-2 rounded-2xl border border-orange-200 dark:border-orange-800 text-orange-700">
              {returnOrders.length} colis en retour
            </div>
          </div>

          {/* Return Orders List */}
          {returnOrders.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 opacity-60" />
              <p className="font-bold text-slate-700 dark:text-slate-300">Aucun retour en cours !</p>
              <p className="text-xs">Tous les colis ont été livrés avec succès par les transporteurs.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {returnOrders.map((order) => {
                const aff = order.affectationLivraison || {};
                const ret = order.retourDetails || {};
                const ech = order.echecDetails || {};
                const currentRetStatus = order.statutRetour || ret.statut || order.statutLivraison;
                const statusBadge = getReturnStatusBadge(currentRetStatus);

                return (
                  <div
                    key={order.id || order.orderNumber}
                    className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4"
                  >
                    {/* Top Row */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3">
                      <div className="flex items-center gap-3">
                        <span className="p-2.5 rounded-2xl bg-orange-100 text-orange-800 font-mono font-black text-xs">
                          {order.orderNumber || order.id}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-sm text-slate-900 dark:text-white">
                              {order.customerName}
                            </h4>
                            <span className="text-xs text-slate-400">({order.phone})</span>
                          </div>
                          <p className="text-xs text-slate-500">
                            {order.shippingAddress?.city} — {order.shippingAddress?.street}
                          </p>
                        </div>
                      </div>

                      {/* Status and Change button */}
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">
                            État Actuel du Retour :
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black border ${statusBadge.bg}`}
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>{statusBadge.label}</span>
                          </span>
                        </div>

                        {/* BUTTON TO MODIFY RETURN STATUS */}
                        <button
                          type="button"
                          onClick={() => {
                            setReturnModalOrder(order);
                            setNewReturnStatus(currentRetStatus || 'RETOUR_EN_COURS');
                            setReturnReason(ret.motif || ech.motif || 'Retour client');
                            setReturnComment(ret.commentaire || ech.commentaire || '');
                          }}
                          className="px-3.5 py-2 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-orange-500/20 active:scale-95 transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Modifier l'État Retour</span>
                        </button>
                      </div>
                    </div>

                    {/* Reason and comments banner */}
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 font-bold block mb-0.5">Motif signalé :</span>
                        <p className="font-extrabold text-slate-800 dark:text-slate-200">
                          ⚠️ {ret.motif || ech.motif || 'Non spécifié'}
                        </p>
                        {(ret.commentaire || ech.commentaire) && (
                          <p className="text-slate-500 mt-1 italic">
                            « {ret.commentaire || ech.commentaire} »
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <p className="flex justify-between">
                          <span className="text-slate-400">Transporteur assigné :</span>
                          <span className="font-bold text-blue-600">
                            {aff.societeLivraisonNom || 'Transporteur Partenaire'}
                          </span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-slate-400">Impact stock :</span>
                          <span className="font-bold text-emerald-600">
                            {ret.stockRestitue
                              ? '✓ Stock réintégré au dépôt central'
                              : '🔒 En attente de réintégration'}
                          </span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-slate-400">Date de déclaration :</span>
                          <span className="font-mono text-slate-500">
                            {ech.dateEchec || ret.dateModification || order.date || '—'}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Articles list */}
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                        Articles faisant l'objet du retour ({order.items?.length || 0}) :
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {(order.items || []).map((item: any, i: number) => {
                          const badge = getShopBadge(item.shopId || order.filialeKey);
                          return (
                            <div
                              key={i}
                              className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {item.imageUrl && (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-10 h-10 object-contain rounded-lg bg-white dark:bg-slate-900 p-0.5 border border-slate-200 shrink-0"
                                  />
                                )}
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-900 dark:text-white truncate">
                                    {item.name}
                                  </p>
                                  <span className="text-[10px] text-blue-600 font-semibold">
                                    {badge.label}
                                  </span>
                                </div>
                              </div>
                              <span className="font-black text-slate-900 dark:text-white shrink-0">
                                {item.quantity || 1} unité(s)
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: MODIFIER L'ÉTAT DU RETOUR (POSSIBILITÉ DE MODIFIER L'ÉTAT RETOUR)  */}
      {/* ========================================================================= */}
      {returnModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <form
            onSubmit={handleUpdateReturnStatusSubmit}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full p-4 sm:p-6 text-slate-900 dark:text-white space-y-5 border border-slate-100 dark:border-slate-800 my-auto max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base">
                    Modifier l'État de la Commande Retour
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {returnModalOrder.orderNumber || returnModalOrder.id} — {returnModalOrder.customerName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReturnModalOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Select new status */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Nouvel État du Retour *
                </label>
                <select
                  value={newReturnStatus}
                  onChange={(e) => setNewReturnStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                >
                  <option value="RETOUR_EN_COURS">🚚 RETOUR_EN_COURS — Colis en transit retour vers dépôt central</option>
                  <option value="RETOUR_RECU_EN_STOCK">📦 RETOUR_RECU_EN_STOCK — Réceptionné au dépôt & Remis en stock</option>
                  <option value="RETOUR_CONFIRME">✅ RETOUR_CONFIRME — Retour validé & dossier clôturé</option>
                  <option value="ECHEC_LIVRAISON">⚠️ ECHEC_LIVRAISON — Échec temporaire (2ème passage à planifier)</option>
                  <option value="RETOUR_AVARIE">🚨 RETOUR_AVARIE — Colis avarié / Réclamation transporteur</option>
                  <option value="RETOUR_ANNULE">🔄 RETOUR_ANNULE — Retour annulé (Colis finalement remis au client)</option>
                </select>
              </div>

              {/* Automated note about stock restoration */}
              {newReturnStatus === 'RETOUR_RECU_EN_STOCK' && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 text-emerald-900 dark:text-emerald-200 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Règle automatique de restockage :</span>
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    Les articles retournés seront immédiatement réintégrés dans les stocks disponibles de la filiale correspondante.
                  </p>
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Motif du Retour
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                >
                  <option value="Client injoignable après 3 appels">Client injoignable après 3 appels</option>
                  <option value="Client absent lors du passage du transporteur">Client absent lors du passage du transporteur</option>
                  <option value="Refus du client à la livraison">Refus du client à la livraison</option>
                  <option value="Adresse de livraison introuvable / erronée">Adresse de livraison introuvable / erronée</option>
                  <option value="Colis endommagé ou avarie durant le transport">Colis endommagé ou avarie durant le transport</option>
                  <option value="Demande d'annulation exprimée par le client">Demande d'annulation exprimée par le client</option>
                  <option value="Autre motif logistique">Autre motif logistique</option>
                </select>
              </div>

              {/* Internal commentary */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Note d'exploitation / Remarque transporteur
                </label>
                <textarea
                  rows={2}
                  value={returnComment}
                  onChange={(e) => setReturnComment(e.target.value)}
                  placeholder="Ex: Confirmation reçue du centre de tri, colis retourné en parfait état..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setReturnModalOrder(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold cursor-pointer shadow-md shadow-orange-500/20"
              >
                Valider la Mise à Jour du Retour
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: MODIFIER LA DATE DE LIVRAISON                                    */}
      {/* ========================================================================= */}
      {dateModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <form
            onSubmit={handleUpdateDeliveryDateSubmit}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-4 sm:p-6 text-slate-900 dark:text-white space-y-4 border border-slate-100 dark:border-slate-800 my-auto max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span>Modifier la Date de Livraison</span>
              </h3>
              <button
                type="button"
                onClick={() => setDateModalOrder(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Date Prévue *</label>
                <input
                  type="date"
                  required
                  value={newPlannedDate}
                  onChange={(e) => setNewPlannedDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Créneau Horaire</label>
                <select
                  value={newPlannedSlot}
                  onChange={(e) => setNewPlannedSlot(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                >
                  <option value="09:00 - 13:00">Matin (09:00 - 13:00)</option>
                  <option value="14:00 - 18:00">Après-midi (14:00 - 18:00)</option>
                  <option value="Toute la journée">Toute la journée</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Consignes Transporteur</label>
                <input
                  type="text"
                  value={newDateNotes}
                  onChange={(e) => setNewDateNotes(e.target.value)}
                  placeholder="Ex: Le client a confirmé sa présence en après-midi..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDateModalOrder(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold cursor-pointer"
              >
                Enregistrer la Date
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: AJOUTER / MODIFIER UNE SOCIÉTÉ DE LIVRAISON (CRUD)               */}
      {/* ========================================================================= */}
      {carrierModalOpen && editingCarrier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <form
            onSubmit={handleSaveCarrier}
            className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl max-w-xl sm:max-w-2xl w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto p-3.5 sm:p-6 text-slate-900 dark:text-white space-y-4 border border-slate-100 dark:border-slate-800 my-auto"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base">
                    {editingCarrier.id ? 'Modifier la Société de Livraison' : 'Nouvelle Société de Livraison'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Configuration des coordonnées, zones et créneaux horaires hebdomadaires
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCarrierModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center cursor-pointer text-sm font-bold hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold block mb-1">Nom de la Société *</label>
                <input
                  type="text"
                  required
                  value={editingCarrier.nom || ''}
                  onChange={(e) => setEditingCarrier({ ...editingCarrier, nom: e.target.value })}
                  placeholder="Ex: Aramex Tunisie, Yalidine, Express Pro..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Téléphone de Contact</label>
                  <input
                    type="text"
                    value={editingCarrier.telephone || ''}
                    onChange={(e) => setEditingCarrier({ ...editingCarrier, telephone: e.target.value })}
                    placeholder="+216 -- --- ---"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Responsable / Contact</label>
                  <input
                    type="text"
                    value={editingCarrier.contact || ''}
                    onChange={(e) => setEditingCarrier({ ...editingCarrier, contact: e.target.value })}
                    placeholder="Service Logistique"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Gouvernorats & Zones Desservies</label>
                <input
                  type="text"
                  value={editingCarrier.zones || ''}
                  onChange={(e) => setEditingCarrier({ ...editingCarrier, zones: e.target.value })}
                  placeholder="Ex: 24 Gouvernorats, Grand Tunis & Sahel..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Délai Moyen Estimé</label>
                  <input
                    type="text"
                    value={editingCarrier.delaiMoyen || ''}
                    onChange={(e) => setEditingCarrier({ ...editingCarrier, delaiMoyen: e.target.value })}
                    placeholder="24-48h"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Tarif Standard (DT)</label>
                  <input
                    type="number"
                    value={editingCarrier.tarifDefaut ?? 7}
                    onChange={(e) => setEditingCarrier({ ...editingCarrier, tarifDefaut: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>
              </div>

              {/* ========================================================================= */}
              {/* SECTION: JOURS DE TRAVAIL DANS LA SEMAINE & INTERVALLES HORAIRES         */}
              {/* ========================================================================= */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-black text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span>Jours de travail dans la semaine (Intervalles) *</span>
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Pour chaque intervalle de jours sélectionné, un intervalle horaire s'ouvre avec obligation de saisie.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const currentSlots = editingCarrier.horairesTravail || [];
                      setEditingCarrier({
                        ...editingCarrier,
                        horairesTravail: [
                          ...currentSlots,
                          {
                            id: `slot-${Date.now()}`,
                            jourDebut: 'Samedi',
                            jourFin: 'Samedi',
                            heureDebut: '08:30',
                            heureFin: '13:00'
                          }
                        ]
                      });
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 font-black text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter un intervalle</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(editingCarrier.horairesTravail || []).map((slot, index) => {
                    const isMissingHourly = !slot.heureDebut || !slot.heureFin;
                    const isInvalidRange = Boolean(slot.heureDebut && slot.heureFin && slot.heureDebut >= slot.heureFin);

                    return (
                      <div
                        key={slot.id || index}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          isMissingHourly || isInvalidRange
                            ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 ring-1 ring-amber-300/50'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {/* Header of Interval */}
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-[10px] flex items-center justify-center">
                              {index + 1}
                            </span>
                            <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">
                              Intervalle de Jours : <span className="text-blue-600 dark:text-blue-400 font-bold">{slot.jourDebut}</span> à <span className="text-blue-600 dark:text-blue-400 font-bold">{slot.jourFin}</span>
                            </span>
                          </div>

                          {(editingCarrier.horairesTravail || []).length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (editingCarrier.horairesTravail || []).filter((_, idx) => idx !== index);
                                setEditingCarrier({ ...editingCarrier, horairesTravail: updated });
                              }}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                              title="Supprimer cet intervalle de jours"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Quick Day Presets */}
                        <div className="mb-2.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Raccourcis Intervalle de Jours :
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              { label: 'Lun - Ven', start: 'Lundi', end: 'Vendredi' },
                              { label: 'Lun - Sam', start: 'Lundi', end: 'Samedi' },
                              { label: '7j/7 (Lun - Dim)', start: 'Lundi', end: 'Dimanche' },
                              { label: 'Samedi uniquement', start: 'Samedi', end: 'Samedi' }
                            ].map((preset) => {
                              const isActive = slot.jourDebut === preset.start && slot.jourFin === preset.end;
                              return (
                                <button
                                  key={preset.label}
                                  type="button"
                                  onClick={() => {
                                    const updated = [...(editingCarrier.horairesTravail || [])];
                                    updated[index] = {
                                      ...updated[index],
                                      jourDebut: preset.start,
                                      jourFin: preset.end
                                    };
                                    setEditingCarrier({ ...editingCarrier, horairesTravail: updated });
                                  }}
                                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                    isActive
                                      ? 'bg-blue-600 text-white shadow-xs'
                                      : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 border border-slate-200 dark:border-slate-600'
                                  }`}
                                >
                                  {preset.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Day Range Selectors */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div>
                            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                              Jour de début *
                            </label>
                            <select
                              value={slot.jourDebut}
                              onChange={(e) => {
                                const updated = [...(editingCarrier.horairesTravail || [])];
                                updated[index] = { ...updated[index], jourDebut: e.target.value };
                                setEditingCarrier({ ...editingCarrier, horairesTravail: updated });
                              }}
                              className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-bold text-xs"
                            >
                              {JOURS_SEMAINE.map((jour) => (
                                <option key={jour} value={jour}>{jour}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                              Jour de fin *
                            </label>
                            <select
                              value={slot.jourFin}
                              onChange={(e) => {
                                const updated = [...(editingCarrier.horairesTravail || [])];
                                updated[index] = { ...updated[index], jourFin: e.target.value };
                                setEditingCarrier({ ...editingCarrier, horairesTravail: updated });
                              }}
                              className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-bold text-xs"
                            >
                              {JOURS_SEMAINE.map((jour) => (
                                <option key={jour} value={jour}>{jour}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* OBLIGATORY HOURLY INTERVAL OPENING FOR THIS DAY RANGE */}
                        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border-2 border-blue-500/40 dark:border-blue-500/30 shadow-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="font-black text-slate-900 dark:text-white flex items-center gap-1.5 text-[11px]">
                              <Clock className="w-3.5 h-3.5 text-blue-600" />
                              <span>Intervalle Horaire Obligatoire ({slot.jourDebut} - {slot.jourFin}) *</span>
                            </label>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                              Obligation
                            </span>
                          </div>

                          {/* Quick time slots buttons */}
                          <div className="flex flex-wrap gap-1">
                            {[
                              { label: '08:00 - 18:00', start: '08:00', end: '18:00' },
                              { label: '08:30 - 17:30', start: '08:30', end: '17:30' },
                              { label: '09:00 - 19:00', start: '09:00', end: '19:00' },
                              { label: '08:30 - 13:00 (Matin)', start: '08:30', end: '13:00' }
                            ].map((timePreset) => {
                              const isSelectedTime = slot.heureDebut === timePreset.start && slot.heureFin === timePreset.end;
                              return (
                                <button
                                  key={timePreset.label}
                                  type="button"
                                  onClick={() => {
                                    const updated = [...(editingCarrier.horairesTravail || [])];
                                    updated[index] = {
                                      ...updated[index],
                                      heureDebut: timePreset.start,
                                      heureFin: timePreset.end
                                    };
                                    setEditingCarrier({ ...editingCarrier, horairesTravail: updated });
                                  }}
                                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                                    isSelectedTime
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                                  }`}
                                >
                                  {timePreset.label}
                                </button>
                              );
                            })}
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                                Heure d'ouverture / Début *
                              </label>
                              <input
                                type="time"
                                required
                                value={slot.heureDebut || ''}
                                onChange={(e) => {
                                  const updated = [...(editingCarrier.horairesTravail || [])];
                                  updated[index] = { ...updated[index], heureDebut: e.target.value };
                                  setEditingCarrier({ ...editingCarrier, horairesTravail: updated });
                                }}
                                className={`w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border text-xs font-bold ${
                                  !slot.heureDebut ? 'border-rose-400 ring-1 ring-rose-300' : 'border-slate-200 dark:border-slate-700'
                                }`}
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                                Heure de fermeture / Fin *
                              </label>
                              <input
                                type="time"
                                required
                                value={slot.heureFin || ''}
                                onChange={(e) => {
                                  const updated = [...(editingCarrier.horairesTravail || [])];
                                  updated[index] = { ...updated[index], heureFin: e.target.value };
                                  setEditingCarrier({ ...editingCarrier, horairesTravail: updated });
                                }}
                                className={`w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border text-xs font-bold ${
                                  !slot.heureFin ? 'border-rose-400 ring-1 ring-rose-300' : 'border-slate-200 dark:border-slate-700'
                                }`}
                              />
                            </div>
                          </div>

                          {isMissingHourly && (
                            <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 pt-0.5">
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              <span>Obligation : Vous devez obligatoirement choisir l'intervalle horaire pour cet intervalle de jours.</span>
                            </p>
                          )}

                          {isInvalidRange && (
                            <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 pt-0.5">
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              <span>L'heure de fin ({slot.heureFin}) doit être postérieure à l'heure de début ({slot.heureDebut}).</span>
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={editingCarrier.actif !== false}
                    onChange={(e) => setEditingCarrier({ ...editingCarrier, actif: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>Société active pour l'affectation automatique et manuelle</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 sticky bottom-0 bg-white dark:bg-slate-900 pb-1">
              <button
                type="button"
                onClick={() => setCarrierModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold cursor-pointer shadow-md shadow-blue-500/20"
              >
                Enregistrer la Société
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: INSPECT COMMANDE (DÉTAILS DES PRODUITS & HISTORIQUE AUDIT)       */}
      {/* ========================================================================= */}
      {inspectOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-xl w-full p-4 sm:p-6 text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto space-y-5 border border-slate-100 dark:border-slate-800 my-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base">
                    Commande #{inspectOrder.orderNumber || inspectOrder.id}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Client : {inspectOrder.customerName} ({inspectOrder.phone})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Carrier assignment card */}
            <div className="bg-blue-50 dark:bg-blue-950/40 p-3.5 rounded-2xl border border-blue-100 dark:border-blue-900 text-xs space-y-1">
              <p className="font-extrabold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-blue-600" />
                <span>Affectation Logistique :</span>
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                Transporteur : <strong>{inspectOrder.affectationLivraison?.societeLivraisonNom || 'Non assigné'}</strong>
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                Date prévue : <strong>{inspectOrder.affectationLivraison?.dateLivraisonPrevue || 'Non spécifiée'}</strong> (Créneau : {inspectOrder.affectationLivraison?.creneauHoraire || 'Journée'})
              </p>
              {inspectOrder.affectationLivraison?.instructions && (
                <p className="text-slate-600 italic">
                  Instructions : « {inspectOrder.affectationLivraison.instructions} »
                </p>
              )}
            </div>

            {/* Articles list */}
            <div>
              <p className="font-extrabold text-xs uppercase tracking-wider text-slate-500 mb-2">
                Produits commandés ({inspectOrder.items?.length || 0}) :
              </p>
              <div className="border border-slate-100 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:border-slate-800 overflow-hidden">
                {(inspectOrder.items || []).map((itm: any, idx: number) => {
                  const b = getShopBadge(itm.shopId || inspectOrder.filialeKey);
                  return (
                    <div key={idx} className="p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        {itm.imageUrl && (
                          <img
                            src={itm.imageUrl}
                            alt={itm.name}
                            className="w-10 h-10 object-contain rounded-lg bg-slate-50 p-1 border"
                          />
                        )}
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{itm.name}</p>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase border ${b.bg}`}>
                            {itm.shopName || b.label}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-slate-900 dark:text-white block">
                          {(itm.price * (itm.quantity || 1)).toLocaleString('fr-FR')} DT
                        </span>
                        <span className="text-[10px] text-slate-400">Qté : {itm.quantity || 1}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center pt-3 text-sm font-black border-t border-slate-100 dark:border-slate-800 mt-2">
                <span>Total Commande :</span>
                <span className="text-blue-600 text-base">
                  {(inspectOrder.total || inspectOrder.totalAmount || 0).toLocaleString('fr-FR')} DT
                </span>
              </div>
            </div>

            {/* Audit log history */}
            <div>
              <p className="font-extrabold text-xs uppercase tracking-wider text-slate-500 mb-2">
                Journal d'Audit & Événements :
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {(inspectOrder.historique || []).map((h: any, i: number) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs border border-slate-100 dark:border-slate-800 space-y-0.5"
                  >
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span className="font-bold text-blue-600">{h.auteur || 'ADMINISTRATEUR'}</span>
                      <span>{h.date} {h.heure || ''}</span>
                    </div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{h.action}</p>
                    <p className="text-[11px] text-slate-500">{h.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setInspectOrder(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
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
