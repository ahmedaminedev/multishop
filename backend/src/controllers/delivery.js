const fs = require('fs');
const path = require('path');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const initialData = require('../data/initialData');
const Order = require('../models/Order');
const mongoose = require('mongoose');

const deliveriesFilePath = path.join(__dirname, '../data/deliveries.json');

let inMemoryDeliveries = [];

try {
  if (fs.existsSync(deliveriesFilePath)) {
    const raw = fs.readFileSync(deliveriesFilePath, 'utf8');
    inMemoryDeliveries = JSON.parse(raw);
  }
} catch (e) {
  console.warn('Could not read deliveries.json:', e.message);
  inMemoryDeliveries = [];
}

const persistDeliveriesToFile = () => {
  try {
    fs.writeFileSync(deliveriesFilePath, JSON.stringify(inMemoryDeliveries, null, 2), 'utf8');
  } catch (e) {
    console.warn('Could not persist deliveries to file:', e.message);
  }
};

// GET /api/deliveries
exports.getDeliveries = catchAsync(async (req, res) => {
  res.json(inMemoryDeliveries);
});

// GET /api/deliveries/:id
exports.getDeliveryById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const delivery = inMemoryDeliveries.find(d => d.id === id || d.reference === id);
  if (!delivery) {
    return next(new AppError('Dossier de livraison non trouvé', 404));
  }
  res.json(delivery);
});

// POST /api/deliveries
exports.createDelivery = catchAsync(async (req, res, next) => {
  const { societeLivraisonId, societeLivraisonNom, orderIds, notes } = req.body;

  if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
    return next(new AppError('Veuillez sélectionner au moins une commande pour constituer la livraison.', 400));
  }

  const deliveryCounter = inMemoryDeliveries.length + 1;
  const refCode = `LIV-2026-${String(deliveryCounter).padStart(4, '0')}`;
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const heureStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  // Compute total amounts and items
  let totalMontant = 0;
  let totalColis = 0;
  let montantAEncaisser = 0;

  // Retrieve orders from MongoDB or initialData
  let allOrders = [];
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    allOrders = await Order.find({ id: { $in: orderIds } }).lean().catch(() => []);
  }
  if (!allOrders || allOrders.length === 0) {
    allOrders = (initialData.sampleOrders || []).filter(o => orderIds.includes(o.id || o.orderNumber));
  }

  allOrders.forEach(o => {
    const amt = Number(o.total || o.totalAmount) || 0;
    totalMontant += amt;
    const items = Array.isArray(o.items) ? o.items : [];
    const count = o.itemCount || items.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0) || 1;
    totalColis += count;

    const isDejaPaye = o.statutPaiement === 'PAIEMENT_ENCAISSE' ||
                       o.paymentMethod === 'EN_LIGNE' ||
                       o.paymentMethod === 'CARTE_BANCAIRE' ||
                       o.paymentMethod === 'PAYMEE';
    if (!isDejaPaye) {
      montantAEncaisser += amt;
    }
  });

  const newDelivery = {
    id: refCode,
    reference: refCode,
    societeLivraisonId: societeLivraisonId || 'soc-default',
    societeLivraisonNom: societeLivraisonNom || 'Société partenaire',
    dateCreation: dateStr,
    heureCreation: heureStr,
    statutGeneral: 'EN_COURS',
    orderIds,
    totalCommandes: orderIds.length,
    commandesLivrees: 0,
    commandesRetournees: 0,
    commandesEnCours: orderIds.length,
    montantTotal: totalMontant,
    montantAEncaisser: montantAEncaisser || totalMontant,
    totalColis: totalColis || orderIds.length,
    recuTransporteur: null,
    historiqueRecus: [],
    notes: notes || '',
    historique: [
      {
        date: dateStr,
        heure: heureStr,
        auteur: 'Super Admin',
        action: 'CREATION_LIVRAISON',
        description: `Création du dossier de livraison ${refCode} avec ${orderIds.length} commandes associées à ${societeLivraisonNom}.`
      }
    ]
  };

  inMemoryDeliveries.unshift(newDelivery);
  persistDeliveriesToFile();

  // Update order statuses
  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      await Order.updateMany(
        { id: { $in: orderIds } },
        { $set: { statutLivraison: 'EN_COURS_LIVRAISON', deliveryId: refCode } }
      );
    }
  } catch (err) {
    console.warn('Could not update order status in DB:', err.message);
  }

  res.status(201).json(newDelivery);
});

// POST /api/deliveries/:id/orders/:orderId/status
exports.updateDeliveryOrderStatus = catchAsync(async (req, res, next) => {
  const { id, orderId } = req.params;
  const { statut, motif, commentaire } = req.body;

  const deliveryIndex = inMemoryDeliveries.findIndex(d => d.id === id || d.reference === id);
  if (deliveryIndex === -1) {
    return next(new AppError('Dossier de livraison non trouvé', 404));
  }

  const delivery = inMemoryDeliveries[deliveryIndex];
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const heureStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  // Update order status tracking within delivery
  if (!delivery.ordersStatus) {
    delivery.ordersStatus = {};
  }
  delivery.ordersStatus[orderId] = {
    statut,
    motif: motif || '',
    commentaire: commentaire || '',
    dateMiseAJour: dateStr,
    heureMiseAJour: heureStr
  };

  // Recalculate counts
  let livrees = 0;
  let retournees = 0;
  (delivery.orderIds || []).forEach(oId => {
    const s = delivery.ordersStatus[oId]?.statut;
    if (s === 'LIVREE') livrees++;
    else if (s === 'RETOURNEE') retournees++;
  });

  delivery.commandesLivrees = livrees;
  delivery.commandesRetournees = retournees;
  delivery.commandesEnCours = Math.max(0, delivery.totalCommandes - livrees - retournees);

  if (delivery.commandesEnCours === 0) {
    delivery.statutGeneral = retournees === delivery.totalCommandes ? 'RETOURNEE' : 'TERMINEE';
  }

  delivery.historique.push({
    date: dateStr,
    heure: heureStr,
    auteur: 'Super Admin',
    action: `COMMANDE_${statut}`,
    description: `Commande ${orderId} marquée comme ${statut === 'LIVREE' ? 'Livrée' : 'Retournée'} (${motif || 'Aucun motif'}).`
  });

  inMemoryDeliveries[deliveryIndex] = delivery;
  persistDeliveriesToFile();

  // Also update actual order record
  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      await Order.updateOne(
        { id: orderId },
        { $set: { statutLivraison: statut, status: statut === 'LIVREE' ? 'Livrée' : 'Retournée' } }
      );
    }
  } catch (err) {
    console.warn('Could not update order in DB:', err.message);
  }

  res.json(delivery);
});

// POST /api/deliveries/:id/receipt
exports.uploadCarrierReceipt = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { fileBase64, fileName, mimeType, description } = req.body;

  const deliveryIndex = inMemoryDeliveries.findIndex(d => d.id === id || d.reference === id);
  if (deliveryIndex === -1) {
    return next(new AppError('Dossier de livraison non trouvé', 404));
  }

  const delivery = inMemoryDeliveries[deliveryIndex];
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const heureStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const receiptData = {
    id: 'REC-' + Date.now(),
    url: fileBase64,
    fileName: fileName || 'recu_transporteur.pdf',
    tailleLisible: 'Fichier joint',
    mimeType: mimeType || 'application/pdf',
    dateAjout: dateStr + ' ' + heureStr,
    auteur: 'Super Admin',
    description: description || 'Reçu de décharge transporteur signé'
  };

  delivery.recuTransporteur = receiptData;
  if (!Array.isArray(delivery.historiqueRecus)) {
    delivery.historiqueRecus = [];
  }
  delivery.historiqueRecus.push(receiptData);

  delivery.historique.push({
    date: dateStr,
    heure: heureStr,
    auteur: 'Super Admin',
    action: 'UPLOAD_RECU',
    description: `Ajout du reçu de transporteur "${fileName || 'Document'}" pour le dossier ${delivery.reference}.`
  });

  inMemoryDeliveries[deliveryIndex] = delivery;
  persistDeliveriesToFile();

  res.json(delivery);
});
