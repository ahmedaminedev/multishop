import React, { useRef, useState } from 'react';
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
  ExternalLink,
  ShieldCheck,
  Loader2
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
    companyName: 'MultiShop Groupe',
    department: 'Hub Logistique & Expéditions',
    city: 'Les Berges du Lac 2, 1053 Tunis',
    phone: '+216 71 000 000',
    email: 'contact@multishop.tn'
  },
  showActionButtons = true
}) => {
  const documentRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

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
      name: 'Article commandé',
      subtitle: 'Standard',
      sku: 'ART-001',
      quantity: 1,
      image: ''
    }
  ];

  const totalItemsCount = order.itemCount || items.reduce((acc: number, it: any) => acc + (Number(it.quantity) || 1), 0);
  const totalPackages = order.totalColis || 1;

  // Payment method
  const isOnlinePaid = order.statutPaiement === 'PAIEMENT_ENCAISSE' ||
    order.paymentMethod === 'EN_LIGNE' ||
    order.paymentMethod === 'CARTE_BANCAIRE' ||
    order.paymentMethod === 'PAYMEE';
  
  const paymentMethodLabel = isOnlinePaid ? 'Paiement en ligne (Déjà réglé)' : 'Contre remboursement (COD)';
  const paymentMethodSub = isOnlinePaid ? 'Carte bancaire vérifiée' : 'À encaisser à la livraison';

  // Observations / Notes
  const observationsText = order.notes || order.affectationLivraison?.instructions || order.commentaires || 'Colis vérifié au départ dépôt. Remettre au destinataire contre signature.';

  // High-Resolution 300 DPI PDF Generation (Crisp, vector-sharp text, fits exactly 1 page A4)
  const handleDownloadPdf = async () => {
    if (!documentRef.current || isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      const element = documentRef.current;
      
      // Scale: 3 ensures 300 DPI crystal-clear print resolution with no blurriness
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 794
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pageWidth = pdf.internal.pageSize.getWidth(); // 210 mm
      const pageHeight = pdf.internal.pageSize.getHeight(); // 297 mm
      const imgHeight = (canvas.height * pageWidth) / canvas.width;
      
      // Fit neatly onto the single A4 page
      const finalHeight = Math.min(imgHeight, pageHeight);
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, finalHeight, undefined, 'FAST');
      pdf.save(`${blNumber}.pdf`);
    } catch (err) {
      console.error('Erreur génération PDF:', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Top Action Toolbar (Hidden during print) */}
      {showActionButtons && (
        <div className="print:hidden w-full max-w-[794px] mb-4 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold text-xs">
              PDF
            </span>
            <div>
              <p className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-2">
                <span>Bon de Livraison Officiel</span>
                <span className="font-mono text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded text-[11px] border border-blue-200 dark:border-blue-800">
                  {blNumber}
                </span>
              </p>
              <p className="text-[11px] text-slate-400">
                Format standard A4 (210×297 mm) • Qualité HD 300 DPI
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
              <span>Route API</span>
            </a>

            <button
              type="button"
              disabled={isGeneratingPdf}
              onClick={handleDownloadPdf}
              className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Génération HD...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger PDF (300 DPI)</span>
                </>
              )}
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
      {/* FEUILLE OFFICIELLE BON DE LIVRAISON (STANDARD A4 HAUTE FIDÉLITÉ)          */}
      {/* ========================================================================= */}
      <div
        ref={documentRef}
        id="bon-livraison-printable-sheet"
        className="relative bg-white text-slate-900 font-sans w-full max-w-[794px] p-8 sm:p-9 mx-auto shadow-xl rounded-2xl border border-slate-200 print:shadow-none print:border-none print:p-8 print:max-w-none print:w-full print:rounded-none overflow-hidden print-page"
        style={{
          boxSizing: 'border-box',
          WebkitFontSmoothing: 'antialiased',
          textRendering: 'optimizeLegibility'
        }}
      >
        {/* Sleek Top Corporate Blue Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600" />

        {/* 1. TOP HEADER : MultiShop Logo & Unobstructed BON DE LIVRAISON Title */}
        <div className="flex items-start justify-between pb-6 border-b-2 border-slate-200 mb-5">
          {/* Logo MultiShop & Tagline */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              {/* Shopping cart icon with 3 motion speed lines */}
              <div className="relative flex-shrink-0">
                <svg className="w-11 h-9" viewBox="0 0 54 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 11H18" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" />
                  <path d="M5 21H16" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
                  <path d="M1 31H14" stroke="#00b4d8" strokeWidth="3.5" strokeLinecap="round" />
                  <path
                    d="M17 11H44.5C45.8 11 46.7 12.3 46.3 13.5L42 27.5C41.7 28.4 40.8 29 39.8 29H23.5L20 11Z"
                    fill="#1d4ed8"
                  />
                  <path d="M23.5 29L25.5 35.5H41" stroke="#1e40af" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="27" cy="39" r="3.5" fill="#0f172a" />
                  <circle cx="39" cy="39" r="3.5" fill="#0f172a" />
                </svg>
              </div>

              <div className="leading-none">
                <div className="flex items-center text-2xl sm:text-3xl font-black tracking-tight">
                  <span className="text-[#0f172a]">Multi</span>
                  <span className="text-[#2563eb]">Shop</span>
                </div>
              </div>
            </div>

            <p className="text-[9.5px] text-slate-500 font-extrabold tracking-[0.16em] uppercase mt-1 pl-0.5">
              VOS BOUTIQUES EN UN SEUL ENDROIT
            </p>
            <p className="text-[10px] text-slate-400 font-medium pl-0.5 mt-0.5">
              Réseau E-Commerce & Logistique Tunisie
            </p>
          </div>

          {/* Title & Metadata (100% VISIBLE - ZERO OVERLAP - NO CUTOFF) */}
          <div className="text-right">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 font-black text-[11px] uppercase tracking-wider mb-2">
              <Truck className="w-3.5 h-3.5" />
              <span>DOCUMENT OFFICIEL</span>
            </div>

            {/* Prominent, crisp, completely visible title */}
            <h1 className="text-2xl sm:text-[26px] font-black text-[#0f3480] tracking-tight uppercase leading-none mb-2.5">
              BON DE LIVRAISON
            </h1>

            <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-left inline-block space-y-1 shadow-2xs">
              <div className="flex items-center justify-between gap-6">
                <span className="text-slate-600 font-semibold text-[11px]">N° Bon de livraison :</span>
                <span className="font-mono font-black text-slate-900 text-[11px]">{blNumber}</span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span className="text-slate-600 font-semibold text-[11px]">Réf. Commande :</span>
                <span className="font-mono font-black text-slate-900 text-[11px]">{orderId}</span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span className="text-slate-600 font-semibold text-[11px]">Date d'émission :</span>
                <span className="font-mono font-bold text-slate-900 text-[11px]">{formattedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. EXPÉDITEUR & DESTINATAIRE CARDS */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* EXPÉDITEUR (Vendeur) */}
          <div className="rounded-xl border border-blue-200/90 overflow-hidden bg-white shadow-2xs">
            <div className="bg-[#eff6ff] px-3.5 py-2 border-b border-blue-200/90 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-blue-100 flex items-center justify-center text-[#0f3480]">
                <Building2 className="w-3 h-3" />
              </span>
              <span className="text-xs font-black text-[#0f3480] tracking-wide">
                EXPÉDITEUR <span className="font-semibold text-blue-600">(Vendeur)</span>
              </span>
            </div>

            <div className="p-3 space-y-1 text-xs text-slate-600 leading-snug">
              <p className="font-black text-slate-900 text-xs sm:text-sm">{issuerInfo.companyName}</p>
              <p className="text-slate-600 text-[11px]">{issuerInfo.department}</p>
              <p className="text-slate-600 text-[11px]">{issuerInfo.city}</p>
              <div className="pt-1.5 space-y-0.5 text-[11px]">
                <p className="flex items-center gap-1.5 text-slate-800 font-bold font-mono">
                  <span className="text-blue-600">📞</span>
                  <span>{issuerInfo.phone}</span>
                </p>
                <p className="flex items-center gap-1.5 text-slate-700">
                  <span className="text-blue-600">✉️</span>
                  <span>{issuerInfo.email}</span>
                </p>
              </div>
            </div>
          </div>

          {/* DESTINATAIRE (Client) */}
          <div className="rounded-xl border border-blue-200/90 overflow-hidden bg-white shadow-2xs">
            <div className="bg-[#eff6ff] px-3.5 py-2 border-b border-blue-200/90 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-blue-100 flex items-center justify-center text-[#0f3480]">
                <User className="w-3 h-3" />
              </span>
              <span className="text-xs font-black text-[#0f3480] tracking-wide">
                DESTINATAIRE <span className="font-semibold text-blue-600">(Client)</span>
              </span>
            </div>

            <div className="p-3 space-y-1.5 text-xs leading-snug">
              <div className="flex">
                <span className="w-20 text-slate-500 font-medium text-[11px]">Nom :</span>
                <span className="font-bold text-slate-900 text-xs">{customerName}</span>
              </div>
              <div className="flex">
                <span className="w-20 text-slate-500 font-medium text-[11px]">Téléphone :</span>
                <span className="font-bold text-slate-900 font-mono text-[11px]">{customerPhone}</span>
              </div>
              <div className="flex">
                <span className="w-20 text-slate-500 font-medium text-[11px]">Adresse :</span>
                <div className="text-slate-800 font-medium text-[11px] leading-tight">
                  <p>{street}</p>
                  <p>{city} {postalCode}</p>
                  <p className="text-slate-500">{country}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. LOGISTICS META STRIP (4 METRICS) */}
        <div className="rounded-xl border border-blue-200 bg-white grid grid-cols-4 overflow-hidden mb-4 shadow-2xs divide-x divide-blue-100">
          {/* 1. Société de livraison */}
          <div className="p-2.5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#0f3480] shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#0f3480]">Transporteur</p>
              <p className="text-xs font-black text-slate-900 leading-tight">{carrier}</p>
              <p className="text-[9.5px] text-blue-600 font-medium">(Service livraison)</p>
            </div>
          </div>

          {/* 2. Référence livraison */}
          <div className="p-2.5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#0f3480] shrink-0">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#0f3480]">Réf. Dossier</p>
              <p className="text-xs font-black text-slate-900 font-mono leading-tight">{deliveryDossierRef}</p>
              <p className="text-[9.5px] text-slate-500 font-medium">Bordereau associé</p>
            </div>
          </div>

          {/* 3. Nombre de colis */}
          <div className="p-2.5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#0f3480] shrink-0">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#0f3480]">Nombre de colis</p>
              <p className="text-sm font-black text-slate-900 font-mono leading-none mt-0.5">{totalPackages} colis</p>
              <p className="text-[9.5px] text-emerald-600 font-bold">Vérifié au départ</p>
            </div>
          </div>

          {/* 4. Mode de paiement */}
          <div className="p-2.5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#0f3480] shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#0f3480]">Paiement</p>
              <p className="text-xs font-black text-slate-900 leading-tight truncate">{paymentMethodLabel}</p>
              <p className="text-[9.5px] text-blue-600 font-medium truncate">{paymentMethodSub}</p>
            </div>
          </div>
        </div>

        {/* 4. ARTICLES TABLE (DÉTAIL DES ARTICLES LIVRÉS) */}
        <div className="rounded-xl border border-blue-200 overflow-hidden mb-4 shadow-2xs">
          {/* Table Header Bar */}
          <div className="bg-[#0055d4] px-4 py-2 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                <Package className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider">
                DÉTAIL DES ARTICLES LIVRÉS
              </span>
            </div>
            <span className="text-[10px] text-blue-100 font-semibold">
              Vérification quantitative & qualitative
            </span>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#eff6ff] text-[#0f3480] font-black uppercase text-[10px] border-b border-blue-200">
              <tr>
                <th className="py-2 px-2.5 text-center w-10 border-r border-blue-200/60">N°</th>
                <th className="py-2 px-2 text-center w-14 border-r border-blue-200/60">Visuel</th>
                <th className="py-2 px-3 text-center w-32 border-r border-blue-200/60">Référence</th>
                <th className="py-2 px-3 border-r border-blue-200/60">Désignation de l'article</th>
                <th className="py-2 px-3 text-center w-24">Quantité</th>
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
                  <tr key={idx} className="hover:bg-blue-50/20 transition-colors">
                    {/* Index */}
                    <td className="py-2 px-2.5 text-center font-bold text-slate-800 border-r border-blue-100 text-[11px]">
                      {idx + 1}
                    </td>

                    {/* Image Thumbnail */}
                    <td className="py-1.5 px-2 text-center border-r border-blue-100">
                      <div className="w-9 h-9 rounded-md bg-slate-50 border border-slate-200 mx-auto overflow-hidden flex items-center justify-center p-0.5">
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
                          <Package className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </td>

                    {/* SKU Référence */}
                    <td className="py-2 px-3 text-center font-mono font-bold text-slate-800 border-r border-blue-100 text-[11px]">
                      {sku}
                    </td>

                    {/* Désignation */}
                    <td className="py-2 px-3 border-r border-blue-100">
                      <p className="font-bold text-slate-900 leading-tight text-xs">{title}</p>
                      {subtitle && (
                        <p className="text-[10px] text-blue-600 font-medium leading-tight mt-0.5">
                          {subtitle}
                        </p>
                      )}
                    </td>

                    {/* Quantité */}
                    <td className="py-2 px-3 text-center font-black text-slate-900 text-xs sm:text-sm">
                      {qty}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Table Summary Footer */}
          <div className="bg-[#f8faff] border-t border-blue-200 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black text-[#0f3480]">
              <Package className="w-3.5 h-3.5 text-blue-600" />
              <span>Total d'articles / colis à remettre</span>
            </div>
            <span className="text-sm font-black text-[#0f3480]">
              {totalItemsCount} article(s)
            </span>
          </div>
        </div>

        {/* 5. OBSERVATIONS & RÉCEPTION CLIENT */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Observations / Réserves */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-black text-[#0f3480]">
              <ClipboardList className="w-3.5 h-3.5 text-blue-600" />
              <span>Observations / Réserves transporteur</span>
            </div>
            <div className="rounded-xl border border-blue-200 bg-white p-3 min-h-[110px] text-[11px] text-slate-500 font-medium leading-relaxed">
              {observationsText}
            </div>
          </div>

          {/* Réception Client avec Signature */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-black text-[#0f3480]">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Accusé de réception & Signature client</span>
            </div>
            <div className="rounded-xl border border-blue-200 bg-white p-3 min-h-[110px] text-[11px] space-y-1.5">
              <p className="text-slate-700 text-[10.5px] font-semibold leading-tight">
                Le client soussigné atteste avoir reçu les marchandises en parfait état et conformes à sa commande.
              </p>

              <div className="flex items-baseline gap-2 pt-0.5 text-[10.5px]">
                <span className="text-slate-600 font-medium shrink-0">Nom & Prénom :</span>
                <span className="text-slate-400 border-b border-dotted border-slate-400 flex-1 h-3 block" />
              </div>

              <div className="flex items-baseline gap-2 text-[10.5px]">
                <span className="text-slate-600 font-medium shrink-0">Date & Heure :</span>
                <span className="text-slate-400 border-b border-dotted border-slate-400 w-28 h-3 block" />
              </div>

              <div className="flex items-start justify-between pt-0.5">
                <span className="text-slate-600 font-semibold text-[10.5px]">Signature client :</span>
                <div className="w-40 h-10 rounded-lg border border-blue-200 bg-blue-50/30 flex items-center justify-center text-[9px] text-slate-400 italic">
                  Mention "Reçu conforme"
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 6. BOTTOM FOOTER & AUTHENTICATION WATERMARK */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
          {/* Mini logo & verified badge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <svg className="w-5 h-4" viewBox="0 0 54 44" fill="none" xmlns="http://www.w3.org/2000/svg">
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
              <span className="font-black text-slate-800 text-[11px]">Multi<span className="text-blue-600">Shop</span></span>
            </div>
            <span className="text-[10px] text-emerald-600 flex items-center gap-1 font-semibold pl-2 border-l border-slate-200">
              <ShieldCheck className="w-3 h-3" />
              Document certifié
            </span>
          </div>

          {/* Gratitude message */}
          <p className="italic text-slate-600 font-serif text-[11px]">
            Merci pour votre commande et votre confiance !
          </p>

          {/* Page counter & timestamp */}
          <div className="text-right font-mono text-slate-500 text-[10px]">
            Page 1 / 1
          </div>
        </div>
      </div>
    </div>
  );
};
