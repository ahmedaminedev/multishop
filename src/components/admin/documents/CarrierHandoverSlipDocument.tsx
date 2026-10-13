import React from 'react';
import { MultiShopLogo } from '../MultiShopLogo';

export interface CarrierHandoverSlipDocumentProps {
  delivery: any;
  orders: any[];
}

export const CarrierHandoverSlipDocument: React.FC<CarrierHandoverSlipDocumentProps> = ({
  delivery,
  orders
}) => {
  if (!delivery) return null;

  const deliveryRef = delivery.reference || delivery.id || 'LIV-2026-0000';
  const slipNumber = `BR-${deliveryRef}`;
  const carrierName = delivery.societeLivraisonNom || 'Société de Livraison';
  const creationDate = delivery.dateCreation || new Date().toLocaleDateString('fr-FR');
  const creationTime = delivery.heureCreation || new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const notes = delivery.notes || '';

  // Liste des commandes enrichies
  const deliveryOrders = Array.isArray(orders) ? orders : [];

  // Totaux calculés strictement selon les règles métier
  let totalCommandes = deliveryOrders.length;
  let totalColis = 0;
  let totalMontantGlobal = 0;
  let totalAEncaisser = 0;

  deliveryOrders.forEach(ord => {
    const totalOrd = Number(ord.total || ord.totalAmount) || 0;
    totalMontantGlobal += totalOrd;

    const items = Array.isArray(ord.items) ? ord.items : [];
    const count = ord.itemCount || items.reduce((sum: number, it: any) => sum + (Number(it.quantity) || 1), 0) || 1;
    totalColis += count;

    // RÈGLE MÉTIER CRITIQUE : Seules les commandes en paiement à la livraison (COD) non encore encaissées constituent un montant à encaisser par le transporteur !
    const isDejaPaye = ord.statutPaiement === 'PAIEMENT_ENCAISSE' || 
                       ord.paymentMethod === 'EN_LIGNE' || 
                       ord.paymentMethod === 'CARTE_BANCAIRE' || 
                       ord.paymentMethod === 'PAYMEE';
    if (!isDejaPaye) {
      totalAEncaisser += totalOrd;
    }
  });

  return (
    <div className="bg-white text-slate-900 font-sans p-8 max-w-[850px] mx-auto border border-slate-200 rounded-xl shadow-xs print:shadow-none print:border-none print:p-0 print:max-w-none print:rounded-none page-break-inside-avoid">
      {/* 1. Header with Logo & Document Identification */}
      <div className="flex items-start justify-between pb-6 border-b-2 border-slate-900">
        <div className="space-y-1">
          <MultiShopLogo size="md" showSubtitle={false} />
          <p className="text-xs font-black text-slate-900 mt-2">
            MultiShop Groupe — Hub Logistique Central
          </p>
          <p className="text-[10px] text-slate-600 leading-tight">
            Plateforme Nationale d'Expédition Multi-Boutiques<br />
            Les Berges du Lac 2, 1053 Tunis, Tunisie<br />
            Service Expéditions & Dispatch : +216 55 263 522 | logistique@multishop.tn
          </p>
        </div>

        <div className="text-right">
          <span className="inline-block px-3 py-1 rounded bg-slate-900 text-white font-black text-xs uppercase tracking-wider">
            BORDEREAU DE REMISE AU TRANSPORTEUR
          </span>
          <div className="mt-2 text-right">
            <p className="font-mono font-black text-base text-slate-900">{slipNumber}</p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Dossier de Livraison : <strong className="font-mono text-indigo-700">{deliveryRef}</strong>
            </p>
            <p className="text-[10px] text-slate-500">
              Date & Heure de remise : <strong>{creationDate} à {creationTime}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* 2. Dispatch Identification Grid */}
      <div className="grid grid-cols-2 gap-6 my-5 text-xs">
        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
            Société de Livraison Prestataire
          </p>
          <p className="font-black text-slate-900 text-sm">{carrierName}</p>
          <p className="text-slate-600 text-[11px]">
            Transporteur agréé pour prise en charge et acheminement du lot {deliveryRef}
          </p>
          {notes && (
            <p className="text-[11px] text-slate-700 bg-white p-2 rounded border border-slate-200 mt-2">
              <strong className="text-slate-900">Instructions :</strong> {notes}
            </p>
          )}
        </div>

        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Synthèse Globale du Chargement
            </p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <span className="text-slate-500 text-[10px] block">Nombre de commandes :</span>
                <span className="font-black text-slate-900 text-sm">{totalCommandes}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Total Colis / Articles :</span>
                <span className="font-black text-slate-900 text-sm">{totalColis}</span>
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-200 mt-2">
            <span className="text-slate-500 text-[10px] block uppercase font-bold">
              Total à encaisser par le transporteur (COD) :
            </span>
            <span className="font-mono font-black text-base text-emerald-700">
              {totalAEncaisser.toFixed(3)} DT
            </span>
          </div>
        </div>
      </div>

      {/* 3. Detailed Summary Table of Orders */}
      <div className="my-5">
        <div className="overflow-hidden border border-slate-300 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 uppercase font-black text-[10px] border-b border-slate-300">
              <tr>
                <th className="py-2 px-2.5 w-10 text-center border-r border-slate-300">N°</th>
                <th className="py-2 px-3 w-32 border-r border-slate-300">Réf. Commande</th>
                <th className="py-2 px-3 border-r border-slate-300">Destinataire</th>
                <th className="py-2 px-3 w-28 border-r border-slate-300">Téléphone</th>
                <th className="py-2 px-3 w-36 border-r border-slate-300">Destination</th>
                <th className="py-2 px-2.5 w-16 text-center border-r border-slate-300">Colis</th>
                <th className="py-2 px-3 w-28 text-center border-r border-slate-300">Mode Paiement</th>
                <th className="py-2 px-3 w-32 text-right">À Encaisser</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {deliveryOrders.map((ord: any, idx: number) => {
                const orderId = ord.orderNumber || ord.id || `CMD-${idx + 1}`;
                const custName = ord.customerName || (ord.customerInfo ? `${ord.customerInfo.firstName || ''} ${ord.customerInfo.lastName || ''}`.trim() : 'Client');
                const custPhone = ord.phone || ord.customerInfo?.phone || '—';
                const city = ord.shippingAddress?.city || ord.customerInfo?.city || 'Tunis';
                const gov = ord.shippingAddress?.governorate || ord.customerInfo?.governorate || city;
                const items = Array.isArray(ord.items) ? ord.items : [];
                const packages = ord.itemCount || items.reduce((sum: number, it: any) => sum + (Number(it.quantity) || 1), 0) || 1;
                const ordTotal = Number(ord.total || ord.totalAmount) || 0;

                const isDejaPaye = ord.statutPaiement === 'PAIEMENT_ENCAISSE' || 
                                   ord.paymentMethod === 'EN_LIGNE' || 
                                   ord.paymentMethod === 'CARTE_BANCAIRE' || 
                                   ord.paymentMethod === 'PAYMEE';

                const aEncaisser = isDejaPaye ? 0 : ordTotal;

                return (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2 px-2.5 text-center font-mono font-bold text-slate-500 border-r border-slate-200">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3 font-mono font-bold text-slate-900 border-r border-slate-200">
                      {orderId}
                    </td>
                    <td className="py-2 px-3 font-medium text-slate-900 border-r border-slate-200">
                      {custName}
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-700 border-r border-slate-200">
                      {custPhone}
                    </td>
                    <td className="py-2 px-3 text-slate-700 border-r border-slate-200">
                      <span className="font-semibold block">{city}</span>
                      <span className="text-[10px] text-slate-500">{gov}</span>
                    </td>
                    <td className="py-2 px-2.5 text-center font-bold text-slate-800 border-r border-slate-200">
                      {packages}
                    </td>
                    <td className="py-2 px-3 text-center border-r border-slate-200">
                      {isDejaPaye ? (
                        <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[9px]">
                          Payé en ligne
                        </span>
                      ) : (
                        <span className="inline-block px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[9px]">
                          Espèces (COD)
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-black text-slate-900">
                      {isDejaPaye ? (
                        <span className="text-slate-400 font-normal">0.000 DT</span>
                      ) : (
                        <span className="text-emerald-700">{aEncaisser.toFixed(3)} DT</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300 text-xs text-slate-900">
              <tr>
                <td colSpan={5} className="py-2.5 px-3 text-right uppercase text-[10px] tracking-wider">
                  Totaux du lot remis :
                </td>
                <td className="py-2.5 px-2.5 text-center font-black text-sm">
                  {totalColis}
                </td>
                <td className="py-2.5 px-3 text-center text-[10px] text-slate-500 font-normal">
                  {totalCommandes} commandes
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-black text-sm text-emerald-800">
                  {totalAEncaisser.toFixed(3)} DT
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 4. Financial Clarity Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[10px] text-slate-600 space-y-1">
        <p>
          <strong className="text-slate-900">Note comptable à l'attention du transporteur :</strong> Les commandes portant la mention « Payé en ligne » ne doivent faire l'objet d'aucun encaissement auprès du destinataire. Le total à reverser à MultiShop s'élève strictement à la somme des montants de la colonne « À Encaisser », soit <strong>{totalAEncaisser.toFixed(3)} Dinars Tunisiens</strong>.
        </p>
      </div>

      {/* 5. Dual Signature & Handover Confirmation Box */}
      <div className="grid grid-cols-2 gap-6 my-5 pt-2">
        {/* Remettant (Expéditeur MultiShop) */}
        <div className="p-3.5 border border-slate-300 rounded-lg min-h-[120px] flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-700 tracking-wider">
              1. Prise en Charge — Expéditeur (MultiShop)
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Nom du remettant : Responsable Expéditions Hub Tunis
            </p>
            <p className="text-[10px] text-slate-500">
              Date & Heure : {creationDate} à {creationTime}
            </p>
          </div>
          <div className="border-t border-dashed border-slate-300 pt-2 text-[9px] text-slate-400 text-center">
            Signature & Cachet du Remettant
          </div>
        </div>

        {/* Transporteur (Chauffeur / Représentant) */}
        <div className="p-3.5 border border-slate-300 rounded-lg min-h-[120px] flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-700 tracking-wider">
              2. Décharge & Réception — Transporteur ({carrierName})
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Nom du chauffeur / coursier : ..............................................
            </p>
            <p className="text-[10px] text-slate-500">
              Matricule véhicule / N° Pièce : ..............................................
            </p>
          </div>
          <div className="border-t border-dashed border-slate-300 pt-2 text-[9px] text-slate-400 text-center">
            Signature & Cachet du Transporteur (Bordereau émargé)
          </div>
        </div>
      </div>

      {/* 6. Footer */}
      <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-400">
        <span>Bordereau officiel de transfert physique de responsabilité logistique — MultiShop Network Tunisie</span>
        <span className="font-mono">{deliveryRef} | Page 1/1</span>
      </div>
    </div>
  );
};
