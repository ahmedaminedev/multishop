import React, { useState } from 'react';
import {
  Printer,
  X,
  FileText,
  Truck,
  Receipt,
  Layers,
  ChevronLeft,
  ChevronRight,
  Download,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { DeliveryNoteDocument } from './DeliveryNoteDocument';
import { InvoiceDocument } from './InvoiceDocument';
import { CarrierHandoverSlipDocument } from './CarrierHandoverSlipDocument';

export type DocumentType = 'handover_slip' | 'delivery_notes' | 'invoices';

export interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: DocumentType;
  delivery?: any;
  orders: any[];
  selectedSingleOrderId?: string;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  initialType = 'handover_slip',
  delivery,
  orders,
  selectedSingleOrderId
}) => {
  const [activeType, setActiveType] = useState<DocumentType>(initialType);
  const [selectedOrderIndex, setSelectedOrderIndex] = useState<number>(0);
  const [printMode, setPrintMode] = useState<'all' | 'single'>('all');

  if (!isOpen) return null;

  // Filter orders if a single order is requested
  const effectiveOrders = Array.isArray(orders) ? orders : [];
  const currentSingleOrder = selectedSingleOrderId
    ? effectiveOrders.find(o => (o.id || o.orderNumber) === selectedSingleOrderId) || effectiveOrders[0]
    : effectiveOrders[selectedOrderIndex] || effectiveOrders[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-slate-100 dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col max-h-[96vh] overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Top Controls Bar (Hidden during print) */}
        <div className="print:hidden bg-white dark:bg-slate-900 p-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Gestionnaire & Impression des Documents
              </h3>
              <p className="text-xs text-slate-500">
                {delivery ? `Dossier ${delivery.reference || delivery.id} — ${effectiveOrders.length} commande(s)` : 'Documents de commande'}
              </p>
            </div>
          </div>

          {/* Document Type Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
            {delivery && (
              <button
                type="button"
                onClick={() => setActiveType('handover_slip')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeType === 'handover_slip'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Bordereau de Remise</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveType('delivery_notes')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeType === 'delivery_notes'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Bons de Livraison ({effectiveOrders.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveType('invoices')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeType === 'invoices'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Factures ({effectiveOrders.length})</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20 cursor-pointer transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer (A4)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-bar for navigating multi-order documents if in single mode */}
        {(activeType === 'delivery_notes' || activeType === 'invoices') && effectiveOrders.length > 1 && (
          <div className="print:hidden bg-slate-50 dark:bg-slate-800/60 px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="text-slate-500 font-medium">Mode d'impression :</span>
              <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                <input
                  type="radio"
                  name="printMode"
                  checked={printMode === 'all'}
                  onChange={() => setPrintMode('all')}
                  className="text-indigo-600"
                />
                <span>Tout le lot (1 page par commande)</span>
              </label>
              <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                <input
                  type="radio"
                  name="printMode"
                  checked={printMode === 'single'}
                  onChange={() => setPrintMode('single')}
                  className="text-indigo-600"
                />
                <span>Commande individuelle seulement</span>
              </label>
            </div>

            {printMode === 'single' && (
              <div className="flex items-center gap-2">
                <select
                  value={selectedOrderIndex}
                  onChange={(e) => setSelectedOrderIndex(Number(e.target.value))}
                  className="px-3 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold"
                >
                  {effectiveOrders.map((ord, idx) => (
                    <option key={ord.id || ord.orderNumber} value={idx}>
                      {idx + 1}. {ord.orderNumber || ord.id} — {ord.customerName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Document Preview & Printable Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200/70 dark:bg-slate-950/70 print:p-0 print:bg-white print:overflow-visible">
          
          {/* CASE 1: BORDEREAU DE REMISE AU TRANSPORTEUR */}
          {activeType === 'handover_slip' && delivery && (
            <div className="printable-document">
              <CarrierHandoverSlipDocument
                delivery={delivery}
                orders={effectiveOrders}
              />
            </div>
          )}

          {/* CASE 2: BONS DE LIVRAISON */}
          {activeType === 'delivery_notes' && (
            <div>
              {printMode === 'single' ? (
                currentSingleOrder && (
                  <div className="printable-document">
                    <DeliveryNoteDocument
                      order={currentSingleOrder}
                      deliveryRef={delivery?.reference || delivery?.id}
                      carrierName={delivery?.societeLivraisonNom}
                      showActionButtons={false}
                    />
                  </div>
                )
              ) : (
                effectiveOrders.map((ord, idx) => (
                  <div
                    key={ord.id || ord.orderNumber || idx}
                    className={`printable-document ${idx > 0 ? 'page-break-after-always mt-8 print:mt-0' : ''}`}
                  >
                    <DeliveryNoteDocument
                      order={ord}
                      deliveryRef={delivery?.reference || delivery?.id}
                      carrierName={delivery?.societeLivraisonNom}
                      showActionButtons={false}
                    />
                  </div>
                ))
              )}
            </div>
          )}

          {/* CASE 3: FACTURES */}
          {activeType === 'invoices' && (
            <div>
              {printMode === 'single' ? (
                currentSingleOrder && (
                  <div className="printable-document">
                    <InvoiceDocument order={currentSingleOrder} />
                  </div>
                )
              ) : (
                effectiveOrders.map((ord, idx) => (
                  <div
                    key={ord.id || ord.orderNumber || idx}
                    className={`printable-document ${idx > 0 ? 'page-break-after-always mt-8 print:mt-0' : ''}`}
                  >
                    <InvoiceDocument order={ord} />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
