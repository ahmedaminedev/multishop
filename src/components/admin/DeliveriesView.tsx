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
  ArrowRight,
  RefreshCw,
  X,
  Layers,
  Building2,
  ExternalLink,
  ChevronRight,
  Download,
  AlertCircle
} from 'lucide-react';
import { DeliveryCompany } from './DeliveryCompaniesView';
import { DocumentViewerModal, DocumentType } from './documents/DocumentViewerModal';

export interface DeliveryDossier {
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
  montantAEncaisser?: number;
  totalColis?: number;
  recuTransporteur?: {
    id: string;
    url: string;
    fileName: string;
    tailleOctets?: number;
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
  // Navigation: main dashboard view or detail of a single delivery dossier
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryDossier | null>(null);

  // Deliveries backend state
  const [deliveries, setDeliveries] = useState<DeliveryDossier[]>([]);
  const [isLoadingDeliveries, setIsLoadingDeliveries] = useState(false);

  // Delivery Companies (carriers)
  const [carriers, setCarriers] = useState<DeliveryCompany[]>([]);

  // Selected orders for creating a delivery batch
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  // 4-Step Modal Creation Delivery
  const [showCreateDeliveryModal, setShowCreateDeliveryModal] = useState(false);
  const [createStep, setCreateStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedCarrierId, setSelectedCarrierId] = useState<string>('');
  const [deliveryNotes, setDeliveryNotes] = useState<string>('');
  const [isSubmittingDelivery, setIsSubmittingDelivery] = useState(false);

  // Upload Carrier Receipt Modal
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptFileBase64, setReceiptFileBase64] = useState<string>('');
  const [receiptFileName, setReceiptFileName] = useState<string>('');
  const [receiptMimeType, setReceiptMimeType] = useState<string>('');
  const [receiptDescription, setReceiptDescription] = useState<string>('');
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);

  // Single Order Status Confirmation Modals
  const [orderToDeliverConfirm, setOrderToDeliverConfirm] = useState<any | null>(null);
  const [orderToReturnConfirm, setOrderToReturnConfirm] = useState<any | null>(null);
  const [returnMotif, setReturnMotif] = useState<string>('Client injoignable après plusieurs tentatives');
  const [returnComment, setReturnComment] = useState<string>('');
  const [isUpdatingOrderStatus, setIsUpdatingOrderStatus] = useState<boolean>(false);

  // Document Viewer Modal State
  const [documentModalState, setDocumentModalState] = useState<{
    isOpen: boolean;
    type: DocumentType;
    singleOrderId?: string;
  }>({
    isOpen: false,
    type: 'handover_slip'
  });

  // Global filters for Section 1 (Commandes prêtes)
  const [searchQuery, setSearchQuery] = useState('');
  const [phoneFilter, setPhoneFilter] = useState('');
  const [governorateFilter, setGovernorateFilter] = useState('all');
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  // Filters for Section 2 (Livraisons créées)
  const [dossierSearch, setDossierSearch] = useState('');
  const [dossierCarrierFilter, setDossierCarrierFilter] = useState('all');
  const [dossierStatusFilter, setDossierStatusFilter] = useState('all');
  const [dossierDateFilter, setDossierDateFilter] = useState('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

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

    const handleRealtimeDeliveries = () => {
      fetchDeliveries();
      if (onReloadOrders) onReloadOrders();
    };

    window.addEventListener('orders_updated', handleRealtimeDeliveries);
    window.addEventListener('multishop_data_changed', handleRealtimeDeliveries);
    window.addEventListener('multishop-data-changed', handleRealtimeDeliveries);
    return () => {
      window.removeEventListener('orders_updated', handleRealtimeDeliveries);
      window.removeEventListener('multishop_data_changed', handleRealtimeDeliveries);
      window.removeEventListener('multishop-data-changed', handleRealtimeDeliveries);
    };
  }, [onReloadOrders]);

  // 2. Refresh active delivery detail
  const reloadSelectedDelivery = async (deliveryId: string) => {
    try {
      const res = await fetch(`/api/deliveries/${deliveryId}`);
      if (res.ok) {
        const updated = await res.json();
        setSelectedDelivery(updated);
        setDeliveries(prev => prev.map(d => (d.id === updated.id || d.reference === updated.reference) ? updated : d));
      }
    } catch (err) {
      console.error('Erreur rechargement dossier livraison:', err);
    }
  };

  // 3. Compute KPI counts
  // Set of order IDs already inside an active delivery (EN_COURS)
  const assignedActiveOrderIds = useMemo(() => {
    const set = new Set<string>();
    deliveries.forEach(del => {
      if (del.statutGeneral === 'EN_COURS' && Array.isArray(del.orderIds)) {
        del.orderIds.forEach(id => set.add(id));
      }
    });
    return set;
  }, [deliveries]);

  // All confirmed orders
  const allConfirmedOrders = useMemo(() => {
    return orders.filter(o => {
      const cmdStat = (o.statutCommande || o.status || '').toUpperCase();
      return cmdStat === 'CONFIRMEE';
    });
  }, [orders]);

  // KPI 1: Commandes confirmées non affectées (éligibles pour constitution d'un nouveau lot)
  const unassignedConfirmedOrders = useMemo(() => {
    return allConfirmedOrders.filter(o => {
      const oId = o.id || o.orderNumber;
      const livStat = o.statutLivraison || 'LIVRAISON_INITIALE';
      const isNotAssigned = !assignedActiveOrderIds.has(oId) && !o.deliveryId;
      const isEligibleStatus = ['LIVRAISON_INITIALE', 'NON_INITIEE', 'LIVRAISON_EN_ATTENTE'].includes(livStat);
      return isNotAssigned && isEligibleStatus;
    });
  }, [allConfirmedOrders, assignedActiveOrderIds]);

  // KPI 2: Livraisons en cours
  const activeDeliveriesCount = useMemo(() => {
    return deliveries.filter(d => d.statutGeneral === 'EN_COURS').length;
  }, [deliveries]);

  // KPI 3: Commandes livrées
  const totalDeliveredOrdersCount = useMemo(() => {
    return orders.filter(o => o.statutLivraison === 'LIVREE').length;
  }, [orders]);

  // KPI 4: Commandes retournées
  const totalReturnedOrdersCount = useMemo(() => {
    return orders.filter(o => o.statutLivraison === 'RETOURNEE' || o.statutLivraison === 'RETOUR').length;
  }, [orders]);

  // Filter available governorates
  const availableGovernorates = useMemo(() => {
    const setGov = new Set<string>();
    unassignedConfirmedOrders.forEach(o => {
      const gov = o.shippingAddress?.governorate || o.customerInfo?.governorate || o.shippingAddress?.city || o.customerInfo?.city;
      if (gov) setGov.add(gov);
    });
    return Array.from(setGov);
  }, [unassignedConfirmedOrders]);

  // Filtered orders for Section 1: Commandes prêtes à être expédiées
  const filteredReadyOrders = useMemo(() => {
    return unassignedConfirmedOrders.filter(o => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        o.id?.toLowerCase().includes(q) ||
        o.orderNumber?.toLowerCase().includes(q) ||
        o.customerName?.toLowerCase().includes(q) ||
        o.phone?.toLowerCase().includes(q) ||
        o.customerInfo?.phone?.toLowerCase().includes(q);

      const p = phoneFilter.trim();
      const matchPhone = !p || (o.phone || o.customerInfo?.phone || '').includes(p);

      const gov = o.shippingAddress?.governorate || o.customerInfo?.governorate || o.shippingAddress?.city || o.customerInfo?.city || '';
      const matchGov = governorateFilter === 'all' || gov.toLowerCase() === governorateFilter.toLowerCase();

      const livStat = o.statutLivraison || 'LIVRAISON_INITIALE';
      const matchStatus = deliveryStatusFilter === 'all' || livStat === deliveryStatusFilter;

      const d = dateFilter.trim();
      const matchDate = !d || (o.date && o.date.startsWith(d));

      return matchSearch && matchPhone && matchGov && matchStatus && matchDate;
    });
  }, [unassignedConfirmedOrders, searchQuery, phoneFilter, governorateFilter, deliveryStatusFilter, dateFilter]);

  // Filtered Section 2 Deliveries
  const filteredDossiers = useMemo(() => {
    return deliveries.filter(d => {
      const q = dossierSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        d.id?.toLowerCase().includes(q) ||
        d.reference?.toLowerCase().includes(q) ||
        d.societeLivraisonNom?.toLowerCase().includes(q);

      const matchCarrier = dossierCarrierFilter === 'all' || d.societeLivraisonId === dossierCarrierFilter || d.societeLivraisonNom === dossierCarrierFilter;
      const matchStatus = dossierStatusFilter === 'all' || d.statutGeneral === dossierStatusFilter;
      const matchDate = !dossierDateFilter || d.dateCreation?.startsWith(dossierDateFilter);

      return matchSearch && matchCarrier && matchStatus && matchDate;
    });
  }, [deliveries, dossierSearch, dossierCarrierFilter, dossierStatusFilter, dossierDateFilter]);

  // Selection toggle
  const toggleSelectOrder = (orderId: string) => {
    setSelectedOrderIds(prev =>
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const handleSelectAllReady = () => {
    const readyIds = filteredReadyOrders.map(o => o.id || o.orderNumber);
    if (selectedOrderIds.length === readyIds.length && readyIds.length > 0) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(readyIds);
    }
  };

  // Selected orders data summary
  const selectedOrdersData = useMemo(() => {
    return orders.filter(o => selectedOrderIds.includes(o.id || o.orderNumber));
  }, [orders, selectedOrderIds]);

  const selectedPackagesCount = useMemo(() => {
    return selectedOrdersData.reduce((acc, o) => {
      const items = Array.isArray(o.items) ? o.items : [];
      const count = o.itemCount || items.reduce((sum: number, it: any) => sum + (Number(it.quantity) || 1), 0) || 1;
      return acc + count;
    }, 0);
  }, [selectedOrdersData]);

  const selectedTotalAmount = useMemo(() => {
    return selectedOrdersData.reduce((acc, o) => acc + (Number(o.total || o.totalAmount) || 0), 0);
  }, [selectedOrdersData]);

  // Montant à encaisser (COD) sur la sélection (exclut les commandes déjà payées en ligne !)
  const selectedCodAmount = useMemo(() => {
    return selectedOrdersData.reduce((acc, o) => {
      const isDejaPaye = o.statutPaiement === 'PAIEMENT_ENCAISSE' || 
                         o.paymentMethod === 'EN_LIGNE' || 
                         o.paymentMethod === 'CARTE_BANCAIRE' || 
                         o.paymentMethod === 'PAYMEE';
      return isDejaPaye ? acc : acc + (Number(o.total || o.totalAmount) || 0);
    }, 0);
  }, [selectedOrdersData]);

  // 4. Create Delivery Action (Page C)
  const handleConfirmCreateDelivery = async () => {
    if (selectedOrderIds.length === 0) {
      showToast('Veuillez sélectionner au moins une commande.', 'error');
      return;
    }
    const carrier = carriers.find(c => c.id === selectedCarrierId);
    if (!carrier) {
      showToast('Veuillez choisir une société de livraison partenaire valide.', 'error');
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
        showToast(`Dossier de livraison ${createdDelivery.reference} créé avec succès !`, 'success');
        setShowCreateDeliveryModal(false);
        setCreateStep(1);
        setSelectedOrderIds([]);
        setDeliveryNotes('');
        await fetchDeliveries();
        if (onReloadOrders) onReloadOrders();
        
        // Open the newly created delivery detail view directly!
        const detailRes = await fetch(`/api/deliveries/${createdDelivery.id}`);
        if (detailRes.ok) {
          const detailData = await detailRes.json();
          setSelectedDelivery(detailData);
        } else {
          setSelectedDelivery(createdDelivery);
        }
      } else {
        const err = await res.json();
        showToast(err.message || 'Erreur lors de la création de la livraison.', 'error');
      }
    } catch {
      showToast('Erreur de communication avec le serveur.', 'error');
    } finally {
      setIsSubmittingDelivery(false);
    }
  };

  // 5. Update individual order delivery status inside a delivery dossier
  const executeUpdateOrderStatus = async (deliveryId: string, orderId: string, statut: 'LIVREE' | 'RETOURNEE', motif?: string, comment?: string) => {
    setIsUpdatingOrderStatus(true);
    try {
      const res = await fetch(`/api/deliveries/${deliveryId}/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          statut,
          motif: motif || (statut === 'LIVREE' ? 'Remis au client' : 'Refus client ou non joignable'),
          commentaire: comment || ''
        })
      });

      if (res.ok) {
        showToast(`Commande ${orderId} marquée comme ${statut === 'LIVREE' ? 'Livrée' : 'Retournée'} avec succès.`, 'success');
        setOrderToDeliverConfirm(null);
        setOrderToReturnConfirm(null);
        setReturnComment('');
        await reloadSelectedDelivery(deliveryId);
        await fetchDeliveries();
        if (onReloadOrders) onReloadOrders();
      } else {
        const err = await res.json();
        showToast(err.message || 'Erreur lors de la mise à jour.', 'error');
      }
    } catch {
      showToast('Erreur réseau lors de la mise à jour de la commande.', 'error');
    } finally {
      setIsUpdatingOrderStatus(false);
    }
  };

  // 6. Upload carrier receipt
  const handleReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('Fichier trop volumineux. La taille maximale autorisée est de 10 Mo.', 'error');
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
      showToast('Veuillez sélectionner un fichier (PDF, PNG, JPG).', 'error');
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
        showToast('Reçu du transporteur enregistré et stocké de manière persistante sur le serveur !', 'success');
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
      showToast('Erreur de connexion au serveur.', 'error');
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  // 7. Generate or access invoice idempotently
  const handleGenerateInvoice = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/generate-invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        showToast(`Facture ${data.facture?.numeroFacture || ''} disponible sans doublon.`, 'success');
        if (selectedDelivery) {
          await reloadSelectedDelivery(selectedDelivery.id);
        }
        if (onReloadOrders) onReloadOrders();
      } else {
        showToast('Erreur lors de la génération de la facture.', 'error');
      }
    } catch {
      showToast('Erreur réseau.', 'error');
    }
  };

  // Helper: Open document modal
  const openDocumentModal = (type: DocumentType, singleOrderId?: string) => {
    setDocumentModalState({
      isOpen: true,
      type,
      singleOrderId
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 font-sans">
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

      {/* ========================================================================= */}
      {/* VUE PRINCIPALE : TABLEAU DE BORD DES LIVRAISONS & DEUX SECTIONS CLAIRES  */}
      {/* ========================================================================= */}
      {!selectedDelivery && (
        <>
          {/* 1. TOP METRICS / KPI BAR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Confirmées non affectées
                </span>
                <p className="text-2xl font-black text-blue-600 mt-1">
                  {unassignedConfirmedOrders.length}
                </p>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Prêtes pour constitution de lots
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            {/* KPI 2 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Livraisons en cours
                </span>
                <p className="text-2xl font-black text-amber-600 mt-1">
                  {activeDeliveriesCount}
                </p>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Lots confiés aux transporteurs
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600">
                <Truck className="w-6 h-6" />
              </div>
            </div>

            {/* KPI 3 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Commandes livrées
                </span>
                <p className="text-2xl font-black text-emerald-600 mt-1">
                  {totalDeliveredOrdersCount}
                </p>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Remises avec succès aux clients
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            {/* KPI 4 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Commandes retournées
                </span>
                <p className="text-2xl font-black text-rose-600 mt-1">
                  {totalReturnedOrdersCount}
                </p>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Échecs de livraison réintégrés
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600">
                <RotateCcw className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* 2. FILTRES DE RECHERCHE */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" />
                <span>Filtres de recherche et préparation logistique</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setPhoneFilter('');
                  setGovernorateFilter('all');
                  setDeliveryStatusFilter('all');
                  setDateFilter('');
                }}
                className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 cursor-pointer transition-colors"
              >
                Réinitialiser filtres
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* N° Commande ou Client */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Numéro ou nom client..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Téléphone */}
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Téléphone client..."
                  value={phoneFilter}
                  onChange={e => setPhoneFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Gouvernorat */}
              <div>
                <select
                  value={governorateFilter}
                  onChange={e => setGovernorateFilter(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="all">Tous Gouvernorats</option>
                  {availableGovernorates.map(gov => (
                    <option key={gov} value={gov}>{gov}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={e => setDateFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              {/* Statut de livraison */}
              <div>
                <select
                  value={deliveryStatusFilter}
                  onChange={e => setDeliveryStatusFilter(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="all">Tous Statuts Livraison</option>
                  <option value="LIVRAISON_INITIALE">Livraison initiale</option>
                  <option value="EN_COURS">En cours</option>
                  <option value="LIVREE">Livrée</option>
                  <option value="RETOURNEE">Retournée</option>
                </select>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 1 : COMMANDES PRÊTES À ÊTRE EXPÉDIÉES                             */}
          {/* ========================================================================= */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Section 1 : Commandes prêtes à être expédiées ({filteredReadyOrders.length})
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Commandes confirmées éligibles à l'affectation dans un nouveau dossier de livraison groupée.
                </p>
              </div>

              {/* Bouton de création de livraison avec sélection */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSelectAllReady}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-bold transition-all cursor-pointer"
                >
                  {selectedOrderIds.length > 0 ? 'Désélectionner tout' : 'Sélectionner tout'}
                </button>

                <button
                  type="button"
                  disabled={selectedOrderIds.length === 0}
                  onClick={() => {
                    setCreateStep(1);
                    setShowCreateDeliveryModal(true);
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Truck className="w-4 h-4" />
                  <span>Créer une livraison avec les commandes sélectionnées ({selectedOrderIds.length})</span>
                </button>
              </div>
            </div>

            {filteredReadyOrders.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <PackageCheck className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Aucune commande confirmée en attente d'affectation
                </p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Toutes les commandes confirmées ont déjà été regroupées dans des livraisons, ou aucune nouvelle commande n'est en statut "Confirmée".
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-3 w-10 text-center">Sélec.</th>
                      <th className="py-3 px-4">N° Commande</th>
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4">Téléphone</th>
                      <th className="py-3 px-4">Destination</th>
                      <th className="py-3 px-3 text-center">Colis / Articles</th>
                      <th className="py-3 px-4 text-right">Montant Total</th>
                      <th className="py-3 px-4 text-right">À Encaisser (COD)</th>
                      <th className="py-3 px-3 text-center">Statut Facture</th>
                      <th className="py-3 px-3 text-center">Statut Livraison</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {filteredReadyOrders.map(order => {
                      const oId = order.id || order.orderNumber;
                      const isSelected = selectedOrderIds.includes(oId);
                      const items = Array.isArray(order.items) ? order.items : [];
                      const packages = order.itemCount || items.reduce((sum: number, it: any) => sum + (Number(it.quantity) || 1), 0) || 1;
                      const totalAmount = Number(order.total || order.totalAmount) || 0;

                      // Is online paid?
                      const isDejaPaye = order.statutPaiement === 'PAIEMENT_ENCAISSE' || 
                                         order.paymentMethod === 'EN_LIGNE' || 
                                         order.paymentMethod === 'CARTE_BANCAIRE' || 
                                         order.paymentMethod === 'PAYMEE';
                      const aEncaisser = isDejaPaye ? 0 : totalAmount;

                      const city = order.shippingAddress?.city || order.customerInfo?.city || 'Tunis';
                      const gov = order.shippingAddress?.governorate || order.customerInfo?.governorate || city;

                      return (
                        <tr
                          key={oId}
                          className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                            isSelected ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
                          }`}
                        >
                          <td className="py-3 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectOrder(oId)}
                              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                            {order.orderNumber || order.id}
                            <span className="block text-[10px] text-slate-400 font-normal">
                              {order.date}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                            {order.customerName}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                            {order.phone || order.customerInfo?.phone || '—'}
                          </td>
                          <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                            <span className="font-semibold block">{city}</span>
                            <span className="text-[10px] text-slate-400">{gov}</span>
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-slate-800 dark:text-slate-200">
                            {packages}
                          </td>
                          <td className="py-3 px-4 text-right font-black text-slate-900 dark:text-white">
                            {totalAmount.toLocaleString('fr-FR')} DT
                          </td>
                          <td className="py-3 px-4 text-right">
                            {isDejaPaye ? (
                              <span className="text-[11px] font-bold text-slate-400">
                                0 DT (Payé en ligne)
                              </span>
                            ) : (
                              <span className="font-mono font-black text-emerald-600 text-xs">
                                {aEncaisser.toLocaleString('fr-FR')} DT
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {order.facture || order.statutFacture === 'FACTURE_GENEREE' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                                <FileCheck className="w-3 h-3" />
                                <span>Générée</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px]">
                                À générer
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-black uppercase">
                              <Clock className="w-3 h-3" />
                              <span>Prête à expédier</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* SECTION 2 : LIVRAISONS CRÉÉES (LOTS CONFIÉS AUX TRANSPORTEURS)            */}
          {/* ========================================================================= */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Section 2 : Livraisons créées ({filteredDossiers.length})
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lots groupés préparés, documents de remise et suivi des tournées des transporteurs.
                </p>
              </div>

              {/* Filtres de la section Livraisons créées */}
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  placeholder="Filtrer n° lot ou transporteur..."
                  value={dossierSearch}
                  onChange={e => setDossierSearch(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <select
                  value={dossierCarrierFilter}
                  onChange={e => setDossierCarrierFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold cursor-pointer"
                >
                  <option value="all">Tous transporteurs</option>
                  {carriers.map(c => (
                    <option key={c.id} value={c.nom}>{c.nom}</option>
                  ))}
                </select>

                <select
                  value={dossierStatusFilter}
                  onChange={e => setDossierStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold cursor-pointer"
                >
                  <option value="all">Tous statuts</option>
                  <option value="EN_COURS">En cours</option>
                  <option value="LIVREE">Livrée</option>
                  <option value="RETOURNEE">Retournée</option>
                  <option value="TERMINEE">Terminée</option>
                </select>
              </div>
            </div>

            {filteredDossiers.length === 0 ? (
              <div className="py-10 text-center text-slate-400 space-y-1">
                <Truck className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Aucun dossier de livraison ne correspond aux critères
                </p>
                <p className="text-xs text-slate-400">
                  Sélectionnez des commandes dans la Section 1 pour créer votre premier lot de livraison.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4">N° Livraison</th>
                      <th className="py-3 px-4">Société de Livraison</th>
                      <th className="py-3 px-4">Date de Création</th>
                      <th className="py-3 px-3 text-center">Nb Commandes</th>
                      <th className="py-3 px-4 text-right">Montant à Encaisser (COD)</th>
                      <th className="py-3 px-3 text-center">Livrées</th>
                      <th className="py-3 px-3 text-center">Retournées</th>
                      <th className="py-3 px-4 text-center">Statut Global</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {filteredDossiers.map(delivery => {
                      const livrees = delivery.commandesLivrees || 0;
                      const retournees = delivery.commandesRetournees || 0;
                      const totalCmd = delivery.totalCommandes || delivery.orderIds?.length || 0;
                      const codAmount = delivery.montantAEncaisser !== undefined ? delivery.montantAEncaisser : delivery.montantTotal;

                      return (
                        <tr key={delivery.id || delivery.reference} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-black text-slate-900 dark:text-white">
                            {delivery.reference || delivery.id}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                            {delivery.societeLivraisonNom}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                            {delivery.dateCreation} <span className="text-[10px] text-slate-400">à {delivery.heureCreation}</span>
                          </td>
                          <td className="py-3.5 px-3 text-center font-black text-slate-900 dark:text-white">
                            {totalCmd}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-600">
                            {codAmount.toLocaleString('fr-FR')} DT
                          </td>
                          <td className="py-3.5 px-3 text-center font-bold text-emerald-600">
                            {livrees}
                          </td>
                          <td className="py-3.5 px-3 text-center font-bold text-rose-600">
                            {retournees}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {delivery.statutGeneral === 'EN_COURS' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-black uppercase">
                                <Truck className="w-3 h-3" />
                                <span>En cours</span>
                              </span>
                            )}
                            {delivery.statutGeneral === 'LIVREE' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-black uppercase">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Livrée</span>
                              </span>
                            )}
                            {delivery.statutGeneral === 'RETOURNEE' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-black uppercase">
                                <RotateCcw className="w-3 h-3" />
                                <span>Retournée</span>
                              </span>
                            )}
                            {delivery.statutGeneral === 'TERMINEE' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 text-white dark:bg-slate-800 dark:text-emerald-400 text-[10px] font-black uppercase">
                                <ShieldCheck className="w-3 h-3" />
                                <span>Terminée</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={async () => {
                                const res = await fetch(`/api/deliveries/${delivery.id}`);
                                if (res.ok) {
                                  const data = await res.json();
                                  setSelectedDelivery(data);
                                } else {
                                  setSelectedDelivery(delivery);
                                }
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Consulter</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* VUE DÉTAILLÉE D'UNE LIVRAISON (PAGE DE DÉTAIL D'UNE LIVRAISON)             */}
      {/* ========================================================================= */}
      {selectedDelivery && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Bar */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSelectedDelivery(null)}
              className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retour à la liste des livraisons</span>
            </button>

            <span className="text-xs text-slate-500">
              Dossier logistique sous protocole MultiShop Network
            </span>
          </div>

          {/* En-tête de la livraison */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                    {selectedDelivery.reference || selectedDelivery.id}
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                    selectedDelivery.statutGeneral === 'EN_COURS'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : selectedDelivery.statutGeneral === 'LIVREE'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-slate-900 text-white dark:bg-slate-800 dark:text-emerald-400'
                  }`}>
                    {selectedDelivery.statutGeneral}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Société de livraison : <strong className="text-slate-800 dark:text-slate-200">{selectedDelivery.societeLivraisonNom}</strong> — Créé le {selectedDelivery.dateCreation} à {selectedDelivery.heureCreation}
                </p>
              </div>

              {/* 4 Compteurs clés en haut */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
                <div className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center min-w-[90px]">
                  <span className="text-xl font-black text-slate-900 dark:text-white block">
                    {selectedDelivery.totalCommandes || selectedDelivery.orderIds?.length || 0}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Total Commandes</span>
                </div>

                <div className="px-4 py-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-center min-w-[90px]">
                  <span className="text-xl font-black text-amber-600 block">
                    {selectedDelivery.commandesEnCours || 0}
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase">En cours</span>
                </div>

                <div className="px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-center min-w-[90px]">
                  <span className="text-xl font-black text-emerald-600 block">
                    {selectedDelivery.commandesLivrees || 0}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">Livrées</span>
                </div>

                <div className="px-4 py-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-center min-w-[90px]">
                  <span className="text-xl font-black text-rose-600 block">
                    {selectedDelivery.commandesRetournees || 0}
                  </span>
                  <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase">Retournées</span>
                </div>
              </div>
            </div>

            {/* ZONE 1 — DOCUMENTS DE LIVRAISON */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>Documents</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Génération, consultation et impression A4 des pièces justificatives du lot
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                {/* Action 1 : Bordereau de remise */}
                <button
                  type="button"
                  onClick={() => openDocumentModal('handover_slip')}
                  className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:border-indigo-500 text-slate-800 dark:text-slate-200 hover:text-indigo-600 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs transition-all active:scale-95"
                >
                  <Truck className="w-4 h-4 text-indigo-600" />
                  <span>Imprimer le bordereau de remise au transporteur</span>
                </button>

                {/* Action 2 : Bons de livraison */}
                <button
                  type="button"
                  onClick={() => openDocumentModal('delivery_notes')}
                  className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:border-indigo-500 text-slate-800 dark:text-slate-200 hover:text-indigo-600 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs transition-all active:scale-95"
                >
                  <Printer className="w-4 h-4 text-indigo-600" />
                  <span>Imprimer les bons de livraison ({selectedDelivery.orders?.length || selectedDelivery.orderIds?.length || 0})</span>
                </button>

                {/* Action 3 : Factures */}
                <button
                  type="button"
                  onClick={() => openDocumentModal('invoices')}
                  className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:border-indigo-500 text-slate-800 dark:text-slate-200 hover:text-indigo-600 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs transition-all active:scale-95"
                >
                  <Receipt className="w-4 h-4 text-indigo-600" />
                  <span>Consulter les factures</span>
                </button>
              </div>
            </div>

            {/* ZONE 2 — LISTE DES COMMANDES DE LA LIVRAISON */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Liste des commandes de la livraison ({selectedDelivery.orders?.length || selectedDelivery.orderIds?.length || 0})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Suivez le résultat de chaque colis individuellement sans impacter les autres commandes
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-emerald-600 block">
                    Total à encaisser : {((selectedDelivery.montantAEncaisser !== undefined ? selectedDelivery.montantAEncaisser : selectedDelivery.montantTotal) || 0).toLocaleString('fr-FR')} DT
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4">N° Commande</th>
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4">Téléphone</th>
                      <th className="py-3 px-4">Destination</th>
                      <th className="py-3 px-3 text-center">Nb Colis</th>
                      <th className="py-3 px-4 text-right">Montant Commande</th>
                      <th className="py-3 px-4 text-right">Montant à Encaisser</th>
                      <th className="py-3 px-3 text-center">Statut Individuel</th>
                      <th className="py-3 px-4 text-center">Actions sur le Résultat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {(selectedDelivery.orders || []).map((ord: any) => {
                      const oId = ord.id || ord.orderNumber;
                      const livStat = ord.statutLivraison || 'EN_COURS';
                      const items = Array.isArray(ord.items) ? ord.items : [];
                      const packages = ord.itemCount || items.reduce((sum: number, it: any) => sum + (Number(it.quantity) || 1), 0) || 1;
                      const totalAmt = Number(ord.total || ord.totalAmount) || 0;

                      const isDejaPaye = ord.statutPaiement === 'PAIEMENT_ENCAISSE' || 
                                         ord.paymentMethod === 'EN_LIGNE' || 
                                         ord.paymentMethod === 'CARTE_BANCAIRE' || 
                                         ord.paymentMethod === 'PAYMEE';
                      const aEncaisser = isDejaPaye ? 0 : totalAmt;

                      const city = ord.shippingAddress?.city || ord.customerInfo?.city || 'Tunis';
                      const gov = ord.shippingAddress?.governorate || ord.customerInfo?.governorate || city;

                      return (
                        <tr key={oId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                            {ord.orderNumber || ord.id}
                            <button
                              type="button"
                              onClick={() => openDocumentModal('delivery_notes', oId)}
                              className="text-[10px] text-indigo-600 block hover:underline cursor-pointer"
                            >
                              Voir bon de livraison
                            </button>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                            {ord.customerName}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                            {ord.phone || ord.customerInfo?.phone || '—'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                            <span className="font-semibold block">{city}</span>
                            <span className="text-[10px] text-slate-400">{gov}</span>
                          </td>
                          <td className="py-3.5 px-3 text-center font-bold text-slate-800 dark:text-slate-200">
                            {packages}
                          </td>
                          <td className="py-3.5 px-4 text-right font-black text-slate-900 dark:text-white">
                            {totalAmt.toLocaleString('fr-FR')} DT
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {isDejaPaye ? (
                              <span className="text-[10px] font-bold text-slate-400">
                                0 DT (Payé)
                              </span>
                            ) : (
                              <span className="font-mono font-black text-emerald-600 text-xs">
                                {aEncaisser.toLocaleString('fr-FR')} DT
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            {livStat === 'LIVREE' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-black uppercase">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Livrée</span>
                              </span>
                            )}
                            {(livStat === 'RETOURNEE' || livStat === 'RETOUR') && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-black uppercase">
                                <RotateCcw className="w-3 h-3" />
                                <span>Retournée</span>
                              </span>
                            )}
                            {livStat !== 'LIVREE' && livStat !== 'RETOURNEE' && livStat !== 'RETOUR' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-black uppercase">
                                <Truck className="w-3 h-3" />
                                <span>En cours</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {/* Action Marquer comme livrée */}
                              <button
                                type="button"
                                onClick={() => setOrderToDeliverConfirm(ord)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  livStat === 'LIVREE'
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                }`}
                              >
                                Marquer comme livrée
                              </button>

                              {/* Action Marquer comme retournée */}
                              <button
                                type="button"
                                onClick={() => setOrderToReturnConfirm(ord)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  livStat === 'RETOURNEE' || livStat === 'RETOUR'
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                }`}
                              >
                                Marquer comme retournée
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

            {/* ZONE 3 — REÇU DU TRANSPORTEUR */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-indigo-600 shadow-xs shrink-0">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Zone 3 : Reçu du transporteur
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Archive sécurisée et persistante du document signé par le transporteur ou le chauffeur
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowReceiptModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-all shrink-0 active:scale-95"
                >
                  <Upload className="w-4 h-4" />
                  <span>{selectedDelivery.recuTransporteur ? 'Remplacer le reçu transporteur' : 'Ajouter le reçu du transporteur'}</span>
                </button>
              </div>

              {/* Statut du fichier de reçu */}
              {selectedDelivery.recuTransporteur ? (
                <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">
                        {selectedDelivery.recuTransporteur.fileName}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono text-slate-600 dark:text-slate-300">
                        {selectedDelivery.recuTransporteur.tailleLisible}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Enregistré le {selectedDelivery.recuTransporteur.dateAjout} par {selectedDelivery.recuTransporteur.auteur}
                      {selectedDelivery.recuTransporteur.description && ` — "${selectedDelivery.recuTransporteur.description}"`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={selectedDelivery.recuTransporteur.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Consulter</span>
                    </a>
                    <a
                      href={selectedDelivery.recuTransporteur.url}
                      download={selectedDelivery.recuTransporteur.fileName}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Télécharger</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center gap-3 text-xs text-amber-800 dark:text-amber-300">
                  <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
                  <span>
                    Aucun reçu transporteur n'a encore été joint à cette livraison. Cliquez sur « Ajouter le reçu du transporteur » pour téléverser le document émargé (PDF, PNG ou JPG).
                  </span>
                </div>
              )}

              {/* Historique des remplacements si existant */}
              {selectedDelivery.historiqueRecus && selectedDelivery.historiqueRecus.length > 0 && (
                <div className="pt-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                    Historique des versions antérieures du reçu ({selectedDelivery.historiqueRecus.length})
                  </span>
                  <div className="space-y-1">
                    {selectedDelivery.historiqueRecus.map((rec: any, idx: number) => (
                      <div key={idx} className="text-xs text-slate-500 flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span>Version {idx + 1} : {rec.fileName} ({rec.tailleLisible}) — {rec.dateAjout}</span>
                        <a href={rec.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-[11px]">
                          Voir
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE C : MODAL DE CRÉATION D'UNE LIVRAISON EN 4 ÉTAPES GUIDÉES            */}
      {/* ========================================================================= */}
      {showCreateDeliveryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-scaleUp">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600">
                  <Truck className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Création d'un Dossier de Livraison Groupée
                  </h3>
                  <p className="text-xs text-slate-500">
                    Étape {createStep} sur 4 — Regroupement et affectation au transporteur
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateDeliveryModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Progress */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { num: 1, label: 'Vérification' },
                { num: 2, label: 'Transporteur' },
                { num: 3, label: 'Récapitulatif' },
                { num: 4, label: 'Validation' }
              ].map(st => (
                <div
                  key={st.num}
                  className={`py-1.5 px-2 rounded-xl text-center text-[10px] font-bold transition-all ${
                    createStep === st.num
                      ? 'bg-indigo-600 text-white'
                      : createStep > st.num
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                  }`}
                >
                  {st.num}. {st.label}
                </div>
              ))}
            </div>

            {/* ÉTAPE 1 : VÉRIFIER LES COMMANDES SÉLECTIONNÉES */}
            {createStep === 1 && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-2">
                  <span className="text-xs font-black text-indigo-900 dark:text-indigo-200 uppercase tracking-wider block">
                    Étape 1 : Vérification du lot sélectionné
                  </span>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Nombre de commandes :</span>
                    <strong className="text-slate-900 dark:text-white font-mono text-sm">{selectedOrderIds.length}</strong>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Total colis / articles estimé :</span>
                    <strong className="text-slate-900 dark:text-white font-mono text-sm">{selectedPackagesCount} colis</strong>
                  </div>
                  <div className="flex justify-between text-xs pt-2 border-t border-indigo-200/50">
                    <span className="text-slate-600 dark:text-slate-400">Montant total des commandes :</span>
                    <strong className="text-indigo-600 dark:text-indigo-400 font-mono text-sm">{selectedTotalAmount.toLocaleString('fr-FR')} DT</strong>
                  </div>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 border border-slate-100 dark:border-slate-800 rounded-xl p-2.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Détail des {selectedOrdersData.length} commandes incluses :
                  </span>
                  {selectedOrdersData.map(ord => (
                    <div key={ord.id || ord.orderNumber} className="flex justify-between items-center text-xs py-1 border-b border-slate-100 dark:border-slate-800 last:border-none">
                      <div>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{ord.orderNumber || ord.id}</span>
                        <span className="text-slate-500 ml-2">{ord.customerName}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        {(Number(ord.total || ord.totalAmount) || 0).toLocaleString('fr-FR')} DT
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setCreateStep(2)}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Étape suivante : Choisir le transporteur</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ÉTAPE 2 : SÉLECTIONNER LA SOCIÉTÉ DE LIVRAISON */}
            {createStep === 2 && (
              <div className="space-y-4">
                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider block">
                  Étape 2 : Sélection du transporteur partenaire
                </span>

                <div className="space-y-2">
                  {carriers.map(c => {
                    const isSelected = selectedCarrierId === c.id;
                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCarrierId(c.id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-500 dark:bg-indigo-950/50 dark:border-indigo-500'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="carrierSelection"
                            checked={isSelected}
                            onChange={() => setSelectedCarrierId(c.id)}
                            className="text-indigo-600 cursor-pointer"
                          />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white text-xs block">
                              {c.nom}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              Zones : {c.zones} — Délai : {c.delaiMoyen} (Tarif : {c.tarifDefaut} DT)
                            </span>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Instructions particulières pour cette tournée (optionnel) :
                  </label>
                  <textarea
                    rows={2}
                    value={deliveryNotes}
                    onChange={e => setDeliveryNotes(e.target.value)}
                    placeholder="Ex : Priorité matinée, appeler chaque client avant le passage..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setCreateStep(1)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    Retour
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateStep(3)}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Étape suivante : Récapitulatif</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ÉTAPE 3 : RÉCAPITULATIF COMPLET AVANT VALIDATION */}
            {createStep === 3 && (
              <div className="space-y-4">
                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider block">
                  Étape 3 : Récapitulatif du dossier de livraison
                </span>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Transporteur sélectionné :</span>
                    <strong className="text-slate-900 dark:text-white">
                      {carriers.find(c => c.id === selectedCarrierId)?.nom}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nombre de commandes incluses :</span>
                    <strong className="text-slate-900 dark:text-white font-mono">{selectedOrderIds.length}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nombre total de colis / articles :</span>
                    <strong className="text-slate-900 dark:text-white font-mono">{selectedPackagesCount}</strong>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500">Total à encaisser à la livraison (COD) :</span>
                    <strong className="text-emerald-600 font-mono text-sm">{selectedCodAmount.toLocaleString('fr-FR')} DT</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Montant total global des commandes :</span>
                    <strong className="text-slate-900 dark:text-white font-mono">{selectedTotalAmount.toLocaleString('fr-FR')} DT</strong>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 bg-blue-50 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-200 dark:border-blue-900">
                  ℹ️ Une référence unique sera automatiquement générée (ex : <strong>LIV-2026-XXXX</strong>). Les commandes sélectionnées passeront au statut de livraison « En cours » sans altérer leur statut commercial.
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setCreateStep(2)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    Retour
                  </button>
                  <button
                    type="button"
                    disabled={isSubmittingDelivery}
                    onClick={handleConfirmCreateDelivery}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/20 active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSubmittingDelivery ? 'Création en cours...' : 'Confirmer et créer la livraison'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONFIRMATION INDIVIDUELLE : MARQUER COMME LIVRÉE                          */}
      {/* ========================================================================= */}
      {orderToDeliverConfirm && selectedDelivery && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </span>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Confirmer la livraison
                </h3>
                <p className="text-xs text-slate-500">
                  Commande {orderToDeliverConfirm.orderNumber || orderToDeliverConfirm.id}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Êtes-vous sûr de vouloir marquer cette commande comme <strong>Livrée</strong> ? Seule cette commande sera modifiée, les autres commandes du lot resteront inchangées.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOrderToDeliverConfirm(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isUpdatingOrderStatus}
                onClick={() => executeUpdateOrderStatus(selectedDelivery.id, orderToDeliverConfirm.id || orderToDeliverConfirm.orderNumber, 'LIVREE')}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
              >
                {isUpdatingOrderStatus ? 'Mise à jour...' : 'Confirmer livraison'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONFIRMATION INDIVIDUELLE : MARQUER COMME RETOURNÉE (AVEC MOTIF)          */}
      {/* ========================================================================= */}
      {orderToReturnConfirm && selectedDelivery && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <RotateCcw className="w-6 h-6" />
              </span>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Déclarer un retour transporteur
                </h3>
                <p className="text-xs text-slate-500">
                  Commande {orderToReturnConfirm.orderNumber || orderToReturnConfirm.id}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Veuillez indiquer le motif du retour signalé par le transporteur :
            </p>

            <select
              value={returnMotif}
              onChange={e => setReturnMotif(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
            >
              <option value="Client injoignable après plusieurs tentatives">Client injoignable après plusieurs tentatives</option>
              <option value="Refus du colis par le client à la livraison">Refus du colis par le client à la livraison</option>
              <option value="Adresse introuvable ou erronée">Adresse introuvable ou erronée</option>
              <option value="Colis endommagé pendant le transport">Colis endommagé pendant le transport</option>
              <option value="Demande d'annulation client à la livraison">Demande d'annulation client à la livraison</option>
            </select>

            <textarea
              rows={2}
              placeholder="Détails complémentaires (optionnel)..."
              value={returnComment}
              onChange={e => setReturnComment(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOrderToReturnConfirm(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isUpdatingOrderStatus}
                onClick={() => executeUpdateOrderStatus(selectedDelivery.id, orderToReturnConfirm.id || orderToReturnConfirm.orderNumber, 'RETOURNEE', returnMotif, returnComment)}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer"
              >
                {isUpdatingOrderStatus ? 'Enregistrement...' : 'Enregistrer le retour'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL UPLOAD DU REÇU DU TRANSPORTEUR                                      */}
      {/* ========================================================================= */}
      {showReceiptModal && selectedDelivery && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Ajouter le reçu du transporteur — {selectedDelivery.reference || selectedDelivery.id}
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
                  Sélectionner le fichier émargé (PDF, PNG ou JPEG — Max 10 Mo) *
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
                    ✓ Fichier sélectionné : {receiptFileName}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Note ou référence du transporteur (optionnel)
                </label>
                <input
                  type="text"
                  value={receiptDescription}
                  onChange={e => setReceiptDescription(e.target.value)}
                  placeholder="Ex : Bordereau signé par le chauffeur à 14h30"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                🔒 Le reçu sera réellement transmis et stocké de façon persistante sur le serveur backend. En cas de remplacement, l'ancienne version est conservée dans l'historique d'audit.
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
                  {isUploadingReceipt ? 'Envoi en cours...' : 'Enregistrer le reçu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL D'IMPRESSION & CONSULTATION DES DOCUMENTS (BORDEREAU, BL, FACTURES) */}
      {/* ========================================================================= */}
      <DocumentViewerModal
        isOpen={documentModalState.isOpen}
        onClose={() => setDocumentModalState(prev => ({ ...prev, isOpen: false }))}
        initialType={documentModalState.type}
        delivery={selectedDelivery}
        orders={selectedDelivery?.orders || []}
        selectedSingleOrderId={documentModalState.singleOrderId}
      />
    </div>
  );
};
