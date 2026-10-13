import React from 'react';
import { MultiShopLogo } from '../MultiShopLogo';

export interface DeliveryNoteDocumentProps {
  order: any;
  deliveryRef?: string;
  carrierName?: string;
  issuerInfo?: {
    companyName: string;
    address: string;
    city: string;
    phone: string;
    email: string;
  };
}

export const DeliveryNoteDocument: React.FC<DeliveryNoteDocumentProps> = ({
  order,
  deliveryRef,
  carrierName,
  issuerInfo = {
    companyName: 'MultiShop Groupe Tunisie',
    address: 'Les Berges du Lac 2',
    city: '1053 Tunis, Tunisie',
    phone: '+216 55 263 522',
    email: 'contact@multishop.tn'
  }
}) => {
  if (!order) return null;

  const orderId = order.orderNumber || order.id || 'CMD-000';
  const blNumber = `BL-${orderId}`;
  const orderDate = order.date || new Date().toLocaleDateString('fr-FR');
  const carrier = carrierName || order.affectationLivraison?.societeLivraisonNom || 'Transporteur Partenaire MultiShop';
  const deliveryLot = deliveryRef || order.affectationLivraison?.deliveryId || order.deliveryId || 'Lot Direct';

  const customerName = order.customerName || (order.customerInfo ? `${order.customerInfo.firstName || ''} ${order.customerInfo.lastName || ''}`.trim() : 'Client');
  const customerPhone = order.phone || order.customerInfo?.phone || 'Non renseigné';
  const customerEmail = order.customerEmail || order.customerInfo?.email || '';
  const shippingStreet = order.shippingAddress?.street || order.customerInfo?.address || 'Adresse de livraison';
  const shippingCity = order.shippingAddress?.city || order.customerInfo?.city || 'Tunis';
  const shippingGov = order.shippingAddress?.governorate || order.customerInfo?.governorate || shippingCity;
  const shippingPostal = order.shippingAddress?.postalCode || order.customerInfo?.postalCode || '';

  const items = Array.isArray(order.items) ? order.items : [];
  const totalPackages = order.itemCount || items.reduce((sum: number, it: any) => sum + (Number(it.quantity) || 1), 0) || 1;

  return (
    <div className="bg-white text-slate-900 font-sans p-8 max-w-[800px] mx-auto border border-slate-200 rounded-xl shadow-xs print:shadow-none print:border-none print:p-0 print:max-w-none print:rounded-none page-break-inside-avoid">
      {/* 1. Header with Logo & Document Type */}
      <div className="flex items-start justify-between pb-6 border-b-2 border-slate-900">
        <div className="space-y-1">
          <MultiShopLogo size="md" showSubtitle={false} />
          <p className="text-[11px] font-bold text-slate-700 mt-2">{issuerInfo.companyName}</p>
          <p className="text-[10px] text-slate-500 leading-tight">
            {issuerInfo.address}<br />
            {issuerInfo.city}<br />
            Tél : {issuerInfo.phone} | Email : {issuerInfo.email}
          </p>
        </div>

        <div className="text-right">
          <span className="inline-block px-3 py-1 rounded bg-slate-900 text-white font-black text-xs uppercase tracking-wider">
            BON DE LIVRAISON
          </span>
          <div className="mt-2 text-right">
            <p className="font-mono font-black text-sm text-slate-900">{blNumber}</p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Réf Commande : <strong className="font-mono text-slate-900">{orderId}</strong>
            </p>
            <p className="text-[10px] text-slate-500">Date d'émission : {orderDate}</p>
          </div>
        </div>
      </div>

      {/* 2. Addresses & Transport Info Grid */}
      <div className="grid grid-cols-2 gap-6 my-6 text-xs">
        {/* Recipient info */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
            Destinataire / Adresse de Livraison
          </p>
          <p className="font-black text-slate-900 text-sm">{customerName}</p>
          <p className="text-slate-700 mt-1">{shippingStreet}</p>
          <p className="text-slate-700 font-medium">
            {shippingPostal} {shippingCity} ({shippingGov}), Tunisie
          </p>
          <p className="text-slate-900 font-bold mt-2">
            Tél : <span className="font-mono">{customerPhone}</span>
          </p>
          {customerEmail && <p className="text-slate-500 text-[11px]">{customerEmail}</p>}
        </div>

        {/* Carrier & Shipment Reference */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
            Logistique & Acheminement
          </p>
          <div>
            <span className="text-slate-500 text-[11px] block">Société de livraison partenaire :</span>
            <span className="font-bold text-slate-900 text-xs">{carrier}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[11px] block">Dossier de livraison groupée :</span>
            <span className="font-mono font-bold text-indigo-700 text-xs">{deliveryLot}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[11px] block">Colisage déclaré :</span>
            <span className="font-bold text-slate-800 text-xs">{totalPackages} colis / article(s)</span>
          </div>
        </div>
      </div>

      {/* 3. Items Handover Table (NO PRICES BY DEFAULT, FOCUSED ON GOODS) */}
      <div className="my-6">
        <div className="overflow-hidden border border-slate-300 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 uppercase font-black text-[10px] border-b border-slate-300">
              <tr>
                <th className="py-2.5 px-3 w-16 text-center border-r border-slate-300">N°</th>
                <th className="py-2.5 px-3 w-32 border-r border-slate-300">Réf. Article</th>
                <th className="py-2.5 px-4 border-r border-slate-300">Désignation du Produit</th>
                <th className="py-2.5 px-3 w-28 text-center border-r border-slate-300">Boutique</th>
                <th className="py-2.5 px-3 w-20 text-center">Quantité</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-400 italic">
                    Aucun article spécifié.
                  </td>
                </tr>
              ) : (
                items.map((it: any, idx: number) => {
                  const refCode = it.sku || `ART-${it.productId || it.id || idx + 1}`;
                  const shopLabel = it.shopName || (it.shopId === 'nutrition' ? 'Fitness Shop' : it.shopId === 'dari' ? 'DariShop' : 'YoupiShop');
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-500 border-r border-slate-200">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-700 border-r border-slate-200">
                        {refCode}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900 border-r border-slate-200">
                        {it.name || 'Article'}
                      </td>
                      <td className="py-2.5 px-3 text-center text-[11px] text-slate-600 border-r border-slate-200">
                        {shopLabel}
                      </td>
                      <td className="py-2.5 px-3 text-center font-black text-slate-900 text-sm">
                        {it.quantity || 1}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300 text-xs text-slate-900">
              <tr>
                <td colSpan={4} className="py-2.5 px-4 text-right uppercase text-[10px] tracking-wider">
                  Total des marchandises remises :
                </td>
                <td className="py-2.5 px-3 text-center font-black text-sm">
                  {totalPackages}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 4. Delivery Remarks & Handover Signatures */}
      <div className="grid grid-cols-2 gap-6 my-6 pt-2">
        {/* Observations Zone */}
        <div className="p-3.5 border border-slate-200 rounded-lg min-h-[110px] flex flex-col justify-between">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
            Observations & Réserves à la réception
          </p>
          <p className="text-[10px] text-slate-400 italic">
            {order.customerInfo?.notes ? `Note client : "${order.customerInfo.notes}"` : 'Indiquez ici toute remarque ou réserve éventuelle sur l\'état du colis à la livraison.'}
          </p>
        </div>

        {/* Proof of Delivery / Signature Zone */}
        <div className="p-3.5 border border-slate-200 rounded-lg min-h-[110px] flex flex-col justify-between">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
            Preuve de réception / Signature du Destinataire
          </p>
          <div className="border-b border-dashed border-slate-300 my-4"></div>
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Nom du réceptionnaire : ........................</span>
            <span>Date : ..... / ..... / 2026</span>
          </div>
        </div>
      </div>

      {/* 5. Footer notice */}
      <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
        <p>Document officiel d'accompagnement de transport — MultiShop Réseau National Tunisie.</p>
        <p className="text-[9px] mt-0.5">Pour toute assistance logistique ou réclamation, contactez le service client au +216 55 263 522.</p>
      </div>
    </div>
  );
};
