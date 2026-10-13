import React from 'react';
import { MultiShopLogo } from '../MultiShopLogo';

export interface InvoiceDocumentProps {
  order: any;
  legalEntity?: {
    companyName: string;
    fiscalId: string; // Matricule Fiscal
    tradeRegister: string; // Registre de Commerce
    address: string;
    city: string;
    phone: string;
    email: string;
  };
}

export const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({
  order,
  legalEntity = {
    companyName: 'MultiShop Groupe E-Commerce SARL',
    fiscalId: '1729480/A/M/000',
    tradeRegister: 'B0123452026',
    address: 'Les Berges du Lac 2',
    city: '1053 Tunis, Tunisie',
    phone: '+216 55 263 522',
    email: 'facturation@multishop.tn'
  }
}) => {
  if (!order) return null;

  const orderId = order.orderNumber || order.id || 'CMD-000';
  const invoiceNum = order.facture?.numeroFacture || `FACT-2026-${orderId.replace(/\D/g, '').slice(-5) || '00001'}`;
  const invoiceDate = order.facture?.dateFacture || order.date || new Date().toLocaleDateString('fr-FR');

  const customerName = order.customerName || (order.customerInfo ? `${order.customerInfo.firstName || ''} ${order.customerInfo.lastName || ''}`.trim() : 'Client');
  const customerPhone = order.phone || order.customerInfo?.phone || 'Non renseigné';
  const customerEmail = order.customerEmail || order.customerInfo?.email || '';
  const customerAddress = order.shippingAddress?.street || order.customerInfo?.address || 'Adresse client';
  const customerCity = order.shippingAddress?.city || order.customerInfo?.city || 'Tunis';
  const customerGov = order.shippingAddress?.governorate || order.customerInfo?.governorate || customerCity;

  const items = Array.isArray(order.items) ? order.items : [];
  const rawSubtotal = Number(order.subtotal) || items.reduce((sum: number, it: any) => sum + (Number(it.price) * (Number(it.quantity) || 1)), 0);
  const shippingFee = Number(order.shippingFee) || (rawSubtotal >= 200 ? 0 : 7);
  const totalTTC = Number(order.total || order.totalAmount) || (rawSubtotal + shippingFee);

  // Calcul fiscal standard (TVA 19%)
  const totalHT = order.facture?.totalHT || Math.round((totalTTC / 1.19) * 1000) / 1000;
  const tvaAmount = order.facture?.tva || Math.round((totalTTC - totalHT) * 1000) / 1000;

  // Statut financier et encaissement
  const isOnlinePaid = order.paymentMethod === 'EN_LIGNE' || order.paymentMethod === 'CARTE_BANCAIRE' || order.paymentMethod === 'PAYMEE' || order.statutPaiement === 'PAIEMENT_ENCAISSE';
  const paymentMethodLabel = isOnlinePaid
    ? 'Paiement sécurisé en ligne (Carte Bancaire)'
    : 'Paiement en espèces à la livraison (COD)';

  return (
    <div className="bg-white text-slate-900 font-sans p-8 max-w-[800px] mx-auto border border-slate-200 rounded-xl shadow-xs print:shadow-none print:border-none print:p-0 print:max-w-none print:rounded-none page-break-inside-avoid">
      {/* 1. Header with Logo & Legal Identification */}
      <div className="flex items-start justify-between pb-6 border-b-2 border-slate-900">
        <div className="space-y-1">
          <MultiShopLogo size="md" showSubtitle={false} />
          <p className="text-xs font-black text-slate-900 mt-2">{legalEntity.companyName}</p>
          <p className="text-[10px] text-slate-600 leading-tight">
            {legalEntity.address}, {legalEntity.city}<br />
            Matricule Fiscal : <strong>{legalEntity.fiscalId}</strong><br />
            Registre de Commerce : <strong>{legalEntity.tradeRegister}</strong><br />
            Tél : {legalEntity.phone} | Email : {legalEntity.email}
          </p>
        </div>

        <div className="text-right">
          <span className="inline-block px-3 py-1 rounded bg-blue-600 text-white font-black text-xs uppercase tracking-wider">
            FACTURE DE VENTE
          </span>
          <div className="mt-2 text-right">
            <p className="font-mono font-black text-base text-slate-900">{invoiceNum}</p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Réf Commande : <strong className="font-mono text-slate-900">{orderId}</strong>
            </p>
            <p className="text-[10px] text-slate-500">Date d'émission : {invoiceDate}</p>
          </div>
        </div>
      </div>

      {/* 2. Customer & Billing Info */}
      <div className="grid grid-cols-2 gap-6 my-6 text-xs">
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
            Facturé à (Client)
          </p>
          <p className="font-black text-slate-900 text-sm">{customerName}</p>
          <p className="text-slate-700 mt-1">{customerAddress}</p>
          <p className="text-slate-700 font-medium">
            {customerCity} ({customerGov}), Tunisie
          </p>
          <p className="text-slate-900 font-bold mt-2">
            Tél : <span className="font-mono">{customerPhone}</span>
          </p>
          {customerEmail && <p className="text-slate-500 text-[11px]">{customerEmail}</p>}
        </div>

        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
            Modalités & Conditions Financières
          </p>
          <div>
            <span className="text-slate-500 text-[11px] block">Mode de paiement retenu :</span>
            <span className="font-bold text-slate-900 text-xs">{paymentMethodLabel}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[11px] block">État d'encaissement :</span>
            {isOnlinePaid ? (
              <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                ✓ Montant payé en totalité
              </span>
            ) : (
              <span className="inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                À encaisser à la livraison en espèces (COD)
              </span>
            )}
          </div>
          <div>
            <span className="text-slate-500 text-[11px] block">Devise des transactions :</span>
            <span className="font-bold text-slate-800 text-xs">Dinars Tunisiens (TND / DT)</span>
          </div>
        </div>
      </div>

      {/* 3. Products Financial Table */}
      <div className="my-6">
        <div className="overflow-hidden border border-slate-300 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 uppercase font-black text-[10px] border-b border-slate-300">
              <tr>
                <th className="py-2.5 px-3 w-12 text-center border-r border-slate-300">N°</th>
                <th className="py-2.5 px-4 border-r border-slate-300">Désignation</th>
                <th className="py-2.5 px-3 w-20 text-center border-r border-slate-300">Qté</th>
                <th className="py-2.5 px-3 w-28 text-right border-r border-slate-300">P.U. HT</th>
                <th className="py-2.5 px-3 w-20 text-center border-r border-slate-300">Taux TVA</th>
                <th className="py-2.5 px-3 w-28 text-right">Total TTC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {items.map((it: any, idx: number) => {
                const qty = Number(it.quantity) || 1;
                const priceTTC = Number(it.price) || 0;
                const rowTotalTTC = priceTTC * qty;
                const unitHT = Math.round((priceTTC / 1.19) * 1000) / 1000;
                return (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-500 border-r border-slate-200">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900 border-r border-slate-200">
                      <div>{it.name || 'Article e-commerce'}</div>
                      <span className="text-[10px] text-slate-400 font-normal">
                        Boutique : {it.shopName || (it.shopId === 'nutrition' ? 'Fitness Shop' : it.shopId === 'dari' ? 'DariShop' : 'YoupiShop')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-black text-slate-900 border-r border-slate-200">
                      {qty}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700 border-r border-slate-200">
                      {unitHT.toFixed(3)} DT
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-600 border-r border-slate-200">
                      19%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">
                      {rowTotalTTC.toFixed(3)} DT
                    </td>
                  </tr>
                );
              })}
              {shippingFee > 0 && (
                <tr className="bg-slate-50/50">
                  <td className="py-2 px-3 text-center text-slate-400 border-r border-slate-200">-</td>
                  <td className="py-2 px-4 text-slate-700 font-medium border-r border-slate-200">
                    Frais de livraison express standard
                  </td>
                  <td className="py-2 px-3 text-center font-bold text-slate-900 border-r border-slate-200">1</td>
                  <td className="py-2 px-3 text-right font-mono text-slate-700 border-r border-slate-200">
                    {(shippingFee / 1.19).toFixed(3)} DT
                  </td>
                  <td className="py-2 px-3 text-center font-bold text-slate-600 border-r border-slate-200">19%</td>
                  <td className="py-2 px-3 text-right font-mono font-black text-slate-900">
                    {shippingFee.toFixed(3)} DT
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Financial Totals Box */}
      <div className="flex justify-end my-6">
        <div className="w-80 border border-slate-300 rounded-lg overflow-hidden bg-slate-50 text-xs">
          <div className="p-3 space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Sous-total Hors Taxes (HT) :</span>
              <span className="font-mono font-bold">{totalHT.toFixed(3)} DT</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>T.V.A. légale (19.00 %) :</span>
              <span className="font-mono font-bold">{tvaAmount.toFixed(3)} DT</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Frais d'acheminement :</span>
              <span className="font-mono font-bold">{shippingFee === 0 ? 'Gratuit' : `${shippingFee.toFixed(3)} DT`}</span>
            </div>
          </div>
          <div className="p-3 bg-slate-900 text-white flex justify-between items-center font-black text-sm border-t border-slate-900">
            <span>TOTAL TTC À PAYER :</span>
            <span className="font-mono text-base text-emerald-400">
              {totalTTC.toFixed(3)} DT
            </span>
          </div>
          <div className="p-2 bg-slate-100 border-t border-slate-200 text-center text-[10px] text-slate-600">
            {isOnlinePaid ? (
              <span className="font-bold text-emerald-700">Payé intégralement par carte bancaire.</span>
            ) : (
              <span className="font-bold text-amber-800">
                Montant restant dû à la livraison : {totalTTC.toFixed(3)} DT
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 5. Legal Mentions & Signature */}
      <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-[10px] text-slate-500">
        <div>
          <p className="font-bold text-slate-700 mb-1">Mentions Légales & Conditions de Vente :</p>
          <p className="leading-relaxed">
            Facture établie conformément à la législation fiscale tunisienne en vigueur. En cas de litige, seuls les tribunaux de Tunis sont compétents.
          </p>
        </div>
        <div className="border border-slate-200 rounded p-3 min-h-[90px] flex flex-col justify-between">
          <span className="font-bold text-slate-700 uppercase tracking-wider text-[9px]">
            Cachet et Signature autorisée MultiShop
          </span>
          <div className="text-right text-[9px] text-slate-400">
            Document généré électroniquement
          </div>
        </div>
      </div>
    </div>
  );
};
