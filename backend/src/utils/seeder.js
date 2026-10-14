
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Pack = require('../models/Pack');
const Store = require('../models/Store');
const Advertisement = require('../models/Advertisement');
const Promotion = require('../models/Promotion');
const Order = require('../models/Order');
const BlogPost = require('../models/BlogPost');
const ContactMessage = require('../models/ContactMessage');
const { allProducts, categories, packs, stores, initialAdvertisements, promotions, sampleOrders, blogPosts, contactMessages } = require('../data/initialData');

const seedData = async () => {
  if (mongoose.connection.readyState !== 1) {
    console.log('[SEEDER] MongoDB non connecté, seeding MongoDB ignoré.');
    return;
  }
  try {
    // 1. Users (Admin & Client)
    // Force delete default accounts to ensure clean password hash generation
    await User.deleteMany({ email: { $in: ['admin@multishop.com', 'admin@multishop.tn', 'client@multishop.com', 'client@multishop.tn'] } });
    
    await User.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@multishop.com',
      password: 'password123',
      role: 'ADMIN',
      phone: '+216 71 000 000'
    });
    console.log('✅ Admin créé (Email: admin@multishop.com, MDP: password123)');

    await User.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@multishop.tn',
      password: 'password123',
      role: 'ADMIN',
      phone: '+216 71 000 000'
    });
    console.log('✅ Admin TN créé (Email: admin@multishop.tn, MDP: password123)');

    let clientUser = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'client@multishop.com',
      password: 'password123',
      role: 'CUSTOMER',
      phone: '12345678',
      addresses: [{
          type: 'Domicile',
          street: '123 Rue de la Liberté', 
          city: 'Tunis', 
          postalCode: '1002', 
          isDefault: true
      }]
    });
    console.log('✅ Client créé (Email: client@multishop.com, MDP: password123)');

    // 2. Products - Synchronisation complète des 36 produits de tous les sous-sites
    const productCount = await Product.countDocuments();
    if (productCount < allProducts.length) {
      for (const p of allProducts) {
        await Product.findOneAndUpdate({ id: p.id }, { $set: p }, { upsert: true, new: true });
      }
      console.log(`✅ Produits synchronisés (${allProducts.length} produits de tous les sous-sites dans MongoDB)`);
    } else {
      console.log(`✅ Produits vérifiés (${productCount} produits en base)`);
    }

    // 3. Categories
    const categoryCount = await Category.countDocuments();
    if (categoryCount < categories.length) {
      for (const c of categories) {
        await Category.findOneAndUpdate({ name: c.name, shop: c.shop }, { $set: c }, { upsert: true });
      }
      console.log(`✅ Catégories synchronisées (${categories.length} catégories)`);
    }

    // 4. Packs
    const packCount = await Pack.countDocuments();
    if (packCount < packs.length) {
      for (const pk of packs) {
        await Pack.findOneAndUpdate({ id: pk.id }, { $set: pk }, { upsert: true });
      }
      console.log(`✅ Packs synchronisés (${packs.length} packs)`);
    }

    // 5. Stores
    const storeCount = await Store.countDocuments();
    if (storeCount < stores.length) {
      for (const s of stores) {
        await Store.findOneAndUpdate({ id: s.id }, { $set: s }, { upsert: true });
      }
      console.log(`✅ Magasins synchronisés (${stores.length} magasins)`);
    }

    // 6. Advertisements (Singleton)
    const adCount = await Advertisement.countDocuments();
    if (adCount === 0) {
        await Advertisement.create(initialAdvertisements);
        console.log('Publicités importées');
    }

    // 7. Promotions
    const promoCount = await Promotion.countDocuments();
    if (promoCount === 0) {
        await Promotion.insertMany(promotions);
        console.log('Promotions importées');
    }

    // 8. Orders
    const orderCount = await Order.countDocuments();
    if (orderCount === 0) {
        if (clientUser) {
            const ordersWithUser = sampleOrders.map(order => ({
                ...order,
                user: clientUser._id
            }));
            await Order.insertMany(ordersWithUser);
            console.log('Commandes importées');
        } else {
            console.warn('Ignoré: Commandes non importées (Client introuvable)');
        }
    }

    // 9. Blog Posts
    const blogCount = await BlogPost.countDocuments();
    if (blogCount === 0) {
        await BlogPost.insertMany(blogPosts);
        console.log('Articles de blog importés');
    }

    // 10. Contact Messages
    const msgCount = await ContactMessage.countDocuments();
    if (msgCount === 0) {
        await ContactMessage.insertMany(contactMessages);
        console.log('Messages de contact importés');
    }

    console.log('🎉 [MongoDB] Base de données "multishop" prête et synchronisée avec succès !');
  } catch (error) {
    console.error('Erreur Seeding:', error);
  }
};

module.exports = seedData;
