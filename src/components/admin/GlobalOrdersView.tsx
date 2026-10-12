import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Filter,
  Eye,
  Printer,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Truck,
  Package,
  Receipt,
  Archive,
  ArrowRight,
  RotateCcw,
  Plus,
  Trash2,
  Edit3,
  Building2,
  Calendar,
  DollarSign,
  ShieldCheck,
  User,
  Phone,
  MapPin,
  FileText,
  Sparkles,
  Layers,
  ChevronRight,
  ExternalLink,
  Check,
  AlertTriangle,
  Send,
  HelpCircle
} from 'lucide-react';
import { centralApiRequest } from '../../services/apiClient';
import { DeliveryCompaniesView } from './DeliveryCompaniesView';

interface GlobalOrdersViewProps {
  orders: any[];
  onUpdateOrderStatus?: (orderId: string, status: string) => Promise<void>;
  activeShop?: string;
  onSelectShop?: (shop: string) => void;
  onReloadOrders?: () => void;
}

export interface DeliveryCompany {
  id: string;
  nom: string;
  telephone: string;
  contact: string;
  zones: string;
  delaiMoyen: string;
  tarifDefaut: number;
  actif: boolean;
}

export const GlobalOrdersView: React.FC<GlobalOrdersViewProps> = ({
  orders,
  onUpdateOrderStatus,
  activeShop = 'all',
  onSelectShop,
  onReloadOrders
}) => {
  // Navigation & Sub-views: 'orders' | 'carriers' | 'scenarios'
  const [activeTab, setActiveTab] = useState<'orders' | 'carriers' | 'scenarios'>('orders');

  // Filters
  const [filialeFilter, setFilialeFilter] = useState(activeShop);
  const [workflowStage, setWorkflowStage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected orders for Batch Assignment (Règles 15, 16, 32)
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  // Modals state
  const [inspectOrder, setInspectOrder] = useState<any | null>(null);
  const [showBatchAssignModal, setShowBatchAssignModal] = useState(false);
  const [showRefuseModal, setShowRefuseModal] = useState<any | null>(null);
  const [refusalReason, setRefusalReason] = useState('Stock insuffisant au dépôt central');
  const [showFailureModal, setShowFailureModal] = useState<any | null>(null);
  const [failureReason, setFailureReason] = useState('Client absent lors du passage du transporteur');
  const [failureComment, setFailureComment] = useState('');
  const [showInvoiceModal, setShowInvoiceModal] = useState<any | null>(null);

  // Delivery Companies (Carriers)
  const [carriers, setCarriers] = useState<DeliveryCompany[]>([]);
  const [selectedCarrierId, setSelectedCarrierId] = useState<string>('');
  const [plannedDeliveryDate, setPlannedDeliveryDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [deliverySlot, setDeliverySlot] = useState<string>('09:00 - 13:00');
  const [deliveryNotes, setDeliveryNotes] = useState<string>('');

  // Carrier CRUD
  const [carrierModalOpen, setCarrierModalOpen] = useState(false);
  const [editingCarrier, setEditingCarrier] = useState<Partial<DeliveryCompany> | null>(null);

  // Notification feedback
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Keep in sync with parent activeShop context
  useEffect(() => {
    setFilialeFilter(activeShop);
  }, [activeShop]);

  // Load Delivery Companies from server
  const loadCarriers = async () => {
    try {
      const res = await fetch('/api/delivery-companies');
      if (res.ok) {
        const data = await res.json();
        setCarriers(data);
        if (data.length > 0 && !selectedCarrierId) {
          setSelectedCarrierId(data[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading carriers:', err);
    }
  };

  useEffect(() => {
    loadCarriers();
  }, []);

  const handleShopFilterChange = (shop: string) => {
    setFilialeFilter(shop);
    if (onSelectShop) onSelectShop(shop);
  };

  // Helper to trigger parent reload or refresh window
  const reloadData = () => {
    if (onReloadOrders) {
      onReloadOrders();
    } else {
      window.dispatchEvent(new CustomEvent('multishop-data-changed', { detail: { action: 'order_updated' } }));
    }
  };

  // Filtered orders according to MultiShop 42-rule lifecycle
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // 1. Boutique filter (supports multi-shop orders with shops array)
      const matchFiliale =
        filialeFilter === 'all' ||
        o.filialeKey === filialeFilter ||
        (Array.isArray(o.shops) && o.shops.includes(filialeFilter));

      // 2. Stage filter
      let matchStage = true;
      if (workflowStage === 'pending_confirmation') {
        matchStage = (o.statutCommande || o.status) === 'EN_ATTENTE_CONFIRMATION';
      } else if (workflowStage === 'pending_delivery') {
        matchStage =
          (o.statutCommande || o.status) === 'CONFIRMEE' &&
          ((o.statutLivraison || 'LIVRAISON_EN_ATTENTE') === 'LIVRAISON_EN_ATTENTE' ||
            o.statutLivraison === 'NON_INITIEE');
      } else if (workflowStage === 'assigned_delivery') {
        matchStage = (o.statutLivraison || '') === 'AFFECTEE_LIVRAISON';
      } else if (workflowStage === 'in_delivery') {
        matchStage = (o.statutLivraison || '') === 'EN_LIVRAISON';
      } else if (workflowStage === 'delivered') {
        matchStage =
          (o.statutLivraison || '') === 'LIVREE' &&
          (o.statutCommande || o.status) !== 'CLOTUREE';
      } else if (workflowStage === 'closed') {
        matchStage = (o.statutCommande || o.status) === 'CLOTUREE';
      } else if (workflowStage === 'archived') {
        matchStage = (o.statutCommande || o.status) === 'ARCHIVEE';
      }

      // 3. Search query
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        o.id?.toLowerCase().includes(q) ||
        o.orderNumber?.toLowerCase().includes(q) ||
        o.customerName?.toLowerCase().includes(q) ||
        o.customerEmail?.toLowerCase().includes(q) ||
        o.phone?.toLowerCase().includes(q);

      return matchFiliale && matchStage && matchSearch;
    });
  }, [orders, filialeFilter, workflowStage, searchQuery]);

  // Stage counts for badges
  const stageCounts = useMemo(() => {
    const counts = {
      all: orders.length,
      pending_confirmation: 0,
      pending_delivery: 0,
      assigned_delivery: 0,
      in_delivery: 0,
      delivered: 0,
      closed: 0,
      archived: 0
    };

    orders.forEach((o) => {
      const cmdStat = o.statutCommande || o.status;
      const livStat = o.statutLivraison || '';

      if (cmdStat === 'EN_ATTENTE_CONFIRMATION') counts.pending_confirmation++;
      else if (cmdStat === 'CONFIRMEE' && (livStat === 'LIVRAISON_EN_ATTENTE' || livStat === 'NON_INITIEE' || !livStat))
        counts.pending_delivery++;
      else if (livStat === 'AFFECTEE_LIVRAISON') counts.assigned_delivery++;
      else if (livStat === 'EN_LIVRAISON') counts.in_delivery++;
      else if (livStat === 'LIVREE' && cmdStat !== 'CLOTUREE') counts.delivered++;
      else if (cmdStat === 'CLOTUREE') counts.closed++;
      else if (cmdStat === 'ARCHIVEE') counts.archived++;
    });

    return counts;
  }, [orders]);

  // --- ACTIONS WORKFLOW ADMINISTRATEUR ---

  // 1. Confirmer la commande (Règle 12, 13)
  const handleConfirmOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        showToast(`Commande ${orderId} confirmée avec succès ! Passage en LIVRAISON_EN_ATTENTE.`, 'success');
        reloadData();
      } else {
        showToast('Erreur lors de la confirmation.', 'error');
      }
    } catch {
      showToast('Erreur réseau lors de la confirmation.', 'error');
    }
  };

  // 2. Refuser / Archiver la commande (Règle 26, 27, 28, 40)
  const handleRefuseOrderSubmit = async () => {
    if (!showRefuseModal) return;
    const orderId = showRefuseModal.id || showRefuseModal.orderNumber;
    try {
      const res = await fetch(`/api/orders/${orderId}/refuse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motif: refusalReason })
      });
      if (res.ok) {
        showToast(
          `Commande ${orderId} refusée et archivée. Stock réservé restitué immédiatement au catalogue !`,
          'info'
        );
        setShowRefuseModal(null);
        reloadData();
      }
    } catch {
      showToast('Erreur lors du refus de la commande.', 'error');
    }
  };

  // 3. Prise en charge par la société de livraison (Règle 20)
  const handleMarkInDelivery = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/in-delivery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        showToast(`Commande ${orderId} marquée EN_LIVRAISON (Prise en charge confirmée).`, 'success');
        reloadData();
      }
    } catch {
      showToast('Erreur lors du changement de statut.', 'error');
    }
  };

  // 4. Confirmer livraison réussie (Règle 21)
  const handleMarkDelivered = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/delivered`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentaire: 'Colis remis au destinataire avec succès.' })
      });
      if (res.ok) {
        showToast(`Commande ${orderId} marquée LIVREE. Paiement à la livraison prêt pour encaissement.`, 'success');
        reloadData();
      }
    } catch {
      showToast('Erreur lors de la confirmation de livraison.', 'error');
    }
  };

  // 5. Déclarer échec de livraison (Règle 34)
  const handleFailureSubmit = async () => {
    if (!showFailureModal) return;
    const orderId = showFailureModal.id || showFailureModal.orderNumber;
    try {
      const res = await fetch(`/api/orders/${orderId}/delivery-failure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motif: failureReason, commentaire: failureComment })
      });
      if (res.ok) {
        showToast(`Échec de livraison enregistré pour ${orderId}. Replanification possible.`, 'info');
        setShowFailureModal(null);
        setFailureComment('');
        reloadData();
      }
    } catch {
      showToast('Erreur lors de la déclaration d\'échec.', 'error');
    }
  };

  // 6. Encaisser Paiement COD (Règle 22)
  const handleCollectPayment = async (orderId: string, montant: number) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/collect-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ montantEncaisse: montant })
      });
      if (res.ok) {
        showToast(`Paiement de ${montant} DT encaissé et validé pour la commande ${orderId}.`, 'success');
        reloadData();
      }
    } catch {
      showToast('Erreur lors de l\'encaissement.', 'error');
    }
  };

  // 7. Générer la Facture (Règle 23, 24)
  const handleGenerateInvoice = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/generate-invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        showToast(`Facture ${data.facture?.numeroFacture || 'émise'} générée avec succès !`, 'success');
        reloadData();
        if (inspectOrder && (inspectOrder.id === orderId || inspectOrder.orderNumber === orderId)) {
          setInspectOrder({ ...inspectOrder, facture: data.facture, statutFacture: 'FACTURE_GENEREE' });
        }
      }
    } catch {
      showToast('Erreur lors de la génération de facture.', 'error');
    }
  };

  // 8. Clôturer définitivement la commande (Règle 25, 38)
  const handleCloseOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        showToast(`Commande ${orderId} définitivement CLÔTURÉE et archivée au grand livre.`, 'success');
        reloadData();
      }
    } catch {
      showToast('Erreur lors de la clôture.', 'error');
    }
  };

  // 9. Affectation en lot aux sociétés de livraison (Règles 15, 16, 17, 32)
  const handleExecuteBatchAssign = async () => {
    if (selectedOrderIds.length === 0) {
      showToast('Veuillez sélectionner au moins une commande à affecter.', 'error');
      return;
    }
    const carrier = carriers.find((c) => c.id === selectedCarrierId) || carriers[0];
    if (!carrier) {
      showToast('Veuillez sélectionner une société de livraison.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/orders/batch-assign-delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderIds: selectedOrderIds,
          societeLivraisonId: carrier.id,
          societeLivraisonNom: carrier.nom,
          dateLivraisonPrevue: plannedDeliveryDate,
          creneauHoraire: deliverySlot,
          instructions: deliveryNotes
        })
      });

      if (res.ok) {
        const data = await res.json();
        showToast(
          `${data.count || selectedOrderIds.length} commande(s) affectée(s) avec succès à ${carrier.nom} !`,
          'success'
        );
        setSelectedOrderIds([]);
        setShowBatchAssignModal(false);
        setDeliveryNotes('');
        reloadData();
      } else {
        showToast('Erreur lors de l\'affectation.', 'error');
      }
    } catch {
      showToast('Erreur réseau lors de l\'affectation.', 'error');
    }
  };

  // Toggle single order selection
  const toggleSelectOrder = (orderId: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  // Select all visible orders eligible for delivery assignment
  const handleSelectAllEligible = () => {
    const eligibleIds = filteredOrders
      .filter(
        (o) =>
          (o.statutCommande || o.status) === 'CONFIRMEE' &&
          ((o.statutLivraison || 'LIVRAISON_EN_ATTENTE') === 'LIVRAISON_EN_ATTENTE' ||
            o.statutLivraison === 'NON_INITIEE' ||
            o.statutLivraison === 'ECHEC_LIVRAISON')
      )
      .map((o) => o.id || o.orderNumber);

    if (selectedOrderIds.length === eligibleIds.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(eligibleIds);
    }
  };

  // Reset Demo to fresh state
  const handleResetDemo = async () => {
    try {
      const res = await fetch('/api/orders/reset-demo', { method: 'POST' });
      if (res.ok) {
        showToast('Démonstration réinitialisée ! Toutes les commandes ont été remises à l\'état témoin.', 'success');
        reloadData();
      }
    } catch {
      showToast('Erreur lors de la réinitialisation.', 'error');
    }
  };

  // Carrier CRUD handlers
  const handleSaveCarrier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCarrier || !editingCarrier.nom) return;

    try {
      if (editingCarrier.id) {
        // Update
        const res = await fetch(`/api/delivery-companies/${editingCarrier.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingCarrier)
        });
        if (res.ok) {
          showToast(`Société ${editingCarrier.nom} mise à jour avec succès.`, 'success');
          loadCarriers();
          setCarrierModalOpen(false);
          setEditingCarrier(null);
        }
      } else {
        // Create
        const res = await fetch('/api/delivery-companies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingCarrier)
        });
        if (res.ok) {
          showToast(`Nouvelle société ${editingCarrier.nom} ajoutée !`, 'success');
          loadCarriers();
          setCarrierModalOpen(false);
          setEditingCarrier(null);
        }
      }
    } catch {
      showToast('Erreur lors de l\'enregistrement du transporteur.', 'error');
    }
  };

  const handleDeleteCarrier = async (carrierId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette société de livraison ?')) return;
    try {
      const res = await fetch(`/api/delivery-companies/${carrierId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Société de livraison supprimée.', 'info');
        loadCarriers();
      }
    } catch {
      showToast('Erreur lors de la suppression.', 'error');
    }
  };

  const toggleCarrierActive = async (carrier: DeliveryCompany) => {
    try {
      const res = await fetch(`/api/delivery-companies/${carrier.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actif: !carrier.actif })
      });
      if (res.ok) {
        loadCarriers();
        showToast(`Statut de ${carrier.nom} mis à jour.`, 'info');
      }
    } catch {
      showToast('Erreur de mise à jour.', 'error');
    }
  };

  // Helper badge color & label
  const getOrderStatusDisplay = (order: any) => {
    const cmdStat = order.statutCommande || order.status;
    const livStat = order.statutLivraison || 'NON_INITIEE';
    const payStat = order.statutPaiement || 'PAIEMENT_EN_ATTENTE';

    if (cmdStat === 'ARCHIVEE') {
      return {
        label: 'ARCHIVÉE (Stock Remis)',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
        icon: Archive,
        step: 'Refusée'
      };
    }
    if (cmdStat === 'CLOTUREE') {
      return {
        label: 'CLÔTURÉE (Livrée & Payée)',
        badgeClass: 'bg-slate-900 text-white border-slate-700 dark:bg-slate-800 dark:text-emerald-400',
        icon: ShieldCheck,
        step: 'Archivée au Grand Livre'
      };
    }
    if (cmdStat === 'EN_ATTENTE_CONFIRMATION') {
      return {
        label: 'EN ATTENTE DE CONFIRMATION',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800 animate-pulse',
        icon: Clock,
        step: 'Stock Réservé'
      };
    }
    if (livStat === 'LIVREE') {
      return {
        label: payStat === 'PAIEMENT_ENCAISSE' ? 'LIVRÉE (Payée COD)' : 'LIVRÉE (Encaissement en cours)',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300',
        icon: Package,
        step: 'Livraison Effectuée'
      };
    }
    if (livStat === 'EN_LIVRAISON') {
      return {
        label: 'EN COURS DE LIVRAISON',
        badgeClass: 'bg-purple-50 text-purple-800 border-purple-300 dark:bg-purple-950/50 dark:text-purple-300',
        icon: Truck,
        step: 'Acheminement Client'
      };
    }
    if (livStat === 'AFFECTEE_LIVRAISON') {
      return {
        label: 'AFFECTÉE À UN TRANSPORTEUR',
        badgeClass: 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/50 dark:text-blue-300',
        icon: Building2,
        step: order.affectationLivraison?.societeLivraisonNom || 'Transporteur'
      };
    }
    if (livStat === 'ECHEC_LIVRAISON') {
      return {
        label: 'ÉCHEC DE LIVRAISON',
        badgeClass: 'bg-orange-50 text-orange-800 border-orange-300 dark:bg-orange-950/50 dark:text-orange-300',
        icon: AlertTriangle,
        step: order.echecDetails?.motif || 'Client Absent'
      };
    }
    if (cmdStat === 'CONFIRMEE') {
      return {
        label: 'CONFIRMÉE (Livraison en attente)',
        badgeClass: 'bg-sky-50 text-sky-800 border-sky-300 dark:bg-sky-950/50 dark:text-sky-300',
        icon: CheckCircle2,
        step: 'Prêt pour Affectation'
      };
    }

    return {
      label: cmdStat || 'EN COURS',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: Clock,
      step: 'En traitement'
    };
  };

  const shopTabs = [
    { id: 'all', label: 'Toutes les Boutiques', icon: '🌐' },
    { id: 'nutrition', label: 'Fitness Shop', icon: '⚡' },
    { id: 'youpi', label: 'YoupiShop', icon: '🧸' },
    { id: 'dari', label: 'DariShop', icon: '🏠' }
  ];

  return (
    <div className="space-y-6 animate-fadeIn font-sans pb-12">
      {/* Toast feedback banner */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-bold animate-slideDown ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200'
              : toastMessage.type === 'error'
              ? 'bg-rose-50 text-rose-900 border-rose-300 dark:bg-rose-950 dark:text-rose-200'
              : 'bg-blue-50 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-blue-200'
          }`}
        >
          {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          {toastMessage.type === 'error' && <XCircle className="w-4 h-4 text-rose-600" />}
          {toastMessage.type === 'info' && <AlertCircle className="w-4 h-4 text-blue-600" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Top Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-extrabold text-[10px] tracking-wider uppercase">
                Acteurs : CLIENT & ADMINISTRATEUR uniquement
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[10px]">
                Processus Intégral en 42 Règles
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              GESTION CENTRALE DES COMMANDES
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Traitez les commandes clients, affectez les transporteurs, gérez l'encaissement à la livraison (COD) et la facturation sans jamais supprimer d'archive.
            </p>
          </div>

          {/* Top navigation actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Commandes ({orders.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('carriers')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'carriers'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Sociétés de Livraison ({carriers.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('scenarios')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'scenarios'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Scénarios Démo</span>
            </button>

            <button
              type="button"
              onClick={handleResetDemo}
              title="Réinitialiser les données témoins"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Shop Context Switcher */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Boutique :
          </span>
          {shopTabs.map((st) => {
            const isSelected = filialeFilter === st.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => handleShopFilterChange(st.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <span>{st.icon}</span>
                <span>{st.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW 1: SCENARIOS EXPLAINER & RUNNER */}
      {activeTab === 'scenarios' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-blue-900 text-white rounded-3xl p-8 relative overflow-hidden shadow-xl">
            <div className="relative z-10 max-w-3xl space-y-3">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-extrabold uppercase tracking-widest inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Scénarios de Démonstration Clé en Main
              </span>
              <h3 className="text-2xl font-black font-serif">
                Validez le cycle complet de gestion sans aucune configuration manuelle
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Chaque étape ci-dessous démontre une règle stricte de la plateforme : réservation automatique du stock à la commande, décision d'acceptation ou refus par l'administrateur avec libération immédiate, affectation groupée aux sociétés de livraison, paiement à la livraison (COD), et émission de facture légale.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Scénario 1 : Nominal Complet */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-black uppercase">
                    Scénario 1 : Nominal
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">Règles 1 à 25</span>
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Cycle Nominal Complet de A à Z
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Le client passe commande sur le site → Commande créée en <code>EN_ATTENTE_CONFIRMATION</code> (stock réservé) → Administrateur confirme → Affectation à Aramex Tunisie → Transporteur prend en charge → Livraison validée → Encaissement espèces COD → Facture légale <code>FACT-2026-XXXXX</code> émise → Commande clôturée.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600">Commande témoin : CMD-2026-000142</span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('orders');
                    setWorkflowStage('pending_confirmation');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Tester ce cycle</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Scénario 2 : Refus & Restauration Stock */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs hover:border-rose-300 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-black uppercase">
                    Scénario 2 : Non Confirmée
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">Règles 26 à 28, 40</span>
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Refus, Archivage & Restauration du Stock
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  L'administrateur refuse une commande non confirmée (motif : rupture ou annulation) → La commande passe en <code>ARCHIVEE</code> → Le stock réservé est automatiquement et immédiatement réintégré dans le catalogue → <strong>Aucune suppression physique n'est jamais autorisée</strong>.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-rose-600">Commande témoin : CMD-2026-000115</span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('orders');
                    setWorkflowStage('archived');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Voir l'archive & audit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Scénario 3 : Expédition Groupée en Lot */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-black uppercase">
                    Scénario 3 : Lot Groupé
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">Règles 15, 16, 32</span>
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Affectation Groupée à un Transporteur
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  L'administrateur coche plusieurs commandes validées dans la liste → Clique sur « Affecter en lot » → Choisit la société partenaire (Yalidine Express ou Aramex) avec date et créneau → Toutes les commandes basculent en <code>AFFECTEE_LIVRAISON</code> en une seule opération.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-blue-600">Multi-Sélection Active</span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('orders');
                    setWorkflowStage('pending_delivery');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Tester le lot groupé</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Scénario 4 : Incident & Replanification */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs hover:border-orange-300 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 text-[10px] font-black uppercase">
                    Scénario 4 : Incident
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">Règles 34, 35</span>
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Gestion d'Échec de Livraison & Suivi
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Un colis est en livraison mais le client est absent ou injoignable → L'administrateur consigne l'incident → Statut <code>ECHEC_LIVRAISON</code> avec motif horodaté → Possibilité de replanifier une nouvelle tentative ou de réaffecter à un autre transporteur.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-orange-600">Commande témoin : CMD-2026-000131</span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('orders');
                    setWorkflowStage('in_delivery');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Tester le suivi livraison</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: SOCIÉTÉS DE LIVRAISON (PAGE DÉDIÉE AVEC CRUD, HISTORIQUE PRODUITS, EN COURS & RETOURS) */}
      {activeTab === 'carriers' && (
        <DeliveryCompaniesView
          orders={orders}
          activeShop={activeShop}
          onReloadOrders={onReloadOrders}
          onSelectOrder={(ord) => setInspectOrder(ord)}
        />
      )}

      {/* VIEW 3: COMMANDES WORKFLOW (PRIMARY VIEW) */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Lifecycle Stages Tabs with Badge Counts */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-2 shadow-xs overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 min-w-max">
              {[
                { id: 'all', label: 'Toutes', count: stageCounts.all, icon: Layers },
                { id: 'pending_confirmation', label: '1. À Confirmer (Stock Réservé)', count: stageCounts.pending_confirmation, icon: Clock, alert: true },
                { id: 'pending_delivery', label: '2. En Attente Livraison', count: stageCounts.pending_delivery, icon: CheckCircle2 },
                { id: 'assigned_delivery', label: '3. Affectées', count: stageCounts.assigned_delivery, icon: Building2 },
                { id: 'in_delivery', label: '4. En Livraison', count: stageCounts.in_delivery, icon: Truck },
                { id: 'delivered', label: '5. Livrées (Paiement COD)', count: stageCounts.delivered, icon: Package },
                { id: 'closed', label: '6. Clôturées & Facturées', count: stageCounts.closed, icon: ShieldCheck },
                { id: 'archived', label: 'Archives (Refusées)', count: stageCounts.archived, icon: Archive }
              ].map((stage) => {
                const isSelected = workflowStage === stage.id;
                const IconComponent = stage.icon;

                return (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => setWorkflowStage(stage.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{stage.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : stage.alert && stage.count > 0
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {stage.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search & Actions Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par référence, client, téléphone, ville..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Batch Action Button (Règles 15, 16, 32) */}
            <div className="flex items-center gap-2">
              {selectedOrderIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowBatchAssignModal(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-blue-500/20 animate-pulse"
                >
                  <Truck className="w-4 h-4" />
                  <span>Affecter {selectedOrderIds.length} commande(s) en lot</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleSelectAllEligible}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-bold cursor-pointer"
              >
                {selectedOrderIds.length > 0 ? 'Désélectionner tout' : 'Sélectionner éligibles'}
              </button>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 w-10">
                      <span className="sr-only">Sélection</span>
                    </th>
                    <th className="py-3.5 px-4">Réf Commande</th>
                    <th className="py-3.5 px-4">Boutique(s)</th>
                    <th className="py-3.5 px-4">Client & Contact</th>
                    <th className="py-3.5 px-4">Articles</th>
                    <th className="py-3.5 px-4">Total (TTC)</th>
                    <th className="py-3.5 px-4">Statut & Étape</th>
                    <th className="py-3.5 px-4">Société Livraison</th>
                    <th className="py-3.5 px-4 text-right">Actions Administrateur</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-slate-400">
                        <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="font-bold">Aucune commande trouvée pour ce filtre.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const statusDisplay = getOrderStatusDisplay(order);
                      const cmdStat = order.statutCommande || order.status;
                      const livStat = order.statutLivraison || 'NON_INITIEE';
                      const payStat = order.statutPaiement || 'PAIEMENT_EN_ATTENTE';
                      const isSelected = selectedOrderIds.includes(order.id || order.orderNumber);
                      const isEligibleForAssign =
                        cmdStat === 'CONFIRMEE' &&
                        (livStat === 'LIVRAISON_EN_ATTENTE' || livStat === 'NON_INITIEE' || livStat === 'ECHEC_LIVRAISON');

                      return (
                        <tr
                          key={order.id || order.orderNumber}
                          className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                            isSelected ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                          }`}
                        >
                          {/* Checkbox for batch selection */}
                          <td className="py-3.5 px-4">
                            {isEligibleForAssign ? (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectOrder(order.id || order.orderNumber)}
                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                            ) : (
                              <span className="w-4 h-4 block" />
                            )}
                          </td>

                          {/* Reference & Date */}
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-slate-900 dark:text-white block">
                              {order.orderNumber || order.id}
                            </span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3" />
                              {order.date} {order.heure || ''}
                            </span>
                          </td>

                          {/* Multi-Shop Badges */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap gap-1">
                              {Array.isArray(order.shops) && order.shops.length > 0 ? (
                                order.shops.map((sKey: string) => (
                                  <span
                                    key={sKey}
                                    className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                  >
                                    {sKey === 'nutrition' && '⚡ Fitness'}
                                    {sKey === 'youpi' && '🧸 Youpi'}
                                    {sKey === 'dari' && '🏠 Dari'}
                                    {!['nutrition', 'youpi', 'dari'].includes(sKey) && sKey}
                                  </span>
                                ))
                              ) : (
                                <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                  {order.filialeKey === 'nutrition' && '⚡ Fitness'}
                                  {order.filialeKey === 'youpi' && '🧸 Youpi'}
                                  {order.filialeKey === 'dari' && '🏠 Dari'}
                                  {!['nutrition', 'youpi', 'dari'].includes(order.filialeKey) && '⚡ Fitness'}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Client details */}
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-900 dark:text-white">{order.customerName}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              {order.phone || order.customerInfo?.phone || '—'}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate max-w-[150px]">
                              {order.shippingAddress?.city || order.customerInfo?.city || 'Tunisie'}
                            </p>
                          </td>

                          {/* Items count */}
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {order.items?.length || 1} réf ({order.itemCount || order.items?.reduce((a: number, b: any) => a + (b.quantity || 1), 0) || 1} pcs)
                            </span>
                          </td>

                          {/* Total */}
                          <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                            {(order.total || order.totalAmount || 0).toLocaleString('fr-FR')} DT
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusDisplay.badgeClass}`}
                            >
                              <statusDisplay.icon className="w-3 h-3" />
                              <span>{statusDisplay.label}</span>
                            </span>
                            {order.stockReserve && cmdStat !== 'ARCHIVEE' && (
                              <span className="block text-[9px] font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                                🔒 Stock réservé
                              </span>
                            )}
                          </td>

                          {/* Assigned Carrier */}
                          <td className="py-3.5 px-4">
                            {order.affectationLivraison?.societeLivraisonNom ? (
                              <div>
                                <span className="font-bold text-blue-600 text-xs block">
                                  {order.affectationLivraison.societeLivraisonNom}
                                </span>
                                <span className="text-[9px] text-slate-400">
                                  Prévu : {order.affectationLivraison.dateLivraisonPrevue || '24-48h'}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[10px] italic">Non assignée</span>
                            )}
                          </td>

                          {/* Actions buttons */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* 1. Step: EN_ATTENTE_CONFIRMATION */}
                              {cmdStat === 'EN_ATTENTE_CONFIRMATION' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleConfirmOrder(order.id || order.orderNumber)}
                                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] cursor-pointer shadow-xs"
                                    title="Confirmer la commande"
                                  >
                                    Confirmer
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setShowRefuseModal(order)}
                                    className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-[10px] cursor-pointer"
                                    title="Refuser et archiver (remet en stock)"
                                  >
                                    Refuser
                                  </button>
                                </>
                              )}

                              {/* 2. Step: CONFIRMEE & LIVRAISON_EN_ATTENTE */}
                              {isEligibleForAssign && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedOrderIds([order.id || order.orderNumber]);
                                    setShowBatchAssignModal(true);
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] cursor-pointer shadow-xs flex items-center gap-1"
                                  title="Affecter à un transporteur"
                                >
                                  <Truck className="w-3 h-3" />
                                  <span>Affecter</span>
                                </button>
                              )}

                              {/* 3. Step: AFFECTEE_LIVRAISON */}
                              {livStat === 'AFFECTEE_LIVRAISON' && (
                                <button
                                  type="button"
                                  onClick={() => handleMarkInDelivery(order.id || order.orderNumber)}
                                  className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-[10px] cursor-pointer shadow-xs flex items-center gap-1"
                                  title="Marquer prise en charge par le transporteur"
                                >
                                  <Truck className="w-3 h-3" />
                                  <span>En Livraison</span>
                                </button>
                              )}

                              {/* 4. Step: EN_LIVRAISON */}
                              {livStat === 'EN_LIVRAISON' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleMarkDelivered(order.id || order.orderNumber)}
                                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] cursor-pointer shadow-xs flex items-center gap-1"
                                    title="Confirmer la livraison au client"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Colis Livré</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setShowFailureModal(order)}
                                    className="px-2 py-1.5 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 font-bold text-[10px] cursor-pointer"
                                    title="Déclarer échec de livraison"
                                  >
                                    Échec
                                  </button>
                                </>
                              )}

                              {/* 5. Step: LIVREE but not yet paid */}
                              {livStat === 'LIVREE' && payStat === 'PAIEMENT_EN_ATTENTE' && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCollectPayment(
                                      order.id || order.orderNumber,
                                      order.total || order.totalAmount || 0
                                    )
                                  }
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] cursor-pointer shadow-xs flex items-center gap-1"
                                  title="Encaisser le paiement en espèces à la livraison"
                                >
                                  <DollarSign className="w-3 h-3" />
                                  <span>Encaisser COD</span>
                                </button>
                              )}

                              {/* 6. Step: LIVREE + PAIEMENT_ENCAISSE, generate invoice */}
                              {livStat === 'LIVREE' &&
                                payStat === 'PAIEMENT_ENCAISSE' &&
                                (!order.facture || order.statutFacture !== 'FACTURE_GENEREE') && (
                                  <button
                                    type="button"
                                    onClick={() => handleGenerateInvoice(order.id || order.orderNumber)}
                                    className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] cursor-pointer shadow-xs flex items-center gap-1"
                                    title="Générer la facture légale"
                                  >
                                    <Receipt className="w-3 h-3" />
                                    <span>Facturer</span>
                                  </button>
                                )}

                              {/* 7. Step: Invoice generated, ready to close */}
                              {livStat === 'LIVREE' &&
                                payStat === 'PAIEMENT_ENCAISSE' &&
                                (order.facture || order.statutFacture === 'FACTURE_GENEREE') &&
                                cmdStat !== 'CLOTUREE' && (
                                  <button
                                    type="button"
                                    onClick={() => handleCloseOrder(order.id || order.orderNumber)}
                                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white font-extrabold text-[10px] cursor-pointer shadow-xs flex items-center gap-1"
                                    title="Clôturer définitivement la commande"
                                  >
                                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                    <span>Clôturer</span>
                                  </button>
                                )}

                              {/* View invoice button */}
                              {order.facture && (
                                <button
                                  type="button"
                                  onClick={() => setShowInvoiceModal(order)}
                                  className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 cursor-pointer"
                                  title="Voir la Facture"
                                >
                                  <Receipt className="w-4 h-4" />
                                </button>
                              )}

                              {/* Detail Inspector Button */}
                              <button
                                type="button"
                                onClick={() => setInspectOrder(order)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 cursor-pointer"
                                title="Voir détails et audit"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 1: BATCH ASSIGN TO DELIVERY COMPANY (Règles 15, 16, 17, 32) --- */}
      {showBatchAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full p-6 text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto space-y-5 border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Affectation à une Société de Livraison
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedOrderIds.length} commande(s) sélectionnée(s)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBatchAssignModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Carrier Selection */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Société de Livraison Partenaire *
                </label>
                <select
                  value={selectedCarrierId}
                  onChange={(e) => setSelectedCarrierId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {carriers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nom} ({c.zones} — Délai {c.delaiMoyen}{c.joursTravailTexte ? ` | 🕒 ${c.joursTravailTexte}` : ''})
                    </option>
                  ))}
                </select>
              </div>

              {/* Delivery Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Date de Livraison Prévue
                  </label>
                  <input
                    type="date"
                    value={plannedDeliveryDate}
                    onChange={(e) => setPlannedDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Créneau Horaire
                  </label>
                  <select
                    value={deliverySlot}
                    onChange={(e) => setDeliverySlot(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="09:00 - 13:00">Matin (09:00 - 13:00)</option>
                    <option value="14:00 - 18:00">Après-midi (14:00 - 18:00)</option>
                    <option value="Toute la journée">Journée entière</option>
                  </select>
                </div>
              </div>

              {/* Special instructions */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Consignes Spéciales d'Expédition (Optionnel)
                </label>
                <textarea
                  rows={2}
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Ex: Colis fragile, contacter le client 15 min avant l'arrivée..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Selected orders preview summary */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl space-y-1">
                <p className="font-extrabold text-[11px] text-slate-600 dark:text-slate-400 uppercase">
                  Commandes concernées ({selectedOrderIds.length}) :
                </p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedOrderIds.map((id) => (
                    <span
                      key={id}
                      className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 font-mono font-bold text-[10px] border border-slate-200 dark:border-slate-600"
                    >
                      {id}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBatchAssignModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleExecuteBatchAssign}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold cursor-pointer shadow-md shadow-blue-500/20"
              >
                Confirmer l'affectation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: REFUS & ARCHIVAGE (Règles 26, 27, 28, 40) --- */}
      {showRefuseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-6 text-slate-900 dark:text-white space-y-4 border border-rose-100 dark:border-rose-950">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white">
                  Refuser & Archiver la Commande
                </h3>
                <p className="text-xs text-slate-500">
                  Règle 40 : Aucune suppression physique
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-400">
                Vous êtes sur le point de refuser la commande{' '}
                <strong className="text-slate-900 dark:text-white font-mono">
                  {showRefuseModal.id || showRefuseModal.orderNumber}
                </strong>
                .
              </p>

              <div className="bg-amber-50 dark:bg-amber-950/40 p-3.5 rounded-2xl border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-xs space-y-1">
                <p className="font-bold">Effets automatiques du refus :</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>La commande passe au statut définitif <strong>ARCHIVEE</strong>.</li>
                  <li>Le stock réservé est <strong>immédiatement remis en stock disponible</strong>.</li>
                  <li>La commande reste consultable dans les archives et conserve son historique d'audit.</li>
                </ul>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Motif du Refus *
                </label>
                <select
                  value={refusalReason}
                  onChange={(e) => setRefusalReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
                >
                  <option value="Stock insuffisant au dépôt central">Stock insuffisant au dépôt central</option>
                  <option value="Coordonnées client erronées ou injoignable">Coordonnées client erronées ou injoignable</option>
                  <option value="Demande d'annulation exprimée par le client">Demande d'annulation exprimée par le client</option>
                  <option value="Zone géographique non desservie">Zone géographique non desservie</option>
                  <option value="Autre motif d'exploitation interne">Autre motif d'exploitation interne</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRefuseModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleRefuseOrderSubmit}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold cursor-pointer shadow-md shadow-rose-500/20"
              >
                Confirmer l'Archivage & Remise en Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 3: ÉCHEC DE LIVRAISON (Règle 34) --- */}
      {showFailureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-6 text-slate-900 dark:text-white space-y-4 border border-orange-100 dark:border-orange-950">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white">
                  Déclarer un Échec de Livraison
                </h3>
                <p className="text-xs text-slate-500">
                  Règle 34 : Signalement de tentative infructueuse
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Motif de l'Échec *
                </label>
                <select
                  value={failureReason}
                  onChange={(e) => setFailureReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                >
                  <option value="Client absent lors du passage du transporteur">Client absent lors du passage du transporteur</option>
                  <option value="Numéro de téléphone injoignable après 3 tentatives">Numéro de téléphone injoignable après 3 tentatives</option>
                  <option value="Adresse introuvable ou imprécise">Adresse introuvable ou imprécise</option>
                  <option value="Refus du colis par le client à la réception">Refus du colis par le client à la réception</option>
                  <option value="Montant en espèces indisponible auprès du client">Montant en espèces indisponible auprès du client</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Commentaire & Rapport Transporteur
                </label>
                <textarea
                  rows={2}
                  value={failureComment}
                  onChange={(e) => setFailureComment(e.target.value)}
                  placeholder="Détails de l'incident signalés par le coursier..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowFailureModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleFailureSubmit}
                className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold cursor-pointer shadow-md shadow-orange-500/20"
              >
                Enregistrer l'incident
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 4: ORDER INSPECTOR & AUDIT LOG --- */}
      {inspectOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full p-6 text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto space-y-5 border border-slate-100 dark:border-slate-800">
            {/* Header */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-black text-xl text-slate-900 dark:text-white font-mono">
                    {inspectOrder.orderNumber || inspectOrder.id}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      getOrderStatusDisplay(inspectOrder).badgeClass
                    }`}
                  >
                    {getOrderStatusDisplay(inspectOrder).label}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Date de commande : {inspectOrder.date} à {inspectOrder.heure || '10:00'} • Mode : {inspectOrder.paymentMethod || 'Paiement à la livraison'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setInspectOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Client & Shipping info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl space-y-1.5">
                <p className="font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>Destinataire Client :</span>
                </p>
                <p className="font-bold text-sm text-slate-900 dark:text-white">
                  {inspectOrder.customerName}
                </p>
                <p className="text-slate-500 flex items-center gap-1.5">
                  <Phone className="w-3 h-3" />
                  <span>{inspectOrder.phone || inspectOrder.customerInfo?.phone || '—'}</span>
                </p>
                <p className="text-slate-500">
                  Email : {inspectOrder.customerEmail || inspectOrder.customerInfo?.email || '—'}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl space-y-1.5">
                <p className="font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Adresse de Livraison :</span>
                </p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {inspectOrder.shippingAddress?.street || inspectOrder.address || 'Tunisie'}
                </p>
                <p className="text-slate-500">
                  {inspectOrder.shippingAddress?.city || 'Tunis'} (CP: {inspectOrder.shippingAddress?.postalCode || '1000'})
                </p>
                {inspectOrder.affectationLivraison && (
                  <p className="text-blue-600 font-bold pt-1 border-t border-slate-200 dark:border-slate-700">
                    🚚 {inspectOrder.affectationLivraison.societeLivraisonNom}
                  </p>
                )}
              </div>
            </div>

            {/* Articles list */}
            <div>
              <p className="font-extrabold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Articles Commandés :
              </p>
              <div className="border border-slate-100 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                {(inspectOrder.items || []).map((item: any, idx: number) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-10 h-10 object-contain rounded-lg bg-slate-50 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700"
                        />
                      )}
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{item.name}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span>Qté : {item.quantity || 1}</span>
                          <span>•</span>
                          <span className="font-semibold text-blue-600">
                            {item.shopName || (item.shopId === 'nutrition' ? 'Fitness Shop' : item.shopId === 'dari' ? 'DariShop' : 'YoupiShop')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="font-black text-slate-900 dark:text-white">
                      {((item.price || 0) * (item.quantity || 1)).toLocaleString('fr-FR')} DT
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-3 text-sm font-black border-t border-slate-100 dark:border-slate-800 mt-2">
                <span>Montant Total TTC :</span>
                <span className="text-blue-600 text-base">
                  {(inspectOrder.total || inspectOrder.totalAmount || 0).toLocaleString('fr-FR')} DT
                </span>
              </div>
            </div>

            {/* Audit Log Timeline (Traçabilité complète - Acteurs : CLIENT & ADMINISTRATEUR) */}
            <div className="pt-2">
              <p className="font-extrabold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Journal d'Audit Complet (Historique)</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {(inspectOrder.historique || []).length} événement(s)
                </span>
              </p>

              <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {(inspectOrder.historique || []).map((entry: any, idx: number) => {
                  const isClient = entry.auteur === 'CLIENT';
                  return (
                    <div key={idx} className="relative pl-8 text-xs">
                      <div
                        className={`absolute left-1.5 top-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
                          isClient ? 'bg-amber-500' : 'bg-blue-600'
                        }`}
                      />
                      <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2 py-0.5 rounded-md font-extrabold text-[9px] uppercase tracking-wider ${
                              isClient
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            }`}
                          >
                            {entry.auteur || 'ADMINISTRATEUR'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {entry.date} {entry.heure || ''}
                          </span>
                        </div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {entry.action}
                        </p>
                        <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                          {entry.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions footer */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
              {inspectOrder.facture ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowInvoiceModal(inspectOrder);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Consulter Facture</span>
                </button>
              ) : (
                <span />
              )}

              <button
                type="button"
                onClick={() => setInspectOrder(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl text-xs cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 5: FACTURE OFFICIELLE (Règles 23, 24) --- */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-8 text-slate-900 max-h-[90vh] overflow-y-auto space-y-6 border border-slate-200">
            {/* Invoice Top Header */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-5">
              <div>
                <h2 className="text-2xl font-black font-serif text-slate-900 tracking-tight">
                  FACTURE COMMERCIALE
                </h2>
                <p className="text-xs font-mono font-bold text-blue-600 mt-1">
                  N° {showInvoiceModal.facture?.numeroFacture || `FACT-2026-${showInvoiceModal.id}`}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Date d'émission : {showInvoiceModal.facture?.dateFacture || showInvoiceModal.date}
                </p>
              </div>

              <div className="text-right">
                <span className="font-black text-sm uppercase tracking-wider block">
                  MULTISHOP GROUP
                </span>
                <p className="text-[10px] text-slate-500">Les Berges du Lac 2, Tunis</p>
                <p className="text-[10px] text-slate-500">MF : 1729384/A/M/000</p>
              </div>
            </div>

            {/* Client info */}
            <div className="bg-slate-50 p-4 rounded-2xl text-xs space-y-1">
              <p className="font-bold text-slate-800">Facturé à :</p>
              <p className="text-sm font-bold text-slate-900">{showInvoiceModal.customerName}</p>
              <p className="text-slate-600">{showInvoiceModal.shippingAddress?.street}</p>
              <p className="text-slate-600">{showInvoiceModal.shippingAddress?.city}, Tunisie</p>
              <p className="text-slate-600">Tél : {showInvoiceModal.phone}</p>
            </div>

            {/* Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 font-bold text-slate-600 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Désignation</th>
                    <th className="py-2.5 px-3 text-center">Qté</th>
                    <th className="py-2.5 px-3 text-right">P.U TTC</th>
                    <th className="py-2.5 px-3 text-right">Total TTC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(showInvoiceModal.items || []).map((itm: any, i: number) => (
                    <tr key={i}>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{itm.name}</td>
                      <td className="py-2.5 px-3 text-center">{itm.quantity || 1}</td>
                      <td className="py-2.5 px-3 text-right">{itm.price} DT</td>
                      <td className="py-2.5 px-3 text-right font-bold">
                        {(itm.price * (itm.quantity || 1)).toLocaleString('fr-FR')} DT
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total breakdown */}
            <div className="space-y-1.5 text-xs border-t border-slate-200 pt-3">
              <div className="flex justify-between text-slate-600">
                <span>Total Hors Taxes (HT)</span>
                <span className="font-bold">
                  {showInvoiceModal.facture?.totalHT
                    ? showInvoiceModal.facture.totalHT.toFixed(3)
                    : ((showInvoiceModal.total / 1.19)).toFixed(3)}{' '}
                  DT
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>TVA (19%)</span>
                <span className="font-bold">
                  {showInvoiceModal.facture?.tva
                    ? showInvoiceModal.facture.tva.toFixed(3)
                    : ((showInvoiceModal.total - showInvoiceModal.total / 1.19)).toFixed(3)}{' '}
                  DT
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Timbre Fiscal</span>
                <span className="font-bold">1.000 DT</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 text-base font-black text-slate-900">
                <span>Total Net à Payer (TTC) :</span>
                <span className="text-xl text-blue-600">
                  {showInvoiceModal.total} DT
                </span>
              </div>
            </div>

            {/* Print and Close */}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-2 cursor-pointer hover:bg-black"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer la Facture</span>
              </button>

              <button
                type="button"
                onClick={() => setShowInvoiceModal(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 6: CARRIER ADD / EDIT --- */}
      {carrierModalOpen && editingCarrier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <form
            onSubmit={handleSaveCarrier}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-6 text-slate-900 dark:text-white space-y-4 border border-slate-100 dark:border-slate-800"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-base">
                {editingCarrier.id ? 'Modifier Société de Livraison' : 'Nouvelle Société de Livraison'}
              </h3>
              <button
                type="button"
                onClick={() => setCarrierModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Nom de la Société *</label>
                <input
                  type="text"
                  required
                  value={editingCarrier.nom || ''}
                  onChange={(e) => setEditingCarrier({ ...editingCarrier, nom: e.target.value })}
                  placeholder="Ex: Aramex Tunisie, Yalidine..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Téléphone de Contact</label>
                <input
                  type="text"
                  value={editingCarrier.telephone || ''}
                  onChange={(e) => setEditingCarrier({ ...editingCarrier, telephone: e.target.value })}
                  placeholder="+216 -- --- ---"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Responsable / Service</label>
                <input
                  type="text"
                  value={editingCarrier.contact || ''}
                  onChange={(e) => setEditingCarrier({ ...editingCarrier, contact: e.target.value })}
                  placeholder="Ex: Service Logistique & Expéditions"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Zones Couvertes</label>
                <input
                  type="text"
                  value={editingCarrier.zones || ''}
                  onChange={(e) => setEditingCarrier({ ...editingCarrier, zones: e.target.value })}
                  placeholder="Ex: 24 Gouvernorats, Grand Tunis..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Délai Moyen</label>
                  <input
                    type="text"
                    value={editingCarrier.delaiMoyen || ''}
                    onChange={(e) => setEditingCarrier({ ...editingCarrier, delaiMoyen: e.target.value })}
                    placeholder="24-48h"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Tarif par Défaut (DT)</label>
                  <input
                    type="number"
                    value={editingCarrier.tarifDefaut || 7}
                    onChange={(e) => setEditingCarrier({ ...editingCarrier, tarifDefaut: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCarrierModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold cursor-pointer"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
