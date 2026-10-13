import React, { useState, useEffect, useMemo } from 'react';
import {
  PackageCheck,
  Truck,
  FileText,
  Upload,
  Printer,
  CheckCircle2,
  RotateCcw,
  Clock,
  Filter,
  Search,
  ChevronRight,
  Eye,
  Check,
  Calendar,
  Phone,
  MapPin,
  DollarSign,
  AlertTriangle,
  Receipt,
  FileCheck,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  RefreshCw,
  X,
  Layers,
  Building2,
  ExternalLink
} from 'lucide-react';
import { DeliveryCompany } from './DeliveryCompaniesView';

interface DeliveryDossier {
  id: string;
  reference: string;
  societeLivraisonId: string;
  societeLivraisonNom: string;
  dateCreation: string;
  heureCreation: string;
  statutGeneral: 'EN_COURS' | 'TERMINEE' | 'LIVREE' | 'RETOURNEE';
  orderIds: string[];
  totalCommandes: number;
  commandesLivrees: number;
  commandesRetournees: number;
  commandesEnCours: number;
  montantTotal: number;
  recuTransporteur?: {
    id: string;
    url: string;
    fileName: string;
    tailleLisible: string;
    mimeType: string;
    dateAjout: string;
    auteur: string;
    description: string;
  } | null;
  historiqueRecus?: any[];
  notes?: string;
  orders?: any[];
  historique?: {
    date: string;
    heure: string;
    auteur: string;
    action: string;
    description: string;
  }[];
}

interface DeliveriesViewProps {
  orders: any[];
  activeShop?: string;
  onReloadOrders?: () => void;
  onSelectShop?: (shop: any) => void;
}

export const DeliveriesView: React.FC<DeliveriesViewProps> = ({
  orders,
  activeShop = 'all',
  onReloadOrders,
  onSelectShop
}) => {
  // Navigation: 'list' (Commandes confirmées + constitution de lots) | 'dossiers' (Dossiers existants) | 'detail' (Vue dossier précis)
  const [activeSubTab, setActiveSubTab] = useState<'confirmed_orders' | 'dossiers'>('confirmed_orders');
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryDossier | null>(null);

  // Deliveries backend state
  const [deliveries, setDeliveries] = useState<DeliveryDossier[]>([]);
  const [isLoadingDeliveries, setIsLoadingDeliveries] = useState(false);

  // Delivery Companies (partenaires)
  const [carriers, setCarriers] = useState<DeliveryCompany[]>([]);

  // Selected orders for creating a delivery dossier
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  // Modal creation delivery
  const [showCreateDeliveryModal, setShowCreateDeliveryModal] = useState(false);
  const [selectedCarrierId, setSelectedCarrierId] = useState<string>('');
  const [deliveryNotes, setDeliveryNotes] = useState<string>('');
  const [isSubmittingDelivery, setIsSubmittingDelivery] = useState(false);

  // Modal upload transport receipt
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptFileBase64, setReceiptFileBase64] = useState<string>('');
  const [receiptFileName, setReceiptFileName] = useState<string>('');
  const [receiptMimeType, setReceiptMimeType] = useState<string>('');
  const [receiptDescription, setReceiptDescription] = useState<string>('');
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);

  // Modal order inspect / documents
  const [inspectOrder, setInspectOrder] = useState<any | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filters for confirmed orders
  const [searchQuery, setSearchQuery] = useState('');
  const [phoneFilter, setPhoneFilter] = useState('');
  const [governorateFilter, setGovernorateFilter] = useState('all');
  const [delegationFilter, setDelegationFilter] = useState('all');
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  // 1. Load deliveries and carriers from backend API
  const fetchDeliveries = async () => {
    setIsLoadingDeliveries(true);
    try {
      const res = await fetch('/api/deliveries');
      if (res.ok) {
        const data = await res.json();
        setDeliveries(data);
      }
    } catch (err) {
      console.error('Erreur chargement dossiers livraisons:', err);
    } finally {
      setIsLoadingDeliveries(false);
    }
  };

  const fetchCarriers = async () => {
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
      console.error('Erreur chargement transporteurs:', err);
    }
  };

  useEffect(() => {
    fetchDeliveries();
    fetchCarriers();
  }, []);

  // 2. Fetch specific delivery details when viewing detail modal / pane
  const reloadSelectedDelivery = async (deliveryId: string) => {
    try {
      const res = await fetch(`/api/deliveries/${deliveryId}`);
      if (res.ok) {
        const updated = await res.json();
        setSelectedDelivery(updated);
        // update in list
        setDeliveries(prev => prev.map(d => (d.id === updated.id || d.reference === updated.reference) ? updated : d));
      }
    } catch (err) {
      console.error('Erreur rechargement dossier livraison:', err);
    }
  };

  // 3. Filter confirmed orders
  // Rule: Contains ONLY confirmed orders. Initialized with « Livraison initiale »
  const confirmedOrders = useMemo(() => {
    return orders.filter(o => {
      const cmdStat = (o.statutCommande || o.status || '').toUpperCase();
      // Must be confirmed (CONFIRMEE)
      return cmdStat === 'CONFIRMEE';
    });
  }, [orders]);

  // Extract unique governorates and delegations from confirmed orders for filter dropdowns
  const availableGovernorates = useMemo(() => {
    const setGov = new Set<string>();
    confirmedOrders.forEach(o => {
      const gov = o.shippingAddress?.governorate || o.customerInfo?.governorate || o.shippingAddress?.city || o.customerInfo?.city;
      if (gov) setGov.add(gov);
    });
    return Array.from(setGov);
  }, [confirmedOrders]);

  const availableDelegations = useMemo(() => {
    const setDel = new Set<string>();
    confirmedOrders.forEach(o => {
      const city = o.shippingAddress?.city || o.customerInfo?.city;
      if (city) setDel.add(city);
    });
    return Array.from(setDel);
  }, [confirmedOrders]);

  // Filtered confirmed orders
  const filteredConfirmedOrders = useMemo(() => {
    return confirmedOrders.filter(o => {
      // 1. Search Query (Client Name, Order ID, Phone)
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        o.id?.toLowerCase().includes(q) ||
        o.orderNumber?.toLowerCase().includes(q) ||
        o.customerName?.toLowerCase().includes(q) ||
        o.phone?.toLowerCase().includes(q) ||
        o.customerInfo?.phone?.toLowerCase().includes(q);

      // 2. Phone specific filter
      const p = phoneFilter.trim();
      const matchPhone = !p || (o.phone || o.customerInfo?.phone || '').includes(p);

      // 3. Governorate filter
      const gov = o.shippingAddress?.governorate || o.customerInfo?.governorate || o.shippingAddress?.city || o.customerInfo?.city || '';
      const matchGov = governorateFilter === 'all' || gov.toLowerCase() === governorateFilter.toLowerCase();

      // 4. Delegation / City filter
      const del = o.shippingAddress?.city || o.customerInfo?.city || '';
      const matchDel = delegationFilter === 'all' || del.toLowerCase() === delegationFilter.toLowerCase();

      // 5. Delivery status filter
      // Normalizing: 'LIVRAISON_INITIALE', 'EN_COURS', 'LIVREE', 'RETOURNEE'
      let st = o.statutLivraison || 'LIVRAISON_INITIALE';
      if (st === 'NON_INITIEE' || st === 'LIVRAISON_EN_ATTENTE') st = 'LIVRAISON_INITIALE';
      if (st === 'AFFECTEE_LIVRAISON' || st === 'EN_LIVRAISON') st = 'EN_COURS';
      if (st === 'RETOUR') st = 'RETOURNEE';

      const matchStatus = deliveryStatusFilter === 'all' || st === deliveryStatusFilter;

      // 6. Date filter
      const d = dateFilter.trim();
      const matchDate = !d || (o.date && o.date.startsWith(d));

      return matchSearch && matchPhone && matchGov && matchDel && matchStatus && matchDate;
    });
  }, [confirmedOrders, searchQuery, phoneFilter, governorateFilter, delegationFilter, deliveryStatusFilter, dateFilter]);

  // Select / deselect orders with "Livraison initiale"
  const toggleSelectOrder = (orderId: string) => {
    setSelectedOrderIds(prev =>
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const selectAllInitialOrders = () => {
    const initialOrderIds = filteredConfirmedOrders
      .filter(o => {
        const st = o.statutLivraison || 'LIVRAISON_INITIALE';
        return st === 'LIVRAISON_INITIALE' || st === 'NON_INITIEE' || st === 'LIVRAISON_EN_ATTENTE';
      })
      .map(o => o.id || o.orderNumber);

    if (selectedOrderIds.length === initialOrderIds.length && initialOrderIds.length > 0) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(initialOrderIds);
    }
  };

  // Selected orders summary
  const selectedOrdersData = useMemo(() => {
    return orders.filter(o => selectedOrderIds.includes(o.id || o.orderNumber));
  }, [orders, selectedOrderIds]);

  const selectedTotalAmount = useMemo(() => {
    return selectedOrdersData.reduce((acc, o) => acc + (Number(o.total || o.totalAmount) || 0), 0);
  }, [selectedOrdersData]);

  // 4. Create Delivery Action (Créer la livraison)
  const handleCreateDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOrderIds.length === 0) {
      showToast('Veuillez sélectionner au moins une commande avec statut "Livraison initiale".', 'error');
      return;
    }
    const carrier = carriers.find(c => c.id === selectedCarrierId);
    if (!carrier) {
      showToast('Veuillez sélectionner une société de livraison partenaire valide.', 'error');
      return;
    }

    setIsSubmittingDelivery(true);
    try {
      const res = await fetch('/api/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          societeLivraisonId: carrier.id,
          societeLivraisonNom: carrier.nom,
          orderIds: selectedOrderIds,
          notes: deliveryNotes
        })
      });

      if (res.ok) {
        const createdDelivery = await res.json();
        showToast(`Dossier de livraison ${createdDelivery.reference} créé avec succès ! Commandes passées en "En cours".`, 'success');
        setShowCreateDeliveryModal(false);
        setSelectedOrderIds([]);
        setDeliveryNotes('');
        await fetchDeliveries();
        if (onReloadOrders) onReloadOrders();
        // Switch to dossiers view and select this new delivery
        setActiveSubTab('dossiers');
        setSelectedDelivery(createdDelivery);
      } else {
        const err = await res.json();
        showToast(err.message || 'Erreur lors de la création de la livraison.', 'error');
      }
    } catch {
      showToast('Erreur de connexion au serveur.', 'error');
    } finally {
      setIsSubmittingDelivery(false);
    }
  };

  // 5. Update individual order delivery status inside a delivery dossier
  const handleUpdateOrderResult = async (deliveryId: string, orderId: string, newStatut: 'LIVREE' | 'RETOURNEE') => {
    try {
      const res = await fetch(`/api/deliveries/${deliveryId}/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          statut: newStatut,
          commentaire: `Marquée comme ${newStatut === 'LIVREE' ? 'Livrée' : 'Retournée'} depuis le dossier de livraison`
        })
      });

      if (res.ok) {
        showToast(`Commande ${orderId} mise à jour : ${newStatut === 'LIVREE' ? 'Livrée' : 'Retournée'}. État général recalculé.`, 'success');
        await reloadSelectedDelivery(deliveryId);
        await fetchDeliveries();
        if (onReloadOrders) onReloadOrders();
      } else {
        const err = await res.json();
        showToast(err.message || 'Erreur lors de la mise à jour.', 'error');
      }
    } catch {
      showToast('Erreur réseau lors de la mise à jour de la commande.', 'error');
    }
  };

  // 6. Update payment / carrier settlement
  const handleUpdatePaymentStatus = async (deliveryId: string, orderId: string, updates: { statutPaiement?: string; reversementRecu?: boolean }) => {
    try {
      const res = await fetch(`/api/deliveries/${deliveryId}/orders/${orderId}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        showToast(`Statut financier de la commande ${orderId} actualisé.`, 'success');
        await reloadSelectedDelivery(deliveryId);
        if (onReloadOrders) onReloadOrders();
      }
    } catch {
      showToast('Erreur lors de la mise à jour financière.', 'error');
    }
  };

  // 7. Generate or access invoice idempotently
  const handleGenerateOrAccessInvoice = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/generate-invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.alreadyExists) {
          showToast(`Facture existante retrouvée (${data.facture.numeroFacture}). Accès immédiat.`, 'info');
        } else {
          showToast(`Facture ${data.facture.numeroFacture} émise avec succès !`, 'success');
        }
        if (selectedDelivery) {
          await reloadSelectedDelivery(selectedDelivery.id);
        }
        if (onReloadOrders) onReloadOrders();
        // Open order modal to view invoice
        setInspectOrder(data.order || orders.find(o => o.id === orderId));
      } else {
        showToast('Erreur lors de l\'émission de la facture.', 'error');
      }
    } catch {
      showToast('Erreur de connexion.', 'error');
    }
  };

  // 8. Upload Carrier Receipt (Reçu du transporteur)
  const handleReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('Fichier trop volumineux. La taille maximale est de 10 Mo.', 'error');
      return;
    }

    setReceiptFileName(file.name);
    setReceiptMimeType(file.type || 'application/pdf');

    const reader = new FileReader();
    reader.onload = () => {
      setReceiptFileBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadReceiptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDelivery || !receiptFileBase64) {
      showToast('Veuillez sélectionner un fichier de reçu (PDF ou Image).', 'error');
      return;
    }

    setIsUploadingReceipt(true);
    try {
      const res = await fetch(`/api/deliveries/${selectedDelivery.id}/receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileBase64: receiptFileBase64,
          fileName: receiptFileName,
          mimeType: receiptMimeType,
          description: receiptDescription
        })
      });

      if (res.ok) {
        showToast('Reçu de remise transporteur enregistré et conservé avec succès de façon persistante !', 'success');
        setShowReceiptModal(false);
        setReceiptFileBase64('');
        setReceiptFileName('');
        setReceiptDescription('');
        await reloadSelectedDelivery(selectedDelivery.id);
        await fetchDeliveries();
      } else {
        const err = await res.json();
        showToast(err.message || 'Erreur lors de l\'enregistrement du reçu.', 'error');
      }
    } catch {
      showToast('Erreur de connexion.', 'error');
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  // 9. Print Delivery Notes (Bons de livraison)
  const handlePrintDeliveryNotes = (delivery: DeliveryDossier) => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-xs font-bold transition-all border ${
            toastMessage.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500'
              : toastMessage.type === 'error'
              ? 'bg-rose-600 text-white border-rose-500'
              : 'bg-blue-600 text-white border-blue-500'
          }`}
        >
          {toastMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <PackageCheck className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white font-serif tracking-tight">
                  Gestion des Livraisons
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Point central des commandes confirmées, affectation groupée aux transporteurs, documents & suivi des résultats
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              type="button"
              onClick={() => {
                setActiveSubTab('confirmed_orders');
                setSelectedDelivery(null);
              }}
              className={`flex-1 md:flex-initial px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeSubTab === 'confirmed_orders' && !selectedDelivery
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>1. Commandes Confirmées ({confirmedOrders.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveSubTab('dossiers');
              }}
              className={`flex-1 md:flex-initial px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeSubTab === 'dossiers'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>2. Dossiers de Livraison ({deliveries.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VUE 1 : COMMANDES CONFIRMÉES & CONSTITUTION D'UN LOT DE LIVRAISON         */}
      {/* ========================================================================= */}
      {activeSubTab === 'confirmed_orders' && !selectedDelivery && (
        <div className="space-y-6">
          {/* Multi-Filter Bar as requested */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" />
                <span>Filtres de sélection des commandes confirmées</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setPhoneFilter('');
                  setGovernorateFilter('all');
                  setDelegationFilter('all');
                  setDeliveryStatusFilter('all');
                  setDateFilter('');
                }}
                className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 transition-colors"
              >
                Réinitialiser filtres
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              {/* 1. Client / Commande */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Client ou N°..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* 2. Téléphone */}
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Téléphone..."
                  value={phoneFilter}
                  onChange={e => setPhoneFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* 3. Gouvernorat */}
              <div>
                <select
                  value={governorateFilter}
                  onChange={e => setGovernorateFilter(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="all">Tous Gouvernorats</option>
                  {availableGovernorates.map(gov => (
                    <option key={gov} value={gov}>{gov}</option>
                  ))}
                </select>
              </div>

              {/* 4. Délégation */}
              <div>
                <select
                  value={delegationFilter}
                  onChange={e => setDelegationFilter(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="all">Toutes Délégations</option>
                  {availableDelegations.map(del => (
                    <option key={del} value={del}>{del}</option>
                  ))}
                </select>
              </div>

              {/* 5. Date */}
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={e => setDateFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              {/* 6. État de livraison (Livraison initiale, En cours, Livrée, Retournée) */}
              <div>
                <select
                  value={deliveryStatusFilter}
                  onChange={e => setDeliveryStatusFilter(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="all">Tous États Livraison</option>
                  <option value="LIVRAISON_INITIALE">Livraison initiale</option>
                  <option value="EN_COURS">En cours</option>
                  <option value="LIVREE">Livrée</option>
                  <option value="RETOURNEE">Retournée</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Bar when orders are selected */}
          <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={selectAllInitialOrders}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-all cursor-pointer"
              >
                {selectedOrderIds.length > 0 ? 'Désélectionner tout' : 'Sélectionner tout (Livraison initiale)'}
              </button>
              <div className="text-xs text-indigo-950 dark:text-indigo-200 font-medium">
                <span className="font-bold text-indigo-700 dark:text-indigo-400">{selectedOrderIds.length}</span> commande(s) sélectionnée(s)
                {selectedOrderIds.length > 0 && (
                  <span className="ml-2 font-bold text-slate-600 dark:text-slate-300">
                    — Total : {selectedTotalAmount.toLocaleString('fr-FR')} DT
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              disabled={selectedOrderIds.length === 0}
              onClick={() => setShowCreateDeliveryModal(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>Affecter à une livraison groupée</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Table of Confirmed Orders */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Commandes Confirmées disponibles ({filteredConfirmedOrders.length})
              </span>
              <span className="text-[11px] text-slate-400">
                Seules les commandes au statut commercial "Confirmée" figurent dans ce module
              </span>
            </div>

            {filteredConfirmedOrders.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <PackageCheck className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                  Aucune commande confirmée ne correspond à vos filtres
                </p>
                <p className="text-xs text-slate-400">
                  Validez des commandes depuis la page « Commandes » pour les voir apparaître ici avec l'état « Livraison initiale ».
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4 w-10 text-center">Sélec.</th>
                      <th className="py-3 px-4">Commande</th>
                      <th className="py-3 px-4">Client & Contact</th>
                      <th className="py-3 px-4">Destination</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-center">État Livraison</th>
                      <th className="py-3 px-4 text-center">Facture</th>
                      <th className="py-3 px-4 text-right">Montant</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {filteredConfirmedOrders.map(order => {
                      const oId = order.id || order.orderNumber;
                      const isSelected = selectedOrderIds.includes(oId);

                      // Normalize Statut Livraison
                      let livStat = order.statutLivraison || 'LIVRAISON_INITIALE';
                      if (livStat === 'NON_INITIEE' || livStat === 'LIVRAISON_EN_ATTENTE') livStat = 'LIVRAISON_INITIALE';
                      if (livStat === 'AFFECTEE_LIVRAISON' || livStat === 'EN_LIVRAISON') livStat = 'EN_COURS';

                      const isInitial = livStat === 'LIVRAISON_INITIALE';

                      return (
                        <tr
                          key={oId}
                          className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                            isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={!isInitial}
                              onChange={() => toggleSelectOrder(oId)}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            />
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {order.orderNumber || order.id}
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {order.filialeName || order.filialeKey || 'Boutique'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {order.customerName || 'Client'}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{order.phone || order.customerInfo?.phone || 'Sans tél'}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="text-slate-800 dark:text-slate-200">
                              {order.shippingAddress?.city || order.customerInfo?.city || 'Tunis'}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{order.shippingAddress?.governorate || order.shippingAddress?.street || 'Tunisie'}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">
                            {order.date}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {livStat === 'LIVRAISON_INITIALE' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-black uppercase tracking-wide">
                                <Clock className="w-3 h-3" />
                                <span>Livraison initiale</span>
                              </span>
                            )}
                            {livStat === 'EN_COURS' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-black uppercase tracking-wide">
                                <Truck className="w-3 h-3" />
                                <span>En cours</span>
                              </span>
                            )}
                            {livStat === 'LIVREE' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wide">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Livrée</span>
                              </span>
                            )}
                            {(livStat === 'RETOURNEE' || livStat === 'RETOUR') && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-black uppercase tracking-wide">
                                <RotateCcw className="w-3 h-3" />
                                <span>Retournée</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {order.facture || order.statutFacture === 'FACTURE_GENEREE' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                                <FileCheck className="w-3 h-3 text-emerald-600" />
                                <span>Générée</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100/60 dark:bg-slate-800/40 text-slate-400 text-[10px]">
                                À générer
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right font-black text-slate-900 dark:text-white">
                            {(Number(order.total || order.totalAmount) || 0).toLocaleString('fr-FR')} DT
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setInspectOrder(order)}
                                title="Voir détails et documents"
                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 text-slate-600 hover:text-indigo-600 cursor-pointer transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleGenerateOrAccessInvoice(oId)}
                                title="Facture"
                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 cursor-pointer transition-colors"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VUE 2 : LISTE DES DOSSIERS DE LIVRAISON GROUPÉE (LIV-2026-XXXX)          */}
      {/* ========================================================================= */}
      {activeSubTab === 'dossiers' && !selectedDelivery && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deliveries.map(deliv => {
              const isEnCours = deliv.statutGeneral === 'EN_COURS';
              const isLivree = deliv.statutGeneral === 'LIVREE';
              const isRetournee = deliv.statutGeneral === 'RETOURNEE';

              return (
                <div
                  key={deliv.id}
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                        {deliv.reference || deliv.id}
                      </span>
                      {isEnCours && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-black uppercase">
                          En cours
                        </span>
                      )}
                      {isLivree && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-black uppercase">
                          Livrée (Terminée)
                        </span>
                      )}
                      {isRetournee && (
                        <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-black uppercase">
                          Retournée
                        </span>
                      )}
                      {!isEnCours && !isLivree && !isRetournee && (
                        <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-black uppercase">
                          Clôturée
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <Truck className="w-4 h-4 text-indigo-600" />
                      <span>{deliv.societeLivraisonNom}</span>
                    </div>

                    {/* Progress Breakdown Box */}
                    <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-center">
                      <div>
                        <span className="text-[10px] text-emerald-600 font-bold block">Livrées</span>
                        <span className="text-lg font-black text-emerald-600">{deliv.commandesLivrees || 0}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-amber-600 font-bold block">En cours</span>
                        <span className="text-lg font-black text-amber-600">{deliv.commandesEnCours || 0}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-rose-600 font-bold block">Retournées</span>
                        <span className="text-lg font-black text-rose-600">{deliv.commandesRetournees || 0}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span>Total : {deliv.totalCommandes || deliv.orderIds?.length || 0} commandes</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {(Number(deliv.montantTotal) || 0).toLocaleString('fr-FR')} DT
                      </span>
                    </div>

                    {/* Carrier Receipt indicator */}
                    <div className="text-[11px] flex items-center justify-between">
                      <span className="text-slate-400">Reçu transporteur :</span>
                      {deliv.recuTransporteur ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Enregistré</span>
                        </span>
                      ) : (
                        <span className="text-amber-600 font-medium">Non fourni</span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => reloadSelectedDelivery(deliv.id)}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <span>Ouvrir dossier & gérer</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VUE 3 : DÉTAIL COMPLET D'UN DOSSIER DE LIVRAISON GROUPÉE (Ex: LIV-2026-0001) */}
      {/* ========================================================================= */}
      {selectedDelivery && (
        <div className="space-y-6">
          {/* Back button */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSelectedDelivery(null)}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retour à la liste des dossiers</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePrintDeliveryNotes(selectedDelivery)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer les bons de livraison</span>
              </button>
              <button
                type="button"
                onClick={() => setShowReceiptModal(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>{selectedDelivery.recuTransporteur ? 'Remplacer le reçu transporteur' : 'Ajouter le reçu du transporteur'}</span>
              </button>
            </div>
          </div>

          {/* Dossier Header Info */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                    {selectedDelivery.reference || selectedDelivery.id}
                  </h2>
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-xs font-black uppercase">
                    {selectedDelivery.statutGeneral}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Transporteur affecté : <strong>{selectedDelivery.societeLivraisonNom}</strong> — Créé le {selectedDelivery.dateCreation} à {selectedDelivery.heureCreation}
                </p>
              </div>

              {/* 3 Metrics Box as in ChatGPT design advice */}
              <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
                <div className="px-5 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 text-center min-w-[90px]">
                  <span className="text-2xl font-black text-emerald-600 block">
                    {selectedDelivery.commandesLivrees || 0}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">Livrées</span>
                </div>

                <div className="px-5 py-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900 text-center min-w-[90px]">
                  <span className="text-2xl font-black text-amber-600 block">
                    {selectedDelivery.commandesEnCours || 0}
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase">En cours</span>
                </div>

                <div className="px-5 py-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900 text-center min-w-[90px]">
                  <span className="text-2xl font-black text-rose-600 block">
                    {selectedDelivery.commandesRetournees || 0}
                  </span>
                  <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase">Retournées</span>
                </div>
              </div>
            </div>

            {/* Carrier Receipt & Document Section */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 shadow-xs">
                  <Receipt className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Reçu de remise transporteur
                  </h4>
                  {selectedDelivery.recuTransporteur ? (
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Fichier : <span className="font-bold text-slate-700 dark:text-slate-300">{selectedDelivery.recuTransporteur.fileName}</span> ({selectedDelivery.recuTransporteur.tailleLisible}) — Enregistré le {selectedDelivery.recuTransporteur.dateAjout}
                    </p>
                  ) : (
                    <p className="text-[11px] text-amber-600 font-medium mt-0.5">
                      Aucun reçu émargé joint pour ce lot. Cliquez sur « Ajouter le reçu » pour archiver le document de remise.
                    </p>
                  )}
                </div>
              </div>

              {selectedDelivery.recuTransporteur && (
                <div className="flex items-center gap-2">
                  <a
                    href={selectedDelivery.recuTransporteur.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Consulter le fichier</span>
                  </a>
                  {selectedDelivery.historiqueRecus && selectedDelivery.historiqueRecus.length > 0 && (
                    <span className="text-[10px] text-slate-400">
                      ({selectedDelivery.historiqueRecus.length} version(s) antérieure(s))
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Individual Orders Inside the Delivery Dossier */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Commandes rattachées au dossier ({selectedDelivery.orders?.length || selectedDelivery.orderIds?.length})
                </h3>
                <span className="text-xs font-black text-indigo-600">
                  Montant global : {(Number(selectedDelivery.montantTotal) || 0).toLocaleString('fr-FR')} DT
                </span>
              </div>

              <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Commande</th>
                      <th className="py-3 px-4">Client & Tél</th>
                      <th className="py-3 px-4">Adresse</th>
                      <th className="py-3 px-4 text-right">Montant</th>
                      <th className="py-3 px-4 text-center">État individuel</th>
                      <th className="py-3 px-4 text-center">Paiement / Reversement</th>
                      <th className="py-3 px-4 text-center">Facture</th>
                      <th className="py-3 px-4 text-center">Action sur le résultat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {(selectedDelivery.orders || []).map((ord: any) => {
                      const oId = ord.id || ord.orderNumber;
                      const livStat = ord.statutLivraison || 'EN_COURS';

                      return (
                        <tr key={oId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                            {ord.orderNumber || ord.id}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-800 dark:text-slate-200">{ord.customerName}</div>
                            <div className="text-[11px] text-slate-400">{ord.phone || ord.customerInfo?.phone}</div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 text-[11px]">
                            {ord.shippingAddress?.street}, {ord.shippingAddress?.city}
                          </td>
                          <td className="py-3.5 px-4 text-right font-black text-slate-900 dark:text-white">
                            {(Number(ord.total || ord.totalAmount) || 0).toLocaleString('fr-FR')} DT
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {livStat === 'LIVREE' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-black uppercase">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Livrée</span>
                              </span>
                            )}
                            {livStat === 'RETOURNEE' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-black uppercase">
                                <RotateCcw className="w-3 h-3" />
                                <span>Retournée</span>
                              </span>
                            )}
                            {livStat !== 'LIVREE' && livStat !== 'RETOURNEE' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-black uppercase">
                                <Truck className="w-3 h-3" />
                                <span>En cours</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex flex-col items-center gap-1 text-[10px]">
                              <span className="font-bold text-slate-700 dark:text-slate-300">
                                {ord.statutPaiement === 'PAIEMENT_ENCAISSE' ? 'Encaissé' : 'À encaisser'}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdatePaymentStatus(selectedDelivery.id, oId, {
                                    reversementRecu: !ord.reversementRecu
                                  })
                                }
                                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                  ord.reversementRecu
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                }`}
                              >
                                {ord.reversementRecu ? 'Reversement Reçu' : 'En attente revers.'}
                              </button>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleGenerateOrAccessInvoice(oId)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 text-indigo-600 font-bold text-[11px] cursor-pointer transition-colors"
                            >
                              {ord.facture ? ord.facture.numeroFacture : 'Accès facture'}
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleUpdateOrderResult(selectedDelivery.id, oId, 'LIVREE')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  livStat === 'LIVREE'
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                                }`}
                              >
                                Livrée
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateOrderResult(selectedDelivery.id, oId, 'RETOURNEE')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  livStat === 'RETOURNEE'
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                                }`}
                              >
                                Retournée
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Dossier Audit History */}
            {selectedDelivery.historique && selectedDelivery.historique.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Journal d'audit du dossier de livraison
                </span>
                <div className="space-y-1.5">
                  {selectedDelivery.historique.map((h, i) => (
                    <div key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                      <span className="text-slate-400 font-mono text-[11px]">{h.date} {h.heure}</span>
                      <span>—</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{h.action} :</span>
                      <span>{h.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1 : AFFECTER À UNE LIVRAISON GROUPÉE (Formulaire récapitulatif)       */}
      {/* ========================================================================= */}
      {showCreateDeliveryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Créer un Dossier de Livraison Groupée
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateDeliveryModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDelivery} className="space-y-4">
              {/* Summary of selected orders */}
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-indigo-950 dark:text-indigo-200">
                  <span>Commandes sélectionnées :</span>
                  <span>{selectedOrderIds.length} commandes</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-indigo-950 dark:text-indigo-200">
                  <span>Montant total du lot :</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-black">
                    {selectedTotalAmount.toLocaleString('fr-FR')} DT
                  </span>
                </div>
                <div className="text-[11px] text-indigo-700 dark:text-indigo-300">
                  Références : {selectedOrderIds.join(', ')}
                </div>
              </div>

              {/* Carrier Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Société de livraison partenaire *
                </label>
                <select
                  required
                  value={selectedCarrierId}
                  onChange={e => setSelectedCarrierId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {carriers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nom} — Zones: {c.zones} ({c.delaiMoyen})
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes instructions */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Instructions ou notes pour le transporteur (optionnel)
                </label>
                <textarea
                  rows={2}
                  value={deliveryNotes}
                  onChange={e => setDeliveryNotes(e.target.value)}
                  placeholder="Ex : Priorité livraison le matin, appeler les clients avant passage..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                ⚡ Le backend créera un dossier unique avec la référence <strong>LIV-2026-XXXX</strong>. Toutes les commandes associées passeront automatiquement à l'état « En cours ».
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateDeliveryModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDelivery}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
                >
                  {isSubmittingDelivery ? 'Création en cours...' : 'Créer la livraison'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2 : AJOUTER / REMPLACER LE REÇU DU TRANSPORTEUR                      */}
      {/* ========================================================================= */}
      {showReceiptModal && selectedDelivery && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Reçu de Remise Transporteur — {selectedDelivery.reference || selectedDelivery.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadReceiptSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Sélectionner le fichier émargé (PDF, PNG ou JPG — Max 10 Mo) *
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,image/png,image/jpeg,image/webp"
                  onChange={handleReceiptFileChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium cursor-pointer"
                />
                {receiptFileName && (
                  <p className="text-[11px] text-emerald-600 font-bold">
                    ✓ Fichier prêt : {receiptFileName}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Commentaire ou référence transporteur (optionnel)
                </label>
                <input
                  type="text"
                  value={receiptDescription}
                  onChange={e => setReceiptDescription(e.target.value)}
                  placeholder="Ex : Bordereau signé par le chauffeur de 14h..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                🔒 Le reçu est conservé de façon persistante dans le serveur backend. En cas de nouveau téléchargement, l'ancien fichier est conservé dans l'historique des versions.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isUploadingReceipt || !receiptFileBase64}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
                >
                  {isUploadingReceipt ? 'Enregistrement...' : 'Enregistrer le reçu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3 : INSPECTION COMMANDE & FACTURE DÉTAILLÉE                          */}
      {/* ========================================================================= */}
      {inspectOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Détails & Facture — {inspectOrder.orderNumber || inspectOrder.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectOrder(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Facture Info if exists */}
              {inspectOrder.facture && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 uppercase">
                      Facture Fiscale Définitive
                    </span>
                    <span className="font-mono font-black text-emerald-700 dark:text-emerald-300 text-sm">
                      {inspectOrder.facture.numeroFacture}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 grid grid-cols-3 gap-2 pt-1 border-t border-emerald-200/40">
                    <div>Total HT: <strong>{inspectOrder.facture.totalHT} DT</strong></div>
                    <div>TVA (19%): <strong>{inspectOrder.facture.tva} DT</strong></div>
                    <div>Total TTC: <strong className="text-slate-900 dark:text-white">{inspectOrder.facture.totalTTC} DT</strong></div>
                  </div>
                </div>
              )}

              {/* Client & Articles */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Articles commandés ({inspectOrder.items?.length || 0})
                </h4>
                <div className="space-y-1.5 border border-slate-100 dark:border-slate-800 rounded-2xl p-3">
                  {(inspectOrder.items || []).map((it: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{it.name}</span>
                        <span className="text-slate-400 ml-2">x{it.quantity}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {(Number(it.price) * Number(it.quantity || 1)).toLocaleString('fr-FR')} DT
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-black">
                    <span>Total Commande</span>
                    <span className="text-indigo-600 text-sm">
                      {(Number(inspectOrder.total || inspectOrder.totalAmount) || 0).toLocaleString('fr-FR')} DT
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={() => setInspectOrder(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
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
