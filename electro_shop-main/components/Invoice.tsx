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

        const clone = printableArea.cloneNode(true) as HTMLElement;
        
        // Replace SVG Logo with simple text for better compatibility
        const logoContainer = clone.querySelector('.logo-for-print');
        if (logoContainer) {
            logoContainer.innerHTML = `<div style="font-size: 1.5rem; font-weight: bold; color: #111827;">Electro Shop</div>`;
        }
        
        return clone;
    };


    const handlePrint = () => {
        const invoiceElement = getCleanInvoiceHtml();
        if (!invoiceElement) return;

        const printWindow = window.open('', '_blank', 'height=800,width=800');
        if (!printWindow) {
            alert("Veuillez autoriser les fenêtres pop-up pour imprimer la facture.");
            return;
        }

        printWindow.document.write('<html><head><title>Facture</title>');
        // Add Tailwind CSS for styling
        printWindow.document.write('<script src="https://cdn.tailwindcss.com"><\/script>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(invoiceElement.innerHTML);
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
            margin:       0.5,
            filename:     `Facture-${order.id}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, scrollY: -window.scrollY },
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
                    <div id="invoice-printable-area" className="bg-white text-gray-900">
                        {/* Header */}
                        <header className="flex justify-between items-start pb-6 border-b">
                            <div>
                                <div className="logo-for-print">
                                    <Logo />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    123 Rue de l'Électronique, Tunis, Tunisie<br />
                                    contact@electroshop.com | +216 55 263 522
                                </p>
                            </div>
                            <div className="text-right">
                                <h1 className="text-3xl font-bold uppercase text-gray-800">Facture</h1>
                                <p className="text-sm"><strong>N° de commande :</strong> {order.id}</p>
                                <p className="text-sm"><strong>Date :</strong> {new Date(order.date).toLocaleDateString('fr-FR')}</p>
                            </div>
                        </header>

                        {/* Customer Info */}
                        <section className="grid grid-cols-2 gap-8 my-8">
                            <div>
                                <h2 className="text-sm font-semibold uppercase text-gray-500 mb-2">Facturé à :</h2>
                                <p className="font-bold">{order.customerName}</p>
                                <p>{order.shippingAddress.street}</p>
                                <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                            </div>
                        </section>

                        {/* Items Table */}
                        <section>
                            <table className="w-full text-left">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="p-3 text-sm font-semibold uppercase">Description</th>
                                        <th className="p-3 text-sm font-semibold uppercase text-center w-24">Qté</th>
                                        <th className="p-3 text-sm font-semibold uppercase text-right w-32">Prix Unitaire</th>
                                        <th className="p-3 text-sm font-semibold uppercase text-right w-32">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items.map(item => (
                                        <tr key={item.productId} className="border-b">
                                            <td className="p-3">
                                                <p className="font-semibold">{item.name}</p>
                                            </td>
                                            <td className="p-3 text-center">{item.quantity}</td>
                                            <td className="p-3 text-right">{item.price.toFixed(3).replace('.', ',')} DT</td>
                                            <td className="p-3 text-right font-semibold">{(item.price * item.quantity).toFixed(3).replace('.', ',')} DT</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>
                        
                        {/* Totals */}
                        <section className="flex justify-end mt-8">
                            <div className="w-full max-w-xs space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Sous-total :</span>
                                    <span>{subtotal.toFixed(3).replace('.', ',')} DT</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Livraison :</span>
                                    <span>{shipping.toFixed(3).replace('.', ',')} DT</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                    <span>Total :</span>
                                    <span>{total.toFixed(3).replace('.', ',')} DT</span>
                                </div>
                            </div>
                        </section>

                        {/* Footer */}
                        <footer className="mt-12 pt-6 border-t text-center text-gray-500 text-sm">
                            <p><strong>Mode de paiement :</strong> {order.paymentMethod}</p>
                            <p className="mt-2">Merci pour votre achat !</p>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    );
};
