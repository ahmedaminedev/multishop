
const Order = require('../models/Order');
const Product = require('../models/Product'); // Import du modèle Product
const catchAsync = require('../utils/catchAsync');

exports.addOrderItems = catchAsync(async (req, res) => {
  const {
    id,
    customerName,
    date,
    total,
    status,
    itemCount,
    items,
    shippingAddress,
    paymentMethod
  } = req.body;

  // Validation Backend
  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'Aucun article dans la commande' });
  } 

  if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.postalCode) {
      return res.status(400).json({ message: "L'adresse de livraison est incomplète." });
  }
  
  if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Utilisateur non identifié. Connexion requise.' });
  }

  // --- LOGIQUE DE GESTION DE STOCK ATOMIQUE ---
  // Pour éviter les "Race Conditions" (deux personnes achètent le dernier article en même temps),
  // nous décrémentons le stock uniquement si la quantité est suffisante, en une seule opération BDD.
  
  const reservedItems = [];

  try {
      // 1. Tentative de réservation des stocks pour chaque article
      for (const item of items) {
          const updatedProduct = await Product.findOneAndUpdate(
              { 
                  id: item.productId, 
                  quantity: { $gte: item.quantity } // Condition: Stock doit être >= quantité demandée
              },
              { $inc: { quantity: -item.quantity } }, // Action: Décrémenter
              { new: true } // Retourner le document mis à jour
          );

          if (!updatedProduct) {
              // Si null, cela signifie que la condition (quantity >= item.quantity) a échoué
              throw new Error(`Stock insuffisant pour "${item.name}".`);
          }
          
          // On garde une trace des articles réservés pour pouvoir annuler si une erreur survient plus tard
          reservedItems.push({ productId: item.productId, quantity: item.quantity });
      }

      // 2. Création de la commande (si tous les stocks sont réservés avec succès)
      const order = new Order({
        id, 
        customerName,
        user: req.user._id, 
        date,
        total: Number(total),
        status: status || 'En attente',
        itemCount: Number(itemCount),
        items, 
        shippingAddress, 
        paymentMethod
      });

      const createdOrder = await order.save();
      res.status(201).json(createdOrder);

  } catch (error) {
      console.error("Order Creation Error:", error);

      // --- ROLLBACK (ANNULATION) ---
      // Si une erreur survient (ex: stock insuffisant pour le 3ème article), 
      // on doit remettre en stock les articles qu'on a déjà décrémentés (le 1er et le 2ème).
      if (reservedItems.length > 0) {
          console.log("Rolling back reserved stock...");
          for (const item of reservedItems) {
              await Product.findOneAndUpdate(
                  { id: item.productId },
                  { $inc: { quantity: item.quantity } } // On rajoute la quantité
              );
          }
      }

      if (error.code === 11000) {
          return res.status(400).json({ message: 'Cette commande a déjà été enregistrée.' });
      }
      
      // Message d'erreur spécifique pour le stock
      const message = error.message.includes('Stock insuffisant') ? error.message : 'Erreur lors de l\'enregistrement de la commande.';
      res.status(400).json({ message });
  }
});

exports.getMyOrders = catchAsync(async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Non authentifié' });
  
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

exports.getOrders = catchAsync(async (req, res) => {
  const orders = await Order.find({})
    .populate('user', 'id firstName lastName email')
    .sort({ createdAt: -1 });
  res.json(orders);
});
