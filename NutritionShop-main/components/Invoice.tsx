
import React, { useState } from 'react';
import type { Order } from '../types';
import { XMarkIcon, PrinterIcon, CloudArrowDownIcon } from './IconComponents';
import { Logo } from './Logo';

interface InvoiceProps {
    order: Order;
    onClose: () => void;
}

declare var html2pdf: any;

export const Invoice: React.FC<InvoiceProps> = ({ order, onClose }) => {
    const [isDownloading, setIsDownloading] = useState(false);

    const getCleanInvoiceHtml = () => {
        const printableArea = document.getElementById('invoice-printable-area');
        if (!printableArea) return null;

        // Clone the element to avoid modifying the displayed one
        const clone = printableArea.cloneNode(true) as HTMLElement;
        
        // We ensure the width is fixed for the PDF generation to avoid layout shifts
        clone.style.width = '800px'; 
        clone.style.maxWidth = '100%';
        
        return clone;
    };


    const handlePrint = () => {
        // For printing, we print the window contents targeted by CSS media query or a new window
        // The current implementation opens a new window and writes HTML.
        const printableArea = document.getElementById('invoice-printable-area');
        if (!printableArea) return;

        const printWindow = window.open('', '_blank', 'height=800,width=800');
        if (!printWindow) {
            alert("Veuillez autoriser les fenêtres pop-up pour imprimer la facture.");
            return;
        }

        printWindow.document.write('<html><head><title>Facture</title>');
        // Add Tailwind CSS for styling
        printWindow.document.write('<script src="https://cdn.tailwindcss.com"><\/script>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(printableArea.outerHTML); // Use outerHTML of original to preserve styles
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        
        printWindow.onload = () => {
            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
                printWindow.close();
            }, 500); // Wait for styles to apply
        };
    };

    const handleDownload = () => {
        setIsDownloading(true);
        const element = getCleanInvoiceHtml();
        if (!element) {
            setIsDownloading(false);
            return;
        }

        // Ensure overflow is visible for html2pdf
        element.style.overflow = 'visible';
        
        const opt = {
            margin:       0.2, // Reduced margin for better fit
            filename:     `Facture-${order.id}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, scrollY: 0 },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        
        html2pdf().from(element).set(opt).save().finally(() => {
            setIsDownloading(false);
        });
    };

    const subtotal = order.total;
    // This logic is based on CheckoutPage and OrderDetailPage
    const shipping = subtotal >= 300 ? 0.000 : 7.000;
    const total = subtotal + shipping;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" aria-labelledby="invoice-title" role="dialog" aria-modal="true">
            <div className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-lg shadow-xl max-h-[95vh] flex flex-col">
                {/* Modal Header (hidden on print) */}
                <div className="print-hide flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h2 id="invoice-title" className="text-xl font-bold">Aperçu de la facture</h2>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handleDownload}
                            disabled={isDownloading} 
                            className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 text-sm hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
                        >
                            <CloudArrowDownIcon className="w-5 h-5" />
                            <span>{isDownloading ? 'Téléchargement...' : 'Télécharger'}</span>
                        </button>
                        <button onClick={handlePrint} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 text-sm hover:bg-blue-700 transition-colors">
                            <PrinterIcon className="w-5 h-5" />
                            Imprimer
                        </button>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><XMarkIcon className="w-6 h-6"/></button>
                    </div>
                </div>

                {/* Invoice Content */}
                <div className="p-8 overflow-y-auto">
                    <div id="invoice-printable-area" className="bg-white text-gray-900 p-8 max-w-[800px] mx-auto">
                        {/* Header */}
                        <header className="flex justify-between items-start pb-6 border-b border-gray-200">
                            <div>
                                <div className="mb-4">
                                    <Logo />
                                </div>
                                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                                    123 Rue de l'Électronique<br />
                                    Les Berges du Lac 2, Tunis, Tunisie<br />
                                    contact@cosmeticsshop.tn | +216 55 263 522
                                </p>
                            </div>
                            <div className="text-right">
                                <h1 className="text-4xl font-serif font-bold uppercase text-gray-900 mb-2">Facture</h1>
                                <p className="text-sm font-medium text-gray-600">N° {order.id}</p>
                                <p className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString('fr-FR')}</p>
                            </div>
                        </header>

                        {/* Customer Info */}
                        <section className="grid grid-cols-2 gap-8 my-10">
                            <div>
                                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Facturé à</h2>
                                <p className="font-bold text-gray-900 text-lg">{order.customerName}</p>
                                <div className="text-sm text-gray-600 mt-1">
                                    <p>{order.shippingAddress.street}</p>
                                    <p>{order.shippingAddress.postalCode} {order.shippingAddress.city}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Détails</h2>
                                <p className="text-sm text-gray-600"><span className="font-semibold">Mode de paiement:</span> {order.paymentMethod}</p>
                                <p className="text-sm text-gray-600"><span className="font-semibold">Statut:</span> {order.status}</p>
                            </div>
                        </section>

                        {/* Items Table */}
                        <section className="mb-10">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-gray-100">
                                        <th className="py-3 text-xs font-bold uppercase text-gray-400 tracking-wider">Description</th>
                                        <th className="py-3 text-xs font-bold uppercase text-gray-400 tracking-wider text-center">Qté</th>
                                        <th className="py-3 text-xs font-bold uppercase text-gray-400 tracking-wider text-right">Prix Unit.</th>
                                        <th className="py-3 text-xs font-bold uppercase text-gray-400 tracking-wider text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {order.items.map((item, index) => (
                                        <tr key={index} className="border-b border-gray-50">
                                            <td className="py-4">
                                                <p className="font-bold text-gray-900">{item.name}</p>
                                                {item.selectedColor && <p className="text-xs text-gray-500 mt-0.5">Couleur: {item.selectedColor}</p>}
                                            </td>
                                            <td className="py-4 text-center font-medium text-gray-600">{item.quantity}</td>
                                            <td className="py-4 text-right font-medium text-gray-600">{item.price.toFixed(3)} DT</td>
                                            <td className="py-4 text-right font-bold text-gray-900">{(item.price * item.quantity).toFixed(3)} DT</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>
                        
                        {/* Totals */}
                        <section className="flex justify-end">
                            <div className="w-64 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Sous-total</span>
                                    <span className="font-bold text-gray-900">{subtotal.toFixed(3)} DT</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Livraison</span>
                                    <span className="font-bold text-gray-900">{shipping.toFixed(3)} DT</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Timbre Fiscal</span>
                                    <span className="font-bold text-gray-900">1.000 DT</span>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t-2 border-gray-100 mt-4">
                                    <span className="text-base font-bold text-gray-900 uppercase">Total TTC</span>
                                    <span className="text-2xl font-serif font-bold text-rose-600">{(total + 1).toFixed(3)} DT</span>
                                </div>
                            </div>
                        </section>

                        {/* Footer */}
                        <footer className="mt-16 pt-8 border-t border-gray-100 text-center">
                            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Merci pour votre confiance</p>
                            <p className="text-[10px] text-gray-400">Cosmetics Shop - SARL au capital de 10 000 DT - RC: B123456789 - MF: 1234567/A/M/000</p>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    );
};
