import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  Truck,
  Package,
  CreditCard,
  Building2,
  User,
  ClipboardList,
  CheckCircle2,
  Printer,
  Download,
  ExternalLink
} from 'lucide-react';

export interface DeliveryNoteDocumentProps {
  order: any;
  deliveryRef?: string;
  carrierName?: string;
  issuerInfo?: {
    companyName: string;
    department: string;
    city: string;
    phone: string;
    email: string;
  };
  showActionButtons?: boolean;
}

export const DeliveryNoteDocument: React.FC<DeliveryNoteDocumentProps> = ({
  order,
  deliveryRef,
  carrierName,
  issuerInfo = {
    companyName: 'MultiShop',
    department: 'Service commercial',
    city: 'Tunis, Tunisie',
    phone: '+216 71 000 000',
    email: 'contact@multishop.tn'
  },
  showActionButtons = true
}) => {
  const documentRef = useRef<HTMLDivElement>(null);

  if (!order) return null;

  // Extract order and logistics data from DB
  const orderId = order.orderNumber || order.id || 'CMD-2026-0048';
  const blNumber = order.numeroBonLivraison || `BL-${orderId.replace('CMD-', '')}`;
  const rawDate = order.date || new Date().toISOString().split('T')[0];
  // Format date as DD/MM/YYYY
  const formattedDate = (() => {
    try {
      if (rawDate.includes('/')) return rawDate;
      const parts = rawDate.split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    } catch {
      // fallback
    }
    return rawDate;
  })();

  // Customer / Destinataire
  const customerName = order.customerName ||
    (order.customerInfo ? `${order.customerInfo.firstName || ''} ${order.customerInfo.lastName || ''}`.trim() : 'Ahmed Ben Ali');
  const customerPhone = order.phone || order.customerInfo?.phone || '+216 98 765 432';
  const street = order.shippingAddress?.street || order.customerInfo?.address || '12 Rue de la Liberté';
  const city = order.shippingAddress?.city || order.customerInfo?.city || 'Tunis';
  const postalCode = order.shippingAddress?.postalCode || order.customerInfo?.postalCode || '1000';
  const country = order.shippingAddress?.country || order.customerInfo?.country || 'Tunisie';

  // Logistics / Carrier
  const carrier = carrierName || order.affectationLivraison?.societeLivraisonNom || 'Tunis Express';
  const deliveryDossierRef = deliveryRef || order.affectationLivraison?.deliveryId || order.deliveryId || 'LIV-2026-0001';

  // Items / Articles
  const items = Array.isArray(order.items) && order.items.length > 0 ? order.items : [
    {
      name: 'Montre connectée Galaxy Watch',
      subtitle: 'Écran AMOLED - 1.5" - Noir',
      sku: 'SMT-001',
      quantity: 1,
      image: '/src/assets/images/category_halteres_poids_1790951598408.jpg'
    }
  ];

  const totalItemsCount = order.itemCount || items.reduce((acc: number, it: any) => acc + (Number(it.quantity) || 1), 0);
  const totalPackages = order.totalColis || 1;

  // Payment method
  const isOnlinePaid = order.statutPaiement === 'PAIEMENT_ENCAISSE' ||
    order.paymentMethod === 'EN_LIGNE' ||
    order.paymentMethod === 'CARTE_BANCAIRE' ||
    order.paymentMethod === 'PAYMEE';
  
  const paymentMethodLabel = isOnlinePaid ? 'Paiement en ligne (Déjà réglé)' : 'Contre remboursement';
  const paymentMethodSub = isOnlinePaid ? '(Carte bancaire)' : '(Paiement à la livraison)';

  // Observations / Notes
  const observationsText = order.notes || order.affectationLivraison?.instructions || order.commentaires || 'Aucune observation particulière.';

  // Export PDF directly
  const handleDownloadPdf = async () => {
    if (!documentRef.current) return;
    try {
      const element = documentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${blNumber}.pdf`);
    } catch (err) {
      console.error('Erreur génération PDF:', err);
      window.print();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center">
      {/* Top Action Toolbar (Hidden during print) */}
      {showActionButtons && (
        <div className="print:hidden w-full max-w-[840px] mb-4 flex items-center justify-between gap-3 bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold text-xs">
              PDF
            </span>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-white">
                Bon de Livraison Officiel — <span className="font-mono text-blue-600">{blNumber}</span>
              </p>
              <p className="text-[11px] text-slate-400">
                Format standard A4 • Rempli dynamiquement depuis la base de données
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`/api/orders/${order.id || order.orderNumber}/delivery-note/html?autoprint=1`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Ouvrir la route backend directe"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Route API Backend</span>
            </a>

            <button
              type="button"
              onClick={handleDownloadPdf}
              className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Télécharger PDF</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEUILLE OFFICIELLE BON DE LIVRAISON (REPRODUCTION EXACTE DU MODÈLE FOURNI) */}
      {/* ========================================================================= */}
      <div
        ref={documentRef}
        id="bon-livraison-printable-sheet"
        className="relative bg-white text-slate-900 font-sans w-full max-w-[840px] p-8 sm:p-10 mx-auto shadow-2xl rounded-3xl border border-slate-100 print:shadow-none print:border-none print:p-8 print:max-w-none print:w-full print:rounded-none overflow-hidden print-page"
        style={{ minHeight: '1120px' }}
      >
        {/* Decorative Modern Diagonal Blue Accent in Top-Right Corner */}
        <div
          className="absolute top-0 right-0 w-36 h-24 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, transparent 40%, #0066ff 40%)'
          }}
        />

        {/* Decorative Modern Diagonal Blue Accent in Bottom-Right Corner */}
        <div
          className="absolute bottom-0 right-0 w-36 h-24 pointer-events-none"
          style={{
            background: 'linear-gradient(315deg, transparent 40%, #0066ff 40%)'
          }}
        />

        {/* 1. TOP HEADER : MultiShop Logo & Title */}
        <div className="flex items-start justify-between pb-8">
          {/* Logo MultiShop */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              {/* Shopping cart icon with 3 motion speed lines */}
              <div className="relative flex-shrink-0">
                <svg className="w-12 h-10" viewBox="0 0 54 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Motion speed streaks */}
                  <path d="M2 11H18" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" />
                  <path d="M5 21H16" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
                  <path d="M1 31H14" stroke="#00b4d8" strokeWidth="3.5" strokeLinecap="round" />
                  {/* Cart frame */}
                  <path
                    d="M17 11H44.5C45.8 11 46.7 12.3 46.3 13.5L42 27.5C41.7 28.4 40.8 29 39.8 29H23.5L20 11Z"
                    fill="#1d4ed8"
                  />
                  <path d="M23.5 29L25.5 35.5H41" stroke="#1e40af" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  {/* Wheels */}
                  <circle cx="27" cy="39" r="3.5" fill="#0f172a" />
                  <circle cx="39" cy="39" r="3.5" fill="#0f172a" />
                </svg>
              </div>

              <div className="leading-none">
                <div className="flex items-center text-3xl font-black tracking-tight">
                  <span className="text-[#0f172a]">Multi</span>
                  <span className="text-[#2563eb]">Shop</span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 font-extrabold tracking-[0.16em] uppercase mt-1 pl-0.5">
              VOS BOUTIQUES EN UN SEUL ENDROIT
            </p>
          </div>

          {/* Title & Metadata */}
          <div className="text-right pr-6 sm:pr-8">
            <h1 className="text-2xl sm:text-3xl font-black text-[#0f3480] tracking-tight uppercase">
              BON DE LIVRAISON
            </h1>

            <div className="mt-3 space-y-1.5 text-xs text-left inline-block">
              <div className="flex items-center justify-between gap-6">
                <span className="text-slate-700 font-medium">N° Bon de livraison :</span>
                <span className="font-mono font-black text-slate-900">{blNumber}</span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span className="text-slate-700 font-medium">Référence commande :</span>
                <span className="font-mono font-black text-slate-900">{orderId}</span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span className="text-slate-700 font-medium">Date d'émission :</span>
                <span className="font-mono font-bold text-slate-900">{formattedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. EXPÉDITEUR & DESTINATAIRE CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
          {/* EXPÉDITEUR (Vendeur) */}
          <div className="rounded-2xl border border-blue-200/80 overflow-hidden bg-white shadow-xs">
            <div className="bg-[#eff6ff] px-4 py-2.5 border-b border-blue-200/80 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center text-[#0f3480]">
                <Building2 className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-black text-[#0f3480] tracking-wide">
                EXPÉDITEUR <span className="font-semibold text-blue-600">(Vendeur)</span>
              </span>
            </div>

            <div className="p-4 space-y-1 text-xs text-slate-600 leading-relaxed">
              <p className="font-black text-slate-900 text-sm">{issuerInfo.companyName}</p>
              <p className="text-slate-600">{issuerInfo.department}</p>
              <p className="text-slate-600">{issuerInfo.city}</p>
              <div className="pt-2 space-y-1">
                <p className="flex items-center gap-2 text-slate-800 font-bold font-mono">
                  <span className="text-blue-600">📞</span>
                  <span>{issuerInfo.phone}</span>
                </p>
                <p className="flex items-center gap-2 text-slate-700">
                  <span className="text-blue-600">✉️</span>
                  <span>{issuerInfo.email}</span>
                </p>
              </div>
            </div>
          </div>

          {/* DESTINATAIRE (Client) */}
          <div className="rounded-2xl border border-blue-200/80 overflow-hidden bg-white shadow-xs">
            <div className="bg-[#eff6ff] px-4 py-2.5 border-b border-blue-200/80 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center text-[#0f3480]">
                <User className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-black text-[#0f3480] tracking-wide">
                DESTINATAIRE <span className="font-semibold text-blue-600">(Client)</span>
              </span>
            </div>

            <div className="p-4 space-y-2 text-xs leading-relaxed">
              <div className="flex">
                <span className="w-24 text-slate-500 font-medium">Nom :</span>
                <span className="font-bold text-slate-900">{customerName}</span>
              </div>
              <div className="flex">
                <span className="w-24 text-slate-500 font-medium">Téléphone :</span>
                <span className="font-bold text-slate-900 font-mono">{customerPhone}</span>
              </div>
              <div className="flex">
                <span className="w-24 text-slate-500 font-medium">Adresse :</span>
                <div className="text-slate-800 font-medium">
                  <p>{street}</p>
                  <p>{city} {postalCode}</p>
                  <p>{country}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. LOGISTICS META STRIP (4 METRICS) */}
        <div className="rounded-2xl border border-blue-200/80 bg-white grid grid-cols-2 sm:grid-cols-4 overflow-hidden mb-6 shadow-xs divide-y sm:divide-y-0 sm:divide-x divide-blue-100">
          {/* 1. Société de livraison */}
          <div className="p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-[#0f3480] shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#0f3480]">Société de livraison</p>
              <p className="text-xs font-black text-slate-900">{carrier}</p>
              <p className="text-[10px] text-blue-600 font-medium">(Transporteur)</p>
            </div>
          </div>

          {/* 2. Référence livraison */}
          <div className="p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-[#0f3480] shrink-0">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#0f3480]">Référence livraison</p>
              <p className="text-xs font-black text-slate-900 font-mono">{deliveryDossierRef}</p>
            </div>
          </div>

          {/* 3. Nombre de colis */}
          <div className="p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-[#0f3480] shrink-0">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#0f3480]">Nombre de colis</p>
              <p className="text-base font-black text-slate-900 font-mono leading-none mt-0.5">{totalPackages}</p>
            </div>
          </div>

          {/* 4. Mode de paiement */}
          <div className="p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-[#0f3480] shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#0f3480]">Mode de paiement</p>
              <p className="text-xs font-black text-slate-900">{paymentMethodLabel}</p>
              <p className="text-[10px] text-blue-600 font-medium">{paymentMethodSub}</p>
            </div>
          </div>
        </div>

        {/* 4. ARTICLES TABLE (DÉTAIL DES ARTICLES LIVRÉS) */}
        <div className="rounded-2xl border border-blue-200 overflow-hidden mb-6 shadow-xs">
          {/* Table Header Bar */}
          <div className="bg-[#0055d4] px-4 py-2.5 flex items-center gap-2 text-white">
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <Package className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider">
              DÉTAIL DES ARTICLES LIVRÉS
            </span>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#eff6ff] text-[#0f3480] font-black uppercase text-[10px] border-b border-blue-200">
              <tr>
                <th className="py-2.5 px-3 text-center w-12 border-r border-blue-200/60">N°</th>
                <th className="py-2.5 px-2 text-center w-16 border-r border-blue-200/60">Visuel</th>
                <th className="py-2.5 px-4 text-center w-36 border-r border-blue-200/60">Référence</th>
                <th className="py-2.5 px-4 border-r border-blue-200/60">Désignation</th>
                <th className="py-2.5 px-4 text-center w-28">Quantité</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100 font-medium">
              {items.map((item: any, idx: number) => {
                const sku = item.sku || item.reference || `REF-${(idx + 1).toString().padStart(3, '0')}`;
                const title = item.name || item.title || item.designation || `Article ${idx + 1}`;
                const subtitle = item.subtitle || item.description || (item.variant ? `Option : ${item.variant}` : '');
                const qty = Number(item.quantity) || 1;
                const img = item.image || item.imageUrl || item.photo;

                return (
                  <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                    {/* Index */}
                    <td className="py-3 px-3 text-center font-bold text-slate-800 border-r border-blue-100">
                      {idx + 1}
                    </td>

                    {/* Image Thumbnail */}
                    <td className="py-2 px-2 text-center border-r border-blue-100">
                      <div className="w-11 h-11 rounded-lg bg-slate-50 border border-slate-200/80 mx-auto overflow-hidden flex items-center justify-center p-1">
                        {img ? (
                          <img
                            src={img}
                            alt={title}
                            className="w-full h-full object-contain"
                            onError={(e: any) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <Package className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </td>

                    {/* SKU Référence */}
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-800 border-r border-blue-100">
                      {sku}
                    </td>

                    {/* Désignation */}
                    <td className="py-3 px-4 border-r border-blue-100">
                      <p className="font-bold text-slate-900 leading-snug">{title}</p>
                      {subtitle && (
                        <p className="text-[11px] text-blue-600 font-medium leading-tight mt-0.5">
                          {subtitle}
                        </p>
                      )}
                    </td>

                    {/* Quantité */}
                    <td className="py-3 px-4 text-center font-black text-slate-900 text-sm">
                      {qty}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Table Summary Footer */}
          <div className="bg-[#f8faff] border-t-2 border-blue-200 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black text-[#0f3480]">
              <Package className="w-4 h-4 text-blue-600" />
              <span>Total d'articles / colis</span>
            </div>
            <span className="text-base font-black text-[#0f3480]">
              {totalItemsCount} articles
            </span>
          </div>
        </div>

        {/* 5. OBSERVATIONS & RÉCEPTION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
          {/* Observations / Réserves */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-black text-[#0f3480]">
              <ClipboardList className="w-4 h-4 text-blue-600" />
              <span>Observations / Réserves</span>
            </div>
            <div className="rounded-2xl border border-blue-200/90 bg-white p-4 min-h-[140px] text-xs text-slate-400 font-medium">
              {observationsText}
            </div>
          </div>

          {/* Réception */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-black text-[#0f3480]">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>Réception</span>
            </div>
            <div className="rounded-2xl border border-blue-200/90 bg-white p-4 min-h-[140px] text-xs space-y-2.5">
              <p className="text-slate-700 text-[11px] font-medium leading-tight">
                Le client confirme la réception des marchandises en bon état.
              </p>

              <div className="flex items-baseline gap-2 pt-1 text-[11px]">
                <span className="text-slate-600 font-medium shrink-0">Nom et prénom :</span>
                <span className="text-slate-400 border-b border-dotted border-slate-400 flex-1 h-3 block" />
              </div>

              <div className="flex items-baseline gap-2 text-[11px]">
                <span className="text-slate-600 font-medium shrink-0">Date :</span>
                <span className="text-slate-400 border-b border-dotted border-slate-400 w-36 h-3 block" />
              </div>

              <div className="flex items-start justify-between pt-1">
                <span className="text-slate-600 font-medium text-[11px]">Signature :</span>
                <div className="w-48 h-14 rounded-xl border border-blue-200/90 bg-blue-50/20" />
              </div>
            </div>
          </div>
        </div>

        {/* 6. BOTTOM FOOTER */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400 pr-6 sm:pr-8">
          {/* Mini logo */}
          <div className="flex items-center gap-2">
            <svg className="w-6 h-5" viewBox="0 0 54 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 11H18" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
              <path d="M5 21H16" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
              <path d="M1 31H14" stroke="#00b4d8" strokeWidth="3" strokeLinecap="round" />
              <path
                d="M17 11H44.5C45.8 11 46.7 12.3 46.3 13.5L42 27.5C41.7 28.4 40.8 29 39.8 29H23.5L20 11Z"
                fill="#1d4ed8"
              />
              <circle cx="27" cy="39" r="3.5" fill="#0f172a" />
              <circle cx="39" cy="39" r="3.5" fill="#0f172a" />
            </svg>
            <span className="font-bold text-slate-800 text-xs">Multi<span className="text-blue-600">Shop</span></span>
          </div>

          {/* Gratitude message */}
          <p className="italic text-slate-500 font-serif text-[11px]">
            Merci pour votre confiance !
          </p>

          {/* Page counter */}
          <p className="font-mono text-slate-500 text-[11px]">
            Page 1 / 1
          </p>
        </div>
      </div>
    </div>
  );
};
